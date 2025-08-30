const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

async function testarLogin() {
  try {
    console.log('🔐 Testando login do usuário admin...');
    
    // Buscar usuário admin
    db.get("SELECT * FROM usuarios WHERE username = ?", ['admin'], async (err, user) => {
      if (err) {
        console.error('❌ Erro ao buscar usuário:', err);
        return;
      }
      
      if (!user) {
        console.log('❌ Usuário admin não encontrado!');
        return;
      }
      
      console.log('✅ Usuário encontrado:');
      console.log(`   ID: ${user.id}`);
      console.log(`   Username: ${user.username}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Nome: ${user.nome_completo}`);
      console.log(`   Cargo: ${user.cargo}`);
      console.log(`   Ativo: ${user.ativo ? 'Sim' : 'Não'}`);
      
      // Testar senha
      const senhaTeste = '123456';
      const senhaCorreta = await bcrypt.compare(senhaTeste, user.senha_hash);
      
      if (senhaCorreta) {
        console.log('✅ Senha correta!');
        console.log('🔑 Login: admin');
        console.log('🔑 Senha: 123456');
      } else {
        console.log('❌ Senha incorreta!');
        console.log('🔑 A senha atual não é "123456"');
      }
      
      db.close();
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    db.close();
  }
}

testarLogin();
