const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Importar rotas
const produtosRoutes = require('./routes/produtos');
const funcionariosRoutes = require('./routes/funcionarios');
const estoqueRoutes = require('./routes/estoque');
const vendasRoutes = require('./routes/vendas');
const categoriasRoutes = require('./routes/categorias');
const notificacoesRoutes = require('./routes/notificacoes');
const controleFinanceiroRoutes = require('./routes/controle-financeiro');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware de segurança
app.use(helmet());

// Configuração CORS para produção
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

// Log apenas em desenvolvimento
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('combined'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
app.use('/api/produtos', produtosRoutes);
app.use('/api/funcionarios', funcionariosRoutes);
app.use('/api/estoque', estoqueRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/categorias', categoriasRoutes);
app.use('/api/notificacoes', notificacoesRoutes);
app.use('/api/controle-financeiro', controleFinanceiroRoutes);
app.use('/api/auth', authRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'BAR DO CARNEIRO - Sistema funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Servir arquivos estáticos do React em produção
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build', 'index.html'));
  });
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Erro interno do servidor',
    message: err.message 
  });
});

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    message: 'A rota solicitada não existe' 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor BAR DO CARNEIRO rodando na porta ${PORT}`);
  console.log(`📊 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});
