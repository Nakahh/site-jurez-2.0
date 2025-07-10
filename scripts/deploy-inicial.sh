#!/bin/bash

# Script de Deploy Inicial do Sistema de Auto-Deploy
# Siqueira Campos Imóveis

set -e

echo "🚀 Configurando Sistema de Auto-Deploy"
echo "======================================"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se está rodando como root (para Docker)
if [[ $EUID -eq 0 ]]; then
   log_warning "Executando como root - modo Docker detectado"
   IS_DOCKER=true
else
   log_info "Executando como usuário normal"
   IS_DOCKER=false
fi

# Criar diretórios necessários
log_info "Criando diretórios..."
mkdir -p scripts logs ssl

# Dar permissões aos scripts
log_info "Configurando permissões..."
if command -v chmod &> /dev/null; then
    chmod +x scripts/*.sh 2>/dev/null || true
    log_success "Permissões configuradas"
fi

# Verificar dependências
log_info "Verificando dependências..."

# Git
if ! command -v git &> /dev/null; then
    log_error "Git não encontrado! Instale o Git primeiro."
    exit 1
fi
log_success "Git encontrado"

# Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js não encontrado! Instale o Node.js primeiro."
    exit 1
fi
log_success "Node.js encontrado: $(node --version)"

# npm
if ! command -v npm &> /dev/null; then
    log_error "npm não encontrado!"
    exit 1
fi
log_success "npm encontrado: $(npm --version)"

# Docker (opcional)
if command -v docker &> /dev/null; then
    log_success "Docker encontrado: $(docker --version | head -1)"
    HAS_DOCKER=true
else
    log_warning "Docker não encontrado - deploy manual será usado"
    HAS_DOCKER=false
fi

# Configurar Git se necessário
log_info "Configurando Git..."
git config --global --add safe.directory $(pwd) 2>/dev/null || true
if [ -z "$(git config user.name)" ]; then
    git config user.name "Auto Deploy"
    git config user.email "deploy@siqueicampos.com.br"
    log_success "Git configurado"
fi

# Verificar se é um repositório Git
if [ ! -d ".git" ]; then
    log_warning "Não é um repositório Git - inicializando..."
    git init
    git remote add origin https://github.com/Nakahh/site-jurez-2.0.git || true
fi

# Testar build
log_info "Testando build..."
if npm run build &>/dev/null; then
    log_success "Build funcionando"
else
    log_warning "Build pode ter problemas - verifique dependências"
fi

# Configurar webhook secret se não existir
WEBHOOK_SECRET_FILE=".webhook-secret"
if [ ! -f "$WEBHOOK_SECRET_FILE" ]; then
    log_info "Gerando secret do webhook..."
    WEBHOOK_SECRET=$(openssl rand -hex 32 2>/dev/null || date +%s | sha256sum | base64 | head -c 32)
    echo "$WEBHOOK_SECRET" > "$WEBHOOK_SECRET_FILE"
    echo "GITHUB_WEBHOOK_SECRET=$WEBHOOK_SECRET" >> .env 2>/dev/null || true
    log_success "Secret gerado: $WEBHOOK_SECRET"
    log_warning "IMPORTANTE: Configure este secret no GitHub!"
else
    WEBHOOK_SECRET=$(cat "$WEBHOOK_SECRET_FILE")
    log_success "Secret existente carregado"
fi

# Escolher método de deploy
echo ""
log_info "Escolha o método de deploy:"
echo "1) Docker Compose (Recomendado)"
echo "2) Docker simples"
echo "3) Manual (sem Docker)"
echo "4) Apenas configurar (não fazer deploy agora)"

read -p "Escolha (1-4): " DEPLOY_METHOD

case $DEPLOY_METHOD in
    1)
        log_info "Configurando Docker Compose..."
        if [ "$HAS_DOCKER" = true ]; then
            # Parar containers existentes
            docker-compose down 2>/dev/null || true
            
            # Fazer deploy com auto-deploy
            docker-compose -f docker-compose.autodeploy.yml up -d --build
            
            log_success "Docker Compose iniciado!"
            log_info "Verifique os logs: docker-compose -f docker-compose.autodeploy.yml logs -f"
        else
            log_error "Docker não disponível"
            exit 1
        fi
        ;;
    2)
        log_info "Configurando Docker simples..."
        if [ "$HAS_DOCKER" = true ]; then
            docker build -f Dockerfile.autodeploy -t siqueira-campos:latest .
            
            docker run -d \
                --name siqueira-campos-app \
                -p 3000:3000 \
                -p 3001:3001 \
                -e GITHUB_WEBHOOK_SECRET="$WEBHOOK_SECRET" \
                -v $(pwd):/app \
                --restart unless-stopped \
                siqueira-campos:latest
            
            log_success "Container Docker iniciado!"
            log_info "Verifique os logs: docker logs siqueira-campos-app"
        else
            log_error "Docker não disponível"
            exit 1
        fi
        ;;
    3)
        log_info "Configurando deploy manual..."
        npm ci
        npm run build
        log_success "Build manual concluído!"
        log_warning "Você precisará configurar um servidor web (nginx, apache, etc.)"
        log_warning "E um gerenciador de processos (PM2, systemd, etc.)"
        ;;
    4)
        log_info "Apenas configuração realizada"
        ;;
    *)
        log_error "Opção inválida"
        exit 1
        ;;
esac

# Resumo final
echo ""
log_success "=== CONFIGURAÇÃO CONCLUÍDA ==="
echo ""
log_info "📋 Próximos passos:"
echo "1. Configure o webhook no GitHub (veja WEBHOOK_SETUP.md)"
echo "2. URL do webhook: https://seu-dominio.com.br/api/webhook/github"
echo "3. Secret do webhook: $WEBHOOK_SECRET"
echo "4. Teste fazendo um push para a branch main"
echo ""
log_info "📁 Arquivos importantes:"
echo "- WEBHOOK_SETUP.md (guia completo)"
echo "- scripts/auto-deploy.sh (script principal)"
echo "- docker-compose.autodeploy.yml (Docker Compose)"
echo "- .webhook-secret (secret do webhook)"
echo ""
log_info "🔍 Para monitorar:"
if [ "$DEPLOY_METHOD" = "1" ]; then
    echo "- docker-compose -f docker-compose.autodeploy.yml logs -f"
elif [ "$DEPLOY_METHOD" = "2" ]; then
    echo "- docker logs siqueira-campos-app"
fi
echo "- curl http://localhost:3001/api/ping"
echo ""
log_success "Sistema de auto-deploy configurado! 🎉"
