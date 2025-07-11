#!/bin/bash

#################################################################
#                  RESTAURAÇÃO DE BACKUP KRYONIX               #
#           Script para restaurar infraestrutura               #
#################################################################

set -euo pipefail

# Verificar parâmetros
if [[ $# -ne 1 ]]; then
    echo "Uso: $0 <data_backup>"
    echo "Exemplo: $0 20240101_120000"
    exit 1
fi

BACKUP_DATE="$1"
BACKUP_DIR="/opt/kryonix/backups"
BACKUP_FILE="$BACKUP_DIR/backup_completo_$BACKUP_DATE.tar.gz"
RESTORE_DIR="/tmp/restore_$BACKUP_DATE"

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

# Verificar se backup existe
if [[ ! -f "$BACKUP_FILE" ]]; then
    log "ERROR" "Backup não encontrado: $BACKUP_FILE"
    exit 1
fi

log "INFO" "🔄 Iniciando restauração do backup $BACKUP_DATE..."

# Criar diretório temporário
mkdir -p "$RESTORE_DIR"
cd "$RESTORE_DIR"

# Extrair backup
log "INFO" "📦 Extraindo backup..."
tar -xzf "$BACKUP_FILE"

# Verificar integridade
if [[ -f "checksums_$BACKUP_DATE.txt" ]]; then
    log "INFO" "🔐 Verificando integridade..."
    if sha256sum -c "checksums_$BACKUP_DATE.txt" > /dev/null 2>&1; then
        log "SUCCESS" "✅ Integridade verificada"
    else
        log "WARN" "⚠️ Falha na verificação de integridade"
        read -p "Continuar mesmo assim? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
fi

# Parar serviços
log "INFO" "🛑 Parando serviços..."
cd /opt/kryonix/stacks/admin && docker-compose down || true
cd /opt/kryonix/stacks/public && docker-compose down || true
cd /opt/kryonix/traefik && docker-compose down || true

# Restaurar bancos de dados
log "INFO" "💾 Restaurando bancos de dados..."

# PostgreSQL Admin
if [[ -f "$RESTORE_DIR/postgres_admin_$BACKUP_DATE.sql" ]]; then
    docker run --rm -v "$RESTORE_DIR":/backup postgres:16-alpine \
        psql -h postgres_admin -U admin -d kryonix_admin -f "/backup/postgres_admin_$BACKUP_DATE.sql"
    log "SUCCESS" "✅ PostgreSQL Admin restaurado"
fi

# PostgreSQL Public
if [[ -f "$RESTORE_DIR/postgres_public_$BACKUP_DATE.sql" ]]; then
    docker run --rm -v "$RESTORE_DIR":/backup postgres:16-alpine \
        psql -h postgres_public -U app_user -d siqueicampos_db -f "/backup/postgres_public_$BACKUP_DATE.sql"
    log "SUCCESS" "✅ PostgreSQL Public restaurado"
fi

# Restaurar volumes
log "INFO" "📦 Restaurando volumes Docker..."

# Portainer
if [[ -f "portainer_data_$BACKUP_DATE.tar.gz" ]]; then
    docker run --rm -v portainer_data:/data -v "$RESTORE_DIR":/backup alpine \
        tar -xzf "/backup/portainer_data_$BACKUP_DATE.tar.gz" -C /data
    log "SUCCESS" "✅ Portainer data restaurado"
fi

# MinIO
if [[ -f "minio_data_$BACKUP_DATE.tar.gz" ]]; then
    docker run --rm -v minio_data:/data -v "$RESTORE_DIR":/backup alpine \
        tar -xzf "/backup/minio_data_$BACKUP_DATE.tar.gz" -C /data
    log "SUCCESS" "✅ MinIO data restaurado"
fi

# Grafana
if [[ -f "grafana_data_$BACKUP_DATE.tar.gz" ]]; then
    docker run --rm -v grafana_data:/data -v "$RESTORE_DIR":/backup alpine \
        tar -xzf "/backup/grafana_data_$BACKUP_DATE.tar.gz" -C /data
    log "SUCCESS" "✅ Grafana data restaurado"
fi

# N8N
if [[ -f "n8n_data_$BACKUP_DATE.tar.gz" ]]; then
    docker run --rm -v n8n_data:/data -v "$RESTORE_DIR":/backup alpine \
        tar -xzf "/backup/n8n_data_$BACKUP_DATE.tar.gz" -C /data
    log "SUCCESS" "✅ N8N data restaurado"
fi

# Restaurar configurações
log "INFO" "⚙️ Restaurando configurações..."

# Traefik
if [[ -d "traefik_config_$BACKUP_DATE" ]]; then
    cp -r "traefik_config_$BACKUP_DATE"/* /opt/kryonix/traefik/
    log "SUCCESS" "✅ Configurações Traefik restauradas"
fi

# Stacks
if [[ -d "stacks_config_$BACKUP_DATE" ]]; then
    cp -r "stacks_config_$BACKUP_DATE"/* /opt/kryonix/stacks/
    log "SUCCESS" "✅ Configurações Stacks restauradas"
fi

# Scripts
if [[ -d "scripts_config_$BACKUP_DATE" ]]; then
    cp -r "scripts_config_$BACKUP_DATE"/* /opt/kryonix/scripts/
    chmod +x /opt/kryonix/scripts/*.sh
    log "SUCCESS" "✅ Scripts restaurados"
fi

# SSL
if [[ -d "ssl_certs_$BACKUP_DATE" ]]; then
    cp -r "ssl_certs_$BACKUP_DATE"/* /opt/kryonix/ssl/
    log "SUCCESS" "✅ Certificados SSL restaurados"
fi

# Projeto
if [[ -f "projeto_$BACKUP_DATE.tar.gz" ]]; then
    rm -rf /opt/siqueicamposimoveis
    tar -xzf "projeto_$BACKUP_DATE.tar.gz" -C /opt/
    log "SUCCESS" "✅ Projeto restaurado"
fi

# Reiniciar serviços
log "INFO" "🚀 Reiniciando serviços..."

cd /opt/kryonix/traefik && docker-compose up -d
sleep 10

cd /opt/kryonix/stacks/admin && docker-compose up -d
sleep 10

cd /opt/kryonix/stacks/public && docker-compose up -d
sleep 10

# Verificar serviços
log "INFO" "🔍 Verificando serviços restaurados..."

sleep 30

services_ok=0
total_services=5

# Testar serviços principais
if curl -f -s -o /dev/null "http://localhost:8080/api/rawdata"; then
    ((services_ok++))
    log "SUCCESS" "✅ Traefik funcionando"
else
    log "ERROR" "❌ Traefik com problemas"
fi

if curl -f -s -o /dev/null "http://localhost:9000"; then
    ((services_ok++))
    log "SUCCESS" "✅ Portainer funcionando"
else
    log "ERROR" "❌ Portainer com problemas"
fi

if curl -f -s -o /dev/null "http://localhost:3001/api/ping"; then
    ((services_ok++))
    log "SUCCESS" "✅ API funcionando"
else
    log "ERROR" "❌ API com problemas"
fi

if pg_isready -h localhost -p 5432; then
    ((services_ok++))
    log "SUCCESS" "✅ PostgreSQL funcionando"
else
    log "ERROR" "❌ PostgreSQL com problemas"
fi

if redis-cli ping | grep -q "PONG"; then
    ((services_ok++))
    log "SUCCESS" "✅ Redis funcionando"
else
    log "ERROR" "❌ Redis com problemas"
fi

# Limpeza
rm -rf "$RESTORE_DIR"

# Relatório final
if [[ $services_ok -eq $total_services ]]; then
    log "SUCCESS" "🎉 Restauração concluída com sucesso!"
    log "INFO" "📊 Todos os serviços ($services_ok/$total_services) estão funcionando"
else
    log "WARN" "⚠️ Restauração concluída com problemas"
    log "WARN" "📊 Serviços funcionando: $services_ok/$total_services"
fi

log "INFO" "📋 Verifique os logs dos containers se necessário:"
log "INFO" "   docker logs [container_name]"

exit 0
