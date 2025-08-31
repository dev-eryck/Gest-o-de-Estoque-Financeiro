const axios = require('axios');

async function testarProdutos() {
  try {
    console.log('🧪 Testando funcionalidade de produtos...');
    
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
    
    // 2. Testar listar produtos
    console.log('2️⃣ Testando listar produtos...');
    try {
      const listarResponse = await axios.get('https://gest-o-de-estoque-financeiro-production.up.railway.app/api/produtos', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (listarResponse.data.success) {
        const total = listarResponse.data.data?.length || 0;
        console.log(`✅ Listar produtos: ${total} registros`);
        console.log('📋 Dados:', listarResponse.data);
      } else {
        console.log(`❌ Listar produtos: ${listarResponse.data.message || 'Erro'}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro ao listar produtos: ${error.response?.status || 'Erro'} - ${error.response?.data?.message || error.message}`);
    }
    
    // 3. Testar criar produto
    console.log('3️⃣ Testando criar produto...');
    const novoProduto = {
      nome: 'Produto Teste',
      descricao: 'Produto para teste da API',
      preco_venda: 10.50,
      preco_custo: 8.00,
      quantidade: 100,
      estoque_minimo: 10,
      categoria: 'Teste',
      fornecedor: 'Fornecedor Teste',
      codigo_barras: '123456789',
      ativo: true
    };
    
    try {
      const criarResponse = await axios.post('https://gest-o-de-estoque-financeiro-production.up.railway.app/api/produtos', novoProduto, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (criarResponse.data.success) {
        console.log('✅ Produto criado com sucesso:', criarResponse.data);
      } else {
        console.log(`❌ Erro ao criar produto: ${criarResponse.data.message || 'Erro'}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro ao criar produto: ${error.response?.status || 'Erro'} - ${error.response?.data?.message || error.message}`);
      
      if (error.response?.data) {
        console.log('   Detalhes do erro:', error.response.data);
      }
    }
    
    // 4. Testar buscar categorias
    console.log('4️⃣ Testando buscar categorias...');
    try {
      const categoriasResponse = await axios.get('https://gest-o-de-estoque-financeiro-production.up.railway.app/api/categorias', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (categoriasResponse.data.success) {
        const total = categoriasResponse.data.data?.length || 0;
        console.log(`✅ Categorias: ${total} registros`);
      } else {
        console.log(`❌ Categorias: ${categoriasResponse.data.message || 'Erro'}`);
      }
      
    } catch (error) {
      console.log(`❌ Erro ao buscar categorias: ${error.response?.status || 'Erro'} - ${error.response?.data?.message || error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testarProdutos();
