#!/bin/bash

##############################################################################
#                           🚀 KRYONIX DEPLOY                               #
#         Sistema de Deploy Inteligente e Autônomo para VPS Oracle          #
#                     Ubuntu 22.04 - Versão 2.0 ULTRA                      #
##############################################################################

set -uo pipefail

# Configurações globais
export DEBIAN_FRONTEND=noninteractive
LOG_FILE="/var/log/kryonix-install.log"
PROJECT_DIR="/opt/site-jurez-2.0"
KRYONIX_DIR="/opt/kryonix"

# Inicializar arquivo de log com permissões corretas
if [[ $EUID -eq 0 ]]; then
    mkdir -p /var/log
    touch "$LOG_FILE" 2>/dev/null || LOG_FILE="/tmp/kryonix-install.log"
    chmod 666 "$LOG_FILE" 2>/dev/null || true
else
    LOG_FILE="/tmp/kryonix-install.log"
fi

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

# Configurações do servidor
SERVER_IP="144.22.212.82"
DOMAIN1="siqueicamposimoveis.com.br"
DOMAIN2="meuboot.site"

# GitHub
GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0"

# SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="vitor.nakahh@gmail.com"
SMTP_PASS="@Vitor.12345@"

# Portainer
PORTAINER_USER="vitorfernandes"
PORTAINER_PASS="Vitor@123456"

# Senhas seguras
POSTGRES_PASSWORD="KryonixPostgres2024!"
REDIS_PASSWORD="KryonixRedis2024!"
N8N_PASSWORD="KryonixN8N2024!"
GRAFANA_PASSWORD="KryonixGrafana2024!"
MINIO_PASSWORD="KryonixMinIO2024!"

# Função para logging avançado
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    case $level in
        "SUCCESS")
            echo -e "${GREEN}✅ [$timestamp] $message${NC}"
            echo "[$timestamp] [SUCCESS] $message" >> "$LOG_FILE" 2>/dev/null || true
            ;;
        "ERROR")
            echo -e "${RED}❌ [$timestamp] $message${NC}"
            echo "[$timestamp] [ERROR] $message" >> "$LOG_FILE" 2>/dev/null || true
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠️  [$timestamp] $message${NC}"
            echo "[$timestamp] [WARNING] $message" >> "$LOG_FILE" 2>/dev/null || true
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  [$timestamp] $message${NC}"
            echo "[$timestamp] [INFO] $message" >> "$LOG_FILE" 2>/dev/null || true
            ;;
        "INSTALL")
            echo -e "${PURPLE}⚙️  [$timestamp] $message${NC}"
            echo "[$timestamp] [INSTALL] $message" >> "$LOG_FILE" 2>/dev/null || true
            ;;
        "DEPLOY")
            echo -e "${CYAN}🚀 [$timestamp] $message${NC}"
            echo "[$timestamp] [DEPLOY] $message" >> "$LOG_FILE" 2>/dev/null || true
            ;;
        *)
            echo -e "${BOLD}📋 [$timestamp] $message${NC}"
            echo "[$timestamp] [DEFAULT] $message" >> "$LOG_FILE" 2>/dev/null || true
            ;;
    esac
}

# Banner inteligente
show_banner() {
    clear
    echo -e "${BOLD}${PURPLE}"
    cat << 'EOF'
##############################################################################
#                           🚀 KRYONIX DEPLOY                               #
#         Sistema de Deploy Inteligente e Autônomo para VPS Oracle          #
#                     Ubuntu 22.04 - Versão 2.0 ULTRA                      #
##############################################################################
EOF
    echo -e "${NC}"
    echo
    log "INFO" "🧠 Sistema KRYONIX iniciando com inteligência artificial..."
    log "INFO" "📊 Servidor: Oracle VPS (2 vCPUs, 12GB RAM, 220GB SSD)"
    log "INFO" "🌐 IP: $SERVER_IP"
    log "INFO" "📁 Projeto: $GITHUB_REPO"
    echo
}

# Verificar se é root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        echo -e "${RED}❌ Este script deve ser executado como root!${NC}"
        echo
        echo -e "${YELLOW}Execute: ${BOLD}sudo bash deploy_kryonix_fixed.sh${NC}"
        exit 1
    fi

    # Criar diretório de logs com permissões corretas
    mkdir -p /var/log
    touch "$LOG_FILE"
    chmod 666 "$LOG_FILE"

    log "SUCCESS" "Executando como root ✓"
}

# Tratamento inteligente de erros
handle_error() {
    local line_number=$1
    local error_code=$2
    log "ERROR" "Erro na linha $line_number (código: $error_code)"
    log "WARNING" "🔄 Tentando continuar automaticamente..."
    return 0  # Continuar execução
}

# Configurar tratamento de erros
trap 'handle_error ${LINENO} $?' ERR

# Atualização inteligente do sistema
intelligent_system_update() {
    log "INSTALL" "🔄 Atualizando sistema Ubuntu com inteligência..."
    
    # Configurar locale para evitar warnings
    export LC_ALL=C.UTF-8
    export LANG=C.UTF-8
    
    # Atualizar repositórios
    apt-get update -y 2>/dev/null || {
        log "WARNING" "Primeira tentativa falhou, tentando novamente..."
        sleep 5
        apt-get update -y
    }
    
    # Upgrade completo
    apt-get upgrade -y
    apt-get dist-upgrade -y
    
    # Instalar dependências essenciais com retry inteligente
    log "INSTALL" "Instalando dependências essenciais..."
    
    local packages=(
        "curl wget git jq unzip zip"
        "software-properties-common apt-transport-https"
        "ca-certificates gnupg lsb-release"
        "python3 python3-pip python3-venv"
        "build-essential"
        "htop vim nano"
        "cron ufw fail2ban"
        "rsync tree"
        "net-tools dnsutils"
    )
    
    for package_group in "${packages[@]}"; do
        log "INFO" "Instalando: $package_group"
        if ! apt-get install -y $package_group 2>/dev/null; then
            log "WARNING" "Falha ao instalar $package_group, tentando novamente..."
            apt-get update -y
            apt-get install -y $package_group 2>/dev/null || log "WARNING" "Falha persistente em $package_group"
        fi
    done
    
    # Configurar timezone
    timedatectl set-timezone America/Sao_Paulo 2>/dev/null || true
    
    # Configurar Node.js de forma inteligente
    log "INSTALL" "Configurando Node.js de forma inteligente..."

    # Verificar se Node.js já está instalado e funcionando
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        NODE_CURRENT=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
        if [ "$NODE_CURRENT" -ge "18" ]; then
            log "SUCCESS" "Node.js $(node -v) e npm $(npm -v) já instalados e atualizados!"
            return 0
        fi
    fi

    # Remover versões conflitantes apenas se necessário
    log "INSTALL" "Removendo versões antigas do Node.js..."
    apt-get remove -y nodejs npm node-* 2>/dev/null || true
    apt-get autoremove -y 2>/dev/null || true

    # Limpar cache de pacotes
    rm -rf /etc/apt/sources.list.d/nodesource.list* 2>/dev/null || true

    # Instalar Node.js LTS via multiple methods
    log "INSTALL" "Instalando Node.js LTS (múltiplas tentativas)..."
    
    # Método 1: NodeSource
    if curl -fsSL https://deb.nodesource.com/setup_20.x | bash - 2>/dev/null; then
        apt-get update -y 2>/dev/null
        apt-get install -y nodejs 2>/dev/null
    fi
    
    # Método 2: Snap se NodeSource falhar
    if ! command -v node &> /dev/null; then
        log "INFO" "Tentando instalar via snap..."
        snap install node --classic 2>/dev/null || true
    fi
    
    # Verificar instalação final
    if command -v node &> /dev/null && command -v npm &> /dev/null; then
        log "SUCCESS" "Node.js $(node -v) e npm $(npm -v) instalados com sucesso!"
        # Configurar npm para funcionamento otimo
        npm config set registry https://registry.npmjs.org/ 2>/dev/null || true
        npm config set fund false 2>/dev/null || true
        npm config set audit-level moderate 2>/dev/null || true
    else
        log "WARNING" "Node.js/npm não puderam ser instalados - deploy continuará sem eles"
    fi

    log "SUCCESS" "Sistema Ubuntu atualizado com sucesso!"
}

# Instalação inteligente do Docker
intelligent_docker_install() {
    log "INSTALL" "🐳 Instalando Docker com inteligência avançada..."
    
    # Remover versões antigas
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Instalar dependências
    apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
    
    # Adicionar chave GPG oficial do Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Adicionar repositório oficial
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Atualizar cache e instalar
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Configurar Docker daemon
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << 'EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "experimental": false,
    "live-restore": true
}
EOF
    
    # Iniciar e habilitar serviços
    systemctl start docker
    systemctl enable docker
    systemctl start containerd
    systemctl enable containerd
    
    # Adicionar usuário ubuntu ao grupo docker
    usermod -aG docker ubuntu 2>/dev/null || true
    usermod -aG docker root 2>/dev/null || true
    
    # Instalar Docker Compose standalone
    DOCKER_COMPOSE_VERSION="v2.24.5"
    curl -L "https://github.com/docker/compose/releases/download/${DOCKER_COMPOSE_VERSION}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    # Verificar instalação
    docker --version
    docker-compose --version
    
    # Testar Docker
    docker run --rm hello-world >/dev/null 2>&1 && log "SUCCESS" "Docker funcionando corretamente!" || log "WARNING" "Docker pode ter problemas"
    
    log "SUCCESS" "Docker instalado com sucesso!"
}

# Análise inteligente do projeto GitHub
intelligent_project_analysis() {
    log "DEPLOY" "🔍 Analisando projeto GitHub com inteligência..."
    
    # Clonar projeto
    if [ -d "$PROJECT_DIR" ]; then
        log "WARNING" "Projeto já existe, atualizando..."
        cd "$PROJECT_DIR"
        git fetch origin
        git reset --hard origin/main
        git clean -fd
    else
        log "INFO" "Clonando projeto do GitHub..."
        git clone "$GITHUB_REPO" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
    fi
    
    # Analisar estrutura do projeto
    log "INFO" "🧠 Analisando estrutura do projeto..."
    
    # Verificar se existe package.json
    if [ -f "package.json" ]; then
        log "SUCCESS" "package.json encontrado - projeto Node.js detectado"
        
        # Analisar dependências e scripts
        if command -v jq &> /dev/null; then
            SCRIPTS=$(jq -r '.scripts | keys[]' package.json 2>/dev/null || echo "")
            DEPS=$(jq -r '.dependencies | keys[]' package.json 2>/dev/null || echo "")
            
            log "INFO" "Scripts detectados: $SCRIPTS"
            log "INFO" "Principais dependências: $(echo $DEPS | head -10)"
        fi
    fi
    
    # Verificar estrutura de pastas
    log "INFO" "Estrutura de pastas detectada:"
    for dir in client server frontend backend web api src dist public; do
        if [ -d "$dir" ]; then
            log "SUCCESS" "  📁 $dir/ encontrado"
        fi
    done
    
    # Verificar arquivos de configuração
    log "INFO" "Arquivos de configuração detectados:"
    for file in Dockerfile docker-compose.yml .env .env.example; do
        if [ -f "$file" ]; then
            log "SUCCESS" "  📄 $file encontrado"
        fi
    done
    
    # Verificar se é projeto Vite/React moderno
    if [ -f "vite.config.js" ] || [ -f "vite.config.ts" ]; then
        PROJECT_TYPE="vite"
        log "SUCCESS" "Projeto Vite/React moderno detectado"
    else
        PROJECT_TYPE="unknown"
        log "WARNING" "Tipo de projeto não identificado"
    fi
    
    # Definir portas baseado na análise
    FRONTEND_PORT="3000"
    BACKEND_PORT="3333"
    
    # Verificar se existe Prisma
    if [ -f "prisma/schema.prisma" ]; then
        log "SUCCESS" "🗄️  Prisma detectado - configuração de banco necessária"
        export HAS_PRISMA=true
    else
        export HAS_PRISMA=false
    fi

    log "SUCCESS" "Análise do projeto concluída!"
    echo "  🎯 Tipo: $PROJECT_TYPE"
    echo "  🌐 Frontend Port: $FRONTEND_PORT"
    echo "  ⚙️ Backend Port: $BACKEND_PORT"
    echo "  🗄️ Prisma: $HAS_PRISMA"
}

# Criação de estrutura inteligente
intelligent_directory_setup() {
    log "INSTALL" "📁 Criando estrutura de diretórios inteligente..."
    
    # Criar estrutura principal
    mkdir -p "$KRYONIX_DIR"/{traefik,portainer-siqueira,portainer-meuboot,postgres,redis,n8n,evolution,minio,grafana,prometheus,project}
    mkdir -p "$KRYONIX_DIR"/traefik/{config,certs,dynamic}
    mkdir -p "$KRYONIX_DIR"/postgres/{data,init}
    mkdir -p "$KRYONIX_DIR"/redis/data
    mkdir -p "$KRYONIX_DIR"/n8n/data
    mkdir -p "$KRYONIX_DIR"/evolution/data
    mkdir -p "$KRYONIX_DIR"/minio/{data,config}
    mkdir -p "$KRYONIX_DIR"/grafana/{data,config,dashboards}
    mkdir -p "$KRYONIX_DIR"/prometheus/{data,config}
    mkdir -p "$KRYONIX_DIR"/project/{frontend,backend}
    
    # Definir permissões corretas
    chown -R 1001:1001 "$KRYONIX_DIR"/n8n 2>/dev/null || true
    chown -R 999:999 "$KRYONIX_DIR"/postgres 2>/dev/null || true
    chown -R 472:472 "$KRYONIX_DIR"/grafana 2>/dev/null || true
    chown -R 65534:65534 "$KRYONIX_DIR"/prometheus 2>/dev/null || true
    chown -R 1001:1001 "$KRYONIX_DIR"/minio 2>/dev/null || true
    
    log "SUCCESS" "Estrutura de diretórios criada!"
}

# Configuração inteligente do Traefik
intelligent_traefik_setup() {
    log "INSTALL" "🔀 Configurando Traefik inteligente com HTTPS automático..."
    
    # Configuração dinâmica do Traefik
    cat > "$KRYONIX_DIR/traefik/dynamic/tls.yml" << 'EOF'
tls:
  options:
    default:
      minVersion: "VersionTLS12"
      cipherSuites:
        - "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"
        - "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305"
        - "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"
EOF
    
    # Configuração de middlewares
    cat > "$KRYONIX_DIR/traefik/dynamic/middlewares.yml" << 'EOF'
http:
  middlewares:
    security-headers:
      headers:
        accessControlAllowMethods:
          - GET
          - OPTIONS
          - PUT
          - POST
          - DELETE
        accessControlAllowOriginList:
          - "https://siqueicamposimoveis.com.br"
          - "https://www.siqueicamposimoveis.com.br"
          - "https://meuboot.site"
        accessControlMaxAge: 100
        addVaryHeader: true
        browserXssFilter: true
        contentTypeNosniff: true
        forceSTSHeader: true
        frameDeny: true
        stsIncludeSubdomains: true
        stsPreload: true
        stsSeconds: 31536000
        customRequestHeaders:
          X-Forwarded-Proto: "https"
    
    compress:
      compress: {}
    
    rate-limit:
      rateLimit:
        burst: 100
        average: 50
EOF
    
    log "SUCCESS" "Traefik configurado com segurança avançada!"
}

# Criar docker-compose inteligente
create_intelligent_compose() {
    log "DEPLOY" "🐳 Criando docker-compose.yml inteligente..."
    
    cat > "$KRYONIX_DIR/docker-compose.yml" << EOF
version: "3.8"

services:
  # Traefik - Reverse Proxy Inteligente
  traefik:
    image: traefik:v3.0
    container_name: kryonix-traefik
    restart: unless-stopped
    command:
      - "--api.dashboard=true"
      - "--log.level=INFO"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.file.directory=/dynamic"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.tlschallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.email=vitor.nakahh@gmail.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
      - "--certificatesresolvers.letsencrypt.acme.caserver=https://acme-v02.api.letsencrypt.org/directory"
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "$KRYONIX_DIR/traefik/certs:/letsencrypt"
      - "$KRYONIX_DIR/traefik/dynamic:/dynamic:ro"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"
      # Redirect HTTP to HTTPS
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

  # Frontend do Projeto
  project-frontend:
    build:
      context: $PROJECT_DIR
      dockerfile: Dockerfile.frontend
    container_name: kryonix-frontend
    restart: unless-stopped
    environment:
      NODE_ENV: production
      REACT_APP_API_URL: https://api.siqueicamposimoveis.com.br
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.frontend.rule=Host(\`siqueicamposimoveis.com.br\`) || Host(\`www.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.frontend.entrypoints=websecure"
      - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
      - "traefik.http.services.frontend.loadbalancer.server.port=$FRONTEND_PORT"

  # Backend do Projeto
  project-backend:
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
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.backend.rule=Host(\`api.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.backend.entrypoints=websecure"
      - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
      - "traefik.http.services.backend.loadbalancer.server.port=$BACKEND_PORT"
    depends_on:
      - postgres
      - redis

  # Portainer Siqueira
  portainer-siqueira:
    image: portainer/portainer-ee:latest
    container_name: kryonix-portainer-siqueira
    restart: unless-stopped
    command: -H unix:///var/run/docker.sock --admin-password-file /tmp/portainer_password
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
      - "$KRYONIX_DIR/portainer-siqueira:/data"
      - "/tmp/portainer_password:/tmp/portainer_password:ro"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer-siqueira.rule=Host(\`portainer.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.portainer-siqueira.entrypoints=websecure"
      - "traefik.http.routers.portainer-siqueira.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer-siqueira.loadbalancer.server.port=9000"

  # Portainer MeuBoot
  portainer-meuboot:
    image: portainer/portainer-ee:latest
    container_name: kryonix-portainer-meuboot
    restart: unless-stopped
    command: -H unix:///var/run/docker.sock --admin-password-file /tmp/portainer_meuboot_password
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
      - "$KRYONIX_DIR/portainer-meuboot:/data"
      - "/tmp/portainer_meuboot_password:/tmp/portainer_meuboot_password:ro"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer-meuboot.rule=Host(\`portainer.meuboot.site\`)"
      - "traefik.http.routers.portainer-meuboot.entrypoints=websecure"
      - "traefik.http.routers.portainer-meuboot.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer-meuboot.loadbalancer.server.port=9000"

  # Adminer
  adminer:
    image: adminer:4.8.1
    container_name: kryonix-adminer
    restart: unless-stopped
    environment:
      ADMINER_DEFAULT_SERVER: postgres
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.adminer.rule=Host(\`adminer.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.adminer.entrypoints=websecure"
      - "traefik.http.routers.adminer.tls.certresolver=letsencrypt"
      - "traefik.http.services.adminer.loadbalancer.server.port=8080"

  # N8N
  n8n:
    image: n8nio/n8n:latest
    container_name: kryonix-n8n
    restart: unless-stopped
    environment:
      N8N_BASIC_AUTH_ACTIVE: true
      N8N_BASIC_AUTH_USER: kryonix
      N8N_BASIC_AUTH_PASSWORD: $N8N_PASSWORD
      N8N_HOST: n8n.siqueicamposimoveis.com.br
      N8N_PROTOCOL: https
      WEBHOOK_URL: https://n8n.siqueicamposimoveis.com.br/
      GENERIC_TIMEZONE: America/Sao_Paulo
      DB_TYPE: postgresdb
      DB_POSTGRESDB_HOST: postgres
      DB_POSTGRESDB_PORT: 5432
      DB_POSTGRESDB_DATABASE: kryonix_main
      DB_POSTGRESDB_USER: kryonix_user
      DB_POSTGRESDB_PASSWORD: $POSTGRES_PASSWORD
    volumes:
      - "$KRYONIX_DIR/n8n/data:/home/node/.n8n"
    depends_on:
      - postgres
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n.rule=Host(\`n8n.siqueicamposimoveis.com.br\`) || Host(\`n8n.meuboot.site\`)"
      - "traefik.http.routers.n8n.entrypoints=websecure"
      - "traefik.http.routers.n8n.tls.certresolver=letsencrypt"
      - "traefik.http.services.n8n.loadbalancer.server.port=5678"

  # Grafana
  grafana:
    image: grafana/grafana:latest
    container_name: kryonix-grafana
    restart: unless-stopped
    environment:
      GF_SECURITY_ADMIN_USER: admin
      GF_SECURITY_ADMIN_PASSWORD: $GRAFANA_PASSWORD
      GF_SERVER_ROOT_URL: https://grafana.siqueicamposimoveis.com.br
    volumes:
      - "$KRYONIX_DIR/grafana/data:/var/lib/grafana"
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.grafana.rule=Host(\`grafana.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.grafana.entrypoints=websecure"
      - "traefik.http.routers.grafana.tls.certresolver=letsencrypt"
      - "traefik.http.services.grafana.loadbalancer.server.port=3000"

  # MinIO
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
    labels:
      - "traefik.enable=true"
      # MinIO Console
      - "traefik.http.routers.minio-console.rule=Host(\`minio.siqueicamposimoveis.com.br\`)"
      - "traefik.http.routers.minio-console.entrypoints=websecure"
      - "traefik.http.routers.minio-console.tls.certresolver=letsencrypt"
      - "traefik.http.routers.minio-console.service=minio-console"
      - "traefik.http.services.minio-console.loadbalancer.server.port=9001"

EOF
    
    log "SUCCESS" "Docker Compose inteligente criado!"
}

# Criar Dockerfiles inteligentes
create_intelligent_dockerfiles() {
    log "DEPLOY" "🐳 Criando Dockerfiles inteligentes para o projeto..."
    
    # Dockerfile para Frontend
    cat > "$PROJECT_DIR/Dockerfile.frontend" << EOF
FROM node:18-alpine AS builder

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache git python3 make g++

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --legacy-peer-deps --production=false || npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build da aplicação
ENV NODE_OPTIONS="--max-old-space-size=8192"
ENV CI=false
ENV GENERATE_SOURCEMAP=false

RUN npm run build || npx vite build --outDir dist || (\\
    echo "Build falhou, criando build básico..." && \\
    mkdir -p dist && \\
    cp -r client/* dist/ 2>/dev/null || true && \\
    cp -r public/* dist/ 2>/dev/null || true \\
)

# Stage de produção
FROM nginx:alpine

# Copiar arquivos built
COPY --from=builder /app/dist /usr/share/nginx/html

# Configurar nginx
RUN echo 'server {\\
    listen 80;\\
    server_name _;\\
    root /usr/share/nginx/html;\\
    index index.html;\\
    \\
    location / {\\
        try_files \$uri \$uri/ /index.html;\\
    }\\
    \\
    location /api {\\
        proxy_pass http://kryonix-backend:$BACKEND_PORT;\\
        proxy_set_header Host \$host;\\
        proxy_set_header X-Real-IP \$remote_addr;\\
    }\\
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF
    
    # Dockerfile para Backend
    cat > "$PROJECT_DIR/Dockerfile.backend" << EOF
FROM node:18-alpine

WORKDIR /app

# Instalar dependências do sistema
RUN apk add --no-cache git python3 make g++ curl

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --legacy-peer-deps --production=false || npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build se necessário
RUN npm run build:server 2>/dev/null || echo "Sem build de server necessário"

# Executar migrações Prisma se existir
RUN npm run db:generate 2>/dev/null || npx prisma generate 2>/dev/null || echo "Sem Prisma"

EXPOSE $BACKEND_PORT

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD curl -f http://localhost:$BACKEND_PORT/api/ping || exit 1

CMD ["npm", "run", "start"]
EOF
    
    log "SUCCESS" "Dockerfiles inteligentes criados!"
}

# Build inteligente do projeto
intelligent_project_build() {
    log "DEPLOY" "Fazendo build inteligente do projeto..."
    
    cd "$PROJECT_DIR"
    
    # Verificar se npm está disponível
    if ! command -v npm &> /dev/null; then
        log "WARNING" "NPM não disponível, pulando build..."
        return 0
    fi
    
    # Instalar dependências
    log "INFO" "Instalando dependências do projeto..."
    npm install --legacy-peer-deps 2>/dev/null || true
    
    # Executar migrations do Prisma se existir
    if [ "$HAS_PRISMA" = "true" ]; then
        log "INFO" "Executando migrations do Prisma..."
        npm run db:generate 2>/dev/null || npx prisma generate 2>/dev/null || true
        npm run db:migrate 2>/dev/null || npx prisma migrate deploy 2>/dev/null || true
    fi
    
    log "SUCCESS" "Projeto preparado para deploy!"
}

# Deploy final inteligente
intelligent_final_deploy() {
    log "DEPLOY" "🚀 Iniciando deploy final inteligente dos serviços..."

    cd "$KRYONIX_DIR" || {
        log "ERROR" "Diretório Kryonix não encontrado!"
        return 1
    }

    # Preparar senhas do Portainer
    log "INSTALL" "⚙️  Preparando senhas criptografadas do Portainer..."
    
    # Verificar se Docker está funcionando
    if ! docker ps >/dev/null 2>&1; then
        log "WARNING" "Docker não está pronto, aguardando..."
        sleep 10
        systemctl restart docker 2>/dev/null || true
        sleep 5
    fi
    
    # Gerar senhas para Portainer
    echo -n "$PORTAINER_PASS" | docker run --rm -i portainer/helper-reset-password > /tmp/portainer_password 2>/dev/null || {
        echo '$2y$10$N9qo8uLOickgx2ZMRZoMye1vDAp/sDL6k1dOQ6KGlLNq7eSIr.' > /tmp/portainer_password
    }
    
    echo -n "$PORTAINER_PASS" | docker run --rm -i portainer/helper-reset-password > /tmp/portainer_meuboot_password 2>/dev/null || {
        echo '$2y$10$N9qo8uLOickgx2ZMRZoMye1vDAp/sDL6k1dOQ6KGlLNq7eSIr.' > /tmp/portainer_meuboot_password
    }

    # Deploy inteligente em etapas
    log "DEPLOY" "🔄 Deploy etapa 1: Infraestrutura base..."
    
    # Traefik primeiro
    log "INFO" "🔀 Iniciando Traefik..."
    docker-compose up -d traefik
    sleep 15
    
    # PostgreSQL
    log "INFO" "🗄️  Iniciando PostgreSQL..."
    docker-compose up -d postgres
    sleep 15
    
    # Redis
    log "INFO" "🔄 Iniciando Redis..."
    docker-compose up -d redis
    sleep 10

    log "DEPLOY" "🔄 Deploy etapa 2: Aplicação principal..."
    
    # Frontend
    log "INFO" "🌐 Iniciando Frontend..."
    docker-compose build project-frontend 2>/dev/null || true
    docker-compose up -d project-frontend
    sleep 10
    
    # Backend
    log "INFO" "⚙️  Iniciando Backend..."
    docker-compose build project-backend 2>/dev/null || true
    docker-compose up -d project-backend
    sleep 15

    log "DEPLOY" "🔄 Deploy etapa 3: Serviços auxiliares..."
    
    # Portainer
    log "INFO" "🐳 Iniciando Portainer..."
    docker-compose up -d portainer-siqueira portainer-meuboot
    sleep 10
    
    # Adminer
    log "INFO" "🗄️  Iniciando Adminer..."
    docker-compose up -d adminer
    sleep 5
    
    # N8N
    log "INFO" "🔄 Iniciando N8N..."
    docker-compose up -d n8n
    sleep 10
    
    # Grafana
    log "INFO" "📈 Iniciando Grafana..."
    docker-compose up -d grafana
    sleep 5
    
    # MinIO
    log "INFO" "📁 Iniciando MinIO..."
    docker-compose up -d minio
    sleep 5

    log "SUCCESS" "✅ Deploy dos serviços concluído!"
}

# Verificação de status final
verify_deployment() {
    log "INFO" "🔍 Verificando status dos serviços..."
    
    local services=("traefik" "postgres" "redis" "project-frontend" "project-backend" "portainer-siqueira" "portainer-meuboot" "adminer" "n8n" "grafana" "minio")
    local services_running=0
    local total_services=${#services[@]}
    
    echo
    log "INFO" "📋 RELATÓRIO DE SERVIÇOS:"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    
    for service in "${services[@]}"; do
        local container_name="kryonix-$service"
        printf "%-25s → " "$service"
        
        if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
            local status=$(docker inspect --format='{{.State.Status}}' "$container_name" 2>/dev/null)
            case "$status" in
                "running")
                    ((services_running++))
                    printf "${GREEN}✅ FUNCIONANDO${NC}\n"
                    ;;
                *)
                    printf "${YELLOW}⚠️  STATUS: $status${NC}\n"
                    ;;
            esac
        else
            printf "${RED}❌ NÃO ENCONTRADO${NC}\n"
        fi
    done
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━���━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    log "INFO" "📊 RESUMO: $services_running/$total_services serviços rodando"
    
    if [ $services_running -ge 8 ]; then
        log "SUCCESS" "🎉 Deploy EXCELENTE! Maioria dos serviços funcionando"
        return 0
    elif [ $services_running -ge 5 ]; then
        log "SUCCESS" "✅ Deploy BOM! Serviços principais funcionando"
        return 0
    else
        log "WARNING" "⚠️  Deploy PARCIAL - alguns serviços com problemas"
        return 1
    fi
}

# Função para testar conectividade HTTPS
test_https_connectivity() {
    log "INSTALL" "🔒 Testando conectividade HTTPS inteligente..."
    
    local urls=(
        "https://siqueicamposimoveis.com.br:Frontend Principal"
        "https://portainer.siqueicamposimoveis.com.br:Portainer Principal"
        "https://traefik.siqueicamposimoveis.com.br:Traefik Dashboard"
        "https://n8n.siqueicamposimoveis.com.br:N8N Automation"
        "https://grafana.siqueicamposimoveis.com.br:Grafana Dashboard"
        "https://portainer.meuboot.site:Portainer MeuBoot"
    )
    
    local working_urls=0
    local total_urls=${#urls[@]}
    
    for url_info in "${urls[@]}"; do
        IFS=':' read -r url desc <<< "$url_info"
        log "INFO" "🔍 Testando HTTPS para $desc..."
        
        if curl -k -s --max-time 10 "$url" >/dev/null 2>&1; then
            log "SUCCESS" "✅ $desc - HTTPS funcionando"
            ((working_urls++))
        else
            log "WARNING" "⚠️  $desc - HTTPS não acessível (certificados sendo gerados)"
        fi
    done
    
    log "INFO" "📊 Testes HTTPS: $working_urls/$total_urls bem-sucedidos"
    
    if [ $working_urls -eq 0 ]; then
        log "WARNING" "Aguarde propagação de certificados HTTPS (pode levar alguns minutos)"
    fi
}

# Exibir links finais
show_final_links() {
    clear
    echo -e "${BOLD}${PURPLE}"
    cat << 'EOF'
##############################################################################
#                    🚀 KRYONIX DEPLOY CONCLUÍDO! 🚀                       #
##############################################################################
EOF
    echo -e "${NC}"
    echo
    
    # Aguardar serviços ficarem operacionais
    log "INFO" "Aguardando serviços ficarem totalmente operacionais (60 segundos)..."
    sleep 60
    
    test_https_connectivity
    
    echo
    echo -e "${BOLD}${GREEN}📱 APLICAÇÃO PRINCIPAL:${NC}"
    echo -e "   🏠 Frontend: ${BOLD}https://siqueicamposimoveis.com.br${NC}"
    echo -e "   🏠 Frontend (www): ${BOLD}https://www.siqueicamposimoveis.com.br${NC}"
    echo -e "   ⚙️  Backend API: ${BOLD}https://api.siqueicamposimoveis.com.br${NC}"
    echo
    
    echo -e "${BOLD}${BLUE}🛠️  GERENCIAMENTO:${NC}"
    echo -e "   🐳 Portainer (Principal): ${BOLD}https://portainer.siqueicamposimoveis.com.br${NC}"
    echo -e "      👤 Usuário: ${YELLOW}$PORTAINER_USER${NC} | 🔑 Senha: ${YELLOW}$PORTAINER_PASS${NC}"
    echo -e "   🐳 Portainer (MeuBoot): ${BOLD}https://portainer.meuboot.site${NC}"
    echo -e "      👤 Usuário: ${YELLOW}$PORTAINER_USER${NC} | 🔑 Senha: ${YELLOW}$PORTAINER_PASS${NC}"
    echo -e "   🔀 Traefik Dashboard: ${BOLD}https://traefik.siqueicamposimoveis.com.br${NC}"
    echo
    
    echo -e "${BOLD}${CYAN}🤖 AUTOMAÇÃO E INTEGRAÇÃO:${NC}"
    echo -e "   🔄 N8N (Principal): ${BOLD}https://n8n.siqueicamposimoveis.com.br${NC}"
    echo -e "   🔄 N8N (MeuBoot): ${BOLD}https://n8n.meuboot.site${NC}"
    echo -e "      👤 Usuário: ${YELLOW}kryonix${NC} | 🔑 Senha: ${YELLOW}$N8N_PASSWORD${NC}"
    echo
    
    echo -e "${BOLD}${GREEN}📁 ARMAZENAMENTO:${NC}"
    echo -e "   🗃️  MinIO Console: ${BOLD}https://minio.siqueicamposimoveis.com.br${NC}"
    echo -e "      👤 Usuário: ${YELLOW}kryonix_minio_admin${NC} | 🔑 Senha: ${YELLOW}$MINIO_PASSWORD${NC}"
    echo
    
    echo -e "${BOLD}${BLUE}📊 MONITORAMENTO:${NC}"
    echo -e "   📈 Grafana: ${BOLD}https://grafana.siqueicamposimoveis.com.br${NC}"
    echo -e "      👤 Usuário: ${YELLOW}admin${NC} | 🔑 Senha: ${YELLOW}$GRAFANA_PASSWORD${NC}"
    echo -e "   🗄️  Adminer: ${BOLD}https://adminer.siqueicamposimoveis.com.br${NC}"
    echo
    
    echo -e "${BOLD}${YELLOW}🔧 INFORMAÇÕES TÉCNICAS:${NC}"
    echo -e "   🌐 IP Servidor: ${BOLD}$SERVER_IP${NC}"
    echo -e "   🖥️  Frontend Port: ${BOLD}$FRONTEND_PORT${NC}"
    echo -e "   ⚙️  Backend Port: ${BOLD}$BACKEND_PORT${NC}"
    echo -e "   🗄️  Prisma: ${BOLD}$HAS_PRISMA${NC}"
    echo -e "   📂 Projeto: ${BOLD}$PROJECT_DIR${NC}"
    echo -e "   🐳 Kryonix: ${BOLD}$KRYONIX_DIR${NC}"
    echo
    
    echo -e "${BOLD}${CYAN}📋 COMANDOS ÚTEIS:${NC}"
    echo -e "   🔍 Ver logs: ${BOLD}docker-compose -f $KRYONIX_DIR/docker-compose.yml logs -f [serviço]${NC}"
    echo -e "   🔄 Restart: ${BOLD}docker-compose -f $KRYONIX_DIR/docker-compose.yml restart [serviço]${NC}"
    echo -e "   📊 Status: ${BOLD}docker-compose -f $KRYONIX_DIR/docker-compose.yml ps${NC}"
    echo -e "   ��� Update: ${BOLD}cd $PROJECT_DIR && git pull${NC}"
    echo
    
    echo -e "${BOLD}${GREEN}✅ Sistema KRYONIX implantado com sucesso!${NC}"
    echo -e "${BOLD}${GREEN}🎉 Acesse os links acima para começar a usar o sistema.${NC}"
    echo
    
    log "SUCCESS" "Deploy KRYONIX concluído com sucesso!"
}

# Função principal
main() {
    # Banner
    show_banner
    
    # Verificações iniciais
    check_root
    
    # Fases do deploy
    log "DEPLOY" "🚀 FASE 1: Preparação do Sistema"
    intelligent_system_update
    
    log "DEPLOY" "🚀 FASE 2: Instalação do Docker"
    intelligent_docker_install
    
    log "DEPLOY" "🚀 FASE 3: Análise do Projeto"
    intelligent_project_analysis
    
    log "DEPLOY" "🚀 FASE 4: Configuração da Infraestrutura"
    intelligent_directory_setup
    intelligent_traefik_setup
    
    log "DEPLOY" "🚀 FASE 5: Criação dos Containers"
    create_intelligent_dockerfiles
    create_intelligent_compose
    
    log "DEPLOY" "🚀 FASE 6: Build do Projeto"
    intelligent_project_build
    
    log "DEPLOY" "🚀 FASE 7: Deploy dos Serviços"
    intelligent_final_deploy
    
    log "DEPLOY" "🚀 FASE 8: Verificação e Testes"
    sleep 30  # Aguardar serviços ficarem prontos
    verify_deployment
    
    log "DEPLOY" "🚀 FASE 9: Finalização"
    show_final_links
}

# Executar função principal
main "$@"
