const express = require('express');
const { query, run, get } = require('../database');

const router = express.Router();

// GET /api/teste-banco - Testar conectividade do banco
router.get('/', async (req, res) => {
  try {
    console.log('🧪 Testando conectividade do banco...');
    
    // 1. Testar consulta simples
    console.log('1️⃣ Testando consulta simples...');
    const testeConsulta = await query('SELECT 1 as teste');
    console.log('✅ Consulta simples:', testeConsulta);
    
    // 2. Testar estrutura da tabela produtos
    console.log('2️⃣ Testando estrutura da tabela produtos...');
    const estruturaProdutos = await query("PRAGMA table_info(produtos)");
    console.log('✅ Estrutura produtos:', estruturaProdutos);
    
    // 3. Testar inserção simples
    console.log('3️⃣ Testando inserção simples...');
    const testeInserir = await run('INSERT INTO produtos (nome, preco_venda, preco_custo, quantidade, categoria) VALUES (?, ?, ?, ?, ?)', 
      ['Produto Teste API', 10.00, 5.00, 50, 'Teste']);
    console.log('✅ Inserção teste:', testeInserir);
    
    // 4. Verificar se foi inserido
    console.log('4️⃣ Verificando inserção...');
    const produtoInserido = await get('SELECT * FROM produtos WHERE nome = ?', ['Produto Teste API']);
    console.log('✅ Produto inserido:', produtoInserido);
    
    // 5. Remover produto de teste
    console.log('5️⃣ Removendo produto de teste...');
    await run('DELETE FROM produtos WHERE nome = ?', ['Produto Teste API']);
    console.log('✅ Produto de teste removido');
    
    res.json({
      success: true,
      message: 'Teste do banco realizado com sucesso',
      data: {
        consulta: testeConsulta,
        estrutura: estruturaProdutos,
        inserção: testeInserir,
        produto_inserido: produtoInserido
      }
    });
    
  } catch (error) {
    console.error('❌ Erro no teste do banco:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Falha no teste do banco',
      details: error.message,
      stack: error.stack
    });
  }
});

module.exports = router;
