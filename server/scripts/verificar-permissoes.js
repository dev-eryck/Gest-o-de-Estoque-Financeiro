const { run, get, query } = require('../database');

async function verificarPermissoes() {
  try {
    console.log('🔍 Verificando permissões do sistema...\n');
    
    // 1. Verificar usuários
    console.log('='.repeat(50));
    console.log('👥 USUÁRIOS');
    console.log('='.repeat(50));
    
    const usuarios = await query('SELECT id, username, nome_completo, cargo FROM usuarios');
    console.log(`📋 Total: ${usuarios.length}`);
    
    usuarios.forEach((u, index) => {
      console.log(`  ${index + 1}. ${u.username} (${u.nome_completo}) - ${u.cargo}`);
    });
    
    // 2. Verificar permissões por cargo
    console.log('\n' + '='.repeat(50));
    console.log('🔐 PERMISSÕES POR CARGO');
    console.log('='.repeat(50));
    
    const permissoes = await query('SELECT * FROM permissoes_cargo ORDER BY cargo, rota');
    console.log(`📋 Total: ${permissoes.length}`);
    
    if (permissoes.length === 0) {
      console.log('❌ Nenhuma permissão encontrada!');
      console.log('💡 Criando permissões padrão...');
      
      // Criar permissões padrão
      const permissoesPadrao = [
        // Dono - acesso total
        ['dono', 'dashboard', 1, 1, 1, 1],
        ['dono', 'produtos', 1, 1, 1, 1],
        ['dono', 'funcionarios', 1, 1, 1, 1],
        ['dono', 'estoque', 1, 1, 1, 1],
        ['dono', 'vendas', 1, 1, 1, 1],
        ['dono', 'relatorios', 1, 1, 1, 1],
        ['dono', 'categorias', 1, 1, 1, 1],
        ['dono', 'controle_financeiro', 1, 1, 1, 1],
        ['dono', 'configuracoes', 1, 1, 1, 1],
        ['dono', 'notificacoes', 1, 1, 1, 1],
        
        // Gerente - acesso amplo
        ['gerente', 'dashboard', 1, 1, 1, 0],
        ['gerente', 'produtos', 1, 1, 1, 0],
        ['gerente', 'funcionarios', 1, 1, 1, 0],
        ['gerente', 'estoque', 1, 1, 1, 0],
        ['gerente', 'vendas', 1, 1, 1, 0],
        ['gerente', 'relatorios', 1, 1, 0, 0],
        ['gerente', 'categorias', 1, 1, 1, 0],
        ['gerente', 'controle_financeiro', 1, 1, 0, 0],
        ['gerente', 'configuracoes', 1, 0, 0, 0],
        ['gerente', 'notificacoes', 1, 0, 0, 0],
        
        // Garçom - acesso limitado
        ['garcom', 'dashboard', 1, 0, 0, 0],
        ['garcom', 'vendas', 1, 1, 0, 0],
        ['garcom', 'produtos', 1, 0, 0, 0],
        
        // Caixa - acesso limitado
        ['caixa', 'dashboard', 1, 0, 0, 0],
        ['caixa', 'vendas', 1, 1, 0, 0],
        ['caixa', 'produtos', 1, 0, 0, 0],
        ['caixa', 'controle_financeiro', 1, 1, 0, 0],
        
        // Estoque - acesso específico
        ['estoque', 'dashboard', 1, 0, 0, 0],
        ['estoque', 'produtos', 1, 1, 1, 0],
        ['estoque', 'estoque', 1, 1, 1, 0],
        ['estoque', 'categorias', 1, 1, 0, 0]
      ];
      
      for (const [cargo, rota, ler, criar, editar, deletar] of permissoesPadrao) {
        await run(
          'INSERT INTO permissoes_cargo (cargo, rota, pode_ler, pode_criar, pode_editar, pode_deletar) VALUES (?, ?, ?, ?, ?, ?)',
          [cargo, rota, ler, criar, editar, deletar]
        );
      }
      
      console.log('✅ Permissões padrão criadas!');
      
      // Buscar permissões criadas
      const permissoesCriadas = await query('SELECT * FROM permissoes_cargo ORDER BY cargo, rota');
      console.log(`📋 Total de permissões: ${permissoesCriadas.length}`);
      
      permissoesCriadas.forEach((p, index) => {
        console.log(`  ${index + 1}. ${p.cargo} - ${p.rota}: L:${p.pode_ler} C:${p.pode_criar} E:${p.pode_editar} D:${p.pode_deletar}`);
      });
      
    } else {
      console.log('📝 Permissões encontradas:');
      permissoes.forEach((p, index) => {
        console.log(`  ${index + 1}. ${p.cargo} - ${p.rota}: L:${p.pode_ler} C:${p.pode_criar} E:${p.pode_editar} D:${p.pode_deletar}`);
      });
    }
    
    console.log('\n🎉 Verificação concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verificarPermissoes().then(() => {
    console.log('\n🏁 Script finalizado');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { verificarPermissoes };
