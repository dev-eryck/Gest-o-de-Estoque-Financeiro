const { db, query } = require('../database');

console.log('🔍 Verificando estrutura da tabela movimentacoes_estoque...');

async function verificarEstrutura() {
  try {
    const columns = await query('PRAGMA table_info(movimentacoes_estoque)');
    console.log('📊 Estrutura da tabela movimentacoes_estoque:');
    columns.forEach(col => {
      console.log(`   ${col.name}: ${col.type} ${col.notnull ? 'NOT NULL' : 'NULL'}`);
    });
    
    console.log('✅ Verificação concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

verificarEstrutura();
