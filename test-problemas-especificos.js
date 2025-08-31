const axios = require('axios');

async function testarProblemasEspecificos() {
  try {
    console.log('🧪 Testando problemas específicos...');
    
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
    
    // 2. Testar rotas problemáticas
    const rotasProblematicas = [
      { nome: 'Dashboard', url: '/api/dashboard' },
      { nome: 'Produtos', url: '/api/produtos' },
      { nome: 'Vendas', url: '/api/vendas' },
      { nome: 'Relatórios', url: '/api/relatorios' },
      { nome: 'Controle Financeiro', url: '/api/controle_financeiro' }
    ];
    
    console.log('2️⃣ Testando rotas problemáticas...');
    
    for (const rota of rotasProblematicas) {
      try {
        const response = await axios.get(`https://gest-o-de-estoque-financeiro-production.up.railway.app${rota.url}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          const total = response.data.data?.length || 0;
          console.log(`✅ ${rota.nome}: ${total} registros`);
        } else {
          console.log(`❌ ${rota.nome}: ${response.data.message || 'Erro'}`);
        }
        
      } catch (error) {
        console.log(`❌ ${rota.nome}: ${error.response?.status || 'Erro'} - ${error.response?.data?.message || error.message}`);
        
        // Mostrar detalhes do erro
        if (error.response?.data) {
          console.log(`   Detalhes:`, error.response.data);
        }
      }
    }
    
    // 3. Testar rota de dashboard especificamente
    console.log('3️⃣ Testando dashboard especificamente...');
    try {
      const dashboardResponse = await axios.get('https://gest-o-de-estoque-financeiro-production.up.railway.app/api/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Dashboard:', dashboardResponse.data);
      
    } catch (error) {
      console.log('❌ Erro no dashboard:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data?.error
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testarProblemasEspecificos();
