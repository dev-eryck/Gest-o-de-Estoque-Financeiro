const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando build de produção...\n');

try {
  // 1. Instalar dependências do cliente
  console.log('📦 Instalando dependências do cliente...');
  execSync('cd client && npm install', { stdio: 'inherit' });
  
  // 2. Fazer build do React
  console.log('🔨 Fazendo build do React...');
  execSync('cd client && npm run build', { stdio: 'inherit' });
  
  // 3. Verificar se o build foi criado
  const buildPath = path.join(__dirname, '../client/build');
  const fs = require('fs');
  
  if (fs.existsSync(buildPath)) {
    console.log('✅ Build criado com sucesso em:', buildPath);
    
    // 4. Listar arquivos do build
    const files = fs.readdirSync(buildPath);
    console.log('📁 Arquivos gerados:', files.length);
    
    // 5. Verificar tamanho do build
    const stats = fs.statSync(buildPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    console.log('📊 Tamanho do build:', sizeInMB, 'MB');
    
  } else {
    console.error('❌ Erro: Build não foi criado');
    process.exit(1);
  }
  
  console.log('\n🎉 Build de produção concluído com sucesso!');
  console.log('📱 Agora você pode fazer deploy no Vercel');
  
} catch (error) {
  console.error('❌ Erro durante o build:', error.message);
  process.exit(1);
}
