const axios = require('axios');

async function testarTabelas() {
  try {
    console.log('🧪 Testando estrutura das tabelas...');
    
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
    
    // 2. Testar tabelas individuais
    const tabelas = [
      { nome: 'Produtos', url: '/api/produtos' },
      { nome: 'Funcionários', url: '/api/funcionarios' },
      { nome: 'Vendas', url: '/api/vendas' },
      { nome: 'Estoque', url: '/api/estoque' },
      { nome: 'Categorias', url: '/api/categorias' }
    ];
    
    console.log('2️⃣ Testando tabelas individuais...');
    
    for (const tabela of tabelas) {
      try {
        const response = await axios.get(`https://gest-o-de-estoque-financeiro-production.up.railway.app${tabela.url}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          const total = response.data.data?.length || 0;
          console.log(`✅ ${tabela.nome}: ${total} registros`);
        } else {
          console.log(`❌ ${tabela.nome}: ${response.data.message || 'Erro'}`);
        }
        
      } catch (error) {
        console.log(`❌ ${tabela.nome}: ${error.response?.status || 'Erro'} - ${error.response?.data?.message || error.message}`);
      }
    }
    
    // 3. Testar rota de vendas com detalhes
    console.log('3️⃣ Testando rota de vendas com detalhes...');
    try {
      const vendasResponse = await axios.get('https://gest-o-de-estoque-financeiro-production.up.railway.app/api/vendas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Vendas:', vendasResponse.data);
      
    } catch (error) {
      console.log('❌ Erro detalhado em vendas:', {
        status: error.response?.status,
        message: error.response?.data?.message,
        error: error.response?.data?.error,
        stack: error.response?.data?.stack
      });
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testarTabelas();
