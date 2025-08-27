const { limparFuncionarios } = require('./limpar-funcionarios');
const { configurarAdmin } = require('./configurar-admin');

async function executarScripts() {
  try {
    console.log('🚀 Iniciando scripts de limpeza e configuração...\n');
    
    // 1. Limpar funcionários
    console.log('='.repeat(50));
    console.log('🧹 ETAPA 1: LIMPEZA DOS FUNCIONÁRIOS');
    console.log('='.repeat(50));
    await limparFuncionarios();
    
    console.log('\n');
    
    // 2. Configurar administrador
    console.log('='.repeat(50));
    console.log('👑 ETAPA 2: CONFIGURAÇÃO DO ADMINISTRADOR');
    console.log('='.repeat(50));
    await configurarAdmin();
    
    console.log('\n');
    console.log('🎉 Todos os scripts foram executados com sucesso!');
    console.log('\n📋 RESUMO:');
    console.log('  ✅ Funcionários foram removidos do banco');
    console.log('  ✅ Perfil do administrador foi configurado');
    console.log('  💡 Agora você pode:');
    console.log('     - Fazer login com seu usuário admin');
    console.log('     - Usar a funcionalidade de perfil para alterar nome/senha');
    console.log('     - Criar novos funcionários quando necessário');
    
  } catch (error) {
    console.error('❌ Erro durante execução dos scripts:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  executarScripts().then(() => {
    console.log('\n🏁 Scripts finalizados');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { executarScripts };
