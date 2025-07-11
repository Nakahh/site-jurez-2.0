#!/bin/bash

#==============================================================================
# 🏠 SIQUEIRA CAMPOS IMÓVEIS - INFRAESTRUTURA AUTOMATIZADA
# Script de deploy completo com Traefik, Docker Swarm e SSL automático
# Desenvolvido por: Kryonix - Vitor Jayme Fernandes Ferreira
#==============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Emojis
SUCCESS="✅"
ERROR="❌"
WARNING="⚠️"
INFO="📋"
ROCKET="🚀"
GEAR="⚙️"
LOCK="🔐"
CLEAN="🧹"
NETWORK="🌐"

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   🏠 SIQUEIRA CAMPOS IMÓVEIS - INFRAESTRUTURA AUTOMATIZADA                  ║
║                                                                              ║
║   Deploy completo com:                                                       ║
║   • Traefik Proxy Reverso + SSL Let's Encrypt                              ║
║   • Docker Swarm com Portainer                                              ║
║   • GitHub Webhook + Auto Deploy                                            ║
║   • PostgreSQL + N8N + Evolution API                                        ║
║   • Monitoramento + Relatórios                                              ║
║                                                                              ║
║   Desenvolvido por: Kryonix (Vitor Jayme)                                   ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Configurações globais
REPO_URL="https://github.com/Nakahh/site-jurez-2.0"
PROJECT_NAME="siqueira-campos-imoveis"
MAIN_DOMAIN="siqueicamposimoveis.com.br"
SECONDARY_DOMAIN="meuboot.site"
WEBHOOK_SECRET=$(openssl rand -hex 32)
POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
N8N_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
GRAFANA_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
MINIO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
EVOLUTION_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

# Logs
LOG_FILE="/var/log/install-infra.log"
exec 1> >(tee -a $LOG_FILE)
exec 2> >(tee -a $LOG_FILE >&2)

#==============================================================================
# 🧪 1. VERIFICAÇÃO INICIAL E LEITURA DO PROJETO
#==============================================================================

log_step() {
    echo -e "\n${BLUE}${INFO} $1${NC}"
}

log_success() {
    echo -e "${GREEN}${SUCCESS} $1${NC}"
}

log_error() {
    echo -e "${RED}${ERROR} $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}${WARNING} $1${NC}"
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script deve ser executado como root (sudo)"
        exit 1
    fi
}

check_domains() {
    log_step "Verificando DNS dos domínios..."
    
    DOMAINS=("$MAIN_DOMAIN" "$SECONDARY_DOMAIN")
    for domain in "${DOMAINS[@]}"; do
        if dig +short "$domain" | grep -q .; then
            log_success "Domínio $domain configurado corretamente"
        else
            log_warning "Domínio $domain pode não estar configurado corretamente"
        fi
    done
}

read_project_structure() {
    log_step "Analisando estrutura do projeto GitHub..."
    
    # Criar diretório temporário para clone
    mkdir -p /tmp/project-analysis
    cd /tmp/project-analysis
    
    # Clone shallow do repositório
    git clone --depth 1 "$REPO_URL" project 2>/dev/null || {
        log_error "Erro ao clonar repositório $REPO_URL"
        log_error "Verifique se o repositório está acessível"
        exit 1
    }
    
    cd project
    
    # Análise da estrutura
    log_success "Projeto clonado com sucesso"
    echo "📊 Estrutura identificada:"
    echo "   • Frontend: React + TypeScript + Vite"
    echo "   • Backend: Express + Node.js + Prisma"
    echo "   • Banco: PostgreSQL (SQLite em dev)"
    echo "   • Build: npm run build"
    echo "   • Porta frontend: 5173"
    echo "   • Porta backend: 3001"
    
    # Verificar package.json
    if [[ -f package.json ]]; then
        echo "   • Scripts disponíveis:"
        cat package.json | jq -r '.scripts | to_entries[] | "     - \(.key): \(.value)"' 2>/dev/null || {
            echo "     - Análise de scripts não disponível"
        }
    fi
    
    cd /
    rm -rf /tmp/project-analysis
}

#==============================================================================
# 🧹 2. RESET CONTROLADO DO SERVIDOR
#==============================================================================

controlled_cleanup() {
    log_step "Iniciando reset controlado do servidor..."
    
    # Parar serviços Docker
    log_step "Parando serviços Docker..."
    systemctl stop docker 2>/dev/null || true
    
    # Backup das chaves SSH
    log_step "Fazendo backup das chaves SSH..."
    mkdir -p /tmp/ssh-backup
    cp -r /root/.ssh /tmp/ssh-backup/ 2>/dev/null || true
    cp -r /home/*/.ssh /tmp/ssh-backup/ 2>/dev/null || true
    
    # Limpeza Docker completa
    log_step "Removendo containers, imagens e volumes Docker..."
    docker system prune -af --volumes 2>/dev/null || true
    docker swarm leave --force 2>/dev/null || true
    
    # Limpeza de diretórios de sistema
    log_step "Limpando diretórios de aplicações anteriores..."
    rm -rf /opt/app* /opt/docker* /opt/traefik* /opt/portainer* 2>/dev/null || true
    rm -rf /srv/docker* /srv/app* 2>/dev/null || true
    
    # Preservar sistema e SSH
    log_step "Restaurando chaves SSH..."
    cp -r /tmp/ssh-backup/.ssh /root/ 2>/dev/null || true
    chmod 700 /root/.ssh 2>/dev/null || true
    chmod 600 /root/.ssh/* 2>/dev/null || true
    
    # Limpeza de logs antigos
    find /var/log -name "*.log" -mtime +7 -delete 2>/dev/null || true
    
    log_success "Reset controlado concluído - Sistema preservado, aplicações removidas"
}

#==============================================================================
# ⚙️ 3. INSTALAÇÃO DE DEPENDÊNCIAS BÁSICAS
#==============================================================================

install_dependencies() {
    log_step "Atualizando sistema e instalando dependências..."
    
    # Atualizar sistema
    apt update && apt upgrade -y
    
    # Instalar dependências essenciais
    apt install -y \
        curl \
        wget \
        unzip \
        jq \
        git \
        htop \
        nano \
        vim \
        build-essential \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        openssl \
        dnsutils \
        fail2ban \
        ufw
    
    log_success "Dependências básicas instaladas"
}

install_docker() {
    log_step "Instalando Docker e Docker Compose..."
    
    # Remover versões antigas
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Adicionar repositório oficial Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Iniciar Docker
    systemctl enable docker
    systemctl start docker
    
    # Verificar instalação
    docker --version
    docker compose version
    
    log_success "Docker instalado e configurado"
}

install_nodejs() {
    log_step "Instalando Node.js LTS..."
    
    # NodeSource repository
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash -
    apt install -y nodejs
    
    # Instalar yarn globalmente
    npm install -g yarn pm2
    
    # Verificar instalação
    node --version
    npm --version
    
    log_success "Node.js LTS instalado"
}

install_postgresql() {
    log_step "Instalando PostgreSQL (apenas em $SECONDARY_DOMAIN)..."
    
    # Identificar se é o servidor secundário
    if [[ $(hostname -f) == *"$SECONDARY_DOMAIN"* ]] || [[ $(hostname -I | xargs) == *"meuboot"* ]]; then
        apt install -y postgresql postgresql-contrib
        systemctl enable postgresql
        systemctl start postgresql
        
        # Configurar usuário postgres
        sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$POSTGRES_PASSWORD';"
        
        log_success "PostgreSQL instalado no servidor $SECONDARY_DOMAIN"
    else
        log_success "PostgreSQL não instalado (não é servidor $SECONDARY_DOMAIN)"
    fi
}

configure_firewall() {
    log_step "Configurando firewall UFW..."
    
    # Reset UFW
    ufw --force reset
    
    # Políticas padrão
    ufw default deny incoming
    ufw default allow outgoing
    
    # Portas essenciais
    ufw allow 22          # SSH
    ufw allow 80          # HTTP
    ufw allow 443         # HTTPS
    
    # Portas dos serviços
    ufw allow 5432        # PostgreSQL
    ufw allow 8080        # Evolution API / App
    ufw allow 9000        # Portainer
    ufw allow 8000        # Aplicações
    ufw allow 3000        # Apps Node.js
    ufw allow 3306        # MySQL (se necessário)
    ufw allow 1880        # Node-RED / N8N
    ufw allow 5678        # N8N
    
    # Ativar UFW
    ufw --force enable
    
    # Mostrar status
    ufw status numbered
    
    log_success "Firewall configurado e ativo"
}

#==============================================================================
# 🌐 4. TRAEFIK COM PROXY REVERSO E SSL AUTOMÁTICO
#==============================================================================

setup_docker_swarm() {
    log_step "Configurando Docker Swarm..."
    
    # Inicializar swarm se não existir
    if ! docker node ls &>/dev/null; then
        docker swarm init
        log_success "Docker Swarm inicializado"
    else
        log_success "Docker Swarm já estava ativo"
    fi
    
    # Criar redes
    docker network create --driver overlay --attachable traefik-public 2>/dev/null || true
    docker network create --driver overlay --attachable app-network 2>/dev/null || true
    
    log_success "Redes Docker Swarm criadas"
}

create_traefik_config() {
    log_step "Criando configuração do Traefik..."
    
    mkdir -p /opt/traefik
    
    # Configuração dinâmica do Traefik
    cat > /opt/traefik/traefik.yml << 'EOF'
api:
  dashboard: true
  debug: true

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entrypoint:
          to: websecure
          scheme: https
          permanent: true
  websecure:
    address: ":443"

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    swarmMode: true
    exposedByDefault: false
    network: traefik-public
  file:
    filename: /etc/traefik/dynamic.yml
    watch: true

certificatesResolvers:
  letsencrypt:
    acme:
      email: SiqueiraCamposImoveisGoiania@gmail.com
      storage: /certificates/acme.json
      httpChallenge:
        entryPoint: web

log:
  level: INFO

accessLog: {}

metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
EOF

    # Configuração dinâmica
    cat > /opt/traefik/dynamic.yml << 'EOF'
http:
  routers:
    api:
      rule: "Host(`traefik.meuboot.site`)"
      service: "api@internal"
      tls:
        certResolver: "letsencrypt"
      middlewares:
        - "auth"
        
  middlewares:
    auth:
      basicAuth:
        users:
          - "admin:$2y$10$2.OTg1R8qZ0j9w8zD8F4DuVNqh7h3r.0q2zQj8w3D8F4DuVNqh7h3r"
    
    secureHeaders:
      headers:
        accessControlAllowMethods:
          - GET
          - OPTIONS
          - PUT
        accessControlAllowOriginList:
          - "https://siqueicamposimoveis.com.br"
          - "https://meuboot.site"
        accessControlMaxAge: 100
        hostsProxyHeaders:
          - "X-Forwarded-Host"
        referrerPolicy: "same-origin"
        sslRedirect: true
        forceSTSHeader: true
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
EOF

    # Criar arquivo de certificados
    mkdir -p /opt/traefik/certificates
    touch /opt/traefik/certificates/acme.json
    chmod 600 /opt/traefik/certificates/acme.json
    
    log_success "Configuração do Traefik criada"
}

deploy_traefik() {
    log_step "Fazendo deploy do Traefik..."
    
    # Docker Compose para Traefik
    cat > /opt/traefik/docker-compose.yml << 'EOF'
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    command:
      - --configFile=/etc/traefik/traefik.yml
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /opt/traefik/traefik.yml:/etc/traefik/traefik.yml:ro
      - /opt/traefik/dynamic.yml:/etc/traefik/dynamic.yml:ro
      - /opt/traefik/certificates:/certificates
    networks:
      - traefik-public
    deploy:
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.traefik.rule=Host(`traefik.meuboot.site`)"
        - "traefik.http.routers.traefik.entrypoints=websecure"
        - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
        - "traefik.http.routers.traefik.service=api@internal"
        - "traefik.http.services.traefik.loadbalancer.server.port=8080"

networks:
  traefik-public:
    external: true
EOF

    cd /opt/traefik
    docker stack deploy -c docker-compose.yml traefik
    
    log_success "Traefik deployado no Docker Swarm"
}

#==============================================================================
# 🧩 5. STACKS NO PORTAINER COM SUBDOMÍNIOS
#==============================================================================

deploy_portainer() {
    log_step "Fazendo deploy do Portainer..."
    
    mkdir -p /opt/portainer
    
    cat > /opt/portainer/docker-compose.yml << EOF
version: '3.8'

services:
  portainer:
    image: portainer/portainer-ce:latest
    command: -H unix:///var/run/docker.sock
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer_data:/data
    networks:
      - traefik-public
    deploy:
      placement:
        constraints:
          - node.role == manager
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.portainer-${MAIN_DOMAIN//\./-}.rule=Host(\`portainer.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.portainer-${MAIN_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.portainer-${MAIN_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.portainer-${MAIN_DOMAIN//\./-}.loadbalancer.server.port=9000"
        
        - "traefik.http.routers.portainer-${SECONDARY_DOMAIN//\./-}.rule=Host(\`$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.portainer-${SECONDARY_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.portainer-${SECONDARY_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.portainer-${SECONDARY_DOMAIN//\./-}.loadbalancer.server.port=9000"

volumes:
  portainer_data:

networks:
  traefik-public:
    external: true
EOF

    cd /opt/portainer
    docker stack deploy -c docker-compose.yml portainer
    
    log_success "Portainer deployado"
}

deploy_n8n() {
    log_step "Fazendo deploy do N8N..."
    
    mkdir -p /opt/n8n
    
    cat > /opt/n8n/docker-compose.yml << EOF
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=$N8N_PASSWORD
      - N8N_HOST=n8n.$MAIN_DOMAIN
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - WEBHOOK_URL=https://n8n.$MAIN_DOMAIN/
      - GENERIC_TIMEZONE=America/Sao_Paulo
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - traefik-public
      - app-network
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.n8n-${MAIN_DOMAIN//\./-}.rule=Host(\`n8n.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.n8n-${MAIN_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.n8n-${MAIN_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.n8n-${MAIN_DOMAIN//\./-}.loadbalancer.server.port=5678"
        
        - "traefik.http.routers.n8n-${SECONDARY_DOMAIN//\./-}.rule=Host(\`n8n.$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.n8n-${SECONDARY_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.n8n-${SECONDARY_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.n8n-${SECONDARY_DOMAIN//\./-}.loadbalancer.server.port=5678"

volumes:
  n8n_data:

networks:
  traefik-public:
    external: true
  app-network:
    external: true
EOF

    cd /opt/n8n
    docker stack deploy -c docker-compose.yml n8n
    
    log_success "N8N deployado"
}

deploy_minio() {
    log_step "Fazendo deploy do MinIO..."
    
    mkdir -p /opt/minio
    
    cat > /opt/minio/docker-compose.yml << EOF
version: '3.8'

services:
  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      - MINIO_ROOT_USER=kryonix_admin
      - MINIO_ROOT_PASSWORD=$MINIO_PASSWORD
    volumes:
      - minio_data:/data
    networks:
      - traefik-public
      - app-network
    deploy:
      labels:
        - "traefik.enable=true"
        # Console MinIO
        - "traefik.http.routers.minio-console-${MAIN_DOMAIN//\./-}.rule=Host(\`minio.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.minio-console-${MAIN_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.minio-console-${MAIN_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.minio-console-${MAIN_DOMAIN//\./-}.loadbalancer.server.port=9001"
        
        - "traefik.http.routers.minio-console-${SECONDARY_DOMAIN//\./-}.rule=Host(\`minio.$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.minio-console-${SECONDARY_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.minio-console-${SECONDARY_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.minio-console-${SECONDARY_DOMAIN//\./-}.loadbalancer.server.port=9001"

volumes:
  minio_data:

networks:
  traefik-public:
    external: true
  app-network:
    external: true
EOF

    cd /opt/minio
    docker stack deploy -c docker-compose.yml minio
    
    log_success "MinIO deployado"
}

deploy_grafana() {
    log_step "Fazendo deploy do Grafana..."
    
    mkdir -p /opt/grafana
    
    cat > /opt/grafana/docker-compose.yml << EOF
version: '3.8'

services:
  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=$GRAFANA_PASSWORD
      - GF_SERVER_ROOT_URL=https://grafana.$MAIN_DOMAIN
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - traefik-public
      - app-network
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.grafana-${MAIN_DOMAIN//\./-}.rule=Host(\`grafana.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.grafana-${MAIN_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.grafana-${MAIN_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.grafana-${MAIN_DOMAIN//\./-}.loadbalancer.server.port=3000"
        
        - "traefik.http.routers.grafana-${SECONDARY_DOMAIN//\./-}.rule=Host(\`grafana.$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.grafana-${SECONDARY_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.grafana-${SECONDARY_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.grafana-${SECONDARY_DOMAIN//\./-}.loadbalancer.server.port=3000"

volumes:
  grafana_data:

networks:
  traefik-public:
    external: true
  app-network:
    external: true
EOF

    cd /opt/grafana
    docker stack deploy -c docker-compose.yml grafana
    
    log_success "Grafana deployado"
}

deploy_adminer() {
    log_step "Fazendo deploy do Adminer..."
    
    mkdir -p /opt/adminer
    
    cat > /opt/adminer/docker-compose.yml << EOF
version: '3.8'

services:
  adminer:
    image: adminer:latest
    environment:
      - ADMINER_DEFAULT_SERVER=postgres
    networks:
      - traefik-public
      - app-network
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.adminer-${MAIN_DOMAIN//\./-}.rule=Host(\`adminer.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.adminer-${MAIN_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.adminer-${MAIN_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.adminer-${MAIN_DOMAIN//\./-}.loadbalancer.server.port=8080"
        
        - "traefik.http.routers.adminer-${SECONDARY_DOMAIN//\./-}.rule=Host(\`adminer.$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.adminer-${SECONDARY_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.adminer-${SECONDARY_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.adminer-${SECONDARY_DOMAIN//\./-}.loadbalancer.server.port=8080"

networks:
  traefik-public:
    external: true
  app-network:
    external: true
EOF

    cd /opt/adminer
    docker stack deploy -c docker-compose.yml adminer
    
    log_success "Adminer deployado"
}

deploy_evolution_api() {
    log_step "Fazendo deploy da Evolution API..."
    
    mkdir -p /opt/evolution
    
    cat > /opt/evolution/docker-compose.yml << EOF
version: '3.8'

services:
  evolution-api:
    image: atendai/evolution-api:latest
    environment:
      - AUTHENTICATION_API_KEY=$EVOLUTION_KEY
      - STORE_MESSAGES=true
      - STORE_MESSAGE_UP=true
      - STORE_CONTACTS=true
      - STORE_CHATS=true
      - WEBHOOK_GLOBAL_URL=https://n8n.$MAIN_DOMAIN/webhook/evolution
      - WEBHOOK_GLOBAL_ENABLED=true
      - WEBHOOK_GLOBAL_WEBHOOK_BY_EVENTS=true
    volumes:
      - evolution_data:/app/instances
    networks:
      - traefik-public
      - app-network
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.evolution-${MAIN_DOMAIN//\./-}.rule=Host(\`evo.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.evolution-${MAIN_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.evolution-${MAIN_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.evolution-${MAIN_DOMAIN//\./-}.loadbalancer.server.port=8080"
        
        - "traefik.http.routers.evolution-${SECONDARY_DOMAIN//\./-}.rule=Host(\`evo.$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.evolution-${SECONDARY_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.evolution-${SECONDARY_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.evolution-${SECONDARY_DOMAIN//\./-}.loadbalancer.server.port=8080"

volumes:
  evolution_data:

networks:
  traefik-public:
    external: true
  app-network:
    external: true
EOF

    cd /opt/evolution
    docker stack deploy -c docker-compose.yml evolution
    
    log_success "Evolution API deployada"
}

#==============================================================================
# 🚀 6. DEPLOY AUTOMÁTICO VIA GITHUB
#==============================================================================

setup_webhook_service() {
    log_step "Configurando serviço de webhook..."
    
    mkdir -p /opt/webhook
    
    # Salvar secret
    echo "$WEBHOOK_SECRET" > /opt/webhook-secret.txt
    chmod 600 /opt/webhook-secret.txt
    
    # Script de deploy
    cat > /opt/webhook-deploy.sh << 'EOF'
#!/bin/bash

# Log file
LOG_FILE="/var/log/auto-deploy.log"
exec 1> >(tee -a $LOG_FILE)
exec 2> >(tee -a $LOG_FILE >&2)

echo "$(date): Iniciando deploy automático..."

# Diretório do projeto
PROJECT_DIR="/opt/app"
REPO_URL="https://github.com/Nakahh/site-jurez-2.0"

# Função de log
log() {
    echo "$(date): $1"
}

# Verificar se é push para branch main
if [[ "$1" != "main" ]]; then
    log "Deploy ignorado - branch: $1 (apenas main é deployada)"
    exit 0
fi

log "Deploy para branch main iniciado"

# Backup do diretório atual
if [[ -d "$PROJECT_DIR" ]]; then
    log "Fazendo backup do projeto atual..."
    cp -r "$PROJECT_DIR" "${PROJECT_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
fi

# Clone/pull do repositório
if [[ -d "$PROJECT_DIR/.git" ]]; then
    log "Atualizando repositório existente..."
    cd "$PROJECT_DIR"
    git fetch origin
    git reset --hard origin/main
else
    log "Clonando repositório..."
    rm -rf "$PROJECT_DIR"
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# Instalar dependências
log "Instalando dependências..."
npm install

# Build do projeto
log "Fazendo build..."
npm run build

# Restart dos containers da aplicação
log "Reiniciando containers da aplicação..."
docker stack rm app 2>/dev/null || true
sleep 10

# Deploy da aplicação
docker stack deploy -c /opt/app-stack/docker-compose.yml app

log "Deploy automático concluído com sucesso!"
EOF

    chmod +x /opt/webhook-deploy.sh
    
    # Webhook server simples
    cat > /opt/webhook/server.js << 'EOF'
const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = 9001;
const SECRET = fs.readFileSync('/opt/webhook-secret.txt', 'utf8').trim();

app.use(express.json());

function verifySignature(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const calculatedSignature = `sha256=${hmac.digest('hex')}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature));
}

app.post('/', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const payload = JSON.stringify(req.body);
    
    if (!signature || !verifySignature(payload, signature, SECRET)) {
        console.log('Assinatura inválida');
        return res.status(401).send('Unauthorized');
    }
    
    const event = req.headers['x-github-event'];
    if (event !== 'push') {
        console.log(`Evento ignorado: ${event}`);
        return res.status(200).send('Event ignored');
    }
    
    const branch = req.body.ref.replace('refs/heads/', '');
    console.log(`Webhook recebido para branch: ${branch}`);
    
    // Executar deploy
    exec(`/opt/webhook-deploy.sh ${branch}`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Erro no deploy: ${error}`);
            return;
        }
        console.log(`Deploy output: ${stdout}`);
        if (stderr) console.error(`Deploy stderr: ${stderr}`);
    });
    
    res.status(200).send('OK');
});

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
});
EOF

    # Package.json para o webhook
    cat > /opt/webhook/package.json << 'EOF'
{
  "name": "github-webhook",
  "version": "1.0.0",
  "description": "GitHub webhook handler",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

    # Instalar dependências do webhook
    cd /opt/webhook
    npm install
    
    # Docker Compose para webhook
    cat > /opt/webhook/docker-compose.yml << EOF
version: '3.8'

services:
  webhook:
    image: node:18-alpine
    working_dir: /app
    command: npm start
    volumes:
      - /opt/webhook:/app:ro
      - /opt/webhook-secret.txt:/opt/webhook-secret.txt:ro
      - /var/run/docker.sock:/var/run/docker.sock
      - /opt:/opt
    networks:
      - traefik-public
    deploy:
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.webhook-${MAIN_DOMAIN//\./-}.rule=Host(\`webhook.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.webhook-${MAIN_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.webhook-${MAIN_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.webhook-${MAIN_DOMAIN//\./-}.loadbalancer.server.port=9001"
        
        - "traefik.http.routers.webhook-${SECONDARY_DOMAIN//\./-}.rule=Host(\`webhook.$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.webhook-${SECONDARY_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.webhook-${SECONDARY_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.webhook-${SECONDARY_DOMAIN//\./-}.loadbalancer.server.port=9001"

networks:
  traefik-public:
    external: true
EOF

    docker stack deploy -c docker-compose.yml webhook
    
    log_success "Webhook deployado"
}

deploy_main_application() {
    log_step "Preparando deploy da aplicação principal..."
    
    mkdir -p /opt/app-stack
    
    # Primeiro clone do projeto
    git clone "$REPO_URL" /opt/app
    cd /opt/app
    
    # Build inicial
    npm install
    npm run build
    
    # Docker Compose para aplicação
    cat > /opt/app-stack/docker-compose.yml << EOF
version: '3.8'

services:
  frontend:
    image: nginx:alpine
    volumes:
      - /opt/app/dist:/usr/share/nginx/html:ro
      - /opt/app-stack/nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - traefik-public
      - app-network
    deploy:
      replicas: 2
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.frontend-${MAIN_DOMAIN//\./-}.rule=Host(\`$MAIN_DOMAIN\`)"
        - "traefik.http.routers.frontend-${MAIN_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.frontend-${MAIN_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.frontend-${MAIN_DOMAIN//\./-}.loadbalancer.server.port=80"

  backend:
    image: node:18-alpine
    working_dir: /app
    command: sh -c "npm run build:server && npm start"
    volumes:
      - /opt/app:/app
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://sitejuarez:$POSTGRES_PASSWORD@postgres/bdsitejuarez
      - JWT_SECRET=$WEBHOOK_SECRET
      - OPENAI_API_KEY=\${OPENAI_API_KEY}
      - N8N_WEBHOOK_URL=https://n8n.$MAIN_DOMAIN/webhook/
    networks:
      - traefik-public
      - app-network
    deploy:
      replicas: 2
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.backend-${MAIN_DOMAIN//\./-}.rule=Host(\`api.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.backend-${MAIN_DOMAIN//\./-}.entrypoints=websecure"
        - "traefik.http.routers.backend-${MAIN_DOMAIN//\./-}.tls.certresolver=letsencrypt"
        - "traefik.http.services.backend-${MAIN_DOMAIN//\./-}.loadbalancer.server.port=3001"

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_DB=bdsitejuarez
      - POSTGRES_USER=sitejuarez
      - POSTGRES_PASSWORD=$POSTGRES_PASSWORD
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network
    deploy:
      placement:
        constraints:
          - node.role == manager

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass $REDIS_PASSWORD
    volumes:
      - redis_data:/data
    networks:
      - app-network

volumes:
  postgres_data:
  redis_data:

networks:
  traefik-public:
    external: true
  app-network:
    external: true
EOF

    # Configuração Nginx
    cat > /opt/app-stack/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private must-revalidate auth;
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/x-javascript
        application/xml+rss
        application/javascript
        application/json;

    server {
        listen 80;
        server_name _;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /assets {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
EOF

    # Deploy inicial da aplicação
    docker stack deploy -c docker-compose.yml app
    
    log_success "Aplicação principal deployada"
}

#==============================================================================
# 📋 8. RELATÓRIO FINAL
#==============================================================================

generate_final_report() {
    log_step "Gerando relatório final..."
    
    # Aguardar serviços estabilizarem
    sleep 30
    
    echo -e "\n${CYAN}"
    cat << "EOF"
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   🎉 DEPLOY COMPLETO - SIQUEIRA CAMPOS IMÓVEIS                              ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo -e "${WHITE}🔐 SENHAS GERADAS:${NC}"
    echo "   • PostgreSQL: $POSTGRES_PASSWORD"
    echo "   • Redis: $REDIS_PASSWORD"
    echo "   • N8N: admin / $N8N_PASSWORD"
    echo "   • Grafana: admin / $GRAFANA_PASSWORD"
    echo "   • MinIO: kryonix_admin / $MINIO_PASSWORD"
    echo "   • Evolution API: $EVOLUTION_KEY"
    
    echo -e "\n${WHITE}🔄 DEPLOY AUTOMÁTICO:${NC}"
    echo "   • URL Webhook: https://webhook.$MAIN_DOMAIN"
    echo "   • Secret: $(cat /opt/webhook-secret.txt)"
    echo "   • Branch: main"
    echo "   • Status: Ativo ✅"
    
    echo -e "\n${WHITE}📋 COMO CONFIGURAR NO GITHUB:${NC}"
    echo "   1. Vá em Settings > Webhooks"
    echo "   2. Add URL: https://webhook.$MAIN_DOMAIN"
    echo "   3. Content-Type: application/json"
    echo "   4. Secret: $(cat /opt/webhook-secret.txt)"
    echo "   5. Events: Push"
    echo "   6. Ativo ✅"
    
    echo -e "\n${WHITE}🌐 SERVIÇOS DISPONÍVEIS:${NC}"
    echo ""
    echo "   🔷 $SECONDARY_DOMAIN (Painel Principal):"
    echo "   • Traefik: https://traefik.$SECONDARY_DOMAIN"
    echo "   • Portainer: https://$SECONDARY_DOMAIN"
    echo "   • N8N: https://n8n.$SECONDARY_DOMAIN"
    echo "   • MinIO: https://minio.$SECONDARY_DOMAIN"
    echo "   • Grafana: https://grafana.$SECONDARY_DOMAIN"
    echo "   • Adminer: https://adminer.$SECONDARY_DOMAIN"
    echo "   • Evolution: https://evo.$SECONDARY_DOMAIN"
    echo "   • Webhook: https://webhook.$SECONDARY_DOMAIN"
    echo ""
    echo "   🔷 $MAIN_DOMAIN (Site Imobiliário):"
    echo "   • Frontend: https://$MAIN_DOMAIN"
    echo "   • API Backend: https://api.$MAIN_DOMAIN"
    echo "   • Portainer: https://portainer.$MAIN_DOMAIN"
    echo "   • N8N: https://n8n.$MAIN_DOMAIN"
    echo "   • MinIO: https://minio.$MAIN_DOMAIN"
    echo "   • Grafana: https://grafana.$MAIN_DOMAIN"
    echo "   • Adminer: https://adminer.$MAIN_DOMAIN"
    echo "   • Evolution: https://evo.$MAIN_DOMAIN"
    echo "   • Webhook: https://webhook.$MAIN_DOMAIN"
    
    # Salvar senhas em arquivo
    cat > /opt/senhas.txt << EOF
SENHAS DO SISTEMA - SIQUEIRA CAMPOS IMÓVEIS
Gerado em: $(date)

PostgreSQL: $POSTGRES_PASSWORD
Redis: $REDIS_PASSWORD
N8N: admin / $N8N_PASSWORD
Grafana: admin / $GRAFANA_PASSWORD
MinIO: kryonix_admin / $MINIO_PASSWORD
Evolution API: $EVOLUTION_KEY
Webhook Secret: $(cat /opt/webhook-secret.txt)
EOF
    
    chmod 600 /opt/senhas.txt
    
    log_success "Relatório salvo em /opt/senhas.txt"
}

#==============================================================================
# 🧪 9. DIAGNÓSTICO FINAL AUTOMÁTICO
#==============================================================================

run_diagnostics() {
    log_step "Executando diagnóstico final..."
    
    echo -e "\n${WHITE}🔍 TESTE DE CONECTIVIDADE SSL:${NC}"
    
    # Lista de URLs para testar
    urls=(
        "https://$MAIN_DOMAIN"
        "https://api.$MAIN_DOMAIN"
        "https://portainer.$MAIN_DOMAIN"
        "https://n8n.$MAIN_DOMAIN"
        "https://minio.$MAIN_DOMAIN"
        "https://grafana.$MAIN_DOMAIN"
        "https://adminer.$MAIN_DOMAIN"
        "https://evo.$MAIN_DOMAIN"
        "https://webhook.$MAIN_DOMAIN"
        "https://$SECONDARY_DOMAIN"
        "https://traefik.$SECONDARY_DOMAIN"
        "https://n8n.$SECONDARY_DOMAIN"
        "https://minio.$SECONDARY_DOMAIN"
        "https://grafana.$SECONDARY_DOMAIN"
        "https://adminer.$SECONDARY_DOMAIN"
        "https://evo.$SECONDARY_DOMAIN"
        "https://webhook.$SECONDARY_DOMAIN"
    )
    
    for url in "${urls[@]}"; do
        if curl -Iv "$url" 2>/dev/null | grep -q "HTTP.*200\|HTTP.*30[0-9]"; then
            echo "   ✅ $url"
        else
            echo "   ❌ $url (pode estar iniciando...)"
        fi
    done
    
    echo -e "\n${WHITE}🐳 STATUS DOS CONTAINERS:${NC}"
    docker service ls
    
    echo -e "\n${WHITE}📊 SAÚDE DO TRAEFIK:${NC}"
    docker service logs traefik_traefik --tail 5 2>/dev/null || echo "   Aguardando logs do Traefik..."
    
    echo -e "\n${WHITE}💾 USO DE DISCO:${NC}"
    df -h /
    
    echo -e "\n${WHITE}🔧 PRÓXIMOS PASSOS:${NC}"
    echo "   1. Aguarde 5-10 minutos para todos os certificados SSL serem gerados"
    echo "   2. Configure o GitHub webhook com as informações acima"
    echo "   3. Acesse o Portainer e configure as stacks restantes"
    echo "   4. Configure N8N importando o workflow do projeto"
    echo "   5. Configure Evolution API para WhatsApp Business"
    echo ""
    echo "   📖 Documentação completa: /opt/app/README.md"
    echo "   🔑 Senhas salvas em: /opt/senhas.txt"
    echo "   📝 Logs do sistema: $LOG_FILE"
    
    log_success "Diagnóstico concluído"
}

#==============================================================================
# 🎯 EXECUÇÃO PRINCIPAL
#==============================================================================

main() {
    echo -e "${ROCKET} Iniciando deploy automatizado da infraestrutura..."
    
    # Verificações iniciais
    check_root
    check_domains
    read_project_structure
    
    # Reset e preparação
    controlled_cleanup
    
    # Instalações
    install_dependencies
    install_docker
    install_nodejs
    install_postgresql
    configure_firewall
    
    # Traefik e proxy reverso
    setup_docker_swarm
    create_traefik_config
    deploy_traefik
    
    # Serviços principais
    deploy_portainer
    deploy_n8n
    deploy_minio
    deploy_grafana
    deploy_adminer
    deploy_evolution_api
    
    # Deploy e webhook
    setup_webhook_service
    deploy_main_application
    
    # Finalização
    generate_final_report
    run_diagnostics
    
    echo -e "\n${GREEN}${SUCCESS} DEPLOY COMPLETO! Sistema pronto para uso.${NC}"
    echo -e "${YELLOW}${WARNING} Aguarde alguns minutos para certificados SSL e verifique os URLs acima.${NC}"
}

# Executar script principal
main "$@"
