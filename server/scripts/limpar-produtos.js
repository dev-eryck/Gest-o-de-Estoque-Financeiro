const { db, run, query } = require('../database');

console.log('🧹 Limpando produtos existentes do banco de dados...');

async function limparProdutos() {
  try {
    // Verificar se a tabela existe
    const tableExists = await db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='produtos'");
    if (!tableExists) {
      console.log('❌ Tabela produtos não encontrada.');
      return;
    }

    // Contar produtos existentes
    const countResult = await db.get('SELECT COUNT(*) as total FROM produtos');
    const totalProdutos = countResult.total;
    
    if (totalProdutos === 0) {
      console.log('✅ Nenhum produto encontrado para remover.');
      return;
    }

    console.log(`📊 Encontrados ${totalProdutos} produtos para remover...`);

    // Remover todos os produtos
    await run('DELETE FROM produtos');
    
    // Resetar o auto-increment
    await run('DELETE FROM sqlite_sequence WHERE name="produtos"');
    
    console.log(`✅ ${totalProdutos} produtos removidos com sucesso!`);
    console.log('🔄 Banco de dados limpo e pronto para novos produtos.');
    
  } catch (error) {
    console.error('❌ Erro ao limpar produtos:', error);
  } finally {
    process.exit(0);
  }
}

limparProdutos();
