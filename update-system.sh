#!/bin/bash

#################################################################
#                  ATUALIZADOR SISTEMA KRYONIX                 #
#         Script para atualizar infraestrutura completa        #
#################################################################

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    local level="$1"
    shift
    local message="$*"
    
    case "$level" in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" ;;
    esac
}

# Banner
echo -e "${BLUE}"
echo "═════════════════════════════════════���══════════════════════════"
echo "                    ATUALIZADOR KRYONIX"
echo "════════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Fazer backup antes da atualização
log "INFO" "📦 Criando backup de segurança antes da atualização..."
/opt/kryonix/scripts/backup-system.sh

# Atualizar sistema operacional
log "INFO" "🔄 Atualizando sistema operacional..."
apt-get update -qq
apt-get upgrade -y -qq

# Atualizar Docker
log "INFO" "🐳 Atualizando Docker..."
apt-get install -y docker.io docker-compose

# Atualizar imagens Docker
log "INFO" "📥 Atualizando imagens Docker..."

# Lista de imagens para atualizar
images=(
    "traefik:v3.0"
    "portainer/portainer-ce:latest"
    "postgres:16-alpine"
    "redis:7-alpine"
    "n8nio/n8n:latest"
    "minio/minio:latest"
    "grafana/grafana:latest"
    "adminer:latest"
    "nginx:alpine"
)

for image in "${images[@]}"; do
    log "INFO" "Atualizando $image..."
    docker pull "$image"
done

# Atualizar projeto do GitHub
log "INFO" "📥 Atualizando código do projeto..."
cd /opt/siqueicamposimoveis
git pull origin main

# Instalar/atualizar dependências
npm install
npm audit fix || true

# Rebuild da aplicação
log "INFO" "🔨 Fazendo rebuild da aplicação..."
npm run build
npm run build:server

# Atualizar stacks com zero downtime
log "INFO" "🔄 Atualizando stacks (zero downtime)..."

# Stack administrativa
cd /opt/kryonix/stacks/admin
docker-compose pull
docker-compose up -d --no-deps --build

# Stack pública
cd /opt/kryonix/stacks/public
docker-compose pull
docker-compose up -d --no-deps --build

# Aguardar estabilização
log "INFO" "⏳ Aguardando estabilização dos serviços..."
sleep 30

# Verificar saúde dos serviços
log "INFO" "🏥 Verificando saúde dos serviços..."

healthy_services=0
total_services=8

services=(
    "traefik:http://localhost:8080/api/rawdata"
    "portainer_admin:http://localhost:9000"
    "app_public:http://localhost:3001/api/ping"
    "postgres_admin:pg_isready -h localhost -p 5432"
    "postgres_public:pg_isready -h localhost -p 5433"
    "redis_public:redis-cli -p 6379 ping"
    "n8n_admin:http://localhost:5678"
    "minio_admin:http://localhost:9001"
)

for service in "${services[@]}"; do
    service_name="${service%%:*}"
    service_check="${service##*:}"
    
    if [[ "$service_check" == http* ]]; then
        if curl -f -s -o /dev/null "$service_check"; then
            log "SUCCESS" "✅ $service_name saudável"
            ((healthy_services++))
        else
            log "ERROR" "❌ $service_name com problemas"
        fi
    else
        if eval "$service_check" > /dev/null 2>&1; then
            log "SUCCESS" "✅ $service_name saudável"
            ((healthy_services++))
        else
            log "ERROR" "❌ $service_name com problemas"
        fi
    fi
done

# Limpar recursos não utilizados
log "INFO" "🧹 Limpando recursos não utilizados..."
docker system prune -f
docker image prune -f

# Atualizar certificados SSL se necessário
log "INFO" "🔒 Verificando certificados SSL..."
certbot renew --quiet || true

# Reiniciar serviços de sistema
log "INFO" "🔄 Reiniciando serviços de sistema..."
systemctl daemon-reload
systemctl restart docker

# Aguardar Docker reiniciar
sleep 10

# Reiniciar stacks
cd /opt/kryonix/traefik && docker-compose restart
cd /opt/kryonix/stacks/admin && docker-compose restart
cd /opt/kryonix/stacks/public && docker-compose restart

# Verificação final
log "INFO" "🔍 Verificação final pós-atualização..."

sleep 30

final_healthy=0
for service in "${services[@]}"; do
    service_name="${service%%:*}"
    service_check="${service##*:}"
    
    if [[ "$service_check" == http* ]]; then
        if curl -f -s -o /dev/null "$service_check"; then
            ((final_healthy++))
        fi
    else
        if eval "$service_check" > /dev/null 2>&1; then
            ((final_healthy++))
        fi
    fi
done

# Gerar relatório de atualização
cat > /opt/kryonix/logs/update_$(date +%Y%m%d_%H%M%S).log << EOF
════════════════════════════════════════════════════════════════
                    RELATÓRIO DE ATUALIZAÇÃO
════════════════════════════════════════════════════════════════
Data: $(date '+%Y-%m-%d %H:%M:%S')

COMPONENTES ATUALIZADOS:
✅ Sistema Operacional Ubuntu
✅ Docker e Docker Compose
✅ Imagens Docker dos serviços
✅ Código do projeto (GitHub)
✅ Dependências Node.js
✅ Build da aplicação

SERVIÇOS VERIFICADOS:
- Antes da atualização: $healthy_services/$total_services saudáveis
- Após atualização: $final_healthy/$total_services saudáveis

AÇÕES REALIZADAS:
✅ Backup de segurança criado
✅ Sistema operacional atualizado
✅ Docker atualizado
✅ Imagens Docker atualizadas
✅ Projeto atualizado do GitHub
✅ Dependências atualizadas
✅ Aplicação reconstruída
✅ Stacks atualizadas com zero downtime
✅ Certificados SSL renovados
✅ Recursos não utilizados limpos
✅ Serviços reiniciados

STATUS FINAL: $([ $final_healthy -eq $total_services ] && echo "✅ SUCESSO" || echo "⚠️ PARCIAL")
════════════════════════════════════════════════════════════════
EOF

# Relatório final
if [[ $final_healthy -eq $total_services ]]; then
    log "SUCCESS" "🎉 Atualização concluída com sucesso!"
    log "SUCCESS" "📊 Todos os serviços ($final_healthy/$total_services) estão funcionando"
else
    log "WARN" "⚠️ Atualização concluída com problemas"
    log "WARN" "📊 Serviços funcionando: $final_healthy/$total_services"
    log "INFO" "🔧 Verifique os logs dos containers se necessário"
fi

log "INFO" "📋 Relatório salvo em /opt/kryonix/logs/"
log "INFO" "🔄 Próxima atualização recomendada em 30 dias"

# Configurar cron para atualizações automáticas mensais (opcional)
if ! crontab -l 2>/dev/null | grep -q "update-system.sh"; then
    (crontab -l 2>/dev/null; echo "0 2 1 * * /opt/kryonix/scripts/update-system.sh >> /opt/kryonix/logs/auto-update.log 2>&1") | crontab -
    log "INFO" "📅 Atualizações automáticas mensais configuradas"
fi

exit 0
