# 🍺 BAR DO CARNEIRO - Sistema de Gestão de Estoque

Sistema completo de gestão para o BAR DO CARNEIRO, desenvolvido com Node.js + Express + SQLite no backend e React no frontend.

## ✨ Características

- **Backend**: API RESTful com Node.js, Express e SQLite
- **Frontend**: Interface moderna e responsiva com React
- **Banco de Dados**: SQLite local para fácil deploy
- **Design**: Tema personalizado com cores do BAR DO CARNEIRO
- **Responsivo**: Mobile-first design
- **Validação**: Validação completa de dados
- **Relatórios**: Gráficos e estatísticas em tempo real
- **Feedback**: Notificações toast para todas as ações

## 🚀 Funcionalidades

### 📊 Dashboard
- Estatísticas em tempo real
- Gráficos de estoque por categoria
- Alertas de produtos com baixo estoque
- Ações rápidas para operações comuns

### 📦 Produtos
- CRUD completo de produtos
- Controle de estoque
- Categorização automática
- Alertas de estoque baixo
- Histórico de movimentações

### 👥 Funcionários
- Gestão completa da equipe
- Controle de cargos e status
- Histórico de vendas por funcionário
- Validação de dados únicos (CPF, email)

### 🏪 Estoque
- Controle de entrada e saída
- Movimentações com rastreamento
- Alertas automáticos
- Relatórios detalhados

### 💰 Vendas
- Registro de vendas
- Controle automático de estoque
- Histórico completo
- Relatórios por período

## 🛠️ Tecnologias

### Backend
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **SQLite3** - Banco de dados local
- **Express Validator** - Validação de dados
- **Helmet** - Segurança
- **Morgan** - Logging
- **CORS** - Cross-origin resource sharing

### Frontend
- **React** - Biblioteca JavaScript
- **React Router** - Roteamento
- **Axios** - Cliente HTTP
- **Tailwind CSS** - Framework CSS
- **Recharts** - Gráficos
- **Lucide React** - Ícones
- **React Hot Toast** - Notificações

## 📁 Estrutura do Projeto

```
bar-do-carneiro-sistema/
├── server/                 # Backend Node.js
│   ├── routes/            # Rotas da API
│   │   ├── produtos.js    # Rotas de produtos
│   │   ├── funcionarios.js # Rotas de funcionários
│   │   ├── estoque.js     # Rotas de estoque
│   │   └── vendas.js      # Rotas de vendas
│   ├── database.js        # Configuração do banco
│   ├── setup-database.js  # Script de setup
│   └── index.js           # Servidor principal
├── client/                # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── pages/         # Páginas da aplicação
│   │   ├── App.js         # Componente principal
│   │   └── index.js       # Ponto de entrada
│   ├── public/            # Arquivos estáticos
│   └── package.json       # Dependências do frontend
├── package.json           # Dependências do backend
└── README.md              # Este arquivo
```

## 🚀 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd bar-do-carneiro-sistema
```

### 2. Instale as dependências
```bash
# Instalar dependências do backend
npm install

# Instalar dependências do frontend
cd client
npm install
cd ..
```

### 3. Configure o banco de dados
```bash
# Configurar banco SQLite
npm run setup-db
```

### 4. Inicie o sistema
```bash
# Iniciar backend e frontend simultaneamente
npm run dev

# Ou iniciar separadamente:
npm run server    # Backend na porta 5000
npm run client    # Frontend na porta 3000
```

## 🌐 Acesso ao Sistema

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📱 Uso do Sistema

### Primeiro Acesso
1. O sistema inicia sem dados
2. Comece cadastrando funcionários
3. Adicione produtos ao estoque
4. Configure categorias conforme necessário

### Fluxo de Trabalho
1. **Cadastro de Produtos**: Nome, preço, quantidade, categoria
2. **Gestão de Funcionários**: Dados pessoais, cargo, status
3. **Controle de Estoque**: Entradas, saídas, ajustes
4. **Registro de Vendas**: Produto, funcionário, quantidade
5. **Monitoramento**: Dashboard com alertas e estatísticas

## 🔧 Configurações

### Banco de Dados
- **Tipo**: SQLite local
- **Arquivo**: `server/database.sqlite`
- **Backup**: Exportar arquivo `.sqlite`

### API Endpoints
- `GET /api/produtos` - Listar produtos
- `POST /api/produtos` - Criar produto
- `PUT /api/produtos/:id` - Atualizar produto
- `DELETE /api/produtos/:id` - Excluir produto
- `PATCH /api/produtos/:id/estoque` - Ajustar estoque

### Variáveis de Ambiente
```bash
PORT=5000                    # Porta do servidor
NODE_ENV=development         # Ambiente (dev/prod)
```

## 📊 Relatórios Disponíveis

### Estoque
- Resumo geral
- Produtos por categoria
- Alertas de estoque baixo
- Movimentações recentes

### Vendas
- Resumo por período
- Performance por funcionário
- Produtos mais vendidos
- Categorias com maior faturamento

### Funcionários
- Atividade por funcionário
- Vendas por equipe
- Status e cargos

## 🎨 Design System

### Cores Principais
- **Primary**: #C1121F (Vermelho do BAR DO CARNEIRO)
- **Accent**: #F2B705 (Dourado)
- **Success**: #0E9F6E (Verde)
- **Warning**: #F59E0B (Amarelo)
- **Danger**: #DC2626 (Vermelho)

### Componentes
- Cards com bordas arredondadas (2xl)
- Sombras suaves e transições
- Botões com estados hover/focus
- Formulários com validação visual

## 📱 Responsividade

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Sidebar**: Colapsável em dispositivos móveis
- **Tabelas**: Scroll horizontal em telas pequenas

## 🔒 Segurança

- **Validação**: Todos os dados são validados
- **Sanitização**: Prevenção de injeção SQL
- **CORS**: Configurado para desenvolvimento
- **Helmet**: Headers de segurança

## 🧪 Testes

```bash
# Testar backend
npm run server

# Testar frontend
cd client
npm start

# Verificar API
curl http://localhost:5000/api/health
```

## 🚀 Deploy

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
# Build do frontend
cd client
npm run build
cd ..

# Iniciar servidor
NODE_ENV=production npm start
```

## 📝 Logs

- **Morgan**: Logs de requisições HTTP
- **Console**: Logs de operações do banco
- **Erros**: Tratamento centralizado de erros

## 🔄 Backup e Restore

### Backup
```bash
# Copiar arquivo do banco
cp server/database.sqlite backup_$(date +%Y%m%d_%H%M%S).sqlite
```

### Restore
```bash
# Substituir arquivo do banco
cp backup.sqlite server/database.sqlite
```

## 🐛 Troubleshooting

### Problemas Comuns

1. **Porta já em uso**
   ```bash
   # Verificar processos
   lsof -i :5000
   # Matar processo
   kill -9 <PID>
   ```

2. **Banco não conecta**
   ```bash
   # Verificar permissões
   ls -la server/database.sqlite
   # Recriar banco
   npm run setup-db
   ```

3. **Dependências não instalam**
   ```bash
   # Limpar cache
   npm cache clean --force
   # Reinstalar
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📞 Suporte

- **Issues**: Reportar bugs via GitHub Issues
- **Documentação**: Este README e comentários no código
- **Comunidade**: Contribuições são bem-vindas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para detalhes.

## 🙏 Agradecimentos

- Equipe do BAR DO CARNEIRO
- Comunidade Node.js e React
- Contribuidores do projeto

---

**🍺 BAR DO CARNEIRO - Sistema de Gestão v1.0**

Desenvolvido com ❤️ para o melhor bar da cidade!
