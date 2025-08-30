const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// Caminho para o banco de dados
const dbPath = path.join(__dirname, '../database.sqlite');

// Conectar ao banco
const db = new sqlite3.Database(dbPath);

async function criarUsuarioAdmin() {
  try {
    console.log('🔐 Criando usuário administrador...');
    
    // Hash da senha
    const senhaHash = await bcrypt.hash('123456', 10);
    
    // Verificar se a tabela funcionarios existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='funcionarios'", (err, row) => {
      if (err) {
        console.error('❌ Erro ao verificar tabela:', err);
        return;
      }
      
      if (!row) {
        console.log('📋 Criando tabela funcionarios...');
        
        db.run(`
          CREATE TABLE funcionarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL,
            cargo TEXT NOT NULL,
            telefone TEXT,
            data_contratacao TEXT NOT NULL,
            status TEXT DEFAULT 'ativo',
            permissoes TEXT DEFAULT '{}',
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('❌ Erro ao criar tabela:', err);
            return;
          }
          console.log('✅ Tabela funcionarios criada!');
          inserirUsuario();
        });
      } else {
        console.log('✅ Tabela funcionarios já existe!');
        inserirUsuario();
      }
    });
    
    function inserirUsuario() {
      // Verificar se o usuário admin já existe
      db.get("SELECT id FROM funcionarios WHERE email = ?", ['admin@barcarneiro.com'], (err, row) => {
        if (err) {
          console.error('❌ Erro ao verificar usuário:', err);
          return;
        }
        
        if (row) {
          console.log('⚠️ Usuário admin já existe!');
          db.close();
          return;
        }
        
        // Inserir usuário administrador
        const stmt = db.prepare(`
          INSERT INTO funcionarios (nome, email, senha, cargo, telefone, data_contratacao, permissoes)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `);
        
        const permissoes = JSON.stringify({
          dashboard: true,
          produtos: true,
          vendas: true,
          funcionarios: true,
          estoque: true,
          relatorios: true,
          categorias: true,
          controle_financeiro: true,
          configuracao: true,
          notificacoes: true
        });
        
        stmt.run([
          'Administrador',
          'admin@barcarneiro.com',
          senhaHash,
          'Administrador',
          '(11) 99999-9999',
          new Date().toISOString().split('T')[0],
          permissoes
        ], function(err) {
          if (err) {
            console.error('❌ Erro ao inserir usuário:', err);
          } else {
            console.log('✅ Usuário administrador criado com sucesso!');
            console.log('📋 ID:', this.lastID);
          }
          stmt.finalize();
          db.close();
        });
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
    db.close();
  }
}

// Executar função
criarUsuarioAdmin();
