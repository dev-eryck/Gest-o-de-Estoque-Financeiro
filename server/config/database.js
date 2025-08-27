const path = require('path');

// Configuração do banco de dados
const dbConfig = {
  development: {
    path: path.join(__dirname, '../../database.sqlite'),
    verbose: console.log
  },
  production: {
    path: process.env.DB_PATH || path.join(__dirname, '../../database.sqlite'),
    verbose: false
  }
};

// Retorna a configuração baseada no ambiente
function getDbConfig() {
  const env = process.env.NODE_ENV || 'development';
  return dbConfig[env] || dbConfig.development;
}

module.exports = { getDbConfig };
