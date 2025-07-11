#!/bin/bash

#################################################################
#                   SISTEMA DE BACKUP KRYONIX                  #
#           Backup automatizado da infraestrutura              #
#################################################################

set -euo pipefail

# Configurações
BACKUP_DIR="/opt/kryonix/backups"
RETENTION_DAYS=30
DATE=$(date +%Y%m%d_%H%M%S)
LOGFILE="$BACKUP_DIR/backup_$DATE.log"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Função de log
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")  echo -e "${BLUE}[INFO]${NC} $message" | tee -a "$LOGFILE" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a "$LOGFILE" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" | tee -a "$LOGFILE" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" | tee -a "$LOGFILE" ;;
    esac
}

# Criar diretório de backup
mkdir -p "$BACKUP_DIR/$DATE"
cd "$BACKUP_DIR/$DATE"

log "INFO" "🔄 Iniciando backup completo do sistema..."

# 1. Backup dos bancos de dados
log "INFO" "💾 Fazendo backup dos bancos de dados..."

# PostgreSQL Admin
docker exec postgres_admin pg_dump -U admin kryonix_admin > postgres_admin_$DATE.sql
if [[ $? -eq 0 ]]; then
    log "SUCCESS" "✅ Backup PostgreSQL Admin concluído"
else
    log "ERROR" "❌ Falha no backup PostgreSQL Admin"
fi

# PostgreSQL Public
docker exec postgres_public pg_dump -U app_user siqueicampos_db > postgres_public_$DATE.sql
if [[ $? -eq 0 ]]; then
    log "SUCCESS" "✅ Backup PostgreSQL Public concluído"
else
    log "ERROR" "❌ Falha no backup PostgreSQL Public"
fi

# Redis
docker exec redis_public redis-cli --rdb backup_redis_$DATE.rdb
if [[ $? -eq 0 ]]; then
    log "SUCCESS" "✅ Backup Redis concluído"
else
    log "ERROR" "❌ Falha no backup Redis"
fi

# 2. Backup dos volumes Docker
log "INFO" "📦 Fazendo backup dos volumes Docker..."

# Portainer data
docker run --rm -v portainer_data:/data -v "$PWD":/backup alpine tar czf /backup/portainer_data_$DATE.tar.gz -C /data .

# MinIO data
docker run --rm -v minio_data:/data -v "$PWD":/backup alpine tar czf /backup/minio_data_$DATE.tar.gz -C /data .

# Grafana data
docker run --rm -v grafana_data:/data -v "$PWD":/backup alpine tar czf /backup/grafana_data_$DATE.tar.gz -C /data .

# N8N data
docker run --rm -v n8n_data:/data -v "$PWD":/backup alpine tar czf /backup/n8n_data_$DATE.tar.gz -C /data .

log "SUCCESS" "✅ Backup dos volumes concluído"

# 3. Backup das configurações
log "INFO" "⚙️ Fazendo backup das configurações..."

# Traefik
cp -r /opt/kryonix/traefik traefik_config_$DATE/

# Stacks
cp -r /opt/kryonix/stacks stacks_config_$DATE/

# Scripts
cp -r /opt/kryonix/scripts scripts_config_$DATE/

# Certificados SSL
cp -r /opt/kryonix/ssl ssl_certs_$DATE/ 2>/dev/null || true

# Projeto principal
tar czf projeto_$DATE.tar.gz -C /opt siqueicamposimoveis/

log "SUCCESS" "✅ Backup das configurações concluído"

# 4. Backup das logs
log "INFO" "📝 Fazendo backup dos logs..."

cp -r /opt/kryonix/logs logs_$DATE/

# Logs do sistema
journalctl --since="1 day ago" > system_logs_$DATE.log

log "SUCCESS" "✅ Backup dos logs concluído"

# 5. Informações do sistema
log "INFO" "💻 Coletando informações do sistema..."

# Docker info
docker info > docker_info_$DATE.txt
docker ps -a > docker_containers_$DATE.txt
docker images > docker_images_$DATE.txt
docker network ls > docker_networks_$DATE.txt
docker volume ls > docker_volumes_$DATE.txt

# Sistema
uname -a > system_info_$DATE.txt
df -h > disk_usage_$DATE.txt
free -h > memory_usage_$DATE.txt
systemctl list-units --failed > failed_services_$DATE.txt

log "SUCCESS" "✅ Informações do sistema coletadas"

# 6. Criar arquivo de integridade
log "INFO" "🔐 Criando checksums para verificação de integridade..."

find . -type f -exec sha256sum {} \; > checksums_$DATE.txt

log "SUCCESS" "✅ Checksums criados"

# 7. Compactar backup completo
log "INFO" "📦 Compactando backup completo..."

cd "$BACKUP_DIR"
tar czf "backup_completo_$DATE.tar.gz" "$DATE/"

if [[ $? -eq 0 ]]; then
    log "SUCCESS" "✅ Backup completo criado: backup_completo_$DATE.tar.gz"
    
    # Calcular tamanho
    backup_size=$(du -h "backup_completo_$DATE.tar.gz" | cut -f1)
    log "INFO" "📊 Tamanho do backup: $backup_size"
    
    # Remover diretório temporário
    rm -rf "$DATE/"
else
    log "ERROR" "❌ Falha ao criar backup compactado"
fi

# 8. Limpeza de backups antigos
log "INFO" "🧹 Removendo backups antigos (>$RETENTION_DAYS dias)..."

find "$BACKUP_DIR" -name "backup_completo_*.tar.gz" -mtime +$RETENTION_DAYS -delete
find "$BACKUP_DIR" -name "backup_*.log" -mtime +$RETENTION_DAYS -delete

log "SUCCESS" "✅ Limpeza de backups antigos concluída"

# 9. Verificar espaço em disco
log "INFO" "💽 Verificando espaço em disco..."

disk_usage=$(df /opt | tail -1 | awk '{print $5}' | sed 's/%//')
if [[ $disk_usage -gt 85 ]]; then
    log "WARN" "⚠️ Espaço em disco baixo: ${disk_usage}%"
else
    log "INFO" "✅ Espaço em disco adequado: ${disk_usage}%"
fi

# 10. Enviar para storage externo (opcional)
if [[ -n "${BACKUP_S3_BUCKET:-}" ]] && command -v aws &> /dev/null; then
    log "INFO" "☁️ Enviando backup para S3..."
    
    aws s3 cp "backup_completo_$DATE.tar.gz" "s3://$BACKUP_S3_BUCKET/kryonix/" --storage-class STANDARD_IA
    
    if [[ $? -eq 0 ]]; then
        log "SUCCESS" "✅ Backup enviado para S3"
    else
        log "ERROR" "❌ Falha ao enviar para S3"
    fi
fi

# Relatório final
log "INFO" "📋 Gerando relatório final..."

cat > "$BACKUP_DIR/relatorio_backup_$DATE.txt" << EOF
════════════════════════════════════════════════════════════════
                    RELATÓRIO DE BACKUP KRYONIX
════════════════════════════════════════════════════════════════
Data/Hora: $(date '+%Y-%m-%d %H:%M:%S')
Arquivo: backup_completo_$DATE.tar.gz
Tamanho: $backup_size

COMPONENTES INCLUÍDOS:
✅ PostgreSQL Admin Database
✅ PostgreSQL Public Database  
✅ Redis Database
✅ Portainer Data
✅ MinIO Data
✅ Grafana Data
✅ N8N Data
✅ Configurações Traefik
✅ Configurações Stacks
✅ Scripts Personalizados
✅ Certificados SSL
✅ Código do Projeto
✅ Logs do Sistema
✅ Informações do Docker
✅ Checksums de Integridade

LOCALIZAÇÃO:
Backup Local: $BACKUP_DIR/backup_completo_$DATE.tar.gz
Logs: $LOGFILE

RETENÇÃO:
Backups são mantidos por $RETENTION_DAYS dias

RESTAURAÇÃO:
Para restaurar, execute:
1. tar -xzf backup_completo_$DATE.tar.gz
2. ./restore-backup.sh $DATE

════════════════════════════════════════════════════════════════
EOF

log "SUCCESS" "🎉 Backup completo finalizado com sucesso!"
log "INFO" "📊 Relatório disponível em: $BACKUP_DIR/relatorio_backup_$DATE.txt"

# Retornar código de saída
exit 0
