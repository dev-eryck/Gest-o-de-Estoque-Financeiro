const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, run, get } = require('../database');

const router = express.Router();

// GET /api/estoque - Obter resumo do estoque
router.get('/', async (req, res) => {
  try {
    // Estatísticas gerais
    const totalProdutos = await get('SELECT COUNT(*) as total FROM produtos');
    const produtosSemEstoque = await get('SELECT COUNT(*) as total FROM produtos WHERE quantidade = 0');
    const produtosBaixoEstoque = await get('SELECT COUNT(*) as total FROM produtos WHERE quantidade <= estoque_minimo AND quantidade > 0');
    const valorTotalEstoque = await get('SELECT SUM(preco * quantidade) as total FROM produtos WHERE quantidade > 0');
    
    // Produtos com baixo estoque
    const produtosBaixo = await query(`
      SELECT id, nome, quantidade, estoque_minimo, categoria
      FROM produtos 
      WHERE quantidade <= estoque_minimo AND quantidade > 0
      ORDER BY quantidade ASC
    `);

    // Produtos sem estoque
    const produtosSem = await query(`
      SELECT id, nome, quantidade, estoque_minimo, categoria
      FROM produtos 
      WHERE quantidade = 0
      ORDER BY nome ASC
    `);

    // Estoque por categoria
    const estoquePorCategoria = await query(`
      SELECT 
        categoria,
        COUNT(*) as total_produtos,
        SUM(quantidade) as total_estoque,
        SUM(preco * quantidade) as valor_total
      FROM produtos 
      GROUP BY categoria
      ORDER BY valor_total DESC
    `);

    res.json({
      success: true,
      data: {
        resumo: {
          total_produtos: totalProdutos.total,
          produtos_sem_estoque: produtosSemEstoque.total,
          produtos_baixo_estoque: produtosBaixoEstoque.total,
          valor_total_estoque: valorTotalEstoque.total || 0
        },
        alertas: {
          baixo_estoque: produtosBaixo,
          sem_estoque: produtosSem
        },
        por_categoria: estoquePorCategoria
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter resumo do estoque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/estoque/movimentacoes - Listar movimentações
router.get('/movimentacoes', async (req, res) => {
  try {
    const { produto_id, tipo, data_inicio, data_fim, funcionario_id } = req.query;
    
    let sql = `
      SELECT m.*, p.nome as produto_nome, p.categoria as produto_categoria
      FROM movimentacoes_estoque m
      JOIN produtos p ON m.produto_id = p.id
      WHERE 1=1
    `;
    const params = [];

    // Filtros
    if (produto_id) {
      sql += ' AND m.produto_id = ?';
      params.push(produto_id);
    }

    if (tipo) {
      sql += ' AND m.tipo = ?';
      params.push(tipo);
    }

    if (data_inicio) {
      sql += ' AND DATE(m.data) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      sql += ' AND DATE(m.data) <= ?';
      params.push(data_fim);
    }

    // Nota: funcionario_id não está disponível na tabela movimentacoes_estoque
    // Removido filtro por funcionário

    sql += ' ORDER BY m.data DESC LIMIT 100';

    const movimentacoes = await query(sql, params);
    
    res.json({
      success: true,
      data: movimentacoes,
      total: movimentacoes.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar movimentações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/estoque/movimentacao - Criar nova movimentação
router.post('/movimentacao', [
  body('produto_id').isInt({ min: 1 }).withMessage('ID do produto deve ser um número válido'),
  body('tipo').isIn(['entrada', 'saida', 'ajuste']).withMessage('Tipo deve ser entrada, saida ou ajuste'),
  body('quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser um número inteiro positivo'),
  body('motivo').optional().trim().isLength({ max: 200 }).withMessage('Motivo deve ter no máximo 200 caracteres'),
  body('funcionario_id').optional().isInt({ min: 1 }).withMessage('ID do funcionário deve ser um número válido')
], async (req, res) => {
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

    const { produto_id, tipo, quantidade, motivo, funcionario_id } = req.body;

    // Converter para números para evitar concatenação
    const produtoId = parseInt(produto_id);
    const quantidadeNum = parseInt(quantidade);
    const funcionarioId = funcionario_id ? parseInt(funcionario_id) : null;

    // Verificar se produto existe
    const produto = await get('SELECT id, nome, quantidade FROM produtos WHERE id = ?', [produtoId]);
    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Verificar se funcionário existe (se fornecido)
    if (funcionarioId) {
      const funcionario = await get('SELECT id FROM funcionarios WHERE id = ?', [funcionarioId]);
      if (!funcionario) {
        return res.status(404).json({
          success: false,
          error: 'Funcionário não encontrado'
        });
      }
    }

    const quantidadeAnterior = produto.quantidade;
    let quantidadeNova;

    // Calcular nova quantidade baseada no tipo
    switch (tipo) {
      case 'entrada':
        quantidadeNova = quantidadeAnterior + quantidadeNum;
        break;
      case 'saida':
        if (quantidadeNum > quantidadeAnterior) {
          return res.status(400).json({
            success: false,
            error: 'Quantidade insuficiente',
            message: `Estoque atual: ${quantidadeAnterior}, tentativa de saída: ${quantidadeNum}`
          });
        }
        quantidadeNova = quantidadeAnterior - quantidadeNum;
        break;
      case 'ajuste':
        quantidadeNova = quantidadeNum;
        break;
    }

    // Iniciar transação
    await run('BEGIN TRANSACTION');

    try {
      // Atualizar estoque do produto
      await run('UPDATE produtos SET quantidade = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [quantidadeNova, produtoId]);

      // Registrar movimentação
      const result = await run(`
        INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [produtoId, tipo, quantidadeNum, motivo || null]);

      // Confirmar transação
      await run('COMMIT');

      // Buscar movimentação criada
      const movimentacao = await get(`
        SELECT m.*, p.nome as produto_nome, p.categoria as produto_categoria
        FROM movimentacoes_estoque m
        JOIN produtos p ON m.produto_id = p.id
        WHERE m.id = ?
      `, [result.id]);

      res.status(201).json({
        success: true,
        message: `Movimentação de estoque registrada com sucesso!`,
        data: {
          movimentacao,
          produto_atualizado: {
            id: produtoId,
            quantidade_anterior: quantidadeAnterior,
            quantidade_nova: quantidadeNova
          }
        }
      });

    } catch (error) {
      // Reverter transação em caso de erro
      await run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Erro ao criar movimentação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível registrar a movimentação'
    });
  }
});

// GET /api/estoque/produto/:id - Obter histórico de um produto
router.get('/produto/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Verificar se produto existe
    const produto = await get('SELECT * FROM produtos WHERE id = ?', [id]);
    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    // Obter movimentações do produto
    const movimentacoes = await query(`
      SELECT m.*
      FROM movimentacoes_estoque m
      WHERE m.produto_id = ?
      ORDER BY m.data DESC
      LIMIT 50
    `, [id]);

    // Obter vendas do produto
    const vendas = await query(`
      SELECT v.*, f.nome as funcionario_nome
      FROM vendas v
      JOIN funcionarios f ON v.funcionario_id = f.id
      WHERE v.produto_id = ?
      ORDER BY v.data DESC
      LIMIT 20
    `, [id]);

    res.json({
      success: true,
      data: {
        produto,
        movimentacoes,
        vendas,
        resumo: {
          total_movimentacoes: movimentacoes.length,
          total_vendas: vendas.length,
          valor_total_vendas: vendas.reduce((sum, v) => sum + parseFloat(v.total), 0)
        }
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter histórico do produto:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/estoque/relatorio - Relatório de estoque
router.get('/relatorio', async (req, res) => {
  try {
    const { formato = 'json' } = req.query;

    // Dados para o relatório
    const resumo = await get(`
      SELECT 
        COUNT(*) as total_produtos,
        SUM(CASE WHEN quantidade = 0 THEN 1 ELSE 0 END) as produtos_sem_estoque,
        SUM(CASE WHEN quantidade <= estoque_minimo AND quantidade > 0 THEN 1 ELSE 0 END) as produtos_baixo_estoque,
        SUM(quantidade) as total_estoque,
        SUM(preco * quantidade) as valor_total_estoque,
        AVG(preco) as preco_medio
      FROM produtos
    `);

    const produtosPorCategoria = await query(`
      SELECT 
        categoria,
        COUNT(*) as total_produtos,
        SUM(quantidade) as total_estoque,
        SUM(preco * quantidade) as valor_total,
        AVG(preco) as preco_medio
      FROM produtos 
      GROUP BY categoria
      ORDER BY valor_total DESC
    `);

    const produtosBaixoEstoque = await query(`
      SELECT id, nome, categoria, quantidade, estoque_minimo, preco
      FROM produtos 
      WHERE quantidade <= estoque_minimo
      ORDER BY quantidade ASC
    `);

    const movimentacoesRecentes = await query(`
      SELECT m.*, p.nome as produto_nome, p.categoria as produto_categoria
      FROM movimentacoes_estoque m
      JOIN produtos p ON m.produto_id = p.id
      ORDER BY m.data DESC
      LIMIT 20
    `);

    const relatorio = {
      data_geracao: new Date().toISOString(),
      resumo,
      produtos_por_categoria: produtosPorCategoria,
      produtos_baixo_estoque: produtosBaixoEstoque,
      movimentacoes_recentes: movimentacoesRecentes
    };

    if (formato === 'csv') {
      // Implementar exportação CSV se necessário
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio-estoque.csv"');
      // Retornar CSV formatado
      res.send('Implementar CSV');
    } else {
      res.json({
        success: true,
        data: relatorio
      });
    }

  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
