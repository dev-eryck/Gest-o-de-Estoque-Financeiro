const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

async function inserirAdmin() {
  try {
    console.log('🔐 Inserindo usuário administrador...');
    
    const senhaHash = await bcrypt.hash('123456', 10);
    
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO funcionarios (nome, email, senha, cargo, telefone, data_contratacao, permissoes)
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
        console.error('❌ Erro:', err);
      } else {
        console.log('✅ Usuário administrador criado!');
        console.log('📋 ID:', this.lastID);
      }
      stmt.finalize();
      db.close();
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    db.close();
  }
}

inserirAdmin();
