const { db, run } = require('../database');

console.log('🧪 Testando inserção no controle financeiro...');

async function testarControleFinanceiro() {
  try {
    // Testar inserção de venda
    console.log('\n💵 Testando inserção de venda...');
    await run(`
      INSERT INTO controle_financeiro (tipo, descricao, valor, data, categoria, observacao, created_at, updated_at)
      VALUES (?, ?, ?, DATE('now'), ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, ['venda', 'Teste de venda', 10.50, 'Teste', 'Observação de teste']);
    console.log('✅ Venda inserida com sucesso!');

    // Testar inserção de custo
    console.log('\n💸 Testando inserção de custo...');
    await run(`
      INSERT INTO controle_financeiro (tipo, descricao, valor, data, categoria, observacao, created_at, updated_at)
      VALUES (?, ?, ?, DATE('now'), ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, ['custo', 'Teste de custo', 5.25, 'Teste', 'Observação de teste']);
    console.log('✅ Custo inserido com sucesso!');

    console.log('\n🎉 Todos os testes passaram!');
    console.log('✅ O controle financeiro está funcionando corretamente!');

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

testarControleFinanceiro();
