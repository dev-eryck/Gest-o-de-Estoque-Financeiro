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

# Copiar cada pasta do client separadamente para garantir que tudo seja incluído
COPY client/package*.json ./client/
COPY client/src/ ./client/src/
COPY client/public/ ./client/public/
COPY client/tailwind.config.js ./client/
COPY client/postcss.config.js ./client/

# Verificar o que foi copiado
RUN echo "=== CONTEÚDO DA PASTA CLIENT ===" && ls -la client/
RUN echo "=== CONTEÚDO DA PASTA PUBLIC ===" && ls -la client/public/
RUN echo "=== CONTEÚDO DA PASTA SRC ===" && ls -la client/src/

# Instalar dependências do client
RUN cd client && npm ci --only=production

# Fazer build do frontend
RUN cd client && npm run build

# Verificar se os arquivos foram criados
RUN echo "=== CONTEÚDO DA PASTA BUILD ===" && ls -la client/build/

# Copiar código do servidor
COPY server/ ./server/

# Expor porta
EXPOSE 5000

# Comando para iniciar o servidor
CMD ["npm", "start"]
