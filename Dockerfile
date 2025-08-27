# Dockerfile para Railway - Backend apenas
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar package.json e package-lock.json
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código do servidor
COPY server/ ./server/

# Expor porta
EXPOSE 5000

# Comando para iniciar apenas o backend
CMD ["npm", "start"]
