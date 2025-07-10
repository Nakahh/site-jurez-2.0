#!/bin/bash

# Script de Teste do Sistema de Auto-Deploy
# Siqueira Campos Imóveis

set -e

echo "🧪 Testando Sistema de Auto-Deploy"
echo "=================================="

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Teste 1: API básica
log_info "Testando API básica..."
if curl -f http://localhost:3001/api/ping >/dev/null 2>&1; then
    log_success "API respondendo"
else
    log_error "API não está respondendo"
    exit 1
fi

# Teste 2: Frontend
log_info "Testando frontend..."
if curl -f http://localhost:3000 >/dev/null 2>&1; then
    log_success "Frontend respondendo"
else
    log_error "Frontend não está respondendo"
    exit 1
fi

# Teste 3: Endpoint do webhook
log_info "Testando endpoint do webhook..."
RESPONSE=$(curl -s -X POST \
    -H "Content-Type: application/json" \
    -H "X-GitHub-Event: ping" \
    -d '{"zen":"testing"}' \
    http://localhost:3001/api/webhook/github)

if echo "$RESPONSE" | grep -q "Unauthorized"; then
    log_success "Webhook endpoint funcionando (rejeitando requisições não autenticadas)"
else
    log_error "Webhook endpoint não está funcionando corretamente"
fi

# Teste 4: Build
log_info "Testando build..."
if npm run build >/dev/null 2>&1; then
    log_success "Build funcionando"
else
    log_error "Build falhando"
    exit 1
fi

# Teste 5: TypeCheck
log_info "Testando TypeScript..."
if npm run typecheck >/dev/null 2>&1; then
    log_success "TypeScript OK"
else
    log_error "Erros de TypeScript encontrados"
fi

# Teste 6: Estrutura de arquivos
log_info "Verificando estrutura de arquivos..."
REQUIRED_FILES=(
    "scripts/auto-deploy.sh"
    "scripts/docker-deploy.sh" 
    "server/routes/webhook.ts"
    "Dockerfile.autodeploy"
    "docker-compose.autodeploy.yml"
    "WEBHOOK_SETUP.md"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        log_success "$file existe"
    else
        log_error "$file não encontrado"
    fi
done

# Teste 7: Variáveis de ambiente
log_info "Verificando configurações..."
if [ -f ".env" ] && grep -q "GITHUB_WEBHOOK_SECRET" .env; then
    log_success "Variável GITHUB_WEBHOOK_SECRET configurada"
elif [ -f ".webhook-secret" ]; then
    log_success "Arquivo .webhook-secret encontrado"
else
    log_error "Secret do webhook não configurado"
fi

# Resumo
echo ""
log_success "=== RESUMO DOS TESTES ==="
echo ""
log_info "🌐 API: http://localhost:3001/api/ping"
log_info "🖥️  Frontend: http://localhost:3000"
log_info "🪝 Webhook: /api/webhook/github"
echo ""
log_info "📋 Para deploy completo:"
echo "1. Execute: bash scripts/deploy-inicial.sh"
echo "2. Configure o webhook no GitHub (veja WEBHOOK_SETUP.md)"
echo "3. Faça um push para testar"
echo ""
log_success "Sistema pronto para auto-deploy! 🚀"
