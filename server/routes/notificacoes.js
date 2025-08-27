const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, run, get } = require('../database');

const router = express.Router();

// GET /api/notificacoes - Listar todas as notificações
router.get('/', async (req, res) => {
  try {
    const { lida, tipo, prioridade, limit = 50 } = req.query;
    
    let sql = 'SELECT * FROM notificacoes WHERE 1=1';
    const params = [];

    // Filtros
    if (lida !== undefined) {
      sql += ' AND lida = ?';
      params.push(lida === 'true' ? 1 : 0);
    }

    if (tipo) {
      sql += ' AND tipo = ?';
      params.push(tipo);
    }

    if (prioridade) {
      sql += ' AND prioridade = ?';
      params.push(prioridade);
    }

    sql += ' ORDER BY data_criacao DESC LIMIT ?';
    params.push(parseInt(limit));

    const notificacoes = await query(sql, params);
    
    res.json({
      success: true,
      data: notificacoes,
      total: notificacoes.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar notificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/notificacoes/nao-lidas - Contar notificações não lidas
router.get('/nao-lidas', async (req, res) => {
  try {
    const result = await get('SELECT COUNT(*) as total FROM notificacoes WHERE lida = 0');
    
    res.json({
      success: true,
      data: {
        total: result.total
      }
    });

  } catch (error) {
    console.error('❌ Erro ao contar notificações não lidas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/notificacoes - Criar nova notificação
router.post('/', [
  body('titulo').trim().isLength({ min: 1, max: 100 }).withMessage('Título deve ter entre 1 e 100 caracteres'),
  body('mensagem').trim().isLength({ min: 1, max: 500 }).withMessage('Mensagem deve ter entre 1 e 500 caracteres'),
  body('tipo').isIn(['info', 'success', 'warning', 'error']).withMessage('Tipo deve ser info, success, warning ou error'),
  body('prioridade').optional().isIn(['baixa', 'normal', 'alta', 'urgente']).withMessage('Prioridade deve ser baixa, normal, alta ou urgente')
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

    const { titulo, mensagem, tipo, prioridade = 'normal' } = req.body;

    // Criar notificação
    const result = await run(`
      INSERT INTO notificacoes (titulo, mensagem, tipo, prioridade, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [titulo, mensagem, tipo, prioridade]);

    // Buscar notificação criada
    const notificacao = await get('SELECT * FROM notificacoes WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'Notificação criada com sucesso!',
      data: notificacao
    });

  } catch (error) {
    console.error('❌ Erro ao criar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/notificacoes/:id/marcar-lida - Marcar notificação como lida
router.put('/:id/marcar-lida', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Verificar se notificação existe
    const notificacao = await get('SELECT * FROM notificacoes WHERE id = ?', [id]);
    if (!notificacao) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }

    // Marcar como lida
    await run(`
      UPDATE notificacoes 
      SET lida = 1, data_leitura = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `, [id]);

    res.json({
      success: true,
      message: 'Notificação marcada como lida!'
    });

  } catch (error) {
    console.error('❌ Erro ao marcar notificação como lida:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// PUT /api/notificacoes/marcar-todas-lidas - Marcar todas as notificações como lidas
router.put('/marcar-todas-lidas', async (req, res) => {
  try {
    await run(`
      UPDATE notificacoes 
      SET lida = 1, data_leitura = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
      WHERE lida = 0
    `);

    res.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas!'
    });

  } catch (error) {
    console.error('❌ Erro ao marcar todas as notificações como lidas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/notificacoes/:id - Deletar notificação
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Verificar se notificação existe
    const notificacao = await get('SELECT * FROM notificacoes WHERE id = ?', [id]);
    if (!notificacao) {
      return res.status(404).json({
        success: false,
        error: 'Notificação não encontrada'
      });
    }

    // Deletar notificação
    await run('DELETE FROM notificacoes WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Notificação deletada com sucesso!'
    });

  } catch (error) {
    console.error('❌ Erro ao deletar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/notificacoes/limpar-todas - Limpar todas as notificações
router.delete('/limpar-todas', async (req, res) => {
  try {
    await run('DELETE FROM notificacoes');

    res.json({
      success: true,
      message: 'Todas as notificações foram removidas!'
    });

  } catch (error) {
    console.error('❌ Erro ao limpar todas as notificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
