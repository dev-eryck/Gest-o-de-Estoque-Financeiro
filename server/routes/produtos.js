const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, run, get } = require('../database');

const router = express.Router();

// Middleware para validar dados
const validateProduto = [
  body('nome').trim().isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('preco_venda').isFloat({ min: 0.01 }).withMessage('Preço de venda deve ser um número positivo'),
  body('preco_custo').isFloat({ min: 0.01 }).withMessage('Preço de custo deve ser um número positivo'),
  body('quantidade').isInt({ min: 0 }).withMessage('Quantidade deve ser um número inteiro não negativo'),
  body('categoria').trim().isLength({ min: 2, max: 50 }).withMessage('Categoria deve ter entre 2 e 50 caracteres'),
  body('estoque_minimo').optional().isInt({ min: 0 }).withMessage('Estoque mínimo deve ser um número inteiro não negativo')
];

// GET /api/produtos - Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const { categoria, estoque_baixo, busca } = req.query;
    
    let sql = `
      SELECT p.*, 
             CASE 
               WHEN p.quantidade <= p.estoque_minimo THEN 'baixo'
               WHEN p.quantidade = 0 THEN 'sem_estoque'
               ELSE 'normal'
             END as status_estoque
      FROM produtos p
      WHERE 1=1
    `;
    const params = [];

    // Filtro por categoria
    if (categoria && categoria !== 'todas') {
      sql += ' AND p.categoria = ?';
      params.push(categoria);
    }

    // Filtro por estoque baixo
    if (estoque_baixo === 'true') {
      sql += ' AND p.quantidade <= p.estoque_minimo';
    }

    // Filtro de busca
    if (busca) {
      sql += ' AND (p.nome LIKE ? OR p.descricao LIKE ? OR p.codigo_barras LIKE ?)';
      const buscaTermo = `%${busca}%`;
      params.push(buscaTermo, buscaTermo, buscaTermo);
    }

    sql += ' ORDER BY p.nome ASC';

    const produtos = await query(sql, params);
    
    res.json({
      success: true,
      data: produtos,
      total: produtos.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar produtos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível listar os produtos'
    });
  }
});

// GET /api/produtos/categorias - Listar categorias
router.get('/categorias', async (req, res) => {
  try {
    const categorias = await query('SELECT DISTINCT categoria FROM produtos ORDER BY categoria');
    res.json({
      success: true,
      data: categorias.map(c => c.categoria)
    });
  } catch (error) {
    console.error('❌ Erro ao listar categorias:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/produtos/:id - Obter produto específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'O ID do produto deve ser um número válido'
      });
    }

    const produto = await get('SELECT * FROM produtos WHERE id = ?', [id]);
    
    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado',
        message: 'O produto com o ID especificado não existe'
      });
    }

    res.json({
      success: true,
      data: produto
    });

  } catch (error) {
    console.error('❌ Erro ao obter produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/produtos - Criar novo produto
router.post('/', validateProduto, async (req, res) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, preco_venda, preco_custo, quantidade, categoria, descricao, codigo_barras, fornecedor, estoque_minimo } = req.body;

    // Verificar se código de barras já existe
    if (codigo_barras) {
      const existing = await get('SELECT id FROM produtos WHERE codigo_barras = ?', [codigo_barras]);
      if (existing) {
        return res.status(400).json({
          success: false,
          error: 'Código de barras duplicado',
          message: 'Já existe um produto com este código de barras'
        });
      }
    }

    const sql = `
      INSERT INTO produtos (nome, preco_venda, preco_custo, quantidade, categoria, descricao, codigo_barras, fornecedor, estoque_minimo)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [nome, preco_venda, preco_custo, quantidade, categoria, descricao || null, codigo_barras || null, fornecedor || null, estoque_minimo || 5];
    
    const result = await run(sql, params);
    
    // Buscar o produto criado
    const novoProduto = await get('SELECT * FROM produtos WHERE id = ?', [result.id]);
    
    res.status(201).json({
      success: true,
      message: 'Produto criado com sucesso!',
      data: novoProduto
    });

  } catch (error) {
    console.error('❌ Erro ao criar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o produto'
    });
  }
});

// PUT /api/produtos/:id - Atualizar produto
router.put('/:id', validateProduto, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Verificar se produto existe
    const existing = await get('SELECT id FROM produtos WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, preco_venda, preco_custo, quantidade, categoria, descricao, codigo_barras, fornecedor, estoque_minimo } = req.body;

    // Verificar se código de barras já existe em outro produto
    if (codigo_barras) {
      const existingBarcode = await get('SELECT id FROM produtos WHERE codigo_barras = ? AND id != ?', [codigo_barras, id]);
      if (existingBarcode) {
        return res.status(400).json({
          success: false,
          error: 'Código de barras duplicado'
        });
      }
    }

    const sql = `
      UPDATE produtos 
      SET nome = ?, preco_venda = ?, preco_custo = ?, quantidade = ?, categoria = ?, descricao = ?, 
          codigo_barras = ?, fornecedor = ?, estoque_minimo = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [nome, preco_venda, preco_custo, quantidade, categoria, descricao || null, codigo_barras || null, fornecedor || null, estoque_minimo || 5, id];
    
    await run(sql, params);
    
    // Buscar o produto atualizado
    const produtoAtualizado = await get('SELECT * FROM produtos WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Produto atualizado com sucesso!',
      data: produtoAtualizado
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/produtos/:id - Excluir produto
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Verificar se produto existe
    const existing = await get('SELECT id, nome FROM produtos WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Verificar se há vendas associadas
    const vendas = await query('SELECT id FROM vendas WHERE produto_id = ?', [id]);
    if (vendas.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Produto não pode ser excluído',
        message: `Existem ${vendas.length} venda(s) associada(s) a este produto`
      });
    }

    // Excluir produto
    await run('DELETE FROM produtos WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: `Produto "${existing.nome}" excluído com sucesso!`
    });

  } catch (error) {
    console.error('❌ Erro ao excluir produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// PATCH /api/produtos/:id/estoque - Ajustar estoque
router.patch('/:id/estoque', [
  body('quantidade').isInt().withMessage('Quantidade deve ser um número inteiro'),
  body('tipo').isIn(['entrada', 'saida', 'ajuste']).withMessage('Tipo deve ser entrada, saida ou ajuste'),
  body('motivo').optional().trim().isLength({ max: 200 }).withMessage('Motivo deve ter no máximo 200 caracteres')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { quantidade, tipo, motivo, funcionario_id } = req.body;
    
    // Converter para números para evitar concatenação
    const produtoId = parseInt(id);
    const quantidadeNum = parseInt(quantidade);
    
    if (!produtoId || isNaN(produtoId)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    // Verificar se produto existe
    const produto = await get('SELECT id, nome, quantidade FROM produtos WHERE id = ?', [produtoId]);
    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    const quantidadeAnterior = produto.quantidade;
    let quantidadeNova;

    // Calcular nova quantidade baseada no tipo
    switch (tipo) {
      case 'entrada':
        quantidadeNova = quantidadeAnterior + quantidadeNum;
        break;
      case 'saida':
        quantidadeNova = Math.max(0, quantidadeAnterior - quantidadeNum);
        break;
      case 'ajuste':
        quantidadeNova = quantidadeNum;
        break;
    }

    // Atualizar estoque
    await run('UPDATE produtos SET quantidade = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [quantidadeNova, produtoId]);

    // Registrar movimentação
    await run(`
      INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo, data, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [produtoId, tipo, quantidadeNum, motivo || null]);

    // Buscar produto atualizado
    const produtoAtualizado = await get('SELECT * FROM produtos WHERE id = ?', [produtoId]);

    res.json({
      success: true,
      message: `Estoque do produto "${produto.nome}" atualizado com sucesso!`,
      data: {
        produto: produtoAtualizado,
        movimentacao: {
          tipo,
          quantidade: quantidadeNum,
          quantidade_anterior: quantidadeAnterior,
          quantidade_nova: quantidadeNova,
          motivo
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao ajustar estoque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
