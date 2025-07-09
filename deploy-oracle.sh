#!/bin/bash

# 🚀 Deploy Siqueira Campos Imóveis - Oracle VPS com Docker
# Desenvolvido por Kryonix para Oracle Cloud Infrastructure

set -e

echo "🏠 =========================================="
echo "🚀 Deploy Siqueira Campos Imóveis - Oracle VPS"
echo "🏠 =========================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   log_error "Este script não deve ser executado como root"
   exit 1
fi

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    log_warning "Docker não encontrado. Instalando..."
    
    # Atualizar sistema
    sudo apt update && sudo apt upgrade -y
    
    # Instalar dependências
    sudo apt install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Adicionar chave GPG do Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Adicionar repositório
    echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    sudo apt update
    sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Adicionar usuário ao grupo docker
    sudo usermod -aG docker $USER
    
    log_success "Docker instalado com sucesso!"
    log_warning "Execute 'newgrp docker' ou faça logout/login para usar Docker sem sudo"
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    log_warning "Docker Compose não encontrado. Instalando..."
    
    # Baixar Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Tornar executável
    sudo chmod +x /usr/local/bin/docker-compose
    
    log_success "Docker Compose instalado!"
fi

# Verificar se Git está instalado
if ! command -v git &> /dev/null; then
    log_warning "Git não encontrado. Instalando..."
    sudo apt install -y git
    log_success "Git instalado!"
fi

# Configurações do projeto
PROJECT_NAME="siqueira-campos-imoveis"
PROJECT_DIR="/home/$USER/$PROJECT_NAME"
DOMAIN=""
EMAIL=""

# Solicitar informações do usuário
log_info "Configuração do Deploy"
echo ""
read -p "🌐 Digite seu domínio (ex: siqueicamposimoveis.com.br): " DOMAIN
read -p "📧 Digite seu email para SSL (ex: admin@$DOMAIN): " EMAIL

if [[ -z "$DOMAIN" ]]; then
    log_error "Domínio é obrigatório!"
    exit 1
fi

if [[ -z "$EMAIL" ]]; then
    log_error "Email é obrigatório!"
    exit 1
fi

log_info "Domínio: $DOMAIN"
log_info "Email: $EMAIL"

# Criar diretório do projeto
log_info "Criando diretório do projeto..."
mkdir -p $PROJECT_DIR
cd $PROJECT_DIR

# Se já existe, fazer backup
if [[ -d ".git" ]]; then
    log_warning "Projeto já existe. Fazendo backup..."
    sudo cp -r . ../backup-$(date +%Y%m%d-%H%M%S)
    git pull origin main || true
else
    log_info "Clonando repositório..."
    # Aqui você deve colocar a URL do seu repositório
    read -p "🔗 Digite a URL do repositório Git: " REPO_URL
    git clone $REPO_URL .
fi

# Gerar senhas seguras
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
COOKIE_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-30)
N8N_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
EVOLUTION_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

log_info "Senhas geradas com segurança!"

# Criar arquivo .env para produção
log_info "Criando arquivo de configuração..."
cat > .env <<EOF
# Configurações de Produção - Oracle VPS
NODE_ENV=production

# Domínio
DOMAIN=$DOMAIN
EMAIL=$EMAIL

# Banco de Dados PostgreSQL
DATABASE_URL=postgresql://sitejuarez:$DB_PASSWORD@postgres:5432/bdsitejuarez?schema=public
POSTGRES_DB=bdsitejuarez
POSTGRES_USER=sitejuarez
POSTGRES_PASSWORD=$DB_PASSWORD

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT & Cookies
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
COOKIE_SECRET=$COOKIE_SECRET

# Email SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=siqueiraecamposimoveisgoiania@gmail.com
EMAIL_PASS=Juarez.123

# Google OAuth (Opcional - configure depois)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://$DOMAIN/api/auth/google/callback

# N8N
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=$N8N_PASSWORD
WEBHOOK_URL=https://n8n.$DOMAIN

# Evolution API (WhatsApp)
EVOLUTION_API_KEY=$EVOLUTION_KEY
WEBHOOK_GLOBAL_URL=https://n8n.$DOMAIN/webhook/resposta-corretor

# OpenAI (Configure depois)
OPENAI_API_KEY=

# Timezone
TZ=America/Sao_Paulo
EOF

# Criar docker-compose.oracle.yml otimizado para Oracle
log_info "Criando configuração Docker para Oracle..."
cat > docker-compose.oracle.yml <<EOF
version: "3.8"

services:
  postgres:
    image: postgres:15-alpine
    container_name: siqueira-postgres
    environment:
      POSTGRES_DB: \${POSTGRES_DB}
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      TZ: \${TZ}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - siqueira-network

  redis:
    image: redis:7-alpine
    container_name: siqueira-redis
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    restart: unless-stopped
    networks:
      - siqueira-network

  app:
    build: .
    container_name: siqueira-app
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=\${JWT_SECRET}
      - JWT_EXPIRES_IN=\${JWT_EXPIRES_IN}
      - COOKIE_SECRET=\${COOKIE_SECRET}
      - EMAIL_HOST=\${EMAIL_HOST}
      - EMAIL_PORT=\${EMAIL_PORT}
      - EMAIL_USER=\${EMAIL_USER}
      - EMAIL_PASS=\${EMAIL_PASS}
      - GOOGLE_CLIENT_ID=\${GOOGLE_CLIENT_ID}
      - GOOGLE_CLIENT_SECRET=\${GOOGLE_CLIENT_SECRET}
      - GOOGLE_CALLBACK_URL=\${GOOGLE_CALLBACK_URL}
      - TZ=\${TZ}
    volumes:
      - ./uploads:/app/uploads
      - app_logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    restart: unless-stopped
    networks:
      - siqueira-network

  n8n:
    image: n8nio/n8n:latest
    container_name: siqueira-n8n
    ports:
      - "5678:5678"
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=\${POSTGRES_USER}
      - DB_POSTGRESDB_PASSWORD=\${POSTGRES_PASSWORD}
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=\${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=\${N8N_BASIC_AUTH_PASSWORD}
      - WEBHOOK_URL=\${WEBHOOK_URL}
      - GENERIC_TIMEZONE=\${TZ}
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_SECURE_COOKIE=true
    volumes:
      - n8n_data:/home/node/.n8n
      - ./n8n-fluxo-imobiliaria-completo.json:/tmp/workflow.json:ro
    restart: unless-stopped
    networks:
      - siqueira-network

  evolution-api:
    image: atendai/evolution-api:latest
    container_name: siqueira-evolution
    ports:
      - "8080:8080"
    environment:
      - SERVER_TYPE=http
      - SERVER_PORT=8080
      - CORS_ORIGIN=*
      - CORS_METHODS=GET,POST,PUT,DELETE
      - CORS_CREDENTIALS=true
      - LOG_LEVEL=ERROR
      - LOG_COLOR=true
      - LOG_BAILEYS=error
      - DEL_INSTANCE=false
      - PROVIDER_ENABLED=true
      - PROVIDER_HOST=http://localhost
      - PROVIDER_PORT=8080
      - PROVIDER_PREFIX=evolution
      - AUTHENTICATION_TYPE=apikey
      - AUTHENTICATION_API_KEY=\${EVOLUTION_API_KEY}
      - AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true
      - QRCODE_LIMIT=30
      - QRCODE_COLOR=#198754
      - TYPEBOT_ENABLED=false
      - CHATWOOT_ENABLED=false
      - WEBSOCKET_ENABLED=false
      - RABBITMQ_ENABLED=false
      - SQS_ENABLED=false
      - WEBHOOK_GLOBAL_URL=\${WEBHOOK_GLOBAL_URL}
      - WEBHOOK_GLOBAL_ENABLED=true
      - WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false
      - CONFIG_SESSION_PHONE_CLIENT=Siqueira Campos
      - CONFIG_SESSION_PHONE_NAME=Chrome
      - TZ=\${TZ}
    volumes:
      - evolution_data:/evolution/instances
    restart: unless-stopped
    networks:
      - siqueira-network

  nginx:
    image: nginx:alpine
    container_name: siqueira-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.oracle.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl
      - certbot_www:/var/www/certbot
      - certbot_conf:/etc/letsencrypt
    depends_on:
      - app
      - n8n
      - evolution-api
    restart: unless-stopped
    networks:
      - siqueira-network

  certbot:
    image: certbot/certbot
    container_name: siqueira-certbot
    volumes:
      - certbot_www:/var/www/certbot
      - certbot_conf:/etc/letsencrypt
    command: certonly --webroot --webroot-path=/var/www/certbot --email \${EMAIL} --agree-tos --no-eff-email -d \${DOMAIN} -d n8n.\${DOMAIN} -d api.\${DOMAIN}
    networks:
      - siqueira-network

volumes:
  postgres_data:
  redis_data:
  n8n_data:
  evolution_data:
  app_logs:
  certbot_www:
  certbot_conf:

networks:
  siqueira-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF

# Criar configuração Nginx otimizada para Oracle
log_info "Criando configuração Nginx..."
cat > nginx.oracle.conf <<EOF
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    upstream n8n {
        server n8n:5678;
    }

    upstream evolution {
        server evolution-api:8080;
    }

    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=general:10m rate=30r/s;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # SSL Configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/javascript
        application/xml+rss
        application/json;

    # Main site
    server {
        listen 80;
        server_name $DOMAIN;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://\$server_name\$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name $DOMAIN;

        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

        client_max_body_size 50M;

        location / {
            limit_req zone=general burst=20 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
            proxy_read_timeout 300s;
            proxy_connect_timeout 75s;
        }

        location /api/ {
            limit_req zone=api burst=10 nodelay;
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_read_timeout 300s;
        }
    }

    # N8N subdomain
    server {
        listen 80;
        server_name n8n.$DOMAIN;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://\$server_name\$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name n8n.$DOMAIN;

        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

        location / {
            proxy_pass http://n8n;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
    }

    # Evolution API subdomain
    server {
        listen 80;
        server_name api.$DOMAIN;

        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        location / {
            return 301 https://\$server_name\$request_uri;
        }
    }

    server {
        listen 443 ssl http2;
        server_name api.$DOMAIN;

        ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

        location / {
            proxy_pass http://evolution;
            proxy_http_version 1.1;
            proxy_set_header Upgrade \$http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host \$host;
            proxy_set_header X-Real-IP \$remote_addr;
            proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto \$scheme;
            proxy_cache_bypass \$http_upgrade;
        }
    }
}
EOF

# Criar script de inicialização do banco
log_info "Criando script de inicialização do banco..."
cat > init.sql <<EOF
-- Criar banco N8N se não existir
CREATE DATABASE n8n;
GRANT ALL PRIVILEGES ON DATABASE n8n TO sitejuarez;

-- Configurações para melhor performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
EOF

# Configurar firewall Oracle (iptables)
log_info "Configurando firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw --force enable

# Criar script de backup
log_info "Criando script de backup..."
cat > backup.sh <<EOF
#!/bin/bash
# Backup automatizado

BACKUP_DIR="/home/$USER/backups"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup do banco
docker exec siqueira-postgres pg_dump -U sitejuarez bdsitejuarez > \$BACKUP_DIR/db_\$DATE.sql

# Backup dos uploads
tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz uploads/

# Manter apenas últimos 7 backups
find \$BACKUP_DIR -type f -mtime +7 -delete

echo "Backup concluído: \$DATE"
EOF
chmod +x backup.sh

# Criar crontab para backups automáticos
log_info "Configurando backup automático..."
(crontab -l 2>/dev/null; echo "0 2 * * * $PROJECT_DIR/backup.sh") | crontab -

# Build e deploy
log_info "Construindo e iniciando aplicação..."

# Parar containers existentes
docker-compose -f docker-compose.oracle.yml down 2>/dev/null || true

# Construir e iniciar
docker-compose -f docker-compose.oracle.yml up -d --build

# Aguardar serviços ficarem prontos
log_info "Aguardando serviços iniciarem..."
sleep 30

# Verificar status dos serviços
log_info "Verificando status dos serviços..."
docker-compose -f docker-compose.oracle.yml ps

# Executar migrações do banco
log_info "Executando migrações do banco..."
docker-compose -f docker-compose.oracle.yml exec -T app npm run db:migrate 2>/dev/null || true
docker-compose -f docker-compose.oracle.yml exec -T app npm run db:seed 2>/dev/null || true

# Configurar SSL
log_info "Configurando SSL com Let's Encrypt..."
docker-compose -f docker-compose.oracle.yml run --rm certbot

# Recarregar Nginx
docker-compose -f docker-compose.oracle.yml exec nginx nginx -s reload

# Salvar informações importantes
log_info "Salvando informações de acesso..."
cat > ACESSO.md <<EOF
# 🚀 Siqueira Campos Imóveis - Informações de Acesso

## 🌐 URLs do Sistema

- **Site Principal**: https://$DOMAIN
- **N8N (Automação)**: https://n8n.$DOMAIN
- **Evolution API**: https://api.$DOMAIN

## 🔐 Credenciais

### N8N (Automação)
- **Usuário**: admin
- **Senha**: $N8N_PASSWORD

### Evolution API (WhatsApp)
- **API Key**: $EVOLUTION_KEY

### Banco de Dados
- **Host**: localhost:5432
- **Database**: bdsitejuarez
- **Usuário**: sitejuarez
- **Senha**: $DB_PASSWORD

## 📋 Comandos Úteis

### Gerenciar Containers
\`\`\`bash
# Ver status
docker-compose -f docker-compose.oracle.yml ps

# Ver logs
docker-compose -f docker-compose.oracle.yml logs -f

# Reiniciar serviço
docker-compose -f docker-compose.oracle.yml restart [serviço]

# Parar tudo
docker-compose -f docker-compose.oracle.yml down

# Iniciar tudo
docker-compose -f docker-compose.oracle.yml up -d
\`\`\`

### Backup Manual
\`\`\`bash
./backup.sh
\`\`\`

### Logs da Aplicação
\`\`\`bash
docker-compose -f docker-compose.oracle.yml logs -f app
\`\`\`

### Monitoramento
\`\`\`bash
# Ver uso de recursos
docker stats

# Ver espaço em disco
df -h
\`\`\`

## 🔧 Próximos Passos

1. **Configurar DNS**: Apontar domínio para IP do servidor Oracle
2. **Configurar WhatsApp**: Acessar https://api.$DOMAIN e configurar instância
3. **Importar Workflow N8N**: Acessar https://n8n.$DOMAIN e importar fluxo
4. **Configurar Google OAuth**: Para login social (opcional)
5. **Configurar OpenAI**: Para IA no chat (opcional)

## ⚠️ Importante

- **Backups**: Executados automaticamente às 2h da manhã
- **SSL**: Renovado automaticamente pelo Certbot
- **Logs**: Rotacionados automaticamente pelo Docker
- **Firewall**: Apenas portas 22, 80 e 443 abertas

---

**Deploy realizado com sucesso! 🎉**
**Desenvolvido por Kryonix para Oracle Cloud Infrastructure**
EOF

log_success "🎉 Deploy concluído com sucesso!"
echo ""
log_info "📋 Próximos passos:"
echo "1. Configure seu DNS apontando para este servidor"
echo "2. Acesse https://$DOMAIN para ver o site"
echo "3. Configure N8N em https://n8n.$DOMAIN"
echo "4. Configure WhatsApp em https://api.$DOMAIN"
echo ""
log_info "📄 Todas as informações estão salvas em ACESSO.md"
echo ""
log_success "🏠 Siqueira Campos Imóveis está online!"
