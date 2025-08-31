const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { run, get, query } = require('../database');
const { authenticateToken, isOwner, JWT_SECRET } = require('../middleware/auth');

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

// POST /api/auth/corrigir-eryck - Corrigir cargo do usuário eryck temporariamente (REMOVER EM PRODUÇÃO)
router.post('/corrigir-eryck', async (req, res) => {
  try {
    console.log('🔐 Corrigindo usuário eryck...');
    
    // Verificar se usuário existe
    const usuarioExistente = await get('SELECT id, cargo FROM usuarios WHERE username = ?', ['eryck']);
    
    if (!usuarioExistente) {
      console.log('❌ Usuário eryck não encontrado, criando...');
      
      // Criar usuário com cargo correto
      const username = 'eryck';
      const senha = '300406';
      const email = 'eryck@temp.com';
      const nome_completo = 'Eryck Gerente';
      const cargo = 'gerente';
      
      const senhaHash = await bcrypt.hash(senha, 12);
      const result = await run(
        'INSERT INTO usuarios (username, email, senha_hash, nome_completo, cargo, ativo) VALUES (?, ?, ?, ?, ?, 1)',
        [username, email, senhaHash, nome_completo, cargo]
      );
      
      console.log('✅ Usuário eryck criado com cargo gerente, ID:', result.lastID);
      
      return res.json({
        success: true,
        message: 'Usuário eryck criado com cargo gerente',
        data: { username, cargo }
      });
    }
    
    // Atualizar cargo para 'gerente'
    await run('UPDATE usuarios SET cargo = ? WHERE username = ?', ['gerente', 'eryck']);
    
    console.log('✅ Cargo do usuário eryck atualizado para gerente');
    
    res.json({
      success: true,
      message: 'Cargo do usuário eryck corrigido para gerente',
      data: { username: 'eryck', cargo: 'gerente' }
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir usuário eryck:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/criar-eryck - Criar usuário eryck temporariamente (REMOVER EM PRODUÇÃO)
router.post('/criar-eryck', async (req, res) => {
  try {
    console.log('🔐 Criando usuário eryck temporariamente...');
    
    const username = 'eryck';
    const senha = '300406';
    const email = 'eryck@temp.com';
    const nome_completo = 'Eryck Temporário';
    const cargo = 'gerente';
    
    // Verificar se usuário já existe
    const usuarioExistente = await get('SELECT id FROM usuarios WHERE username = ?', [username]);
    
    if (usuarioExistente) {
      console.log('⚠️ Usuário eryck já existe, atualizando senha...');
      
      // Atualizar senha
      const senhaHash = await bcrypt.hash(senha, 12);
      await run('UPDATE usuarios SET senha_hash = ? WHERE username = ?', [senhaHash, username]);
      
      return res.json({
        success: true,
        message: 'Usuário eryck atualizado com sucesso',
        data: { username, cargo }
      });
    }
    
    // Criar novo usuário
    const senhaHash = await bcrypt.hash(senha, 12);
    const result = await run(
      'INSERT INTO usuarios (username, email, senha_hash, nome_completo, cargo, ativo) VALUES (?, ?, ?, ?, ?, 1)',
      [username, email, senhaHash, nome_completo, cargo]
    );
    
    console.log('✅ Usuário eryck criado com ID:', result.lastID);
    
    res.status(201).json({
      success: true,
      message: 'Usuário eryck criado com sucesso',
      data: { username, cargo }
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar usuário eryck:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/login - Login do usuário
router.post('/login', [
  body('username').notEmpty().withMessage('Username é obrigatório'),
  body('senha').notEmpty().withMessage('Senha é obrigatória'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { username, senha } = req.body;

    // Buscar usuário
    const usuario = await get('SELECT * FROM usuarios WHERE username = ? AND ativo = 1', [username]);
    if (!usuario) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        message: 'Credenciais inválidas'
      });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { usuarioId: usuario.id, username: usuario.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Criar sessão no banco
    const expiraEm = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    await run(
      'INSERT INTO sessoes (usuario_id, token, expira_em) VALUES (?, ?, ?)',
      [usuario.id, token, expiraEm]
    );

    // Atualizar último login
    await run(
      'UPDATE usuarios SET ultimo_login = datetime("now") WHERE id = ?',
      [usuario.id]
    );

    // Retornar dados do usuário (sem senha) e token
    const { senha_hash, ...usuarioSemSenha } = usuario;
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        usuario: usuarioSemSenha,
        token,
        expira_em: expiraEm
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/logout - Logout do usuário
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    
    // Remover sessão do banco
    await run('DELETE FROM sessoes WHERE token = ?', [token]);
    
    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/registro - Registrar novo usuário (apenas dono)
router.post('/registro', [
  authenticateToken,
  isOwner,
  body('username').isLength({ min: 3 }).withMessage('Username deve ter pelo menos 3 caracteres'),
  body('email').isEmail().withMessage('Email inválido'),
  body('senha').isLength({ min: 6 }).withMessage('Senha deve ter pelo menos 6 caracteres'),
  body('nome_completo').notEmpty().withMessage('Nome completo é obrigatório'),
  body('cargo').isIn(['dono', 'gerente', 'garcom', 'caixa', 'estoque']).withMessage('Cargo inválido'),
  handleValidationErrors
], async (req, res) => {
  try {
    console.log('👤 Criando novo usuário...');
    console.log('📝 Dados recebidos:', req.body);
    console.log('👑 Usuário solicitante:', req.usuario);
    
    const { username, email, senha, nome_completo, cargo } = req.body;

    console.log('🔍 Validando dados:');
    console.log('  - Username:', username, 'Válido:', username && username.length >= 3);
    console.log('  - Email:', email, 'Válido:', email && email.includes('@'));
    console.log('  - Senha:', senha ? '***' + senha.slice(-2) : 'N/A', 'Válida:', senha && senha.length >= 6);
    console.log('  - Nome:', nome_completo, 'Válido:', nome_completo && nome_completo.trim());
    console.log('  - Cargo:', cargo, 'Válido:', ['dono', 'gerente', 'garcom', 'caixa', 'estoque'].includes(cargo));

    // Verificar se username ou email já existem
    const usuarioExistente = await get(
      'SELECT id FROM usuarios WHERE username = ? OR email = ?',
      [username, email]
    );

    if (usuarioExistente) {
      console.log('❌ Usuário já existe:', usuarioExistente);
      return res.status(400).json({
        success: false,
        message: 'Username ou email já cadastrado'
      });
    }

    console.log('✅ Validações passaram, criando usuário...');

    // Criptografar senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Criar usuário
    const result = await run(
      'INSERT INTO usuarios (username, email, senha_hash, nome_completo, cargo) VALUES (?, ?, ?, ?, ?)',
      [username, email, senhaHash, nome_completo, cargo]
    );

    console.log('✅ Usuário criado com ID:', result.lastID);

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        id: result.lastID,
        username,
        email,
        nome_completo,
        cargo
      }
    });

  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/auth/perfil - Obter perfil do usuário logado
router.get('/perfil', authenticateToken, async (req, res) => {
  try {
    const { senha_hash, ...usuarioSemSenha } = req.usuario;
    
    res.json({
      success: true,
      data: usuarioSemSenha
    });

  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/auth/perfil - Atualizar perfil do usuário
router.put('/perfil', authenticateToken, async (req, res) => {
  try {
    console.log('🔧 Atualizando perfil do usuário...');
    console.log('📝 Dados recebidos:', req.body);
    console.log('👤 Usuário autenticado:', req.usuario);
    
    const { nome_completo, currentPassword, newPassword } = req.body;
    const userId = req.usuario.id;

    console.log('🆔 ID do usuário:', userId);

    // Buscar usuário atual
    const usuario = await get('SELECT * FROM usuarios WHERE id = ?', [userId]);
    if (!usuario) {
      console.log('❌ Usuário não encontrado no banco');
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    console.log('📋 Usuário encontrado no banco:', {
      id: usuario.id,
      username: usuario.username,
      nome_completo: usuario.nome_completo,
      cargo: usuario.cargo
    });

    // Preparar dados para atualização
    const updateData = {};
    const updateFields = [];

    // Atualizar nome se fornecido
    if (nome_completo && nome_completo.trim()) {
      updateData.nome_completo = nome_completo.trim();
      updateFields.push('nome_completo = ?');
      console.log('✏️ Nome será atualizado para:', nome_completo.trim());
    }

    // Atualizar senha se fornecida
    if (newPassword) {
      console.log('🔐 Atualizando senha...');
      
      if (!currentPassword) {
        console.log('❌ Senha atual não fornecida');
        return res.status(400).json({ message: 'Senha atual é obrigatória para alterar a senha' });
      }

      // Verificar senha atual
      console.log('🔍 Verificando senha atual...');
      const senhaValida = await bcrypt.compare(currentPassword, usuario.senha_hash);
      console.log('✅ Senha atual válida:', senhaValida);
      
      if (!senhaValida) {
        console.log('❌ Senha atual incorreta');
        return res.status(400).json({ message: 'Senha atual incorreta' });
      }

      // Validar nova senha
      if (newPassword.length < 6) {
        console.log('❌ Nova senha muito curta');
        return res.status(400).json({ message: 'Nova senha deve ter pelo menos 6 caracteres' });
      }

      // Hash da nova senha
      console.log('🔒 Gerando hash da nova senha...');
      const novaSenhaHash = await bcrypt.hash(newPassword, 10);
      updateData.senha_hash = novaSenhaHash;
      updateFields.push('senha_hash = ?');
      console.log('✅ Hash da nova senha gerado');
    }

    // Se não há nada para atualizar
    if (updateFields.length === 0) {
      console.log('❌ Nenhum campo para atualizar');
      return res.status(400).json({ message: 'Nenhum campo para atualizar' });
    }

    console.log('📝 Campos para atualizar:', updateFields);
    console.log('💾 Dados para atualizar:', updateData);

    // Atualizar usuário
    const sql = `UPDATE usuarios SET ${updateFields.join(', ')}, updated_at = datetime('now') WHERE id = ?`;
    const params = [...Object.values(updateData), userId];
    
    console.log('🔧 SQL:', sql);
    console.log('📊 Parâmetros:', params);
    
    const result = await run(sql, params);
    console.log('✅ Resultado da atualização:', result);

    // Buscar usuário atualizado
    const usuarioAtualizado = await get('SELECT id, username, nome_completo, email, cargo, created_at, updated_at FROM usuarios WHERE id = ?', [userId]);

    console.log('🎯 Usuário atualizado:', usuarioAtualizado);

    res.json({
      message: 'Perfil atualizado com sucesso',
      usuario: usuarioAtualizado
    });

  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
});

// GET /api/auth/usuarios - Listar usuários (apenas dono)
router.get('/usuarios', [authenticateToken, isOwner], async (req, res) => {
  try {
    const usuarios = await query(
      'SELECT id, username, email, nome_completo, cargo, ativo, ultimo_login, created_at FROM usuarios ORDER BY created_at DESC'
    );

    res.json({
      success: true,
      data: usuarios
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// PUT /api/auth/usuarios/:id - Atualizar usuário (apenas dono)
router.put('/usuarios/:id', [
  authenticateToken,
  isOwner,
  body('nome_completo').optional().notEmpty().withMessage('Nome completo não pode ser vazio'),
  body('cargo').optional().isIn(['dono', 'gerente', 'garcom', 'caixa', 'estoque']).withMessage('Cargo inválido'),
  body('ativo').optional().isBoolean().withMessage('Status ativo deve ser booleano'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { nome_completo, cargo, ativo } = req.body;

    // Verificar se usuário existe
    const usuario = await get('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Construir query de atualização
    const campos = [];
    const valores = [];
    
    if (nome_completo !== undefined) {
      campos.push('nome_completo = ?');
      valores.push(nome_completo);
    }
    
    if (cargo !== undefined) {
      campos.push('cargo = ?');
      valores.push(cargo);
    }
    
    if (ativo !== undefined) {
      campos.push('ativo = ?');
      valores.push(ativo);
    }

    if (campos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Nenhum campo para atualizar'
      });
    }

    campos.push('updated_at = datetime("now")');
    valores.push(id);

    const query = `UPDATE usuarios SET ${campos.join(', ')} WHERE id = ?`;
    await run(query, valores);

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// DELETE /api/auth/usuarios/:id - Deletar usuário (apenas dono)
router.delete('/usuarios/:id', [authenticateToken, isOwner], async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se não é o próprio usuário
    if (parseInt(id) === req.usuario.id) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar o próprio usuário'
      });
    }

    // Verificar se usuário existe
    const usuario = await get('SELECT id FROM usuarios WHERE id = ?', [id]);
    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Deletar usuário
    await run('DELETE FROM usuarios WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

// GET /api/auth/permissoes - Obter permissões do usuário logado
router.get('/permissoes', authenticateToken, async (req, res) => {
  try {
    const { cargo } = req.usuario;
    
    // Dono tem todas as permissões
    if (cargo === 'dono') {
      const todasPermissoes = {
        dashboard: { ler: true, criar: true, editar: true, deletar: true },
        produtos: { ler: true, criar: true, editar: true, deletar: true },
        funcionarios: { ler: true, criar: true, editar: true, deletar: true },
        estoque: { ler: true, criar: true, editar: true, deletar: true },
        vendas: { ler: true, criar: true, editar: true, deletar: true },
        relatorios: { ler: true, criar: true, editar: true, deletar: true },
        categorias: { ler: true, criar: true, editar: true, deletar: true },
        controle_financeiro: { ler: true, criar: true, editar: true, deletar: true },
        configuracoes: { ler: true, criar: true, editar: true, deletar: true },
        usuarios: { ler: true, criar: true, editar: true, deletar: true }
      };

      return res.json({
        success: true,
        data: todasPermissoes
      });
    }

    // Buscar permissões específicas do cargo
    const permissoes = await query(
      'SELECT rota, pode_ler, pode_criar, pode_editar, pode_deletar FROM permissoes_cargo WHERE cargo = ?',
      [cargo]
    );

    // Formatar permissões
    const permissoesFormatadas = {};
    permissoes.forEach(perm => {
      permissoesFormatadas[perm.rota] = {
        ler: !!perm.pode_ler,
        criar: !!perm.pode_criar,
        editar: !!perm.pode_editar,
        deletar: !!perm.pode_deletar
      };
    });

    res.json({
      success: true,
      data: permissoesFormatadas
    });

  } catch (error) {
    console.error('Erro ao buscar permissões:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor'
    });
  }
});

module.exports = router;
