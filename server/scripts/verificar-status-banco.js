const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// No Railway, o banco pode estar em um caminho diferente
const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../database.sqlite');

console.log('🔍 Verificando status do banco de dados...');
console.log('📁 Caminho do banco:', dbPath);

// Conectar ao banco
const db = new sqlite3.Database(dbPath);

// Verificar se conseguimos conectar
db.get("SELECT sqlite_version() as version", (err, row) => {
  if (err) {
    console.error('❌ Erro ao conectar ao banco:', err);
    return;
  }
  
  console.log('✅ Conectado ao banco SQLite versão:', row.version);
  
  // Verificar tabelas existentes
  db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
    if (err) {
      console.error('❌ Erro ao listar tabelas:', err);
      return;
    }
    
    console.log('📋 Tabelas encontradas:', tables.length);
    tables.forEach(table => {
      console.log(`   - ${table.name}`);
    });
    
    // Verificar se a tabela usuarios existe
    if (tables.some(t => t.name === 'usuarios')) {
      console.log('✅ Tabela usuarios existe!');
      
      // Verificar usuários
      db.all("SELECT id, username, email, cargo, ativo FROM usuarios", (err, users) => {
        if (err) {
          console.error('❌ Erro ao buscar usuários:', err);
        } else {
          console.log(`👥 Usuários encontrados: ${users.length}`);
          users.forEach(user => {
            console.log(`   ID: ${user.id} | Username: ${user.username} | Email: ${user.email} | Cargo: ${user.cargo} | Ativo: ${user.ativo ? 'Sim' : 'Não'}`);
          });
        }
        db.close();
      });
    } else {
      console.log('❌ Tabela usuarios NÃO existe!');
      db.close();
    }
  });
});
