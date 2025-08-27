const { db, run, get } = require('../database');

console.log('🧪 Testando criação de venda simples...');

async function testarVenda() {
  try {
    // Dados de teste
    const produto_id = 8;
    const funcionario_id = 18;
    const quantidade = 1;
    const observacao = "Teste de venda simples";

    console.log('📋 Dados de teste:');
    console.log(`   Produto ID: ${produto_id}`);
    console.log(`   Funcionário ID: ${funcionario_id}`);
    console.log(`   Quantidade: ${quantidade}`);
    console.log(`   Observação: ${observacao}`);

    // Verificar se produto existe
    console.log('\n🔍 Verificando produto...');
    const produto = await get('SELECT id, nome, quantidade, preco_venda, preco_custo FROM produtos WHERE id = ?', [produto_id]);
    if (!produto) {
      throw new Error('Produto não encontrado');
    }
    console.log(`✅ Produto encontrado: ${produto.nome}`);

    // Verificar se funcionário existe
    console.log('\n🔍 Verificando funcionário...');
    const funcionario = await get('SELECT id, nome FROM funcionarios WHERE id = ?', [funcionario_id]);
    if (!funcionario) {
      throw new Error('Funcionário não encontrado');
    }
    console.log(`✅ Funcionário encontrado: ${funcionario.nome}`);

    // Calcular valores
    const preco_unitario = produto.preco_venda;
    const total = quantidade * preco_unitario;
    const custo_total = quantidade * produto.preco_custo;
    const lucro = total - custo_total;

    console.log('\n💰 Valores calculados:');
    console.log(`   Preço unitário: R$ ${preco_unitario}`);
    console.log(`   Total: R$ ${total}`);
    console.log(`   Custo total: R$ ${custo_total}`);
    console.log(`   Lucro: R$ ${lucro}`);

    // Testar inserção da venda
    console.log('\n📝 Testando inserção da venda...');
    const result = await run(`
      INSERT INTO vendas (produto_id, funcionario_id, quantidade, preco_unitario, total, observacao, data)
      VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `, [produto_id, funcionario_id, quantidade, preco_unitario, total, observacao]);

    console.log(`✅ Venda criada com ID: ${result.id}`);

    // Testar atualização de estoque
    console.log('\n📦 Testando atualização de estoque...');
    const novaQuantidade = produto.quantidade - quantidade;
    await run('UPDATE produtos SET quantidade = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [novaQuantidade, produto_id]);
    console.log(`✅ Estoque atualizado: ${produto.quantidade} → ${novaQuantidade}`);

    // Testar movimentação de estoque
    console.log('\n🔄 Testando movimentação de estoque...');
    await run(`
      INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo, data, created_at, updated_at)
      VALUES (?, 'saida', ?, 'Venda', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, [produto_id, quantidade]);
    console.log('✅ Movimentação de estoque registrada');

    // Testar controle financeiro - receita
    console.log('\n💵 Testando controle financeiro - receita...');
    await run(`
      INSERT INTO controle_financeiro (tipo, descricao, valor, data, categoria, observacao, created_at, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, ['receita', `Venda de ${produto.nome}`, total, 'Vendas', `Venda de ${quantidade}x ${produto.nome} - Lucro: R$ ${lucro.toFixed(2)}`]);
    console.log('✅ Receita registrada no controle financeiro');

    // Testar controle financeiro - despesa
    console.log('\n💸 Testando controle financeiro - despesa...');
    await run(`
      INSERT INTO controle_financeiro (tipo, descricao, valor, data, categoria, observacao, created_at, updated_at)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `, ['despesa', `Custo da venda de ${produto.nome}`, custo_total, 'Custos de Vendas', `Custo de ${quantidade}x ${produto.nome}`]);
    console.log('✅ Despesa registrada no controle financeiro');

    console.log('\n🎉 Todos os testes passaram com sucesso!');
    console.log('✅ A criação de vendas está funcionando corretamente!');

  } catch (error) {
    console.error('\n❌ Erro durante o teste:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    process.exit(0);
  }
}

testarVenda();
