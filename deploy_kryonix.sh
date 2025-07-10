#!/bin/bash

##############################################################################
#                        🚀 KRYONIX ULTRA DEPLOY v3.0                      #
#                Sistema Completo com SSL Automático + Auto-Deploy          #
#                      SSL + Traefik + Webhook + 2 Domínios                 #
##############################################################################

set -euo pipefail

# Configurações globais
export DEBIAN_FRONTEND=noninteractive
LOG_FILE="/var/log/kryonix-ultra-install.log"
PROJECT_DIR="/opt/site-jurez-2.0"

# Configurar logs
mkdir -p /var/log
touch "$LOG_FILE"
exec > >(tee -a "$LOG_FILE")
exec 2>&1

# Cores para output
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'
PURPLE='\033[0;35m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# Configurações principais
SERVER_IP="167.234.249.208"
DOMAIN1="siqueicamposimoveis.com.br"
DOMAIN2="meuboot.site"
GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0"
GITHUB_BRANCH="main"

# Credenciais SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="vitor.nakahh@gmail.com"
SMTP_PASS="@Vitor.12345@"
ADMIN_EMAIL="vitor.nakahh@gmail.com"

# Senhas dos serviços (geradas automaticamente)
POSTGRES_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
REDIS_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
N8N_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
GRAFANA_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
MINIO_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
PORTAINER_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
EVOLUTION_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"

# Função de logging
log() {
    local level="$1" message="$2" timestamp=$(date '+%H:%M:%S')
    case $level in
        "SUCCESS") echo -e "${GREEN}✅ [$timestamp] $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ [$timestamp] $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️ [$timestamp] $message${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️ [$timestamp] $message${NC}" ;;
        "INSTALL") echo -e "${PURPLE}⚙️ [$timestamp] $message${NC}" ;;
        "DEPLOY") echo -e "${CYAN}🚀 [$timestamp] $message${NC}" ;;
        *) echo -e "${BOLD}📋 [$timestamp] $message${NC}" ;;
    esac
}

# Banner
show_banner() {
    clear
    echo -e "${BOLD}${PURPLE}"
    echo "##############################################################################"
    echo "#                    🚀 KRYONIX ULTRA DEPLOY v3.0                          #"
    echo "#               Sistema Completo com SSL + Auto-Deploy                      #"
    echo "##############################################################################"
    echo -e "${NC}"
    echo -e "${BLUE}🌐 Domínio 1: ${BOLD}$DOMAIN1${NC} ${BLUE}(Site principal + Todos serviços)${NC}"
    echo -e "${BLUE}🌐 Domínio 2: ${BOLD}$DOMAIN2${NC} ${BLUE}(Portainer + Stacks idênticas)${NC}"
    echo -e "${YELLOW}📡 IP do Servidor: ${BOLD}$SERVER_IP${NC}"
    echo -e "${GREEN}🔐 SSL Automático via Let's Encrypt${NC}"
    echo -e "${GREEN}🔄 Auto-Deploy via GitHub Webhook${NC}"
    echo
}

# Verificar root
check_root() {
    [[ $EUID -eq 0 ]] || { 
        echo -e "${RED}❌ Execute como root: sudo bash $0${NC}"
        exit 1
    }
    log "SUCCESS" "Executando como root ✓"
}

# Limpeza TOTAL do servidor
clean_system_completely() {
        log "WARNING" "🧹 LIMPEZA SEGURA DO SERVIDOR (mantendo Ubuntu + SSH)..."

    # Backup das chaves SSH ANTES de qualquer limpeza
    log "INFO" "🔐 Fazendo backup das chaves SSH..."
    mkdir -p /tmp/ssh_backup 2>/dev/null || true
    cp -r /home/ubuntu/.ssh /tmp/ssh_backup/ubuntu_ssh 2>/dev/null || true
    cp -r /root/.ssh /tmp/ssh_backup/root_ssh 2>/dev/null || true
    
    # Parar todos os serviços
    systemctl stop docker 2>/dev/null || true
    systemctl stop nginx 2>/dev/null || true
    systemctl stop apache2 2>/dev/null || true
    
    # Remover Docker e containers
    if command -v docker &> /dev/null; then
        log "INFO" "Removendo Docker e todos os containers..."
        docker system prune -af --volumes 2>/dev/null || true
        apt remove -y docker docker-engine docker.io containerd runc docker-ce docker-ce-cli 2>/dev/null || true
        rm -rf /var/lib/docker /etc/docker 2>/dev/null || true
    fi
    
    # Remover aplicações instaladas
    apt remove -y --purge nginx apache2 mysql-server postgresql redis-server nodejs npm 2>/dev/null || true
    apt autoremove -y --purge 2>/dev/null || true
    
        # Limpar diret��rios (PRESERVANDO SSH backup)
    find /opt -type f -delete 2>/dev/null || true
    find /var/tmp -type f -delete 2>/dev/null || true
    rm -rf /var/www/* /etc/nginx /etc/apache2 2>/dev/null || true

    # Limpar /tmp mas preservar backup SSH
    find /tmp -name "ssh_backup" -prune -o -type f -delete 2>/dev/null || true

        # Limpar arquivos de usuário PRESERVANDO arquivos essenciais
    log "INFO" "🛡️ Preservando arquivos essenciais: .ssh, .bashrc, .profile, .bash_logout, .cache"

    # Backup dos arquivos essenciais do ubuntu
    mkdir -p /tmp/user_backup 2>/dev/null || true
    cp /home/ubuntu/.bashrc /tmp/user_backup/ 2>/dev/null || true
    cp /home/ubuntu/.profile /tmp/user_backup/ 2>/dev/null || true
    cp /home/ubuntu/.bash_logout /tmp/user_backup/ 2>/dev/null || true
    cp -r /home/ubuntu/.cache /tmp/user_backup/ 2>/dev/null || true

    # Remover TODOS os arquivos ocultos EXCETO os que queremos preservar
    find /home/ubuntu -maxdepth 1 -name ".*" \
        -not -name ".ssh" \
        -not -name ".bashrc" \
        -not -name ".profile" \
        -not -name ".bash_logout" \
        -not -name ".cache" \
        -not -name "." \
        -not -name ".." \
        -delete 2>/dev/null || true

    # Remover arquivos não-ocultos que não são essenciais
    find /home/ubuntu -maxdepth 1 -type f -not -name ".*" -delete 2>/dev/null || true
    find /home/ubuntu -maxdepth 1 -type d -not -name ".*" -not -name "ubuntu" -exec rm -rf {} + 2>/dev/null || true

    # Para root, preservar apenas .ssh
    find /root -maxdepth 1 -name ".*" -not -name ".ssh" -not -name "." -not -name ".." -delete 2>/dev/null || true

    # Restaurar chaves SSH se foram removidas
    if [[ ! -d "/home/ubuntu/.ssh" ]] && [[ -d "/tmp/ssh_backup/ubuntu_ssh" ]]; then
        log "INFO" "🔐 Restaurando chaves SSH do ubuntu..."
        cp -r /tmp/ssh_backup/ubuntu_ssh /home/ubuntu/.ssh
        chown -R ubuntu:ubuntu /home/ubuntu/.ssh
        chmod 700 /home/ubuntu/.ssh
        chmod 600 /home/ubuntu/.ssh/* 2>/dev/null || true
    fi

    if [[ ! -d "/root/.ssh" ]] && [[ -d "/tmp/ssh_backup/root_ssh" ]]; then
        log "INFO" "🔐 Restaurando chaves SSH do root..."
        cp -r /tmp/ssh_backup/root_ssh /root/.ssh
        chmod 700 /root/.ssh
        chmod 600 /root/.ssh/* 2>/dev/null || true
    fi
    
    # Limpar cache
    apt clean
    rm -rf /var/cache/apt/archives/* 2>/dev/null || true
    
            # Restaurar arquivos essenciais do ubuntu se necessário
    if [[ -f "/tmp/user_backup/.bashrc" ]]; then
        cp /tmp/user_backup/.bashrc /home/ubuntu/ 2>/dev/null || true
    fi
    if [[ -f "/tmp/user_backup/.profile" ]]; then
        cp /tmp/user_backup/.profile /home/ubuntu/ 2>/dev/null || true
    fi
    if [[ -f "/tmp/user_backup/.bash_logout" ]]; then
        cp /tmp/user_backup/.bash_logout /home/ubuntu/ 2>/dev/null || true
    fi
    if [[ -d "/tmp/user_backup/.cache" ]]; then
        cp -r /tmp/user_backup/.cache /home/ubuntu/ 2>/dev/null || true
    fi

    # Ajustar permissões
    chown -R ubuntu:ubuntu /home/ubuntu/.bashrc /home/ubuntu/.profile /home/ubuntu/.bash_logout /home/ubuntu/.cache 2>/dev/null || true

    # Remover backups temporários
    rm -rf /tmp/ssh_backup /tmp/user_backup 2>/dev/null || true

    log "SUCCESS" "Sistema limpo PRESERVANDO arquivos essenciais (.ssh, .bashrc, .profile, .bash_logout, .cache)!"
}

# Atualizar sistema
update_system() {
    log "INSTALL" "🔄 Atualizando sistema Ubuntu..."
    
    # Configurar timezone
    timedatectl set-timezone America/Sao_Paulo
    
    # Atualizar sistema
    apt update -qq && apt upgrade -y -qq
    
    # Instalar dependências essenciais
    apt install -y -qq \
        curl wget git unzip software-properties-common \
        apt-transport-https ca-certificates gnupg lsb-release \
        htop nano vim ufw fail2ban tree jq \
        python3 python3-pip openssl certbot \
        build-essential 2>/dev/null || true
    
    log "SUCCESS" "Sistema Ubuntu atualizado!"
}

# Instalar Docker
install_docker() {
    log "INSTALL" "🐳 Instalando Docker CE e Docker Compose..."
    
    # Adicionar repositório Docker oficial
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    apt update -qq
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Instalar Docker Compose standalone
    DOCKER_COMPOSE_VERSION="2.23.3"
    curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Configurar Docker
    systemctl start docker
    systemctl enable docker
    
    # Verificar instalação
    docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
    compose_version=$(docker-compose --version | awk '{print $4}' | sed 's/,//')
    
    log "SUCCESS" "Docker $docker_version e Compose $compose_version instalados!"
}

# Instalar Node.js 18 LTS
install_nodejs() {
    log "INSTALL" "📦 Instalando Node.js 18 LTS..."
    
    # Usar NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Instalar PM2 globalmente
    npm install -g pm2
    
    # Verificar instalação
    node_version=$(node --version 2>/dev/null | sed 's/v//')
    npm_version=$(npm --version 2>/dev/null)
    
    log "SUCCESS" "Node.js $node_version e npm $npm_version instalados!"
}

# Configurar firewall
setup_firewall() {
    log "INSTALL" "🔥 Configurando firewall UFW..."
    
    # Reset completo
    ufw --force reset
    
    # Configurações padrão
    ufw default deny incoming
    ufw default allow outgoing
    
    # Portas necessárias
        # Portas essenciais do sistema
    ufw allow 22/tcp comment 'SSH'
    ufw allow ssh
    ufw allow 80/tcp comment 'HTTP'
    ufw allow 443/tcp comment 'HTTPS'

    # Portas dos serviços
    ufw allow 3000/tcp comment 'Frontend'
    ufw allow 3001/tcp comment 'Backend API'
    ufw allow 5432/tcp comment 'PostgreSQL'
    ufw allow 6379/tcp comment 'Redis'
    ufw allow 5678/tcp comment 'N8N'
    ufw allow 8080/tcp comment 'Evolution API & Adminer'
    ufw allow 9000/tcp comment 'MinIO API & Portainer & Webhook'
    ufw allow 9001/tcp comment 'MinIO Console'
    ufw allow 9090/tcp comment 'Prometheus'

    # Docker e comunicação interna
    ufw allow from 172.16.0.0/12 comment 'Docker Networks'
    ufw allow from 10.0.0.0/8 comment 'Private Networks'
    ufw allow from 192.168.0.0/16 comment 'Local Networks'
    
    # Ativar UFW
    ufw --force enable
    
    # Configurar Fail2Ban
    systemctl enable fail2ban
    systemctl start fail2ban
    
        log "SUCCESS" "Firewall configurado com TODAS as portas necessárias!"
}

# Baixar projeto do GitHub
setup_project() {
    log "DEPLOY" "📥 Clonando projeto do GitHub..."
    
    # Criar diretório e clonar
    mkdir -p /opt
    cd /opt
    rm -rf site-jurez-2.0 2>/dev/null || true
    
    # Clonar repositório
    git clone "$GITHUB_REPO" "$PROJECT_DIR" || {
        log "ERROR" "Falha ao clonar repositório: $GITHUB_REPO"
        exit 1
    }
    
    cd "$PROJECT_DIR"
    git checkout "$GITHUB_BRANCH" 2>/dev/null || true
    
    # Configurar git
    git config pull.rebase false
    
    log "SUCCESS" "Projeto clonado com sucesso!"
}

# Criar Dockerfiles otimizados (SEM NGINX - Traefik faz proxy)
create_dockerfiles() {
    log "DEPLOY" "📦 Criando Dockerfiles otimizados..."
    
    # Frontend Dockerfile (SEM NGINX - Traefik faz proxy)
    cat > "$PROJECT_DIR/Dockerfile.frontend" << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app

# Instalar dependências
RUN apk add --no-cache git python3 make g++
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Build da aplicação
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=4096"
ENV CI=false
ENV GENERATE_SOURCEMAP=false
RUN npm run build || npx vite build --outDir dist || mkdir -p dist

# Production stage - Serve direto (sem nginx)
FROM node:18-alpine
WORKDIR /app

# Instalar serve para servir arquivos estáticos
RUN npm install -g serve

# Copiar build
COPY --from=builder /app/dist ./dist

# Expor porta 3000
EXPOSE 3000

# Servir arquivos estáticos com SPA fallback
CMD ["serve", "-s", "dist", "-l", "3000"]
EOF

    # Backend Dockerfile
    cat > "$PROJECT_DIR/Dockerfile.backend" << 'EOF'
FROM node:18-alpine
WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache git python3 make g++ curl

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build do backend se necessário
RUN npm run build:server 2>/dev/null || echo "No backend build needed"

# Gerar Prisma se existir
RUN npm run db:generate 2>/dev/null || npx prisma generate 2>/dev/null || echo "No Prisma found"

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3001
CMD ["npm", "run", "start:server"]
EOF

    log "SUCCESS" "Dockerfiles criados (Frontend sem Nginx - Traefik faz proxy)!"
}

# Criar Docker Compose COMPLETO
create_docker_compose() {
    log "DEPLOY" "🐙 Criando Docker Compose completo..."
    
    cat > "$PROJECT_DIR/docker-compose.yml" << EOF
version: '3.8'

networks:
  traefik:
    external: false
  internal:
    external: false

volumes:
  traefik_data:
  postgres_data:
  redis_data:
  n8n_data:
  minio_data:
  grafana_data:
  prometheus_data:
  portainer_data_siqueira:
  portainer_data_meuboot:
  evolution_data:

services:
  # Traefik - Proxy Reverso com SSL Automático
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    networks:
      - traefik
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_data:/data
    command:
      - --api.dashboard=true
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --providers.docker.network=traefik
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.tlschallenge=true
      - --certificatesresolvers.letsencrypt.acme.email=$ADMIN_EMAIL
      - --certificatesresolvers.letsencrypt.acme.storage=/data/acme.json
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.web.http.redirections.entrypoint.scheme=https
            - --entrypoints.web.http.redirections.entrypoint.permanent=true
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.$DOMAIN1\`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"

  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: postgres
    restart: unless-stopped
    networks:
      - internal
    environment:
      POSTGRES_DB: kryonix
      POSTGRES_USER: kryonix_user
      POSTGRES_PASSWORD: $POSTGRES_PASSWORD
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kryonix_user -d kryonix"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Redis
  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    networks:
      - internal
    command: redis-server --requirepass $REDIS_PASSWORD --appendonly yes
    volumes:
      - redis_data:/data
    labels:
            - "traefik.enable=true"
      - "traefik.http.routers.redis.rule=Host(\`redis.$DOMAIN1\`)"
      - "traefik.http.routers.redis.entrypoints=websecure"
      - "traefik.http.routers.redis.tls.certresolver=letsencrypt"
      - "traefik.http.services.redis.loadbalancer.server.port=6379"

  # Frontend (Site Principal) - SEM NGINX
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: frontend
    restart: unless-stopped
    networks:
      - traefik
      - internal
    depends_on:
      - backend
    labels:
      - "traefik.enable=true"
            # Domínio principal
      - "traefik.http.routers.frontend.rule=Host(\`$DOMAIN1\`) || Host(\`www.$DOMAIN1\`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"

  # Backend API
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: backend
    restart: unless-stopped
    networks:
      - traefik
      - internal
    depends_on:
      - postgres
      - redis
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://kryonix_user:$POSTGRES_PASSWORD@postgres:5432/kryonix
      REDIS_URL: redis://:$REDIS_PASSWORD@redis:6379
            JWT_SECRET: "kryonix-jwt-secret-2024-ultra"
      SMTP_HOST: $SMTP_HOST
      SMTP_PORT: $SMTP_PORT
      SMTP_USER: $SMTP_USER
      SMTP_PASS: $SMTP_PASS
    labels:
      - "traefik.enable=true"
                        - "traefik.http.routers.backend.rule=Host(\`api.$DOMAIN1\`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.backend.loadbalancer.server.port=3001"

  # Portainer Domínio 1 (Siqueira Campos)
  portainer-siqueira:
    image: portainer/portainer-ce:latest
    container_name: portainer-siqueira
    restart: unless-stopped
    networks:
      - traefik
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data_siqueira:/data
    labels:
      - "traefik.enable=true"
                        - "traefik.http.routers.portainer-siqueira.rule=Host(\`portainer.$DOMAIN1\`)"
      - "traefik.http.routers.portainer-siqueira.entrypoints=websecure"
      - "traefik.http.routers.portainer-siqueira.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer-siqueira.loadbalancer.server.port=9000"

  # Portainer Domínio 2 (MeuBoot) - Site Principal
  portainer-meuboot:
    image: portainer/portainer-ce:latest
    container_name: portainer-meuboot
    restart: unless-stopped
    networks:
      - traefik
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data_meuboot:/data
    labels:
      - "traefik.enable=true"
      # Domínio principal
                        - "traefik.http.routers.portainer-main.rule=Host(\`$DOMAIN2\`) || Host(\`www.$DOMAIN2\`)"
      - "traefik.http.routers.portainer-main.entrypoints=websecure"
      - "traefik.http.routers.portainer-main.tls.certresolver=letsencrypt"
      - "traefik.http.routers.portainer-main.service=portainer-meuboot"
      # Subdomínio
                        - "traefik.http.routers.portainer-sub.rule=Host(\`portainer.$DOMAIN2\`)"
      - "traefik.http.routers.portainer-sub.entrypoints=websecure"
      - "traefik.http.routers.portainer-sub.tls.certresolver=letsencrypt"
      - "traefik.http.routers.portainer-sub.service=portainer-meuboot"
      - "traefik.http.services.portainer-meuboot.loadbalancer.server.port=9000"

  # N8N - Automação
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    restart: unless-stopped
    networks:
      - traefik
      - internal
    depends_on:
      - postgres
    environment:
      N8N_BASIC_AUTH_ACTIVE: true
      N8N_BASIC_AUTH_USER: admin
      N8N_BASIC_AUTH_PASSWORD: $N8N_PASSWORD
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: kryonix
      DB_POSTGRESDB_USER: kryonix_user
      DB_POSTGRESDB_PASSWORD: $POSTGRES_PASSWORD
      N8N_HOST: n8n.$DOMAIN1
      N8N_PROTOCOL: https
      NODE_ENV: production
      WEBHOOK_URL: https://n8n.$DOMAIN1
    volumes:
      - n8n_data:/home/node/.n8n
    labels:
      - "traefik.enable=true"
                        - "traefik.http.routers.n8n.rule=Host(\`n8n.$DOMAIN1\`) || Host(\`n8n.$DOMAIN2\`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"

  # Evolution API - WhatsApp
  evolution-api:
    image: davidsongomes/evolution-api:latest
    container_name: evolution-api
    restart: unless-stopped
    networks:
      - traefik
      - internal
    environment:
      AUTHENTICATION_API_KEY: $EVOLUTION_PASSWORD
      AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES: true
      QRCODE_LIMIT: 5
      WEBSOCKET_ENABLED: true
      WEBSOCKET_GLOBAL_EVENTS: false
      CONFIG_SESSION_PHONE_CLIENT: "Evolution API"
      CONFIG_SESSION_PHONE_NAME: "Chrome"
    volumes:
      - evolution_data:/evolution/instances
    labels:
      - "traefik.enable=true"
                        - "traefik.http.routers.evolution.rule=Host(\`evolution.$DOMAIN1\`) || Host(\`evolution.$DOMAIN2\`)"
      - "traefik.http.routers.evolution.entrypoints=websecure"
      - "traefik.http.routers.evolution.tls.certresolver=letsencrypt"
      - "traefik.http.services.evolution.loadbalancer.server.port=8080"

  # MinIO - Storage S3
  minio:
    image: minio/minio:latest
    container_name: minio
    restart: unless-stopped
    networks:
      - traefik
      - internal
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: $MINIO_PASSWORD
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    labels:
      - "traefik.enable=true"
      # Console
                        - "traefik.http.routers.minio-console.rule=Host(\`minio.$DOMAIN1\`) || Host(\`minio.$DOMAIN2\`)"
      - "traefik.http.routers.minio-console.entrypoints=websecure"
      - "traefik.http.routers.minio-console.tls.certresolver=letsencrypt"
      - "traefik.http.routers.minio-console.service=minio-console"
      - "traefik.http.services.minio-console.loadbalancer.server.port=9001"
      # API
                  - "traefik.http.routers.minio-api.rule=Host(\`storage.$DOMAIN1\`) || Host(\`storage.$DOMAIN2\`)"
      - "traefik.http.routers.minio-api.entrypoints=websecure"
      - "traefik.http.routers.minio-api.tls.certresolver=letsencrypt"
      - "traefik.http.routers.minio-api.service=minio-api"
      - "traefik.http.services.minio-api.loadbalancer.server.port=9000"

  # Grafana - Monitoramento
  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    networks:
      - traefik
      - internal
    environment:
      GF_SECURITY_ADMIN_PASSWORD: $GRAFANA_PASSWORD
      GF_SERVER_ROOT_URL: https://grafana.$DOMAIN1
      GF_INSTALL_PLUGINS: grafana-clock-panel,grafana-simple-json-datasource
    volumes:
      - grafana_data:/var/lib/grafana
    labels:
      - "traefik.enable=true"
                  - "traefik.http.routers.grafana.rule=Host(\`grafana.$DOMAIN1\`) || Host(\`grafana.$DOMAIN2\`)"
      - "traefik.http.routers.grafana.entrypoints=websecure"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"
      - "traefik.http.services.grafana.loadbalancer.server.port=3000"

  # Prometheus - Métricas
  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    networks:
      - traefik
      - internal
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
    volumes:
      - prometheus_data:/prometheus
    labels:
      - "traefik.enable=true"
                  - "traefik.http.routers.prometheus.rule=Host(\`prometheus.$DOMAIN1\`) || Host(\`prometheus.$DOMAIN2\`)"
      - "traefik.http.routers.prometheus.entrypoints=websecure"
      - "traefik.http.routers.prometheus.tls.certresolver=letsencrypt"
      - "traefik.http.services.prometheus.loadbalancer.server.port=9090"

  # Adminer - Gerenciamento de DB
  adminer:
    image: adminer:latest
    container_name: adminer
    restart: unless-stopped
    networks:
      - traefik
      - internal
    depends_on:
      - postgres
    environment:
      ADMINER_DEFAULT_SERVER: postgres
    labels:
      - "traefik.enable=true"
                  - "traefik.http.routers.adminer.rule=Host(\`adminer.$DOMAIN1\`) || Host(\`adminer.$DOMAIN2\`)"
      - "traefik.http.routers.adminer.entrypoints=websecure"
      - "traefik.http.routers.adminer.tls.certresolver=letsencrypt"
      - "traefik.http.services.adminer.loadbalancer.server.port=8080"
EOF

    log "SUCCESS" "Docker Compose criado com todos os serviços!"
}

# Configurar webhook GitHub para auto-deploy
setup_auto_deploy() {
    log "DEPLOY" "🔗 Configurando auto-deploy via GitHub webhook..."
    
    # Criar script de auto-deploy
    cat > /usr/local/bin/auto-deploy.sh << 'EOF'
#!/bin/bash
set -euo pipefail

LOG_FILE="/var/log/auto-deploy.log"
PROJECT_DIR="/opt/site-jurez-2.0"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "🚀 Iniciando auto-deploy..."

cd "$PROJECT_DIR"

# Fazer backup da versão atual
log "📦 Fazendo backup..."
cp -r . "/tmp/backup-$(date +%s)" 2>/dev/null || true

# Fazer pull das mudanças
log "📥 Atualizando código..."
git fetch origin
git reset --hard origin/main
git pull origin main

# Rebuildar e reiniciar apenas frontend e backend
log "🔄 Rebuilding aplicação..."
docker-compose up -d --build --no-deps frontend backend

log "✅ Auto-deploy concluído com sucesso!"
EOF

    chmod +x /usr/local/bin/auto-deploy.sh

    # Criar servidor webhook
    cat > /usr/local/bin/webhook-server.py << EOF
#!/usr/bin/env python3
import os
import subprocess
import json
import threading
import time
from http.server import HTTPServer, BaseHTTPRequestHandler

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/webhook':
            try:
                content_length = int(self.headers['Content-Length'])
                payload = self.rfile.read(content_length)
                data = json.loads(payload.decode('utf-8'))
                
                # Verificar se é push para main
                if data.get('ref') in ['refs/heads/main', 'refs/heads/master']:
                    print(f"✅ Webhook recebido: {data.get('head_commit', {}).get('message', 'No message')}")
                    
                    # Executar deploy em thread separada
                    thread = threading.Thread(target=self.execute_deploy)
                    thread.start()
                    
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'OK')
                
            except Exception as e:
                print(f"❌ Erro no webhook: {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(b'Error')
    
    def execute_deploy(self):
        try:
            # Aguardar um pouco para evitar conflitos
            time.sleep(5)
            subprocess.run(['/usr/local/bin/auto-deploy.sh'], check=True)
        except Exception as e:
            print(f"❌ Erro no deploy: {e}")
    
    def log_message(self, format, *args):
        pass

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 9000), WebhookHandler)
    print("🔗 Webhook server rodando na porta 9000...")
    server.serve_forever()
EOF

    chmod +x /usr/local/bin/webhook-server.py

    # Criar serviço systemd
    cat > /etc/systemd/system/github-webhook.service << 'EOF'
[Unit]
Description=GitHub Auto-Deploy Webhook
After=network.target docker.service
Requires=docker.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/site-jurez-2.0
ExecStart=/usr/local/bin/webhook-server.py
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    # Ativar e iniciar serviço
    systemctl daemon-reload
    systemctl enable github-webhook
    systemctl start github-webhook

    log "SUCCESS" "Auto-deploy configurado! Webhook ativo na porta 9000"
}

# Executar deploy completo
run_deployment() {
    log "DEPLOY" "🚀 Iniciando deploy completo..."
    
    cd "$PROJECT_DIR"
    
    # Etapa 1: Infraestrutura
    log "INFO" "Etapa 1: Traefik e bancos de dados..."
    docker-compose up -d traefik postgres redis
    sleep 45
    
    # Etapa 2: Aplicação principal
    log "INFO" "Etapa 2: Frontend e Backend..."
    docker-compose up -d --build frontend backend
    sleep 30
    
    # Etapa 3: Portainers
    log "INFO" "Etapa 3: Portainers dos dois domínios..."
    docker-compose up -d portainer-siqueira portainer-meuboot
    sleep 20
    
    # Etapa 4: Serviços auxiliares
    log "INFO" "Etapa 4: N8N, MinIO, Grafana e demais serviços..."
    docker-compose up -d n8n evolution-api minio grafana prometheus adminer
    sleep 20
    
    log "SUCCESS" "Deploy completo finalizado!"
}

# Verificar status dos serviços
verify_deployment() {
    log "INFO" "🔍 Verificando status dos serviços..."
    
    echo -e "\n${BOLD}📊 STATUS DOS CONTAINERS:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(traefik|postgres|redis|frontend|backend|portainer|n8n|minio|grafana|prometheus|adminer|evolution)"
    
    echo -e "\n${BOLD}🌐 TESTANDO CONECTIVIDADE:${NC}"
    
    # Testar serviços
    services_to_test=(
        "traefik.$DOMAIN1:443"
        "$DOMAIN1:443"
        "portainer.$DOMAIN1:443"
        "n8n.$DOMAIN1:443"
        "minio.$DOMAIN1:443"
    )
    
    for service in "${services_to_test[@]}"; do
        if curl -k -s --connect-timeout 5 "https://$service" > /dev/null; then
            echo -e "✅ https://$service"
        else
            echo -e "❌ https://$service"
        fi
    done
}

# Criar arquivo de credenciais
create_credentials_file() {
    log "INFO" "🔐 Criando arquivo de credenciais..."
    
    cat > /root/KRYONIX_CREDENTIALS.txt << EOF
##############################################################################
#                     🔐 CREDENCIAIS KRYONIX ULTRA v3.0                     #
##############################################################################

🌐 DOMÍNIOS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━��━━━━

📱 Site Principal: https://$DOMAIN1
🏠 Portainer Principal: https://$DOMAIN2

📊 SERVIÇOS - DOMÍNIO 1 ($DOMAIN1):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔀 Traefik Dashboard: https://traefik.$DOMAIN1
📊 Portainer: https://portainer.$DOMAIN1
🤖 N8N: https://n8n.$DOMAIN1
📱 Evolution API: https://evolution.$DOMAIN1
💾 MinIO Console: https://minio.$DOMAIN1
📦 MinIO API: https://storage.$DOMAIN1
📈 Grafana: https://grafana.$DOMAIN1
📊 Prometheus: https://prometheus.$DOMAIN1
🗄️ Adminer: https://adminer.$DOMAIN1

📊 SERVIÇOS - DOMÍNIO 2 ($DOMAIN2):
━━━━━━━━━━━━━━━━━━━━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 Portainer: https://portainer.$DOMAIN2 (mesma stack do domínio 1)
🤖 N8N: https://n8n.$DOMAIN2
📱 Evolution API: https://evolution.$DOMAIN2
💾 MinIO Console: https://minio.$DOMAIN2
📦 MinIO API: https://storage.$DOMAIN2
📈 Grafana: https://grafana.$DOMAIN2
📊 Prometheus: https://prometheus.$DOMAIN2
🗄️ Adminer: https://adminer.$DOMAIN2

🔑 CREDENCIAIS:
━━━━━━━━━━━━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━��━━━━━━━━━━━━━━━━━━━━━
🗄️ PostgreSQL:
   Host: postgres
   Database: kryonix
   User: kryonix_user
   Password: $POSTGRES_PASSWORD

🔴 Redis:
   Host: redis
   Password: $REDIS_PASSWORD

🤖 N8N:
   User: admin
   Password: $N8N_PASSWORD

💾 MinIO:
   User: admin
   Password: $MINIO_PASSWORD

📈 Grafana:
   User: admin
   Password: $GRAFANA_PASSWORD

📱 Evolution API:
   API Key: $EVOLUTION_PASSWORD

📊 Portainer:
   Configure no primeiro acesso

📧 SMTP:
   Host: $SMTP_HOST
   Port: $SMTP_PORT
   User: $SMTP_USER
   Pass: $SMTP_PASS

🔄 AUTO-DEPLOY:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Webhook URL: http://$SERVER_IP:9000/webhook
Qualquer push no GitHub branch 'main' irá fazer deploy automático!

🔐 SSL:
━━━━━━━━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Certificados SSL automáticos via Let's Encrypt
✅ Redirecionamento automático HTTP → HTTPS
✅ Renovação automática dos certificados

📝 LOGS:
━━━━━━━━━━━━━━━━━━━━━━���━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Instalação: tail -f /var/log/kryonix-ultra-install.log
🔄 Auto-Deploy: tail -f /var/log/auto-deploy.log
🐳 Docker: docker-compose logs -f
🔗 Webhook: journalctl -u github-webhook -f

💡 COMANDOS ÚTEIS:
━━━━━━━━━━━━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 Restart: cd /opt/site-jurez-2.0 && docker-compose restart
📊 Status: docker ps
🗑️ Limpar: docker system prune -af
🔗 Webhook: systemctl restart github-webhook

⚠️ CONFIGURAÇÃO DNS NECESSÁRIA:
━━━━━━━━━━━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Configure os seguintes registros DNS para apontar para $SERVER_IP:

$DOMAIN1 → $SERVER_IP
www.$DOMAIN1 → $SERVER_IP
traefik.$DOMAIN1 → $SERVER_IP
portainer.$DOMAIN1 → $SERVER_IP
n8n.$DOMAIN1 → $SERVER_IP
evolution.$DOMAIN1 → $SERVER_IP
minio.$DOMAIN1 → $SERVER_IP
storage.$DOMAIN1 → $SERVER_IP
grafana.$DOMAIN1 → $SERVER_IP
prometheus.$DOMAIN1 → $SERVER_IP
adminer.$DOMAIN1 → $SERVER_IP

$DOMAIN2 → $SERVER_IP
www.$DOMAIN2 → $SERVER_IP
portainer.$DOMAIN2 → $SERVER_IP
n8n.$DOMAIN2 → $SERVER_IP
evolution.$DOMAIN2 → $SERVER_IP
minio.$DOMAIN2 → $SERVER_IP
storage.$DOMAIN2 → $SERVER_IP
grafana.$DOMAIN2 → $SERVER_IP
prometheus.$DOMAIN2 → $SERVER_IP
adminer.$DOMAIN2 → $SERVER_IP

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Arquivo criado em: $(date)
Sistema instalado por: Kryonix Ultra Deploy v3.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━��━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EOF

    chmod 600 /root/KRYONIX_CREDENTIALS.txt
    log "SUCCESS" "Credenciais salvas em /root/KRYONIX_CREDENTIALS.txt"
}

# Mostrar informações finais
show_final_info() {
    clear
    echo -e "${BOLD}${GREEN}"
    echo "##############################################################################"
    echo "#                    🎉 KRYONIX ULTRA DEPLOY CONCLUÍDO! 🎉                  #"
    echo "##############################################################################"
    echo -e "${NC}"
    
    echo -e "${BOLD}${CYAN}🌐 DOMÍNIO PRINCIPAL ($DOMAIN1):${NC}"
    echo -e "${GREEN}📱 Site: https://$DOMAIN1${NC}"
    echo -e "${GREEN}🔧 API: https://api.$DOMAIN1${NC}"
    echo -e "${GREEN}📊 Portainer: https://portainer.$DOMAIN1${NC}"
    echo -e "${GREEN}🤖 N8N: https://n8n.$DOMAIN1${NC}"
    echo -e "${GREEN}💾 MinIO: https://minio.$DOMAIN1${NC}"
    echo -e "${GREEN}📈 Grafana: https://grafana.$DOMAIN1${NC}"
    echo -e "${GREEN}🔀 Traefik: https://traefik.$DOMAIN1${NC}"
    echo
    
    echo -e "${BOLD}${PURPLE}🌐 DOMÍNIO SECUNDÁRIO ($DOMAIN2):${NC}"
    echo -e "${GREEN}🏠 Site: https://$DOMAIN2 (Portainer)${NC}"
    echo -e "${GREEN}📊 Portainer: https://portainer.$DOMAIN2${NC}"
    echo -e "${GREEN}Todos os outros serviços também disponíveis nos subdomínios${NC}"
    echo
    
    echo -e "${BOLD}${YELLOW}🔐 CREDENCIAIS EM:${NC} ${GREEN}/root/KRYONIX_CREDENTIALS.txt${NC}"
    echo
    
    echo -e "${BOLD}${RED}⚠️ IMPORTANTE:${NC}"
    echo -e "${YELLOW}1. Configure os DNS dos domínios para: $SERVER_IP${NC}"
    echo -e "${YELLOW}2. Configure o webhook no GitHub: http://$SERVER_IP:9000/webhook${NC}"
    echo -e "${YELLOW}3. SSL será gerado automaticamente após DNS configurado${NC}"
    echo
    
    echo -e "${BOLD}${BLUE}🔄 AUTO-DEPLOY ATIVO:${NC}"
    echo -e "${GREEN}Qualquer push no GitHub fará deploy automático!${NC}"
    echo
}

# Função principal
main() {
    show_banner
    check_root
    
    log "DEPLOY" "🚀 FASE 1: Limpeza e Preparação"
    clean_system_completely
    update_system
    
    log "DEPLOY" "🚀 FASE 2: Instalações Base"
    install_docker
    install_nodejs
    setup_firewall
    
    log "DEPLOY" "🚀 FASE 3: Configuração do Projeto"
    setup_project
    create_dockerfiles
    create_docker_compose
    
    log "DEPLOY" "🚀 FASE 4: Deploy dos Serviços"
    run_deployment
    
    log "DEPLOY" "🚀 FASE 5: Auto-Deploy"
    setup_auto_deploy
    
    log "DEPLOY" "🚀 FASE 6: Finalização"
    verify_deployment
    create_credentials_file
    
    show_final_info
    
    log "SUCCESS" "🎉 KRYONIX ULTRA DEPLOY FINALIZADO COM SUCESSO!"
}

# Tratamento de erros
trap 'log "ERROR" "Erro na linha $LINENO. Continuando..."; sleep 2' ERR

# Executar
main "$@"
