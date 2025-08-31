const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../database.sqlite');

console.log('🔍 Caminho do banco:', dbPath);

const db = new sqlite3.Database(dbPath);

async function configurarPermissoesEryck() {
  try {
    console.log('🔐 Configurando permissões para usuário eryck...');
    
    // Verificar se usuário existe
    db.get('SELECT id, cargo FROM usuarios WHERE username = ?', ['eryck'], (err, usuario) => {
      if (err) {
        console.error('❌ Erro ao buscar usuário:', err);
        db.close();
        return;
      }
      
      if (!usuario) {
        console.error('❌ Usuário eryck não encontrado!');
        db.close();
        return;
      }
      
      console.log('✅ Usuário encontrado:', usuario);
      
      // Configurar permissões para cargo 'gerente'
      const permissoesGerente = [
        { rota: 'dashboard', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
        { rota: 'produtos', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 1 },
        { rota: 'vendas', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
        { rota: 'funcionarios', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
        { rota: 'estoque', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
        { rota: 'relatorios', pode_ler: 1, pode_criar: 0, pode_editar: 0, pode_deletar: 0 },
        { rota: 'categorias', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
        { rota: 'controle_financeiro', pode_ler: 1, pode_criar: 1, pode_editar: 1, pode_deletar: 0 },
        { rota: 'configuracoes', pode_ler: 1, pode_criar: 0, pode_editar: 0, pode_deletar: 0 },
        { rota: 'usuarios', pode_ler: 1, pode_criar: 0, pode_editar: 0, pode_deletar: 0 }
      ];
      
      console.log('📋 Configurando permissões para cargo gerente...');
      
      // Inserir ou atualizar permissões
      permissoesGerente.forEach(perm => {
        const sql = `
          INSERT OR REPLACE INTO permissoes_cargo (cargo, rota, pode_ler, pode_criar, pode_editar, pode_deletar)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        db.run(sql, ['gerente', perm.rota, perm.pode_ler, perm.pode_criar, perm.pode_editar, perm.pode_deletar], function(err) {
          if (err) {
            console.error(`❌ Erro ao configurar permissão ${perm.rota}:`, err);
          } else {
            console.log(`✅ Permissão ${perm.rota} configurada para gerente`);
          }
        });
      });
      
      // Aguardar um pouco para as operações terminarem
      setTimeout(() => {
        console.log('🎉 Permissões configuradas com sucesso!');
        console.log('👤 Usuário eryck agora tem acesso completo ao sistema');
        db.close();
      }, 1000);
      
    });
    
  } catch (error) {
    console.error('❌ Erro:', error);
    db.close();
  }
}

configurarPermissoesEryck();
