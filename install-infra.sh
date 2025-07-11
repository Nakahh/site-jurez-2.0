#!/bin/bash

#################################################################
#                    KRYONIX INFRAESTRUTURA                    #
#              Script de Automação Completa                     #
#    Criado pela IA Fusion para implantação autossuficiente    #
#################################################################

set -euo pipefail

# ============== CONFIGURAÇÕES GLOBAIS ==============
SCRIPT_VERSION="2.0.0"
START_TIME=$(date +%s)
LOGFILE="/opt/kryonix-install.log"
COLORS=true
PROGRESS_WIDTH=50

# Domínios
DOMAIN_ADMIN="meuboot.site"
DOMAIN_PUBLIC="siqueicamposimoveis.com.br"

# Repositório do projeto
REPO_URL="https://github.com/Nakahh/site-jurez-2.0.git"
PROJECT_DIR="/opt/siqueicamposimoveis"

# Senhas geradas automaticamente
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
ADMIN_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
WEBHOOK_SECRET=$(openssl rand -hex 32)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-64)

# ============== FUNÇÕES UTILITÁRIAS ==============

# Cores e formatação
if [[ "$COLORS" == "true" ]]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    PURPLE='\033[0;35m'
    CYAN='\033[0;36m'
    WHITE='\033[1;37m'
    NC='\033[0m'
    BOLD='\033[1m'
else
    RED='' GREEN='' YELLOW='' BLUE='' PURPLE='' CYAN='' WHITE='' NC='' BOLD=''
fi

# Função de log
log() {
    local level="$1"
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case "$level" in
        "INFO")  echo -e "${GREEN}[INFO]${NC} $message" | tee -a "$LOGFILE" ;;
        "WARN")  echo -e "${YELLOW}[WARN]${NC} $message" | tee -a "$LOGFILE" ;;
        "ERROR") echo -e "${RED}[ERROR]${NC} $message" | tee -a "$LOGFILE" ;;
        "DEBUG") echo -e "${BLUE}[DEBUG]${NC} $message" | tee -a "$LOGFILE" ;;
        "SUCCESS") echo -e "${GREEN}[SUCCESS]${NC} $message" | tee -a "$LOGFILE" ;;
    esac
    
    echo "[$timestamp][$level] $message" >> "$LOGFILE"
}

# Barra de progresso
progress_bar() {
    local current=$1
    local total=$2
    local message="$3"
    local percent=$((current * 100 / total))
    local filled=$((current * PROGRESS_WIDTH / total))
    local empty=$((PROGRESS_WIDTH - filled))
    
    printf "\r${BLUE}[${NC}"
    printf "%*s" $filled | tr ' ' '█'
    printf "%*s" $empty | tr ' ' '░'
    printf "${BLUE}]${NC} %3d%% ${WHITE}%s${NC}" $percent "$message"
    
    if [[ $current -eq $total ]]; then
        echo ""
    fi
}

# Banner de apresentação
show_banner() {
    clear
    echo -e "${PURPLE}"
    cat << 'EOF'
 ██╗  ██╗██████╗ ██╗   ██╗ ██████╗ ███╗   ██╗██╗██╗  ██╗
 ██║ ██╔╝██╔══██╗╚██╗ ██╔╝██╔═══██╗████╗  ██║██║╚██╗██╔╝
 █████╔╝ ██████╔╝ ╚████╔╝ ██║   ██║██╔██╗ ██║██║ ╚███╔╝ 
 ██╔═██╗ ██╔══██╗  ╚██╔╝  ██║   ██║��█║╚██╗██║██║ ██╔██╗ 
 ██║  ██╗██║  ██║   ██║   ╚██████╔╝██║ ╚████║██║██╔╝ ██╗
 ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝
                                                          
         ██╗███╗   ██╗███████╗██████╗  █████╗             
         ██║████╗  ██║██╔════╝██╔══██╗██╔══██╗            
         ██║██╔██╗ ██║█████╗  ██████╔╝███████║            
         ██║██║╚██╗██║██╔══╝  ██╔══██╗██╔══██║            
         ██║██║ ╚████║██║     ██║  ██║██║  ██║            
         ╚═╝╚═╝  ╚═══╝╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝            
EOF
    echo -e "${NC}"
    echo -e "${WHITE}═════════════════════════════════════════════════════��═════════${NC}"
    echo -e "${CYAN}    INFRAESTRUTURA PROFISSIONAL AUTOMATIZADA v$SCRIPT_VERSION${NC}"
    echo -e "${WHITE}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${GREEN}🔷 Domínio Administrativo:${NC} $DOMAIN_ADMIN"
    echo -e "${GREEN}🔶 Domínio Público:${NC} $DOMAIN_PUBLIC"
    echo -e "${GREEN}🚀 Modo:${NC} Produção Completa"
    echo ""
    sleep 2
}

# Verificação de pré-requisitos
check_requirements() {
    log "INFO" "🔍 Verificando pré-requisitos do sistema..."
    
    # Verificar se é root
    if [[ $EUID -ne 0 ]]; then
        log "ERROR" "Este script deve ser executado como root"
        exit 1
    fi
    
    # Verificar distribuição
    if ! command -v lsb_release &> /dev/null; then
        log "ERROR" "Comando lsb_release não encontrado"
        exit 1
    fi
    
    local distro=$(lsb_release -si)
    local version=$(lsb_release -sr)
    
    if [[ "$distro" != "Ubuntu" ]] || [[ ! "$version" =~ ^24\. ]]; then
        log "ERROR" "Este script é otimizado para Ubuntu 24.04 LTS"
        exit 1
    fi
    
    # Verificar memória
    local memory_gb=$(free -g | awk 'NR==2{print $2}')
    if [[ $memory_gb -lt 20 ]]; then
        log "WARN" "Memória disponível: ${memory_gb}GB (recomendado: 24GB+)"
    fi
    
    # Verificar conectividade
    if ! ping -c 1 google.com &> /dev/null; then
        log "ERROR" "Sem conectividade com a internet"
        exit 1
    fi
    
    log "SUCCESS" "✅ Todos os pré-requisitos atendidos"
}

# Limpeza segura do servidor
cleanup_server() {
    log "INFO" "🧹 Iniciando limpeza segura do servidor..."
    
    # Preservar SSH
    cp -r ~/.ssh /tmp/ssh_backup 2>/dev/null || true
    
    # Parar e remover containers
    if command -v docker &> /dev/null; then
        docker stop $(docker ps -aq) 2>/dev/null || true
        docker rm $(docker ps -aq) 2>/dev/null || true
        docker system prune -af --volumes 2>/dev/null || true
    fi
    
    # Remover arquivos de projetos antigos
    rm -rf /opt/siqueira* /opt/jurez* /opt/site* /opt/kryonix* 2>/dev/null || true
    rm -rf /var/www/html/* 2>/dev/null || true
    
    # Restaurar SSH
    if [[ -d /tmp/ssh_backup ]]; then
        cp -r /tmp/ssh_backup ~/.ssh
        rm -rf /tmp/ssh_backup
    fi
    
    log "SUCCESS" "✅ Limpeza concluída"
}

# Instalação de dependências
install_dependencies() {
    log "INFO" "📦 Instalando dependências do sistema..."
    
    # Atualizar sistema
    export DEBIAN_FRONTEND=noninteractive
    apt-get update -qq
    apt-get upgrade -y -qq
    
    # Instalar pacotes essenciais
    local packages=(
        "curl" "wget" "git" "unzip" "jq" "htop" "tree"
        "docker.io" "docker-compose" "ufw" "fail2ban"
        "nginx" "certbot" "python3-certbot-nginx"
        "postgresql-client" "redis-tools"
        "build-essential" "software-properties-common"
    )
    
    for i in "${!packages[@]}"; do
        local pkg="${packages[$i]}"
        progress_bar $((i+1)) ${#packages[@]} "Instalando $pkg..."
        apt-get install -y -qq "$pkg" >> "$LOGFILE" 2>&1
    done
    
    # Instalar Node.js LTS via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - >> "$LOGFILE" 2>&1
    apt-get install -y nodejs >> "$LOGFILE" 2>&1
    
    # Configurar Docker
    systemctl enable docker
    systemctl start docker
    usermod -aG docker $USER
    
    # Instalar Docker Swarm
    docker swarm init --advertise-addr $(hostname -I | awk '{print $1}') >> "$LOGFILE" 2>&1 || true
    
    # Configurar UFW
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 3000/tcp
    ufw allow 8080/tcp
    ufw allow 9000/tcp
    ufw --force enable
    
    log "SUCCESS" "✅ Dependências instaladas com sucesso"
}

# Criação de diretórios
create_directories() {
    log "INFO" "📁 Criando estrutura de diretórios..."
    
    # Diretórios principais
    mkdir -p /opt/kryonix/{traefik,portainer,databases,backups,logs,scripts}
    mkdir -p /opt/kryonix/stacks/{admin,public}
    mkdir -p /opt/kryonix/ssl
    mkdir -p "$PROJECT_DIR"
    
    # Permissões
    chown -R root:root /opt/kryonix
    chmod -R 755 /opt/kryonix
    
    log "SUCCESS" "✅ Estrutura de diretórios criada"
}

# Clonar e configurar projeto
clone_project() {
    log "INFO" "📥 Clonando projeto do GitHub..."
    
    cd /opt
    if [[ -d "$PROJECT_DIR" ]]; then
        rm -rf "$PROJECT_DIR"
    fi
    
    git clone "$REPO_URL" "$PROJECT_DIR" >> "$LOGFILE" 2>&1
    cd "$PROJECT_DIR"
    
    # Analisar e adaptar o projeto
    log "INFO" "🔍 Analisando estrutura do projeto..."
    
    # Se não existe package.json, criar baseado no projeto atual
    if [[ ! -f "package.json" ]]; then
        log "INFO" "📦 Criando package.json baseado na análise..."
        
        cat > package.json << 'EOF'
{
  "name": "siqueira-campos-imoveis",
  "version": "1.0.0",
  "description": "Sistema imobiliário premium com automação completa",
  "type": "module",
  "scripts": {
    "dev": "concurrently \"npm run dev:client\" \"npm run dev:server\"",
    "dev:client": "vite",
    "dev:server": "tsx watch server/start.ts",
    "build": "vite build",
    "build:server": "tsc --project tsconfig.server.json",
    "start": "npm run build && npm run build:server && node dist/server/start.js",
    "typecheck": "tsc --noEmit",
    "db:migrate": "prisma migrate deploy",
    "db:generate": "prisma generate"
  },
  "dependencies": {
    "@prisma/client": "^5.7.1",
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/node": "^20.10.5",
    "@vitejs/plugin-react": "^4.2.0",
    "prisma": "^5.7.1",
    "typescript": "^5.3.3",
    "vite": "^5.0.10",
    "tsx": "^4.6.2",
    "concurrently": "^8.2.2"
  }
}
EOF
    fi
    
    log "SUCCESS" "✅ Projeto configurado"
}

# Configurar Traefik
setup_traefik() {
    log "INFO" "🌐 Configurando Traefik Proxy..."
    
    # Criar configuração do Traefik
    cat > /opt/kryonix/traefik/traefik.yml << EOF
global:
  checkNewVersion: false
  sendAnonymousUsage: false

api:
  dashboard: true
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
      email: admin@$DOMAIN_ADMIN
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik
  file:
    filename: /dynamic.yml
    watch: true

log:
  level: INFO
  filePath: "/logs/traefik.log"

accessLog:
  filePath: "/logs/access.log"

metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
EOF

    # Configuração dinâmica
    cat > /opt/kryonix/traefik/dynamic.yml << EOF
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
    
    rate-limit:
      rateLimit:
        burst: 100
        average: 50
        
    auth-admin:
      basicAuth:
        users:
          - "admin:\$2y\$10\$encrypted_password_here"

tls:
  options:
    default:
      minVersion: "VersionTLS12"
      cipherSuites:
        - "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"
        - "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305"
        - "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"
EOF

    # Docker Compose para Traefik
    cat > /opt/kryonix/traefik/docker-compose.yml << EOF
version: "3.8"

networks:
  traefik:
    external: true

services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    networks:
      - traefik
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml:ro
      - ./dynamic.yml:/dynamic.yml:ro
      - ./letsencrypt:/letsencrypt
      - ./logs:/logs
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.$DOMAIN_ADMIN\`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"
      - "traefik.http.routers.traefik.middlewares=auth-admin,security-headers"
    environment:
      - TRAEFIK_LOG_LEVEL=INFO
EOF

    # Criar rede Traefik
    docker network create traefik 2>/dev/null || true
    
    # Iniciar Traefik
    cd /opt/kryonix/traefik
    docker-compose up -d
    
    log "SUCCESS" "✅ Traefik configurado e rodando"
}

# Stack administrativa (meuboot.site)
setup_admin_stack() {
    log "INFO" "🔷 Configurando stack administrativa ($DOMAIN_ADMIN)..."
    
    cat > /opt/kryonix/stacks/admin/docker-compose.yml << EOF
version: "3.8"

networks:
  traefik:
    external: true
  admin_internal:
    driver: bridge

volumes:
  portainer_data:
  postgres_data:
  minio_data:
  grafana_data:
  n8n_data:

services:
  # Portainer - Gerenciamento de Containers
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer_admin
    restart: unless-stopped
    networks:
      - traefik
      - admin_internal
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=Host(\`$DOMAIN_ADMIN\`)"
      - "traefik.http.routers.portainer.entrypoints=websecure"
      - "traefik.http.routers.portainer.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer.loadbalancer.server.port=9000"

  # PostgreSQL - Banco Principal
  postgres:
    image: postgres:16-alpine
    container_name: postgres_admin
    restart: unless-stopped
    networks:
      - admin_internal
    environment:
      POSTGRES_DB: kryonix_admin
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: $DB_PASSWORD
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U admin -d kryonix_admin"]
      interval: 10s
      timeout: 5s
      retries: 5

  # N8N - Automação de Workflows
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n_admin
    restart: unless-stopped
    networks:
      - traefik
      - admin_internal
    environment:
      N8N_BASIC_AUTH_ACTIVE: true
      N8N_BASIC_AUTH_USER: admin
      N8N_BASIC_AUTH_PASSWORD: $ADMIN_PASSWORD
      N8N_HOST: n8n.$DOMAIN_ADMIN
      N8N_PROTOCOL: https
      N8N_PORT: 5678
      WEBHOOK_URL: https://n8n.$DOMAIN_ADMIN
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8n
      DB_POSTGRESDB_USER: admin
      DB_POSTGRESDB_PASSWORD: $DB_PASSWORD
    volumes:
      - n8n_data:/home/node/.n8n
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(\`n8n.$DOMAIN_ADMIN\`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"
    depends_on:
      postgres:
        condition: service_healthy

  # MinIO - Storage de Arquivos
  minio:
    image: minio/minio:latest
    container_name: minio_admin
    restart: unless-stopped
    networks:
      - traefik
      - admin_internal
    environment:
      MINIO_ROOT_USER: admin
      MINIO_ROOT_PASSWORD: $ADMIN_PASSWORD
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.minio.rule=Host(\`minio.$DOMAIN_ADMIN\`)"
      - "traefik.http.routers.minio.entrypoints=websecure"
      - "traefik.http.routers.minio.tls.certresolver=letsencrypt"
      - "traefik.http.services.minio.loadbalancer.server.port=9001"

  # Grafana - Monitoramento e Dashboards
  grafana:
    image: grafana/grafana:latest
    container_name: grafana_admin
    restart: unless-stopped
    networks:
      - traefik
      - admin_internal
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: $ADMIN_PASSWORD
      GF_SERVER_DOMAIN: grafana.$DOMAIN_ADMIN
      GF_SERVER_ROOT_URL: https://grafana.$DOMAIN_ADMIN
    volumes:
      - grafana_data:/var/lib/grafana
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(\`grafana.$DOMAIN_ADMIN\`)"
      - "traefik.http.routers.grafana.entrypoints=websecure"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"
      - "traefik.http.services.grafana.loadbalancer.server.port=3000"

  # Adminer - Interface de Banco de Dados
  adminer:
    image: adminer:latest
    container_name: adminer_admin
    restart: unless-stopped
    networks:
      - traefik
      - admin_internal
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.adminer.rule=Host(\`adminer.$DOMAIN_ADMIN\`)"
      - "traefik.http.routers.adminer.entrypoints=websecure"
      - "traefik.http.routers.adminer.tls.certresolver=letsencrypt"
      - "traefik.http.services.adminer.loadbalancer.server.port=8080"

  # Webhook Listener
  webhook:
    image: adnanh/webhook:latest
    container_name: webhook_admin
    restart: unless-stopped
    networks:
      - traefik
    volumes:
      - /opt/kryonix/scripts:/scripts:ro
    command: ["-verbose", "-hooks=/scripts/hooks.json", "-hotreload"]
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.webhook.rule=Host(\`webhook.$DOMAIN_ADMIN\`)"
      - "traefik.http.routers.webhook.entrypoints=websecure"
      - "traefik.http.routers.webhook.tls.certresolver=letsencrypt"
      - "traefik.http.services.webhook.loadbalancer.server.port=9000"
EOF

    # Iniciar stack administrativa
    cd /opt/kryonix/stacks/admin
    docker-compose up -d
    
    log "SUCCESS" "✅ Stack administrativa configurada"
}

# Stack pública (siqueicamposimoveis.com.br)
setup_public_stack() {
    log "INFO" "🔶 Configurando stack pública ($DOMAIN_PUBLIC)..."
    
    # Criar Dockerfile para a aplicação
    cat > "$PROJECT_DIR/Dockerfile" << 'EOF'
# Multi-stage build para otimização
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./
COPY tsconfig*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Build da aplicação
RUN npm run build
RUN npm run build:server

# Imagem de produção
FROM node:18-alpine AS production

WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar build
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/prisma ./prisma

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3001

CMD ["node", "dist/server/start.js"]
EOF

    # Docker Compose para aplicação pública
    cat > /opt/kryonix/stacks/public/docker-compose.yml << EOF
version: "3.8"

networks:
  traefik:
    external: true
  public_internal:
    driver: bridge

volumes:
  postgres_public_data:
  redis_data:

services:
  # PostgreSQL - Banco da Aplicação
  postgres:
    image: postgres:16-alpine
    container_name: postgres_public
    restart: unless-stopped
    networks:
      - public_internal
    environment:
      POSTGRES_DB: siqueicampos_db
      POSTGRES_USER: app_user
      POSTGRES_PASSWORD: $DB_PASSWORD
    volumes:
      - postgres_public_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app_user -d siqueicampos_db"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Redis - Cache e Sessões
  redis:
    image: redis:7-alpine
    container_name: redis_public
    restart: unless-stopped
    networks:
      - public_internal
    volumes:
      - redis_data:/data
    command: redis-server --appendonly yes --requirepass $DB_PASSWORD

  # Aplicação Principal
  app:
    build:
      context: $PROJECT_DIR
      dockerfile: Dockerfile
    container_name: app_public
    restart: unless-stopped
    networks:
      - traefik
      - public_internal
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://app_user:$DB_PASSWORD@postgres:5432/siqueicampos_db
      REDIS_URL: redis://:$DB_PASSWORD@redis:6379
      JWT_SECRET: $JWT_SECRET
      ADMIN_PORT: 3001
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app-api.rule=Host(\`api.$DOMAIN_PUBLIC\`)"
      - "traefik.http.routers.app-api.entrypoints=websecure"
      - "traefik.http.routers.app-api.tls.certresolver=letsencrypt"
      - "traefik.http.services.app-api.loadbalancer.server.port=3001"
    depends_on:
      postgres:
        condition: service_healthy

  # Frontend (Nginx serving built React app)
  frontend:
    image: nginx:alpine
    container_name: frontend_public
    restart: unless-stopped
    networks:
      - traefik
    volumes:
      - $PROJECT_DIR/dist:/usr/share/nginx/html:ro
      - /opt/kryonix/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(\`$DOMAIN_PUBLIC\`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=80"

  # Portainer para esta stack
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer_public
    restart: unless-stopped
    networks:
      - traefik
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer-public.rule=Host(\`portainer.$DOMAIN_PUBLIC\`)"
      - "traefik.http.routers.portainer-public.entrypoints=websecure"
      - "traefik.http.routers.portainer-public.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer-public.loadbalancer.server.port=9000"
EOF

    # Configuração do Nginx
    mkdir -p /opt/kryonix/nginx
    cat > /opt/kryonix/nginx/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;
        
        # Security headers
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-XSS-Protection "1; mode=block" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header Referrer-Policy "no-referrer-when-downgrade" always;
        add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
        
        # SPA routing
        location / {
            try_files $uri $uri/ /index.html;
        }
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

    # Configurar variáveis de ambiente
    cat > "$PROJECT_DIR/.env" << EOF
NODE_ENV=production
DATABASE_URL=postgresql://app_user:$DB_PASSWORD@postgres:5432/siqueicampos_db
REDIS_URL=redis://:$DB_PASSWORD@redis:6379
JWT_SECRET=$JWT_SECRET
ADMIN_PORT=3001
WEBHOOK_SECRET=$WEBHOOK_SECRET
EOF

    # Build e start da aplicação
    cd "$PROJECT_DIR"
    npm install
    npm run build
    
    cd /opt/kryonix/stacks/public
    docker-compose up -d --build
    
    log "SUCCESS" "✅ Stack pública configurada"
}

# Configurar webhook para deploy automático
setup_webhook() {
    log "INFO" "🔗 Configurando webhook para deploy automático..."
    
    # Script de deploy
    cat > /opt/kryonix/scripts/deploy.sh << EOF
#!/bin/bash

LOGFILE="/opt/kryonix/logs/deploy.log"
PROJECT_DIR="$PROJECT_DIR"

log() {
    echo "\$(date '+%Y-%m-%d %H:%M:%S') - \$1" | tee -a "\$LOGFILE"
}

log "🚀 Iniciando deploy automático..."

cd "\$PROJECT_DIR"

# Pull das alterações
git pull origin main >> "\$LOGFILE" 2>&1

# Install/update dependencies
npm install >> "\$LOGFILE" 2>&1

# Build da aplicação
npm run build >> "\$LOGFILE" 2>&1

# Restart dos containers
cd /opt/kryonix/stacks/public
docker-compose up -d --build >> "\$LOGFILE" 2>&1

log "✅ Deploy concluído com sucesso"
EOF

    chmod +x /opt/kryonix/scripts/deploy.sh

    # Configuração do webhook
    cat > /opt/kryonix/scripts/hooks.json << EOF
[
  {
    "id": "deploy-public",
    "execute-command": "/opt/kryonix/scripts/deploy.sh",
    "command-working-directory": "/opt/kryonix/scripts",
    "response-message": "Deploy iniciado com sucesso",
    "response-headers": {
      "Content-Type": "application/json"
    },
    "trigger-rule": {
      "and": [
        {
          "match": {
            "type": "payload-hash-sha256",
            "secret": "$WEBHOOK_SECRET",
            "parameter": {
              "source": "header",
              "name": "X-Hub-Signature-256"
            }
          }
        },
        {
          "match": {
            "type": "value",
            "value": "refs/heads/main",
            "parameter": {
              "source": "payload",
              "name": "ref"
            }
          }
        }
      ]
    }
  }
]
EOF

    log "SUCCESS" "✅ Webhook configurado"
}

# Sistema de monitoramento
setup_monitoring() {
    log "INFO" "📊 Configurando sistema de monitoramento..."
    
    # Script de watchdog
    cat > /opt/kryonix/scripts/watchdog.sh << 'EOF'
#!/bin/bash

LOGFILE="/opt/kryonix/logs/watchdog.log"
ALERT_WEBHOOK_URL=""  # Configure webhook para alertas

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOGFILE"
}

check_service() {
    local service_name="$1"
    local service_url="$2"
    
    if curl -f -s -o /dev/null "$service_url"; then
        log "✅ $service_name está funcionando"
        return 0
    else
        log "❌ $service_name falhou - tentando reiniciar..."
        docker restart "$service_name" 2>/dev/null || true
        return 1
    fi
}

# Verificar serviços principais
check_service "traefik" "http://localhost:8080/api/rawdata"
check_service "app_public" "http://localhost:3001/api/ping"

# Verificar SSL
openssl s_client -connect siqueicamposimoveis.com.br:443 -servername siqueicamposimoveis.com.br </dev/null 2>/dev/null | grep -q "Verify return code: 0" && log "✅ SSL válido" || log "❌ Problema no SSL"

# Verificar espaço em disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 85 ]; then
    log "⚠️ Espaço em disco baixo: ${DISK_USAGE}%"
fi

# Verificar memória
MEM_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEM_USAGE" -gt 90 ]; then
    log "⚠️ Memória alta: ${MEM_USAGE}%"
fi
EOF

    chmod +x /opt/kryonix/scripts/watchdog.sh

    # Crontab para monitoramento
    (crontab -l 2>/dev/null; echo "*/5 * * * * /opt/kryonix/scripts/watchdog.sh") | crontab -

    log "SUCCESS" "✅ Sistema de monitoramento ativo"
}

# Testes finais
run_tests() {
    log "INFO" "🧪 Executando testes de validação..."
    
    local tests_passed=0
    local tests_total=10
    
    # Teste 1: Traefik
    if curl -f -s -o /dev/null "https://traefik.$DOMAIN_ADMIN"; then
        ((tests_passed++))
        log "SUCCESS" "✅ Traefik Dashboard acessível"
    else
        log "ERROR" "❌ Traefik Dashboard inacessível"
    fi
    
    # Teste 2: Portainer Admin
    if curl -f -s -o /dev/null "https://$DOMAIN_ADMIN"; then
        ((tests_passed++))
        log "SUCCESS" "✅ Portainer Admin acessível"
    else
        log "ERROR" "❌ Portainer Admin inacessível"
    fi
    
    # Teste 3: N8N
    if curl -f -s -o /dev/null "https://n8n.$DOMAIN_ADMIN"; then
        ((tests_passed++))
        log "SUCCESS" "✅ N8N acessível"
    else
        log "ERROR" "❌ N8N inacessível"
    fi
    
    # Teste 4: API Pública
    if curl -f -s -o /dev/null "https://api.$DOMAIN_PUBLIC/api/ping"; then
        ((tests_passed++))
        log "SUCCESS" "✅ API Pública funcionando"
    else
        log "ERROR" "❌ API Pública com problemas"
    fi
    
    # Teste 5: Frontend Público
    if curl -f -s -o /dev/null "https://$DOMAIN_PUBLIC"; then
        ((tests_passed++))
        log "SUCCESS" "✅ Frontend Público acessível"
    else
        log "ERROR" "❌ Frontend Público inacessível"
    fi
    
    # Teste 6-10: SSL de todos os domínios
    local ssl_domains=("$DOMAIN_ADMIN" "traefik.$DOMAIN_ADMIN" "n8n.$DOMAIN_ADMIN" "$DOMAIN_PUBLIC" "api.$DOMAIN_PUBLIC")
    
    for domain in "${ssl_domains[@]}"; do
        if openssl s_client -connect "$domain:443" -servername "$domain" </dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
            ((tests_passed++))
            log "SUCCESS" "✅ SSL válido para $domain"
        else
            log "ERROR" "❌ SSL inválido para $domain"
        fi
    done
    
    log "INFO" "📊 Testes concluídos: $tests_passed/$tests_total"
    
    if [[ $tests_passed -eq $tests_total ]]; then
        log "SUCCESS" "🎉 Todos os testes passaram!"
        return 0
    else
        log "WARN" "⚠️ Alguns testes falharam - verificar logs"
        return 1
    fi
}

# Relatório final
generate_report() {
    local end_time=$(date +%s)
    local duration=$((end_time - START_TIME))
    local duration_min=$((duration / 60))
    
    cat > /opt/kryonix/deploy-summary.txt << EOF
╔════════════════════════════════════════════════════════════════╗
║                    KRYONIX INFRAESTRUTURA                      ║
║                     RELATÓRIO DE DEPLOY                        ║
╠════════════════════════════════════════════════════════════════╣
║ Versão do Script: $SCRIPT_VERSION                                      ║
║ Data/Hora: $(date '+%Y-%m-%d %H:%M:%S')                         ║
║ Duração: ${duration_min} minutos                               ║
╠════════════════════════════════════════════════════════════════╣
║                        🔷 DOMÍNIO ADMINISTRATIVO               ║
╠════════════════════════════════════════════════════════════════╣
║ Portainer:        https://$DOMAIN_ADMIN                        ║
║ Traefik:          https://traefik.$DOMAIN_ADMIN                ║
║ N8N:              https://n8n.$DOMAIN_ADMIN                    ║
║ MinIO:            https://minio.$DOMAIN_ADMIN                  ║
║ Grafana:          https://grafana.$DOMAIN_ADMIN                ║
║ Adminer:          https://adminer.$DOMAIN_ADMIN                ║
║ Webhook:          https://webhook.$DOMAIN_ADMIN                ║
╠════════════════════════════════════════════════════════════════╣
║                        🔶 DOMÍNIO PÚBLICO                     ║
╠════════════════════════════════════════════════════════════════╣
║ Website:          https://$DOMAIN_PUBLIC                       ║
║ API:              https://api.$DOMAIN_PUBLIC                   ║
║ Portainer:        https://portainer.$DOMAIN_PUBLIC             ║
╠════════════════════════════════════════════════════════════════╣
║                        🔐 CREDENCIAIS                         ║
╠════════════════════════════════════════════════════════════════╣
║ Usuário Admin:    admin                                        ║
║ Senha Admin:      $ADMIN_PASSWORD                              ║
║ Senha DB:         $DB_PASSWORD                                 ║
║ JWT Secret:       $JWT_SECRET                                  ║
║ Webhook Secret:   $WEBHOOK_SECRET                              ║
╠════════════════════════════════════════════════════════════════╣
║                        📊 STATUS DOS SERVIÇOS                 ║
╠════════════════════════════════════════════════════════════════╣
EOF

    # Verificar status dos containers
    echo "║ Containers ativos:" >> /opt/kryonix/deploy-summary.txt
    docker ps --format "table {{.Names}}\t{{.Status}}" | tail -n +2 | while read line; do
        echo "║ - $line" >> /opt/kryonix/deploy-summary.txt
    done
    
    cat >> /opt/kryonix/deploy-summary.txt << EOF
╠════════════════════════════════════════════════════════════════╣
║                        🔧 COMANDOS ÚTEIS                      ║
╠════════════��═══════════════════════════════════════════════════╣
║ Ver logs:         docker logs [container_name]                 ║
║ Restart stack:    cd /opt/kryonix/stacks/[admin|public] &&     ║
║                   docker-compose restart                       ║
║ Monitor:          /opt/kryonix/scripts/watchdog.sh            ║
║ Deploy manual:    /opt/kryonix/scripts/deploy.sh              ║
╠════════════════════════════════════════════════════════════════╣
║                        📁 ARQUIVOS IMPORTANTES                ║
╠════════════════════════════════════════════════════════════════╣
║ Logs:             /opt/kryonix/logs/                          ║
║ Configs:          /opt/kryonix/                               ║
║ Projeto:          $PROJECT_DIR                                ║
║ Este relatório:   /opt/kryonix/deploy-summary.txt            ║
╚════════════════════════════════════════════════════════════════╝

🎉 INFRAESTRUTURA KRYONIX INSTALADA COM SUCESSO! 🎉

Para configurar o webhook no GitHub:
1. Vá até Settings > Webhooks
2. URL: https://webhook.$DOMAIN_ADMIN/hooks/deploy-public
3. Content-Type: application/json
4. Secret: $WEBHOOK_SECRET
5. Eventos: Just the push event

EOF

    # Mostrar relatório na tela
    cat /opt/kryonix/deploy-summary.txt
    
    log "SUCCESS" "📋 Relatório gerado em /opt/kryonix/deploy-summary.txt"
}

# ============== EXECUÇÃO PRINCIPAL ==============

main() {
    # Criar log
    mkdir -p "$(dirname "$LOGFILE")"
    touch "$LOGFILE"
    
    show_banner
    
    log "INFO" "🚀 Iniciando instalação da infraestrutura KRYONIX..."
    
    # Execução sequencial com progress
    local steps=(
        "check_requirements:Verificando pré-requisitos"
        "cleanup_server:Limpando servidor"
        "install_dependencies:Instalando dependências"
        "create_directories:Criando diretórios"
        "clone_project:Clonando projeto"
        "setup_traefik:Configurando Traefik"
        "setup_admin_stack:Configurando stack administrativa"
        "setup_public_stack:Configurando stack pública"
        "setup_webhook:Configurando webhook"
        "setup_monitoring:Configurando monitoramento"
        "run_tests:Executando testes"
        "generate_report:Gerando relatório"
    )
    
    for i in "${!steps[@]}"; do
        local step="${steps[$i]}"
        local func="${step%%:*}"
        local desc="${step##*:}"
        
        progress_bar $i ${#steps[@]} "$desc..."
        
        if ! $func; then
            log "ERROR" "Falha na etapa: $desc"
            exit 1
        fi
        
        progress_bar $((i+1)) ${#steps[@]} "$desc completo"
    done
    
    # Banner de sucesso
    echo ""
    echo -e "${GREEN}"
    cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║  🎉 INFRAESTRUTURA KRYONIX INSTALADA COM SUCESSO! 🎉         ║
╚═══════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    log "SUCCESS" "🏁 Instalação concluída com sucesso!"
    log "INFO" "📋 Verifique o relatório em /opt/kryonix/deploy-summary.txt"
    log "INFO" "🔗 Configure o webhook no GitHub conforme instruções"
    log "INFO" "📊 Monitor automático ativo a cada 5 minutos"
    
    echo ""
    echo -e "${CYAN}🌐 Acesse seus serviços:${NC}"
    echo -e "${WHITE}   Admin: https://$DOMAIN_ADMIN${NC}"
    echo -e "${WHITE}   Site:  https://$DOMAIN_PUBLIC${NC}"
    echo ""
}

# ============== TRATAMENTO DE ERROS ==============

trap 'log "ERROR" "Script interrompido na linha $LINENO"' ERR
trap 'log "INFO" "Script finalizado"' EXIT

# ============== INICIAR EXECUÇÃO ==============

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
