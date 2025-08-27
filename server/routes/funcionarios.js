const express = require('express');
const { body, validationResult } = require('express-validator');
const { query, run, get } = require('../database');

const router = express.Router();

// Middleware para validar dados
const validateFuncionario = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório').isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('cargo').trim().notEmpty().withMessage('Cargo é obrigatório').isLength({ min: 2, max: 50 }).withMessage('Cargo deve ter entre 2 e 50 caracteres'),
  body('telefone').optional().trim().isLength({ min: 10, max: 15 }).withMessage('Telefone deve ter entre 10 e 15 caracteres'),
  body('email').optional().isEmail().withMessage('Email deve ser válido'),
  body('cpf').optional().isLength({ min: 11, max: 14 }).withMessage('CPF deve ter entre 11 e 14 caracteres'),
  body('salario').optional().isFloat({ min: 0 }).withMessage('Salário deve ser um número positivo'),
  body('status').optional().isIn(['ativo', 'inativo', 'ferias', 'licenca']).withMessage('Status deve ser ativo, inativo, ferias ou licenca')
];

// GET /api/funcionarios - Listar todos os funcionários
router.get('/', async (req, res) => {
  try {
    const { cargo, status, busca } = req.query;
    
    let sql = 'SELECT * FROM funcionarios WHERE 1=1';
    const params = [];

    // Filtro por cargo
    if (cargo && cargo !== 'todos') {
      sql += ' AND cargo = ?';
      params.push(cargo);
    }

    // Filtro por status
    if (status && status !== 'todos') {
      sql += ' AND status = ?';
      params.push(status);
    }

    // Filtro de busca
    if (busca) {
      sql += ' AND (nome LIKE ? OR email LIKE ? OR cpf LIKE ?)';
      const buscaTermo = `%${busca}%`;
      params.push(buscaTermo, buscaTermo, buscaTermo);
    }

    sql += ' ORDER BY nome ASC';

    const funcionarios = await query(sql, params);
    
    res.json({
      success: true,
      data: funcionarios,
      total: funcionarios.length
    });

  } catch (error) {
    console.error('❌ Erro ao listar funcionários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível listar os funcionários'
    });
  }
});

// GET /api/funcionarios/cargos - Listar cargos
router.get('/cargos', async (req, res) => {
  try {
    const cargos = await query('SELECT DISTINCT cargo FROM funcionarios ORDER BY cargo');
    res.json({
      success: true,
      data: cargos.map(c => c.cargo)
    });
  } catch (error) {
    console.error('❌ Erro ao listar cargos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/funcionarios/:id - Obter funcionário específico
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido',
        message: 'O ID do funcionário deve ser um número válido'
      });
    }

    const funcionario = await get('SELECT * FROM funcionarios WHERE id = ?', [id]);
    
    if (!funcionario) {
      return res.status(404).json({
        success: false,
        error: 'Funcionário não encontrado',
        message: 'O funcionário com o ID especificado não existe'
      });
    }

    res.json({
      success: true,
      data: funcionario
    });

  } catch (error) {
    console.error('❌ Erro ao obter funcionário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/funcionarios - Criar novo funcionário
router.post('/', validateFuncionario, async (req, res) => {
  try {
    console.log('📝 Dados recebidos para criar funcionário:', req.body);
    
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Erros de validação:', errors.array());
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors.array()
      });
    }

    const { nome, cargo, telefone, email, cpf, endereco, data_admissao, salario, status } = req.body;
    
    console.log('🔍 Dados extraídos:', { nome, cargo, telefone, email, cpf, endereco, data_admissao, salario, status });

    // Verificar se email já existe
    if (email) {
      const existingEmail = await get('SELECT id FROM funcionarios WHERE email = ?', [email]);
      if (existingEmail) {
        console.log('❌ Email já existe:', email);
        return res.status(400).json({
          success: false,
          error: 'Email duplicado',
          message: 'Já existe um funcionário com este email'
        });
      }
    }

    // Verificar se CPF já existe
    if (cpf) {
      const existingCPF = await get('SELECT id FROM funcionarios WHERE cpf = ?', [cpf]);
      if (existingCPF) {
        console.log('❌ CPF já existe:', cpf);
        return res.status(400).json({
          success: false,
          error: 'CPF duplicado',
          message: 'Já existe um funcionário com este CPF'
        });
      }
    }

    const sql = `
      INSERT INTO funcionarios (nome, cargo, telefone, email, cpf, endereco, data_admissao, salario, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const params = [
      nome, 
      cargo, 
      telefone || null, 
      email || null, 
      cpf || null, 
      endereco || null, 
      data_admissao || null, 
      salario || null, 
      status || 'ativo'
    ];
    
    console.log('💾 Executando SQL:', sql);
    console.log('📊 Parâmetros:', params);
    
    const result = await run(sql, params);
    console.log('✅ Resultado da inserção:', result);
    
    // Buscar o funcionário criado
    const novoFuncionario = await get('SELECT * FROM funcionarios WHERE id = ?', [result.id]);
    console.log('🔍 Funcionário criado:', novoFuncionario);
    
    res.status(201).json({
      success: true,
      message: 'Funcionário criado com sucesso!',
      data: novoFuncionario
    });

  } catch (error) {
    console.error('❌ Erro ao criar funcionário:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Não foi possível criar o funcionário',
      details: error.message
    });
  }
});

// PUT /api/funcionarios/:id - Atualizar funcionário
router.put('/:id', validateFuncionario, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Verificar se funcionário existe
    const existing = await get('SELECT id FROM funcionarios WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Funcionário não encontrado'
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

    const { nome, cargo, telefone, email, cpf, endereco, data_admissao, salario, status } = req.body;

    // Verificar se email já existe em outro funcionário
    if (email) {
      const existingEmail = await get('SELECT id FROM funcionarios WHERE email = ? AND id != ?', [email, id]);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: 'Email duplicado'
        });
      }
    }

    // Verificar se CPF já existe em outro funcionário
    if (cpf) {
      const existingCPF = await get('SELECT id FROM funcionarios WHERE cpf = ? AND id != ?', [cpf, id]);
      if (existingCPF) {
        return res.status(400).json({
          success: false,
          error: 'CPF duplicado'
        });
      }
    }

    const sql = `
      UPDATE funcionarios 
      SET nome = ?, cargo = ?, telefone = ?, email = ?, cpf = ?, 
          endereco = ?, data_admissao = ?, salario = ?, status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    const params = [
      nome, 
      cargo, 
      telefone || null, 
      email || null, 
      cpf || null, 
      endereco || null, 
      data_admissao || null, 
      salario || null, 
      status || 'ativo',
      id
    ];
    
    await run(sql, params);
    
    // Buscar o funcionário atualizado
    const funcionarioAtualizado = await get('SELECT * FROM funcionarios WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: 'Funcionário atualizado com sucesso!',
      data: funcionarioAtualizado
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar funcionário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/funcionarios/:id - Excluir funcionário
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Verificar se funcionário existe
    const existing = await get('SELECT id, nome FROM funcionarios WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Funcionário não encontrado'
      });
    }

    // Verificar se há vendas associadas
    const vendas = await query('SELECT id FROM vendas WHERE funcionario_id = ?', [id]);
    if (vendas.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Funcionário não pode ser excluído',
        message: `Existem ${vendas.length} venda(s) associada(s) a este funcionário`
      });
    }

    // Verificar se há movimentações de estoque associadas (removido funcionario_id)
    // As movimentações não são mais vinculadas a funcionários específicos

    // Excluir funcionário
    await run('DELETE FROM funcionarios WHERE id = ?', [id]);
    
    res.json({
      success: true,
      message: `Funcionário "${existing.nome}" excluído com sucesso!`
    });

  } catch (error) {
    console.error('❌ Erro ao excluir funcionário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/funcionarios/:id/vendas - Obter vendas do funcionário
router.get('/:id/vendas', async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'ID inválido'
      });
    }

    // Verificar se funcionário existe
    const funcionario = await get('SELECT id, nome FROM funcionarios WHERE id = ?', [id]);
    if (!funcionario) {
      return res.status(404).json({
        success: false,
        error: 'Funcionário não encontrado'
      });
    }

    const vendas = await query(`
      SELECT v.*, p.nome as produto_nome, p.preco as produto_preco
      FROM vendas v
      JOIN produtos p ON v.produto_id = p.id
      WHERE v.funcionario_id = ?
      ORDER BY v.data DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        funcionario,
        vendas,
        total_vendas: vendas.length,
        valor_total: vendas.reduce((sum, v) => sum + (parseFloat(v.preco_unitario) * v.quantidade), 0)
      }
    });

  } catch (error) {
    console.error('❌ Erro ao obter vendas do funcionário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
