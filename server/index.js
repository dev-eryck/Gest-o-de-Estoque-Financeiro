const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Forçar modo produção se estiver no Railway
const NODE_ENV = process.env.RAILWAY_ENVIRONMENT_NAME === 'production' ? 'production' : (process.env.NODE_ENV || 'development');

// Middleware
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
      upgradeInsecureRequests: []
    }
  }
}));
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

// Parse JSON
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: NODE_ENV,
    railway_env: process.env.RAILWAY_ENVIRONMENT_NAME
  });
});

// Routes
app.use('/api/produtos', require('./routes/produtos'));
app.use('/api/vendas', require('./routes/vendas'));
app.use('/api/funcionarios', require('./routes/funcionarios'));
app.use('/api/auth', require('./routes/auth'));

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
