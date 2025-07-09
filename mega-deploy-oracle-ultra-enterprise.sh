#!/bin/bash

#==============================================================================
# MEGA DEPLOY ORACLE ULTRA ENTERPRISE - v2.0
# Script de Deploy Enterprise para Siqueira Campos Imóveis
# Oracle Ubuntu 22.04 - 2 cores, 24GB RAM, 200GB storage
# Domínios: siqueicamposimoveis.com.br | meuboot.site
#==============================================================================

set -euo pipefail
IFS=$'\n\t'

# Cores para output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m' # No Color

# Configurações globais
readonly SCRIPT_VERSION="2.0"
readonly LOG_DIR="/var/log/deploy-enterprise"
readonly BACKUP_DIR="/opt/backups"
readonly CONFIG_DIR="/opt/siqueira-config"
readonly DOCKER_DATA_DIR="/opt/docker-data"
readonly APP_DIR="/opt/siqueira-app"
readonly DOMAINS=("siqueicamposimoveis.com.br" "meuboot.site")
readonly PRIMARY_DOMAIN="${DOMAINS[0]}"
readonly SECONDARY_DOMAIN="${DOMAINS[1]}"
readonly GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0"
readonly NODE_VERSION="18"

# Variáveis de ambiente
readonly POSTGRES_PASSWORD=$(openssl rand -base64 32)
readonly REDIS_PASSWORD=$(openssl rand -base64 32)
readonly ADMIN_PASSWORD=$(openssl rand -base64 32)
readonly JWT_SECRET=$(openssl rand -base64 64)
readonly ENCRYPTION_KEY=$(openssl rand -base64 32)
readonly API_KEY=$(openssl rand -base64 48)
readonly EVOLUTION_API_KEY=$(openssl rand -base64 32)
readonly N8N_ENCRYPTION_KEY=$(openssl rand -base64 32)

# Arrays para controle de serviços
declare -a SERVICES_TO_DEPLOY=(
    "traefik"
    "postgresql"
    "redis"
    "portainer"
    "n8n"
    "evolution-api"
    "prometheus"
    "grafana"
    "main-app"
)

declare -a MONITORING_SERVICES=(
    "node-exporter"
    "cadvisor"
    "blackbox-exporter"
    "alertmanager"
)

#==============================================================================
# FUNÇÕES UTILITÁRIAS
#==============================================================================

log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "INFO")  echo -e "${GREEN}[${timestamp}] [INFO]${NC} $message" ;;
        "WARN")  echo -e "${YELLOW}[${timestamp}] [WARN]${NC} $message" ;;
        "ERROR") echo -e "${RED}[${timestamp}] [ERROR]${NC} $message" ;;
        "DEBUG") echo -e "${BLUE}[${timestamp}] [DEBUG]${NC} $message" ;;
        "SUCCESS") echo -e "${GREEN}[${timestamp}] [SUCCESS]${NC} $message" ;;
        *) echo -e "${WHITE}[${timestamp}] $message${NC}" ;;
    esac
    
    # Log para arquivo se diretório existir
    if [[ -d "$LOG_DIR" ]]; then
        echo "[${timestamp}] [$level] $message" >> "$LOG_DIR/deploy-$(date +%Y%m%d).log"
    fi
}

banner() {
    echo -e "${PURPLE}"
    echo "=========================================="
    echo "$1"
    echo "=========================================="
    echo -e "${NC}"
}

progress_bar() {
    local current=$1
    local total=$2
    local description=$3
    local percent=$((current * 100 / total))
    local filled=$((percent / 2))
    local empty=$((50 - filled))
    
    printf "\r${CYAN}[%-50s] %d%% %s${NC}" \
        "$(printf '#%.0s' $(seq 1 $filled))$(printf ' %.0s' $(seq 1 $empty))" \
        "$percent" "$description"
    
    if [[ $current -eq $total ]]; then
        echo
    fi
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log "ERROR" "Este script deve ser executado como root"
        exit 1
    fi
}

create_directories() {
    log "INFO" "Criando estrutura de diretórios..."
    
    local dirs=(
        "$LOG_DIR"
        "$BACKUP_DIR"
        "$CONFIG_DIR"
        "$DOCKER_DATA_DIR"
        "$APP_DIR"
        "$DOCKER_DATA_DIR/traefik"
        "$DOCKER_DATA_DIR/postgres"
        "$DOCKER_DATA_DIR/redis"
        "$DOCKER_DATA_DIR/portainer"
        "$DOCKER_DATA_DIR/n8n"
        "$DOCKER_DATA_DIR/evolution"
        "$DOCKER_DATA_DIR/prometheus"
        "$DOCKER_DATA_DIR/grafana"
        "$CONFIG_DIR/ssl"
        "$CONFIG_DIR/monitoring"
        "$CONFIG_DIR/backup"
    )
    
    for dir in "${dirs[@]}"; do
        mkdir -p "$dir"
        chmod 755 "$dir"
    done
    
    log "SUCCESS" "Estrutura de diretórios criada"
}

#==============================================================================
# LIMPEZA E PREPARAÇÃO DO SISTEMA
#==============================================================================

cleanup_system() {
    banner "LIMPEZA COMPLETA DO SISTEMA"
    
    log "INFO" "Parando todos os containers..."
    docker stop $(docker ps -aq) 2>/dev/null || true
    docker rm $(docker ps -aq) 2>/dev/null || true
    
    log "INFO" "Removendo volumes Docker..."
    docker volume rm $(docker volume ls -q) 2>/dev/null || true
    
    log "INFO" "Removendo redes Docker customizadas..."
    docker network rm $(docker network ls -q --filter type=custom) 2>/dev/null || true
    
    log "INFO" "Limpando cache do sistema..."
    apt-get clean
    apt-get autoclean
    
    log "INFO" "Removendo logs antigos..."
    find /var/log -type f -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    # Limpeza de portas
    log "INFO" "Liberando portas utilizadas..."
    local ports=(80 443 5432 6379 3000 3001 8080 9000 5678 8021 9090 3100)
    for port in "${ports[@]}"; do
        fuser -k ${port}/tcp 2>/dev/null || true
    done
    
    log "SUCCESS" "Sistema limpo e preparado"
}

#==============================================================================
# INSTALAÇÃO DE DEPENDÊNCIAS
#==============================================================================

install_system_dependencies() {
    banner "INSTALAÇÃO DE DEPENDÊNCIAS DO SISTEMA"
    
    log "INFO" "Atualizando repositórios..."
    apt-get update -y
    
    log "INFO" "Instalando pacotes essenciais..."
    apt-get install -y \
        curl wget git unzip htop tree \
        software-properties-common apt-transport-https ca-certificates \
        gnupg lsb-release jq yq \
        fail2ban ufw logrotate \
        nginx-utils apache2-utils \
        postgresql-client redis-tools \
        python3 python3-pip \
        monitoring-plugins \
        rsync cron \
        netcat-openbsd \
        openssl \
        certbot
        
    log "SUCCESS" "Dependências do sistema instaladas"
}

install_docker() {
    banner "INSTALAÇÃO DO DOCKER"
    
    if command -v docker &> /dev/null; then
        log "INFO" "Docker já instalado, atualizando..."
        apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    fi
    
    log "INFO" "Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    rm get-docker.sh
    
    log "INFO" "Instalando Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Configuração do Docker
    log "INFO" "Configurando Docker..."
    cat > /etc/docker/daemon.json << EOF
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "live-restore": true,
    "storage-driver": "overlay2",
    "default-address-pools": [
        {
            "base": "172.20.0.0/16",
            "size": 24
        }
    ]
}
EOF
    
    systemctl enable docker
    systemctl restart docker
    
    log "SUCCESS" "Docker instalado e configurado"
}

install_nodejs() {
    banner "INSTALAÇÃO DO NODE.JS"
    
    # Remover versões antigas
    apt-get remove -y nodejs npm node 2>/dev/null || true
    
    log "INFO" "Instalando Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
    
    # Instalar pnpm globalmente
    npm install -g pnpm@latest
    
    log "INFO" "Versões instaladas:"
    node --version
    npm --version
    pnpm --version
    
    log "SUCCESS" "Node.js instalado"
}

#==============================================================================
# CONFIGURAÇÃO DE SEGURANÇA
#==============================================================================

configure_security() {
    banner "CONFIGURAÇÃO DE SEGURANÇA"
    
    log "INFO" "Configurando UFW..."
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Portas essenciais
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw allow 8080/tcp  # Portainer
    
    ufw --force enable
    
    log "INFO" "Configurando Fail2Ban..."
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log

[docker-logs]
enabled = true
filter = docker-logs
logpath = /var/lib/docker/containers/*/*-json.log
maxretry = 5
EOF

    systemctl enable fail2ban
    systemctl restart fail2ban
    
    # Configurações de kernel para segurança
    log "INFO" "Aplicando configurações de kernel..."
    cat >> /etc/sysctl.conf << EOF

# Configurações de segurança
net.ipv4.conf.default.rp_filter=1
net.ipv4.conf.all.rp_filter=1
net.ipv4.tcp_syncookies=1
net.ipv4.conf.all.accept_redirects=0
net.ipv6.conf.all.accept_redirects=0
net.ipv4.conf.all.send_redirects=0
net.ipv4.conf.all.accept_source_route=0
net.ipv6.conf.all.accept_source_route=0
net.ipv4.conf.all.log_martians=1

# Configurações de performance
vm.swappiness=10
vm.dirty_ratio=15
vm.dirty_background_ratio=5
net.core.rmem_max=134217728
net.core.wmem_max=134217728
net.ipv4.tcp_rmem=4096 87380 134217728
net.ipv4.tcp_wmem=4096 65536 134217728
EOF

    sysctl -p
    
    log "SUCCESS" "Segurança configurada"
}

#==============================================================================
# REDE DOCKER
#==============================================================================

create_docker_networks() {
    banner "CRIANDO REDES DOCKER"
    
    log "INFO" "Criando rede principal..."
    docker network create --driver bridge \
        --subnet=172.20.0.0/16 \
        --gateway=172.20.0.1 \
        siqueira-network 2>/dev/null || true
    
    log "INFO" "Criando rede de monitoramento..."
    docker network create --driver bridge \
        --subnet=172.21.0.0/16 \
        --gateway=172.21.0.1 \
        monitoring-network 2>/dev/null || true
    
    log "SUCCESS" "Redes Docker criadas"
}

#==============================================================================
# TRAEFIK PROXY
#==============================================================================

deploy_traefik() {
    banner "DEPLOY TRAEFIK PROXY"
    
    log "INFO" "Configurando Traefik..."
    
    # Configuração principal do Traefik
    cat > $DOCKER_DATA_DIR/traefik/traefik.yml << EOF
global:
  checkNewVersion: false
  sendAnonymousUsage: false

api:
  dashboard: true
  debug: true
  insecure: false

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@${PRIMARY_DOMAIN}
      storage: /etc/traefik/acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: siqueira-network
  file:
    filename: /etc/traefik/dynamic.yml
    watch: true

log:
  level: INFO
  filePath: "/var/log/traefik.log"

accessLog:
  filePath: "/var/log/access.log"

metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
EOF

    # Configuração dinâmica
    cat > $DOCKER_DATA_DIR/traefik/dynamic.yml << EOF
http:
  middlewares:
    security-headers:
      headers:
        frameDeny: true
        sslRedirect: true
        browserXssFilter: true
        contentTypeNosniff: true
        forceSTSHeader: true
        stsIncludeSubdomains: true
        stsPreload: true
        stsSeconds: 31536000
        customRequestHeaders:
          X-Forwarded-Proto: "https"
    
    auth:
      basicAuth:
        users:
          - "admin:\$2y\$10\$abcdefghijklmnopqrstuvwxyz"
    
    rate-limit:
      rateLimit:
        burst: 100
        average: 50

tls:
  options:
    default:
      minVersion: "VersionTLS12"
      cipherSuites:
        - "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"
        - "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"
        - "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305"
EOF

    touch $DOCKER_DATA_DIR/traefik/acme.json
    chmod 600 $DOCKER_DATA_DIR/traefik/acme.json
    
    # Docker Compose para Traefik
    cat > $DOCKER_DATA_DIR/traefik/docker-compose.yml << EOF
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    command:
      - --configfile=/etc/traefik/traefik.yml
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - $DOCKER_DATA_DIR/traefik:/etc/traefik
      - $LOG_DIR:/var/log
    networks:
      - siqueira-network
      - monitoring-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.${PRIMARY_DOMAIN}\`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"
      - "traefik.http.routers.traefik.middlewares=auth"
    environment:
      - TRAEFIK_LOG_LEVEL=INFO

networks:
  siqueira-network:
    external: true
  monitoring-network:
    external: true
EOF

    cd $DOCKER_DATA_DIR/traefik
    docker-compose up -d
    
    log "SUCCESS" "Traefik deployado"
}

#==============================================================================
# BANCO DE DADOS POSTGRESQL
#==============================================================================

deploy_postgresql() {
    banner "DEPLOY POSTGRESQL"
    
    log "INFO" "Configurando PostgreSQL..."
    
    # Configuração personalizada do PostgreSQL
    cat > $DOCKER_DATA_DIR/postgres/postgresql.conf << EOF
# Configurações de performance para 24GB RAM
shared_buffers = 6GB
effective_cache_size = 18GB
maintenance_work_mem = 2GB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
random_page_cost = 1.1
effective_io_concurrency = 200
work_mem = 32MB
min_wal_size = 1GB
max_wal_size = 4GB
max_worker_processes = 4
max_parallel_workers_per_gather = 2
max_parallel_workers = 4
max_parallel_maintenance_workers = 2

# Configurações de logging
log_destination = 'stderr'
logging_collector = on
log_directory = '/var/lib/postgresql/data/log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_statement = 'mod'
log_min_duration_statement = 1000

# Configurações de conexão
listen_addresses = '*'
max_connections = 200
EOF

    # Scripts de inicialização
    cat > $DOCKER_DATA_DIR/postgres/init-db.sql << EOF
-- Criação dos bancos de dados
CREATE DATABASE siqueira_main;
CREATE DATABASE siqueira_analytics;
CREATE DATABASE n8n_db;
CREATE DATABASE evolution_db;

-- Usuários específicos
CREATE USER siqueira_user WITH ENCRYPTED PASSWORD '${POSTGRES_PASSWORD}';
CREATE USER n8n_user WITH ENCRYPTED PASSWORD '${POSTGRES_PASSWORD}';
CREATE USER evolution_user WITH ENCRYPTED PASSWORD '${POSTGRES_PASSWORD}';

-- Permissões
GRANT ALL PRIVILEGES ON DATABASE siqueira_main TO siqueira_user;
GRANT ALL PRIVILEGES ON DATABASE siqueira_analytics TO siqueira_user;
GRANT ALL PRIVILEGES ON DATABASE n8n_db TO n8n_user;
GRANT ALL PRIVILEGES ON DATABASE evolution_db TO evolution_user;

-- Extensões úteis
\c siqueira_main;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";

\c siqueira_analytics;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

\c n8n_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

\c evolution_db;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
EOF

    # Docker Compose para PostgreSQL
    cat > $DOCKER_DATA_DIR/postgres/docker-compose.yml << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: postgres
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - $DOCKER_DATA_DIR/postgres/postgresql.conf:/etc/postgresql/postgresql.conf
      - $DOCKER_DATA_DIR/postgres/init-db.sql:/docker-entrypoint-initdb.d/init-db.sql
      - $LOG_DIR:/var/log/postgresql
    networks:
      - siqueira-network
    ports:
      - "5432:5432"
    command: postgres -c config_file=/etc/postgresql/postgresql.conf
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "traefik.enable=false"

volumes:
  postgres_data:
    driver: local

networks:
  siqueira-network:
    external: true
EOF

    cd $DOCKER_DATA_DIR/postgres
    docker-compose up -d
    
    # Aguardar PostgreSQL ficar pronto
    log "INFO" "Aguardando PostgreSQL inicializar..."
    sleep 30
    
    log "SUCCESS" "PostgreSQL deployado"
}

#==============================================================================
# REDIS
#==============================================================================

deploy_redis() {
    banner "DEPLOY REDIS"
    
    log "INFO" "Configurando Redis..."
    
    # Configuração do Redis
    cat > $DOCKER_DATA_DIR/redis/redis.conf << EOF
# Configurações de rede
bind 0.0.0.0
port 6379
protected-mode yes
requirepass ${REDIS_PASSWORD}

# Configurações de memória (4GB para Redis)
maxmemory 4gb
maxmemory-policy allkeys-lru

# Configurações de persistência
save 900 1
save 300 10
save 60 10000
stop-writes-on-bgsave-error yes
rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data

# Configurações de log
loglevel notice
logfile /var/log/redis/redis-server.log

# Configurações de performance
tcp-keepalive 300
timeout 0
databases 16
EOF

    # Docker Compose para Redis
    cat > $DOCKER_DATA_DIR/redis/docker-compose.yml << EOF
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    command: redis-server /usr/local/etc/redis/redis.conf
    volumes:
      - redis_data:/data
      - $DOCKER_DATA_DIR/redis/redis.conf:/usr/local/etc/redis/redis.conf
      - $LOG_DIR:/var/log/redis
    networks:
      - siqueira-network
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "traefik.enable=false"

volumes:
  redis_data:
    driver: local

networks:
  siqueira-network:
    external: true
EOF

    cd $DOCKER_DATA_DIR/redis
    docker-compose up -d
    
    log "SUCCESS" "Redis deployado"
}

#==============================================================================
# PORTAINER
#==============================================================================

deploy_portainer() {
    banner "DEPLOY PORTAINER"
    
    log "INFO" "Configurando Portainer..."
    
    cat > $DOCKER_DATA_DIR/portainer/docker-compose.yml << EOF
version: '3.8'

services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: unless-stopped
    volumes:
      - portainer_data:/data
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - siqueira-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=Host(\`portainer.${PRIMARY_DOMAIN}\`)"
      - "traefik.http.routers.portainer.entrypoints=websecure"
      - "traefik.http.routers.portainer.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer.loadbalancer.server.port=9000"
      - "traefik.http.routers.portainer.middlewares=security-headers"

volumes:
  portainer_data:
    driver: local

networks:
  siqueira-network:
    external: true
EOF

    cd $DOCKER_DATA_DIR/portainer
    docker-compose up -d
    
    log "SUCCESS" "Portainer deployado"
}

#==============================================================================
# N8N WORKFLOW AUTOMATION
#==============================================================================

deploy_n8n() {
    banner "DEPLOY N8N"
    
    log "INFO" "Configurando N8N..."
    
    cat > $DOCKER_DATA_DIR/n8n/docker-compose.yml << EOF
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_db
      - DB_POSTGRESDB_USER=n8n_user
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - N8N_HOST=n8n.${PRIMARY_DOMAIN}
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://n8n.${PRIMARY_DOMAIN}
      - GENERIC_TIMEZONE=America/Sao_Paulo
      - N8N_EMAIL_MODE=smtp
      - N8N_SMTP_HOST=smtp.gmail.com
      - N8N_SMTP_PORT=587
      - N8N_SMTP_SECURE=false
    volumes:
      - n8n_data:/home/node/.n8n
      - $LOG_DIR:/var/log/n8n
    networks:
      - siqueira-network
    depends_on:
      - postgres
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(\`n8n.${PRIMARY_DOMAIN}\`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"
      - "traefik.http.routers.n8n.middlewares=security-headers"

volumes:
  n8n_data:
    driver: local

networks:
  siqueira-network:
    external: true
EOF

    cd $DOCKER_DATA_DIR/n8n
    docker-compose up -d
    
    log "SUCCESS" "N8N deployado"
}

#==============================================================================
# EVOLUTION API (WHATSAPP)
#==============================================================================

deploy_evolution_api() {
    banner "DEPLOY EVOLUTION API"
    
    log "INFO" "Configurando Evolution API..."
    
    cat > $DOCKER_DATA_DIR/evolution/docker-compose.yml << EOF
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    restart: unless-stopped
    environment:
      - DATABASE_PROVIDER=postgresql
      - DATABASE_CONNECTION_URI=postgresql://evolution_user:${POSTGRES_PASSWORD}@postgres:5432/evolution_db
      - DATABASE_CONNECTION_CLIENT_NAME=evolution_db
      - REDIS_URI=redis://:${REDIS_PASSWORD}@redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - API_KEY=${EVOLUTION_API_KEY}
      - AUTHENTICATION_TYPE=apikey
      - LANGUAGE=pt-BR
      - LOG_LEVEL=ERROR
      - LOG_COLOR=true
      - DEL_INSTANCE=false
      - WEBHOOK_GLOBAL_URL=https://n8n.${PRIMARY_DOMAIN}/webhook
      - WEBHOOK_GLOBAL_ENABLED=true
      - CONFIG_SESSION_PHONE_CLIENT=Evolution API
      - CONFIG_SESSION_PHONE_NAME=Chrome
    volumes:
      - evolution_data:/evolution/instances
      - $LOG_DIR:/var/log/evolution
    networks:
      - siqueira-network
    depends_on:
      - postgres
      - redis
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.evolution.rule=Host(\`api.${PRIMARY_DOMAIN}\`)"
      - "traefik.http.routers.evolution.entrypoints=websecure"
      - "traefik.http.routers.evolution.tls.certresolver=letsencrypt"
      - "traefik.http.services.evolution.loadbalancer.server.port=8080"
      - "traefik.http.routers.evolution.middlewares=security-headers,rate-limit"

volumes:
  evolution_data:
    driver: local

networks:
  siqueira-network:
    external: true
EOF

    cd $DOCKER_DATA_DIR/evolution
    docker-compose up -d
    
    log "SUCCESS" "Evolution API deployado"
}

#==============================================================================
# MONITORAMENTO (PROMETHEUS + GRAFANA)
#==============================================================================

deploy_monitoring() {
    banner "DEPLOY MONITORAMENTO"
    
    log "INFO" "Configurando Prometheus..."
    
    # Configuração do Prometheus
    cat > $DOCKER_DATA_DIR/prometheus/prometheus.yml << EOF
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'cadvisor'
    static_configs:
      - targets: ['cadvisor:8080']

  - job_name: 'traefik'
    static_configs:
      - targets: ['traefik:8080']

  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']

  - job_name: 'blackbox'
    metrics_path: /probe
    params:
      module: [http_2xx]
    static_configs:
      - targets:
        - https://${PRIMARY_DOMAIN}
        - https://portainer.${PRIMARY_DOMAIN}
        - https://n8n.${PRIMARY_DOMAIN}
        - https://api.${PRIMARY_DOMAIN}
    relabel_configs:
      - source_labels: [__address__]
        target_label: __param_target
      - source_labels: [__param_target]
        target_label: instance
      - target_label: __address__
        replacement: blackbox-exporter:9115
EOF

    # Regras de alerta
    cat > $DOCKER_DATA_DIR/prometheus/alert_rules.yml << EOF
groups:
  - name: system_alerts
    rules:
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage detected"
          description: "CPU usage is above 80% for more than 5 minutes"

      - alert: HighMemoryUsage
        expr: (node_memory_MemTotal_bytes - node_memory_MemAvailable_bytes) / node_memory_MemTotal_bytes * 100 > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "High memory usage detected"
          description: "Memory usage is above 90% for more than 5 minutes"

      - alert: DiskSpaceLow
        expr: (node_filesystem_avail_bytes / node_filesystem_size_bytes) * 100 < 10
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Disk space is below 10%"

      - alert: ServiceDown
        expr: up == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Service is down"
          description: "{{ \$labels.instance }} service is down"
EOF

    # Docker Compose para monitoramento
    cat > $DOCKER_DATA_DIR/prometheus/docker-compose.yml << EOF
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    volumes:
      - prometheus_data:/prometheus
      - $DOCKER_DATA_DIR/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - $DOCKER_DATA_DIR/prometheus/alert_rules.yml:/etc/prometheus/alert_rules.yml
    networks:
      - monitoring-network
      - siqueira-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.prometheus.rule=Host(\`prometheus.${PRIMARY_DOMAIN}\`)"
      - "traefik.http.routers.prometheus.entrypoints=websecure"
      - "traefik.http.routers.prometheus.tls.certresolver=letsencrypt"
      - "traefik.http.services.prometheus.loadbalancer.server.port=9090"
      - "traefik.http.routers.prometheus.middlewares=auth"

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=${ADMIN_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_INSTALL_PLUGINS=grafana-piechart-panel
    volumes:
      - grafana_data:/var/lib/grafana
      - $DOCKER_DATA_DIR/grafana/datasources:/etc/grafana/provisioning/datasources
      - $DOCKER_DATA_DIR/grafana/dashboards:/etc/grafana/provisioning/dashboards
    networks:
      - monitoring-network
      - siqueira-network
    depends_on:
      - prometheus
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(\`grafana.${PRIMARY_DOMAIN}\`)"
      - "traefik.http.routers.grafana.entrypoints=websecure"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"
      - "traefik.http.services.grafana.loadbalancer.server.port=3000"

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    networks:
      - monitoring-network

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    restart: unless-stopped
    privileged: true
    devices:
      - /dev/kmsg:/dev/kmsg
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker:/var/lib/docker:ro
      - /cgroup:/cgroup:ro
    networks:
      - monitoring-network

  blackbox-exporter:
    image: prom/blackbox-exporter:latest
    container_name: blackbox-exporter
    restart: unless-stopped
    networks:
      - monitoring-network

volumes:
  prometheus_data:
    driver: local
  grafana_data:
    driver: local

networks:
  monitoring-network:
    external: true
  siqueira-network:
    external: true
EOF

    # Configuração de datasource do Grafana
    mkdir -p $DOCKER_DATA_DIR/grafana/datasources
    cat > $DOCKER_DATA_DIR/grafana/datasources/prometheus.yml << EOF
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
EOF

    cd $DOCKER_DATA_DIR/prometheus
    docker-compose up -d
    
    log "SUCCESS" "Monitoramento deployado"
}

#==============================================================================
# APLICAÇÃO PRINCIPAL
#==============================================================================

deploy_main_app() {
    banner "DEPLOY APLICAÇÃO PRINCIPAL"
    
    log "INFO" "Clonando repositório..."
    if [[ -d "$APP_DIR/.git" ]]; then
        cd $APP_DIR
        git pull origin main
    else
        rm -rf $APP_DIR/*
        git clone $GITHUB_REPO $APP_DIR
        cd $APP_DIR
    fi
    
    log "INFO" "Configurando ambiente da aplicação..."
    
    # Arquivo .env para a aplicação
    cat > $APP_DIR/.env << EOF
# Database
DATABASE_URL="postgresql://siqueira_user:${POSTGRES_PASSWORD}@postgres:5432/siqueira_main"
DIRECT_URL="postgresql://siqueira_user:${POSTGRES_PASSWORD}@postgres:5432/siqueira_main"

# Redis
REDIS_URL="redis://:${REDIS_PASSWORD}@redis:6379"

# JWT & Security
JWT_SECRET="${JWT_SECRET}"
ENCRYPTION_KEY="${ENCRYPTION_KEY}"
API_KEY="${API_KEY}"

# URLs
FRONTEND_URL="https://${PRIMARY_DOMAIN}"
BACKEND_URL="https://api.${PRIMARY_DOMAIN}"
ADMIN_URL="https://admin.${PRIMARY_DOMAIN}"

# WhatsApp Integration
EVOLUTION_API_URL="https://api.${PRIMARY_DOMAIN}"
EVOLUTION_API_KEY="${EVOLUTION_API_KEY}"

# N8N Integration
N8N_WEBHOOK_URL="https://n8n.${PRIMARY_DOMAIN}/webhook"
N8N_API_URL="https://n8n.${PRIMARY_DOMAIN}/api"

# Email
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_SECURE="false"

# Environment
NODE_ENV="production"
PORT="3001"
ADMIN_PORT="3002"

# Domains
PRIMARY_DOMAIN="${PRIMARY_DOMAIN}"
SECONDARY_DOMAIN="${SECONDARY_DOMAIN}"
EOF

    # Docker Compose para a aplicação principal
    cat > $APP_DIR/docker-compose.yml << EOF
version: '3.8'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
      target: frontend
    container_name: frontend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - VITE_API_URL=https://api.${PRIMARY_DOMAIN}
      - VITE_EVOLUTION_API_URL=https://api.${PRIMARY_DOMAIN}
    networks:
      - siqueira-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(\`${PRIMARY_DOMAIN}\`) || Host(\`www.${PRIMARY_DOMAIN}\`) || Host(\`${SECONDARY_DOMAIN}\`) || Host(\`www.${SECONDARY_DOMAIN}\`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"
      - "traefik.http.routers.frontend.middlewares=security-headers"

  backend:
    build:
      context: .
      dockerfile: Dockerfile
      target: backend
    container_name: backend
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://siqueira_user:${POSTGRES_PASSWORD}@postgres:5432/siqueira_main
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - JWT_SECRET=${JWT_SECRET}
      - API_KEY=${API_KEY}
      - PORT=3001
    volumes:
      - app_uploads:/app/uploads
      - $LOG_DIR:/var/log/app
    networks:
      - siqueira-network
    depends_on:
      - postgres
      - redis
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(\`api.${PRIMARY_DOMAIN}\`) && PathPrefix(\`/api\`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.backend.loadbalancer.server.port=3001"
      - "traefik.http.routers.backend.middlewares=security-headers,rate-limit"

volumes:
  app_uploads:
    driver: local

networks:
  siqueira-network:
    external: true
EOF

    # Dockerfile multi-stage
    cat > $APP_DIR/Dockerfile << EOF
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Frontend stage
FROM nginx:alpine AS frontend
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]

# Backend stage
FROM node:18-alpine AS backend
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server ./server
COPY --from=builder /app/prisma ./prisma

RUN npx prisma generate

EXPOSE 3001
CMD ["npm", "run", "start:server"]
EOF

    # Configuração do Nginx para frontend
    cat > $APP_DIR/nginx.conf << EOF
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;
    
    sendfile        on;
    keepalive_timeout  65;
    
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    server {
        listen 3000;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files \$uri \$uri/ /index.html;
        }

        location /assets/ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }

        location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

    log "INFO" "Executando instalação de dependências..."
    pnpm install
    
    log "INFO" "Executando migrações do banco..."
    npx prisma migrate deploy
    npx prisma generate
    
    log "INFO" "Iniciando aplicação..."
    docker-compose up -d --build
    
    log "SUCCESS" "Aplicação principal deployada"
}

#==============================================================================
# SISTEMA DE BACKUP
#==============================================================================

setup_backup_system() {
    banner "CONFIGURANDO SISTEMA DE BACKUP"
    
    log "INFO" "Criando scripts de backup..."
    
    # Script de backup do banco de dados
    cat > $BACKUP_DIR/backup-database.sh << 'EOF'
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
POSTGRES_PASSWORD="$1"

echo "$(date): Iniciando backup do banco de dados..."

# Backup do PostgreSQL
docker exec postgres pg_dumpall -U postgres | gzip > "$BACKUP_DIR/postgres_backup_$BACKUP_DATE.sql.gz"

# Backup dos dados do Redis
docker exec redis redis-cli --rdb /data/dump.rdb BGSAVE
docker cp redis:/data/dump.rdb "$BACKUP_DIR/redis_backup_$BACKUP_DATE.rdb"

# Limpeza de backups antigos (manter últimos 7 dias)
find $BACKUP_DIR -name "postgres_backup_*.sql.gz" -mtime +7 -delete
find $BACKUP_DIR -name "redis_backup_*.rdb" -mtime +7 -delete

echo "$(date): Backup concluído"
EOF

    # Script de backup dos volumes Docker
    cat > $BACKUP_DIR/backup-volumes.sh << 'EOF'
#!/bin/bash
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"

echo "$(date): Iniciando backup dos volumes..."

# Backup dos volumes Docker
docker run --rm -v siqueira_postgres_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/postgres_volume_$BACKUP_DATE.tar.gz -C /data .
docker run --rm -v siqueira_redis_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/redis_volume_$BACKUP_DATE.tar.gz -C /data .
docker run --rm -v siqueira_portainer_data:/data -v $BACKUP_DIR:/backup alpine tar czf /backup/portainer_volume_$BACKUP_DATE.tar.gz -C /data .

# Backup da aplicação
tar czf $BACKUP_DIR/app_backup_$BACKUP_DATE.tar.gz -C /opt siqueira-app

# Limpeza de backups antigos
find $BACKUP_DIR -name "*_volume_*.tar.gz" -mtime +7 -delete
find $BACKUP_DIR -name "app_backup_*.tar.gz" -mtime +7 -delete

echo "$(date): Backup dos volumes concluído"
EOF

    chmod +x $BACKUP_DIR/backup-database.sh
    chmod +x $BACKUP_DIR/backup-volumes.sh
    
    # Cron jobs para backup automático
    cat > /etc/cron.d/siqueira-backup << EOF
# Backup do banco de dados às 2:00 AM todos os dias
0 2 * * * root $BACKUP_DIR/backup-database.sh ${POSTGRES_PASSWORD} >> $LOG_DIR/backup.log 2>&1

# Backup dos volumes às 3:00 AM todos os dias
0 3 * * * root $BACKUP_DIR/backup-volumes.sh >> $LOG_DIR/backup.log 2>&1
EOF

    log "SUCCESS" "Sistema de backup configurado"
}

#==============================================================================
# MONITORAMENTO E ALERTAS
#==============================================================================

setup_monitoring_alerts() {
    banner "CONFIGURANDO ALERTAS"
    
    log "INFO" "Criando scripts de monitoramento..."
    
    # Script de verificação de saúde dos serviços
    cat > $CONFIG_DIR/monitoring/health-check.sh << 'EOF'
#!/bin/bash
SERVICES=("traefik" "postgres" "redis" "portainer" "n8n" "evolution-api" "frontend" "backend")
LOG_FILE="/var/log/deploy-enterprise/health-check.log"

echo "$(date): Iniciando verificação de saúde dos serviços" >> $LOG_FILE

for service in "${SERVICES[@]}"; do
    if docker ps --filter "name=$service" --filter "status=running" | grep -q $service; then
        echo "$(date): $service - OK" >> $LOG_FILE
    else
        echo "$(date): $service - FALHA" >> $LOG_FILE
        # Tentar reiniciar o serviço
        docker restart $service 2>/dev/null
        echo "$(date): Tentativa de reinicialização do $service" >> $LOG_FILE
    fi
done

# Verificar uso de recursos
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
MEMORY_USAGE=$(free | grep Mem | awk '{printf("%.2f", $3/$2 * 100.0)}')
DISK_USAGE=$(df -h / | awk 'NR==2{printf "%s", $5}' | sed 's/%//')

echo "$(date): CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%, Disk: ${DISK_USAGE}%" >> $LOG_FILE

# Alertas críticos
if (( $(echo "$CPU_USAGE > 90" | bc -l) )); then
    echo "$(date): ALERTA: CPU acima de 90%" >> $LOG_FILE
fi

if (( $(echo "$MEMORY_USAGE > 90" | bc -l) )); then
    echo "$(date): ALERTA: Memória acima de 90%" >> $LOG_FILE
fi

if [[ $DISK_USAGE -gt 90 ]]; then
    echo "$(date): ALERTA: Disco acima de 90%" >> $LOG_FILE
fi
EOF

    chmod +x $CONFIG_DIR/monitoring/health-check.sh
    
    # Cron para monitoramento
    cat >> /etc/cron.d/siqueira-backup << EOF

# Verificação de saúde a cada 5 minutos
*/5 * * * * root $CONFIG_DIR/monitoring/health-check.sh
EOF

    log "SUCCESS" "Alertas configurados"
}

#==============================================================================
# AUTO-DEPLOY E WEBHOOKS
#==============================================================================

setup_auto_deploy() {
    banner "CONFIGURANDO AUTO-DEPLOY"
    
    log "INFO" "Criando webhook para auto-deploy..."
    
    # Script de auto-deploy
    cat > $CONFIG_DIR/auto-deploy.sh << 'EOF'
#!/bin/bash
APP_DIR="/opt/siqueira-app"
LOG_FILE="/var/log/deploy-enterprise/auto-deploy.log"

echo "$(date): Iniciando auto-deploy..." >> $LOG_FILE

cd $APP_DIR

# Fazer backup da versão atual
cp -r $APP_DIR $APP_DIR.backup.$(date +%Y%m%d_%H%M%S)

# Atualizar código
git pull origin main >> $LOG_FILE 2>&1

# Instalar dependências
pnpm install >> $LOG_FILE 2>&1

# Executar migrações
npx prisma migrate deploy >> $LOG_FILE 2>&1

# Rebuildar e reiniciar containers
docker-compose up -d --build >> $LOG_FILE 2>&1

echo "$(date): Auto-deploy concluído" >> $LOG_FILE
EOF

    chmod +x $CONFIG_DIR/auto-deploy.sh
    
    # Webhook listener
    cat > $CONFIG_DIR/webhook-listener.js << 'EOF'
const http = require('http');
const { exec } = require('child_process');

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/deploy') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            try {
                const payload = JSON.parse(body);
                
                // Verificar se é push para main branch
                if (payload.ref === 'refs/heads/main') {
                    console.log('Deploy triggered by GitHub webhook');
                    
                    exec('/opt/siqueira-config/auto-deploy.sh', (error, stdout, stderr) => {
                        if (error) {
                            console.error('Deploy error:', error);
                        } else {
                            console.log('Deploy completed successfully');
                        }
                    });
                }
                
                res.writeHead(200, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({status: 'ok'}));
            } catch (e) {
                res.writeHead(400, {'Content-Type': 'application/json'});
                res.end(JSON.stringify({error: 'Invalid JSON'}));
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(9999, () => {
    console.log('Webhook listener running on port 9999');
});
EOF

    # Systemd service para webhook
    cat > /etc/systemd/system/webhook-listener.service << EOF
[Unit]
Description=GitHub Webhook Listener
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=$CONFIG_DIR
ExecStart=/usr/bin/node webhook-listener.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    systemctl enable webhook-listener
    systemctl start webhook-listener
    
    log "SUCCESS" "Auto-deploy configurado"
}

#==============================================================================
# FUNÇÃO PRINCIPAL DE DEPLOY
#==============================================================================

main_deploy() {
    local total_steps=15
    local current_step=0
    
    banner "INICIANDO MEGA DEPLOY ULTRA ENTERPRISE v${SCRIPT_VERSION}"
    
    # Verificar privilégios
    check_root
    
    # Etapa 1: Limpeza
    ((current_step++))
    progress_bar $current_step $total_steps "Limpeza do sistema"
    cleanup_system
    
    # Etapa 2: Estrutura
    ((current_step++))
    progress_bar $current_step $total_steps "Criando estrutura"
    create_directories
    
    # Etapa 3: Dependências do sistema
    ((current_step++))
    progress_bar $current_step $total_steps "Instalando dependências"
    install_system_dependencies
    
    # Etapa 4: Docker
    ((current_step++))
    progress_bar $current_step $total_steps "Instalando Docker"
    install_docker
    
    # Etapa 5: Node.js
    ((current_step++))
    progress_bar $current_step $total_steps "Instalando Node.js"
    install_nodejs
    
    # Etapa 6: Segurança
    ((current_step++))
    progress_bar $current_step $total_steps "Configurando segurança"
    configure_security
    
    # Etapa 7: Redes
    ((current_step++))
    progress_bar $current_step $total_steps "Criando redes Docker"
    create_docker_networks
    
    # Etapa 8: Traefik
    ((current_step++))
    progress_bar $current_step $total_steps "Deployando Traefik"
    deploy_traefik
    
    # Etapa 9: PostgreSQL
    ((current_step++))
    progress_bar $current_step $total_steps "Deployando PostgreSQL"
    deploy_postgresql
    
    # Etapa 10: Redis
    ((current_step++))
    progress_bar $current_step $total_steps "Deployando Redis"
    deploy_redis
    
    # Etapa 11: Portainer
    ((current_step++))
    progress_bar $current_step $total_steps "Deployando Portainer"
    deploy_portainer
    
    # Etapa 12: N8N
    ((current_step++))
    progress_bar $current_step $total_steps "Deployando N8N"
    deploy_n8n
    
    # Etapa 13: Evolution API
    ((current_step++))
    progress_bar $current_step $total_steps "Deployando Evolution API"
    deploy_evolution_api
    
    # Etapa 14: Monitoramento
    ((current_step++))
    progress_bar $current_step $total_steps "Deployando Monitoramento"
    deploy_monitoring
    
    # Etapa 15: Aplicação Principal
    ((current_step++))
    progress_bar $current_step $total_steps "Deployando Aplicação"
    deploy_main_app
    
    # Configurações finais
    setup_backup_system
    setup_monitoring_alerts
    setup_auto_deploy
}

#==============================================================================
# RELATÓRIO FINAL
#==============================================================================

generate_final_report() {
    banner "RELATÓRIO FINAL DE DEPLOY"
    
    echo -e "${GREEN}=========================================="
    echo "DEPLOY CONCLUÍDO COM SUCESSO!"
    echo "==========================================${NC}"
    echo
    echo -e "${CYAN}🌐 URLs DE ACESSO:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📱 Site Principal: https://${PRIMARY_DOMAIN}"
    echo "📱 Site Secundário: https://${SECONDARY_DOMAIN}"
    echo "🔧 Portainer: https://portainer.${PRIMARY_DOMAIN}"
    echo "🤖 N8N: https://n8n.${PRIMARY_DOMAIN}"
    echo "📊 Grafana: https://grafana.${PRIMARY_DOMAIN}"
    echo "📈 Prometheus: https://prometheus.${PRIMARY_DOMAIN}"
    echo "🚀 Traefik: https://traefik.${PRIMARY_DOMAIN}"
    echo "💬 Evolution API: https://api.${PRIMARY_DOMAIN}"
    echo
    echo -e "${YELLOW}🔐 CREDENCIAIS:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "PostgreSQL Password: ${POSTGRES_PASSWORD}"
    echo "Redis Password: ${REDIS_PASSWORD}"
    echo "Admin Password: ${ADMIN_PASSWORD}"
    echo "Evolution API Key: ${EVOLUTION_API_KEY}"
    echo "JWT Secret: ${JWT_SECRET}"
    echo
    echo -e "${BLUE}📊 SISTEMA:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "OS: $(lsb_release -d | cut -f2)"
    echo "Docker: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
    echo "Node.js: $(node --version)"
    echo "CPU: $(nproc) cores"
    echo "RAM: $(free -h | awk '/^Mem:/ {print $2}')"
    echo "Disk: $(df -h / | awk 'NR==2{print $2}')"
    echo
    echo -e "${PURPLE}🔄 SERVIÇOS ATIVOS:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | head -10
    echo
    echo -e "${GREEN}✅ FUNCIONALIDADES IMPLEMENTADAS:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "✓ SSL automático (Let's Encrypt)"
    echo "✓ Reverse proxy (Traefik)"
    echo "✓ Banco de dados (PostgreSQL)"
    echo "✓ Cache (Redis)"
    echo "✓ Monitoramento (Prometheus + Grafana)"
    echo "✓ Automação (N8N)"
    echo "✓ WhatsApp API (Evolution)"
    echo "✓ Container Management (Portainer)"
    echo "✓ Backup automático"
    echo "✓ Auto-deploy com GitHub"
    echo "✓ Firewall e segurança"
    echo "✓ Logs centralizados"
    echo
    echo -e "${CYAN}📁 DIRETÓRIOS IMPORTANTES:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "Logs: $LOG_DIR"
    echo "Backups: $BACKUP_DIR"
    echo "Configurações: $CONFIG_DIR"
    echo "Dados Docker: $DOCKER_DATA_DIR"
    echo "Aplicação: $APP_DIR"
    echo
    echo -e "${YELLOW}⚡ PRÓXIMOS PASSOS:${NC}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "1. Configure o webhook no GitHub: http://$(curl -s ifconfig.me):9999/deploy"
    echo "2. Acesse o Portainer para gerenciar containers"
    echo "3. Configure workflows no N8N"
    echo "4. Monitore o sistema via Grafana"
    echo "5. Configure a Evolution API para WhatsApp"
    echo
    echo -e "${GREEN}🎉 DEPLOY ULTRA ENTERPRISE CONCLUÍDO!${NC}"
    echo
    
    # Salvar relatório em arquivo
    cat > $CONFIG_DIR/deploy-report.txt << EOF
RELATÓRIO DE DEPLOY - $(date)
=====================================

URLs:
- Site Principal: https://${PRIMARY_DOMAIN}
- Site Secundário: https://${SECONDARY_DOMAIN}
- Portainer: https://portainer.${PRIMARY_DOMAIN}
- N8N: https://n8n.${PRIMARY_DOMAIN}
- Grafana: https://grafana.${PRIMARY_DOMAIN}
- Prometheus: https://prometheus.${PRIMARY_DOMAIN}
- Traefik: https://traefik.${PRIMARY_DOMAIN}
- Evolution API: https://api.${PRIMARY_DOMAIN}

Credenciais:
- PostgreSQL Password: ${POSTGRES_PASSWORD}
- Redis Password: ${REDIS_PASSWORD}
- Admin Password: ${ADMIN_PASSWORD}
- Evolution API Key: ${EVOLUTION_API_KEY}
- JWT Secret: ${JWT_SECRET}

Webhook URL: http://$(curl -s ifconfig.me):9999/deploy
EOF
    
    log "SUCCESS" "Relatório salvo em $CONFIG_DIR/deploy-report.txt"
}

#==============================================================================
# EXECUÇÃO PRINCIPAL
#==============================================================================

main() {
    # Verificar se é execução direta do script
    if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
        main_deploy
        generate_final_report
    fi
}

# Executar se for chamado diretamente
main "$@"
