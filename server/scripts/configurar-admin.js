const { run, get, query } = require('../database');
const bcrypt = require('bcryptjs');

async function configurarAdmin() {
  try {
    console.log('👑 Configurando perfil do administrador...');
    
    // Buscar usuário admin existente
    const admin = await get('SELECT * FROM usuarios WHERE cargo = "dono" LIMIT 1');
    
    if (!admin) {
      console.log('❌ Usuário administrador não encontrado!');
      console.log('💡 Crie primeiro um usuário com cargo "dono"');
      return;
    }
    
    console.log(`📋 Administrador encontrado: ${admin.username} (${admin.nome_completo || 'Nome não definido'})`);
    
    // Atualizar nome completo se estiver vazio
    if (!admin.nome_completo || admin.nome_completo.trim() === '') {
      const novoNome = 'Administrador BAR DO CARNEIRO';
      await run('UPDATE usuarios SET nome_completo = ? WHERE id = ?', [novoNome, admin.id]);
      console.log(`✅ Nome atualizado para: ${novoNome}`);
    }
    
    // Atualizar email se estiver vazio
    if (!admin.email || admin.email.trim() === '') {
      const novoEmail = 'admin@bardocarneiro.com';
      await run('UPDATE usuarios SET email = ? WHERE id = ?', [novoEmail, admin.id]);
      console.log(`✅ Email atualizado para: ${novoEmail}`);
    }
    
    // Buscar administrador atualizado
    const adminAtualizado = await get('SELECT * FROM usuarios WHERE id = ?', [admin.id]);
    
    console.log('\n🎯 Perfil do administrador configurado:');
    console.log(`  👤 Nome: ${adminAtualizado.nome_completo}`);
    console.log(`  📧 Email: ${adminAtualizado.email}`);
    console.log(`  🔑 Username: ${adminAtualizado.username}`);
    console.log(`  👑 Cargo: ${adminAtualizado.cargo}`);
    
    console.log('\n💡 Para alterar a senha, use a funcionalidade de perfil no sistema');
    console.log('💡 Para alterar o nome, use a funcionalidade de perfil no sistema');
    
  } catch (error) {
    console.error('❌ Erro ao configurar administrador:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  configurarAdmin().then(() => {
    console.log('🏁 Script finalizado');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { configurarAdmin };
