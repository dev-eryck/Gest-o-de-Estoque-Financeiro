# Dockerfile para Railway - Frontend + Backend
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Limpar cache do npm
RUN npm cache clean --force

# Copiar package.json e package-lock.json da raiz
COPY package*.json ./

# Instalar dependências da raiz
RUN npm ci --only=production

# Copiar TODA a pasta client (incluindo build, src, public, etc.)
COPY client/ ./client/

# Verificar se os arquivos foram copiados
RUN ls -la client/ && ls -la client/build/

# Copiar código do servidor
COPY server/ ./server/

# Expor porta
EXPOSE 5000

# Comando para iniciar o servidor
CMD ["npm", "start"]
