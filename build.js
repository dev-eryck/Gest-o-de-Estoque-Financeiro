const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Iniciando build...');

try {
  // Mudar para a pasta client
  process.chdir(path.join(__dirname, 'client'));
  console.log('📁 Mudou para pasta client');
  
  // Instalar dependências
  console.log('📦 Instalando dependências...');
  execSync('npm install', { stdio: 'inherit' });
  
  // Fazer build
  console.log('🔨 Fazendo build...');
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Build concluído com sucesso!');
} catch (error) {
  console.error('❌ Erro no build:', error.message);
  process.exit(1);
}
