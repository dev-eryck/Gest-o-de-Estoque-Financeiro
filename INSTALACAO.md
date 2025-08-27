# 🚀 Instalação Rápida - BAR DO CARNEIRO

## ⚡ Setup em 5 minutos

### 1. Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn

### 2. Clone e Instalação
```bash
# Clone o repositório
git clone <url-do-repositorio>
cd bar-do-carneiro-sistema

# Instale todas as dependências
npm run install-all
```

### 3. Configure o Banco
```bash
# Configura banco SQLite e insere dados iniciais
npm run setup-db
```

### 4. Inicie o Sistema
```bash
# Inicia backend e frontend simultaneamente
npm run dev
```

## 🌐 Acesso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 📊 Dados Iniciais
O sistema já vem com:
- 6 categorias (Cervejas, Destilados, Vinhos, etc.)
- 5 produtos de exemplo
- 3 funcionários
- Vendas e movimentações de exemplo

## 🔧 Comandos Úteis

```bash
# Apenas backend
npm run server

# Apenas frontend
npm run client

# Recriar banco com dados
npm run setup-db

# Apenas inserir dados
npm run seed

# Build de produção
npm run build
```

## 🐛 Troubleshooting

### Porta já em uso
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :5000
kill -9 <PID>
```

### Erro de dependências
```bash
# Limpar cache
npm cache clean --force

# Reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Banco não conecta
```bash
# Verificar arquivo
ls -la server/database.sqlite

# Recriar banco
npm run setup-db
```

## 📱 Primeiro Acesso
1. O sistema inicia com dados de exemplo
2. Use os dados existentes ou crie novos
3. Todas as funcionalidades estão disponíveis
4. Sistema totalmente responsivo

## 🎯 Próximos Passos
- Personalizar cores e logo
- Configurar notificações
- Adicionar mais funcionalidades
- Deploy em produção

---

**🍺 BAR DO CARNEIRO - Sistema de Gestão v1.0**

Sistema completo e funcional desde o primeiro acesso!
