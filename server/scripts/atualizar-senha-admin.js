const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

async function atualizarSenha() {
  try {
    console.log('🔐 Atualizando senha do usuário admin...');
    
    const novaSenhaHash = await bcrypt.hash('123456', 10);
    
    const stmt = db.prepare(`
      UPDATE usuarios 
      SET senha_hash = ?, updated_at = CURRENT_TIMESTAMP
      WHERE username = ?
    `);
    
    stmt.run([novaSenhaHash, 'admin'], function(err) {
      if (err) {
        console.error('❌ Erro ao atualizar senha:', err);
      } else {
        if (this.changes > 0) {
          console.log('✅ Senha atualizada com sucesso!');
          console.log('🔑 Nova senha: 123456');
          console.log('📋 Linhas afetadas:', this.changes);
        } else {
          console.log('⚠️ Nenhuma linha foi atualizada');
        }
      }
      stmt.finalize();
      db.close();
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    db.close();
  }
}

atualizarSenha();
