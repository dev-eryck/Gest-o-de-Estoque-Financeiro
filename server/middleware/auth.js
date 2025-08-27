const jwt = require('jsonwebtoken');
const { get } = require('../database');

// Chave secreta para JWT (em produção deve estar em variável de ambiente)
const JWT_SECRET = 'bar-do-carneiro-secret-key-2024';

// Middleware para verificar token JWT
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Token de acesso não fornecido'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se a sessão ainda é válida no banco
    const sessao = await get('SELECT * FROM sessoes WHERE token = ? AND expira_em > datetime("now")', [token]);
    if (!sessao) {
      return res.status(401).json({
        success: false,
        message: 'Sessão expirada ou inválida'
      });
    }

    // Buscar dados do usuário
    const usuario = await get('SELECT id, username, email, nome_completo, cargo, ativo FROM usuarios WHERE id = ?', [decoded.usuarioId]);
    if (!usuario || !usuario.ativo) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado ou inativo'
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Token inválido'
    });
  }
};

// Middleware para verificar permissões específicas
const checkPermission = (acao, rota) => {
  return async (req, res, next) => {
    try {
      const { cargo } = req.usuario;
      
      // Dono tem acesso total a tudo
      if (cargo === 'dono') {
        return next();
      }

      // Verificar permissão específica
      const permissao = await get(
        'SELECT * FROM permissoes_cargo WHERE cargo = ? AND rota = ?',
        [cargo, rota]
      );

      if (!permissao) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado para esta rota'
        });
      }

      // Verificar se pode executar a ação solicitada
      let podeExecutar = false;
      switch (acao) {
        case 'ler':
          podeExecutar = permissao.pode_ler;
          break;
        case 'criar':
          podeExecutar = permissao.pode_criar;
          break;
        case 'editar':
          podeExecutar = permissao.pode_editar;
          break;
        case 'deletar':
          podeExecutar = permissao.pode_deletar;
          break;
        default:
          podeExecutar = false;
      }

      if (!podeExecutar) {
        return res.status(403).json({
          success: false,
          message: `Ação '${acao}' não permitida para esta rota`
        });
      }

      next();
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno ao verificar permissões'
      });
    }
  };
};

// Middleware para verificar se é dono ou gerente
const isAdmin = (req, res, next) => {
  if (req.usuario.cargo === 'dono' || req.usuario.cargo === 'gerente') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Acesso restrito a administradores'
  });
};

// Middleware para verificar se é dono
const isOwner = (req, res, next) => {
  if (req.usuario.cargo === 'dono') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    message: 'Acesso restrito ao proprietário'
  });
};

module.exports = {
  authenticateToken,
  checkPermission,
  isAdmin,
  isOwner,
  JWT_SECRET
};
