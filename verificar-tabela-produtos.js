const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.join(__dirname, 'server/database.sqlite');

console.log('🔍 Caminho do banco:', dbPath);

const db = new sqlite3.Database(dbPath);

function verificarTabelaProdutos() {
  console.log('🔐 Verificando tabela produtos...');
  
  // Verificar estrutura da tabela produtos
  db.all("PRAGMA table_info(produtos)", (err, rows) => {
    if (err) {
      console.error('❌ Erro ao verificar produtos:', err);
    } else {
      console.log('📋 Estrutura da tabela produtos:');
      rows.forEach(row => {
        console.log(`  - ${row.name} (${row.type}) - NotNull: ${row.notnull}, Default: ${row.dflt_value}`);
      });
      
      // Verificar dados existentes
      console.log('\n📊 Dados existentes:');
      db.get("SELECT COUNT(*) as total FROM produtos", (err, row) => {
        if (err) {
          console.error('❌ Erro ao contar produtos:', err);
        } else {
          console.log(`  - Total de produtos: ${row.total}`);
          
          // Verificar se há produtos
          if (row.total > 0) {
            db.get("SELECT * FROM produtos LIMIT 1", (err, produto) => {
              if (err) {
                console.error('❌ Erro ao buscar produto:', err);
              } else {
                console.log('  - Exemplo de produto:', produto);
              }
              db.close();
            });
          } else {
            console.log('  - Nenhum produto encontrado');
            db.close();
          }
        }
      });
    }
  });
}

verificarTabelaProdutos();
