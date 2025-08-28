# Dockerfile para Railway - Frontend + Backend
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json da raiz
COPY package*.json ./

# Instalar dependências da raiz
RUN npm ci --only=production

# Copiar pasta client
COPY client/ ./client/

# Instalar dependências do client
RUN cd client && npm ci --only=production

# Fazer build do frontend
RUN cd client && npm run build

# Copiar código do servidor
COPY server/ ./server/

# Expor porta
EXPOSE 5000

# Comando para iniciar o servidor
CMD ["npm", "start"]
