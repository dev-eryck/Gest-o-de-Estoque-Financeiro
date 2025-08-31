const axios = require('axios');

async function testarPermissoes() {
  try {
    console.log('🧪 Testando permissões do usuário eryck...');
    
    // 1. Fazer login
    console.log('1️⃣ Fazendo login...');
    const loginResponse = await axios.post('https://gest-o-de-estoque-financeiro-production.up.railway.app/api/auth/login', {
      username: 'eryck',
      senha: '300406'
    });
    
    if (!loginResponse.data.success) {
      console.log('❌ Login falhou:', loginResponse.data);
      return;
    }
    
    const token = loginResponse.data.data.token;
    console.log('✅ Login bem-sucedido, token obtido');
    
    // 2. Buscar permissões
    console.log('2️⃣ Buscando permissões...');
    try {
      const permissoesResponse = await axios.get('https://gest-o-de-estoque-financeiro-production.up.railway.app/api/auth/permissoes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Permissões obtidas:', permissoesResponse.data);
      
      // 3. Verificar se tem permissões para dashboard
      if (permissoesResponse.data.success && permissoesResponse.data.data.dashboard) {
        console.log('🎯 Usuário tem acesso ao dashboard!');
        console.log('📋 Permissões do dashboard:', permissoesResponse.data.data.dashboard);
      } else {
        console.log('❌ Usuário NÃO tem acesso ao dashboard');
        console.log('📋 Todas as permissões:', permissoesResponse.data.data);
      }
      
    } catch (error) {
      console.log('❌ Erro ao buscar permissões:', error.response?.data || error.message);
    }
    
    // 4. Testar acesso direto ao dashboard
    console.log('3️⃣ Testando acesso direto ao dashboard...');
    try {
      const dashboardResponse = await axios.get('https://gest-o-de-estoque-financeiro-production.up.railway.app/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Dashboard acessível, status:', dashboardResponse.status);
      
    } catch (error) {
      console.log('❌ Erro ao acessar dashboard:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testarPermissoes();
