#!/bin/bash

# Script de Auto-Deploy para Siqueira Campos Imóveis
# Executado automaticamente via webhook do GitHub

set -e

echo "🚀 Iniciando auto-deploy..."
echo "📅 $(date)"

# Diretório do projeto
PROJECT_DIR="/app"
cd "$PROJECT_DIR"

echo "📥 Fazendo pull das mudanças do GitHub..."
git fetch origin main
git reset --hard origin/main

echo "📦 Instalando dependências..."
npm ci --production=false

echo "🏗️ Executando build..."
npm run build

echo "🧪 Executando testes básicos..."
npm run typecheck

echo "🔄 Reiniciando aplicação..."
# Se estiver usando PM2
if command -v pm2 &> /dev/null; then
    pm2 restart all
    echo "✅ PM2 reiniciado"
# Se estiver usando systemd
elif systemctl is-active --quiet siqueira-app; then
    sudo systemctl restart siqueira-app
    echo "✅ Systemd service reiniciado"
# Se estiver em Docker
elif [ -f "docker-compose.yml" ]; then
    docker-compose restart
    echo "✅ Docker containers reiniciados"
else
    echo "⚠️ Método de restart não identificado - pode precisar de reinício manual"
fi

echo "✅ Auto-deploy concluído com sucesso!"
echo "📅 $(date)"

# Log para auditoria
echo "$(date): Auto-deploy executado via GitHub webhook" >> /var/log/auto-deploy.log
