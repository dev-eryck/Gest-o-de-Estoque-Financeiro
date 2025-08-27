const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { getDbConfig } = require('./config/database');

// Obter configuração do banco baseada no ambiente
const dbConfig = getDbConfig();

// Criar conexão com o banco
const db = new sqlite3.Database(dbConfig.path, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar com o banco:', err.message);
  } else {
    console.log('✅ Conectado ao banco SQLite');
    console.log(`📁 Caminho: ${dbConfig.path}`);
    createTables();
  }
});

// Configurar verbose baseado no ambiente
if (dbConfig.verbose) {
  db.configure('trace', dbConfig.verbose);
}

// Função para criar as tabelas
function createTables() {
  // Tabela de produtos
  db.run(`CREATE TABLE IF NOT EXISTS produtos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    descricao TEXT,
    preco_venda DECIMAL(10,2) NOT NULL,
    preco_custo DECIMAL(10,2) NOT NULL,
    quantidade INTEGER DEFAULT 0,
    estoque_minimo INTEGER DEFAULT 5,
    categoria_id INTEGER,
    fornecedor TEXT,
    codigo_barras TEXT UNIQUE,
    ativo BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias (id)
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela produtos:', err.message);
    } else {
      console.log('✅ Tabela produtos criada/verificada');
    }
  });

  // Tabela de funcionários
  db.run(`CREATE TABLE IF NOT EXISTS funcionarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    cargo TEXT NOT NULL,
    telefone TEXT,
    email TEXT UNIQUE,
    cpf TEXT UNIQUE,
    endereco TEXT,
    data_admissao DATE,
    salario DECIMAL(10,2),
    status TEXT DEFAULT 'ativo',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela funcionarios:', err.message);
    } else {
      console.log('✅ Tabela funcionarios criada/verificada');
    }
  });

  // Tabela de vendas
  db.run(`CREATE TABLE IF NOT EXISTS vendas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    funcionario_id INTEGER NOT NULL,
    quantidade INTEGER NOT NULL,
    preco_unitario DECIMAL(10,2) NOT NULL,
    observacao TEXT,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos (id),
    FOREIGN KEY (funcionario_id) REFERENCES funcionarios (id)
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela vendas:', err.message);
    } else {
      console.log('✅ Tabela vendas criada/verificada');
    }
  });

  // Tabela de movimentações de estoque
  db.run(`CREATE TABLE IF NOT EXISTS movimentacoes_estoque (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    produto_id INTEGER NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('entrada', 'saida', 'ajuste')),
    quantidade INTEGER NOT NULL,
    motivo TEXT,
    observacao TEXT,
    data DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (produto_id) REFERENCES produtos (id)
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela movimentacoes_estoque:', err.message);
    } else {
      console.log('✅ Tabela movimentacoes_estoque criada/verificada');
    }
  });

  // Tabela de categorias
  db.run(`CREATE TABLE IF NOT EXISTS categorias (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL UNIQUE,
    descricao TEXT,
    cor TEXT DEFAULT '#C1121F',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela categorias:', err.message);
    } else {
      console.log('✅ Tabela categorias criada/verificada');
    }
  });

  // Tabela de notificações
  db.run(`CREATE TABLE IF NOT EXISTS notificacoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    titulo TEXT NOT NULL,
    mensagem TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK(tipo IN ('info', 'success', 'warning', 'error')),
    prioridade TEXT DEFAULT 'normal' CHECK(prioridade IN ('baixa', 'normal', 'alta', 'urgente')),
    lida BOOLEAN DEFAULT 0,
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    data_leitura DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela notificacoes:', err.message);
    } else {
      console.log('✅ Tabela notificacoes criada/verificada');
    }
  });

  // Tabela de controle financeiro
  db.run(`CREATE TABLE IF NOT EXISTS controle_financeiro (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo TEXT NOT NULL CHECK(tipo IN ('caixa_inicial', 'venda', 'custo', 'ajuste')),
    descricao TEXT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    data DATE NOT NULL,
    categoria TEXT,
    observacao TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela controle_financeiro:', err.message);
    } else {
      console.log('✅ Tabela controle_financeiro criada/verificada');
    }
  });

  // Tabela de usuários com sistema de permissões
  db.run(`CREATE TABLE IF NOT EXISTS usuarios (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    nome_completo TEXT NOT NULL,
    cargo TEXT NOT NULL CHECK(cargo IN ('dono', 'gerente', 'garcom', 'caixa', 'estoque')),
    ativo BOOLEAN DEFAULT 1,
    ultimo_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela usuarios:', err.message);
    } else {
      console.log('✅ Tabela usuarios criada/verificada');
    }
  });

  // Tabela de permissões por cargo
  db.run(`CREATE TABLE IF NOT EXISTS permissoes_cargo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cargo TEXT NOT NULL,
    rota TEXT NOT NULL,
    pode_ler BOOLEAN DEFAULT 1,
    pode_criar BOOLEAN DEFAULT 0,
    pode_editar BOOLEAN DEFAULT 0,
    pode_deletar BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(cargo, rota)
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela permissoes_cargo:', err.message);
    } else {
      console.log('✅ Tabela permissoes_cargo criada/verificada');
    }
  });

  // Tabela de sessões ativas
  db.run(`CREATE TABLE IF NOT EXISTS sessoes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expira_em DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
  )`, (err) => {
    if (err) {
      console.error('❌ Erro ao criar tabela sessoes:', err.message);
    } else {
      console.log('✅ Tabela sessoes criada/verificada');
    }
  });

  // As categorias serão inseridas pelo seed de dados

  console.log('🎯 Banco de dados configurado com sucesso!');
}

// Função para executar queries
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
}

// Função para executar uma única query
function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ id: this.lastID, changes: this.changes });
      }
    });
  });
}

// Função para obter uma única linha
function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

module.exports = {
  db,
  query,
  run,
  get
};
