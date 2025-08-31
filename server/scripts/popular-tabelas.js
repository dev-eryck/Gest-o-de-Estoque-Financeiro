const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../database.sqlite');

console.log('🔍 Caminho do banco:', dbPath);

const db = new sqlite3.Database(dbPath);

async function popularTabelas() {
  try {
    console.log('🔐 Populando tabelas com dados de exemplo...');
    
    // 1. Inserir categorias
    console.log('1️⃣ Inserindo categorias...');
    const categorias = [
      { nome: 'Bebidas', descricao: 'Bebidas em geral' },
      { nome: 'Comidas', descricao: 'Comidas e pratos' },
      { nome: 'Limpeza', descricao: 'Produtos de limpeza' },
      { nome: 'Outros', descricao: 'Outros produtos' }
    ];
    
    for (const cat of categorias) {
      db.run('INSERT OR REPLACE INTO categorias (nome, descricao) VALUES (?, ?)', [cat.nome, cat.descricao], function(err) {
        if (err) {
          console.error(`❌ Erro ao inserir categoria ${cat.nome}:`, err);
        } else {
          console.log(`✅ Categoria ${cat.nome} inserida`);
        }
      });
    }
    
    // 2. Inserir produtos
    console.log('2️⃣ Inserindo produtos...');
    const produtos = [
      { nome: 'Coca-Cola', categoria: 'Bebidas', preco: 5.50, estoque: 100 },
      { nome: 'Pepsi', categoria: 'Bebidas', preco: 5.00, estoque: 80 },
      { nome: 'Hambúrguer', categoria: 'Comidas', preco: 15.00, estoque: 50 },
      { nome: 'Batata Frita', categoria: 'Comidas', preco: 8.00, estoque: 30 },
      { nome: 'Detergente', categoria: 'Limpeza', preco: 3.50, estoque: 20 }
    ];
    
    for (const prod of produtos) {
      db.run('INSERT OR REPLACE INTO produtos (nome, categoria, preco, estoque_atual) VALUES (?, ?, ?, ?)', 
        [prod.nome, prod.categoria, prod.preco, prod.estoque], function(err) {
        if (err) {
          console.error(`❌ Erro ao inserir produto ${prod.nome}:`, err);
        } else {
          console.log(`✅ Produto ${prod.nome} inserido`);
        }
      });
    }
    
    // 3. Inserir funcionários
    console.log('3️⃣ Inserindo funcionários...');
    const funcionarios = [
      { nome: 'João Silva', cargo: 'Garçom', email: 'joao@exemplo.com', telefone: '(11) 99999-9999' },
      { nome: 'Maria Santos', cargo: 'Caixa', email: 'maria@exemplo.com', telefone: '(11) 88888-8888' },
      { nome: 'Pedro Costa', cargo: 'Estoque', email: 'pedro@exemplo.com', telefone: '(11) 77777-7777' }
    ];
    
    for (const func of funcionarios) {
      db.run('INSERT OR REPLACE INTO funcionarios (nome, cargo, email, telefone) VALUES (?, ?, ?, ?)', 
        [func.nome, func.cargo, func.email, func.telefone], function(err) {
        if (err) {
          console.error(`❌ Erro ao inserir funcionário ${func.nome}:`, err);
        } else {
          console.log(`✅ Funcionário ${func.nome} inserido`);
        }
      });
    }
    
    // 4. Inserir vendas de exemplo
    console.log('4️⃣ Inserindo vendas de exemplo...');
    const vendas = [
      { produto_id: 1, funcionario_id: 1, quantidade: 2, preco_unitario: 5.50, data: '2025-08-31 12:00:00' },
      { produto_id: 3, funcionario_id: 2, quantidade: 1, preco_unitario: 15.00, data: '2025-08-31 13:00:00' },
      { produto_id: 2, funcionario_id: 1, quantidade: 3, preco_unitario: 5.00, data: '2025-08-31 14:00:00' }
    ];
    
    for (const venda of vendas) {
      db.run('INSERT OR REPLACE INTO vendas (produto_id, funcionario_id, quantidade, preco_unitario, data) VALUES (?, ?, ?, ?, ?)', 
        [venda.produto_id, venda.funcionario_id, venda.quantidade, venda.preco_unitario, venda.data], function(err) {
        if (err) {
          console.error(`❌ Erro ao inserir venda:`, err);
        } else {
          console.log(`✅ Venda inserida`);
        }
      });
    }
    
    // Aguardar um pouco para as operações terminarem
    setTimeout(() => {
      console.log('🎉 Tabelas populadas com sucesso!');
      console.log('📊 Agora o sistema deve funcionar corretamente');
      db.close();
    }, 2000);
    
  } catch (error) {
    console.error('❌ Erro:', error);
    db.close();
  }
}

popularTabelas();
