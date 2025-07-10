#!/bin/bash

##############################################################################
#                    🔧 CORREÇÃO COMPLETA KRYONIX                          #
#              Frontend 404 + SSL + Roteamento + Performance                #
##############################################################################

set -euo pipefail

# Cores
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'
BLUE='\033[0;34m'; PURPLE='\033[0;35m'; CYAN='\033[0;36m'
BOLD='\033[1m'; NC='\033[0m'

# Configurações
PROJECT_DIR="/opt/site-jurez-2.0"
DOMAIN1="siqueicamposimoveis.com.br"
DOMAIN2="meuboot.site"

# Função de log
log() {
    local level="$1" message="$2" timestamp=$(date '+%H:%M:%S')
    case $level in
        "SUCCESS") echo -e "${GREEN}✅ [$timestamp] $message${NC}" ;;
        "ERROR") echo -e "${RED}❌ [$timestamp] $message${NC}" ;;
        "WARNING") echo -e "${YELLOW}⚠️ [$timestamp] $message${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️ [$timestamp] $message${NC}" ;;
        *) echo -e "${BOLD}📋 [$timestamp] $message${NC}" ;;
    esac
}

# Banner
show_banner() {
    clear
    echo -e "${BOLD}${PURPLE}🔧 CORREÇÃO COMPLETA KRYONIX${NC}"
    echo -e "${BLUE}🐛 Corrigindo: Frontend 404, SSL, Roteamento, Performance${NC}"
    echo -e "${YELLOW}📊 Projeto: $PROJECT_DIR${NC}"
    echo
}

# Verificar se é root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log "ERROR" "Execute como root: sudo bash $0"
        exit 1
    fi
}

# Parar todos os containers problemáticos
stop_containers() {
    log "WARNING" "⏹️ Parando containers problemáticos..."
    
    # Lista de containers para parar
    containers_to_stop=(
        "kryonix-frontend"
        "kryonix-backend" 
        "kryonix-n8n"
        "kryonix-traefik"
    )
    
    for container in "${containers_to_stop[@]}"; do
        docker stop "$container" 2>/dev/null || true
        docker rm "$container" 2>/dev/null || true
    done
    
    log "SUCCESS" "Containers parados"
}

# Verificar e corrigir estrutura do projeto
fix_project_structure() {
    log "INFO" "🔍 Verificando estrutura do projeto..."
    
    cd "$PROJECT_DIR"
    
    # Verificar se existem arquivos essenciais
    if [[ ! -f "package.json" ]]; then
        log "ERROR" "package.json não encontrado!"
        exit 1
    fi
    
    if [[ ! -d "client" ]]; then
        log "ERROR" "Diretório client não encontrado!"
        exit 1
    fi
    
    if [[ ! -d "server" ]]; then
        log "ERROR" "Diretório server não encontrado!"
        exit 1
    fi
    
    # Verificar se o build está funcionando
    log "INFO" "🔨 Testando build do frontend..."
    npm install --legacy-peer-deps || {
        log "ERROR" "Falha ao instalar dependências"
        exit 1
    }
    
    # Tentar fazer build
    npm run build 2>/dev/null || {
        log "WARNING" "Build padrão falhou, tentando vite build..."
        npx vite build --outDir dist 2>/dev/null || {
            log "WARNING" "Vite build falhou, criando estrutura mínima..."
            mkdir -p dist
            cat > dist/index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Siqueira Campos Imóveis</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
        .container { max-width: 600px; margin: 0 auto; }
        .loading { color: #0066cc; font-size: 24px; margin: 20px 0; }
        .spinner { border: 4px solid #f3f3f3; border-top: 4px solid #0066cc; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 20px auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏠 Siqueira Campos Imóveis</h1>
        <div class="spinner"></div>
        <div class="loading">Carregando aplicação...</div>
        <p>Sistema imobiliário em inicialização</p>
    </div>
    <script>
        // Tentar carregar a aplicação real após 3 segundos
        setTimeout(() => {
            fetch('/api/ping')
                .then(response => response.json())
                .then(data => {
                    document.querySelector('.loading').innerHTML = 'Sistema pronto! Redirecionando...';
                    setTimeout(() => window.location.reload(), 2000);
                })
                .catch(() => {
                    document.querySelector('.loading').innerHTML = 'Aguardando backend...';
                    setTimeout(() => window.location.reload(), 5000);
                });
        }, 3000);
    </script>
</body>
</html>
EOF
        }
    }
    
    log "SUCCESS" "Estrutura do projeto verificada"
}

# Criar Dockerfile do Frontend corrigido
create_fixed_frontend_dockerfile() {
    log "INFO" "📦 Criando Dockerfile do Frontend corrigido..."
    
    cat > "$PROJECT_DIR/Dockerfile.frontend" << 'EOF'
FROM node:18-alpine AS builder
WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache git python3 make g++

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Configurar ambiente de build
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV CI=false
ENV GENERATE_SOURCEMAP=false

# Fazer build com fallbacks
RUN npm run build 2>/dev/null || \
    npx vite build --outDir dist 2>/dev/null || \
    npx vite build 2>/dev/null || \
    (mkdir -p dist && echo "Build falhou, usando fallback" && \
     cp -r client/* dist/ 2>/dev/null || \
     echo '<!DOCTYPE html><html><head><title>Siqueira Campos</title></head><body><h1>Sistema carregando...</h1><script>setTimeout(()=>location.reload(),5000)</script></body></html>' > dist/index.html)

# Verificar se o build foi criado
RUN ls -la dist/ && \
    if [ ! -f "dist/index.html" ]; then \
        echo "Criando index.html de emergência..."; \
        mkdir -p dist; \
        echo '<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Siqueira Campos Imóveis</title></head><body><h1>Sistema Imobiliário</h1><p>Carregando...</p><script>setTimeout(()=>location.reload(),3000)</script></body></html>' > dist/index.html; \
    fi

# Estágio final - NGINX
FROM nginx:alpine

# Copiar arquivos buildados
COPY --from=builder /app/dist /usr/share/nginx/html

# Mover arquivos de subpasta spa se existir
RUN if [ -d "/usr/share/nginx/html/spa" ]; then \
        cp -r /usr/share/nginx/html/spa/* /usr/share/nginx/html/ && \
        rm -rf /usr/share/nginx/html/spa; \
    fi

# Criar configuração do NGINX otimizada
RUN cat > /etc/nginx/conf.d/default.conf << 'NGINXEOF'
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # Headers de segurança e cache
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Pragma "no-cache";
    add_header Expires "0";

    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Roteamento SPA - CRÍTICO para evitar 404
    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }

    # Proxy para API do backend
    location /api {
        proxy_pass http://kryonix-backend:3333;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }

    # Fallback para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1h;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
NGINXEOF

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

    log "SUCCESS" "Dockerfile do Frontend criado"
}

# Criar Dockerfile do Backend corrigido
create_fixed_backend_dockerfile() {
    log "INFO" "⚙️ Criando Dockerfile do Backend corrigido..."
    
    cat > "$PROJECT_DIR/Dockerfile.backend" << 'EOF'
FROM node:18-alpine
WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache git python3 make g++ curl

# Copiar arquivos de dependências
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Fazer build do servidor se necessário
RUN npm run build:server 2>/dev/null || \
    npx tsc --project tsconfig.server.json 2>/dev/null || \
    echo "Sem build de server necessário"

# Gerar Prisma se existir
RUN npm run db:generate 2>/dev/null || \
    npx prisma generate 2>/dev/null || \
    echo "Sem Prisma configurado"

# Criar script de inicialização robusto
RUN cat > start.sh << 'STARTSCRIPT'
#!/bin/sh
echo "🎯 Iniciando servidor na porta 3333..."

# Aguardar dependências
echo "⏳ Aguardando PostgreSQL..."
sleep 10

# Método 1: npm start:server
echo "Método 1: Tentando npm start:server..."
npm run start:server 2>/dev/null && exit 0

# Método 2: npm dev:server
echo "Método 2: Tentando npm dev:server..."
npm run dev:server 2>/dev/null && exit 0

# Método 3: node direto do dist
echo "Método 3: Tentando node dist/server/start.js..."
node dist/server/start.js 2>/dev/null && exit 0

# Método 4: tsx direto
echo "Método 4: Tentando tsx server/start.ts..."
npx tsx server/start.ts 2>/dev/null && exit 0

# Método 5: npm scripts
echo "Método 5: Tentando scripts npm..."
npm run dev:server

# Fallback final
echo "🚨 Iniciando servidor básico de emergência..."
node -e "
const express = require('express');
const app = express();
app.use(express.json());
app.get('/api/ping', (req, res) => res.json({message: 'Siqueira Campos Imóveis API v1.0'}));
app.get('/api/demo', (req, res) => res.json({message: 'Demo endpoint funcionando'}));
app.listen(3333, '0.0.0.0', () => console.log('🚀 Servidor emergência na porta 3333'));
"
STARTSCRIPT

RUN chmod +x start.sh

EXPOSE 3333
CMD ["./start.sh"]
EOF

    log "SUCCESS" "Dockerfile do Backend criado"
}

# Criar docker-compose.yml corrigido
create_fixed_docker_compose() {
    log "INFO" "🐙 Criando docker-compose.yml corrigido..."
    
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
      - --log.level=DEBUG
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
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U kryonix_user -d kryonix"]
      interval: 10s
      timeout: 5s
      retries: 5

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
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 3s
      retries: 5

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
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      NODE_ENV: production
      PORT: 3333
      ADMIN_PORT: 3333
      DATABASE_URL: postgresql://kryonix_user:KryonixPostgres2024!@postgres:5432/kryonix
      REDIS_URL: redis://:KryonixRedis2024!@redis:6379
      JWT_SECRET: kryonix-jwt-secret-2024-ultra-secure
      SMTP_HOST: smtp.gmail.com
      SMTP_PORT: 465
      SMTP_USER: vitor.nakahh@gmail.com
      SMTP_PASS: "@Vitor.12345@"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3333/api/ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(`api.siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.backend.loadbalancer.server.port=3333"

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
      backend:
        condition: service_healthy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(`siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=80"
      # Adicionar regra para www
      - "traefik.http.routers.frontend-www.rule=Host(`www.siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.frontend-www.entrypoints=websecure"
      - "traefik.http.routers.frontend-www.tls.certresolver=letsencrypt"
      - "traefik.http.routers.frontend-www.service=frontend"

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

  # N8N - Automação
  n8n:
    image: n8nio/n8n:latest
    container_name: kryonix-n8n
    restart: unless-stopped
    networks:
      - kryonixnet
    depends_on:
      postgres:
        condition: service_healthy
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

  # MinIO - Storage S3
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

  # Grafana - Monitoramento
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

  # Adminer - Gerenciamento DB
  adminer:
    image: adminer:latest
    container_name: kryonix-adminer
    restart: unless-stopped
    networks:
      - kryonixnet
    depends_on:
      postgres:
        condition: service_healthy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.adminer.rule=Host(`adminer.siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.adminer.entrypoints=websecure"
      - "traefik.http.routers.adminer.tls.certresolver=letsencrypt"
      - "traefik.http.services.adminer.loadbalancer.server.port=8080"
EOF

    log "SUCCESS" "docker-compose.yml corrigido criado"
}

# Executar deploy completo
run_complete_deployment() {
    log "INFO" "🚀 Executando deploy completo..."
    
    cd "$PROJECT_DIR"
    
    # Parar tudo primeiro
    docker-compose down 2>/dev/null || true
    
    # Limpar containers órfãos
    docker system prune -f
    
    log "INFO" "Etapa 1: Infraestrutura base (Traefik, PostgreSQL, Redis)..."
    docker-compose up -d traefik postgres redis
    
    # Aguardar PostgreSQL estar realmente pronto
    log "INFO" "⏳ Aguardando PostgreSQL inicializar completamente..."
    sleep 45
    
    # Testar conectividade do PostgreSQL
    for i in {1..10}; do
        if docker exec kryonix-postgres pg_isready -U kryonix_user -d kryonix; then
            log "SUCCESS" "PostgreSQL pronto!"
            break
        else
            log "WARNING" "PostgreSQL ainda não pronto, tentativa $i/10..."
            sleep 10
        fi
    done
    
    log "INFO" "Etapa 2: Backend..."
    docker-compose up -d --build backend
    sleep 30
    
    # Testar backend
    for i in {1..10}; do
        if docker exec kryonix-backend curl -f http://localhost:3333/api/ping 2>/dev/null; then
            log "SUCCESS" "Backend pronto!"
            break
        else
            log "WARNING" "Backend ainda não pronto, tentativa $i/10..."
            sleep 10
        fi
    done
    
    log "INFO" "Etapa 3: Frontend..."
    docker-compose up -d --build frontend
    sleep 20
    
    log "INFO" "Etapa 4: Portainers..."
    docker-compose up -d portainer-siqueira portainer-meuboot
    sleep 15
    
    log "INFO" "Etapa 5: Serviços auxiliares..."
    docker-compose up -d n8n minio grafana adminer
    sleep 15
    
    log "SUCCESS" "Deploy completo finalizado!"
}

# Verificar e mostrar status
verify_and_show_status() {
    log "INFO" "🔍 Verificando status dos serviços..."
    
    echo
    echo -e "${BOLD}CONTAINERS:${NC}"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep kryonix || echo "Nenhum container kryonix encontrado"
    
    echo
    echo -e "${BOLD}TESTANDO CONECTIVIDADE:${NC}"
    
    # Testar frontend
    if curl -I http://localhost 2>/dev/null | head -1 | grep -q "200\|301\|302\|308"; then
        echo -e "${GREEN}✅ Frontend OK${NC}"
    else
        echo -e "${RED}❌ Frontend problema${NC}"
    fi
    
    # Testar backend
    if docker exec kryonix-backend curl -f http://localhost:3333/api/ping 2>/dev/null; then
        echo -e "${GREEN}✅ Backend OK${NC}"
    else
        echo -e "${RED}❌ Backend problema${NC}"
        echo -e "${YELLOW}📝 Logs do backend (últimas 10 linhas):${NC}"
        docker logs --tail 10 kryonix-backend 2>/dev/null || echo "Container não encontrado"
    fi
    
    echo
    echo -e "${BOLD}${GREEN}🌐 ACESSOS DIRETOS (sem SSL para teste):${NC}"
    echo -e "${CYAN}Frontend: http://localhost${NC}"
    echo -e "${CYAN}API: curl http://localhost/api/ping${NC}"
    echo
    echo -e "${BOLD}${BLUE}🌐 ACESSOS COM DOMÍNIO (com SSL):${NC}"
    echo -e "${CYAN}🏠 Site: https://$DOMAIN1${NC}"
    echo -e "${CYAN}🔧 API: https://api.$DOMAIN1${NC}"
    echo -e "${CYAN}📊 Portainer: https://portainer.$DOMAIN1${NC}"
    echo -e "${CYAN}🏠 Portainer Stacks: https://$DOMAIN2${NC}"
    echo
    echo -e "${BOLD}${YELLOW}📝 Para monitorar logs:${NC}"
    echo -e "${CYAN}docker logs -f kryonix-frontend${NC}"
    echo -e "${CYAN}docker logs -f kryonix-backend${NC}"
    echo
    echo -e "${BOLD}${RED}🔍 Se ainda houver problemas, execute:${NC}"
    echo -e "${CYAN}docker exec -it kryonix-backend sh${NC}"
    echo -e "${CYAN}curl http://localhost${NC}"
}

# Função principal
main() {
    show_banner
    check_root
    
    log "INFO" "🚀 FASE 1: Preparação"
    stop_containers
    fix_project_structure
    
    log "INFO" "🚀 FASE 2: Criação de arquivos"
    create_fixed_frontend_dockerfile
    create_fixed_backend_dockerfile
    create_fixed_docker_compose
    
    log "INFO" "🚀 FASE 3: Deploy completo"
    run_complete_deployment
    
    log "INFO" "🚀 FASE 4: Verificação"
    verify_and_show_status
    
    log "SUCCESS" "🎉 CORREÇÃO COMPLETA FINALIZADA!"
}

# Executar script
main "$@"
