const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'server/database.sqlite');

console.log('🔍 Caminho do banco:', dbPath);

const db = new sqlite3.Database(dbPath);

function verificarEstrutura() {
  console.log('🔐 Verificando estrutura das tabelas...');
  
  // Verificar estrutura da tabela produtos
  db.all("PRAGMA table_info(produtos)", (err, rows) => {
    if (err) {
      console.error('❌ Erro ao verificar produtos:', err);
    } else {
      console.log('📋 Estrutura da tabela produtos:');
      rows.forEach(row => {
        console.log(`  - ${row.name} (${row.type})`);
      });
    }
    
    // Verificar estrutura da tabela funcionarios
    db.all("PRAGMA table_info(funcionarios)", (err, rows) => {
      if (err) {
        console.error('❌ Erro ao verificar funcionarios:', err);
      } else {
        console.log('📋 Estrutura da tabela funcionarios:');
        rows.forEach(row => {
          console.log(`  - ${row.name} (${row.type})`);
        });
      }
      
      // Verificar estrutura da tabela vendas
      db.all("PRAGMA table_info(vendas)", (err, rows) => {
        if (err) {
          console.error('❌ Erro ao verificar vendas:', err);
        } else {
          console.log('📋 Estrutura da tabela vendas:');
          rows.forEach(row => {
            console.log(`  - ${row.name} (${row.type})`);
          });
        }
        
        // Verificar dados existentes
        console.log('\n📊 Dados existentes:');
        
        db.get("SELECT COUNT(*) as total FROM produtos", (err, row) => {
          if (err) {
            console.error('❌ Erro ao contar produtos:', err);
          } else {
            console.log(`  - Produtos: ${row.total}`);
          }
          
          db.get("SELECT COUNT(*) as total FROM funcionarios", (err, row) => {
            if (err) {
              console.error('❌ Erro ao contar funcionarios:', err);
            } else {
              console.log(`  - Funcionários: ${row.total}`);
            }
            
            db.get("SELECT COUNT(*) as total FROM vendas", (err, row) => {
              if (err) {
                console.error('❌ Erro ao contar vendas:', err);
              } else {
                console.log(`  - Vendas: ${row.total}`);
              }
              
              db.close();
            });
          });
        });
      });
    });
  });
}

verificarEstrutura();
