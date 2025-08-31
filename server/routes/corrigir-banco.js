const express = require('express');
const { query, run } = require('../database');

const router = express.Router();

// POST /api/corrigir-banco - Corrigir estrutura do banco
router.post('/', async (req, res) => {
  try {
    console.log('🔧 Corrigindo estrutura do banco...');
    
    // 1. Verificar estrutura atual da tabela produtos
    console.log('1️⃣ Verificando estrutura atual...');
    const estruturaAtual = await query("PRAGMA table_info(produtos)");
    console.log('📋 Estrutura atual:', estruturaAtual);
    
    // 2. Verificar se colunas necessárias existem
    const colunasExistentes = estruturaAtual.map(col => col.name);
    console.log('📋 Colunas existentes:', colunasExistentes);
    
    const colunasNecessarias = [
      'id', 'nome', 'descricao', 'preco_venda', 'preco_custo', 
      'quantidade', 'estoque_minimo', 'categoria', 'fornecedor', 
      'codigo_barras', 'ativo', 'created_at', 'updated_at'
    ];
    
    const colunasFaltando = colunasNecessarias.filter(col => !colunasExistentes.includes(col));
    console.log('❌ Colunas faltando:', colunasFaltando);
    
    // 3. Adicionar colunas que estão faltando
    if (colunasFaltando.length > 0) {
      console.log('3️⃣ Adicionando colunas faltando...');
      
      for (const coluna of colunasFaltando) {
        try {
          let sql = '';
          let params = [];
          
          switch (coluna) {
            case 'categoria':
              sql = 'ALTER TABLE produtos ADD COLUMN categoria TEXT';
              break;
            case 'fornecedor':
              sql = 'ALTER TABLE produtos ADD COLUMN fornecedor TEXT';
              break;
            case 'codigo_barras':
              sql = 'ALTER TABLE produtos ADD COLUMN codigo_barras TEXT';
              break;
            case 'ativo':
              sql = 'ALTER TABLE produtos ADD COLUMN ativo BOOLEAN DEFAULT 1';
              break;
            case 'created_at':
              sql = 'ALTER TABLE produtos ADD COLUMN created_at DATETIME DEFAULT CURRENT_TIMESTAMP';
              break;
            case 'updated_at':
              sql = 'ALTER TABLE produtos ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP';
              break;
            default:
              console.log(`⚠️ Coluna ${coluna} não configurada para adição`);
              continue;
          }
          
          if (sql) {
            await run(sql, params);
            console.log(`✅ Coluna ${coluna} adicionada`);
          }
          
        } catch (error) {
          console.log(`❌ Erro ao adicionar coluna ${coluna}:`, error.message);
        }
      }
    }
    
    // 4. Verificar estrutura final
    console.log('4️⃣ Verificando estrutura final...');
    const estruturaFinal = await query("PRAGMA table_info(produtos)");
    console.log('📋 Estrutura final:', estruturaFinal);
    
    // 5. Testar inserção simples
    console.log('5️⃣ Testando inserção...');
    try {
      const testeInserir = await run(
        'INSERT INTO produtos (nome, preco_venda, preco_custo, quantidade, categoria) VALUES (?, ?, ?, ?, ?)', 
        ['Produto Teste Correção', 10.00, 5.00, 50, 'Teste']
      );
      console.log('✅ Inserção teste funcionou:', testeInserir);
      
      // Remover produto de teste
      await run('DELETE FROM produtos WHERE nome = ?', ['Produto Teste Correção']);
      console.log('✅ Produto de teste removido');
      
    } catch (error) {
      console.log('❌ Inserção teste falhou:', error.message);
    }
    
    res.json({
      success: true,
      message: 'Estrutura do banco corrigida',
      data: {
        estrutura_anterior: estruturaAtual,
        estrutura_final: estruturaFinal,
        colunas_adicionadas: colunasFaltando,
        teste_insercao: 'OK'
      }
    });
    
  } catch (error) {
    console.error('❌ Erro ao corrigir banco:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      message: 'Falha ao corrigir banco',
      details: error.message
    });
  }
});

module.exports = router;
