const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando usuários no banco...');

db.all("SELECT id, nome, email, cargo FROM funcionarios", (err, rows) => {
  if (err) {
    console.error('❌ Erro:', err);
  } else {
    if (rows.length === 0) {
      console.log('📭 Nenhum usuário encontrado!');
    } else {
      console.log(`✅ ${rows.length} usuário(s) encontrado(s):`);
      rows.forEach(user => {
        console.log(`   ID: ${user.id} | Nome: ${user.nome} | Email: ${user.email} | Cargo: ${user.cargo}`);
      });
    }
  }
  db.close();
});
