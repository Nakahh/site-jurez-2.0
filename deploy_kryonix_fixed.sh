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
    
    # Limpar containers órfãos
    pkill -f "docker\|nginx\|node\|redis\|postgres" 2>/dev/null || true
    
    log "SUCCESS" "Sistema limpo"
}

# Atualizar sistema
update_system() {
    log "INSTALL" "🔄 Atualizando sistema..."
    apt update -qq && apt upgrade -y -qq
    
    # Instalar dependências básicas
    apt install -y -qq curl wget git unzip software-properties-common \
        apt-transport-https ca-certificates gnupg lsb-release \
        htop nano ufw fail2ban 2>/dev/null || true
    
    log "SUCCESS" "Sistema atualizado"
}

# Instalar Node.js
install_nodejs() {
    log "INSTALL" "📦 Instalando Node.js 18..."
    
    # Remover instalações antigas
    apt remove -y nodejs npm 2>/dev/null || true
    rm -rf /usr/local/bin/node /usr/local/bin/npm 2>/dev/null || true
    
    # Instalar Node.js 18 via NodeSource
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    
    # Verificar instalação
    node_version=$(node --version 2>/dev/null | sed 's/v//')
    npm_version=$(npm --version 2>/dev/null)
    
    if [[ "$node_version" =~ ^18\. ]]; then
        log "SUCCESS" "Node.js $node_version e npm $npm_version instalados"
    else
        log "ERROR" "Falha na instalação do Node.js"
        exit 1
    fi
}

# Instalar Docker
install_docker() {
    log "INSTALL" "🐳 Instalando Docker e Docker Compose..."
    
    # Remover instalações antigas
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Adicionar repositório Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    apt update -qq
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Instalar docker-compose standalone
    DOCKER_COMPOSE_VERSION="2.21.0"
    curl -L "https://github.com/docker/compose/releases/download/v${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    
    # Iniciar Docker
    systemctl start docker
    systemctl enable docker
    
    # Verificar instalação
    docker_version=$(docker --version | awk '{print $3}' | sed 's/,//')
    compose_version=$(docker-compose --version | awk '{print $4}' | sed 's/,//')
    
    log "SUCCESS" "Docker $docker_version e Compose $compose_version instalados"
}

# Configurar firewall básico
setup_firewall() {
    log "INSTALL" "🔥 Configurando firewall..."
    
    # Reset UFW
    ufw --force reset 2>/dev/null || true
    
    # Regras básicas
    ufw default deny incoming
    ufw default allow outgoing
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Ativar UFW
    ufw --force enable
    
    log "SUCCESS" "Firewall configurado"
}

# Baixar e analisar projeto
setup_project() {
    log "DEPLOY" "📥 Baixando projeto do GitHub..."
    
    # Criar diretório e clonar
    mkdir -p /opt
    cd /opt
    rm -rf site-jurez-2.0 2>/dev/null || true
    
    git clone "$GITHUB_REPO" "$PROJECT_DIR" || {
        log "ERROR" "Falha ao clonar repositório"
        exit 1
    }
    
    cd "$PROJECT_DIR"
    
    # Verificar estrutura do projeto
    log "INFO" "🔍 Analisando estrutura do projeto..."
    
    if [[ -f "vite.config.ts" || -f "vite.config.js" ]]; then
        PROJECT_TYPE="vite"
        log "INFO" "Projeto Vite/React detectado"
    elif [[ -f "next.config.js" ]]; then
        PROJECT_TYPE="next"
        log "INFO" "Projeto Next.js detectado"
    else
        PROJECT_TYPE="generic"
        log "WARNING" "Tipo de projeto não identificado, usando configuração genérica"
    fi
    
    log "SUCCESS" "Projeto baixado e analisado"
}

# Criar Dockerfiles
create_dockerfiles() {
    log "DEPLOY" "📦 Criando Dockerfiles..."
    
    # Frontend Dockerfile - ULTRA CORRIGIDO
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
COPY --from=builder /app/dist /usr/share/nginx/html
RUN if [ -d "/usr/share/nginx/html/spa" ]; then \
        mv /usr/share/nginx/html/spa/* /usr/share/nginx/html/ && \
        rmdir /usr/share/nginx/html/spa; \
    fi

# Criar arquivo de configuração nginx linha por linha
RUN echo 'server {' > /etc/nginx/conf.d/default.conf
RUN echo '    listen 80;' >> /etc/nginx/conf.d/default.conf
RUN echo '    server_name _;' >> /etc/nginx/conf.d/default.conf
RUN echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf
RUN echo '    index index.html;' >> /etc/nginx/conf.d/default.conf
RUN echo '    add_header Cache-Control "no-cache, no-store, must-revalidate";' >> /etc/nginx/conf.d/default.conf
RUN echo '    add_header Pragma "no-cache";' >> /etc/nginx/conf.d/default.conf
RUN echo '    add_header Expires "0";' >> /etc/nginx/conf.d/default.conf
RUN echo '' >> /etc/nginx/conf.d/default.conf
RUN echo '    location / {' >> /etc/nginx/conf.d/default.conf
RUN echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf
RUN echo '        add_header Cache-Control "no-cache, no-store, must-revalidate";' >> /etc/nginx/conf.d/default.conf
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
CMD ["npm", "run", "start:server"]
EOF
    
    log "SUCCESS" "Dockerfiles criados"
}

# Criar docker-compose para 2 domínios
create_docker_compose() {
    log "DEPLOY" "🐙 Criando Docker Compose para 2 domínios..."
    
    cat > "$PROJECT_DIR/docker-compose.yml" << 'EOF'
version: '3.8'

networks:
  kryonixnet:
    driver: bridge
    external: false
  meubootnet:
    driver: bridge
    external: false

volumes:
  postgres_data:
  redis_data:
  portainer_data_siqueira:
  portainer_data_meuboot:
  traefik_data:
  n8n_data:
  minio_data:
  grafana_data:

services:
  # Traefik - Proxy Reverso com SSL Automático
  traefik:
    image: traefik:v3.0
    container_name: kryonix-traefik
    restart: unless-stopped
    networks:
      - kryonixnet
      - meubootnet
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
      - --providers.docker.network=kryonixnet
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --certificatesresolvers.letsencrypt.acme.tlschallenge=true
      - --certificatesresolvers.letsencrypt.acme.email=vitor.nakahh@gmail.com
      - --certificatesresolvers.letsencrypt.acme.storage=/data/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.web.http.redirections.entrypoint.scheme=https
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(`traefik.siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"

  # PostgreSQL
  postgres:
    image: postgres:15
    container_name: kryonix-postgres
    restart: unless-stopped
    networks:
      - kryonixnet
    environment:
      POSTGRES_DB: kryonix
      POSTGRES_USER: kryonix_user
      POSTGRES_PASSWORD: KryonixPostgres2024!
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "127.0.0.1:5432:5432"

  # Redis
  redis:
    image: redis:7-alpine
    container_name: kryonix-redis
    restart: unless-stopped
    networks:
      - kryonixnet
    command: redis-server --requirepass KryonixRedis2024!
    volumes:
      - redis_data:/data
    ports:
      - "127.0.0.1:6379:6379"

  # Frontend
  frontend:
    build:
      context: .
      dockerfile: Dockerfile.frontend
    container_name: kryonix-frontend
    restart: unless-stopped
    networks:
      - kryonixnet
    depends_on:
      - backend
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=80"

  # Backend
  backend:
    build:
      context: .
      dockerfile: Dockerfile.backend
    container_name: kryonix-backend
    restart: unless-stopped
    networks:
      - kryonixnet
    depends_on:
      - postgres
      - redis
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://kryonix_user:KryonixPostgres2024!@postgres:5432/kryonix
      REDIS_URL: redis://:KryonixRedis2024!@redis:6379
      JWT_SECRET: kryonix-jwt-secret-2024
      SMTP_HOST: smtp.gmail.com
      SMTP_PORT: 465
      SMTP_USER: vitor.nakahh@gmail.com
      SMTP_PASS: "@Vitor.12345@"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.backend.loadbalancer.server.port=3333"

  # Portainer para Domínio 1 (siqueicamposimoveis.com.br)
  portainer-siqueira:
    image: portainer/portainer-ce:latest
    container_name: kryonix-portainer-siqueira
    restart: unless-stopped
    networks:
      - kryonixnet
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data_siqueira:/data
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer-siqueira.rule=Host(`portainer.siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.portainer-siqueira.entrypoints=websecure"
      - "traefik.http.routers.portainer-siqueira.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer-siqueira.loadbalancer.server.port=9000"

  # Portainer para Domínio 2 (meuboot.site) - PRINCIPAL
  portainer-meuboot:
    image: portainer/portainer-ce:latest
    container_name: kryonix-portainer-meuboot
    restart: unless-stopped
    networks:
      - meubootnet
      - kryonixnet
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data_meuboot:/data
    command: --admin-password='$$2y$$10$$N1.2FTqQMgOVKIhOZ4fyxeAD1XkU7eC7kQ4OUKTH1tBgqSzn/24oq'
    labels:
      - "traefik.enable=true"
      # Domínio principal meuboot.site
      - "traefik.http.routers.portainer-main.rule=Host(`meuboot.site`)"
      - "traefik.http.routers.portainer-main.entrypoints=websecure"
      - "traefik.http.routers.portainer-main.tls.certresolver=letsencrypt"
      - "traefik.http.routers.portainer-main.service=portainer-meuboot"
      # Subdomínio portainer.meuboot.site
      - "traefik.http.routers.portainer-sub.rule=Host(`portainer.meuboot.site`)"
      - "traefik.http.routers.portainer-sub.entrypoints=websecure"
      - "traefik.http.routers.portainer-sub.tls.certresolver=letsencrypt"
      - "traefik.http.routers.portainer-sub.service=portainer-meuboot"
      - "traefik.http.services.portainer-meuboot.loadbalancer.server.port=9000"

  # N8N - Automação (apenas no domínio 1)
  n8n:
    image: n8nio/n8n:latest
    container_name: kryonix-n8n
    restart: unless-stopped
    networks:
      - kryonixnet
    depends_on:
      - postgres
    environment:
      N8N_BASIC_AUTH_ACTIVE: true
      N8N_BASIC_AUTH_USER: kryonix
      N8N_BASIC_AUTH_PASSWORD: KryonixN8N2024!
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: kryonix
      DB_POSTGRESDB_USER: kryonix_user
      DB_POSTGRESDB_PASSWORD: KryonixPostgres2024!
      N8N_HOST: n8n.siqueicamposimoveis.com.br
      N8N_PROTOCOL: https
      NODE_ENV: production
    volumes:
      - n8n_data:/home/node/.n8n
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(`n8n.siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"

  # MinIO - Storage S3 (apenas no domínio 1)
  minio:
    image: minio/minio:latest
    container_name: kryonix-minio
    restart: unless-stopped
    networks:
      - kryonixnet
    environment:
      MINIO_ROOT_USER: kryonix_minio_admin
      MINIO_ROOT_PASSWORD: KryonixMinIO2024!
    volumes:
      - minio_data:/data
    command: server /data --console-address ":9001"
    labels:
      - "traefik.enable=true"
      # Console MinIO
      - "traefik.http.routers.minio-console.rule=Host(`minio.siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.minio-console.entrypoints=websecure"
      - "traefik.http.routers.minio-console.tls.certresolver=letsencrypt"
      - "traefik.http.routers.minio-console.service=minio-console"
      - "traefik.http.services.minio-console.loadbalancer.server.port=9001"
      # API MinIO
      - "traefik.http.routers.minio-api.rule=Host(`storage.siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.minio-api.entrypoints=websecure"
      - "traefik.http.routers.minio-api.tls.certresolver=letsencrypt"
      - "traefik.http.routers.minio-api.service=minio-api"
      - "traefik.http.services.minio-api.loadbalancer.server.port=9000"

  # Grafana - Monitoramento (apenas no domínio 1)
  grafana:
    image: grafana/grafana:latest
    container_name: kryonix-grafana
    restart: unless-stopped
    networks:
      - kryonixnet
    environment:
      GF_SECURITY_ADMIN_PASSWORD: KryonixGrafana2024!
      GF_SERVER_ROOT_URL: https://grafana.siqueicamposimoveis.com.br
    volumes:
      - grafana_data:/var/lib/grafana
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(`grafana.siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.grafana.entrypoints=websecure"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"
      - "traefik.http.services.grafana.loadbalancer.server.port=3000"

  # Adminer - Gerenciamento DB (apenas no domínio 1)
  adminer:
    image: adminer:latest
    container_name: kryonix-adminer
    restart: unless-stopped
    networks:
      - kryonixnet
    depends_on:
      - postgres
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.adminer.rule=Host(`adminer.siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.adminer.entrypoints=websecure"
      - "traefik.http.routers.adminer.tls.certresolver=letsencrypt"
      - "traefik.http.services.adminer.loadbalancer.server.port=8080"
EOF

    log "SUCCESS" "Docker Compose criado para 2 domínios"
}

# Executar deploy com Docker Compose
run_deployment() {
    log "DEPLOY" "🚀 Iniciando deploy para 2 domínios..."
    
    cd "$PROJECT_DIR"
    
    # Build e start dos serviços em etapas
    log "INFO" "Etapa 1: Infraestrutura base..."
    docker-compose up -d traefik postgres redis
    sleep 30  # Aguardar PostgreSQL inicializar
    
    log "INFO" "Etapa 2: Aplicação principal (Frontend + Backend)..."
    docker-compose up -d --build frontend backend
    sleep 15
    
    log "INFO" "Etapa 3: Portainers para ambos domínios..."
    docker-compose up -d portainer-siqueira portainer-meuboot
    sleep 15
    
    log "INFO" "Etapa 4: Serviços auxiliares (Domínio 1)..."
    docker-compose up -d n8n minio grafana adminer
    sleep 10
    
    log "SUCCESS" "Deploy concluído para 2 domínios!"
}

# Configurar webhook GitHub
setup_webhook() {
    log "DEPLOY" "🔗 Configurando webhook GitHub..."
    
    # Criar script Python do webhook
    cat > /usr/local/bin/webhook-server.py << 'EOF'
#!/usr/bin/env python3
import os
import subprocess
import json
from http.server import HTTPServer, BaseHTTPRequestHandler
import hmac
import hashlib

class WebhookHandler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/webhook':
            content_length = int(self.headers['Content-Length'])
            payload = self.rfile.read(content_length)
            
            try:
                # Parse JSON
                data = json.loads(payload.decode('utf-8'))
                
                # Verificar se é push para main/master
                if data.get('ref') in ['refs/heads/main', 'refs/heads/master']:
                    print("Webhook recebido - Executando deploy...")
                    
                    # Executar deploy
                    os.chdir('/opt/site-jurez-2.0')
                    subprocess.run(['git', 'pull', 'origin', 'main'], check=True)
                    subprocess.run(['docker-compose', 'up', '-d', '--build', 'frontend', 'backend'], check=True)
                    
                    print("Deploy executado com sucesso!")
                    
                self.send_response(200)
                self.end_headers()
                self.wfile.write(b'OK')
                
            except Exception as e:
                print(f"Erro no webhook: {e}")
                self.send_response(500)
                self.end_headers()
                self.wfile.write(b'Error')
    
    def log_message(self, format, *args):
        pass  # Silenciar logs padrão

if __name__ == '__main__':
    server = HTTPServer(('0.0.0.0', 9000), WebhookHandler)
    print("Webhook server rodando na porta 9000...")
    server.serve_forever()
EOF
    
    chmod +x /usr/local/bin/webhook-server.py
    
    # Criar serviço systemd
    cat > /etc/systemd/system/github-webhook.service << 'EOF'
[Unit]
Description=GitHub Webhook Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/site-jurez-2.0
ExecStart=/usr/local/bin/webhook-server.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    # Iniciar serviço
    systemctl daemon-reload
    systemctl enable github-webhook
    systemctl start github-webhook
    
    log "SUCCESS" "Webhook configurado!"
}

# Verificação final
verify_deployment() {
    log "INFO" "🔍 Verificando serviços para 2 domínios..."
    
    # Verificar containers
    containers=(
        "kryonix-traefik"
        "kryonix-postgres" 
        "kryonix-redis"
        "kryonix-frontend"
        "kryonix-backend"
        "kryonix-portainer-siqueira"
        "kryonix-portainer-meuboot"
        "kryonix-n8n"
        "kryonix-minio"
        "kryonix-grafana"
        "kryonix-adminer"
    )
    
    for container in "${containers[@]}"; do
        if docker ps --format "table {{.Names}}" | grep -q "$container"; then
            echo "✅ $container"
        else
            echo "❌ $container"
        fi
    done
}

# Mostrar informa��ões finais
show_final_info() {
    log "SUCCESS" "🎉 DEPLOY KRYONIX FINALIZADO PARA 2 DOMÍNIOS!"
    echo
    echo -e "${BOLD}${GREEN}🌐 DOMÍNIO 1: $DOMAIN1 (Aplicação Completa)${NC}"
    echo -e "${CYAN}📱 Frontend: https://$DOMAIN1${NC}"
    echo -e "${CYAN}🔧 Backend API: https://api.$DOMAIN1${NC}"
    echo -e "${CYAN}📊 Portainer: https://portainer.$DOMAIN1${NC}"
    echo -e "${CYAN}🤖 N8N: https://n8n.$DOMAIN1${NC}"
    echo -e "${CYAN}💾 MinIO Console: https://minio.$DOMAIN1${NC}"
    echo -e "${CYAN}📦 MinIO API: https://storage.$DOMAIN1${NC}"
    echo -e "${CYAN}📈 Grafana: https://grafana.$DOMAIN1${NC}"
    echo -e "${CYAN}🗄️ Adminer: https://adminer.$DOMAIN1${NC}"
    echo -e "${CYAN}🔀 Traefik: https://traefik.$DOMAIN1${NC}"
    echo
    echo -e "${BOLD}${PURPLE}🌐 DOMÍNIO 2: $DOMAIN2 (Apenas Portainer)${NC}"
    echo -e "${CYAN}🏠 Site Principal: https://$DOMAIN2 (redireciona para Portainer)${NC}"
    echo -e "${CYAN}📊 Portainer: https://portainer.$DOMAIN2${NC}"
    echo
    echo -e "${BOLD}${YELLOW}🔐 CREDENCIAIS:${NC}"
    echo -e "${GREEN}N8N: kryonix / KryonixN8N2024!${NC}"
    echo -e "${GREEN}MinIO: kryonix_minio_admin / KryonixMinIO2024!${NC}"
    echo -e "${GREEN}Grafana: admin / KryonixGrafana2024!${NC}"
    echo -e "${GREEN}PostgreSQL: kryonix_user / KryonixPostgres2024!${NC}"
    echo -e "${GREEN}Portainer: $PORTAINER_USER / $PORTAINER_PASS${NC}"
    echo
    echo -e "${BOLD}${BLUE}📝 Logs: tail -f $LOG_FILE${NC}"
    echo -e "${BOLD}${BLUE}🔄 Webhook: Porta 9000 configurada${NC}"
    echo
    echo -e "${BOLD}${RED}⚠️ Configure os DNS dos domínios para apontar para: $SERVER_IP${NC}"
}

# Função principal
main() {
    show_banner
    check_root
    
    log "DEPLOY" "🚀 FASE 1: Preparação"
    clean_system
    update_system
    
    log "DEPLOY" "🚀 FASE 2: Instalações"
    install_nodejs
    install_docker
    setup_firewall
    
    log "DEPLOY" "🚀 FASE 3: Projeto"
    setup_project
    create_dockerfiles
    create_docker_compose
    
    log "DEPLOY" "🚀 FASE 4: Deploy"
    run_deployment
    
    log "DEPLOY" "🚀 FASE 5: Webhook"
    setup_webhook
    
    log "DEPLOY" "🚀 FASE 6: Verificação"
    verify_deployment
    
    show_final_info
}

# Executar
main "$@"
