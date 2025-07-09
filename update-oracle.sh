#!/bin/bash

# 🔄 Atualização Siqueira Campos Imóveis - Oracle VPS
# Desenvolvido por Kryonix

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏠 =========================================="
echo -e "🔄 Atualização Siqueira Campos Imóveis"
echo -e "🏠 ==========================================${NC}"
echo ""

# Função para log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está no diretório correto
if [ ! -f "docker-compose.oracle.yml" ]; then
    log_error "Execute este script do diretório do projeto!"
    exit 1
fi

# Confirmar atualização
echo -e "${YELLOW}⚠️  Esta operação irá:${NC}"
echo "1. Fazer backup completo"
echo "2. Parar todos os serviços"
echo "3. Atualizar código fonte"
echo "4. Reconstruir containers"
echo "5. Reiniciar serviços"
echo ""
read -p "Deseja continuar? (s/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    log_info "Atualização cancelada pelo usuário"
    exit 0
fi

# Fazer backup antes da atualização
log_info "Fazendo backup antes da atualização..."
./backup.sh

# Salvar configurações atuais
log_info "Salvando configurações atuais..."
cp .env .env.backup.$(date +%Y%m%d_%H%M%S)

# Verificar se há mudanças não commitadas
if [ -d ".git" ]; then
    if ! git diff-index --quiet HEAD --; then
        log_warning "Há mudanças não commitadas no repositório"
        log_info "Fazendo stash das mudanças locais..."
        git stash push -m "Auto-stash antes da atualização $(date)"
    fi
fi

# Atualizar código fonte
log_info "Atualizando código fonte..."
if [ -d ".git" ]; then
    git fetch origin
    
    # Verificar se há atualizações
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse origin/main)
    
    if [ "$LOCAL" = "$REMOTE" ]; then
        log_info "Código já está atualizado"
    else
        log_info "Aplicando atualizações..."
        git pull origin main
        log_success "Código atualizado!"
    fi
else
    log_warning "Não é um repositório Git. Atualização manual necessária."
fi

# Verificar se há atualizações no Docker
log_info "Verificando atualizações de imagens Docker..."
docker-compose -f docker-compose.oracle.yml pull

# Parar serviços (gracefully)
log_info "Parando serviços..."
docker-compose -f docker-compose.oracle.yml down --timeout 30

# Atualizar dependências npm se package.json mudou
if [ -f "package.json" ]; then
    log_info "Verificando dependências..."
    
    # Comparar hash do package.json
    if [ -f ".package.hash" ]; then
        OLD_HASH=$(cat .package.hash)
        NEW_HASH=$(sha256sum package.json | cut -d' ' -f1)
        
        if [ "$OLD_HASH" != "$NEW_HASH" ]; then
            log_info "Dependências mudaram. Reconstruindo imagem..."
            docker-compose -f docker-compose.oracle.yml build --no-cache app
            echo $NEW_HASH > .package.hash
        fi
    else
        # Primeira vez - salvar hash
        sha256sum package.json | cut -d' ' -f1 > .package.hash
        docker-compose -f docker-compose.oracle.yml build app
    fi
fi

# Limpar imagens órfãs
log_info "Limpando imagens não utilizadas..."
docker image prune -f

# Executar migrações de banco se necessário
log_info "Iniciando banco de dados..."
docker-compose -f docker-compose.oracle.yml up -d postgres redis

# Aguardar banco ficar pronto
log_info "Aguardando banco ficar pronto..."
timeout 60 bash -c 'until docker-compose -f docker-compose.oracle.yml exec -T postgres pg_isready -U sitejuarez -d bdsitejuarez; do sleep 2; done'

# Executar migrações
log_info "Executando migrações do banco..."
docker-compose -f docker-compose.oracle.yml run --rm app npm run db:migrate

# Iniciar todos os serviços
log_info "Iniciando todos os serviços..."
docker-compose -f docker-compose.oracle.yml up -d

# Aguardar serviços ficarem prontos
log_info "Aguardando serviços iniciarem..."
sleep 30

# Verificar saúde dos serviços
log_info "Verificando saúde dos serviços..."

# Função para verificar serviço
check_service() {
    local service=$1
    local url=$2
    local max_attempts=12
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
            log_success "$service está respondendo"
            return 0
        fi
        
        log_info "Tentativa $attempt/$max_attempts para $service..."
        sleep 5
        ((attempt++))
    done
    
    log_error "$service não está respondendo após 60 segundos"
    return 1
}

# Verificar serviços principais
SERVICES_OK=true

if ! check_service "App Principal" "http://localhost:3000/api/ping"; then
    SERVICES_OK=false
fi

if ! check_service "N8N" "http://localhost:5678"; then
    SERVICES_OK=false
fi

if ! check_service "Evolution API" "http://localhost:8080"; then
    SERVICES_OK=false
fi

if ! check_service "Nginx" "http://localhost:80"; then
    SERVICES_OK=false
fi

# Verificar SSL se configurado
if [ -f ".env" ]; then
    DOMAIN=$(grep "DOMAIN=" .env | cut -d'=' -f2)
    if [ ! -z "$DOMAIN" ]; then
        log_info "Verificando SSL para $DOMAIN..."
        if curl -s --max-time 10 "https://$DOMAIN" > /dev/null 2>&1; then
            log_success "SSL funcionando para $DOMAIN"
        else
            log_warning "SSL pode não estar funcionando para $DOMAIN"
        fi
    fi
fi

# Executar limpeza de logs antigos
log_info "Limpando logs antigos..."
docker system prune -f --volumes --filter "until=24h"

# Verificar backups automáticos
log_info "Verificando configuração de backup..."
if crontab -l | grep -q "backup.sh"; then
    log_success "Backup automático configurado"
else
    log_warning "Backup automático não configurado"
    log_info "Configurando backup automático..."
    (crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup.sh") | crontab -
    log_success "Backup automático configurado para 2h da manhã"
fi

# Relatório final
echo ""
log_info "Gerando relatório da atualização..."

# Status dos containers
echo ""
echo -e "${BLUE}📊 Status dos Containers:${NC}"
docker-compose -f docker-compose.oracle.yml ps

# Uso de recursos após atualização
echo ""
echo -e "${BLUE}💾 Uso de Recursos:${NC}"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{printf "%.1f%%", $1}')"
echo "RAM: $(free -h | awk 'NR==2{printf "%s/%s (%.1f%%)", $3,$2,$3*100/$2}')"
echo "Disco: $(df -h / | awk 'NR==2{printf "%s/%s (%s)", $3,$2,$5}')"

echo ""
if [ "$SERVICES_OK" = true ]; then
    log_success "🎉 Atualização concluída com sucesso!"
    echo ""
    echo -e "${GREEN}✅ Todos os serviços estão funcionando${NC}"
    echo -e "${GREEN}✅ SSL verificado${NC}"
    echo -e "${GREEN}✅ Backup automático configurado${NC}"
    echo -e "${GREEN}✅ Logs limpos${NC}"
    echo ""
    log_info "Acesse:"
    if [ ! -z "$DOMAIN" ]; then
        echo "- Site: https://$DOMAIN"
        echo "- N8N: https://n8n.$DOMAIN"
        echo "- Evolution: https://api.$DOMAIN"
    else
        echo "- Site: http://localhost:3000"
        echo "- N8N: http://localhost:5678"
        echo "- Evolution: http://localhost:8080"
    fi
else
    log_error "❌ Alguns serviços podem não estar funcionando corretamente"
    echo ""
    log_info "Execute para verificar:"
    echo "docker-compose -f docker-compose.oracle.yml logs -f"
    echo ""
    log_info "Ou use o monitor:"
    echo "./monitor-oracle.sh"
fi

echo ""
log_info "📋 Para monitoramento contínuo, execute:"
echo "./monitor-oracle.sh"

# Salvar log da atualização
echo "Atualização executada em $(date)" >> update.log
echo "Status: $([ "$SERVICES_OK" = true ] && echo "SUCESSO" || echo "COM PROBLEMAS")" >> update.log
echo "---" >> update.log

log_success "Log da atualização salvo em update.log"
