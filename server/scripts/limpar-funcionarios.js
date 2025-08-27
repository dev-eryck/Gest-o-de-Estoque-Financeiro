const { run, query } = require('../database');

async function limparFuncionarios() {
  try {
    console.log('🧹 Iniciando limpeza dos funcionários...');
    
    // Listar funcionários existentes
    const funcionarios = await query('SELECT id, nome, cargo FROM funcionarios');
    console.log(`📋 Funcionários encontrados: ${funcionarios.length}`);
    
    if (funcionarios.length > 0) {
      console.log('📝 Funcionários:');
      funcionarios.forEach(f => console.log(`  - ID: ${f.id}, Nome: ${f.nome}, Cargo: ${f.cargo}`));
      
      // Deletar todos os funcionários
      const result = await run('DELETE FROM funcionarios');
      console.log(`✅ Funcionários deletados: ${result.changes}`);
    } else {
      console.log('ℹ️ Nenhum funcionário encontrado para deletar');
    }
    
    console.log('🎯 Limpeza concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao limpar funcionários:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  limparFuncionarios().then(() => {
    console.log('🏁 Script finalizado');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { limparFuncionarios };
