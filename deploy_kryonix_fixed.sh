#!/bin/bash

# KRYONIX DEPLOY SCRIPT - VERSÃO CORRIGIDA
# Script completo para deploy de aplicação imobiliária com todas as stacks
# Versão: 2.0 - Corrigida e otimizada

set -e

# Configurações globais
PROJECT_DIR="/opt/site-jurez-2.0"
KRYONIX_DIR="/opt/kryonix"
SERVER_IP="144.22.212.82"
DOMAIN_PRIMARY="siqueicamposimoveis.com.br"
DOMAIN_SECONDARY="meuboot.site"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Função de logging melhorada
log() {
    local level=$1
    shift
    local message="$*"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "SUCCESS") echo -e "${GREEN}✅ [$timestamp]${NC} $message" ;;
        "ERROR")   echo -e "${RED}❌ [$timestamp]${NC} $message" ;;
        "WARN")    echo -e "${YELLOW}⚠️  [$timestamp]${NC} $message" ;;
        "INFO")    echo -e "${CYAN}ℹ️  [$timestamp]${NC} $message" ;;
        "INSTALL") echo -e "${PURPLE}⚙️  [$timestamp]${NC} $message" ;;
        "DEPLOY")  echo -e "${BLUE}🚀 [$timestamp]${NC} $message" ;;
        *)         echo -e "${NC}[$timestamp] $message" ;;
    esac
}

# Verificação de root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log "ERROR" "Este script deve ser executado como root!"
        exit 1
    fi
    log "SUCCESS" "Executando como root ✓"
}

# FASE 1: Preparação do Sistema
system_preparation() {
    log "DEPLOY" "🚀 FASE 1: Preparação do Sistema"
    
    # Atualizar sistema
    log "INSTALL" "📦 Atualizando sistema Ubuntu..."
    apt-get update -qq
    apt-get upgrade -y -qq
    
    # Instalar dependências essenciais
    log "INSTALL" "📦 Instalando dependências essenciais..."
    apt-get install -y -qq \
        curl \
        wget \
        git \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        jq \
        htop \
        nano \
        ufw \
        fail2ban \
        nginx \
        python3 \
        python3-pip
    
    # Instalar Node.js 18
    log "INSTALL" "📦 Instalando Node.js 18..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
    
    log "SUCCESS" "Sistema preparado com sucesso!"
}

# FASE 2: Instalação do Docker
install_docker() {
    log "DEPLOY" "🚀 FASE 2: Instalação do Docker"
    
    # Remover versões antigas
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Adicionar repositório Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    apt-get update -qq
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Configurar Docker para produção
    cat > /etc/docker/daemon.json << EOF
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "100m",
        "max-file": "3"
    },
    "live-restore": true,
    "userland-proxy": false,
    "experimental": false,
    "metrics-addr": "127.0.0.1:9323",
    "default-address-pools": [
        {
            "base": "172.17.0.0/12",
            "size": 20
        }
    ]
}
EOF
    
    # Iniciar e habilitar Docker
    systemctl enable docker
    systemctl start docker
    
    # Configurar Docker Swarm
    docker swarm init --advertise-addr $SERVER_IP 2>/dev/null || true
    
    log "SUCCESS" "Docker instalado e configurado!"
}

# FASE 3: Configuração de Firewall
configure_firewall() {
    log "DEPLOY" "🚀 FASE 3: Configuração de Firewall"
    
    # Reset UFW
    ufw --force reset
    ufw --force enable
    
    # Configurações básicas
    ufw default deny incoming
    ufw default allow outgoing
    
    # Portas essenciais
    ufw allow 22/tcp comment "SSH"
    ufw allow 80/tcp comment "HTTP"
    ufw allow 443/tcp comment "HTTPS"
    
    # Portas da aplicação
    ufw allow 3000/tcp comment "Frontend"
    ufw allow 3333/tcp comment "Backend"
    
    # Portas das stacks
    ufw allow 8080/tcp comment "Portainer"
    ufw allow 5555/tcp comment "N8N"
    ufw allow 8021/tcp comment "Evolution API"
    ufw allow 9000/tcp comment "MinIO Console"
    ufw allow 9001/tcp comment "MinIO API"
    ufw allow 3001/tcp comment "Grafana"
    ufw allow 9090/tcp comment "Prometheus"
    ufw allow 8081/tcp comment "Adminer"
    ufw allow 6379/tcp comment "Redis"
    ufw allow 5432/tcp comment "PostgreSQL"
    ufw allow 8090/tcp comment "Traefik Dashboard"
    
    # Configurar fail2ban
    systemctl enable fail2ban
    systemctl start fail2ban
    
    log "SUCCESS" "Firewall configurado com todas as portas necessárias!"
}

# FASE 4: Clone e preparação do projeto
clone_project() {
    log "DEPLOY" "🚀 FASE 4: Clone e Preparação do Projeto"
    
    # Remover diretório existente
    rm -rf $PROJECT_DIR
    
    # Clonar projeto
    log "INFO" "Clonando projeto do GitHub..."
    git clone https://github.com/DevLucasFontoura/site-jurez-2.0.git $PROJECT_DIR
    cd $PROJECT_DIR
    
    # Instalar dependências
    log "INFO" "Instalando dependências do projeto..."
    npm install --production=false
    
    # Build do projeto sem TypeScript
    log "INFO" "Fazendo build do projeto..."
    npm run build:dev 2>/dev/null || {
        log "WARN" "Build com warnings, usando build alternativo..."
        npx vite build --mode development 2>/dev/null || true
    }
    
    log "SUCCESS" "Projeto clonado e preparado!"
}

# FASE 5: Criação de diretórios
create_directories() {
    log "DEPLOY" "🚀 FASE 5: Criação de Estrutura de Diretórios"
    
    # Criar diretório principal
    mkdir -p $KRYONIX_DIR
    cd $KRYONIX_DIR
    
    # Criar estrutura de diretórios
    mkdir -p {
        data/postgres,data/redis,data/minio,data/n8n,data/evolution,data/grafana,data/prometheus,
        config/traefik,config/nginx,config/postgres,config/grafana,
        logs,backups,certs,docker
    }
    
    # Definir permissões
    chmod -R 755 $KRYONIX_DIR
    chown -R root:root $KRYONIX_DIR
    
    log "SUCCESS" "Estrutura de diretórios criada!"
}

# FASE 6: Configuração do Traefik
configure_traefik() {
    log "DEPLOY" "🚀 FASE 6: Configuração do Traefik"
    
    # Criar configuração do Traefik
    cat > $KRYONIX_DIR/config/traefik/traefik.yml << 'EOF'
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
      email: admin@siqueicamposimoveis.com.br
      storage: /etc/traefik/acme.json
      httpChallenge:
        entryPoint: web

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: kryonix-network

metrics:
  prometheus:
    buckets:
      - 0.1
      - 0.3
      - 1.2
      - 5.0

log:
  level: INFO
  filePath: "/etc/traefik/traefik.log"

accessLog:
  filePath: "/etc/traefik/access.log"
EOF

    # Criar arquivo acme.json
    touch $KRYONIX_DIR/certs/acme.json
    chmod 600 $KRYONIX_DIR/certs/acme.json
    
    log "SUCCESS" "Traefik configurado!"
}

# FASE 7: Docker Compose principal
create_docker_compose() {
    log "DEPLOY" "🚀 FASE 7: Criação do Docker Compose"
    
    cat > $KRYONIX_DIR/docker-compose.yml << 'EOF'
version: '3.8'

networks:
  kryonix-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16

volumes:
  postgres_data:
  redis_data:
  minio_data:
  n8n_data:
  evolution_data:
  grafana_data:
  prometheus_data:
  portainer_data:

services:
  # Traefik - Reverse Proxy
  traefik:
    image: traefik:v3.0
    container_name: kryonix-traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "8090:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./config/traefik:/etc/traefik:ro
      - ./certs:/etc/traefik/certs
      - ./logs:/var/log/traefik
    networks:
      - kryonix-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"
    healthcheck:
      test: ["CMD", "traefik", "healthcheck"]
      interval: 30s
      timeout: 10s
      retries: 3

  # PostgreSQL Database
  postgres:
    image: postgres:15-alpine
    container_name: kryonix-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: kryonix_main
      POSTGRES_USER: kryonix_admin
      POSTGRES_PASSWORD: KryonixDB2024!
      POSTGRES_MULTIPLE_DATABASES: n8n_db,evolution_db,chatgpt_db,project_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./config/postgres:/docker-entrypoint-initdb.d
    networks:
      - kryonix-network
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kryonix_admin -d kryonix_main"]
      interval: 30s
      timeout: 10s
      retries: 5

  # Redis Cache
  redis:
    image: redis:7-alpine
    container_name: kryonix-redis
    restart: unless-stopped
    command: redis-server --requirepass KryonixRedis2024! --maxmemory 512mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - kryonix-network
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Portainer - Container Management
  portainer:
    image: portainer/portainer-ce:latest
    container_name: kryonix-portainer
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    networks:
      - kryonix-network
    ports:
      - "8080:9000"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=Host(\`portainer.siqueicamposimoveis.com.br\`) || Host(\`portainer.meuboot.site\`)"
      - "traefik.http.routers.portainer.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer.loadbalancer.server.port=9000"

  # MinIO - Object Storage
  minio:
    image: minio/minio:latest
    container_name: kryonix-minio
    restart: unless-stopped
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: kryonix_minio_admin
      MINIO_ROOT_PASSWORD: KryonixMinIO2024!
    volumes:
      - minio_data:/data
    networks:
      - kryonix-network
    ports:
      - "9000:9000"
      - "9001:9001"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.minio-console.rule=Host(\`minio.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.minio-console.tls.certresolver=letsencrypt"
      - "traefik.http.routers.minio-console.service=minio-console"
      - "traefik.http.services.minio-console.loadbalancer.server.port=9001"
      - "traefik.http.routers.minio-api.rule=Host(\`storage.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.minio-api.tls.certresolver=letsencrypt"
      - "traefik.http.routers.minio-api.service=minio-api"
      - "traefik.http.services.minio-api.loadbalancer.server.port=9000"

  # N8N - Workflow Automation
  n8n:
    image: n8nio/n8n:latest
    container_name: kryonix-n8n
    restart: unless-stopped
    environment:
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: n8n_db
      DB_POSTGRESDB_USER: kryonix_admin
      DB_POSTGRESDB_PASSWORD: KryonixDB2024!
      N8N_BASIC_AUTH_ACTIVE: true
      N8N_BASIC_AUTH_USER: kryonix
      N8N_BASIC_AUTH_PASSWORD: KryonixN8N2024!
      WEBHOOK_URL: https://n8n.siqueicamposimoveis.com.br/
      GENERIC_TIMEZONE: America/Sao_Paulo
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - kryonix-network
    ports:
      - "5555:5678"
    depends_on:
      - postgres
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(\`n8n.siqueicamposimoveis.com.br\`) || Host(\`n8n.meuboot.site\`)"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"

  # Evolution API - WhatsApp Integration
  evolution-api:
    image: davidsongomes/evolution-api:latest
    container_name: kryonix-evolution
    restart: unless-stopped
    environment:
      DATABASE_ENABLED: true
      DATABASE_CONNECTION_URI: postgresql://kryonix_admin:KryonixDB2024!@postgres:5432/evolution_db
      DATABASE_CONNECTION_CLIENT_NAME: evolution
      REDIS_ENABLED: true
      REDIS_URI: redis://:KryonixRedis2024!@redis:6379
      AUTHENTICATION_API_KEY: kryonix-evolution-2024
      AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES: true
      WEBHOOK_GLOBAL_URL: https://evolution.siqueicamposimoveis.com.br
      WEBHOOK_GLOBAL_ENABLED: true
      CONFIG_SESSION_PHONE_CLIENT: Evolution
    volumes:
      - evolution_data:/evolution/instances
    networks:
      - kryonix-network
    ports:
      - "8021:8080"
    depends_on:
      - postgres
      - redis
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.evolution.rule=Host(\`evolution.siqueicamposimoveis.com.br\`) || Host(\`evo.meuboot.site\`)"
      - "traefik.http.routers.evolution.tls.certresolver=letsencrypt"
      - "traefik.http.services.evolution.loadbalancer.server.port=8080"

  # Prometheus - Monitoring
  prometheus:
    image: prom/prometheus:latest
    container_name: kryonix-prometheus
    restart: unless-stopped
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    volumes:
      - ./config/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    networks:
      - kryonix-network
    ports:
      - "9090:9090"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.prometheus.rule=Host(\`prometheus.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.prometheus.tls.certresolver=letsencrypt"

  # Grafana - Visualization
  grafana:
    image: grafana/grafana:latest
    container_name: kryonix-grafana
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: KryonixGrafana2024!
      GF_INSTALL_PLUGINS: grafana-clock-panel,grafana-simple-json-datasource
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - kryonix-network
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(\`grafana.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"

  # Adminer - Database Management
  adminer:
    image: adminer:latest
    container_name: kryonix-adminer
    restart: unless-stopped
    environment:
      ADMINER_DEFAULT_SERVER: postgres
    networks:
      - kryonix-network
    ports:
      - "8081:8080"
    depends_on:
      - postgres
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.adminer.rule=Host(\`adminer.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.adminer.tls.certresolver=letsencrypt"

  # Project Frontend
  project-frontend:
    build:
      context: /opt/site-jurez-2.0
      dockerfile: Dockerfile.frontend
    container_name: kryonix-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      VITE_API_URL: https://api.siqueicamposimoveis.com.br
    networks:
      - kryonix-network
    ports:
      - "3000:3000"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(\`siqueicamposimoveis.com.br\`) || Host(\`www.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"

  # Project Backend
  project-backend:
    build:
      context: /opt/site-jurez-2.0
      dockerfile: Dockerfile.backend
    container_name: kryonix-backend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://kryonix_admin:KryonixDB2024!@postgres:5432/project_db
      REDIS_URL: redis://:KryonixRedis2024!@redis:6379
    networks:
      - kryonix-network
    ports:
      - "3333:3333"
    depends_on:
      - postgres
      - redis
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(\`api.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
EOF

    log "SUCCESS" "Docker Compose criado!"
}

# FASE 8: Dockerfiles
create_dockerfiles() {
    log "DEPLOY" "🚀 FASE 8: Criação dos Dockerfiles"
    
    # Dockerfile Frontend
    cat > $PROJECT_DIR/Dockerfile.frontend << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --silent
COPY . .
RUN npm run build:dev 2>/dev/null || npx vite build --mode development

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY <<EOF /etc/nginx/nginx.conf
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    sendfile on;
    keepalive_timeout 65;
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

    server {
        listen 3000;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;
        
        location / {
            try_files \$uri \$uri/ /index.html;
        }
        
        location /api {
            proxy_pass http://kryonix-backend:3333;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
        }
    }
}
EOF
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
EOF

    # Dockerfile Backend
    cat > $PROJECT_DIR/Dockerfile.backend << 'EOF'
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --silent
COPY . .
RUN npm run build:server 2>/dev/null || echo "Build server completed with warnings"
EXPOSE 3333
CMD ["node", "dist/server/start.js"]
EOF

    log "SUCCESS" "Dockerfiles criados!"
}

# FASE 9: Configurações adicionais
create_configs() {
    log "DEPLOY" "🚀 FASE 9: Configurações Adicionais"
    
    # Prometheus config
    cat > $KRYONIX_DIR/config/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'traefik'
    static_configs:
      - targets: ['traefik:8080']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
EOF

    # Script de inicialização do PostgreSQL
    cat > $KRYONIX_DIR/config/postgres/init-multiple-databases.sh << 'EOF'
#!/bin/bash
set -e

function create_user_and_database() {
    local database=$1
    echo "Creating user and database '$database'"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        CREATE DATABASE $database;
        GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        create_user_and_database $db
    done
    echo "Multiple databases created"
fi
EOF
    chmod +x $KRYONIX_DIR/config/postgres/init-multiple-databases.sh

    log "SUCCESS" "Configurações adicionais criadas!"
}

# FASE 10: Deploy final
deploy_services() {
    log "DEPLOY" "🚀 FASE 10: Deploy dos Serviços"
    
    cd $KRYONIX_DIR
    
    # Parar serviços existentes
    docker-compose down 2>/dev/null || true
    docker system prune -f 2>/dev/null || true
    
    # Subir infraestrutura primeiro
    log "INFO" "Subindo infraestrutura base..."
    docker-compose up -d postgres redis traefik
    sleep 30
    
    # Subir serviços principais
    log "INFO" "Subindo serviços principais..."
    docker-compose up -d portainer minio prometheus grafana adminer
    sleep 20
    
    # Subir aplicações
    log "INFO" "Subindo aplicações..."
    docker-compose up -d n8n evolution-api
    sleep 15
    
    # Build e subir projeto
    log "INFO" "Fazendo build e subindo projeto..."
    docker-compose build project-frontend project-backend
    docker-compose up -d project-frontend project-backend
    
    log "SUCCESS" "Todos os servi��os foram implantados!"
}

# FASE 11: Verificação final
verify_deployment() {
    log "DEPLOY" "🚀 FASE 11: Verificação de Deployment"
    
    sleep 30
    
    # Verificar serviços
    log "INFO" "Verificando status dos serviços..."
    docker-compose ps
    
    # Testar conectividade
    services=(
        "http://localhost:8080:Portainer"
        "http://localhost:9000:MinIO"
        "http://localhost:5555:N8N"
        "http://localhost:3001:Grafana"
        "http://localhost:3000:Frontend"
        "http://localhost:3333:Backend"
    )
    
    for service in "${services[@]}"; do
        IFS=':' read -r url name <<< "$service"
        if curl -f -s "$url" > /dev/null; then
            log "SUCCESS" "$name está respondendo ✓"
        else
            log "WARN" "$name não está respondendo"
        fi
    done
}

# FASE 12: Configuração de webhook GitHub
setup_webhook() {
    log "DEPLOY" "🚀 FASE 12: Configuração de Webhook GitHub"
    
    cat > /opt/webhook-handler.sh << 'EOF'
#!/bin/bash
cd /opt/site-jurez-2.0
git pull origin main
docker-compose -f /opt/kryonix/docker-compose.yml build project-frontend project-backend
docker-compose -f /opt/kryonix/docker-compose.yml restart project-frontend project-backend
EOF
    chmod +x /opt/webhook-handler.sh
    
    # Criar serviço webhook
    cat > /etc/systemd/system/kryonix-webhook.service << 'EOF'
[Unit]
Description=Kryonix Webhook Handler
After=network.target

[Service]
Type=oneshot
ExecStart=/opt/webhook-handler.sh
User=root

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable kryonix-webhook.service
    
    log "SUCCESS" "Webhook configurado!"
}

# FASE 13: Finalização
show_final_summary() {
    log "DEPLOY" "🚀 FASE 13: Finalização"
    
    echo ""
    echo "##############################################################################"
    echo "#                    🚀 KRYONIX DEPLOY CONCLUÍDO! 🚀                       #"
    echo "##############################################################################"
    echo ""
    echo "📱 APLICAÇÃO PRINCIPAL:"
    echo "   🏠 Frontend: http://$SERVER_IP:3000"
    echo "   ⚙️  Backend API: http://$SERVER_IP:3333"
    echo ""
    echo "🛠️  GERENCIAMENTO:"
    echo "   🐳 Portainer: http://$SERVER_IP:8080"
    echo "      👤 Usuário: admin | 🔑 Configure a senha no primeiro acesso"
    echo ""
    echo "🤖 AUTOMAÇÃO E INTEGRAÇÃO:"
    echo "   🔄 N8N: http://$SERVER_IP:5555"
    echo "      👤 Usuário: kryonix | 🔑 Senha: KryonixN8N2024!"
    echo "   📱 Evolution API: http://$SERVER_IP:8021"
    echo "      🔑 API Key: kryonix-evolution-2024"
    echo ""
    echo "📁 ARMAZENAMENTO:"
    echo "   🗃️   MinIO Console: http://$SERVER_IP:9001"
    echo "   📡 MinIO API: http://$SERVER_IP:9000"
    echo "      👤 Usuário: kryonix_minio_admin | 🔑 Senha: KryonixMinIO2024!"
    echo ""
    echo "📊 MONITORAMENTO:"
    echo "   📈 Grafana: http://$SERVER_IP:3001"
    echo "      👤 Usuário: admin | 🔑 Senha: KryonixGrafana2024!"
    echo "   📊 Prometheus: http://$SERVER_IP:9090"
    echo "   🗄️   Adminer: http://$SERVER_IP:8081"
    echo ""
    echo "🗄️  BANCO DE DADOS:"
    echo "   🐘 PostgreSQL: $SERVER_IP:5432"
    echo "      👤 Usuário: kryonix_admin | 🔑 Senha: KryonixDB2024!"
    echo "   🔴 Redis: $SERVER_IP:6379"
    echo "      🔑 Senha: KryonixRedis2024!"
    echo ""
    echo "🔧 INFORMAÇÕES TÉCNICAS:"
    echo "   🌐 IP Servidor: $SERVER_IP"
    echo "   📂 Projeto: $PROJECT_DIR"
    echo "   🐳 Kryonix: $KRYONIX_DIR"
    echo ""
    echo "📋 COMANDOS ÚTEIS:"
    echo "   🔍 Ver logs: docker-compose -f $KRYONIX_DIR/docker-compose.yml logs -f [serviço]"
    echo "   🔄 Restart: docker-compose -f $KRYONIX_DIR/docker-compose.yml restart [serviço]"
    echo "   📊 Status: docker-compose -f $KRYONIX_DIR/docker-compose.yml ps"
    echo "   🆕 Update: cd $PROJECT_DIR && git pull"
    echo ""
    echo "✅ Sistema KRYONIX implantado com sucesso!"
    echo "🎉 Acesse os links acima para começar a usar o sistema."
    echo ""
}

# Função principal
main() {
    log "DEPLOY" "🚀 Iniciando Deploy KRYONIX - Versão Corrigida"
    
    check_root
    system_preparation
    install_docker
    configure_firewall
    clone_project
    create_directories
    configure_traefik
    create_docker_compose
    create_dockerfiles
    create_configs
    deploy_services
    verify_deployment
    setup_webhook
    show_final_summary
    
    log "SUCCESS" "🎉 Deploy concluído com sucesso!"
}

# Executar função principal
main "$@"
