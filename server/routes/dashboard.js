const express = require('express');
const { query } = require('../database');

const router = express.Router();

// GET /api/dashboard - Dados do dashboard
router.get('/', async (req, res) => {
  try {
    console.log('📊 Carregando dados do dashboard...');
    
    // 1. Contar produtos
    const produtosCount = await query('SELECT COUNT(*) as total FROM produtos WHERE ativo = 1');
    const totalProdutos = produtosCount[0]?.total || 0;
    
    // 2. Contar funcionários
    const funcionariosCount = await query('SELECT COUNT(*) as total FROM funcionarios WHERE status = "ativo"');
    const totalFuncionarios = funcionariosCount[0]?.total || 0;
    
    // 3. Contar vendas do dia
    const hoje = new Date().toISOString().split('T')[0];
    const vendasHoje = await query('SELECT COUNT(*) as total FROM vendas WHERE DATE(data) = ?', [hoje]);
    const totalVendasHoje = vendasHoje[0]?.total || 0;
    
    // 4. Produtos com estoque baixo
    const estoqueBaixo = await query(`
      SELECT p.nome, p.quantidade, p.estoque_minimo 
      FROM produtos p 
      WHERE p.quantidade <= p.estoque_minimo AND p.ativo = 1
      LIMIT 5
    `);
    
    // 5. Últimas vendas
    const ultimasVendas = await query(`
      SELECT v.*, p.nome as produto_nome, f.nome as funcionario_nome
      FROM vendas v
      JOIN produtos p ON v.produto_id = p.id
      JOIN funcionarios f ON v.funcionario_id = f.id
      ORDER BY v.data DESC
      LIMIT 5
    `);
    
    // 6. Resumo financeiro do dia
    const financeiroHoje = await query(`
      SELECT 
        SUM(v.preco_unitario * v.quantidade) as receita_total,
        COUNT(*) as total_vendas
      FROM vendas v 
      WHERE DATE(v.data) = ?
    `, [hoje]);
    
    const dados = {
      resumo: {
        total_produtos: totalProdutos,
        total_funcionarios: totalFuncionarios,
        vendas_hoje: totalVendasHoje,
        receita_hoje: financeiroHoje[0]?.receita_total || 0
      },
      alertas: {
        estoque_baixo: estoqueBaixo.length,
        produtos_estoque_baixo: estoqueBaixo
      },
      ultimas_atividades: {
        vendas: ultimasVendas
      }
    };
    
    res.json({
      success: true,
      data: dados,
      message: 'Dados do dashboard carregados com sucesso'
    });
    
  } catch (error) {
    console.error('❌ Erro ao carregar dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Erro ao carregar dados do dashboard'
    });
  }
});

module.exports = router;
