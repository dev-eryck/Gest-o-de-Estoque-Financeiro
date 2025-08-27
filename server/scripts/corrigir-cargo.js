const { run, get, query } = require('../database');

async function corrigirCargo() {
  try {
    console.log('🔧 Corrigindo cargo do usuário...');
    
    // Listar todos os usuários
    const usuarios = await query('SELECT id, username, nome_completo, email, cargo FROM usuarios');
    console.log(`📋 Usuários encontrados: ${usuarios.length}`);
    
    usuarios.forEach(u => {
      console.log(`  - ID: ${u.id}, Username: ${u.username}, Nome: ${u.nome_completo || 'N/A'}, Cargo: ${u.cargo}`);
    });
    
    // Buscar usuário que precisa ser corrigido
    const usuarioParaCorrigir = await get('SELECT * FROM usuarios WHERE username = ? OR email LIKE ?', ['admin', '%admin%']);
    
    if (!usuarioParaCorrigir) {
      console.log('❌ Usuário admin não encontrado!');
      console.log('💡 Verifique se existe um usuário com username "admin" ou email contendo "admin"');
      return;
    }
    
    console.log(`\n📋 Usuário encontrado para correção:`);
    console.log(`  ID: ${usuarioParaCorrigir.id}`);
    console.log(`  Username: ${usuarioParaCorrigir.username}`);
    console.log(`  Nome: ${usuarioParaCorrigir.nome_completo || 'N/A'}`);
    console.log(`  Email: ${usuarioParaCorrigir.email || 'N/A'}`);
    console.log(`  Cargo atual: ${usuarioParaCorrigir.cargo}`);
    
    // Corrigir cargo para 'dono'
    if (usuarioParaCorrigir.cargo !== 'dono') {
      await run('UPDATE usuarios SET cargo = ? WHERE id = ?', ['dono', usuarioParaCorrigir.id]);
      console.log(`✅ Cargo alterado de "${usuarioParaCorrigir.cargo}" para "dono"`);
    } else {
      console.log(`ℹ️ Usuário já tem cargo "dono"`);
    }
    
    // Atualizar nome se estiver vazio
    if (!usuarioParaCorrigir.nome_completo || usuarioParaCorrigir.nome_completo.trim() === '') {
      const novoNome = 'Administrador BAR DO CARNEIRO';
      await run('UPDATE usuarios SET nome_completo = ? WHERE id = ?', [novoNome, usuarioParaCorrigir.id]);
      console.log(`✅ Nome atualizado para: ${novoNome}`);
    }
    
    // Atualizar email se estiver vazio
    if (!usuarioParaCorrigir.email || usuarioParaCorrigir.email.trim() === '') {
      const novoEmail = 'admin@bardocarneiro.com';
      await run('UPDATE usuarios SET email = ? WHERE id = ?', [novoEmail, usuarioParaCorrigir.id]);
      console.log(`✅ Email atualizado para: ${novoEmail}`);
    }
    
    // Buscar usuário atualizado
    const usuarioAtualizado = await get('SELECT * FROM usuarios WHERE id = ?', [usuarioParaCorrigir.id]);
    
    console.log('\n🎯 Usuário corrigido com sucesso:');
    console.log(`  👤 Nome: ${usuarioAtualizado.nome_completo}`);
    console.log(`  📧 Email: ${usuarioAtualizado.email}`);
    console.log(`  🔑 Username: ${usuarioAtualizado.username}`);
    console.log(`  👑 Cargo: ${usuarioAtualizado.cargo}`);
    
    console.log('\n💡 Agora você pode:');
    console.log('  - Fazer login com este usuário');
    console.log('  - Usar a funcionalidade de perfil para alterar senha');
    console.log('  - Ter acesso total ao sistema como dono');
    
  } catch (error) {
    console.error('❌ Erro ao corrigir cargo:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  corrigirCargo().then(() => {
    console.log('🏁 Script finalizado');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { corrigirCargo };
