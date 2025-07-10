#!/bin/bash

# Script de Auto-Deploy específico para Docker
# Executado automaticamente via webhook do GitHub

set -e

echo "🐳 Iniciando auto-deploy Docker..."
echo "📅 $(date)"

# Variáveis
REPO_URL="https://github.com/Nakahh/site-jurez-2.0.git"
PROJECT_NAME="siqueira-campos"
CONTAINER_NAME="${PROJECT_NAME}-app"

# Função para log
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1"
}

log "📥 Fazendo backup da versão atual..."
docker commit "$CONTAINER_NAME" "${PROJECT_NAME}:backup-$(date +%Y%m%d-%H%M%S)" || log "⚠️ Backup falhou - continuando..."

log "📥 Baixando últimas mudanças..."
# Se estamos dentro do container, fazer pull
if [ -d ".git" ]; then
    git fetch origin main
    git reset --hard origin/main
else
    # Se não, baixar uma nova cópia
    rm -rf /tmp/deploy
    git clone "$REPO_URL" /tmp/deploy
    rsync -av --exclude='.git' /tmp/deploy/ ./
fi

log "📦 Instalando dependências..."
npm ci --production=false

log "🏗️ Executando build..."
npm run build

log "🧪 Verificando build..."
[ -d "dist" ] && log "✅ Build gerado com sucesso" || log "❌ Erro no build"

log "🔄 Reiniciando serviços..."
# Tentar diferentes métodos de restart
if command -v supervisorctl &> /dev/null; then
    supervisorctl restart all
    log "✅ Supervisor reiniciado"
elif [ -f "/app/server/start.ts" ]; then
    # Restart do processo Node.js
    pkill -f "tsx.*server/start.ts" || true
    nohup npm run dev:server > /dev/null 2>&1 &
    log "✅ Servidor Node.js reiniciado"
fi

log "✅ Auto-deploy Docker concluído!"

# Log para auditoria
mkdir -p /var/log
echo "$(date): Auto-deploy Docker executado via GitHub webhook" >> /var/log/auto-deploy.log
