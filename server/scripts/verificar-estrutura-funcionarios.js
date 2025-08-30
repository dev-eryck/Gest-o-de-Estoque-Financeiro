const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando estrutura da tabela funcionarios...');

db.all("PRAGMA table_info(funcionarios)", (err, rows) => {
  if (err) {
    console.error('❌ Erro:', err);
  } else {
    if (rows.length === 0) {
      console.log('📭 Tabela funcionarios não existe!');
    } else {
      console.log(`✅ Estrutura da tabela funcionarios:`);
      rows.forEach(col => {
        console.log(`   ${col.name} | ${col.type} | ${col.notnull ? 'NOT NULL' : 'NULL'} | ${col.pk ? 'PRIMARY KEY' : ''}`);
      });
    }
  }
  db.close();
});
