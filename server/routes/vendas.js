const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, run, get } = require('../database');

const router = express.Router();

// Middleware para validar dados
const validateVenda = [
  body('produto_id').isInt({ min: 1 }).withMessage('ID do produto deve ser um número válido'),
  body('funcionario_id').isInt({ min: 1 }).withMessage('ID do funcionário deve ser um número válido'),
  body('quantidade').isInt({ min: 1 }).withMessage('Quantidade deve ser um número inteiro positivo'),
  body('observacao').optional().trim().isLength({ max: 500 }).withMessage('Observação deve ter no máximo 500 caracteres')
];

// GET /api/vendas - Listar todas as vendas
router.get('/', async (req, res) => {
  try {
    const { produto_id, funcionario_id, data_inicio, data_fim, busca } = req.query;
    
    let sql = `
      SELECT v.*, p.nome as produto_nome, p.categoria as produto_categoria,
             f.nome as funcionario_nome, f.cargo as funcionario_cargo
      FROM vendas v
      JOIN produtos p ON v.produto_id = p.id
      JOIN funcionarios f ON v.funcionario_id = f.id
      WHERE 1=1
    `;
    const params = [];

    // Filtros
    if (produto_id) {
      sql += ' AND v.produto_id = ?';
      params.push(produto_id);
    }

    if (funcionario_id) {
      sql += ' AND v.funcionario_id = ?';
      params.push(funcionario_id);
    }

    if (data_inicio) {
      sql += ' AND DATE(v.data) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      sql += ' AND DATE(v.data) <= ?';
      params.push(data_fim);
    }

    if (busca) {
      sql += ' AND (p.nome LIKE ? OR f.nome LIKE ?)';
      const buscaTermo = `%${busca}%`;
      params.push(buscaTermo, buscaTermo);
    }

    sql += ' ORDER BY v.data DESC LIMIT 100';

    const vendas = await query(sql, params);
    
    res.json({
      success: true,
      data: vendas,
      total: vendas.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar vendas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/vendas/:id - Obter venda específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    const venda = await get(`
      SELECT v.*, p.nome as produto_nome, p.categoria as produto_categoria,
             f.nome as funcionario_nome, f.cargo as funcionario_cargo
      FROM vendas v
      JOIN produtos p ON v.produto_id = p.id
      JOIN funcionarios f ON v.funcionario_id = f.id
      WHERE v.id = ?
    `, [id]);
    
    if (!venda) {
      return res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }

    res.json({
      success: true,
      data: venda
    });

  } catch (error) {
    console.error('❌ Erro ao obter venda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/vendas - Criar nova venda
router.post('/', validateVenda, async (req, res) => {
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

    const { produto_id, funcionario_id, quantidade, observacao } = req.body;

    // Verificar se produto existe e tem estoque suficiente
    const produto = await get('SELECT id, nome, quantidade, preco_venda, preco_custo FROM produtos WHERE id = ?', [produto_id]);
    if (!produto) {
      return res.status(404).json({
        success: false,
        error: 'Produto não encontrado'
      });
    }

    if (produto.quantidade < quantidade) {
      return res.status(400).json({
        success: false,
        error: 'Estoque insuficiente',
        message: `Estoque atual: ${produto.quantidade}, quantidade solicitada: ${quantidade}`
      });
    }

    // Verificar se funcionário existe
    const funcionario = await get('SELECT id, nome FROM funcionarios WHERE id = ?', [funcionario_id]);
    if (!funcionario) {
      return res.status(404).json({
        success: false,
        error: 'Funcionário não encontrado'
      });
    }

    const preco_unitario = produto.preco_venda;
    const total = quantidade * preco_unitario;
    const custo_total = quantidade * produto.preco_custo;
    const lucro = total - custo_total;

    // Iniciar transação
    await run('BEGIN TRANSACTION');

    try {
      // Criar a venda
      const result = await run(`
        INSERT INTO vendas (produto_id, funcionario_id, quantidade, preco_unitario, total, observacao, data)
        VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      `, [produto_id, funcionario_id, quantidade, preco_unitario, total, observacao || null]);

      // Atualizar estoque do produto
      const novaQuantidade = produto.quantidade - quantidade;
      await run('UPDATE produtos SET quantidade = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [novaQuantidade, produto_id]);

      // Registrar movimentação de estoque
      await run(`
        INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo, data, created_at, updated_at)
        VALUES (?, 'saida', ?, 'Venda', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, [produto_id, quantidade]);

      // Registrar no sistema financeiro
      await run(`
        INSERT INTO controle_financeiro (tipo, descricao, valor, data, categoria, observacao, created_at, updated_at)
        VALUES (?, ?, ?, DATE('now'), ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, ['venda', `Venda de ${produto.nome}`, total, 'Vendas', `Venda de ${quantidade}x ${produto.nome} - Lucro: R$ ${lucro.toFixed(2)}`]);

      // Registrar o custo da venda
      await run(`
        INSERT INTO controle_financeiro (tipo, descricao, valor, data, categoria, observacao, created_at, updated_at)
        VALUES (?, ?, ?, DATE('now'), ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, ['custo', `Custo da venda de ${produto.nome}`, custo_total, 'Custos de Vendas', `Custo de ${quantidade}x ${produto.nome}`]);

      // Confirmar transação
      await run('COMMIT');

      // Buscar a venda criada
      const novaVenda = await get(`
        SELECT v.*, p.nome as produto_nome, p.categoria as produto_categoria,
               f.nome as funcionario_nome, f.cargo as funcionario_cargo
        FROM vendas v
        JOIN produtos p ON v.produto_id = p.id
        JOIN funcionarios f ON v.funcionario_id = f.id
        WHERE v.id = ?
      `, [result.id]);

      res.status(201).json({
        success: true,
        message: 'Venda registrada com sucesso!',
        data: novaVenda
      });

    } catch (error) {
      // Reverter transação em caso de erro
      await run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Erro ao criar venda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível registrar a venda'
    });
  }
});

// PUT /api/vendas/:id - Atualizar venda (apenas observação)
router.put('/:id', [
  body('observacao').optional().trim().isLength({ max: 500 }).withMessage('Observação deve ter no máximo 500 caracteres')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { observacao } = req.body;
    
    if (!id || isNaN(id)) {
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

    // Verificar se venda existe
    const existing = await get('SELECT id FROM vendas WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }

    // Atualizar apenas observação
    await run('UPDATE vendas SET observacao = ? WHERE id = ?', [observacao || null, id]);
    
    // Buscar a venda atualizada
    const vendaAtualizada = await get(`
      SELECT v.*, p.nome as produto_nome, p.categoria as produto_categoria,
             f.nome as funcionario_nome, f.cargo as funcionario_cargo
      FROM vendas v
      JOIN produtos p ON v.produto_id = p.id
      JOIN funcionarios f ON v.funcionario_id = f.id
      WHERE v.id = ?
    `, [id]);
    
    res.json({
      success: true,
      message: 'Venda atualizada com sucesso!',
      data: vendaAtualizada
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar venda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/vendas/:id - Excluir venda (estornar)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Verificar se venda existe
    const venda = await get('SELECT * FROM vendas WHERE id = ?', [id]);
    if (!venda) {
      return res.status(404).json({
        success: false,
        error: 'Venda não encontrada'
      });
    }

    // Verificar se produto ainda existe
    const produto = await get('SELECT id, nome, quantidade FROM produtos WHERE id = ?', [venda.produto_id]);
    if (!produto) {
      return res.status(400).json({
        success: false,
        error: 'Produto não encontrado',
        message: 'Não é possível estornar uma venda de um produto que foi excluído'
      });
    }

    // Iniciar transação
    await run('BEGIN TRANSACTION');

    try {
      // Estornar estoque
      const novaQuantidade = produto.quantidade + venda.quantidade;
              await run('UPDATE produtos SET quantidade = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [novaQuantidade, produto.id]);

              // Registrar movimentação de estorno
        await run(`
          INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo, data, created_at, updated_at)
          VALUES (?, 'entrada', ?, 'Estorno de venda', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `, [produto.id, venda.quantidade]);

      // Excluir a venda
      await run('DELETE FROM vendas WHERE id = ?', [id]);

      // Confirmar transação
      await run('COMMIT');
      
      res.json({
        success: true,
        message: 'Venda estornada com sucesso!',
        data: {
          venda_estornada: venda,
          produto_atualizado: {
            id: produto.id,
            quantidade_anterior: produto.quantidade,
            quantidade_nova: novaQuantidade
          }
        }
      });

    } catch (error) {
      // Reverter transação em caso de erro
      await run('ROLLBACK');
      throw error;
    }

  } catch (error) {
    console.error('❌ Erro ao estornar venda:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/vendas/relatorio - Relatório de vendas
router.get('/relatorio/geral', async (req, res) => {
  try {
    const { data_inicio, data_fim, formato = 'json' } = req.query;
    
    let whereClause = 'WHERE 1=1';
    const params = [];

    if (data_inicio) {
      whereClause += ' AND DATE(v.data) >= ?';
      params.push(data_inicio);
    }

    if (data_fim) {
      whereClause += ' AND DATE(v.data) <= ?';
      params.push(data_fim);
    }

    // Resumo geral
    const resumo = await get(`
      SELECT 
        COUNT(*) as total_vendas,
        SUM(quantidade) as total_itens_vendidos,
        SUM(total) as valor_total_vendas,
        AVG(total) as ticket_medio,
        MIN(data) as primeira_venda,
        MAX(data) as ultima_venda
      FROM vendas v
      ${whereClause}
    `, params);

    // Vendas por funcionário
    const vendasPorFuncionario = await query(`
      SELECT 
        f.nome as funcionario_nome,
        f.cargo as funcionario_cargo,
        COUNT(*) as total_vendas,
        SUM(v.quantidade) as total_itens,
        SUM(v.total) as valor_total
      FROM vendas v
      JOIN funcionarios f ON v.funcionario_id = f.id
      ${whereClause}
      GROUP BY v.funcionario_id
      ORDER BY valor_total DESC
    `, params);

    // Vendas por produto
    const vendasPorProduto = await query(`
      SELECT 
        p.nome as produto_nome,
        p.categoria as produto_categoria,
        COUNT(*) as total_vendas,
        SUM(v.quantidade) as total_itens,
        SUM(v.total) as valor_total
      FROM vendas v
      JOIN produtos p ON v.produto_id = p.id
      ${whereClause}
      GROUP BY v.produto_id
      ORDER BY valor_total DESC
    `, params);

    // Vendas por categoria
    const vendasPorCategoria = await query(`
      SELECT 
        p.categoria,
        COUNT(*) as total_vendas,
        SUM(v.quantidade) as total_itens,
        SUM(v.total) as valor_total
      FROM vendas v
      JOIN produtos p ON v.produto_id = p.id
      ${whereClause}
      GROUP BY p.categoria
      ORDER BY valor_total DESC
    `, params);

    const relatorio = {
      data_geracao: new Date().toISOString(),
      periodo: { data_inicio, data_fim },
      resumo,
      vendas_por_funcionario: vendasPorFuncionario,
      vendas_por_produto: vendasPorProduto,
      vendas_por_categoria: vendasPorCategoria
    };

    if (formato === 'csv') {
      // Implementar exportação CSV se necessário
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio-vendas.csv"');
      res.send('Implementar CSV');
    } else {
      res.json({
        success: true,
        data: relatorio
      });
    }

  } catch (error) {
    console.error('❌ Erro ao gerar relatório de vendas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
