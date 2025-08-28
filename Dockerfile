# Dockerfile para Railway - Frontend + Backend
FROM node:18-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar TUDO de uma vez
COPY . .

# Instalar dependências da raiz
RUN npm ci --only=production

# Instalar dependências do client
RUN cd client && npm ci --only=production

# Fazer build do frontend
RUN cd client && npm run build

# Expor porta
EXPOSE 5000

# Comando para iniciar o servidor
CMD ["npm", "start"]
