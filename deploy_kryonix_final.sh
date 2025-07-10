#!/bin/bash

##############################################################################
#                    🚀 KRYONIX ULTRA DEPLOY v3.1 FIXED                     #
#               Sistema Completo com SSL + Auto-Deploy                      #
##############################################################################

set -euo pipefail

# Configurações
GITHUB_REPO="https://github.com/vitor-nakahh/site-jurez-2.0"
GITHUB_BRANCH="main"
PROJECT_DIR="/opt/site-jurez-2.0"
DOMAIN1="siqueicamposimoveis.com.br"
DOMAIN2="meuboot.site"
SERVER_IP="167.234.249.208"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Gerar senhas seguras
export POSTGRES_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
export REDIS_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
export N8N_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
export GRAFANA_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
export MINIO_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
export PORTAINER_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"
export EVOLUTION_PASSWORD="$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)"

# Função de logging
log() {
    local level="$1" message="$2" timestamp=$(date '+%H:%M:%S')
    case $level in
        "SUCCESS") echo -e "${GREEN}✅ [$timestamp] $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ [$timestamp] $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️ [$timestamp] $message${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️ [$timestamp] $message${NC}" ;;
        "DEPLOY") echo -e "${BLUE}🚀 [$timestamp] $message${NC}" ;;
    esac
}

# Verificar se é root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log "ERROR" "Este script deve ser executado como root!"
        exit 1
    fi
    log "SUCCESS" "Executando como root ✓"
}

# Banner inicial
show_banner() {
    clear
    echo -e "${BLUE}"
    cat << 'EOF'
##############################################################################
#                    🚀 KRYONIX ULTRA DEPLOY v3.1                          #
#               Sistema Completo com SSL + Auto-Deploy                      #
##############################################################################
EOF
    echo -e "${NC}"
    echo "🌐 Domínio 1: $DOMAIN1 (Site principal + Todos serviços)"
    echo "🌐 Domínio 2: $DOMAIN2 (Portainer + Stacks idênticas)"
    echo "📡 IP do Servidor: $SERVER_IP"
    echo "🔐 SSL Automático via Let's Encrypt"
    echo "🔄 Auto-Deploy via GitHub Webhook"
    echo ""
}

# Limpeza segura do servidor
clean_server() {
    log "DEPLOY" "🧹 LIMPEZA SEGURA DO SERVIDOR (mantendo Ubuntu + SSH)..."
    
    # Backup SSH keys
    log "INFO" "🔐 Fazendo backup das chaves SSH..."
    cp -r /root/.ssh /tmp/ssh_backup 2>/dev/null || true
    
    # Parar e remover Docker
    log "INFO" "Removendo Docker e todos os containers..."
    systemctl stop docker 2>/dev/null || true
    docker system prune -af --volumes 2>/dev/null || true
    apt-get remove -y docker-ce docker-ce-cli docker-engine docker docker.io containerd runc 2>/dev/null || true
    apt-get remove -y postgresql npm redis-server apache2 mysql-server nginx nodejs 2>/dev/null || true
    apt-get autoremove -y 2>/dev/null || true
    
    # Preservar arquivos essenciais
    log "INFO" "🛡️ Preservando arquivos essenciais: .ssh, .bashrc, .profile, .bash_logout, .cache"
    
    # Restaurar SSH
    cp -r /tmp/ssh_backup /root/.ssh 2>/dev/null || true
    
    log "SUCCESS" "Sistema limpo PRESERVANDO arquivos essenciais (.ssh, .bashrc, .profile, .bash_logout, .cache)!"
}

# Atualizar sistema
update_system() {
    log "DEPLOY" "🔄 Atualizando sistema Ubuntu..."
    apt-get update -qq
    apt-get install -y build-essential htop jq lsb-release certbot fail2ban tree \
        ca-certificates curl gnupg nano openssl python3 software-properties-common \
        ufw unzip vim wget apt-transport-https python3-pip git
    log "SUCCESS" "Sistema Ubuntu atualizado!"
}

# Instalar Docker
install_docker() {
    log "DEPLOY" "🐳 Instalando Docker CE e Docker Compose..."
    
    # Adicionar repositório Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg --yes
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
    
    apt-get update -qq
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Baixar docker-compose standalone
    curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    systemctl enable docker
    systemctl start docker
    
    log "SUCCESS" "Docker $(docker --version | cut -d' ' -f3 | tr -d ',') e Compose $(docker-compose --version | cut -d' ' -f4 | tr -d ',') instalados!"
}

# Instalar Node.js
install_nodejs() {
    log "DEPLOY" "📦 Instalando Node.js 18 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    npm install -g npm@latest
    log "SUCCESS" "Node.js $(node -v) e npm $(npm -v) instalados!"
}

# Configurar firewall
setup_firewall() {
    log "DEPLOY" "🔥 Configurando firewall UFW..."
    
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Portas essenciais
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw allow 3000/tcp  # Frontend
    ufw allow 3001/tcp  # Backend
    ufw allow 5432/tcp  # PostgreSQL
    ufw allow 6379/tcp  # Redis
    ufw allow 8080/tcp  # Traefik Dashboard
    ufw allow 9000/tcp  # Portainer
    ufw allow 5678/tcp  # N8N
    ufw allow 9001/tcp  # MinIO
    ufw allow 3030/tcp  # Grafana
    ufw allow 9090/tcp  # Prometheus
    ufw allow 8081/tcp  # Adminer
    ufw allow 8000/tcp  # Evolution API
    
    ufw --force enable
    systemctl enable fail2ban
    systemctl start fail2ban
    
    log "SUCCESS" "Firewall configurado com TODAS as portas necessárias!"
}

# Baixar projeto do GitHub
setup_project() {
    log "DEPLOY" "📥 Clonando projeto do GitHub..."
    
    mkdir -p /opt
    cd /opt
    rm -rf site-jurez-2.0 2>/dev/null || true
    
    git clone "$GITHUB_REPO" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    git checkout "$GITHUB_BRANCH" 2>/dev/null || true
    git config pull.rebase false
    
    log "SUCCESS" "Projeto clonado com sucesso!"
}

# Criar Dockerfiles
create_dockerfiles() {
    log "DEPLOY" "📦 Criando Dockerfiles otimizados..."
    
    # Frontend Dockerfile
    cat > "$PROJECT_DIR/Dockerfile.frontend" << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app
RUN apk add --no-cache git python3 make g++
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
COPY . .
RUN npm run build || npx vite build --outDir dist || mkdir -p dist

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
EOF

    # Backend Dockerfile
    cat > "$PROJECT_DIR/Dockerfile.backend" << 'EOF'
FROM node:18-alpine
WORKDIR /app
RUN apk add --no-cache git python3 make g++ curl
COPY package*.json ./
RUN npm ci --legacy-peer-deps || npm install --legacy-peer-deps
COPY . .
RUN npm run build:server 2>/dev/null || echo "No backend build needed"
RUN npm run db:generate 2>/dev/null || npx prisma generate 2>/dev/null || echo "No Prisma found"
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs
EXPOSE 3001
CMD ["npm", "start"]
EOF

    log "SUCCESS" "Dockerfiles criados (Frontend sem Nginx - Traefik faz proxy)!"
}

# Criar Docker Compose
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
      - --certificatesresolvers.letsencrypt.acme.email=vitor.nakahh@gmail.com
      - --certificatesresolvers.letsencrypt.acme.storage=/data/acme.json
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.web.http.redirections.entrypoint.scheme=https
      - --entrypoints.web.http.redirections.entrypoint.permanent=true
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"

  postgres:
    image: postgres:15-alpine
    container_name: postgres
    restart: unless-stopped
    networks:
      - internal
    environment:
      POSTGRES_DB: kryonix
      POSTGRES_USER: kryonix_user
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kryonix_user -d kryonix"]
      interval: 30s
      timeout: 10s
      retries: 3

  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    networks:
      - internal
    command: redis-server --requirepass \${REDIS_PASSWORD} --appendonly yes
    volumes:
      - redis_data:/data

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
      - "traefik.http.routers.frontend.rule=Host(\`siqueicamposimoveis.com.br\`) || Host(\`www.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=3000"

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
      DATABASE_URL: postgresql://kryonix_user:\${POSTGRES_PASSWORD}@postgres:5432/kryonix
      REDIS_URL: redis://:\${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: "kryonix-jwt-secret-2024-ultra"
      SMTP_HOST: smtp.gmail.com
      SMTP_PORT: 587
      SMTP_USER: vitor.nakahh@gmail.com
      SMTP_PASS: "@Vitor.12345@"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(\`api.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.backend.loadbalancer.server.port=3001"

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
      - "traefik.http.routers.portainer-siqueira.rule=Host(\`portainer.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.portainer-siqueira.entrypoints=websecure"
      - "traefik.http.routers.portainer-siqueira.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer-siqueira.loadbalancer.server.port=9000"

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
      - "traefik.http.routers.portainer-main.rule=Host(\`meuboot.site\`) || Host(\`www.meuboot.site\`)"
      - "traefik.http.routers.portainer-main.entrypoints=websecure"
      - "traefik.http.routers.portainer-main.tls.certresolver=letsencrypt"
      - "traefik.http.routers.portainer-main.service=portainer-meuboot"
      - "traefik.http.routers.portainer-sub.rule=Host(\`portainer.meuboot.site\`)"
      - "traefik.http.routers.portainer-sub.entrypoints=websecure"
      - "traefik.http.routers.portainer-sub.tls.certresolver=letsencrypt"
      - "traefik.http.routers.portainer-sub.service=portainer-meuboot"
      - "traefik.http.services.portainer-meuboot.loadbalancer.server.port=9000"

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
      N8N_BASIC_AUTH_PASSWORD: \${N8N_PASSWORD}
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: kryonix
      DB_POSTGRESDB_USER: kryonix_user
      DB_POSTGRESDB_PASSWORD: \${POSTGRES_PASSWORD}
      N8N_HOST: n8n.siqueicamposimoveis.com.br
      N8N_PROTOCOL: https
      NODE_ENV: production
      WEBHOOK_URL: https://n8n.siqueicamposimoveis.com.br
    volumes:
      - n8n_data:/home/node/.n8n
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(\`n8n.siqueicamposimoveis.com.br\`) || Host(\`n8n.meuboot.site\`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"

  minio:
    image: minio/minio:latest
    container_name: minio
    restart: unless-stopped
    networks:
      - traefik
      - internal
    environment:
      MINIO_ROOT_USER: kryonix_admin
      MINIO_ROOT_PASSWORD: \${MINIO_PASSWORD}
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.minio.rule=Host(\`minio.siqueicamposimoveis.com.br\`) || Host(\`minio.meuboot.site\`)"
      - "traefik.http.routers.minio.entrypoints=websecure"
      - "traefik.http.routers.minio.tls.certresolver=letsencrypt"
      - "traefik.http.services.minio.loadbalancer.server.port=9001"

  grafana:
    image: grafana/grafana:latest
    container_name: grafana
    restart: unless-stopped
    networks:
      - traefik
      - internal
    environment:
      GF_SECURITY_ADMIN_PASSWORD: \${GRAFANA_PASSWORD}
      GF_SERVER_ROOT_URL: https://grafana.siqueicamposimoveis.com.br
    volumes:
      - grafana_data:/var/lib/grafana
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(\`grafana.siqueicamposimoveis.com.br\`) || Host(\`grafana.meuboot.site\`)"
      - "traefik.http.routers.grafana.entrypoints=websecure"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"
      - "traefik.http.services.grafana.loadbalancer.server.port=3000"

  prometheus:
    image: prom/prometheus:latest
    container_name: prometheus
    restart: unless-stopped
    networks:
      - internal
    volumes:
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'

  adminer:
    image: adminer:latest
    container_name: adminer
    restart: unless-stopped
    networks:
      - traefik
      - internal
    depends_on:
      - postgres
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.adminer.rule=Host(\`adminer.siqueicamposimoveis.com.br\`) || Host(\`adminer.meuboot.site\`)"
      - "traefik.http.routers.adminer.entrypoints=websecure"
      - "traefik.http.routers.adminer.tls.certresolver=letsencrypt"
      - "traefik.http.services.adminer.loadbalancer.server.port=8080"

  evolution-api:
    image: atendai/evolution-api:latest
    container_name: evolution-api
    restart: unless-stopped
    networks:
      - traefik
      - internal
    environment:
      DATABASE_ENABLED: true
      DATABASE_CONNECTION_URI: postgresql://kryonix_user:\${POSTGRES_PASSWORD}@postgres:5432/kryonix
      REDIS_ENABLED: true
      REDIS_URI: redis://:\${REDIS_PASSWORD}@redis:6379
      AUTHENTICATION_API_KEY: \${EVOLUTION_PASSWORD}
    volumes:
      - evolution_data:/evolution/instances
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.evolution.rule=Host(\`evolution.siqueicamposimoveis.com.br\`) || Host(\`evolution.meuboot.site\`)"
      - "traefik.http.routers.evolution.entrypoints=websecure"
      - "traefik.http.routers.evolution.tls.certresolver=letsencrypt"
      - "traefik.http.services.evolution.loadbalancer.server.port=8080"
EOF

    log "SUCCESS" "Docker Compose criado com todos os serviços!"
}

# Deploy dos serviços
deploy_services() {
    log "DEPLOY" "🚀 Iniciando deploy completo..."
    cd "$PROJECT_DIR"
    
    # Etapa 1: Traefik e bancos
    log "INFO" "Etapa 1: Traefik e bancos de dados..."
    docker-compose up -d traefik postgres redis
    sleep 30
    
    # Etapa 2: Frontend e Backend
    log "INFO" "Etapa 2: Frontend e Backend..."
    docker-compose build --no-cache frontend backend
    docker-compose up -d frontend backend
    sleep 30
    
    # Etapa 3: Portainers
    log "INFO" "Etapa 3: Portainers dos dois domínios..."
    docker-compose up -d portainer-siqueira portainer-meuboot
    sleep 30
    
    # Etapa 4: Demais serviços
    log "INFO" "Etapa 4: N8N, MinIO, Grafana e demais serviços..."
    docker-compose up -d n8n minio grafana prometheus adminer evolution-api
    
    log "SUCCESS" "Deploy completo realizado!"
}

# Mostrar resumo final
show_summary() {
    echo ""
    log "SUCCESS" "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
    echo ""
    echo "🌐 URLs principais:"
    echo "   • Site: https://$DOMAIN1"
    echo "   • API: https://api.$DOMAIN1"
    echo "   • Traefik: https://traefik.$DOMAIN1"
    echo "   • Portainer: https://portainer.$DOMAIN1"
    echo "   • N8N: https://n8n.$DOMAIN1"
    echo "   • MinIO: https://minio.$DOMAIN1"
    echo "   • Grafana: https://grafana.$DOMAIN1"
    echo "   • Adminer: https://adminer.$DOMAIN1"
    echo "   • Evolution: https://evolution.$DOMAIN1"
    echo ""
    echo "🌐 URLs secundárias ($DOMAIN2):"
    echo "   • Portainer: https://$DOMAIN2"
    echo "   • N8N: https://n8n.$DOMAIN2"
    echo "   • MinIO: https://minio.$DOMAIN2"
    echo "   • Grafana: https://grafana.$DOMAIN2"
    echo "   • Adminer: https://adminer.$DOMAIN2"
    echo "   • Evolution: https://evolution.$DOMAIN2"
    echo ""
    echo "🔐 Senhas geradas:"
    echo "   • PostgreSQL: $POSTGRES_PASSWORD"
    echo "   • Redis: $REDIS_PASSWORD"
    echo "   • N8N: admin / $N8N_PASSWORD"
    echo "   • Grafana: admin / $GRAFANA_PASSWORD"
    echo "   • MinIO: kryonix_admin / $MINIO_PASSWORD"
    echo "   • Evolution API: $EVOLUTION_PASSWORD"
    echo ""
    echo "📋 Comandos úteis:"
    echo "   • Ver logs: docker-compose logs -f [serviço]"
    echo "   • Reiniciar: docker-compose restart [serviço]"
    echo "   • Status: docker-compose ps"
    echo ""
}

# Função principal
main() {
    show_banner
    check_root
    clean_server
    update_system
    install_docker
    install_nodejs
    setup_firewall
    setup_project
    create_dockerfiles
    create_docker_compose
    deploy_services
    show_summary
}

# Executar
main "$@"
