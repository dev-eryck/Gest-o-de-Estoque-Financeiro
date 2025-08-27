const { db, run, query } = require('../database');

console.log('🔧 Corrigindo estrutura da tabela produtos...');

async function corrigirEstrutura() {
  try {
    // Verificar campos existentes
    const columns = await query('PRAGMA table_info(produtos)');
    const hasPreco = columns.some(col => col.name === 'preco');
    const hasPrecoVenda = columns.some(col => col.name === 'preco_venda');
    const hasPrecoCusto = columns.some(col => col.name === 'preco_custo');

    console.log('📊 Campos encontrados:');
    columns.forEach(col => {
      console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'}`);
    });

    if (hasPreco) {
      console.log('🔄 Removendo campo preco antigo...');
      // Criar tabela temporária
      await run(`
        CREATE TABLE produtos_temp (
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

      // Remover tabela antiga
      await run('DROP TABLE produtos');
      
      // Renomear tabela temporária
      await run('ALTER TABLE produtos_temp RENAME TO produtos');
      
      console.log('✅ Estrutura corrigida!');
    } else {
      console.log('✅ Estrutura já está correta!');
    }

    // Verificar estrutura final
    const finalColumns = await query('PRAGMA table_info(produtos)');
    console.log('\n📊 Estrutura final da tabela produtos:');
    finalColumns.forEach(col => {
      console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'}`);
    });

    console.log('\n🎯 Tabela produtos pronta para uso!');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir estrutura:', error);
  } finally {
    process.exit(0);
  }
}

corrigirEstrutura();
