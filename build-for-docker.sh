#!/bin/bash

echo "🚀 Preparando build para Docker..."

# Fazer build do frontend
echo "📦 Fazendo build do frontend..."
cd client
npm install
npm run build
cd ..

echo "✅ Build concluído! Arquivos prontos para Docker."
