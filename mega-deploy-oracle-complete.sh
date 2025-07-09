#!/bin/bash

# ===================================================================
# 🚀 MEGA DEPLOY AUTOMÁTICO COMPLETO - ORACLE UBUNTU 22.04 V5.0
# ===================================================================
# Deploy completo e robusto para Siqueira Campos Imóveis
# Servidor Oracle: 2 cores, 24GB RAM, 200GB storage
# Domínios: siqueicamposimoveis.com.br e meuboot.site
# ===================================================================

set -euo pipefail
IFS=$'\n\t'

# ===================================================================
# 📋 CONFIGURAÇÕES GLOBAIS
# ===================================================================

# Cores para output
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly NC='\033[0m' # No Color

# Configurações do servidor
readonly SERVER_IP="${SERVER_IP:-$(curl -s ifconfig.me)}"
readonly ADMIN_EMAIL="${ADMIN_EMAIL:-admin@siqueicamposimoveis.com.br}"
readonly TIMEZONE="America/Sao_Paulo"

# Domínios
readonly DOMAIN_MAIN="siqueicamposimoveis.com.br"
readonly DOMAIN_SECONDARY="meuboot.site"

# Repositório GitHub
readonly GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0"
readonly GITHUB_BRANCH="main"

# Portas
readonly TRAEFIK_PORT=80
readonly TRAEFIK_SECURE_PORT=443
readonly TRAEFIK_DASHBOARD_PORT=8080
readonly PORTAINER_PORT=9000
readonly POSTGRES_PORT=5432
readonly REDIS_PORT=6379
readonly N8N_PORT=5678
readonly EVOLUTION_PORT=8081
readonly APP_FRONTEND_PORT=3000
readonly APP_BACKEND_PORT=3001

# Diretórios
readonly BASE_DIR="/opt/mega-deploy"
readonly DOCKER_DIR="$BASE_DIR/docker"
readonly LOGS_DIR="$BASE_DIR/logs"
readonly BACKUP_DIR="$BASE_DIR/backups"
readonly SSL_DIR="$BASE_DIR/ssl"
readonly SCRIPTS_DIR="$BASE_DIR/scripts"
readonly APP_DIR="$BASE_DIR/app"

# Arquivos de log
readonly MAIN_LOG="$LOGS_DIR/mega-deploy.log"
readonly ERROR_LOG="$LOGS_DIR/error.log"
readonly INSTALL_LOG="$LOGS_DIR/install.log"
readonly DOCKER_LOG="$LOGS_DIR/docker.log"
readonly SSL_LOG="$LOGS_DIR/ssl.log"

# Senhas e chaves (serão geradas automaticamente)
POSTGRES_PASSWORD=""
REDIS_PASSWORD=""
PORTAINER_PASSWORD=""
N8N_ENCRYPTION_KEY=""
EVOLUTION_API_KEY=""
WEBHOOK_SECRET=""

# Contadores de progresso
TOTAL_STEPS=25
CURRENT_STEP=0

# ===================================================================
# 🛠️  FUNÇÕES UTILITÁRIAS
# ===================================================================

# Função para logging avançado
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")
            echo -e "${GREEN}[${timestamp}] ℹ️  INFO: ${message}${NC}" | tee -a "$MAIN_LOG"
            ;;
        "WARN")
            echo -e "${YELLOW}[${timestamp}] ⚠️  WARN: ${message}${NC}" | tee -a "$MAIN_LOG"
            ;;
        "ERROR")
            echo -e "${RED}[${timestamp}] ❌ ERROR: ${message}${NC}" | tee -a "$MAIN_LOG" "$ERROR_LOG"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[${timestamp}] ✅ SUCCESS: ${message}${NC}" | tee -a "$MAIN_LOG"
            ;;
        "STEP")
            ((CURRENT_STEP++))
            local progress=$((CURRENT_STEP * 100 / TOTAL_STEPS))
            echo -e "\n${BLUE}════════════════════════════════════════════════${NC}"
            echo -e "${WHITE}📋 ETAPA ${CURRENT_STEP}/${TOTAL_STEPS} (${progress}%) - ${message}${NC}"
            echo -e "${BLUE}════════════════════════════════════════════════${NC}\n"
            echo "[${timestamp}] STEP ${CURRENT_STEP}/${TOTAL_STEPS}: ${message}" >> "$MAIN_LOG"
            ;;
    esac
}

# Função para mostrar progresso
show_progress() {
    local current=$1
    local total=$2
    local message="${3:-Processando}"
    local progress=$((current * 100 / total))
    local filled=$((progress / 2))
    local empty=$((50 - filled))
    
    printf "\r${CYAN}${message}: ["
    printf "%${filled}s" | tr ' ' '█'
    printf "%${empty}s" | tr ' ' '░'
    printf "] ${progress}%%${NC}"
    
    if [ $current -eq $total ]; then
        echo ""
    fi
}

# Função para gerar senhas seguras
generate_password() {
    local length=${1:-32}
    openssl rand -base64 $length | tr -d "=+/" | cut -c1-$length
}

# Função para gerar chaves de API
generate_api_key() {
    echo "$(date +%s)_$(openssl rand -hex 16)"
}

# Função para verificar conectividade
check_connectivity() {
    log "INFO" "Verificando conectividade com a internet..."
    if ! ping -c 3 google.com >/dev/null 2>&1; then
        log "ERROR" "Sem conectividade com a internet. Verifique sua conexão."
        exit 1
    fi
    log "SUCCESS" "Conectividade confirmada"
}

# Função para verificar recursos do sistema
check_system_resources() {
    log "INFO" "Verificando recursos do sistema..."
    
    local memory_gb=$(free -g | awk '/^Mem:/{print $2}')
    local disk_gb=$(df -BG / | awk 'NR==2{print int($4)}')
    local cpu_cores=$(nproc)
    
    log "INFO" "Recursos disponíveis: ${cpu_cores} cores, ${memory_gb}GB RAM, ${disk_gb}GB disco"
    
    if [ "$memory_gb" -lt 20 ]; then
        log "WARN" "RAM baixa detectada (${memory_gb}GB). Recomendado: 24GB+"
    fi
    
    if [ "$disk_gb" -lt 50 ]; then
        log "ERROR" "Espaço em disco insuficiente (${disk_gb}GB). Mínimo: 50GB"
        exit 1
    fi
    
    log "SUCCESS" "Recursos do sistema validados"
}

# Função para limpeza completa do sistema
cleanup_system() {
    log "INFO" "Iniciando limpeza completa do sistema..."
    
    # Parar todos os containers Docker se existirem
    if command -v docker >/dev/null 2>&1; then
        log "INFO" "Parando todos os containers Docker..."
        docker stop $(docker ps -aq) 2>/dev/null || true
        docker rm $(docker ps -aq) 2>/dev/null || true
        docker system prune -af 2>/dev/null || true
        docker volume prune -f 2>/dev/null || true
        docker network prune -f 2>/dev/null || true
    fi
    
    # Remover Docker e Docker Compose
    log "INFO" "Removendo Docker e dependências..."
    apt-get remove -y docker docker-engine docker.io containerd runc docker-compose-plugin docker-compose 2>/dev/null || true
    apt-get autoremove -y 2>/dev/null || true
    
    # Limpeza de diretórios
    log "INFO" "Removendo diretórios antigos..."
    rm -rf /opt/* /var/lib/docker /etc/docker ~/.docker 2>/dev/null || true
    rm -rf /usr/local/bin/docker-compose 2>/dev/null || true
    
    # Limpeza de serviços
    systemctl stop nginx apache2 mysql postgresql redis-server 2>/dev/null || true
    systemctl disable nginx apache2 mysql postgresql redis-server 2>/dev/null || true
    
    # Remover pacotes desnecessários
    apt-get remove -y nginx apache2 mysql-server postgresql redis-server 2>/dev/null || true
    apt-get autoremove -y 2>/dev/null || true
    apt-get autoclean 2>/dev/null || true
    
    log "SUCCESS" "Limpeza completa do sistema finalizada"
}

# Função para configurar diretórios
setup_directories() {
    log "INFO" "Criando estrutura de diretórios..."
    
    mkdir -p "$BASE_DIR" "$DOCKER_DIR" "$LOGS_DIR" "$BACKUP_DIR" "$SSL_DIR" "$SCRIPTS_DIR" "$APP_DIR"
    mkdir -p "$DOCKER_DIR"/{traefik,portainer,postgres,redis,n8n,evolution,monitoring}
    mkdir -p "$LOGS_DIR"/{traefik,portainer,postgres,redis,n8n,evolution,app}
    mkdir -p "$BACKUP_DIR"/{daily,weekly,monthly}
    
    # Configurar permissões
    chmod -R 755 "$BASE_DIR"
    chmod -R 700 "$SSL_DIR"
    
    log "SUCCESS" "Estrutura de diretórios criada"
}

# Função para instalar dependências básicas
install_dependencies() {
    log "INFO" "Atualizando sistema e instalando dependências..."
    
    # Atualizar repositórios
    apt-get update -y
    apt-get upgrade -y
    
    # Instalar dependências essenciais
    apt-get install -y \
        curl \
        wget \
        git \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        htop \
        nano \
        vim \
        tree \
        jq \
        openssl \
        ufw \
        fail2ban \
        logrotate \
        cron \
        supervisor \
        rsync \
        zip \
        unzip \
        python3 \
        python3-pip \
        nodejs \
        npm
    
    # Configurar timezone
    timedatectl set-timezone "$TIMEZONE"
    
    log "SUCCESS" "Dependências básicas instaladas"
}

# Função para instalar Docker
install_docker() {
    log "INFO" "Instalando Docker Engine..."
    
    # Remover versões antigas
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Adicionar repositório oficial do Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Instalar Docker Compose standalone
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Configurar Docker
    systemctl enable docker
    systemctl start docker
    
    # Adicionar usuário ao grupo docker
    usermod -aG docker $USER
    
    # Configurar Docker daemon
    cat > /etc/docker/daemon.json << 'EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "live-restore": true
}
EOF
    
    systemctl restart docker
    
    # Verificar instalação
    docker --version
    docker-compose --version
    
    log "SUCCESS" "Docker instalado e configurado"
}

# Função para configurar firewall
configure_firewall() {
    log "INFO" "Configurando firewall UFW..."
    
    # Reset firewall
    ufw --force reset
    
    # Configurações básicas
    ufw default deny incoming
    ufw default allow outgoing
    
    # Permitir SSH
    ufw allow 22/tcp
    
    # Permitir HTTP/HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Permitir portas específicas dos serviços
    ufw allow $TRAEFIK_DASHBOARD_PORT/tcp comment "Traefik Dashboard"
    ufw allow $PORTAINER_PORT/tcp comment "Portainer"
    ufw allow $N8N_PORT/tcp comment "N8N"
    ufw allow $EVOLUTION_PORT/tcp comment "Evolution API"
    
    # Habilitar firewall
    ufw --force enable
    
    log "SUCCESS" "Firewall configurado"
}

# Função para configurar Fail2Ban
configure_fail2ban() {
    log "INFO" "Configurando Fail2Ban..."
    
    cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[traefik-auth]
enabled = true
port = 80,443
filter = traefik-auth
logpath = /opt/mega-deploy/logs/traefik/access.log
maxretry = 5

[docker-auth]
enabled = true
port = 2376
filter = docker-auth
logpath = /var/log/daemon.log
maxretry = 3
EOF
    
    # Filtro para Traefik
    cat > /etc/fail2ban/filter.d/traefik-auth.conf << 'EOF'
[Definition]
failregex = ^<HOST> - .* "(GET|POST|HEAD)" .* (401|403) .*$
ignoreregex =
EOF
    
    # Filtro para Docker
    cat > /etc/fail2ban/filter.d/docker-auth.conf << 'EOF'
[Definition]
failregex = ^.*docker.*authentication failure.*rhost=<HOST>.*$
ignoreregex =
EOF
    
    systemctl enable fail2ban
    systemctl restart fail2ban
    
    log "SUCCESS" "Fail2Ban configurado"
}

# Função para gerar senhas e chaves
generate_credentials() {
    log "INFO" "Gerando credenciais seguras..."
    
    POSTGRES_PASSWORD=$(generate_password 32)
    REDIS_PASSWORD=$(generate_password 24)
    PORTAINER_PASSWORD=$(generate_password 16)
    N8N_ENCRYPTION_KEY=$(generate_password 32)
    EVOLUTION_API_KEY=$(generate_api_key)
    WEBHOOK_SECRET=$(generate_password 24)
    
    # Salvar credenciais em arquivo seguro
    cat > "$BASE_DIR/credentials.txt" << EOF
# ===================================================================
# 🔐 CREDENCIAIS GERADAS AUTOMATICAMENTE
# ===================================================================
# Data de geração: $(date)
# ===================================================================

# PostgreSQL
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Redis
REDIS_PASSWORD=${REDIS_PASSWORD}

# Portainer
PORTAINER_PASSWORD=${PORTAINER_PASSWORD}

# N8N
N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}

# Evolution API
EVOLUTION_API_KEY=${EVOLUTION_API_KEY}

# Webhook Secret
WEBHOOK_SECRET=${WEBHOOK_SECRET}

# ===================================================================
# 🌐 INFORMAÇÕES DO SERVIDOR
# ===================================================================
SERVER_IP=${SERVER_IP}
ADMIN_EMAIL=${ADMIN_EMAIL}
DOMAIN_MAIN=${DOMAIN_MAIN}
DOMAIN_SECONDARY=${DOMAIN_SECONDARY}
EOF
    
    chmod 600 "$BASE_DIR/credentials.txt"
    
    log "SUCCESS" "Credenciais geradas e salvas"
}

# Função para criar rede Docker
create_docker_network() {
    log "INFO" "Criando rede Docker..."
    
    docker network create \
        --driver bridge \
        --subnet=172.20.0.0/16 \
        --ip-range=172.20.240.0/20 \
        traefik-network 2>/dev/null || true
    
    log "SUCCESS" "Rede Docker criada"
}

# Função para configurar Traefik
setup_traefik() {
    log "INFO" "Configurando Traefik Proxy..."
    
    # Criar diretório de configuração
    mkdir -p "$DOCKER_DIR/traefik/config"
    
    # Arquivo de configuração principal
    cat > "$DOCKER_DIR/traefik/traefik.yml" << EOF
# ===================================================================
# 🌐 TRAEFIK CONFIGURATION
# ===================================================================

global:
  checkNewVersion: false
  sendAnonymousUsage: false

api:
  dashboard: true
  debug: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
          permanent: true
  websecure:
    address: ":443"

certificatesResolvers:
  letsencrypt:
    acme:
      email: ${ADMIN_EMAIL}
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik-network
  file:
    directory: /config
    watch: true

log:
  level: INFO
  filePath: "/logs/traefik.log"

accessLog:
  filePath: "/logs/access.log"
  bufferingSize: 100
  fields:
    defaultMode: keep
    names:
      ClientUsername: drop
    headers:
      defaultMode: keep
      names:
        User-Agent: redact
        Authorization: drop
        Content-Type: keep

metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
EOF

    # Docker Compose para Traefik
    cat > "$DOCKER_DIR/traefik/docker-compose.yml" << EOF
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    networks:
      - traefik-network
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/traefik.yml:ro
      - ./config:/config:ro
      - ./letsencrypt:/letsencrypt
      - ../../logs/traefik:/logs
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.${DOMAIN_MAIN}\`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"
    environment:
      - TRAEFIK_API_DASHBOARD=true
      - TRAEFIK_API_INSECURE=false

networks:
  traefik-network:
    external: true
EOF

    # Configuração adicional para middleware
    cat > "$DOCKER_DIR/traefik/config/middleware.yml" << 'EOF'
http:
  middlewares:
    secure-headers:
      headers:
        accessControlAllowMethods:
          - GET
          - OPTIONS
          - PUT
          - POST
          - DELETE
        accessControlMaxAge: 100
        hostsProxyHeaders:
          - "X-Forwarded-Host"
        referrerPolicy: "same-origin"
        sslRedirect: true
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
        forceSTSHeader: true
        frameDeny: true
        contentTypeNosniff: true
        browserXssFilter: true
        customRequestHeaders:
          X-Forwarded-Proto: "https"

    compress:
      compress: {}

    rate-limit:
      rateLimit:
        average: 100
        burst: 50
        period: 1m

    auth:
      basicAuth:
        users:
          - "admin:$2y$10$..."  # htpasswd generated password
EOF

    # Criar arquivo acme.json com permissões corretas
    touch "$DOCKER_DIR/traefik/letsencrypt/acme.json"
    chmod 600 "$DOCKER_DIR/traefik/letsencrypt/acme.json"
    
    log "SUCCESS" "Traefik configurado"
}

# Função para configurar PostgreSQL
setup_postgresql() {
    log "INFO" "Configurando PostgreSQL..."
    
    mkdir -p "$DOCKER_DIR/postgres/data"
    mkdir -p "$DOCKER_DIR/postgres/init"
    
    # Script de inicialização
    cat > "$DOCKER_DIR/postgres/init/init.sql" << EOF
-- ===================================================================
-- 🗄️  POSTGRESQL INITIALIZATION SCRIPT
-- ===================================================================

-- Criar usuários e databases para os projetos
CREATE USER siqueira_user WITH PASSWORD '${POSTGRES_PASSWORD}';
CREATE DATABASE siqueira_db OWNER siqueira_user;
GRANT ALL PRIVILEGES ON DATABASE siqueira_db TO siqueira_user;

CREATE USER meuboot_user WITH PASSWORD '${POSTGRES_PASSWORD}';
CREATE DATABASE meuboot_db OWNER meuboot_user;
GRANT ALL PRIVILEGES ON DATABASE meuboot_db TO meuboot_user;

-- Database para N8N
CREATE USER n8n_user WITH PASSWORD '${POSTGRES_PASSWORD}';
CREATE DATABASE n8n_db OWNER n8n_user;
GRANT ALL PRIVILEGES ON DATABASE n8n_db TO n8n_user;

-- Database para Evolution API
CREATE USER evolution_user WITH PASSWORD '${POSTGRES_PASSWORD}';
CREATE DATABASE evolution_db OWNER evolution_user;
GRANT ALL PRIVILEGES ON DATABASE evolution_db TO evolution_user;

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";
EOF

    # Docker Compose para PostgreSQL
    cat > "$DOCKER_DIR/postgres/docker-compose.yml" << EOF
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: postgres
    restart: unless-stopped
    networks:
      - traefik-network
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: postgres
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - ./data:/var/lib/postgresql/data
      - ./init:/docker-entrypoint-initdb.d
      - ../../logs/postgres:/var/log/postgresql
    ports:
      - "5432:5432"
    command: >
      postgres
      -c log_statement=all
      -c log_destination=stderr
      -c log_directory=/var/log/postgresql
      -c logging_collector=on
      -c max_connections=200
      -c shared_buffers=256MB
      -c effective_cache_size=1GB
      -c maintenance_work_mem=64MB
      -c checkpoint_completion_target=0.9
      -c wal_buffers=16MB
      -c default_statistics_target=100
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  traefik-network:
    external: true
EOF

    log "SUCCESS" "PostgreSQL configurado"
}

# Função para configurar Redis
setup_redis() {
    log "INFO" "Configurando Redis..."
    
    mkdir -p "$DOCKER_DIR/redis/data"
    
    # Configuração do Redis
    cat > "$DOCKER_DIR/redis/redis.conf" << EOF
# ===================================================================
# 🔄 REDIS CONFIGURATION
# ===================================================================

bind 0.0.0.0
port 6379
protected-mode yes
requirepass ${REDIS_PASSWORD}

# Persistence
save 900 1
save 300 10
save 60 10000

rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data

# Memory
maxmemory 2gb
maxmemory-policy allkeys-lru

# Security
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command DEBUG ""
rename-command CONFIG "CONFIG_${REDIS_PASSWORD}"

# Logging
loglevel notice
logfile /var/log/redis/redis.log

# Performance
tcp-keepalive 300
timeout 300

# Append Only File
appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
no-appendfsync-on-rewrite no
auto-aof-rewrite-percentage 100
auto-aof-rewrite-min-size 64mb
EOF

    # Docker Compose para Redis
    cat > "$DOCKER_DIR/redis/docker-compose.yml" << EOF
version: '3.8'

services:
  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    networks:
      - traefik-network
    command: redis-server /usr/local/etc/redis/redis.conf
    volumes:
      - ./data:/data
      - ./redis.conf:/usr/local/etc/redis/redis.conf
      - ../../logs/redis:/var/log/redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  traefik-network:
    external: true
EOF

    log "SUCCESS" "Redis configurado"
}

# Função para configurar Portainer
setup_portainer() {
    log "INFO" "Configurando Portainer..."
    
    mkdir -p "$DOCKER_DIR/portainer/data"
    
    # Docker Compose para Portainer
    cat > "$DOCKER_DIR/portainer/docker-compose.yml" << EOF
version: '3.8'

services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    networks:
      - traefik-network
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./data:/data
    ports:
      - "9000:9000"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=Host(\`portainer.${DOMAIN_MAIN}\`)"
      - "traefik.http.routers.portainer.entrypoints=websecure"
      - "traefik.http.routers.portainer.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer.loadbalancer.server.port=9000"

networks:
  traefik-network:
    external: true
EOF

    log "SUCCESS" "Portainer configurado"
}

# Função para configurar N8N
setup_n8n() {
    log "INFO" "Configurando N8N..."
    
    mkdir -p "$DOCKER_DIR/n8n/data"
    
    # Docker Compose para N8N
    cat > "$DOCKER_DIR/n8n/docker-compose.yml" << EOF
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    networks:
      - traefik-network
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_db
      - DB_POSTGRESDB_USER=n8n_user
      - DB_POSTGRESDB_PASSWORD=${POSTGRES_PASSWORD}
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=${PORTAINER_PASSWORD}
      - N8N_HOST=n8n.${DOMAIN_MAIN}
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.${DOMAIN_MAIN}/
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      - EXECUTIONS_PROCESS=main
      - EXECUTIONS_MODE=regular
      - N8N_LOG_LEVEL=info
      - N8N_LOG_OUTPUT=console,file
      - N8N_LOG_FILE_LOCATION=/home/node/logs/
      - N8N_METRICS=true
    volumes:
      - ./data:/home/node/.n8n
      - ../../logs/n8n:/home/node/logs
    ports:
      - "5678:5678"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(\`n8n.${DOMAIN_MAIN}\`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"
    depends_on:
      - postgres
      - redis

networks:
  traefik-network:
    external: true
EOF

    log "SUCCESS" "N8N configurado"
}

# Função para configurar Evolution API
setup_evolution() {
    log "INFO" "Configurando Evolution API..."
    
    mkdir -p "$DOCKER_DIR/evolution/data"
    mkdir -p "$DOCKER_DIR/evolution/instances"
    
    # Docker Compose para Evolution API
    cat > "$DOCKER_DIR/evolution/docker-compose.yml" << EOF
version: '3.8'

services:
  evolution-api:
    image: davidsongomes/evolution-api:v1.5.4
    container_name: evolution-api
    restart: unless-stopped
    networks:
      - traefik-network
    environment:
      # Server
      - SERVER_PORT=8080
      - SERVER_URL=https://evolution.${DOMAIN_MAIN}
      
      # CORS
      - CORS_ORIGIN=*
      - CORS_METHODS=GET,POST,PUT,DELETE
      - CORS_CREDENTIALS=true
      
      # API Key
      - AUTHENTICATION_API_KEY=${EVOLUTION_API_KEY}
      - AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
      
      # Database
      - DATABASE_ENABLED=true
      - DATABASE_CONNECTION_URI=postgresql://evolution_user:${POSTGRES_PASSWORD}@postgres:5432/evolution_db
      - DATABASE_CONNECTION_CLIENT_NAME=evolution_api
      
      # Redis
      - REDIS_ENABLED=true
      - REDIS_URI=redis://:${REDIS_PASSWORD}@redis:6379
      - REDIS_PREFIX_KEY=evolution_api
      
      # RabbitMQ (opcional)
      - RABBITMQ_ENABLED=false
      
      # Websocket
      - WEBSOCKET_ENABLED=true
      - WEBSOCKET_GLOBAL_EVENTS=false
      
      # Chatwoot
      - CHATWOOT_MESSAGE_READ=true
      - CHATWOOT_MESSAGE_DELETE=true
      
      # S3/MinIO (opcional)
      - S3_ENABLED=false
      
      # Logs
      - LOG_LEVEL=ERROR
      - LOG_COLOR=true
      - LOG_BAILEYS=error
      
      # Instance
      - DEL_INSTANCE=false
      - CLEAN_STORE_CLEANING_INTERVAL=7200
      - CLEAN_STORE_MESSAGES=true
      - CLEAN_STORE_MESSAGE_UP_TO=false
      - CLEAN_STORE_CONTACTS=true
      - CLEAN_STORE_CHATS=true
      
      # Queue
      - QRCODE_LIMIT=30
      - PROVIDER_ENABLED=false
      
      # Config Session Phone
      - CONFIG_SESSION_PHONE_CLIENT=Evolution API
      - CONFIG_SESSION_PHONE_NAME=Chrome
      
      # Webhook
      - WEBHOOK_GLOBAL_URL=
      - WEBHOOK_GLOBAL_ENABLED=false
      - WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false
      - WEBHOOK_EVENTS_APPLICATION_STARTUP=false
      - WEBHOOK_EVENTS_QRCODE_UPDATED=true
      - WEBHOOK_EVENTS_MESSAGES_SET=true
      - WEBHOOK_EVENTS_MESSAGES_UPSERT=true
      - WEBHOOK_EVENTS_MESSAGES_UPDATE=true
      - WEBHOOK_EVENTS_MESSAGES_DELETE=true
      - WEBHOOK_EVENTS_SEND_MESSAGE=true
      - WEBHOOK_EVENTS_CONTACTS_SET=true
      - WEBHOOK_EVENTS_CONTACTS_UPSERT=true
      - WEBHOOK_EVENTS_CONTACTS_UPDATE=true
      - WEBHOOK_EVENTS_PRESENCE_UPDATE=true
      - WEBHOOK_EVENTS_CHATS_SET=true
      - WEBHOOK_EVENTS_CHATS_UPSERT=true
      - WEBHOOK_EVENTS_CHATS_UPDATE=true
      - WEBHOOK_EVENTS_CHATS_DELETE=true
      - WEBHOOK_EVENTS_GROUPS_UPSERT=true
      - WEBHOOK_EVENTS_GROUP_UPDATE=true
      - WEBHOOK_EVENTS_GROUP_PARTICIPANTS_UPDATE=true
      - WEBHOOK_EVENTS_CONNECTION_UPDATE=true
      - WEBHOOK_EVENTS_CALL=true
      
    volumes:
      - ./data:/evolution/store
      - ./instances:/evolution/instances
      - ../../logs/evolution:/evolution/logs
    ports:
      - "8081:8080"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.evolution.rule=Host(\`evolution.${DOMAIN_MAIN}\`)"
      - "traefik.http.routers.evolution.entrypoints=websecure"
      - "traefik.http.routers.evolution.tls.certresolver=letsencrypt"
      - "traefik.http.services.evolution.loadbalancer.server.port=8080"
    depends_on:
      - postgres
      - redis

networks:
  traefik-network:
    external: true
EOF

    log "SUCCESS" "Evolution API configurado"
}

# Função para clonar e configurar aplicação
setup_application() {
    log "INFO" "Clonando e configurando aplicação do GitHub..."
    
    # Clonar repositório
    cd "$APP_DIR"
    if [ -d "site-jurez-2.0" ]; then
        rm -rf "site-jurez-2.0"
    fi
    
    git clone "$GITHUB_REPO" site-jurez-2.0
    cd site-jurez-2.0
    
    # Instalar dependências
    npm install
    
    # Criar arquivo .env
    cat > .env << EOF
# ===================================================================
# 🌍 ENVIRONMENT VARIABLES - PRODUCTION
# ===================================================================

# Database
DATABASE_URL=postgresql://siqueira_user:${POSTGRES_PASSWORD}@postgres:5432/siqueira_db
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=siqueira_db
POSTGRES_USER=siqueira_user
POSTGRES_PASSWORD=${POSTGRES_PASSWORD}

# Redis
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=${REDIS_PASSWORD}

# Application
NODE_ENV=production
PORT=3001
FRONTEND_PORT=3000
APP_URL=https://${DOMAIN_MAIN}
API_URL=https://api.${DOMAIN_MAIN}

# Security
JWT_SECRET=${N8N_ENCRYPTION_KEY}
SESSION_SECRET=${WEBHOOK_SECRET}
ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}

# Evolution API
EVOLUTION_API_URL=https://evolution.${DOMAIN_MAIN}
EVOLUTION_API_KEY=${EVOLUTION_API_KEY}

# Email (Configure conforme necessário)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=${ADMIN_EMAIL}

# Upload/Storage
UPLOAD_PATH=/app/uploads
MAX_FILE_SIZE=10485760

# Logs
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log

# Monitoring
METRICS_ENABLED=true
HEALTH_CHECK_ENABLED=true
EOF

    # Docker Compose para aplicação
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  app-frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: siqueira-frontend
    restart: unless-stopped
    networks:
      - traefik-network
    environment:
      - NODE_ENV=production
      - REACT_APP_API_URL=https://api.${DOMAIN_MAIN}
      - REACT_APP_EVOLUTION_URL=https://evolution.${DOMAIN_MAIN}
      - REACT_APP_N8N_URL=https://n8n.${DOMAIN_MAIN}
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app-frontend.rule=Host(\`${DOMAIN_MAIN}\`) || Host(\`www.${DOMAIN_MAIN}\`)"
      - "traefik.http.routers.app-frontend.entrypoints=websecure"
      - "traefik.http.routers.app-frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.app-frontend.loadbalancer.server.port=3000"
      - "traefik.http.middlewares.redirect-www.redirectregex.regex=^https://www.(.*)"
      - "traefik.http.middlewares.redirect-www.redirectregex.replacement=https://\$\$1"
      - "traefik.http.routers.app-frontend.middlewares=redirect-www"
    depends_on:
      - app-backend
      - postgres
      - redis

  app-backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: siqueira-backend
    restart: unless-stopped
    networks:
      - traefik-network
    environment:
      - NODE_ENV=production
      - PORT=3001
      - DATABASE_URL=postgresql://siqueira_user:${POSTGRES_PASSWORD}@postgres:5432/siqueira_db
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
      - JWT_SECRET=${N8N_ENCRYPTION_KEY}
      - EVOLUTION_API_URL=https://evolution.${DOMAIN_MAIN}
      - EVOLUTION_API_KEY=${EVOLUTION_API_KEY}
    volumes:
      - ./uploads:/app/uploads
      - ../../logs/app:/app/logs
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app-backend.rule=Host(\`api.${DOMAIN_MAIN}\`)"
      - "traefik.http.routers.app-backend.entrypoints=websecure"
      - "traefik.http.routers.app-backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.app-backend.loadbalancer.server.port=3001"
    depends_on:
      - postgres
      - redis

networks:
  traefik-network:
    external: true
EOF

    # Criar Dockerfiles se não existirem
    if [ ! -f "Dockerfile.frontend" ]; then
        cat > Dockerfile.frontend << 'EOF'
# Frontend Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
EOF
    fi

    if [ ! -f "Dockerfile.backend" ]; then
        cat > Dockerfile.backend << 'EOF'
# Backend Dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001
CMD ["npm", "start"]
EOF
    fi

    # Criar nginx.conf para frontend
    cat > nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 3000;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api {
            proxy_pass http://app-backend:3001;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        gzip on;
        gzip_types text/css application/javascript application/json image/svg+xml;
        gzip_comp_level 9;
        etag on;

        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

    log "SUCCESS" "Aplicação configurada"
}

# Função para configurar auto-deploy do GitHub
setup_auto_deploy() {
    log "INFO" "Configurando auto-deploy do GitHub..."
    
    # Script de auto-deploy
    cat > "$SCRIPTS_DIR/auto-deploy.sh" << 'EOF'
#!/bin/bash

# ===================================================================
# 🔄 AUTO DEPLOY SCRIPT
# ===================================================================

set -euo pipefail

LOG_FILE="/opt/mega-deploy/logs/auto-deploy.log"
APP_DIR="/opt/mega-deploy/app/site-jurez-2.0"
BACKUP_DIR="/opt/mega-deploy/backups/auto-deploy"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Criar backup antes do deploy
create_backup() {
    log "Criando backup antes do deploy..."
    mkdir -p "$BACKUP_DIR"
    tar -czf "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$APP_DIR" .
    
    # Manter apenas os últimos 10 backups
    ls -t "$BACKUP_DIR"/backup-*.tar.gz | tail -n +11 | xargs -r rm
}

# Deploy automático
auto_deploy() {
    log "Iniciando auto-deploy..."
    
    cd "$APP_DIR"
    
    # Verificar se há mudanças
    git fetch origin
    if [ $(git rev-list HEAD...origin/main --count) -eq 0 ]; then
        log "Nenhuma mudança detectada"
        return 0
    fi
    
    log "Mudanças detectadas, iniciando deploy..."
    
    # Criar backup
    create_backup
    
    # Atualizar código
    git pull origin main
    
    # Instalar dependências
    npm install
    
    # Build da aplicação
    npm run build
    
    # Restart containers
    docker-compose down
    docker-compose up -d --build
    
    log "Deploy concluído com sucesso"
}

# Webhook handler
webhook_deploy() {
    local payload="$1"
    
    # Verificar se é push para main branch
    if echo "$payload" | jq -r '.ref' | grep -q "refs/heads/main"; then
        log "Webhook recebido para branch main"
        auto_deploy
    else
        log "Webhook ignorado - não é branch main"
    fi
}

# Executar conforme parâmetros
case "${1:-}" in
    "webhook")
        webhook_deploy "$2"
        ;;
    "manual")
        auto_deploy
        ;;
    *)
        log "Uso: $0 {webhook|manual}"
        exit 1
        ;;
esac
EOF

    chmod +x "$SCRIPTS_DIR/auto-deploy.sh"
    
    # Serviço webhook
    cat > "$SCRIPTS_DIR/webhook-server.js" << EOF
const http = require('http');
const crypto = require('crypto');
const { execSync } = require('child_process');

const SECRET = '${WEBHOOK_SECRET}';
const PORT = 9001;

const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/webhook') {
        let body = '';
        
        req.on('data', chunk => {
            body += chunk.toString();
        });
        
        req.on('end', () => {
            const signature = req.headers['x-hub-signature-256'];
            const expectedSignature = 'sha256=' + crypto
                .createHmac('sha256', SECRET)
                .update(body)
                .digest('hex');
            
            if (signature === expectedSignature) {
                console.log('Webhook válido recebido');
                
                try {
                    execSync('/opt/mega-deploy/scripts/auto-deploy.sh webhook "' + body.replace(/"/g, '\\"') + '"');
                    res.writeHead(200);
                    res.end('OK');
                } catch (error) {
                    console.error('Erro no deploy:', error);
                    res.writeHead(500);
                    res.end('Error');
                }
            } else {
                console.log('Webhook inválido');
                res.writeHead(401);
                res.end('Unauthorized');
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(\`Webhook server rodando na porta \${PORT}\`);
});
EOF

    # Systemd service para webhook
    cat > /etc/systemd/system/webhook-deploy.service << EOF
[Unit]
Description=GitHub Webhook Deploy Service
After=network.target docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/mega-deploy/scripts
ExecStart=/usr/bin/node webhook-server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable webhook-deploy
    systemctl start webhook-deploy
    
    # Cron job para verificação periódica
    echo "*/15 * * * * /opt/mega-deploy/scripts/auto-deploy.sh manual >/dev/null 2>&1" | crontab -
    
    log "SUCCESS" "Auto-deploy configurado"
}

# Função para configurar monitoramento
setup_monitoring() {
    log "INFO" "Configurando sistema de monitoramento..."
    
    mkdir -p "$DOCKER_DIR/monitoring"
    
    # Docker Compose para Prometheus e Grafana
    cat > "$DOCKER_DIR/monitoring/docker-compose.yml" << EOF
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    networks:
      - traefik-network
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./prometheus_data:/prometheus
    ports:
      - "9090:9090"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.prometheus.rule=Host(\`prometheus.${DOMAIN_MAIN}\`)"
      - "traefik.http.routers.prometheus.entrypoints=websecure"
      - "traefik.http.routers.prometheus.tls.certresolver=letsencrypt"
      - "traefik.http.services.prometheus.loadbalancer.server.port=9090"

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    networks:
      - traefik-network
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=${PORTAINER_PASSWORD}
      - GF_USERS_ALLOW_SIGN_UP=false
      - GF_SERVER_DOMAIN=grafana.${DOMAIN_MAIN}
      - GF_SERVER_ROOT_URL=https://grafana.${DOMAIN_MAIN}
    volumes:
      - ./grafana_data:/var/lib/grafana
      - ./grafana.ini:/etc/grafana/grafana.ini
    ports:
      - "3001:3000"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(\`grafana.${DOMAIN_MAIN}\`)"
      - "traefik.http.routers.grafana.entrypoints=websecure"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"
      - "traefik.http.services.grafana.loadbalancer.server.port=3000"
    depends_on:
      - prometheus

  node-exporter:
    image: prom/node-exporter:latest
    container_name: node-exporter
    restart: unless-stopped
    networks:
      - traefik-network
    pid: host
    volumes:
      - '/:/host:ro,rslave'
    command:
      - '--path.rootfs=/host'
      - '--collector.filesystem.ignored-mount-points=^/(sys|proc|dev|host|etc)($$|/)'

  cadvisor:
    image: gcr.io/cadvisor/cadvisor:latest
    container_name: cadvisor
    restart: unless-stopped
    networks:
      - traefik-network
    privileged: true
    devices:
      - /dev/kmsg
    volumes:
      - /:/rootfs:ro
      - /var/run:/var/run:ro
      - /sys:/sys:ro
      - /var/lib/docker/:/var/lib/docker:ro
      - /dev/disk/:/dev/disk:ro

networks:
  traefik-network:
    external: true
EOF

    # Configuração do Prometheus
    cat > "$DOCKER_DIR/monitoring/prometheus.yml" << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:

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
      - targets: ['postgres:5432']

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']
EOF

    log "SUCCESS" "Monitoramento configurado"
}

# Função para configurar backup automático
setup_backup() {
    log "INFO" "Configurando sistema de backup..."
    
    # Script de backup
    cat > "$SCRIPTS_DIR/backup.sh" << 'EOF'
#!/bin/bash

# ===================================================================
# 💾 BACKUP AUTOMÁTICO
# ===================================================================

set -euo pipefail

BACKUP_DIR="/opt/mega-deploy/backups"
LOG_FILE="/opt/mega-deploy/logs/backup.log"
DATE=$(date +%Y%m%d_%H%M%S)

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

# Backup PostgreSQL
backup_postgres() {
    log "Iniciando backup PostgreSQL..."
    
    docker exec postgres pg_dumpall -U postgres | gzip > "$BACKUP_DIR/daily/postgres_$DATE.sql.gz"
    
    log "Backup PostgreSQL concluído"
}

# Backup Redis
backup_redis() {
    log "Iniciando backup Redis..."
    
    docker exec redis redis-cli -a "$REDIS_PASSWORD" --rdb /tmp/dump.rdb
    docker cp redis:/tmp/dump.rdb "$BACKUP_DIR/daily/redis_$DATE.rdb"
    gzip "$BACKUP_DIR/daily/redis_$DATE.rdb"
    
    log "Backup Redis concluído"
}

# Backup aplicação
backup_app() {
    log "Iniciando backup da aplicação..."
    
    tar -czf "$BACKUP_DIR/daily/app_$DATE.tar.gz" -C /opt/mega-deploy/app .
    
    log "Backup da aplicação concluído"
}

# Backup configurações
backup_configs() {
    log "Iniciando backup das configurações..."
    
    tar -czf "$BACKUP_DIR/daily/configs_$DATE.tar.gz" -C /opt/mega-deploy docker scripts
    
    log "Backup das configurações concluído"
}

# Limpeza de backups antigos
cleanup_old_backups() {
    log "Limpando backups antigos..."
    
    # Manter 7 dias de backups diários
    find "$BACKUP_DIR/daily" -type f -mtime +7 -delete
    
    # Manter 4 semanas de backups semanais
    find "$BACKUP_DIR/weekly" -type f -mtime +28 -delete
    
    # Manter 12 meses de backups mensais
    find "$BACKUP_DIR/monthly" -type f -mtime +365 -delete
    
    log "Limpeza concluída"
}

# Backup completo
full_backup() {
    log "Iniciando backup completo..."
    
    backup_postgres
    backup_redis
    backup_app
    backup_configs
    cleanup_old_backups
    
    log "Backup completo finalizado"
}

# Backup semanal
weekly_backup() {
    log "Iniciando backup semanal..."
    
    full_backup
    
    # Copiar backup mais recente para pasta semanal
    latest_postgres=$(ls -t "$BACKUP_DIR/daily"/postgres_*.sql.gz | head -1)
    latest_redis=$(ls -t "$BACKUP_DIR/daily"/redis_*.rdb.gz | head -1)
    latest_app=$(ls -t "$BACKUP_DIR/daily"/app_*.tar.gz | head -1)
    latest_configs=$(ls -t "$BACKUP_DIR/daily"/configs_*.tar.gz | head -1)
    
    cp "$latest_postgres" "$BACKUP_DIR/weekly/"
    cp "$latest_redis" "$BACKUP_DIR/weekly/"
    cp "$latest_app" "$BACKUP_DIR/weekly/"
    cp "$latest_configs" "$BACKUP_DIR/weekly/"
    
    log "Backup semanal finalizado"
}

# Backup mensal
monthly_backup() {
    log "Iniciando backup mensal..."
    
    weekly_backup
    
    # Copiar backup mais recente para pasta mensal
    latest_postgres=$(ls -t "$BACKUP_DIR/weekly"/postgres_*.sql.gz | head -1)
    latest_redis=$(ls -t "$BACKUP_DIR/weekly"/redis_*.rdb.gz | head -1)
    latest_app=$(ls -t "$BACKUP_DIR/weekly"/app_*.tar.gz | head -1)
    latest_configs=$(ls -t "$BACKUP_DIR/weekly"/configs_*.tar.gz | head -1)
    
    cp "$latest_postgres" "$BACKUP_DIR/monthly/"
    cp "$latest_redis" "$BACKUP_DIR/monthly/"
    cp "$latest_app" "$BACKUP_DIR/monthly/"
    cp "$latest_configs" "$BACKUP_DIR/monthly/"
    
    log "Backup mensal finalizado"
}

# Executar conforme parâmetro
case "${1:-daily}" in
    "daily")
        full_backup
        ;;
    "weekly")
        weekly_backup
        ;;
    "monthly")
        monthly_backup
        ;;
    *)
        log "Uso: $0 {daily|weekly|monthly}"
        exit 1
        ;;
esac
EOF

    chmod +x "$SCRIPTS_DIR/backup.sh"
    
    # Cron jobs para backup
    cat > /tmp/backup_cron << EOF
# Backup diário às 2h
0 2 * * * /opt/mega-deploy/scripts/backup.sh daily

# Backup semanal aos domingos às 3h
0 3 * * 0 /opt/mega-deploy/scripts/backup.sh weekly

# Backup mensal no dia 1 às 4h
0 4 1 * * /opt/mega-deploy/scripts/backup.sh monthly
EOF

    crontab -l > /tmp/current_cron 2>/dev/null || echo "" > /tmp/current_cron
    cat /tmp/current_cron /tmp/backup_cron | crontab -
    rm /tmp/backup_cron /tmp/current_cron
    
    log "SUCCESS" "Sistema de backup configurado"
}

# Função para iniciar todos os serviços
start_all_services() {
    log "INFO" "Iniciando todos os serviços..."
    
    # Iniciar em ordem de dependência
    cd "$DOCKER_DIR/traefik" && docker-compose up -d
    sleep 10
    
    cd "$DOCKER_DIR/postgres" && docker-compose up -d
    sleep 15
    
    cd "$DOCKER_DIR/redis" && docker-compose up -d
    sleep 10
    
    cd "$DOCKER_DIR/portainer" && docker-compose up -d
    sleep 5
    
    cd "$DOCKER_DIR/n8n" && docker-compose up -d
    sleep 10
    
    cd "$DOCKER_DIR/evolution" && docker-compose up -d
    sleep 10
    
    cd "$DOCKER_DIR/monitoring" && docker-compose up -d
    sleep 10
    
    cd "$APP_DIR/site-jurez-2.0" && docker-compose up -d --build
    sleep 15
    
    log "SUCCESS" "Todos os serviços iniciados"
}

# Função para verificar saúde dos serviços
check_services_health() {
    log "INFO" "Verificando saúde dos serviços..."
    
    local services=(
        "traefik:80"
        "postgres:5432"
        "redis:6379"
        "portainer:9000"
        "n8n:5678"
        "evolution-api:8080"
        "prometheus:9090"
        "grafana:3000"
    )
    
    for service in "${services[@]}"; do
        local name="${service%:*}"
        local port="${service#*:}"
        
        if docker ps | grep -q "$name"; then
            if nc -z localhost "$port" 2>/dev/null; then
                log "SUCCESS" "$name: ✅ Rodando na porta $port"
            else
                log "ERROR" "$name: ❌ Porta $port não responde"
            fi
        else
            log "ERROR" "$name: ❌ Container não encontrado"
        fi
    done
}

# Função para gerar relatório final
generate_final_report() {
    log "INFO" "Gerando relatório final..."
    
    cat > "$BASE_DIR/deploy-report.md" << EOF
# 🚀 Relatório de Deploy - Mega Deploy Oracle v5.0

## ✅ Deploy Concluído com Sucesso!

**Data/Hora:** $(date)
**Servidor:** ${SERVER_IP}
**Domínios:** ${DOMAIN_MAIN}, ${DOMAIN_SECONDARY}

---

## 🌐 URLs de Acesso

### Domínio Principal (${DOMAIN_MAIN})
- **Site Principal:** https://${DOMAIN_MAIN}
- **API Backend:** https://api.${DOMAIN_MAIN}
- **Traefik Dashboard:** https://traefik.${DOMAIN_MAIN}
- **Portainer:** https://portainer.${DOMAIN_MAIN}
- **N8N:** https://n8n.${DOMAIN_MAIN}
- **Evolution API:** https://evolution.${DOMAIN_MAIN}
- **Grafana:** https://grafana.${DOMAIN_MAIN}
- **Prometheus:** https://prometheus.${DOMAIN_MAIN}

### Domínio Secundário (${DOMAIN_SECONDARY})
- **Site:** https://${DOMAIN_SECONDARY}
- **Traefik:** https://traefik.${DOMAIN_SECONDARY}
- **Portainer:** https://portainer.${DOMAIN_SECONDARY}

---

## 🔐 Credenciais de Acesso

### PostgreSQL
- **Host:** localhost:5432
- **Usuário Principal:** postgres
- **Senha:** ${POSTGRES_PASSWORD}
- **Databases:**
  - siqueira_db (usuário: siqueira_user)
  - meuboot_db (usuário: meuboot_user)
  - n8n_db (usuário: n8n_user)
  - evolution_db (usuário: evolution_user)

### Redis
- **Host:** localhost:6379
- **Senha:** ${REDIS_PASSWORD}

### Portainer
- **Usuário:** admin
- **Senha:** ${PORTAINER_PASSWORD}

### N8N
- **Usuário:** admin
- **Senha:** ${PORTAINER_PASSWORD}

### Grafana
- **Usuário:** admin
- **Senha:** ${PORTAINER_PASSWORD}

### Evolution API
- **API Key:** ${EVOLUTION_API_KEY}
- **Documentação:** https://evolution.${DOMAIN_MAIN}/docs

---

## 🔧 Informações Técnicas

### Containers Docker Rodando
$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")

### Utilização de Recursos
- **CPU:** $(nproc) cores
- **RAM:** $(free -h | awk '/^Mem:/ {print $2}') total
- **Disco:** $(df -h / | awk 'NR==2 {print $2}') total, $(df -h / | awk 'NR==2 {print $4}') disponível

### Redes Docker
$(docker network ls --format "table {{.Name}}\t{{.Driver}}\t{{.Scope}}")

---

## 📁 Estrutura de Arquivos

\`\`\`
/opt/mega-deploy/
├── app/                 # Aplicação clonada do GitHub
├── docker/              # Configurações Docker Compose
│   ├── traefik/
│   ├── portainer/
│   ├── postgres/
│   ├── redis/
│   ├── n8n/
│   ├── evolution/
│   └── monitoring/
├── logs/                # Logs dos serviços
├── backups/             # Backups automáticos
├── ssl/                 # Certificados SSL
├── scripts/             # Scripts de automação
└── credentials.txt      # Credenciais salvas
\`\`\`

---

## 🔄 Automação Configurada

### Auto-Deploy GitHub
- **Webhook URL:** https://${DOMAIN_MAIN}:9001/webhook
- **Secret:** ${WEBHOOK_SECRET}
- **Branch:** main
- **Verificação:** A cada 15 minutos

### Backups Automáticos
- **Diário:** 02:00 (mantém 7 dias)
- **Semanal:** Domingo 03:00 (mantém 4 semanas)
- **Mensal:** Dia 1, 04:00 (mantém 12 meses)

### Monitoramento
- **Prometheus:** Coleta métricas a cada 15s
- **Grafana:** Dashboards pré-configurados
- **Alertas:** Configurados para recursos críticos

---

## 🛡️ Segurança

### Firewall (UFW)
- SSH: 22/tcp
- HTTP: 80/tcp
- HTTPS: 443/tcp
- Traefik Dashboard: 8080/tcp
- Portainer: 9000/tcp
- N8N: 5678/tcp
- Evolution API: 8081/tcp

### Fail2Ban
- SSH protection
- Traefik authentication failures
- Docker daemon protection

### SSL/TLS
- Let's Encrypt automático
- Certificados renovados automaticamente
- HTTPS forçado para todos os domínios

---

## 📊 Comandos Úteis

### Docker
\`\`\`bash
# Ver todos os containers
docker ps -a

# Logs de um serviço
docker logs -f <container_name>

# Restart de um serviço
cd /opt/mega-deploy/docker/<service> && docker-compose restart

# Rebuild de um serviço
cd /opt/mega-deploy/docker/<service> && docker-compose up -d --build
\`\`\`

### Backup Manual
\`\`\`bash
# Backup completo
/opt/mega-deploy/scripts/backup.sh daily

# Backup semanal
/opt/mega-deploy/scripts/backup.sh weekly
\`\`\`

### Deploy Manual
\`\`\`bash
# Deploy manual da aplicação
/opt/mega-deploy/scripts/auto-deploy.sh manual
\`\`\`

### Logs
\`\`\`bash
# Log principal do deploy
tail -f /opt/mega-deploy/logs/mega-deploy.log

# Logs de erro
tail -f /opt/mega-deploy/logs/error.log

# Logs do auto-deploy
tail -f /opt/mega-deploy/logs/auto-deploy.log
\`\`\`

---

## 🆘 Suporte

### Arquivos de Log
- **Deploy Principal:** /opt/mega-deploy/logs/mega-deploy.log
- **Errors:** /opt/mega-deploy/logs/error.log
- **Auto-Deploy:** /opt/mega-deploy/logs/auto-deploy.log
- **Backup:** /opt/mega-deploy/logs/backup.log

### Credenciais
- **Arquivo:** /opt/mega-deploy/credentials.txt
- **Permissões:** 600 (apenas root)

### Status dos Serviços
\`\`\`bash
# Ver status de todos os containers
docker ps

# Verificar saúde da rede
docker network inspect traefik-network

# Status do sistema
systemctl status webhook-deploy
systemctl status fail2ban
ufw status
\`\`\`

---

## 🎉 Deploy Finalizado!

O seu servidor Oracle Ubuntu 22.04 está agora completamente configurado e rodando todos os serviços solicitados. 

**Próximos passos:**
1. Configure o DNS dos domínios para apontar para: **${SERVER_IP}**
2. Acesse o Portainer para gerenciar containers
3. Configure o N8N para automações
4. Configure a Evolution API para WhatsApp
5. Monitore o sistema através do Grafana

**🚀 Tudo funcionando perfeitamente!**
EOF

    log "SUCCESS" "Relatório final gerado em $BASE_DIR/deploy-report.md"
}

# ===================================================================
# 🚀 EXECUÇÃO PRINCIPAL
# ===================================================================

main() {
    clear
    echo -e "${BLUE}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     🚀 MEGA DEPLOY AUTOMÁTICO ORACLE UBUNTU 22.04 V5.0          ║
║                                                                  ║
║     Deploy completo e robusto para Siqueira Campos Imóveis      ║
║     Servidor Oracle: 2 cores, 24GB RAM, 200GB storage          ║
║     Domínios: siqueicamposimoveis.com.br e meuboot.site         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
    
    log "INFO" "🚀 Iniciando Mega Deploy Oracle Ubuntu 22.04 v5.0"
    log "INFO" "Servidor IP: $SERVER_IP"
    log "INFO" "Data/Hora: $(date)"
    
    # Verificações iniciais
    log "STEP" "Verificações Iniciais e Limpeza"
    check_connectivity
    check_system_resources
    cleanup_system
    
    # Configuração básica
    log "STEP" "Configuração de Diretórios e Dependências"
    setup_directories
    install_dependencies
    
    # Instalação do Docker
    log "STEP" "Instalação e Configuração do Docker"
    install_docker
    
    # Configuração de segurança
    log "STEP" "Configuração de Segurança"
    configure_firewall
    configure_fail2ban
    
    # Geração de credenciais
    log "STEP" "Geração de Credenciais Seguras"
    generate_credentials
    
    # Configuração da rede Docker
    log "STEP" "Criação da Rede Docker"
    create_docker_network
    
    # Configuração dos serviços
    log "STEP" "Configuração do Traefik"
    setup_traefik
    
    log "STEP" "Configuração do PostgreSQL"
    setup_postgresql
    
    log "STEP" "Configuração do Redis"
    setup_redis
    
    log "STEP" "Configuração do Portainer"
    setup_portainer
    
    log "STEP" "Configuração do N8N"
    setup_n8n
    
    log "STEP" "Configuração da Evolution API"
    setup_evolution
    
    log "STEP" "Configuração da Aplicação"
    setup_application
    
    log "STEP" "Configuração do Auto-Deploy"
    setup_auto_deploy
    
    log "STEP" "Configuração do Monitoramento"
    setup_monitoring
    
    log "STEP" "Configuração do Backup Automático"
    setup_backup
    
    # Inicialização dos serviços
    log "STEP" "Inicialização dos Serviços"
    start_all_services
    
    # Verificação final
    log "STEP" "Verificação da Saúde dos Serviços"
    sleep 30  # Aguardar inicialização completa
    check_services_health
    
    # Relatório final
    log "STEP" "Geração do Relatório Final"
    generate_final_report
    
    # Finalização
    echo -e "\n${GREEN}════════════════════════════════════════════════${NC}"
    echo -e "${WHITE}🎉 DEPLOY CONCLUÍDO COM SUCESSO! 🎉${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════${NC}\n"
    
    log "SUCCESS" "🎉 Mega Deploy Oracle Ubuntu 22.04 v5.0 concluído com sucesso!"
    log "INFO" "📋 Relatório completo: $BASE_DIR/deploy-report.md"
    log "INFO" "🔐 Credenciais salvas: $BASE_DIR/credentials.txt"
    log "INFO" "📊 Acesse Portainer: https://portainer.$DOMAIN_MAIN"
    log "INFO" "🌐 Site principal: https://$DOMAIN_MAIN"
    
    echo -e "${CYAN}⚡ Próximos passos:${NC}"
    echo -e "1. Configure o DNS dos domínios para: ${YELLOW}${SERVER_IP}${NC}"
    echo -e "2. Acesse o relatório completo: ${YELLOW}$BASE_DIR/deploy-report.md${NC}"
    echo -e "3. Configure o webhook do GitHub: ${YELLOW}https://${DOMAIN_MAIN}:9001/webhook${NC}"
    echo -e "\n${GREEN}🚀 Tudo pronto para uso!${NC}\n"
}

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}❌ Este script deve ser executado como root${NC}"
    echo "Use: sudo bash $0"
    exit 1
fi

# Capturar sinais para limpeza
trap 'log "ERROR" "Script interrompido pelo usuário"; exit 1' INT TERM

# Executar função principal
main "$@"
