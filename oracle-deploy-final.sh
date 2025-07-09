#!/bin/bash

# ===================================================================
# 🚀 MEGA DEPLOY AUTOMÁTICO ORACLE UBUNTU 22.04 - VERSÃO FINAL
# ===================================================================

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}❌ Execute como root: sudo bash $0${NC}"
    exit 1
fi

# Configurar ambiente não-interativo
export DEBIAN_FRONTEND=noninteractive

echo -e "${BLUE}"
cat << 'EOF'
╔════════════════════════════════════════════��═════════════════════╗
║                                                                  ║
║     🚀 MEGA DEPLOY AUTOMÁTICO ORACLE UBUNTU 22.04 FINAL         ║
║                                                                  ║
║     Deploy completo para Siqueira Campos Imóveis                ║
║     Sem prompts interativos - 100% automático                   ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# Configurações
DOMAIN_MAIN="siqueicamposimoveis.com.br"
DOMAIN_SECONDARY="meuboot.site"
GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0"
BASE_DIR="/opt/mega-deploy"
SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || echo "127.0.0.1")

# Criar diretórios
mkdir -p "$BASE_DIR"/{docker,logs,backups,ssl,scripts,app}
mkdir -p "$BASE_DIR/docker"/{traefik,portainer,postgres,redis,n8n,evolution}

echo -e "${GREEN}✅ Iniciando deploy automático...${NC}"

# 1. Limpeza e preparação
echo -e "${YELLOW}🧹 Limpando sistema...${NC}"
apt-get update -y >/dev/null 2>&1
apt-get remove -y nodejs npm libnode72 2>/dev/null || true
apt-get autoremove -y >/dev/null 2>&1

# 2. Instalar dependências
echo -e "${YELLOW}📦 Instalando dependências...${NC}"
apt-get install -y curl wget git unzip docker.io docker-compose >/dev/null 2>&1

# 3. Instalar Node.js
echo -e "${YELLOW}🟢 Instalando Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | bash - >/dev/null 2>&1
apt-get install -y nodejs >/dev/null 2>&1

# 4. Configurar Docker
echo -e "${YELLOW}🐳 Configurando Docker...${NC}"
systemctl enable docker >/dev/null 2>&1
systemctl start docker >/dev/null 2>&1

# 5. Gerar senhas
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-32)
REDIS_PASSWORD=$(openssl rand -base64 24 | tr -d "=+/" | cut -c1-24)

# 6. Configurar PostgreSQL
echo -e "${YELLOW}🗄️  Configurando PostgreSQL...${NC}"
cat > "$BASE_DIR/docker/postgres/docker-compose.yml" << EOF
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: $POSTGRES_PASSWORD
      POSTGRES_DB: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
volumes:
  postgres_data:
EOF

# 7. Configurar Redis
echo -e "${YELLOW}🔄 Configurando Redis...${NC}"
cat > "$BASE_DIR/docker/redis/docker-compose.yml" << EOF
version: '3.8'
services:
  redis:
    image: redis:7-alpine
    container_name: redis
    restart: unless-stopped
    command: redis-server --requirepass $REDIS_PASSWORD
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
volumes:
  redis_data:
EOF

# 8. Configurar Traefik
echo -e "${YELLOW}🌐 Configurando Traefik...${NC}"
mkdir -p "$BASE_DIR/docker/traefik/letsencrypt"
touch "$BASE_DIR/docker/traefik/letsencrypt/acme.json"
chmod 600 "$BASE_DIR/docker/traefik/letsencrypt/acme.json"

cat > "$BASE_DIR/docker/traefik/traefik.yml" << EOF
api:
  dashboard: true
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
      email: admin@$DOMAIN_MAIN
      storage: /letsencrypt/acme.json
      httpChallenge:
        entryPoint: web
providers:
  docker:
    exposedByDefault: false
EOF

cat > "$BASE_DIR/docker/traefik/docker-compose.yml" << EOF
version: '3.8'
services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/traefik.yml:ro
      - ./letsencrypt:/letsencrypt
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.$DOMAIN_MAIN\`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
networks:
  default:
    name: traefik
EOF

# 9. Configurar Portainer
echo -e "${YELLOW}🎛️  Configurando Portainer...${NC}"
cat > "$BASE_DIR/docker/portainer/docker-compose.yml" << EOF
version: '3.8'
services:
  portainer:
    image: portainer/portainer-ce:latest
    container_name: portainer
    restart: unless-stopped
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - portainer_data:/data
    ports:
      - "9000:9000"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer.rule=Host(\`portainer.$DOMAIN_MAIN\`)"
      - "traefik.http.routers.portainer.entrypoints=websecure"
      - "traefik.http.routers.portainer.tls.certresolver=letsencrypt"
networks:
  default:
    name: traefik
volumes:
  portainer_data:
EOF

# 10. Clonar aplicação
echo -e "${YELLOW}📱 Clonando aplicação...${NC}"
cd "$BASE_DIR/app"
if [ -d "site-jurez-2.0" ]; then
    rm -rf "site-jurez-2.0"
fi
git clone "$GITHUB_REPO" site-jurez-2.0 >/dev/null 2>&1
cd site-jurez-2.0

# 11. Configurar aplicação
echo -e "${YELLOW}⚙️  Configurando aplicação...${NC}"
cat > .env << EOF
NODE_ENV=production
DATABASE_URL=postgresql://postgres:$POSTGRES_PASSWORD@postgres:5432/postgres
REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379
APP_URL=https://$DOMAIN_MAIN
EOF

cat > docker-compose.yml << EOF
version: '3.8'
services:
  app:
    build: .
    container_name: siqueira-app
    restart: unless-stopped
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:$POSTGRES_PASSWORD@postgres:5432/postgres
      - REDIS_URL=redis://:$REDIS_PASSWORD@redis:6379
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(\`$DOMAIN_MAIN\`)"
      - "traefik.http.routers.app.entrypoints=websecure"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"
      - "traefik.http.services.app.loadbalancer.server.port=3000"
networks:
  default:
    name: traefik
EOF

# Dockerfile se não existir
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

# 12. Iniciar serviços
echo -e "${YELLOW}🚀 Iniciando serviços...${NC}"

# Criar rede
docker network create traefik 2>/dev/null || true

# Iniciar Traefik
cd "$BASE_DIR/docker/traefik"
docker-compose up -d >/dev/null 2>&1

# Iniciar PostgreSQL
cd "$BASE_DIR/docker/postgres"
docker-compose up -d >/dev/null 2>&1

# Iniciar Redis
cd "$BASE_DIR/docker/redis"
docker-compose up -d >/dev/null 2>&1

# Iniciar Portainer
cd "$BASE_DIR/docker/portainer"
docker-compose up -d >/dev/null 2>&1

# Aguardar bancos ficarem prontos
echo -e "${YELLOW}⏳ Aguardando serviços ficarem prontos...${NC}"
sleep 30

# Iniciar aplicação
cd "$BASE_DIR/app/site-jurez-2.0"
npm install >/dev/null 2>&1
docker-compose up -d --build >/dev/null 2>&1

# 13. Salvar credenciais
cat > "$BASE_DIR/credentials.txt" << EOF
# ===================================================================
# 🔐 CREDENCIAIS DO DEPLOY
# ===================================================================
Data: $(date)
Servidor IP: $SERVER_IP

# PostgreSQL
Host: localhost:5432
Usuário: postgres
Senha: $POSTGRES_PASSWORD

# Redis
Host: localhost:6379
Senha: $REDIS_PASSWORD

# URLs
Site: https://$DOMAIN_MAIN
Portainer: https://portainer.$DOMAIN_MAIN
Traefik: https://traefik.$DOMAIN_MAIN

# DNS - Configure estes domínios para apontar para: $SERVER_IP
- $DOMAIN_MAIN
- portainer.$DOMAIN_MAIN
- traefik.$DOMAIN_MAIN
EOF

chmod 600 "$BASE_DIR/credentials.txt"

# 14. Configurar firewall
ufw allow 22/tcp >/dev/null 2>&1
ufw allow 80/tcp >/dev/null 2>&1
ufw allow 443/tcp >/dev/null 2>&1
ufw --force enable >/dev/null 2>&1

# Finalização
echo -e "\n${GREEN}════════════════════════════════════════════════${NC}"
echo -e "${GREEN}🎉 DEPLOY CONCLUÍDO COM SUCESSO! 🎉${NC}"
echo -e "${GREEN}════════════════════════════════════════════════${NC}\n"

echo -e "${BLUE}📋 INFORMAÇÕES IMPORTANTES:${NC}"
echo -e "🌐 Site: https://$DOMAIN_MAIN"
echo -e "🎛️  Portainer: https://portainer.$DOMAIN_MAIN"
echo -e "⚡ Traefik: https://traefik.$DOMAIN_MAIN"
echo -e "🔐 Credenciais: $BASE_DIR/credentials.txt"
echo -e "📊 IP do servidor: $SERVER_IP"

echo -e "\n${YELLOW}🎯 PRÓXIMOS PASSOS:${NC}"
echo -e "1. Configure o DNS dos domínios para: $SERVER_IP"
echo -e "2. Acesse: https://portainer.$DOMAIN_MAIN"
echo -e "3. Veja as credenciais: cat $BASE_DIR/credentials.txt"

echo -e "\n${GREEN}✅ Sistema funcionando!${NC}\n"
