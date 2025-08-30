const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando tabela sessoes...');

db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='sessoes'", (err, row) => {
  if (err) {
    console.error('❌ Erro ao verificar tabela:', err);
  } else if (!row) {
    console.log('📭 Tabela sessoes não existe!');
    console.log('🔧 Criando tabela sessoes...');
    
    db.run(`
      CREATE TABLE sessoes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        usuario_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expira_em TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (usuario_id) REFERENCES usuarios (id)
      )
    `, (err) => {
      if (err) {
        console.error('❌ Erro ao criar tabela:', err);
      } else {
        console.log('✅ Tabela sessoes criada com sucesso!');
      }
      db.close();
    });
  } else {
    console.log('✅ Tabela sessoes já existe!');
    db.close();
  }
});
