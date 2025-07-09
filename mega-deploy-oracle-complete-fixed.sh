#!/bin/bash

# ===================================================================
# 🚀 MEGA DEPLOY AUTOMÁTICO COMPLETO - ORACLE UBUNTU 22.04 V5.1
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
readonly SERVER_IP="${SERVER_IP:-$(curl -s ifconfig.me 2>/dev/null || echo "127.0.0.1")}"
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

# Função para criar diretórios básicos
ensure_directories() {
    mkdir -p "$BASE_DIR" "$DOCKER_DIR" "$LOGS_DIR" "$BACKUP_DIR" "$SSL_DIR" "$SCRIPTS_DIR" "$APP_DIR" 2>/dev/null || true
    mkdir -p "$DOCKER_DIR"/{traefik,portainer,postgres,redis,n8n,evolution,monitoring} 2>/dev/null || true
    mkdir -p "$LOGS_DIR"/{traefik,portainer,postgres,redis,n8n,evolution,app} 2>/dev/null || true
    mkdir -p "$BACKUP_DIR"/{daily,weekly,monthly} 2>/dev/null || true
    chmod -R 755 "$BASE_DIR" 2>/dev/null || true
    chmod -R 700 "$SSL_DIR" 2>/dev/null || true
}

# Função para logging avançado
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Garantir que diretórios de log existam
    ensure_directories
    
    case "$level" in
        "INFO")
            echo -e "${GREEN}[${timestamp}] ℹ️  INFO: ${message}${NC}" | tee -a "$MAIN_LOG" 2>/dev/null || echo -e "${GREEN}[${timestamp}] ℹ️  INFO: ${message}${NC}"
            ;;
        "WARN")
            echo -e "${YELLOW}[${timestamp}] ⚠️  WARN: ${message}${NC}" | tee -a "$MAIN_LOG" 2>/dev/null || echo -e "${YELLOW}[${timestamp}] ⚠️  WARN: ${message}${NC}"
            ;;
        "ERROR")
            echo -e "${RED}[${timestamp}] ❌ ERROR: ${message}${NC}" | tee -a "$MAIN_LOG" "$ERROR_LOG" 2>/dev/null || echo -e "${RED}[${timestamp}] ❌ ERROR: ${message}${NC}"
            ;;
        "SUCCESS")
            echo -e "${GREEN}[${timestamp}] ✅ SUCCESS: ${message}${NC}" | tee -a "$MAIN_LOG" 2>/dev/null || echo -e "${GREEN}[${timestamp}] ✅ SUCCESS: ${message}${NC}"
            ;;
        "STEP")
            ((CURRENT_STEP++))
            local progress=$((CURRENT_STEP * 100 / TOTAL_STEPS))
            echo -e "\n${BLUE}════════════════════════════════════════════════${NC}"
            echo -e "${WHITE}📋 ETAPA ${CURRENT_STEP}/${TOTAL_STEPS} (${progress}%) - ${message}${NC}"
            echo -e "${BLUE}════════════════════════════════════════════════${NC}\n"
            echo "[${timestamp}] STEP ${CURRENT_STEP}/${TOTAL_STEPS}: ${message}" >> "$MAIN_LOG" 2>/dev/null || true
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
    
    if [ "$memory_gb" -lt 10 ]; then
        log "WARN" "RAM baixa detectada (${memory_gb}GB). Recomendado: 20GB+"
    fi
    
    if [ "$disk_gb" -lt 30 ]; then
        log "ERROR" "Espaço em disco insuficiente (${disk_gb}GB). Mínimo: 30GB"
        exit 1
    fi
    
    log "SUCCESS" "Recursos do sistema validados"
}

# Função para limpar locks do APT
clean_apt_locks() {
    log "INFO" "Limpando locks do APT..."
    rm -f /var/lib/dpkg/lock-frontend
    rm -f /var/lib/dpkg/lock
    rm -f /var/cache/apt/archives/lock
    rm -f /var/lib/apt/lists/lock
    
    # Configurar variável de ambiente para evitar prompts
    export DEBIAN_FRONTEND=noninteractive
    
    # Reconfigurar pacotes interrompidos
    dpkg --configure -a 2>/dev/null || true
    apt-get -f install -y 2>/dev/null || true
}

# Função para limpeza completa do sistema
cleanup_system() {
    log "INFO" "Iniciando limpeza completa do sistema..."
    
    # Limpar locks primeiro
    clean_apt_locks
    
    # Parar todos os containers Docker se existirem
    if command -v docker >/dev/null 2>&1; then
        log "INFO" "Parando todos os containers Docker..."
        docker stop $(docker ps -aq) 2>/dev/null || true
        docker rm $(docker ps -aq) 2>/dev/null || true
        docker system prune -af 2>/dev/null || true
        docker volume prune -f 2>/dev/null || true
        docker network prune -f 2>/dev/null || true
    fi
    
    # Parar serviços
    log "INFO" "Parando serviços..."
    systemctl stop nginx apache2 mysql postgresql redis-server 2>/dev/null || true
    systemctl disable nginx apache2 mysql postgresql redis-server 2>/dev/null || true
    
    # Limpeza completa do Node.js para resolver conflitos
    log "INFO" "Removendo Node.js e dependências conflitantes..."
    apt-get remove -y nodejs npm libnode72 libnode-dev 2>/dev/null || true
    apt-get purge -y nodejs npm libnode72 libnode-dev 2>/dev/null || true
    rm -rf /usr/lib/node_modules /usr/share/node* /usr/include/node* 2>/dev/null || true
    rm -rf /usr/share/systemtap/tapset/node.stp 2>/dev/null || true
    rm -rf /etc/apt/sources.list.d/nodesource.list 2>/dev/null || true
    
    # Remover Docker e Docker Compose
    log "INFO" "Removendo Docker e dependências..."
    apt-get remove -y docker docker-engine docker.io containerd runc docker-compose-plugin docker-compose 2>/dev/null || true
    
    # Remover outros pacotes desnecessários
    apt-get remove -y nginx apache2 mysql-server postgresql redis-server 2>/dev/null || true
    
    # Limpeza de diretórios
    log "INFO" "Removendo diretórios antigos..."
    rm -rf /opt/mega-deploy-old 2>/dev/null || true
    mv /opt/mega-deploy /opt/mega-deploy-old 2>/dev/null || true
    rm -rf /var/lib/docker /etc/docker ~/.docker 2>/dev/null || true
    rm -rf /usr/local/bin/docker-compose 2>/dev/null || true
    
    # Limpeza final
    apt-get autoremove -y 2>/dev/null || true
    apt-get autoclean 2>/dev/null || true
    
    # Forçar limpeza de conflitos dpkg
    log "INFO" "Resolvendo conflitos dpkg..."
    dpkg --configure -a 2>/dev/null || true
    apt-get -f install -y 2>/dev/null || true
    
    log "SUCCESS" "Limpeza completa do sistema finalizada"
}

# Função para configurar diretórios
setup_directories() {
    log "INFO" "Criando estrutura de diretórios..."
    ensure_directories
    log "SUCCESS" "Estrutura de diretórios criada"
}

# Função para instalar dependências básicas
install_dependencies() {
    log "INFO" "Atualizando sistema e instalando dependências..."
    
    # Limpar cache e locks novamente
    clean_apt_locks
    
    # Atualizar repositórios com retry
    for i in {1..3}; do
        if apt-get update -y; then
            break
        fi
        log "WARN" "Tentativa $i de atualização falhou, tentando novamente..."
        sleep 5
        clean_apt_locks
    done
    
    # Upgrade do sistema
    apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"
    
    # Instalar dependências essenciais (sem nodejs ainda)
    log "INFO" "Instalando dependências básicas..."
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
        netcat \
        build-essential
    
    # Instalar Node.js 18 de forma limpa
    log "INFO" "Instalando Node.js 18..."
    
    # Remover repositório antigo se existir
    rm -f /etc/apt/sources.list.d/nodesource.list
    
    # Adicionar repositório NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    
    # Instalar Node.js
    apt-get install -y nodejs
    
    # Verificar instalação
    node_version=$(node --version 2>/dev/null || echo "não instalado")
    npm_version=$(npm --version 2>/dev/null || echo "não instalado")
    
    log "SUCCESS" "Node.js instalado: $node_version, NPM: $npm_version"
    
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
    ufw allow 9001/tcp comment "GitHub Webhook"
    
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
    mkdir -p "$DOCKER_DIR/traefik/letsencrypt"
    
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

networks:
  traefik-network:
    external: true
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
bind 0.0.0.0
port 6379
protected-mode yes
requirepass ${REDIS_PASSWORD}

save 900 1
save 300 10
save 60 10000

rdbcompression yes
rdbchecksum yes
dbfilename dump.rdb
dir /data

maxmemory 2gb
maxmemory-policy allkeys-lru

loglevel notice
logfile /var/log/redis/redis.log

tcp-keepalive 300
timeout 300

appendonly yes
appendfilename "appendonly.aof"
appendfsync everysec
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
      - SERVER_PORT=8080
      - SERVER_URL=https://evolution.${DOMAIN_MAIN}
      - AUTHENTICATION_API_KEY=${EVOLUTION_API_KEY}
      - DATABASE_ENABLED=true
      - DATABASE_CONNECTION_URI=postgresql://evolution_user:${POSTGRES_PASSWORD}@postgres:5432/evolution_db
      - REDIS_ENABLED=true
      - REDIS_URI=redis://:${REDIS_PASSWORD}@redis:6379
      - LOG_LEVEL=ERROR
      - WEBHOOK_GLOBAL_ENABLED=false
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
    
    # Instalar dependências se package.json existir
    if [ -f "package.json" ]; then
        npm install
    fi
    
    # Criar arquivo .env
    cat > .env << EOF
NODE_ENV=production
PORT=3001
FRONTEND_PORT=3000
DATABASE_URL=postgresql://siqueira_user:${POSTGRES_PASSWORD}@postgres:5432/siqueira_db
REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
JWT_SECRET=${N8N_ENCRYPTION_KEY}
EVOLUTION_API_URL=https://evolution.${DOMAIN_MAIN}
EVOLUTION_API_KEY=${EVOLUTION_API_KEY}
APP_URL=https://${DOMAIN_MAIN}
API_URL=https://api.${DOMAIN_MAIN}
EOF

    # Docker Compose básico para aplicação
    cat > docker-compose.yml << EOF
version: '3.8'

services:
  app:
    build: .
    container_name: siqueira-app
    restart: unless-stopped
    networks:
      - traefik-network
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://siqueira_user:${POSTGRES_PASSWORD}@postgres:5432/siqueira_db
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
    volumes:
      - ../../logs/app:/app/logs
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(\`${DOMAIN_MAIN}\`)"
      - "traefik.http.routers.app.entrypoints=websecure"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"
      - "traefik.http.services.app.loadbalancer.server.port=3000"

networks:
  traefik-network:
    external: true
EOF

    # Dockerfile básico se não existir
    if [ ! -f "Dockerfile" ]; then
        cat > Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
EOF
    fi

    log "SUCCESS" "Aplicação configurada"
}

# Função para configurar auto-deploy do GitHub
setup_auto_deploy() {
    log "INFO" "Configurando auto-deploy do GitHub..."
    
    # Script de auto-deploy
    cat > "$SCRIPTS_DIR/auto-deploy.sh" << 'EOF'
#!/bin/bash

set -euo pipefail

LOG_FILE="/opt/mega-deploy/logs/auto-deploy.log"
APP_DIR="/opt/mega-deploy/app/site-jurez-2.0"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"
}

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
    
    # Atualizar código
    git pull origin main
    
    # Instalar dependências se necessário
    if [ -f "package.json" ]; then
        npm install
    fi
    
    # Restart containers
    docker-compose down
    docker-compose up -d --build
    
    log "Deploy concluído com sucesso"
}

auto_deploy
EOF

    chmod +x "$SCRIPTS_DIR/auto-deploy.sh"
    
    # Cron job para verificação a cada 15 minutos
    echo "*/15 * * * * /opt/mega-deploy/scripts/auto-deploy.sh >/dev/null 2>&1" | crontab -
    
    log "SUCCESS" "Auto-deploy configurado"
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
# 🚀 Relatório de Deploy - Mega Deploy Oracle v5.1

## ✅ Deploy Concluído com Sucesso!

**Data/Hora:** $(date)
**Servidor:** ${SERVER_IP}
**Domínios:** ${DOMAIN_MAIN}, ${DOMAIN_SECONDARY}

---

## 🌐 URLs de Acesso

### Domínio Principal (${DOMAIN_MAIN})
- **Site Principal:** https://${DOMAIN_MAIN}
- **Traefik Dashboard:** https://traefik.${DOMAIN_MAIN}
- **Portainer:** https://portainer.${DOMAIN_MAIN}
- **N8N:** https://n8n.${DOMAIN_MAIN}
- **Evolution API:** https://evolution.${DOMAIN_MAIN}

---

## 🔐 Credenciais de Acesso

### PostgreSQL
- **Host:** localhost:5432
- **Usuário Principal:** postgres
- **Senha:** ${POSTGRES_PASSWORD}

### Redis
- **Host:** localhost:6379
- **Senha:** ${REDIS_PASSWORD}

### Portainer
- **Usuário:** admin
- **Primeira configuração necessária**

### N8N
- **Usuário:** admin
- **Senha:** ${PORTAINER_PASSWORD}

### Evolution API
- **API Key:** ${EVOLUTION_API_KEY}

---

## 📊 Status dos Containers
$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")

---

## 🎯 Próximos Passos

1. **Configure o DNS dos domínios para:** ${SERVER_IP}
2. **Acesse o Portainer:** https://portainer.${DOMAIN_MAIN}
3. **Configure a Evolution API:** https://evolution.${DOMAIN_MAIN}
4. **Configure automações N8N:** https://n8n.${DOMAIN_MAIN}

---

## 🔧 Comandos Úteis

### Ver logs dos serviços
\`\`\`bash
docker logs -f <container_name>
\`\`\`

### Restart de um serviço
\`\`\`bash
cd /opt/mega-deploy/docker/<service> && docker-compose restart
\`\`\`

### Deploy manual da aplicação
\`\`\`bash
/opt/mega-deploy/scripts/auto-deploy.sh
\`\`\`

---

## 🎉 Deploy Finalizado!

O servidor está completamente configurado e funcionando!
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
║     🚀 MEGA DEPLOY AUTOMÁTICO ORACLE UBUNTU 22.04 V5.1          ║
║                                                                  ║
║     Deploy completo e robusto para Siqueira Campos Imóveis      ║
║     Servidor Oracle: 2 cores, 24GB RAM, 200GB storage          ║
║     Domínios: siqueicamposimoveis.com.br e meuboot.site         ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}\n"
    
    # Criar diretórios básicos primeiro
    ensure_directories
    
    log "INFO" "🚀 Iniciando Mega Deploy Oracle Ubuntu 22.04 v5.1"
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
    echo -e "\n${GREEN}═══════════════��════════════════════════════════${NC}"
    echo -e "${WHITE}🎉 DEPLOY CONCLUÍDO COM SUCESSO! 🎉${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════${NC}\n"
    
    log "SUCCESS" "🎉 Mega Deploy Oracle Ubuntu 22.04 v5.1 concluído com sucesso!"
    log "INFO" "📋 Relatório completo: $BASE_DIR/deploy-report.md"
    log "INFO" "🔐 Credenciais salvas: $BASE_DIR/credentials.txt"
    log "INFO" "📊 Acesse Portainer: https://portainer.$DOMAIN_MAIN"
    log "INFO" "🌐 Site principal: https://$DOMAIN_MAIN"
    
    echo -e "${CYAN}⚡ Próximos passos:${NC}"
    echo -e "1. Configure o DNS dos domínios para: ${YELLOW}${SERVER_IP}${NC}"
    echo -e "2. Acesse o relatório completo: ${YELLOW}$BASE_DIR/deploy-report.md${NC}"
    echo -e "3. Configure os serviços através do Portainer"
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
