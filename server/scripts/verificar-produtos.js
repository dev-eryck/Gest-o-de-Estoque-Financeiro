const { db, query } = require('../database');

console.log('🔍 Verificando produtos no banco...');

async function verificarProdutos() {
  try {
    const produtos = await query('SELECT * FROM produtos');
    console.log(`📊 Total de produtos encontrados: ${produtos.length}`);
    
    if (produtos.length > 0) {
      console.log('📋 Produtos:');
      produtos.forEach((produto, index) => {
        console.log(`   ${index + 1}. ${produto.nome} - Venda: R$ ${produto.preco_venda} - Custo: R$ ${produto.preco_custo} - Estoque: ${produto.quantidade}`);
      });
    } else {
      console.log('❌ Nenhum produto encontrado!');
    }
    
    console.log('✅ Verificação concluída!');
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    process.exit(0);
  }
}

verificarProdutos();
