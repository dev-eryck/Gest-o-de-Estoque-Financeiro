const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware básico
app.use(cors());
app.use(express.json());

// Health check SIMPLES e IMEDIATO
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT,
    env: process.env.NODE_ENV || 'development'
  });
});

// Rota de teste simples
app.get('/api/test', (req, res) => {
  res.json({ message: 'Servidor funcionando!' });
});

// Iniciar servidor IMEDIATAMENTE
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
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
