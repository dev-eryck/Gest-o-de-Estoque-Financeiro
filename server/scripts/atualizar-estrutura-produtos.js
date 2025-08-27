const { db, run, get, query } = require('../database');

console.log('🔄 Atualizando estrutura da tabela produtos...');

async function atualizarEstruturaProdutos() {
  try {
    // Verificar se a tabela existe
    const tableExists = await get("SELECT name FROM sqlite_master WHERE type='table' AND name='produtos'");
    if (!tableExists) {
      console.log('❌ Tabela produtos não encontrada. Execute setup-database.js primeiro.');
      return;
    }

    // Verificar se os novos campos já existem
    const columns = await query("PRAGMA table_info(produtos)");
    const hasPrecoVenda = columns.some(col => col.name === 'preco_venda');
    const hasPrecoCusto = columns.some(col => col.name === 'preco_custo');
    const hasPreco = columns.some(col => col.name === 'preco');
    const hasCusto = columns.some(col => col.name === 'custo');

    if (hasPrecoVenda && hasPrecoCusto) {
      console.log('✅ Estrutura já está atualizada!');
      return;
    }

    // Adicionar novos campos se não existirem
    if (!hasPrecoVenda) {
      console.log('➕ Adicionando campo preco_venda...');
      await run('ALTER TABLE produtos ADD COLUMN preco_venda DECIMAL(10,2)');
    }

    if (!hasPrecoCusto) {
      console.log('➕ Adicionando campo preco_custo...');
      await run('ALTER TABLE produtos ADD COLUMN preco_custo DECIMAL(10,2)');
    }

    // Migrar dados existentes
    if (hasPreco) {
      console.log('🔄 Migrando dados do campo preco para preco_venda...');
      await run('UPDATE produtos SET preco_venda = preco WHERE preco_venda IS NULL');
    }

    if (hasCusto) {
      console.log('🔄 Migrando dados do campo custo para preco_custo...');
      await run('UPDATE produtos SET preco_custo = custo WHERE preco_custo IS NULL');
    }

    // Definir valores padrão para campos vazios
    console.log('🔄 Definindo valores padrão...');
    await run('UPDATE produtos SET preco_custo = 0.00 WHERE preco_custo IS NULL');
    await run('UPDATE produtos SET preco_venda = 0.00 WHERE preco_venda IS NULL');

    // Verificar resultado
    const produtos = await query('SELECT id, nome, preco_venda, preco_custo FROM produtos LIMIT 5');
    console.log('📊 Produtos após atualização:');
    produtos.forEach(p => {
      console.log(`   ${p.nome}: Venda R$ ${p.preco_venda}, Custo R$ ${p.preco_custo}`);
    });

    console.log('✅ Estrutura da tabela produtos atualizada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao atualizar estrutura:', error);
  } finally {
    process.exit(0);
  }
}

atualizarEstruturaProdutos();
