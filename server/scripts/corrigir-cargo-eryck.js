const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../database.sqlite');

console.log('🔍 Caminho do banco:', dbPath);

const db = new sqlite3.Database(dbPath);

async function corrigirCargoEryck() {
  try {
    console.log('🔐 Corrigindo cargo do usuário eryck...');
    
    // Atualizar cargo para 'gerente'
    db.run('UPDATE usuarios SET cargo = ? WHERE username = ?', ['gerente', 'eryck'], function(err) {
      if (err) {
        console.error('❌ Erro ao atualizar cargo:', err);
        db.close();
        return;
      }
      
      if (this.changes > 0) {
        console.log('✅ Cargo atualizado com sucesso!');
        console.log('👤 Usuário eryck agora é gerente');
        
        // Verificar se foi atualizado
        db.get('SELECT id, username, cargo FROM usuarios WHERE username = ?', ['eryck'], (err, usuario) => {
          if (err) {
            console.error('❌ Erro ao verificar usuário:', err);
          } else {
            console.log('📋 Usuário atualizado:', usuario);
          }
          db.close();
        });
      } else {
        console.log('⚠️ Nenhuma alteração feita');
        db.close();
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    db.close();
  }
}

corrigirCargoEryck();
