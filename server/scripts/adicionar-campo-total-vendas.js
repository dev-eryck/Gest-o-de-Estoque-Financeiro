const { db, run } = require('../database');

console.log('🔧 Adicionando campo total à tabela vendas...');

async function adicionarCampoTotal() {
  try {
    // Adicionar campo total
    await run('ALTER TABLE vendas ADD COLUMN total DECIMAL(10,2)');
    console.log('✅ Campo total adicionado com sucesso!');
    
    // Atualizar vendas existentes com o valor total calculado
    await run(`
      UPDATE vendas 
      SET total = quantidade * preco_unitario 
      WHERE total IS NULL
    `);
    console.log('✅ Valores totais calculados para vendas existentes!');
    
    console.log('✅ Operação concluída com sucesso!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

adicionarCampoTotal();
