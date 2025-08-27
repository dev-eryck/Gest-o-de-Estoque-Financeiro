const db = require('./database');

const seedData = async () => {
  try {
    console.log('🌱 Iniciando seed de dados...');

    // Inserir categorias padrão
    const categorias = [
      { nome: 'Cervejas', descricao: 'Cervejas de todos os tipos' },
      { nome: 'Destilados', descricao: 'Whisky, Vodka, Gin, etc.' },
      { nome: 'Vinhos', descricao: 'Vinhos tintos, brancos e rosés' },
      { nome: 'Refrigerantes', descricao: 'Refrigerantes e bebidas não alcoólicas' },
      { nome: 'Petiscos', descricao: 'Salgadinhos, amendoins, etc.' },
      { nome: 'Utensílios', descricao: 'Copos, taças, abridores, etc.' }
    ];

    for (const categoria of categorias) {
      const existing = await db.get('SELECT id FROM categorias WHERE nome = ?', [categoria.nome]);
      if (!existing) {
        await db.run(`
          INSERT INTO categorias (nome, descricao, created_at, updated_at)
          VALUES (?, ?, datetime('now'), datetime('now'))
        `, [categoria.nome, categoria.descricao]);
        console.log(`✅ Categoria criada: ${categoria.nome}`);
      }
    }

    // Inserir alguns produtos de exemplo
    const produtos = [
      {
        nome: 'Cerveja Heineken',
        preco_venda: 8.50,
        preco_custo: 5.50,
        quantidade: 50,
        categoria: 'Cervejas',
        descricao: 'Cerveja lager premium holandesa',
        estoque_minimo: 10
      },
      {
        nome: 'Whisky Jack Daniels',
        preco_venda: 45.00,
        preco_custo: 32.00,
        quantidade: 20,
        categoria: 'Destilados',
        descricao: 'Whisky americano premium',
        estoque_minimo: 5
      },
      {
        nome: 'Vinho Tinto Merlot',
        preco_venda: 35.00,
        preco_custo: 25.00,
        quantidade: 30,
        categoria: 'Vinhos',
        descricao: 'Vinho tinto seco e encorpado',
        estoque_minimo: 8
      },
      {
        nome: 'Coca-Cola 350ml',
        preco_venda: 4.50,
        preco_custo: 2.80,
        quantidade: 100,
        categoria: 'Refrigerantes',
        descricao: 'Refrigerante cola',
        estoque_minimo: 20
      },
      {
        nome: 'Amendoim Torrado',
        preco_venda: 6.00,
        preco_custo: 3.50,
        quantidade: 40,
        categoria: 'Petiscos',
        descricao: 'Amendoim torrado e salgado',
        estoque_minimo: 10
      }
    ];

    for (const produto of produtos) {
      const existing = await db.get('SELECT id FROM produtos WHERE nome = ?', [produto.nome]);
      if (!existing) {
        await db.run(`
          INSERT INTO produtos (nome, preco_venda, preco_custo, quantidade, categoria, descricao, estoque_minimo, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [produto.nome, produto.preco_venda, produto.preco_custo, produto.quantidade, produto.categoria, produto.descricao, produto.estoque_minimo]);
        console.log(`✅ Produto criado: ${produto.nome}`);
      }
    }

    // Inserir funcionários de exemplo
    const funcionarios = [
      {
        nome: 'João Silva',
        cpf: '12345678901',
        email: 'joao@bardocarneiro.com',
        telefone: '11999887766',
        cargo: 'Gerente',
        salario: 3500.00,
        data_admissao: '2024-01-15',
        status: 'ativo'
      },
      {
        nome: 'Maria Santos',
        cpf: '98765432100',
        email: 'maria@bardocarneiro.com',
        telefone: '11988776655',
        cargo: 'Garçom',
        salario: 1800.00,
        data_admissao: '2024-02-01',
        status: 'ativo'
      },
      {
        nome: 'Pedro Costa',
        cpf: '45678912300',
        email: 'pedro@bardocarneiro.com',
        telefone: '11977665544',
        cargo: 'Caixa',
        salario: 2000.00,
        data_admissao: '2024-01-20',
        status: 'ativo'
      }
    ];

    for (const funcionario of funcionarios) {
      const existing = await db.get('SELECT id FROM funcionarios WHERE cpf = ?', [funcionario.cpf]);
      if (!existing) {
        await db.run(`
          INSERT INTO funcionarios (nome, cpf, email, telefone, cargo, salario, data_admissao, status, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [funcionario.nome, funcionario.cpf, funcionario.email, funcionario.telefone, funcionario.cargo, funcionario.salario, funcionario.data_admissao, funcionario.status]);
        console.log(`✅ Funcionário criado: ${funcionario.nome}`);
      }
    }

    // Inserir algumas vendas de exemplo
    const vendas = [
      {
        produto_id: 1, // Cerveja Heineken
        funcionario_id: 2, // Maria Santos
        quantidade: 2,
        preco_unitario: 8.50,
        observacao: 'Venda para mesa 5',
        data: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 horas atrás
      },
      {
        produto_id: 2, // Whisky Jack Daniels
        funcionario_id: 3, // Pedro Costa
        quantidade: 1,
        preco_unitario: 45.00,
        observacao: 'Venda para mesa VIP',
        data: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString() // 1 hora atrás
      }
    ];

    for (const venda of vendas) {
      await db.run(`
        INSERT INTO vendas (produto_id, funcionario_id, quantidade, preco_unitario, observacao, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [venda.produto_id, venda.funcionario_id, venda.quantidade, venda.preco_unitario, venda.observacao, venda.data]);
      console.log(`✅ Venda registrada: ${venda.quantidade}x produto ID ${venda.produto_id}`);
    }

    // Inserir movimentações de estoque
    const movimentacoes = [
      {
        produto_id: 1,
        tipo: 'entrada',
        quantidade: 50,
        motivo: 'Compra de fornecedor',
        observacao: 'Estoque inicial',
        data: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // 1 dia atrás
      },
      {
        produto_id: 2,
        tipo: 'entrada',
        quantidade: 20,
        motivo: 'Compra de fornecedor',
        observacao: 'Estoque inicial',
        data: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    for (const mov of movimentacoes) {
      await db.run(`
        INSERT INTO movimentacoes_estoque (produto_id, tipo, quantidade, motivo, observacao, data, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, [mov.produto_id, mov.tipo, mov.quantidade, mov.motivo, mov.observacao, mov.data]);
      console.log(`✅ Movimentação registrada: ${mov.tipo} de ${mov.quantidade} produtos ID ${mov.produto_id}`);
    }

    // Inserir algumas notificações de exemplo
    const notificacoes = [
      {
        titulo: 'Sistema Iniciado',
        mensagem: 'O sistema BAR DO CARNEIRO foi iniciado com sucesso',
        tipo: 'success',
        prioridade: 'normal'
      },
      {
        titulo: 'Estoque Baixo',
        mensagem: 'O produto "Cerveja Heineken" está com estoque baixo (10 unidades)',
        tipo: 'warning',
        prioridade: 'alta'
      },
      {
        titulo: 'Backup Automático',
        mensagem: 'Backup do sistema realizado com sucesso às 02:00',
        tipo: 'info',
        prioridade: 'baixa'
      }
    ];

    for (const notificacao of notificacoes) {
      const existing = await db.get('SELECT id FROM notificacoes WHERE titulo = ?', [notificacao.titulo]);
      if (!existing) {
        await db.run(`
          INSERT INTO notificacoes (titulo, mensagem, tipo, prioridade, created_at, updated_at)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [notificacao.titulo, notificacao.mensagem, notificacao.tipo, notificacao.prioridade]);
        console.log(`✅ Notificação criada: ${notificacao.titulo}`);
      }
    }

    // Inserir dados iniciais de controle financeiro
    const transacoesFinanceiras = [
      {
        tipo: 'caixa_inicial',
        descricao: 'Caixa inicial do BAR DO CARNEIRO',
        valor: 1000.00,
        data: '2024-01-01',
        categoria: 'Capital Inicial',
        observacao: 'Capital inicial para operações'
      },
      {
        tipo: 'venda',
        descricao: 'Venda de bebidas e comidas',
        valor: 150.00,
        data: new Date().toISOString().split('T')[0],
        categoria: 'Vendas',
        observacao: 'Vendas do dia'
      },
      {
        tipo: 'custo',
        descricao: 'Compra de produtos',
        valor: 80.00,
        data: new Date().toISOString().split('T')[0],
        categoria: 'Custos',
        observacao: 'Compra de produtos para estoque'
      }
    ];

    for (const transacao of transacoesFinanceiras) {
      const existing = await db.get('SELECT id FROM controle_financeiro WHERE descricao = ? AND data = ?', [transacao.descricao, transacao.data]);
      if (!existing) {
        await db.run(`
          INSERT INTO controle_financeiro (tipo, descricao, valor, data, categoria, observacao, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
        `, [transacao.tipo, transacao.descricao, transacao.valor, transacao.data, transacao.categoria, transacao.observacao]);
        console.log(`✅ Transação financeira criada: ${transacao.descricao}`);
      }
    }

    // Inserir usuário dono inicial
    const bcrypt = require('bcryptjs');
    const senhaHash = await bcrypt.hash('admin123', 12);
    
    const usuarioDono = await db.get('SELECT id FROM usuarios WHERE username = ?', ['admin']);
    if (!usuarioDono) {
      await db.run(`
        INSERT INTO usuarios (username, email, senha_hash, nome_completo, cargo, ativo, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))
      `, ['admin', 'admin@barcarneiro.com', senhaHash, 'Administrador Sistema', 'dono', 1]);
      console.log('✅ Usuário dono criado: admin (senha: admin123)');
    }

    // Inserir permissões por cargo
    const permissoes = [
      // Gerente - Acesso amplo mas não total
      { cargo: 'gerente', rota: 'dashboard', pode_ler: 1, pode_criar: 0, pode_editar: 0, pode_deletar: 0 },
      { cargo: 'gerente', rota: 'produtos', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
      { cargo: 'gerente', rota: 'funcionarios', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
      { cargo: 'gerente', rota: 'estoque', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
      { cargo: 'gerente', rota: 'vendas', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
      { cargo: 'gerente', rota: 'relatorios', pode_ler: 1, pode_criar: 0, pode_editar: 0, pode_deletar: 0 },
      { cargo: 'gerente', rota: 'categorias', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
      { cargo: 'gerente', rota: 'controle_financeiro', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
      { cargo: 'gerente', rota: 'configuracoes', pode_ler: 1, pode_criar: 0, pode_editar: 0, pode_deletar: 0 },
      
      // Garçom - Acesso limitado
      { cargo: 'garcom', rota: 'dashboard', pode_ler: 1, pode_criar: 0, pode_editar: 0, pode_deletar: 0 },
      { cargo: 'garcom', rota: 'vendas', pode_ler: 1, pode_criar: 1, pode_editar: 0, pode_deletar: 0 },
      { cargo: 'garcom', rota: 'produtos', pode_ler: 1, pode_criar: 0, pode_editar: 0, pode_deletar: 0 },
      
      // Caixa - Acesso a vendas e financeiro básico
      { cargo: 'caixa', rota: 'dashboard', pode_ler: 1, pode_criar: 0, pode_editar: 0, pode_deletar: 0 },
      { cargo: 'caixa', rota: 'vendas', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
      { cargo: 'caixa', rota: 'controle_financeiro', pode_ler: 1, pode_criar: 1, pode_editar: 0, pode_deletar: 0 },
      { cargo: 'caixa', rota: 'produtos', pode_ler: 1, pode_criar: 0, pode_editar: 0, pode_deletar: 0 },
      
      // Estoque - Acesso a produtos e estoque
      { cargo: 'estoque', rota: 'dashboard', pode_ler: 1, pode_criar: 0, pode_editar: 0, pode_deletar: 0 },
      { cargo: 'estoque', rota: 'produtos', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
      { cargo: 'estoque', rota: 'estoque', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
      { cargo: 'estoque', rota: 'categorias', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
      { cargo: 'estoque', rota: 'vendas', pode_ler: 1, pode_criar: 0, pode_editar: 0, pode_deletar: 0 }
    ];

    for (const permissao of permissoes) {
      const existing = await db.get('SELECT id FROM permissoes_cargo WHERE cargo = ? AND rota = ?', [permissao.cargo, permissao.rota]);
      if (!existing) {
        await db.run(`
          INSERT INTO permissoes_cargo (cargo, rota, pode_ler, pode_criar, pode_editar, pode_deletar, created_at)
          VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        `, [permissao.cargo, permissao.rota, permissao.pode_ler, permissao.pode_criar, permissao.pode_editar, permissao.pode_deletar]);
        console.log(`✅ Permissão criada: ${permissao.cargo} - ${permissao.rota}`);
      }
    }

    console.log('🎉 Seed de dados concluído com sucesso!');
    console.log('📊 Dados iniciais criados:');
    console.log(`   - ${categorias.length} categorias`);
    console.log(`   - ${produtos.length} produtos`);
    console.log(`   - ${funcionarios.length} funcionários`);
    console.log(`   - ${vendas.length} vendas`);
    console.log(`   - ${movimentacoes.length} movimentações de estoque`);
    console.log(`   - ${notificacoes.length} notificações`);
    console.log(`   - ${transacoesFinanceiras.length} transações financeiras`);
    console.log(`   - ${permissoes.length} permissões por cargo`);

  } catch (error) {
    console.error('❌ Erro durante seed de dados:', error);
    throw error;
  }
};

// Executar seed se o arquivo for chamado diretamente
if (require.main === module) {
  seedData()
    .then(() => {
      console.log('✅ Seed concluído');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro no seed:', error);
      process.exit(1);
    });
}

module.exports = seedData;
