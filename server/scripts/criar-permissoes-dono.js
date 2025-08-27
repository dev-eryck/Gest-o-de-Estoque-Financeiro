const { run, get, query } = require('../database');

async function criarPermissoesDono() {
  try {
    console.log('👑 Criando permissões para o cargo DONO...\n');
    
    // Verificar se já existem permissões para dono
    const permissoesDono = await query('SELECT * FROM permissoes_cargo WHERE cargo = ?', ['dono']);
    
    if (permissoesDono.length > 0) {
      console.log('⚠️ Permissões para DONO já existem!');
      console.log('📝 Permissões encontradas:');
      permissoesDono.forEach((p, index) => {
        console.log(`  ${index + 1}. ${p.rota}: L:${p.pode_ler} C:${p.pode_criar} E:${p.pode_editar} D:${p.pode_deletar}`);
      });
      return;
    }
    
    console.log('➕ Criando permissões para DONO...');
    
    // Lista de todas as rotas do sistema
    const rotas = [
      'dashboard',
      'produtos', 
      'funcionarios',
      'estoque',
      'vendas',
      'relatorios',
      'categorias',
      'controle_financeiro',
      'configuracoes',
      'notificacoes'
    ];
    
    // Criar permissões com acesso total (1,1,1,1)
    for (const rota of rotas) {
      await run(
        'INSERT INTO permissoes_cargo (cargo, rota, pode_ler, pode_criar, pode_editar, pode_deletar) VALUES (?, ?, ?, ?, ?, ?)',
        ['dono', rota, 1, 1, 1, 1]
      );
      console.log(`✅ Permissão criada: ${rota}`);
    }
    
    console.log('\n🎉 Permissões para DONO criadas com sucesso!');
    
    // Verificar permissões criadas
    const permissoesCriadas = await query('SELECT * FROM permissoes_cargo WHERE cargo = ? ORDER BY rota', ['dono']);
    console.log(`📋 Total de permissões para DONO: ${permissoesCriadas.length}`);
    
    permissoesCriadas.forEach((p, index) => {
      console.log(`  ${index + 1}. ${p.rota}: L:${p.pode_ler} C:${p.pode_criar} E:${p.pode_editar} D:${p.pode_deletar}`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar permissões:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  criarPermissoesDono().then(() => {
    console.log('\n🏁 Script finalizado');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { criarPermissoesDono };
