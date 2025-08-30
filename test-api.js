const axios = require('axios');

async function testAPI() {
  try {
    console.log('🧪 Testando API do Railway...');
    
    // Teste 1: Health check
    console.log('\n1️⃣ Testando health check...');
    const healthResponse = await axios.get('https://gest-o-de-estoque-financeiro-production.up.railway.app/api/health');
    console.log('✅ Health check:', healthResponse.data);
    
    // Teste 2: Login com credenciais incorretas
    console.log('\n2️⃣ Testando login com credenciais incorretas...');
    try {
      const wrongLoginResponse = await axios.post('https://gest-o-de-estoque-financeiro-production.up.railway.app/api/auth/login', {
        username: 'wrong',
        senha: 'wrong'
      });
      console.log('❌ Deveria ter falhado:', wrongLoginResponse.data);
    } catch (error) {
      console.log('✅ Falhou corretamente:', error.response?.data);
    }
    
         // Teste 3: Login com credenciais corretas (eryck)
     console.log('\n3️⃣ Testando login com credenciais corretas (eryck)...');
     try {
       const loginResponse = await axios.post('https://gest-o-de-estoque-financeiro-production.up.railway.app/api/auth/login', {
         username: 'eryck',
         senha: '300406'
       });
       console.log('✅ Login bem-sucedido:', loginResponse.data);
     } catch (error) {
       console.log('❌ Login falhou:', error.response?.data);
       console.log('📊 Status:', error.response?.status);
       console.log('📝 Mensagem:', error.response?.data?.message);
     }
    
  } catch (error) {
    console.error('❌ Erro geral:', error.message);
  }
}

testAPI();
