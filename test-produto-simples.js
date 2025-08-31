const axios = require('axios');

async function testarProdutoSimples() {
  try {
    console.log('🧪 Testando criação de produto simples...');
    
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
    
    // 2. Testar com dados mínimos
    console.log('2️⃣ Testando com dados mínimos...');
    const produtoMinimo = {
      nome: 'Teste Simples',
      preco_venda: 10.00,
      preco_custo: 5.00,
      quantidade: 50,
      categoria: 'Teste'
    };
    
    try {
      const response = await axios.post('https://gest-o-de-estoque-financeiro-production.up.railway.app/api/produtos', produtoMinimo, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Produto criado com sucesso:', response.data);
      
    } catch (error) {
      console.log(`❌ Erro ao criar produto: ${error.response?.status || 'Erro'}`);
      console.log('   Mensagem:', error.response?.data?.message || error.message);
      console.log('   Detalhes:', error.response?.data?.details || 'Nenhum detalhe');
      console.log('   Erro:', error.response?.data?.error || 'Nenhum erro específico');
    }
    
    // 3. Testar com dados completos
    console.log('3️⃣ Testando com dados completos...');
    const produtoCompleto = {
      nome: 'Produto Completo',
      descricao: 'Descrição completa do produto',
      preco_venda: 25.50,
      preco_custo: 15.00,
      quantidade: 100,
      estoque_minimo: 10,
      categoria: 'Categoria Teste',
      fornecedor: 'Fornecedor Teste',
      codigo_barras: '987654321',
      ativo: true
    };
    
    try {
      const response = await axios.post('https://gest-o-de-estoque-financeiro-production.up.railway.app/api/produtos', produtoCompleto, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ Produto completo criado:', response.data);
      
    } catch (error) {
      console.log(`❌ Erro ao criar produto completo: ${error.response?.status || 'Erro'}`);
      console.log('   Mensagem:', error.response?.data?.message || error.message);
      console.log('   Detalhes:', error.response?.data?.details || 'Nenhum detalhe');
      console.log('   Erro:', error.response?.data?.error || 'Nenhum erro específico');
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testarProdutoSimples();
