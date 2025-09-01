const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 5000;

// Forçar modo produção se estiver no Railway
const NODE_ENV = process.env.RAILWAY_ENVIRONMENT_NAME === 'production' ? 'production' : (process.env.NODE_ENV || 'development');

// Middleware de segurança otimizado para produção
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      frameSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      upgradeInsecureRequests: true,
      baseUri: ["'self'"],
      formAction: ["'self'"],
      frameAncestors: ["'self'"],
      scriptSrcAttr: ["'none'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
}));
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Rate limiting para proteção contra ataques
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP por janela
  message: {
    success: false,
    error: 'Too many requests',
    message: 'Muitas requisições. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting a todas as rotas
app.use(limiter);

// Rate limiting específico para autenticação
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // limite de 5 tentativas de login por IP por janela
  message: {
    success: false,
    error: 'Too many login attempts',
    message: 'Muitas tentativas de login. Tente novamente em alguns minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting específico às rotas de autenticação
app.use('/api/auth', authLimiter);

// Compressão para melhorar performance
app.use(compression());

// Parse JSON
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: NODE_ENV,
    railway_env: process.env.RAILWAY_ENVIRONMENT_NAME,
    version: '1.0.4'
  });
});

// Routes - com tratamento de erro para evitar falha no startup
try {
  app.use('/api/dashboard', require('./routes/dashboard'));
  app.use('/api/produtos', require('./routes/produtos'));
  app.use('/api/vendas', require('./routes/vendas'));
  app.use('/api/funcionarios', require('./routes/funcionarios'));
  app.use('/api/estoque', require('./routes/estoque'));
  app.use('/api/categorias', require('./routes/categorias'));
  app.use('/api/controle-financeiro', require('./routes/controle-financeiro'));
  app.use('/api/notificacoes', require('./routes/notificacoes'));
  app.use('/api/auth', require('./routes/auth'));
  console.log('✅ Todas as rotas carregadas com sucesso');
} catch (error) {
  console.error('❌ Erro ao carregar rotas:', error.message);
  // Continuar mesmo com erro nas rotas para permitir healthcheck
}

// Serve static files from React build
if (NODE_ENV === 'production') {
  // Serve static files from the React app
  app.use(express.static(path.join(__dirname, '../client/build')));

  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Iniciar servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${NODE_ENV}`);
  console.log(`🚂 Railway Environment: ${process.env.RAILWAY_ENVIRONMENT_NAME}`);
  console.log(`📊 Health check disponível em: /api/health`);
  console.log(`🔗 URL: http://0.0.0.0:${PORT}`);
  console.log(`✅ Versão: 1.0.4 - Deploy forçado em ${new Date().toISOString()}`);
});

// Tratamento de erro do servidor
server.on('error', (error) => {
  console.error('❌ Erro no servidor:', error.message);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Porta ${PORT} já está em uso`);
  }
});

// Lidar com sinais graciosamente
process.on('SIGTERM', () => {
  console.log('📴 Recebido SIGTERM, fechando servidor graciosamente...');
  server.close(() => {
    console.log('✅ Servidor fechado graciosamente');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('📴 Recebido SIGINT, fechando servidor graciosamente...');
  server.close(() => {
    console.log('✅ Servidor fechado graciosamente');
    process.exit(0);
  });
});
