const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

// No Railway, o banco pode estar em um caminho diferente
const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../database.sqlite');

console.log('🔍 Caminho do banco:', dbPath);

// Conectar ao banco
const db = new sqlite3.Database(dbPath);

async function criarAdminRailway() {
  try {
    console.log('🔐 Criando usuário administrador no Railway...');
    
    const senhaHash = await bcrypt.hash('123456', 10);
    
    // Verificar se a tabela usuarios existe
    db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='usuarios'", (err, row) => {
      if (err) {
        console.error('❌ Erro ao verificar tabela:', err);
        return;
      }
      
      if (!row) {
        console.log('📭 Tabela usuarios não existe!');
        console.log('🔧 Criando tabela usuarios...');
        
        db.run(`
          CREATE TABLE usuarios (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha_hash TEXT NOT NULL,
            nome_completo TEXT NOT NULL,
            cargo TEXT NOT NULL,
            ativo INTEGER DEFAULT 1,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT DEFAULT CURRENT_TIMESTAMP
          )
        `, (err) => {
          if (err) {
            console.error('❌ Erro ao criar tabela:', err);
            return;
          }
          console.log('✅ Tabela usuarios criada!');
          inserirUsuario();
        });
      } else {
        console.log('✅ Tabela usuarios já existe!');
        inserirUsuario();
      }
    });
    
    function inserirUsuario() {
      // Verificar se o usuário admin já existe
      db.get("SELECT id FROM usuarios WHERE username = ?", ['admin'], (err, row) => {
        if (err) {
          console.error('❌ Erro ao verificar usuário:', err);
          return;
        }
        
        if (row) {
          console.log('⚠️ Usuário admin já existe!');
          console.log('🔧 Atualizando senha...');
          
          // Atualizar senha
          const stmt = db.prepare(`
            UPDATE usuarios 
            SET senha_hash = ?, updated_at = CURRENT_TIMESTAMP
            WHERE username = ?
          `);
          
          stmt.run([senhaHash, 'admin'], function(err) {
            if (err) {
              console.error('❌ Erro ao atualizar senha:', err);
            } else {
              console.log('✅ Senha atualizada com sucesso!');
              console.log('🔑 Nova senha: 123456');
            }
            stmt.finalize();
            db.close();
          });
        } else {
          // Inserir usuário administrador
          const stmt = db.prepare(`
            INSERT INTO usuarios (username, email, senha_hash, nome_completo, cargo, ativo)
            VALUES (?, ?, ?, ?, ?, ?)
          `);
          
          stmt.run([
            'admin',
            'admin@barcarneiro.com',
            senhaHash,
            'Administrador Sistema',
            'dono',
            1
          ], function(err) {
            if (err) {
              console.error('❌ Erro ao inserir usuário:', err);
            } else {
              console.log('✅ Usuário administrador criado com sucesso!');
              console.log('📋 ID:', this.lastID);
              console.log('🔑 Login: admin');
              console.log('🔑 Senha: 123456');
            }
            stmt.finalize();
            db.close();
          });
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
    db.close();
  }
}

// Executar função
criarAdminRailway();
