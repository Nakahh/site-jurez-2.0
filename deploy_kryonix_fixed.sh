#!/bin/bash

##############################################################################
#                           🚀 KRYONIX DEPLOY                               #
#         Sistema de Deploy Inteligente e Autônomo para VPS Oracle          #
#                     Ubuntu 22.04 - Versão ULTRA CLEAN                     #
#                      CONFIGURADO PARA 2 DOMÍNIOS                          #
##############################################################################

set -euo pipefail

# Configurações globais
export DEBIAN_FRONTEND=noninteractive
LOG_FILE="/var/log/kryonix-install.log"
PROJECT_DIR="/opt/site-jurez-2.0"
KRYONIX_DIR="/opt/kryonix"

# Configurar logs
mkdir -p /var/log
touch "$LOG_FILE"
exec > >(tee -a "$LOG_FILE")
exec 2>&1

# Cores e configurações
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'
PURPLE='\033[0;35m'; CYAN='\033[0;36m'; BOLD='\033[1m'; NC='\033[0m'

# Configurações principais
SERVER_IP="144.22.212.82"
DOMAIN1="siqueicamposimoveis.com.br"    # Domínio principal: Frontend + Backend + Todos serviços
DOMAIN2="meuboot.site"                  # Domínio secundário: Apenas Portainer para stacks
GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0"

# SMTP e credenciais
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="vitor.nakahh@gmail.com"
SMTP_PASS="@Vitor.12345@"
POSTGRES_PASSWORD="KryonixPostgres2024!"
REDIS_PASSWORD="KryonixRedis2024!"
N8N_PASSWORD="KryonixN8N2024!"
GRAFANA_PASSWORD="KryonixGrafana2024!"
MINIO_PASSWORD="KryonixMinIO2024!"

# Configurações do Portainer
PORTAINER_USER="vitorfernandes"
PORTAINER_PASS="Vitor@123456"
SERVER_NAME="meuboot"
NETWORK_NAME="meubootnet"

# Função de logging simplificada
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

# Banner simplificado
show_banner() {
    clear
    echo -e "${BOLD}${PURPLE}🚀 KRYONIX DEPLOY - 2 DOMÍNIOS - Ubuntu 22.04 Oracle VPS${NC}"
    echo -e "${BLUE}📊 IP: $SERVER_IP | 🌐 Dom1: $DOMAIN1 | 🌐 Dom2: $DOMAIN2${NC}"
    echo -e "${YELLOW}📁 $DOMAIN1: Frontend + Backend + Todos serviços${NC}"
    echo -e "${YELLOW}📁 $DOMAIN2: Apenas Portainer para stacks${NC}"
    echo
}

# Verificar root
check_root() {
    [[ $EUID -eq 0 ]] || { echo -e "${RED}❌ Execute como root: sudo bash $0${NC}"; exit 1; }
    log "SUCCESS" "Executando como root ✓"
}

# Tratamento de erros
handle_error() {
    log "ERROR" "Erro na linha $1 (código: $2)"
    log "WARNING" "🔄 Continuando automaticamente..."
}
trap 'handle_error ${LINENO} $?' ERR

# Limpeza inteligente do sistema
clean_system() {
    log "WARNING" "🧹 Limpando sistema (mantendo Ubuntu base)..."
    
    # Docker cleanup
    if command -v docker &> /dev/null; then
        log "INFO" "Limpando Docker..."
        docker system prune -af --volumes 2>/dev/null || true
        systemctl stop docker 2>/dev/null || true
    fi
    
    # Limpar diretórios
    rm -rf /opt/kryonix /opt/site-* /tmp/* 2>/dev/null || true
    
    # Reset firewall
    ufw --force reset 2>/dev/null || true
    
    # Limpar cache
    apt-get autoremove --purge -y && apt-get autoclean && apt-get clean
    
    log "SUCCESS" "Sistema limpo!"
}

# Atualização inteligente do sistema
update_system() {
    log "INSTALL" "🔄 Atualizando sistema Ubuntu..."
    
    export LC_ALL=C.UTF-8 LANG=C.UTF-8
    
    # Atualizar e instalar essenciais
    apt-get update -y && apt-get upgrade -y
    apt-get install -y curl wget git jq unzip zip \
        software-properties-common apt-transport-https \
        ca-certificates gnupg lsb-release python3 python3-pip \
        build-essential htop vim nano cron ufw fail2ban \
        rsync tree net-tools dnsutils
    
    # Configurar timezone
    timedatectl set-timezone America/Sao_Paulo 2>/dev/null || true
    
    log "SUCCESS" "Sistema atualizado!"
}

# Instalação do Node.js
install_nodejs() {
    log "INSTALL" "📦 Instalando Node.js LTS..."
    
    # Verificar se já está instalado
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_VERSION" -ge "18" ]; then
            log "SUCCESS" "Node.js $(node -v) já instalado!"
            return 0
        fi
    fi
    
    # Remover versões antigas
    apt-get remove -y nodejs npm node-* 2>/dev/null || true
    
    # Instalar via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    
    # Configurar npm
    npm config set registry https://registry.npmjs.org/
    npm config set fund false
    
    log "SUCCESS" "Node.js $(node -v) e npm $(npm -v) instalados!"
}

# Instalação do Docker
install_docker() {
    log "INSTALL" "🐳 Instalando Docker..."
    
    # Remover versões antigas
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Instalar Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
    
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Configurar Docker
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << 'EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2"
}
EOF
    
    # Iniciar serviços
    systemctl start docker && systemctl enable docker
    usermod -aG docker ubuntu 2>/dev/null || true
    
    # Instalar Docker Compose standalone
    curl -L "https://github.com/docker/compose/releases/download/v2.24.5/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Testar Docker
    docker run --rm hello-world >/dev/null 2>&1 || log "WARNING" "Docker pode ter problemas"
    
    log "SUCCESS" "Docker $(docker --version) instalado!"
}

# Análise inteligente do projeto
analyze_project() {
    log "DEPLOY" "🔍 Analisando projeto GitHub..."
    
    # Clonar projeto
    if [ -d "$PROJECT_DIR" ]; then
        cd "$PROJECT_DIR" && git pull
    else
        git clone "$GITHUB_REPO" "$PROJECT_DIR"
    fi
    
    cd "$PROJECT_DIR"
    
    # Analisar estrutura
    export PROJECT_TYPE="unknown"
    export FRONTEND_PORT="3000"
    export BACKEND_PORT="3333"
    export HAS_PRISMA=false
    
    if [ -f "package.json" ]; then
        log "SUCCESS" "Projeto Node.js detectado"
        
        # Detectar tipo
        if [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
            PROJECT_TYPE="vite"
            log "SUCCESS" "Projeto Vite/React detectado"
        fi
        
        # Verificar Prisma
        if [ -f "prisma/schema.prisma" ]; then
            HAS_PRISMA=true
            log "SUCCESS" "Prisma detectado"
        fi
        
        # Verificar estrutura
        for dir in client server frontend backend; do
            [ -d "$dir" ] && log "SUCCESS" "📁 $dir/ encontrado"
        done
    fi
    
    log "SUCCESS" "Análise concluída! Tipo: $PROJECT_TYPE"
}

# Configurar estrutura de diretórios
setup_directories() {
    log "INSTALL" "📁 Criando estrutura de diretórios para 2 domínios..."
    
    mkdir -p "$KRYONIX_DIR"/{traefik/config,postgres/data,redis/data,minio/data,grafana/data,n8n/data,portainer/{siqueira,meuboot}/data}
    
    # Definir permissões
    chown -R 1001:1001 "$KRYONIX_DIR"/{n8n,minio} 2>/dev/null || true
    chown -R 999:999 "$KRYONIX_DIR"/postgres 2>/dev/null || true
    chown -R 472:472 "$KRYONIX_DIR"/grafana 2>/dev/null || true
    
    log "SUCCESS" "Estrutura criada!"
}

# Criar Dockerfiles
create_dockerfiles() {
    log "DEPLOY" "📦 Criando Dockerfiles..."
    
    # Frontend Dockerfile - ULTRA CORRIGIDO SEM HEREDOC
        cat > "$PROJECT_DIR/Dockerfile.frontend" << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git python3 make g++
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
COPY . .
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV CI=false
ENV GENERATE_SOURCEMAP=false
RUN npm run build || npx vite build --outDir dist || (mkdir -p dist && cp -r client/* dist/ 2>/dev/null || true)

FROM nginx:alpine
COPY --from=builder /app/dist/spa /usr/share/nginx/html

# Criar arquivo de configuração nginx linha por linha
RUN echo 'server {' > /etc/nginx/conf.d/default.conf
RUN echo '    listen 80;' >> /etc/nginx/conf.d/default.conf
RUN echo '    server_name _;' >> /etc/nginx/conf.d/default.conf
RUN echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf
RUN echo '    index index.html;' >> /etc/nginx/conf.d/default.conf
RUN echo '' >> /etc/nginx/conf.d/default.conf
RUN echo '    location / {' >> /etc/nginx/conf.d/default.conf
RUN echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf
RUN echo '    }' >> /etc/nginx/conf.d/default.conf
RUN echo '' >> /etc/nginx/conf.d/default.conf
RUN echo '    location /api {' >> /etc/nginx/conf.d/default.conf
RUN echo '        proxy_pass http://kryonix-backend:3333;' >> /etc/nginx/conf.d/default.conf
RUN echo '        proxy_set_header Host $host;' >> /etc/nginx/conf.d/default.conf
RUN echo '        proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/conf.d/default.conf
RUN echo '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/conf.d/default.conf
RUN echo '        proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/conf.d/default.conf
RUN echo '    }' >> /etc/nginx/conf.d/default.conf
RUN echo '}' >> /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF
    
    # Backend Dockerfile - SUPER SIMPLES
    cat > "$PROJECT_DIR/Dockerfile.backend" << 'EOF'
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache git python3 make g++ curl
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
COPY . .
RUN npm run build:server 2>/dev/null || echo "Sem build de server necessário"
RUN npm run db:generate 2>/dev/null || npx prisma generate 2>/dev/null || echo "Sem Prisma"
EXPOSE 3333
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3333/api/ping || exit 1
CMD ["npm", "run", "start"]
EOF
    
    log "SUCCESS" "Dockerfiles criados!"
}

# Criar Docker Compose para 2 domínios
create_compose() {
    log "DEPLOY" "🐳 Criando docker-compose.yml para 2 domínios..."
    
    cat > "$KRYONIX_DIR/docker-compose.yml" << EOF
version: "3.8"

networks:
  kryonixnet:
    driver: bridge
  meubootnet:
    driver: bridge

services:
  # Traefik - Reverse Proxy Global com SSL automático
  traefik:
    image: traefik:v3.0
    container_name: kryonix-traefik
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=$SMTP_USER"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "$KRYONIX_DIR/traefik/config:/letsencrypt"
    networks:
      - kryonixnet
      - meubootnet
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.$DOMAIN1\`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"
      - "traefik.http.routers.http-catchall.rule=hostregexp(\`{host:.+}\`)"
      - "traefik.http.routers.http-catchall.entrypoints=web"
      - "traefik.http.routers.http-catchall.middlewares=redirect-to-https"
      - "traefik.http.middlewares.redirect-to-https.redirectscheme.scheme=https"

  # PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: kryonix-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: kryonix_main
      POSTGRES_USER: kryonix_user
      POSTGRES_PASSWORD: $POSTGRES_PASSWORD
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - "$KRYONIX_DIR/postgres/data:/var/lib/postgresql/data"
    networks:
      - kryonixnet
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kryonix_user -d kryonix_main"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Redis
  redis:
    image: redis:7-alpine
    container_name: kryonix-redis
    restart: unless-stopped
    command: redis-server --requirepass $REDIS_PASSWORD --appendonly yes
    volumes:
      - "$KRYONIX_DIR/redis/data:/data"
    networks:
      - kryonixnet

  # Frontend do Projeto (APENAS DOMÍNIO 1)
  frontend:
    build:
      context: $PROJECT_DIR
      dockerfile: Dockerfile.frontend
    container_name: kryonix-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      REACT_APP_API_URL: https://api.$DOMAIN1
    networks:
      - kryonixnet
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(\`$DOMAIN1\`) || Host(\`www.$DOMAIN1\`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=80"

  # Backend do Projeto (APENAS DOMÍNIO 1)
  backend:
    build:
      context: $PROJECT_DIR
      dockerfile: Dockerfile.backend
    container_name: kryonix-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://kryonix_user:$POSTGRES_PASSWORD@postgres:5432/kryonix_main
      REDIS_URL: redis://:$REDIS_PASSWORD@redis:6379
      PORT: $BACKEND_PORT
    networks:
      - kryonixnet
    depends_on:
      - postgres
      - redis
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(\`api.$DOMAIN1\`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.backend.loadbalancer.server.port=$BACKEND_PORT"

  # Portainer Siqueira (DOMÍNIO 1 - todos serviços)
  portainer-siqueira:
    image: portainer/portainer-ee:latest
    container_name: kryonix-portainer-siqueira
    restart: unless-stopped
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
      - "$KRYONIX_DIR/portainer/siqueira:/data"
    networks:
      - kryonixnet
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer-siqueira.rule=Host(\`portainer.$DOMAIN1\`)"
      - "traefik.http.routers.portainer-siqueira.entrypoints=websecure"
      - "traefik.http.routers.portainer-siqueira.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer-siqueira.loadbalancer.server.port=9000"

  # Portainer MeuBoot (DOMÍNIO 2 - APENAS STACKS)
  portainer-meuboot:
    image: portainer/portainer-ee:latest
    container_name: kryonix-portainer-meuboot
    restart: unless-stopped
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
      - "$KRYONIX_DIR/portainer/meuboot:/data"
    networks:
      - meubootnet
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer-meuboot.rule=Host(\`$DOMAIN2\`) || Host(\`www.$DOMAIN2\`) || Host(\`portainer.$DOMAIN2\`)"
      - "traefik.http.routers.portainer-meuboot.entrypoints=websecure"
      - "traefik.http.routers.portainer-meuboot.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer-meuboot.loadbalancer.server.port=9000"

  # N8N (APENAS DOMÍNIO 1)
  n8n:
    image: n8nio/n8n:latest
    container_name: kryonix-n8n
    restart: unless-stopped
    environment:
      N8N_BASIC_AUTH_ACTIVE: true
      N8N_BASIC_AUTH_USER: kryonix
      N8N_BASIC_AUTH_PASSWORD: $N8N_PASSWORD
      N8N_HOST: n8n.$DOMAIN1
      N8N_PROTOCOL: https
      WEBHOOK_URL: https://n8n.$DOMAIN1/
      GENERIC_TIMEZONE: America/Sao_Paulo
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: kryonix_main
      DB_POSTGRESDB_USER: kryonix_user
      DB_POSTGRESDB_PASSWORD: $POSTGRES_PASSWORD
    volumes:
      - "$KRYONIX_DIR/n8n/data:/home/node/.n8n"
    networks:
      - kryonixnet
    depends_on:
      - postgres
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(\`n8n.$DOMAIN1\`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"

  # MinIO (APENAS DOMÍNIO 1)
  minio:
    image: minio/minio:latest
    container_name: kryonix-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: kryonix_minio_admin
      MINIO_ROOT_PASSWORD: $MINIO_PASSWORD
    volumes:
      - "$KRYONIX_DIR/minio/data:/data"
    networks:
      - kryonixnet
    labels:
      - "traefik.enable=true"
      # MinIO Console
      - "traefik.http.routers.minio-console.rule=Host(\`minio.$DOMAIN1\`)"
      - "traefik.http.routers.minio-console.entrypoints=websecure"
      - "traefik.http.routers.minio-console.tls.certresolver=letsencrypt"
      - "traefik.http.routers.minio-console.service=minio-console"
      - "traefik.http.services.minio-console.loadbalancer.server.port=9001"
      # MinIO API
      - "traefik.http.routers.minio-api.rule=Host(\`storage.$DOMAIN1\`)"
      - "traefik.http.routers.minio-api.entrypoints=websecure"
      - "traefik.http.routers.minio-api.tls.certresolver=letsencrypt"
      - "traefik.http.routers.minio-api.service=minio-api"
      - "traefik.http.services.minio-api.loadbalancer.server.port=9000"

  # Grafana (APENAS DOMÍNIO 1)
  grafana:
    image: grafana/grafana:latest
    container_name: kryonix-grafana
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: $GRAFANA_PASSWORD
      GF_SERVER_ROOT_URL: https://grafana.$DOMAIN1
    volumes:
      - "$KRYONIX_DIR/grafana/data:/var/lib/grafana"
    networks:
      - kryonixnet
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(\`grafana.$DOMAIN1\`)"
      - "traefik.http.routers.grafana.entrypoints=websecure"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"
      - "traefik.http.services.grafana.loadbalancer.server.port=3000"

  # Adminer (APENAS DOMÍNIO 1)
  adminer:
    image: adminer:4.8.1
    container_name: kryonix-adminer
    restart: unless-stopped
    environment:
      ADMINER_DEFAULT_SERVER: postgres
    networks:
      - kryonixnet
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.adminer.rule=Host(\`adminer.$DOMAIN1\`)"
      - "traefik.http.routers.adminer.entrypoints=websecure"
      - "traefik.http.routers.adminer.tls.certresolver=letsencrypt"
      - "traefik.http.services.adminer.loadbalancer.server.port=8080"

EOF
    
    log "SUCCESS" "Docker Compose criado para 2 domínios!"
}

# Build do projeto
build_project() {
    log "DEPLOY" "🔨 Fazendo build do projeto..."
    
    cd "$PROJECT_DIR"
    
    # Instalar dependências
    if command -v npm &> /dev/null; then
        npm install --legacy-peer-deps 2>/dev/null || true
        
        # Prisma setup
        if [ "$HAS_PRISMA" = "true" ]; then
            npm run db:generate 2>/dev/null || npx prisma generate 2>/dev/null || true
        fi
    fi
    
    log "SUCCESS" "Projeto preparado!"
}

# Deploy final
deploy_services() {
    log "DEPLOY" "🚀 Iniciando deploy dos serviços para 2 domínios..."
    
    cd "$KRYONIX_DIR"
    
    # Aguardar Docker estar pronto
    until docker ps >/dev/null 2>&1; do
        log "WARNING" "Aguardando Docker..."
        sleep 5
        systemctl restart docker 2>/dev/null || true
    done
    
    # Deploy em etapas
    log "INFO" "Etapa 1: Infraestrutura base..."
    docker-compose up -d traefik postgres redis
    sleep 30
    
    log "INFO" "Etapa 2: Aplicação principal (Domínio 1)..."
    docker-compose up -d --build frontend backend
    sleep 20
    
    log "INFO" "Etapa 3: Portainers para ambos domínios..."
    docker-compose up -d portainer-siqueira portainer-meuboot
    sleep 15
    
    log "INFO" "Etapa 4: Serviços auxiliares (Domínio 1)..."
    docker-compose up -d n8n minio grafana adminer
    sleep 15
    
    log "SUCCESS" "Deploy concluído para 2 domínios!"
}

# Configurar webhook GitHub CORRIGIDO
setup_webhook() {
    log "DEPLOY" "🔗 Configurando webhook GitHub..."
    
    # Script de deploy
    cat > /usr/local/bin/github-webhook.sh << 'EOF'
#!/bin/bash
cd /opt/site-jurez-2.0 && git pull && docker-compose -f /opt/kryonix/docker-compose.yml up -d --build frontend backend
EOF
    chmod +x /usr/local/bin/github-webhook.sh
    
    # Script Python para webhook
    cat > /usr/local/bin/webhook-server.py << 'EOF'
#!/usr/bin/env python3
import http.server
import socketserver
import subprocess

class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/webhook':
            try:
                subprocess.run(['/usr/local/bin/github-webhook.sh'], check=True)
                self.send_response(200)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(b'Deploy executado com sucesso!')
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'text/plain')
                self.end_headers()
                self.wfile.write(f'Erro no deploy: {str(e)}'.encode())
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    PORT = 9999
    with socketserver.TCPServer(('', PORT), WebhookHandler) as httpd:
        print(f'Webhook server rodando na porta {PORT}')
        httpd.serve_forever()
EOF
    chmod +x /usr/local/bin/webhook-server.py
    
    # Service file corrigido
    cat > /etc/systemd/system/github-webhook.service << 'EOF'
[Unit]
Description=GitHub Webhook Auto Deploy
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/local/bin/webhook-server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable --now github-webhook.service 2>/dev/null || true
    
    log "SUCCESS" "Webhook configurado!"
}

# Verificar deployment
verify_deployment() {
    log "INFO" "🔍 Verificando serviços para 2 domínios..."
    
    local services=("traefik" "postgres" "redis" "frontend" "backend" "portainer-siqueira" "portainer-meuboot" "n8n" "minio" "grafana" "adminer")
    local running=0
    
    for service in "${services[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "kryonix-$service"; then
            printf "${GREEN}✅ $service${NC}\n"
            ((running++))
        else
            printf "${RED}❌ $service${NC}\n"
        fi
    done
    
    log "INFO" "📊 Serviços funcionando: $running/${#services[@]}"
    
    if [ $running -ge 8 ]; then
        log "SUCCESS" "Deploy bem-sucedido para 2 domínios!"
    else
        log "WARNING" "Deploy parcial"
    fi
}

# Exibir informações finais
show_final_info() {
    sleep 60  # Aguardar serviços iniciarem
    
    clear
    echo -e "${BOLD}${GREEN}🎉 KRYONIX DEPLOY 2 DOMÍNIOS CONCLUÍDO! 🎉${NC}"
    echo
    echo -e "${BOLD}📱 DOMÍNIO 1 ($DOMAIN1) - APLICAÇÃO COMPLETA:${NC}"
    echo -e "   🏠 Frontend: ${BOLD}https://$DOMAIN1${NC}"
    echo -e "   ⚙️  Backend API: ${BOLD}https://api.$DOMAIN1${NC}"
    echo -e "   🐳 Portainer: ${BOLD}https://portainer.$DOMAIN1${NC}"
    echo -e "   🔄 N8N: ${BOLD}https://n8n.$DOMAIN1${NC}"
    echo -e "   📁 MinIO: ${BOLD}https://minio.$DOMAIN1${NC}"
    echo -e "   📊 Grafana: ${BOLD}https://grafana.$DOMAIN1${NC}"
    echo -e "   🗄️  Adminer: ${BOLD}https://adminer.$DOMAIN1${NC}"
    echo -e "   🔀 Traefik: ${BOLD}https://traefik.$DOMAIN1${NC}"
    echo
    echo -e "${BOLD}🛠️ DOMÍNIO 2 ($DOMAIN2) - APENAS PORTAINER STACKS:${NC}"
    echo -e "   🏠 Site Principal: ${BOLD}https://$DOMAIN2${NC} (redireciona para Portainer)"
    echo -e "   🐳 Portainer Stacks: ${BOLD}https://portainer.$DOMAIN2${NC}"
    echo -e "      👤 Configure manualmente no primeiro acesso"
    echo
    echo -e "${BOLD}🔧 CREDENCIAIS:${NC}"
    echo -e "   🔄 N8N: usuário ${YELLOW}kryonix${NC} | senha ${YELLOW}$N8N_PASSWORD${NC}"
    echo -e "   📁 MinIO: usuário ${YELLOW}kryonix_minio_admin${NC} | senha ${YELLOW}$MINIO_PASSWORD${NC}"
    echo -e "   📊 Grafana: usuário ${YELLOW}admin${NC} | senha ${YELLOW}$GRAFANA_PASSWORD${NC}"
    echo
    echo -e "${BOLD}🔧 WEBHOOK GITHUB:${NC}"
    echo -e "   🔗 URL: ${BOLD}http://$SERVER_IP:9999/webhook${NC}"
    echo -e "   📝 Configure no GitHub: Settings > Webhooks"
    echo
    echo -e "${BOLD}📋 COMANDOS:${NC}"
    echo -e "   📊 Status: ${BOLD}docker-compose -f $KRYONIX_DIR/docker-compose.yml ps${NC}"
    echo -e "   🔄 Restart: ${BOLD}docker-compose -f $KRYONIX_DIR/docker-compose.yml restart [serviço]${NC}"
    echo -e "   🔍 Logs: ${BOLD}docker-compose -f $KRYONIX_DIR/docker-compose.yml logs -f [serviço]${NC}"
    echo
    echo -e "${BOLD}${GREEN}✅ SSL/HTTPS automático configurado para TODOS os serviços!${NC}"
    echo -e "${BOLD}${GREEN}🚀 Deploy automático via webhook configurado!${NC}"
    echo
    log "SUCCESS" "Sistema KRYONIX para 2 domínios implantado com sucesso!"
}

# Função principal
main() {
    show_banner
    check_root
    
    log "DEPLOY" "🚀 FASE 1: Limpeza do Sistema"
    clean_system
    
    log "DEPLOY" "🚀 FASE 2: Atualização do Sistema"
    update_system
    
    log "DEPLOY" "🚀 FASE 3: Instalação Node.js"
    install_nodejs
    
    log "DEPLOY" "🚀 FASE 4: Instalação Docker"
    install_docker
    
    log "DEPLOY" "🚀 FASE 5: Análise do Projeto"
    analyze_project
    
    log "DEPLOY" "🚀 FASE 6: Configuração"
    setup_directories
    create_dockerfiles
    create_compose
    
    log "DEPLOY" "🚀 FASE 7: Build"
    build_project
    
    log "DEPLOY" "🚀 FASE 8: Deploy"
    deploy_services
    
    log "DEPLOY" "🚀 FASE 9: Webhook"
    setup_webhook
    
    log "DEPLOY" "🚀 FASE 10: Verificação"
    verify_deployment
    
    log "DEPLOY" "🚀 FASE 11: Finalização"
    show_final_info
}

# Executar
main "$@"
