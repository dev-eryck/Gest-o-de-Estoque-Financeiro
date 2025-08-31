const axios = require('axios');

async function testarRotasAPI() {
  try {
    console.log('🧪 Testando todas as rotas da API...');
    
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
    
    // 2. Testar rotas da API
    const rotas = [
      { nome: 'Dashboard', url: '/', metodo: 'GET' },
      { nome: 'Produtos', url: '/api/produtos', metodo: 'GET' },
      { nome: 'Vendas', url: '/api/vendas', metodo: 'GET' },
      { nome: 'Funcionários', url: '/api/funcionarios', metodo: 'GET' },
      { nome: 'Estoque', url: '/api/estoque', metodo: 'GET' },
      { nome: 'Categorias', url: '/api/categorias', metodo: 'GET' },
      { nome: 'Controle Financeiro', url: '/api/controle_financeiro', metodo: 'GET' },
      { nome: 'Relatórios', url: '/api/relatorios', metodo: 'GET' }
    ];
    
    console.log('2️⃣ Testando rotas da API...');
    
    for (const rota of rotas) {
      try {
        if (rota.metodo === 'GET') {
          const response = await axios.get(`https://gest-o-de-estoque-financeiro-production.up.railway.app${rota.url}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log(`✅ ${rota.nome}: Status ${response.status}`);
          
        } else if (rota.metodo === 'POST') {
          const response = await axios.post(`https://gest-o-de-estoque-financeiro-production.up.railway.app${rota.url}`, {}, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          console.log(`✅ ${rota.nome}: Status ${response.status}`);
        }
        
      } catch (error) {
        console.log(`❌ ${rota.nome}: ${error.response?.status || 'Erro'} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 3. Testar rotas do frontend
    console.log('3️⃣ Testando rotas do frontend...');
    const rotasFrontend = [
      '/produtos',
      '/vendas', 
      '/funcionarios',
      '/estoque',
      '/categorias',
      '/controle-financeiro',
      '/relatorios'
    ];
    
    for (const rota of rotasFrontend) {
      try {
        const response = await axios.get(`https://gest-o-de-estoque-financeiro-production.up.railway.app${rota}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        console.log(`✅ Frontend ${rota}: Status ${response.status}`);
        
      } catch (error) {
        console.log(`❌ Frontend ${rota}: ${error.response?.status || 'Erro'} - ${error.response?.data?.message || error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testarRotasAPI();
