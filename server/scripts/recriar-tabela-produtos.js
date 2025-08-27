const { db, run, query } = require('../database');

console.log('🔄 Recriando tabela produtos com nova estrutura...');

async function recriarTabelaProdutos() {
  try {
    // Verificar se a tabela existe
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='produtos'");
    
    if (tableExists) {
      console.log('🗑️ Removendo tabela produtos existente...');
      await run('DROP TABLE produtos');
      console.log('✅ Tabela removida.');
    }

    // Criar nova tabela com estrutura correta
    console.log('➕ Criando nova tabela produtos...');
    await run(`
      CREATE TABLE produtos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL,
        descricao TEXT,
        preco_venda DECIMAL(10,2) NOT NULL,
        preco_custo DECIMAL(10,2) NOT NULL,
        quantidade INTEGER DEFAULT 0,
        estoque_minimo INTEGER DEFAULT 5,
        categoria TEXT,
        fornecedor TEXT,
        codigo_barras TEXT UNIQUE,
        ativo BOOLEAN DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Nova tabela produtos criada com sucesso!');
    
    // Verificar estrutura
    const columns = await query("PRAGMA table_info(produtos)");
    console.log('📊 Estrutura da nova tabela:');
    columns.forEach(col => {
      console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('🎯 Tabela produtos pronta para uso!');
    
  } catch (error) {
    console.error('❌ Erro ao recriar tabela:', error);
  } finally {
    process.exit(0);
  }
}

recriarTabelaProdutos();
