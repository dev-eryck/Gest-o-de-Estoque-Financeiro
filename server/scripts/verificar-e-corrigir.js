const { run, get, query } = require('../database');

async function verificarECorrigir() {
  try {
    console.log('🔍 Verificando e corrigindo problemas do sistema...\n');
    
    // 1. Verificar usuários existentes
    console.log('='.repeat(60));
    console.log('👥 ETAPA 1: VERIFICAÇÃO DOS USUÁRIOS');
    console.log('='.repeat(60));
    
    const usuarios = await query('SELECT id, username, nome_completo, email, cargo, ativo FROM usuarios');
    console.log(`📋 Total de usuários: ${usuarios.length}`);
    
    if (usuarios.length === 0) {
      console.log('❌ Nenhum usuário encontrado!');
      console.log('💡 Crie primeiro um usuário administrador');
      return;
    }
    
    usuarios.forEach((u, index) => {
      console.log(`  ${index + 1}. ID: ${u.id}, Username: ${u.username}, Nome: ${u.nome_completo || 'N/A'}, Cargo: ${u.cargo}, Ativo: ${u.ativo}`);
    });
    
    // 2. Verificar se há usuário com cargo 'dono'
    const dono = usuarios.find(u => u.cargo === 'dono');
    if (!dono) {
      console.log('\n⚠️ Nenhum usuário com cargo "dono" encontrado!');
      console.log('🔧 Corrigindo cargo do primeiro usuário para "dono"...');
      
      const primeiroUsuario = usuarios[0];
      await run('UPDATE usuarios SET cargo = ? WHERE id = ?', ['dono', primeiroUsuario.id]);
      console.log(`✅ Cargo do usuário "${primeiroUsuario.username}" alterado para "dono"`);
      
      // Buscar usuário atualizado
      const usuarioAtualizado = await get('SELECT * FROM usuarios WHERE id = ?', [primeiroUsuario.id]);
      console.log(`📋 Usuário atualizado: ${usuarioAtualizado.username} (${usuarioAtualizado.cargo})`);
    } else {
      console.log(`\n✅ Usuário com cargo "dono" encontrado: ${dono.username}`);
    }
    
    // 3. Verificar e corrigir nomes vazios
    console.log('\n' + '='.repeat(60));
    console.log('✏️ ETAPA 2: CORREÇÃO DOS NOMES');
    console.log('='.repeat(60));
    
    const usuariosSemNome = usuarios.filter(u => !u.nome_completo || u.nome_completo.trim() === '');
    if (usuariosSemNome.length > 0) {
      console.log(`📝 Usuários sem nome: ${usuariosSemNome.length}`);
      
      for (const usuario of usuariosSemNome) {
        let novoNome;
        if (usuario.cargo === 'dono') {
          novoNome = 'Administrador BAR DO CARNEIRO';
        } else {
          novoNome = `Usuário ${usuario.username}`;
        }
        
        await run('UPDATE usuarios SET nome_completo = ? WHERE id = ?', [novoNome, usuario.id]);
        console.log(`✅ Nome do usuário "${usuario.username}" atualizado para: "${novoNome}"`);
      }
    } else {
      console.log('✅ Todos os usuários já têm nomes definidos');
    }
    
    // 4. Verificar e corrigir emails vazios
    console.log('\n' + '='.repeat(60));
    console.log('📧 ETAPA 3: CORREÇÃO DOS EMAILS');
    console.log('='.repeat(60));
    
    const usuariosSemEmail = usuarios.filter(u => !u.email || u.email.trim() === '');
    if (usuariosSemEmail.length > 0) {
      console.log(`📧 Usuários sem email: ${usuariosSemEmail.length}`);
      
      for (const usuario of usuariosSemEmail) {
        let novoEmail;
        if (usuario.cargo === 'dono') {
          novoEmail = 'admin@bardocarneiro.com';
        } else {
          novoEmail = `${usuario.username}@bardocarneiro.com`;
        }
        
        await run('UPDATE usuarios SET email = ? WHERE id = ?', [novoEmail, usuario.id]);
        console.log(`✅ Email do usuário "${usuario.username}" atualizado para: "${novoEmail}"`);
      }
    } else {
      console.log('✅ Todos os usuários já têm emails definidos');
    }
    
    // 5. Verificar funcionários
    console.log('\n' + '='.repeat(60));
    console.log('🧹 ETAPA 4: VERIFICAÇÃO DOS FUNCIONÁRIOS');
    console.log('='.repeat(60));
    
    const funcionarios = await query('SELECT id, nome, cargo FROM funcionarios');
    console.log(`📋 Total de funcionários: ${funcionarios.length}`);
    
    if (funcionarios.length > 0) {
      console.log('📝 Funcionários encontrados:');
      funcionarios.forEach((f, index) => {
        console.log(`  ${index + 1}. ID: ${f.id}, Nome: ${f.nome}, Cargo: ${f.cargo}`);
      });
      
      console.log('\n🧹 Removendo funcionários...');
      const result = await run('DELETE FROM funcionarios');
      console.log(`✅ Funcionários removidos: ${result.changes}`);
    } else {
      console.log('✅ Nenhum funcionário encontrado para remover');
    }
    
    // 6. Relatório final
    console.log('\n' + '='.repeat(60));
    console.log('🎯 RELATÓRIO FINAL');
    console.log('='.repeat(60));
    
    const usuariosFinais = await query('SELECT id, username, nome_completo, email, cargo, ativo FROM usuarios');
    console.log('👥 Usuários finais:');
    usuariosFinais.forEach((u, index) => {
      console.log(`  ${index + 1}. ${u.username} (${u.nome_completo}) - ${u.cargo} - ${u.email}`);
    });
    
    console.log('\n🎉 Sistema verificado e corrigido com sucesso!');
    console.log('\n💡 Próximos passos:');
    console.log('  1. Faça login com seu usuário administrador');
    console.log('  2. Use a funcionalidade de perfil para alterar senha');
    console.log('  3. Crie novos funcionários quando necessário');
    console.log('  4. Configure as permissões do sistema');
    
  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verificarECorrigir().then(() => {
    console.log('\n🏁 Script finalizado');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Erro fatal:', error);
    process.exit(1);
  });
}

module.exports = { verificarECorrigir };
