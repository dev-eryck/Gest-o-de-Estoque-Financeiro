const { db, run } = require('./database');
const seedData = require('./seed-data');

console.log('🚀 Configurando banco de dados do BAR DO CARNEIRO...');

async function setupDatabase() {
  try {
    // Aguardar um pouco para garantir que as tabelas foram criadas
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✅ Banco de dados configurado com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('   - produtos');
    console.log('   - funcionarios');
    console.log('   - vendas');
    console.log('   - movimentacoes_estoque');
    console.log('   - categorias');
    
    // Executar seed de dados
    console.log('\n🌱 Executando seed de dados...');
    await seedData();
    
    console.log('\n🎯 Sistema pronto para uso!');
    console.log('📱 Execute "npm run dev" para iniciar o servidor e cliente');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error);
    process.exit(1);
  }
}

setupDatabase();
