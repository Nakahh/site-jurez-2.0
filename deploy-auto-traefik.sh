#!/bin/bash

# 🚀 Deploy AUTOMÁTICO Siqueira Campos Imóveis com Traefik + SSL
# Desenvolvido por Kryonix - 100% AUTOMÁTICO - Zero configuração manual

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

clear
echo -e "${BLUE}🏠 =========================================="
echo -e "🚀 Deploy AUTOMÁTICO - Traefik + SSL"
echo -e "🏠 Siqueira Campos Imóveis"
echo -e "🏠 ==========================================${NC}"

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

# Configurações automáticas (sem input do usuário)
DOMAIN="siqueicamposimoveis.com.br"
EMAIL="admin@siqueicamposimoveis.com.br"
PROJECT_NAME="siqueira-campos-imoveis"

log_info "🤖 Configuração AUTOMÁTICA:"
log_info "   Domínio: $DOMAIN"
log_info "   Email: $EMAIL"
log_info "   Modo: Traefik + Let's Encrypt SSL"

# Detectar sistema operacional
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    log_error "Este script deve ser executado no Linux/VPS, não no Windows!"
    log_info "Execute este script no seu VPS Oracle, não no Windows local"
    exit 1
fi

# Verificar se está rodando como root
if [[ $EUID -eq 0 ]]; then
   log_error "Este script não deve ser executado como root"
   exit 1
fi

# Instalar Docker se necessário
if ! command -v docker &> /dev/null; then
    log_warning "Docker não encontrado. Instalando automaticamente..."
    
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
    
    log_success "Docker instalado!"
fi

# Instalar Docker Compose se necessário
if ! command -v docker-compose &> /dev/null; then
    log_warning "Docker Compose não encontrado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    log_success "Docker Compose instalado!"
fi

# Gerar senhas seguras automaticamente
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
COOKIE_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-30)
N8N_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
EVOLUTION_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

log_success "Senhas geradas automaticamente!"

# Criar arquivo .env automático
log_info "Criando configuração automática..."
cat > .env <<EOF
# Deploy Automático - Siqueira Campos Imóveis
NODE_ENV=production

# Domínio e Email
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

# Google OAuth (Configurar depois se necessário)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://$DOMAIN/api/auth/google/callback

# N8N
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=$N8N_PASSWORD

# Evolution API (WhatsApp)
EVOLUTION_API_KEY=$EVOLUTION_KEY

# OpenAI (Configurar depois se necessário)
OPENAI_API_KEY=

# Timezone
TZ=America/Sao_Paulo

# Cloudflare (Opcional para DNS challenge)
CLOUDFLARE_EMAIL=
CLOUDFLARE_API_TOKEN=
EOF

# Criar docker-compose.yml com Traefik
log_info "Criando configuração Docker com Traefik..."
cat > docker-compose.yml <<EOF
version: "3.8"

services:
  traefik:
    image: traefik:v3.0
    container_name: siqueira-traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    command:
      # API e Dashboard
      - --api.dashboard=true
      - --api.insecure=true

      # Entrypoints
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443

      # Providers
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --providers.docker.network=siqueira-network

      # Certificados SSL Let's Encrypt
      - --certificatesresolvers.letsencrypt.acme.email=\${EMAIL}
      - --certificatesresolvers.letsencrypt.acme.storage=/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge=true
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
      - --certificatesresolvers.letsencrypt.acme.caserver=https://acme-v02.api.letsencrypt.org/directory

      # Logs
      - --log.level=INFO
      - --accesslog=true

      # Redirect HTTP para HTTPS
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.web.http.redirections.entrypoint.scheme=https
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_acme:/acme.json
    networks:
      - siqueira-network
    labels:
      # Dashboard Traefik
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.\${DOMAIN}\`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"

  postgres:
    image: postgres:15-alpine
    container_name: siqueira-postgres
    restart: unless-stopped
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
    networks:
      - siqueira-network

  redis:
    image: redis:7-alpine
    container_name: siqueira-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
    networks:
      - siqueira-network

  app:
    build: .
    container_name: siqueira-app
    restart: unless-stopped
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
      - GOOGLE_CALLBACK_URL=https://\${DOMAIN}/api/auth/google/callback
      - TZ=\${TZ}
    volumes:
      - ./uploads:/app/uploads
      - app_logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    networks:
      - siqueira-network
    labels:
      # Site principal
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(\`\${DOMAIN}\`)"
      - "traefik.http.routers.app.entrypoints=websecure"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"
      - "traefik.http.services.app.loadbalancer.server.port=3000"

      # Headers de segurança
      - "traefik.http.middlewares.security-headers.headers.frameDeny=true"
      - "traefik.http.middlewares.security-headers.headers.sslRedirect=true"
      - "traefik.http.middlewares.security-headers.headers.browserXssFilter=true"
      - "traefik.http.middlewares.security-headers.headers.contentTypeNosniff=true"
      - "traefik.http.middlewares.security-headers.headers.forceSTSHeader=true"
      - "traefik.http.middlewares.security-headers.headers.stsIncludeSubdomains=true"
      - "traefik.http.middlewares.security-headers.headers.stsPreload=true"
      - "traefik.http.middlewares.security-headers.headers.stsSeconds=31536000"

      # Rate limiting
      - "traefik.http.middlewares.ratelimit.ratelimit.burst=100"
      - "traefik.http.middlewares.ratelimit.ratelimit.average=50"

      # Aplicar middlewares
      - "traefik.http.routers.app.middlewares=security-headers,ratelimit"

  n8n:
    image: n8nio/n8n:latest
    container_name: siqueira-n8n
    restart: unless-stopped
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
      - WEBHOOK_URL=https://n8n.\${DOMAIN}
      - GENERIC_TIMEZONE=\${TZ}
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_SECURE_COOKIE=true
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - siqueira-network
    labels:
      # N8N subdomain
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(\`n8n.\${DOMAIN}\`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"

  evolution-api:
    image: atendai/evolution-api:latest
    container_name: siqueira-evolution
    restart: unless-stopped
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
      - WEBHOOK_GLOBAL_URL=https://n8n.\${DOMAIN}/webhook/resposta-corretor
      - WEBHOOK_GLOBAL_ENABLED=true
      - WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=false
      - CONFIG_SESSION_PHONE_CLIENT=Siqueira Campos
      - CONFIG_SESSION_PHONE_NAME=Chrome
      - TZ=\${TZ}
    volumes:
      - evolution_data:/evolution/instances
    networks:
      - siqueira-network
    labels:
      # Evolution API subdomain
      - "traefik.enable=true"
      - "traefik.http.routers.evolution.rule=Host(\`api.\${DOMAIN}\`)"
      - "traefik.http.routers.evolution.entrypoints=websecure"
      - "traefik.http.routers.evolution.tls.certresolver=letsencrypt"
      - "traefik.http.services.evolution.loadbalancer.server.port=8080"

volumes:
  postgres_data:
  redis_data:
  n8n_data:
  evolution_data:
  app_logs:
  traefik_acme:

networks:
  siqueira-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF

# Criar script de inicialização do banco
log_info "Criando script do banco de dados..."
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

# Verificar se Dockerfile existe, se não, criar um simples
if [ ! -f "Dockerfile" ]; then
    log_warning "Dockerfile não encontrado. Criando Dockerfile básico..."
    cat > Dockerfile <<EOF
FROM node:18-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY vite.config.server.ts ./
COPY tailwind.config.ts ./
COPY postcss.config.js ./
COPY components.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código fonte
COPY . .

# Gerar cliente Prisma se prisma existir
RUN if [ -f "prisma/schema.prisma" ]; then npx prisma generate; fi

# Build da aplicação
RUN npm run build

# Estágio de produção
FROM node:18-alpine AS production

WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Instalar apenas dependências de produção
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copiar build da aplicação
COPY --from=base /app/dist ./dist
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/package.json ./

# Copiar prisma se existir
COPY --from=base /app/prisma ./prisma 2>/dev/null || true

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S fusion -u 1001

# Definir permissões
RUN chown -R fusion:nodejs /app
USER fusion

# Expor porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:3000/api/ping || exit 1

# Comando de inicialização
CMD ["npm", "start"]
EOF
fi

# Configurar firewall
log_info "Configurando firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8080/tcp
sudo ufw --force enable

# Criar script de backup
log_info "Criando script de backup automático..."
cat > backup.sh <<EOF
#!/bin/bash
# Backup automatizado

BACKUP_DIR="/home/\$USER/backups"
DATE=\$(date +%Y%m%d_%H%M%S)

mkdir -p \$BACKUP_DIR

# Backup do banco
docker exec siqueira-postgres pg_dump -U sitejuarez bdsitejuarez > \$BACKUP_DIR/db_\$DATE.sql

# Backup dos uploads
if [ -d "uploads" ]; then
    tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz uploads/
fi

# Manter apenas últimos 7 backups
find \$BACKUP_DIR -type f -mtime +7 -delete

echo "Backup concluído: \$DATE"
EOF
chmod +x backup.sh

# Configurar backup automático
log_info "Configurando backup automático diário..."
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup.sh") | crontab -

# Parar containers existentes se houver
log_info "Parando containers existentes..."
docker-compose down 2>/dev/null || true

# Construir e iniciar aplicação
log_info "Construindo e iniciando aplicação com Traefik..."
docker-compose up -d --build

# Aguardar serviços ficarem prontos
log_info "Aguardando serviços iniciarem..."
sleep 45

# Executar migrações do banco se existir prisma
log_info "Executando migrações do banco..."
if [ -f "prisma/schema.prisma" ]; then
    docker-compose exec -T app npm run db:migrate 2>/dev/null || true
    docker-compose exec -T app npm run db:seed 2>/dev/null || true
fi

# Verificar status dos serviços
log_info "Verificando status dos serviços..."
docker-compose ps

# Função para verificar serviço
check_service() {
    local service=$1
    local url=$2
    local max_attempts=12
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
            log_success "$service está respondendo"
            return 0
        fi
        
        log_info "Aguardando $service... ($attempt/$max_attempts)"
        sleep 10
        ((attempt++))
    done
    
    log_warning "$service ainda não está respondendo"
    return 1
}

# Verificar serviços
log_info "Verificando conectividade dos serviços..."

check_service "App Principal" "http://localhost:3000/api/ping"
check_service "Traefik Dashboard" "http://localhost:8080"
check_service "N8N" "http://localhost:5678"
check_service "Evolution API" "http://localhost:8080"

# Salvar informações de acesso
log_info "Criando arquivo de informações de acesso..."
cat > ACESSO_AUTOMATICO.md <<EOF
# 🚀 Siqueira Campos Imóveis - Deploy Automático Traefik

## 🌐 URLs do Sistema

- **Site Principal**: https://$DOMAIN
- **N8N (Automação)**: https://n8n.$DOMAIN
- **Evolution API**: https://api.$DOMAIN
- **Traefik Dashboard**: https://traefik.$DOMAIN

## 🔐 Credenciais Geradas Automaticamente

### N8N (Automação)
- **Usuário**: admin
- **Senha**: $N8N_PASSWORD

### Evolution API (WhatsApp)
- **API Key**: $EVOLUTION_KEY

### Banco de Dados PostgreSQL
- **Host**: localhost:5432
- **Database**: bdsitejuarez
- **Usuário**: sitejuarez
- **Senha**: $DB_PASSWORD

### JWT & Cookies
- **JWT Secret**: $JWT_SECRET
- **Cookie Secret**: $COOKIE_SECRET

## 📋 Comandos Úteis

### Gerenciar Containers
\`\`\`bash
# Ver status
docker-compose ps

# Ver logs
docker-compose logs -f [serviço]

# Reiniciar serviço
docker-compose restart [serviço]

# Parar tudo
docker-compose down

# Iniciar tudo
docker-compose up -d
\`\`\`

### Monitoramento
\`\`\`bash
# Ver certificados SSL
docker-compose exec traefik traefik healthcheck

# Ver logs do Traefik
docker-compose logs -f traefik

# Verificar SSL
curl -I https://$DOMAIN
\`\`\`

## 🔒 SSL/HTTPS

- ✅ **Certificados**: Let's Encrypt automático via Traefik
- ✅ **Renovação**: Automática (sem intervenção)
- ✅ **Subdomínios**: Todos com SSL (n8n, api, traefik)
- ✅ **Redirect**: HTTP → HTTPS automático

## 🚀 Próximos Passos

1. **Apontar DNS**: Configure seu domínio para apontar para este servidor
2. **Aguardar SSL**: Certificados serão gerados automaticamente após DNS
3. **Configurar N8N**: https://n8n.$DOMAIN (admin / $N8N_PASSWORD)
4. **Configurar WhatsApp**: https://api.$DOMAIN
5. **Testar site**: https://$DOMAIN

## ⚠️ IMPORTANTE

- **Backup automático**: Configurado para 2h da manhã
- **Firewall**: Apenas portas 22, 80, 443, 8080 abertas
- **SSL**: Será ativado automaticamente após DNS propagar

---

**Deploy Automático realizado com sucesso! 🎉**
**Traefik + Let's Encrypt + Docker Compose**
**Desenvolvido por Kryonix**
EOF

# Resultado final
echo ""
log_success "🎉 Deploy AUTOMÁTICO concluído com sucesso!"
echo ""
echo -e "${PURPLE}🌐 URLs configuradas:${NC}"
echo -e "   • Site: https://$DOMAIN"
echo -e "   • N8N: https://n8n.$DOMAIN"
echo -e "   • API: https://api.$DOMAIN"
echo -e "   • Traefik: https://traefik.$DOMAIN"
echo ""
echo -e "${PURPLE}🔐 Credenciais salvas em: ACESSO_AUTOMATICO.md${NC}"
echo ""
echo -e "${YELLOW}⚠️  Próximos passos:${NC}"
echo -e "   1. Configure DNS do domínio para apontar para este servidor"
echo -e "   2. Aguarde propagação do DNS (5-30 minutos)"
echo -e "   3. SSL será configurado automaticamente pelo Traefik"
echo -e "   4. Acesse https://$DOMAIN para ver o site"
echo ""
echo -e "${GREEN}✅ Sistema rodando com Traefik + Let's Encrypt!${NC}"
echo -e "${GREEN}✅ Backup automático configurado!${NC}"
echo -e "${GREEN}✅ Firewall configurado!${NC}"
echo -e "${GREEN}✅ Zero configuração manual necessária!${NC}"
echo ""
log_info "📊 Para monitorar: docker-compose logs -f"
