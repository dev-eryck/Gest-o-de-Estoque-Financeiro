const express = require('express');
const { body, validationResult } = require('express-validator');
const { db, query, run, get } = require('../database');

const router = express.Router();

// Middleware para validar erros
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: errors.array()
    });
  }
  next();
};

// GET /api/controle-financeiro - Listar todas as transações
router.get('/', async (req, res) => {
  try {
    const { tipo, data_inicio, data_fim, categoria } = req.query;
    
    let sql = `
      SELECT * FROM controle_financeiro 
      WHERE 1=1
    `;
    const params = [];
    
    if (tipo) {
      sql += ` AND tipo = ?`;
      params.push(tipo);
    }
    
    if (data_inicio) {
      sql += ` AND data >= ?`;
      params.push(data_inicio);
    }
    
    if (data_fim) {
      sql += ` AND data <= ?`;
      params.push(data_fim);
    }
    
    if (categoria) {
      sql += ` AND categoria = ?`;
      params.push(categoria);
    }
    
    sql += ` ORDER BY data DESC, created_at DESC`;
    
    const rows = await query(sql, params);
    
    res.json({
      success: true,
      data: rows
    });
    
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/controle-financeiro/resumo - Resumo financeiro
router.get('/resumo', async (req, res) => {
  try {
    const { periodo = 'mes' } = req.query;
    
    let dataInicio;
    const hoje = new Date();
    
    switch (periodo) {
      case 'dia':
        dataInicio = hoje.toISOString().split('T')[0];
        break;
      case 'semana':
        dataInicio = new Date(hoje.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        break;
      case 'mes':
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
        break;
      case 'ano':
        dataInicio = new Date(hoje.getFullYear(), 0, 1).toISOString().split('T')[0];
        break;
      default:
        dataInicio = new Date(hoje.getFullYear(), hoje.getMonth(), 1).toISOString().split('T')[0];
    }
    
    const sql = `
      SELECT 
        tipo,
        SUM(valor) as total,
        COUNT(*) as quantidade
      FROM controle_financeiro 
      WHERE data >= ?
      GROUP BY tipo
    `;
    
    const rows = await query(sql, [dataInicio]);
    
    const resumo = {
      periodo,
      data_inicio: dataInicio,
      data_fim: hoje.toISOString().split('T')[0],
      vendas: 0,
      custos: 0,
      ajustes: 0,
      caixa_inicial: 0,
      lucro: 0,
      margem_lucro: 0
    };
    
    rows.forEach(row => {
      switch (row.tipo) {
        case 'venda':
          resumo.vendas = row.total;
          break;
        case 'custo':
          resumo.custos = row.total;
          break;
        case 'ajuste':
          resumo.ajustes = row.total;
          break;
        case 'caixa_inicial':
          resumo.caixa_inicial = row.total;
          break;
      }
    });
    
    resumo.lucro = resumo.vendas - resumo.custos;
    resumo.margem_lucro = resumo.vendas > 0 ? ((resumo.lucro / resumo.vendas) * 100) : 0;
    
    res.json({
      success: true,
      data: resumo
    });
    
  } catch (error) {
    console.error('Erro ao buscar resumo:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/controle-financeiro/caixa-atual - Caixa atual
router.get('/caixa-atual', async (req, res) => {
  try {
    const sql = `
      SELECT 
        SUM(CASE WHEN tipo = 'caixa_inicial' THEN valor ELSE 0 END) as caixa_inicial,
        SUM(CASE WHEN tipo = 'venda' THEN valor ELSE 0 END) as total_vendas,
        SUM(CASE WHEN tipo = 'custo' THEN valor ELSE 0 END) as total_custos,
        SUM(CASE WHEN tipo = 'ajuste' THEN valor ELSE 0 END) as total_ajustes
      FROM controle_financeiro
    `;
    
    const row = await get(sql);
    
    const caixaAtual = {
      caixa_inicial: row.caixa_inicial || 0,
      total_vendas: row.total_vendas || 0,
      total_custos: row.total_custos || 0,
      total_ajustes: row.total_ajustes || 0,
      saldo_atual: (row.caixa_inicial || 0) + (row.total_vendas || 0) - (row.total_custos || 0) + (row.total_ajustes || 0)
    };
    
    res.json({
      success: true,
      data: caixaAtual
    });
    
  } catch (error) {
    console.error('Erro ao buscar caixa atual:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/controle-financeiro - Criar nova transação
router.post('/', [
  body('tipo').isIn(['caixa_inicial', 'venda', 'custo', 'ajuste']).withMessage('Tipo inválido'),
  body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
  body('valor').isFloat({ min: 0 }).withMessage('Valor deve ser um número positivo'),
  body('data').isISO8601().withMessage('Data inválida'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { tipo, descricao, valor, data, categoria, observacao } = req.body;
    
    const sql = `
      INSERT INTO controle_financeiro (tipo, descricao, valor, data, categoria, observacao, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    const result = await run(sql, [tipo, descricao, valor, data, categoria, observacao]);
    
    res.status(201).json({
      success: true,
      message: 'Transação criada com sucesso',
      data: {
        id: result.id,
        tipo,
        descricao,
        valor,
        data,
        categoria,
        observacao
      }
    });
    
  } catch (error) {
    console.error('Erro ao criar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/controle-financeiro/:id - Atualizar transação
router.put('/:id', [
  body('tipo').isIn(['caixa_inicial', 'venda', 'custo', 'ajuste']).withMessage('Tipo inválido'),
  body('descricao').notEmpty().withMessage('Descrição é obrigatória'),
  body('valor').isFloat({ min: 0 }).withMessage('Valor deve ser um número positivo'),
  body('data').isISO8601().withMessage('Data inválida'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, descricao, valor, data, categoria, observacao } = req.body;
    
    const sql = `
      UPDATE controle_financeiro 
      SET tipo = ?, descricao = ?, valor = ?, data = ?, categoria = ?, observacao = ?, updated_at = datetime('now')
      WHERE id = ?
    `;
    
    const result = await run(sql, [tipo, descricao, valor, data, categoria, observacao, id]);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Transação atualizada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao atualizar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/controle-financeiro/:id - Deletar transação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const sql = `DELETE FROM controle_financeiro WHERE id = ?`;
    
    const result = await run(sql, [id]);
    
    if (result.changes === 0) {
      return res.status(404).json({
        success: false,
        message: 'Transação não encontrada'
      });
    }
    
    res.json({
      success: true,
      message: 'Transação deletada com sucesso'
    });
    
  } catch (error) {
    console.error('Erro ao deletar transação:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
