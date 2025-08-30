const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔍 Verificando senha atual do usuário admin...');

db.get("SELECT username, senha_hash FROM usuarios WHERE username = ?", ['admin'], (err, user) => {
  if (err) {
    console.error('❌ Erro:', err);
  } else if (!user) {
    console.log('❌ Usuário admin não encontrado!');
  } else {
    console.log('✅ Usuário encontrado:');
    console.log(`   Username: ${user.username}`);
    console.log(`   Hash da senha: ${user.senha_hash}`);
    console.log(`   Hash começa com: ${user.senha_hash.substring(0, 20)}...`);
    
    // Verificar se é a senha do seed (admin123)
    if (user.senha_hash.includes('$2b$12$')) {
      console.log('🔑 A senha atual é: admin123 (do seed)');
    } else {
      console.log('🔑 Senha desconhecida');
    }
  }
  db.close();
});
