# 🚀 Guia de Deploy - BAR DO CARNEIRO

## 📋 Pré-requisitos

- [GitHub](https://github.com) - Conta gratuita
- [Vercel](https://vercel.com) - Conta gratuita
- [Railway](https://railway.app) - Conta gratuita

## 🔧 Passo a Passo do Deploy

### 1. Preparar o Repositório GitHub

```bash
# Criar repositório no GitHub
git init
git add .
git commit -m "Primeira versão do sistema BAR DO CARNEIRO"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/bar-do-carneiro.git
git push -u origin main
```

### 2. Deploy do Backend no Railway

1. **Acesse [Railway.app](https://railway.app)**
2. **Faça login com GitHub**
3. **Clique em "New Project"**
4. **Selecione "Deploy from GitHub repo"**
5. **Escolha seu repositório**
6. **Configure as variáveis de ambiente:**

```env
NODE_ENV=production
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
CORS_ORIGIN=https://seu-dominio.vercel.app
```

7. **Aguarde o deploy e copie a URL gerada**

### 3. Deploy do Frontend no Vercel

1. **Acesse [Vercel.com](https://vercel.com)**
2. **Faça login com GitHub**
3. **Clique em "New Project"**
4. **Importe seu repositório**
5. **Configure o projeto:**

- **Framework Preset:** Create React App
- **Root Directory:** `client`
- **Build Command:** `npm run build`
- **Output Directory:** `build`
- **Install Command:** `npm install`

6. **Adicione as variáveis de ambiente:**

```env
REACT_APP_API_URL=https://sua-url-railway.railway.app
```

7. **Clique em "Deploy"**

### 4. Configurar Domínio Personalizado (Opcional)

1. **No Vercel, vá em "Settings" > "Domains"**
2. **Adicione seu domínio** (ex: `sistema.bardocarneiro.com.br`)
3. **Configure os registros DNS** conforme instruções do Vercel

## 🔒 Configurações de Segurança

### JWT Secret
```bash
# Gere uma chave segura
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### CORS
```javascript
// No servidor, configure apenas seu domínio
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'https://seu-dominio.vercel.app',
  credentials: true
}));
```

## 📱 Acesso Multi-dispositivo

Após o deploy, você poderá acessar o sistema de:

- 📱 **Smartphones** (Android/iOS)
- 💻 **Tablets**
- 🖥️ **Computadores**
- 🌐 **Qualquer navegador web**

## 🔄 Atualizações Automáticas

- **Push para GitHub** = Deploy automático
- **Sem necessidade de reiniciar servidores**
- **Zero downtime** durante atualizações

## 💰 Custos

- **Vercel:** Gratuito (até 100GB de banda/mês)
- **Railway:** Gratuito (até $5 de crédito/mês)
- **Domínio:** ~R$ 30/ano (opcional)

## 🆘 Suporte

- **Vercel:** [docs.vercel.com](https://docs.vercel.com)
- **Railway:** [docs.railway.app](https://docs.railway.app)
- **GitHub:** [docs.github.com](https://docs.github.com)

---

## 🎯 Próximos Passos

1. **Fazer push do código para GitHub**
2. **Deploy no Railway (Backend)**
3. **Deploy no Vercel (Frontend)**
4. **Configurar domínio personalizado**
5. **Testar em diferentes dispositivos**

**🎉 Seu sistema estará rodando na nuvem!**
