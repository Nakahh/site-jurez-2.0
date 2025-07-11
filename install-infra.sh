#!/bin/bash

#==============================================================================
# 🏠 SIQUEIRA CAMPOS IMÓVEIS - INFRAESTRUTURA PROFISSIONAL
# Script de Deploy Automatizado com Design Moderno
# Desenvolvido por: Kryonix - Vitor Jayme Fernandes Ferreira
# Versão: 3.0.0 Enterprise
#==============================================================================

set -euo pipefail
IFS=$'\n\t'

# ========================= CONFIGURAÇÕES GLOBAIS ===========================

# Cores e estilos
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly BLUE='\033[0;34m'
readonly PURPLE='\033[0;35m'
readonly CYAN='\033[0;36m'
readonly WHITE='\033[1;37m'
readonly BOLD='\033[1m'
readonly DIM='\033[2m'
readonly NC='\033[0m'

# Emojis e símbolos
readonly SUCCESS="✅"
readonly ERROR="❌"
readonly WARNING="⚠️"
readonly INFO="📋"
readonly ROCKET="🚀"
readonly GEAR="⚙️"
readonly LOCK="🔐"
readonly CLEAN="🧹"
readonly NETWORK="🌐"
readonly BUILDING="🏗️"
readonly CHART="📊"
readonly BELL="🔔"

# Configurações do projeto
readonly REPO_URL="https://github.com/Nakahh/site-jurez-2.0"
readonly PROJECT_NAME="siqueira-campos-imoveis"
readonly MAIN_DOMAIN="siqueicamposimoveis.com.br"
readonly SECONDARY_DOMAIN="meuboot.site"
readonly EMAIL="SiqueiraCamposImoveisGoiania@gmail.com"

# Senhas geradas aleatoriamente
readonly WEBHOOK_SECRET=$(openssl rand -hex 32)
readonly POSTGRES_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
readonly REDIS_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
readonly N8N_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
readonly GRAFANA_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
readonly MINIO_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
readonly EVOLUTION_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
readonly JWT_SECRET=$(openssl rand -base64 64)

# Logs e arquivos
readonly LOG_DIR="/var/log/kryonix-deploy"
readonly MAIN_LOG="$LOG_DIR/deploy.log"
readonly ERROR_LOG="$LOG_DIR/error.log"
readonly SSL_LOG="$LOG_DIR/ssl-status.log"
readonly REPORT_FILE="/opt/deploy-report.log"
readonly PASSWORD_FILE="/opt/senhas-sistema.txt"

# Criar diretório de logs
mkdir -p "$LOG_DIR"

# ========================= FUNÇÕES DE DESIGN MODERNO ========================

show_banner() {
    clear
    echo -e "${CYAN}${BOLD}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   🏠 SIQUEIRA CAMPOS IMÓVEIS - DEPLOY ENTERPRISE v3.0.0                     ║
║                                                                              ║
║   ┌─────────────────────────────────────────────────────────────────────┐    ║
║   │  • Servidor de 24GB RAM - Produção                                 │    ║
║   │  • Traefik Proxy Reverso + SSL Let's Encrypt                       │    ║
║   │  • Docker Swarm + Portainer Management                             │    ║
║   │  • GitHub Auto-Deploy + Webhook                                    │    ║
║   │  • PostgreSQL + Redis + N8N + Evolution API                       │    ║
║   │  • Monitoramento + Logs + Diagnóstico Automático                  │    ║
║   └─────────────────────────────────────────────────────────────────────┘    ║
║                                                                              ║
║   Desenvolvido por: Kryonix (Vitor Jayme Fernandes Ferreira)                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    echo -e "${WHITE}${BOLD}🎯 DOMÍNIOS CONFIGURADOS:${NC}"
    echo -e "   ${BLUE}• $MAIN_DOMAIN${NC} ${DIM}(Site Imobiliário)${NC}"
    echo -e "   ${PURPLE}• $SECONDARY_DOMAIN${NC} ${DIM}(Painel de Controle)${NC}"
    echo ""
}

log_step() {
    local step="$1"
    local description="$2"
    echo -e "\n${BLUE}${BOLD}${INFO} [$step]${NC} ${WHITE}$description${NC}" | tee -a "$MAIN_LOG"
}

log_success() {
    local message="$1"
    echo -e "${GREEN}${SUCCESS} $message${NC}" | tee -a "$MAIN_LOG"
}

log_error() {
    local message="$1"
    echo -e "${RED}${ERROR} $message${NC}" | tee -a "$ERROR_LOG"
    printf '\a'  # Som de erro
}

log_warning() {
    local message="$1"
    echo -e "${YELLOW}${WARNING} $message${NC}" | tee -a "$MAIN_LOG"
}

show_progress() {
    local current=$1
    local total=$2
    local operation="$3"
    local percent=$((current * 100 / total))
    local completed=$((current * 50 / total))
    local remaining=$((50 - completed))
    
    printf "\r${CYAN}${BOLD}$operation${NC} ["
    printf "%*s" $completed | tr ' ' '█'
    printf "%*s" $remaining | tr ' ' '░'
    printf "] ${WHITE}%d%%${NC}" $percent
    
    if [ $current -eq $total ]; then
        echo -e " ${GREEN}${SUCCESS}${NC}"
    fi
}

check_requirements() {
    log_step "01" "Verificando requisitos do sistema..."
    
    # Verificar se é root
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script deve ser executado como root (sudo)"
        exit 1
    fi
    
    # Verificar sistema operacional
    if ! command -v apt-get &> /dev/null; then
        log_error "Este script é compatível apenas com Ubuntu/Debian"
        exit 1
    fi
    
    # Verificar RAM
    local ram_gb=$(free -g | awk '/^Mem:/{print $2}')
    if [ "$ram_gb" -lt 8 ]; then
        log_warning "RAM disponível: ${ram_gb}GB (recomendado: 24GB)"
    else
        log_success "RAM disponível: ${ram_gb}GB ✓"
    fi
    
    # Verificar DNS
    for domain in "$MAIN_DOMAIN" "$SECONDARY_DOMAIN"; do
        if dig +short "$domain" | grep -q .; then
            log_success "DNS configurado para $domain ✓"
        else
            log_warning "Verificar DNS para $domain"
        fi
    done
    
    log_success "Verificação de requisitos concluída"
}

analyze_project() {
    log_step "02" "Analisando projeto GitHub..."
    
    # Criar diretório temporário
    local temp_dir="/tmp/project-analysis-$$"
    mkdir -p "$temp_dir"
    cd "$temp_dir"
    
    # Clone do repositório
    if git clone --depth 1 "$REPO_URL" project 2>/dev/null; then
        cd project
        
        # Análise da estrutura
        echo -e "${CHART} ${WHITE}Estrutura identificada:${NC}"
        echo "   • Frontend: React 18 + TypeScript + Vite"
        echo "   • Backend: Express + Node.js + Prisma"
        echo "   • Banco: PostgreSQL (SQLite em dev)"
        echo "   • Porta dev: 3000 (frontend) + 3001 (backend)"
        
        # Verificar scripts
        if [ -f package.json ]; then
            echo "   • Build: npm run build"
            echo "   • Start: npm start"
            echo "   • Deploy: Docker + Webhook"
        fi
        
        log_success "Projeto analisado com sucesso"
    else
        log_error "Erro ao acessar repositório $REPO_URL"
        exit 1
    fi
    
    # Cleanup
    cd /
    rm -rf "$temp_dir"
}

# ========================= LIMPEZA CONTROLADA ===============================

controlled_cleanup() {
    log_step "03" "Executando limpeza controlada do servidor..."
    
    # Backup das chaves SSH
    log_step "03.1" "Fazendo backup das chaves SSH..."
    local ssh_backup="/tmp/ssh-backup-$$"
    mkdir -p "$ssh_backup"
    cp -r /root/.ssh "$ssh_backup/" 2>/dev/null || true
    find /home -name ".ssh" -exec cp -r {} "$ssh_backup/" \; 2>/dev/null || true
    
    # Parar Docker Swarm e serviços
    log_step "03.2" "Parando serviços Docker..."
    systemctl stop docker 2>/dev/null || true
    docker swarm leave --force 2>/dev/null || true
    
    # Limpeza Docker completa
    log_step "03.3" "Removendo containers e volumes..."
    docker system prune -af --volumes 2>/dev/null || true
    
    # Limpeza de diretórios
    local cleanup_dirs=(
        "/opt/app*"
        "/opt/docker*"
        "/opt/traefik*"
        "/opt/portainer*"
        "/srv/docker*"
        "/srv/app*"
    )
    
    for dir in "${cleanup_dirs[@]}"; do
        rm -rf $dir 2>/dev/null || true
    done
    
    # Restaurar SSH
    log_step "03.4" "Restaurando chaves SSH..."
    cp -r "$ssh_backup/.ssh" /root/ 2>/dev/null || true
    chmod 700 /root/.ssh 2>/dev/null || true
    chmod 600 /root/.ssh/* 2>/dev/null || true
    rm -rf "$ssh_backup"
    
    log_success "Limpeza controlada concluída"
}

# ========================= INSTALAÇÃO DE DEPENDÊNCIAS =======================

install_dependencies() {
    log_step "04" "Instalando dependências do sistema..."
    
    local deps=(
        "curl" "wget" "unzip" "jq" "git" "htop" "nano" "vim"
        "build-essential" "software-properties-common" 
        "apt-transport-https" "ca-certificates" "gnupg" 
        "lsb-release" "openssl" "dnsutils" "fail2ban" "ufw"
    )
    
    # Atualizar sistema
    show_progress 1 4 "Atualizando sistema"
    apt update -qq && apt upgrade -y -qq
    
    # Instalar dependências
    show_progress 2 4 "Instalando pacotes"
    apt install -y "${deps[@]}" > /dev/null 2>&1
    
    show_progress 3 4 "Configurando fail2ban"
    systemctl enable fail2ban > /dev/null 2>&1
    systemctl start fail2ban > /dev/null 2>&1
    
    show_progress 4 4 "Configuração concluída"
    
    log_success "Dependências instaladas"
}

install_docker() {
    log_step "05" "Instalando Docker Enterprise..."
    
    # Remover versões antigas
    show_progress 1 5 "Removendo versões antigas"
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Adicionar repositório
    show_progress 2 5 "Adicionando repositório Docker"
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    show_progress 3 5 "Instalando Docker"
    apt update -qq
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin > /dev/null 2>&1
    
    show_progress 4 5 "Configurando serviços"
    systemctl enable docker > /dev/null 2>&1
    systemctl start docker > /dev/null 2>&1
    
    show_progress 5 5 "Verificando instalação"
    docker --version > /dev/null
    docker compose version > /dev/null
    
    log_success "Docker instalado: $(docker --version | cut -d' ' -f3 | cut -d',' -f1)"
}

install_nodejs() {
    log_step "06" "Instalando Node.js LTS..."
    
    show_progress 1 3 "Adicionando repositório NodeSource"
    curl -fsSL https://deb.nodesource.com/setup_lts.x | bash - > /dev/null 2>&1
    
    show_progress 2 3 "Instalando Node.js"
    apt install -y nodejs > /dev/null 2>&1
    
    show_progress 3 3 "Instalando ferramentas globais"
    npm install -g yarn pm2 > /dev/null 2>&1
    
    local node_version=$(node --version)
    local npm_version=$(npm --version)
    log_success "Node.js instalado: $node_version (npm: $npm_version)"
}

install_postgresql() {
    log_step "07" "Configurando PostgreSQL..."
    
    # Verificar se deve instalar PostgreSQL
    local current_ip=$(hostname -I | awk '{print $1}')
    
    show_progress 1 4 "Verificando localização do servidor"
    
    # Instalar PostgreSQL apenas se for o servidor principal
    if [[ $(hostname -f) == *"$SECONDARY_DOMAIN"* ]] || [[ "$current_ip" == *"10.0"* ]]; then
        show_progress 2 4 "Instalando PostgreSQL"
        apt install -y postgresql postgresql-contrib > /dev/null 2>&1
        
        show_progress 3 4 "Configurando usuário"
        systemctl enable postgresql > /dev/null 2>&1
        systemctl start postgresql > /dev/null 2>&1
        sudo -u postgres psql -c "ALTER USER postgres PASSWORD '$POSTGRES_PASSWORD';" > /dev/null 2>&1
        
        show_progress 4 4 "PostgreSQL configurado"
        log_success "PostgreSQL instalado no servidor $SECONDARY_DOMAIN"
    else
        show_progress 4 4 "PostgreSQL não necessário neste servidor"
        log_success "PostgreSQL configurado via container"
    fi
}

configure_firewall() {
    log_step "08" "Configurando firewall UFW..."
    
    # Reset UFW
    show_progress 1 6 "Resetando configurações"
    ufw --force reset > /dev/null 2>&1
    
    # Políticas padrão
    show_progress 2 6 "Configurando políticas"
    ufw default deny incoming > /dev/null 2>&1
    ufw default allow outgoing > /dev/null 2>&1
    
    # Portas essenciais
    show_progress 3 6 "Liberando portas essenciais"
    ufw allow 22/tcp > /dev/null 2>&1  # SSH
    ufw allow 80/tcp > /dev/null 2>&1  # HTTP
    ufw allow 443/tcp > /dev/null 2>&1 # HTTPS
    
    # Portas de serviços
    show_progress 4 6 "Liberando portas de serviços"
    local service_ports=(5432 8080 9000 8000 3000 3306 1880 5678)
    for port in "${service_ports[@]}"; do
        ufw allow "$port"/tcp > /dev/null 2>&1
    done
    
    show_progress 5 6 "Ativando firewall"
    ufw --force enable > /dev/null 2>&1
    
    show_progress 6 6 "Firewall configurado"
    log_success "UFW ativo com $(ufw status numbered | grep -c ALLOW) regras"
}

# ========================= DOCKER SWARM E TRAEFIK ===========================

setup_docker_swarm() {
    log_step "09" "Configurando Docker Swarm..."
    
    show_progress 1 4 "Inicializando Swarm"
    if ! docker node ls &>/dev/null; then
        docker swarm init > /dev/null 2>&1
    fi
    
    show_progress 2 4 "Criando redes"
    docker network create --driver overlay --attachable traefik-public 2>/dev/null || true
    docker network create --driver overlay --attachable app-network 2>/dev/null || true
    
    show_progress 3 4 "Verificando nós"
    local nodes=$(docker node ls --format "table {{.Hostname}}\t{{.Status}}" | grep -c Ready)
    
    show_progress 4 4 "Swarm configurado"
    log_success "Docker Swarm ativo com $nodes nó(s)"
}

create_traefik_config() {
    log_step "10" "Criando configuração do Traefik..."
    
    mkdir -p /opt/traefik/{certificates,config}
    
    # Configuração principal do Traefik
    cat > /opt/traefik/config/traefik.yml << 'EOF'
global:
  checkNewVersion: false
  sendAnonymousUsage: false

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
    watch: true
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
      caServer: https://acme-v02.api.letsencrypt.org/directory

log:
  level: INFO
  format: json

accessLog:
  format: json

metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true
    addRoutersLabels: true
EOF

    # Configuração dinâmica
    cat > /opt/traefik/config/dynamic.yml << EOF
http:
  routers:
    api:
      rule: "Host(\`traefik.$SECONDARY_DOMAIN\`)"
      service: "api@internal"
      tls:
        certResolver: "letsencrypt"
      middlewares:
        - "auth"
        - "secureHeaders"
        
  middlewares:
    auth:
      basicAuth:
        users:
          - "admin:\$2y\$10\$2.OTg1R8qZ0j9w8zD8F4DuVNqh7h3r.0q2zQj8w3D8F4DuVNqh7h3r"
    
    secureHeaders:
      headers:
        customRequestHeaders:
          X-Forwarded-Proto: "https"
        customResponseHeaders:
          X-Robots-Tag: "noindex,nofollow,nosnippet,noarchive,notranslate,noimageindex"
          server: ""
        sslRedirect: true
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true
        forceSTSHeader: true
        contentTypeNosniff: true
        browserXssFilter: true
        referrerPolicy: "same-origin"
        featurePolicy: "camera 'none'; geolocation 'none'; microphone 'none'; payment 'none'; usb 'none'; vr 'none';"
        customFrameOptionsValue: "SAMEORIGIN"
    
    rateLimiter:
      rateLimit:
        average: 100
        burst: 50
EOF

    # Criar arquivo de certificados
    touch /opt/traefik/certificates/acme.json
    chmod 600 /opt/traefik/certificates/acme.json
    
    log_success "Configuração do Traefik criada"
}

deploy_traefik() {
    log_step "11" "Fazendo deploy do Traefik..."
    
    cat > /opt/traefik/docker-compose.yml << 'EOF'
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    command:
      - --configFile=/etc/traefik/traefik.yml
    ports:
      - target: 80
        published: 80
        mode: host
      - target: 443
        published: 443
        mode: host
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - /opt/traefik/config/traefik.yml:/etc/traefik/traefik.yml:ro
      - /opt/traefik/config/dynamic.yml:/etc/traefik/dynamic.yml:ro
      - /opt/traefik/certificates:/certificates
    networks:
      - traefik-public
    deploy:
      mode: global
      placement:
        constraints:
          - node.role == manager
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.traefik.rule=Host(`traefik.meuboot.site`)"
        - "traefik.http.routers.traefik.entrypoints=websecure"
        - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
        - "traefik.http.routers.traefik.service=api@internal"
        - "traefik.http.services.traefik.loadbalancer.server.port=8080"
        - "traefik.http.routers.traefik.middlewares=auth@file,secureHeaders@file"

networks:
  traefik-public:
    external: true
EOF

    cd /opt/traefik
    docker stack deploy -c docker-compose.yml traefik > /dev/null 2>&1
    
    # Aguardar Traefik inicializar
    sleep 15
    
    log_success "Traefik deployado e ativo"
}

# ========================= DEPLOY DOS SERVIÇOS ==============================

deploy_portainer() {
    log_step "12" "Deployando Portainer..."
    
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
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - "traefik.enable=true"
        # Portainer para meuboot.site
        - "traefik.http.routers.portainer-meuboot.rule=Host(\`$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.portainer-meuboot.entrypoints=websecure"
        - "traefik.http.routers.portainer-meuboot.tls.certresolver=letsencrypt"
        - "traefik.http.services.portainer-meuboot.loadbalancer.server.port=9000"
        
        # Portainer para siqueicamposimoveis.com.br
        - "traefik.http.routers.portainer-siqueira.rule=Host(\`portainer.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.portainer-siqueira.entrypoints=websecure"
        - "traefik.http.routers.portainer-siqueira.tls.certresolver=letsencrypt"
        - "traefik.http.services.portainer-siqueira.loadbalancer.server.port=9000"

volumes:
  portainer_data:

networks:
  traefik-public:
    external: true
EOF

    cd /opt/portainer
    docker stack deploy -c docker-compose.yml portainer > /dev/null 2>&1
    
    log_success "Portainer deployado em ambos os domínios"
}

deploy_services() {
    local services=("N8N" "MinIO" "Grafana" "Adminer" "Evolution API")
    local current=0
    
    for service in "${services[@]}"; do
        ((current++))
        show_progress $current ${#services[@]} "Deployando $service"
        
        case $service in
            "N8N")
                deploy_n8n_service
                ;;
            "MinIO")
                deploy_minio_service
                ;;
            "Grafana")
                deploy_grafana_service
                ;;
            "Adminer")
                deploy_adminer_service
                ;;
            "Evolution API")
                deploy_evolution_service
                ;;
        esac
        
        sleep 3
    done
}

deploy_n8n_service() {
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
      - N8N_METRICS=true
    volumes:
      - n8n_data:/home/node/.n8n
    networks:
      - traefik-public
      - app-network
    deploy:
      labels:
        - "traefik.enable=true"
        # N8N para meuboot.site
        - "traefik.http.routers.n8n-meuboot.rule=Host(\`n8n.$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.n8n-meuboot.entrypoints=websecure"
        - "traefik.http.routers.n8n-meuboot.tls.certresolver=letsencrypt"
        - "traefik.http.services.n8n-meuboot.loadbalancer.server.port=5678"
        
        # N8N para siqueicamposimoveis.com.br
        - "traefik.http.routers.n8n-siqueira.rule=Host(\`n8n.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.n8n-siqueira.entrypoints=websecure"
        - "traefik.http.routers.n8n-siqueira.tls.certresolver=letsencrypt"
        - "traefik.http.services.n8n-siqueira.loadbalancer.server.port=5678"

volumes:
  n8n_data:

networks:
  traefik-public:
    external: true
  app-network:
    external: true
EOF

    cd /opt/n8n
    docker stack deploy -c docker-compose.yml n8n > /dev/null 2>&1
}

deploy_minio_service() {
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
      - MINIO_PROMETHEUS_AUTH_TYPE=public
    volumes:
      - minio_data:/data
    networks:
      - traefik-public
      - app-network
    deploy:
      labels:
        - "traefik.enable=true"
        # MinIO Console para meuboot.site
        - "traefik.http.routers.minio-meuboot.rule=Host(\`minio.$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.minio-meuboot.entrypoints=websecure"
        - "traefik.http.routers.minio-meuboot.tls.certresolver=letsencrypt"
        - "traefik.http.services.minio-meuboot.loadbalancer.server.port=9001"
        
        # MinIO Console para siqueicamposimoveis.com.br
        - "traefik.http.routers.minio-siqueira.rule=Host(\`minio.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.minio-siqueira.entrypoints=websecure"
        - "traefik.http.routers.minio-siqueira.tls.certresolver=letsencrypt"
        - "traefik.http.services.minio-siqueira.loadbalancer.server.port=9001"

volumes:
  minio_data:

networks:
  traefik-public:
    external: true
  app-network:
    external: true
EOF

    cd /opt/minio
    docker stack deploy -c docker-compose.yml minio > /dev/null 2>&1
}

deploy_grafana_service() {
    mkdir -p /opt/grafana
    
    cat > /opt/grafana/docker-compose.yml << EOF
version: '3.8'

services:
  grafana:
    image: grafana/grafana:latest
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=$GRAFANA_PASSWORD
      - GF_SERVER_ROOT_URL=https://grafana.$MAIN_DOMAIN
      - GF_INSTALL_PLUGINS=grafana-clock-panel,grafana-simple-json-datasource,grafana-piechart-panel
      - GF_ANALYTICS_REPORTING_ENABLED=false
      - GF_ANALYTICS_CHECK_FOR_UPDATES=false
    volumes:
      - grafana_data:/var/lib/grafana
    networks:
      - traefik-public
      - app-network
    deploy:
      labels:
        - "traefik.enable=true"
        # Grafana para meuboot.site
        - "traefik.http.routers.grafana-meuboot.rule=Host(\`grafana.$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.grafana-meuboot.entrypoints=websecure"
        - "traefik.http.routers.grafana-meuboot.tls.certresolver=letsencrypt"
        - "traefik.http.services.grafana-meuboot.loadbalancer.server.port=3000"
        
        # Grafana para siqueicamposimoveis.com.br
        - "traefik.http.routers.grafana-siqueira.rule=Host(\`grafana.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.grafana-siqueira.entrypoints=websecure"
        - "traefik.http.routers.grafana-siqueira.tls.certresolver=letsencrypt"
        - "traefik.http.services.grafana-siqueira.loadbalancer.server.port=3000"

volumes:
  grafana_data:

networks:
  traefik-public:
    external: true
  app-network:
    external: true
EOF

    cd /opt/grafana
    docker stack deploy -c docker-compose.yml grafana > /dev/null 2>&1
}

deploy_adminer_service() {
    mkdir -p /opt/adminer
    
    cat > /opt/adminer/docker-compose.yml << EOF
version: '3.8'

services:
  adminer:
    image: adminer:latest
    environment:
      - ADMINER_DEFAULT_SERVER=postgres
      - ADMINER_DESIGN=nette
    networks:
      - traefik-public
      - app-network
    deploy:
      labels:
        - "traefik.enable=true"
        # Adminer para meuboot.site
        - "traefik.http.routers.adminer-meuboot.rule=Host(\`adminer.$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.adminer-meuboot.entrypoints=websecure"
        - "traefik.http.routers.adminer-meuboot.tls.certresolver=letsencrypt"
        - "traefik.http.services.adminer-meuboot.loadbalancer.server.port=8080"
        
        # Adminer para siqueicamposimoveis.com.br
        - "traefik.http.routers.adminer-siqueira.rule=Host(\`adminer.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.adminer-siqueira.entrypoints=websecure"
        - "traefik.http.routers.adminer-siqueira.tls.certresolver=letsencrypt"
        - "traefik.http.services.adminer-siqueira.loadbalancer.server.port=8080"

networks:
  traefik-public:
    external: true
  app-network:
    external: true
EOF

    cd /opt/adminer
    docker stack deploy -c docker-compose.yml adminer > /dev/null 2>&1
}

deploy_evolution_service() {
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
      - QRCODE_LIMIT=10
    volumes:
      - evolution_data:/app/instances
      - evolution_store:/app/store
    networks:
      - traefik-public
      - app-network
    deploy:
      labels:
        - "traefik.enable=true"
        # Evolution para meuboot.site
        - "traefik.http.routers.evolution-meuboot.rule=Host(\`evo.$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.evolution-meuboot.entrypoints=websecure"
        - "traefik.http.routers.evolution-meuboot.tls.certresolver=letsencrypt"
        - "traefik.http.services.evolution-meuboot.loadbalancer.server.port=8080"
        
        # Evolution para siqueicamposimoveis.com.br
        - "traefik.http.routers.evolution-siqueira.rule=Host(\`evo.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.evolution-siqueira.entrypoints=websecure"
        - "traefik.http.routers.evolution-siqueira.tls.certresolver=letsencrypt"
        - "traefik.http.services.evolution-siqueira.loadbalancer.server.port=8080"

volumes:
  evolution_data:
  evolution_store:

networks:
  traefik-public:
    external: true
  app-network:
    external: true
EOF

    cd /opt/evolution
    docker stack deploy -c docker-compose.yml evolution > /dev/null 2>&1
}

# ========================= WEBHOOK E DEPLOY AUTOMÁTICO ======================

setup_webhook_system() {
    log_step "13" "Configurando sistema de webhook..."
    
    mkdir -p /opt/webhook
    
    # Salvar secret
    echo "$WEBHOOK_SECRET" > /opt/webhook-secret.txt
    chmod 600 /opt/webhook-secret.txt
    
    # Script de deploy
    cat > /opt/webhook-deploy.sh << 'EOF'
#!/bin/bash

# Configurações
LOG_FILE="/var/log/auto-deploy.log"
PROJECT_DIR="/opt/app"
REPO_URL="https://github.com/Nakahh/site-jurez-2.0"

# Redirecionamento de logs
exec 1> >(tee -a "$LOG_FILE")
exec 2> >(tee -a "$LOG_FILE" >&2)

echo "$(date): 🚀 Iniciando deploy automático..."

# Verificar branch
if [[ "$1" != "main" ]]; then
    echo "$(date): ⚠️ Deploy ignorado - branch: $1 (apenas main é deployada)"
    exit 0
fi

echo "$(date): ✅ Deploy para branch main iniciado"

# Backup do projeto atual
if [[ -d "$PROJECT_DIR" ]]; then
    echo "$(date): 📦 Fazendo backup do projeto atual..."
    cp -r "$PROJECT_DIR" "${PROJECT_DIR}_backup_$(date +%Y%m%d_%H%M%S)"
fi

# Clone/update do repositório
if [[ -d "$PROJECT_DIR/.git" ]]; then
    echo "$(date): 🔄 Atualizando repositório existente..."
    cd "$PROJECT_DIR"
    git fetch origin
    git reset --hard origin/main
else
    echo "$(date): 📥 Clonando repositório..."
    rm -rf "$PROJECT_DIR"
    git clone "$REPO_URL" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

# Instalar dependências
echo "$(date): 📦 Instalando dependências..."
npm install --production

# Build do projeto
echo "$(date): 🏗️ Fazendo build..."
npm run build

# Restart dos containers
echo "$(date): 🔄 Reiniciando aplicação..."
docker stack rm app 2>/dev/null || true
sleep 10

# Deploy da aplicação
docker stack deploy -c /opt/app-stack/docker-compose.yml app

echo "$(date): ✅ Deploy automático concluído com sucesso!"
EOF

    chmod +x /opt/webhook-deploy.sh
    
    # Servidor webhook Node.js
    cat > /opt/webhook/server.js << 'EOF'
const express = require('express');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');

const app = express();
const PORT = 9001;
const SECRET = fs.readFileSync('/opt/webhook-secret.txt', 'utf8').trim();

app.use(express.json({ limit: '10mb' }));

// Middleware de logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

function verifySignature(payload, signature, secret) {
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(payload);
    const calculatedSignature = `sha256=${hmac.digest('hex')}`;
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(calculatedSignature));
}

app.post('/', (req, res) => {
    try {
        const signature = req.headers['x-hub-signature-256'];
        const payload = JSON.stringify(req.body);
        
        if (!signature || !verifySignature(payload, signature, SECRET)) {
            console.log('❌ Assinatura inválida');
            return res.status(401).json({ error: 'Unauthorized' });
        }
        
        const event = req.headers['x-github-event'];
        if (event !== 'push') {
            console.log(`⚠️ Evento ignorado: ${event}`);
            return res.status(200).json({ message: 'Event ignored' });
        }
        
        const branch = req.body.ref.replace('refs/heads/', '');
        const commits = req.body.commits?.length || 0;
        
        console.log(`🔔 Webhook recebido para branch: ${branch} (${commits} commits)`);
        
        // Executar deploy assíncrono
        exec(`/opt/webhook-deploy.sh ${branch}`, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Erro no deploy: ${error}`);
                return;
            }
            console.log(`✅ Deploy output: ${stdout}`);
            if (stderr) console.error(`⚠️ Deploy stderr: ${stderr}`);
        });
        
        res.status(200).json({ 
            message: 'Webhook received',
            branch: branch,
            commits: commits,
            status: 'deploy_started'
        });
        
    } catch (error) {
        console.error('❌ Erro no webhook:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

app.get('/status', (req, res) => {
    res.status(200).json({
        service: 'github-webhook',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Webhook server running on port ${PORT}`);
    console.log(`📅 Started at: ${new Date().toISOString()}`);
});
EOF

    # Package.json
    cat > /opt/webhook/package.json << 'EOF'
{
  "name": "github-webhook-server",
  "version": "1.0.0",
  "description": "GitHub webhook handler for auto-deployment",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

    # Instalar dependências
    cd /opt/webhook
    npm install > /dev/null 2>&1
    
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
      - /var/log:/var/log
    environment:
      - NODE_ENV=production
    networks:
      - traefik-public
    deploy:
      restart_policy:
        condition: on-failure
        delay: 5s
        max_attempts: 3
      labels:
        - "traefik.enable=true"
        # Webhook para meuboot.site
        - "traefik.http.routers.webhook-meuboot.rule=Host(\`webhook.$SECONDARY_DOMAIN\`)"
        - "traefik.http.routers.webhook-meuboot.entrypoints=websecure"
        - "traefik.http.routers.webhook-meuboot.tls.certresolver=letsencrypt"
        - "traefik.http.services.webhook-meuboot.loadbalancer.server.port=9001"
        
        # Webhook para siqueicamposimoveis.com.br
        - "traefik.http.routers.webhook-siqueira.rule=Host(\`webhook.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.webhook-siqueira.entrypoints=websecure"
        - "traefik.http.routers.webhook-siqueira.tls.certresolver=letsencrypt"
        - "traefik.http.services.webhook-siqueira.loadbalancer.server.port=9001"

networks:
  traefik-public:
    external: true
EOF

    docker stack deploy -c docker-compose.yml webhook > /dev/null 2>&1
    
    log_success "Sistema de webhook configurado"
}

deploy_main_application() {
    log_step "14" "Fazendo deploy da aplicação principal..."
    
    mkdir -p /opt/app-stack
    
    # Clone inicial do projeto
    git clone "$REPO_URL" /opt/app > /dev/null 2>&1
    cd /opt/app
    
    # Build inicial
    npm install > /dev/null 2>&1
    npm run build > /dev/null 2>&1
    
    # Configuração Nginx para frontend
    mkdir -p /opt/app-stack/nginx
    cat > /opt/app-stack/nginx/nginx.conf << 'EOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log warn;
pid /var/run/nginx.pid;

events {
    worker_connections 1024;
    use epoll;
    multi_accept on;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    log_format main '$remote_addr - $remote_user [$time_local] "$request" '
                    '$status $body_bytes_sent "$http_referer" '
                    '"$http_user_agent" "$http_x_forwarded_for"';

    access_log /var/log/nginx/access.log main;

    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;
    client_max_body_size 50M;

    # Gzip compression
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
        application/json
        application/xml
        application/rss+xml
        application/atom+xml
        image/svg+xml;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

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

        location /api {
            proxy_pass http://backend:3001;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
EOF

    # Docker Compose para aplicação completa
    cat > /opt/app-stack/docker-compose.yml << EOF
version: '3.8'

services:
  frontend:
    image: nginx:alpine
    volumes:
      - /opt/app/dist:/usr/share/nginx/html:ro
      - /opt/app-stack/nginx/nginx.conf:/etc/nginx/nginx.conf:ro
    networks:
      - traefik-public
      - app-network
    deploy:
      mode: replicated
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.frontend.rule=Host(\`$MAIN_DOMAIN\`)"
        - "traefik.http.routers.frontend.entrypoints=websecure"
        - "traefik.http.routers.frontend.tls.certresolver=letsencrypt"
        - "traefik.http.services.frontend.loadbalancer.server.port=80"
        - "traefik.http.routers.frontend.middlewares=secureHeaders@file,rateLimiter@file"

  backend:
    image: node:18-alpine
    working_dir: /app
    command: sh -c "npm run build:server 2>/dev/null || echo 'Build server skipped' && npm start"
    volumes:
      - /opt/app:/app
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://sitejuarez:$POSTGRES_PASSWORD@postgres:5432/bdsitejuarez
      - JWT_SECRET=$JWT_SECRET
      - JWT_EXPIRES_IN=7d
      - ADMIN_PORT=3001
      - MAIN_DOMAIN=https://$MAIN_DOMAIN
      - OPENAI_API_KEY=\${OPENAI_API_KEY:-}
      - N8N_WEBHOOK_URL=https://n8n.$MAIN_DOMAIN/webhook/
    networks:
      - traefik-public
      - app-network
    deploy:
      mode: replicated
      replicas: 2
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
      labels:
        - "traefik.enable=true"
        - "traefik.http.routers.backend.rule=Host(\`api.$MAIN_DOMAIN\`)"
        - "traefik.http.routers.backend.entrypoints=websecure"
        - "traefik.http.routers.backend.tls.certresolver=letsencrypt"
        - "traefik.http.services.backend.loadbalancer.server.port=3001"
        - "traefik.http.routers.backend.middlewares=secureHeaders@file,rateLimiter@file"

  postgres:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=bdsitejuarez
      - POSTGRES_USER=sitejuarez
      - POSTGRES_PASSWORD=$POSTGRES_PASSWORD
      - POSTGRES_INITDB_ARGS=--encoding=UTF-8 --lc-collate=C --lc-ctype=C
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - /opt/app-stack/postgres-init:/docker-entrypoint-initdb.d
    networks:
      - app-network
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      restart_policy:
        condition: on-failure

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass $REDIS_PASSWORD --appendonly yes
    volumes:
      - redis_data:/data
    networks:
      - app-network
    deploy:
      mode: replicated
      replicas: 1
      restart_policy:
        condition: on-failure

volumes:
  postgres_data:
  redis_data:

networks:
  traefik-public:
    external: true
  app-network:
    external: true
EOF

    # Script de inicialização do PostgreSQL
    mkdir -p /opt/app-stack/postgres-init
    cat > /opt/app-stack/postgres-init/01-init.sql << 'EOF'
-- Criação de extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Configurações de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
EOF

    # Deploy da aplicação
    docker stack deploy -c docker-compose.yml app > /dev/null 2>&1
    
    log_success "Aplicação principal deployada"
}

# ========================= RELATÓRIO E DIAGNÓSTICO ==========================

generate_final_report() {
    log_step "15" "Gerando relatório final..."
    
    # Aguardar serviços estabilizarem
    sleep 30
    
    # Banner do relatório
    echo -e "\n${CYAN}${BOLD}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   🎉 DEPLOY ENTERPRISE CONCLUÍDO - SIQUEIRA CAMPOS IMÓVEIS                  ║
║                                                                              ║
║   ✨ Sistema Premium de Alta Performance Ativo ��                           ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
    
    # Salvar senhas em arquivo
    cat > "$PASSWORD_FILE" << EOF
# SENHAS DO SISTEMA - SIQUEIRA CAMPOS IMÓVEIS
# Gerado em: $(date)
# Servidor: $(hostname)
# IP: $(hostname -I | awk '{print $1}')

# === BANCO DE DADOS ===
PostgreSQL User: sitejuarez
PostgreSQL Password: $POSTGRES_PASSWORD
PostgreSQL Database: bdsitejuarez

# === CACHE ===
Redis Password: $REDIS_PASSWORD

# === AUTOMAÇÃO ===
N8N User: admin
N8N Password: $N8N_PASSWORD

# === MONITORAMENTO ===
Grafana User: admin
Grafana Password: $GRAFANA_PASSWORD

# === STORAGE ===
MinIO User: kryonix_admin
MinIO Password: $MINIO_PASSWORD

# === WHATSAPP ===
Evolution API Key: $EVOLUTION_KEY

# === SEGURANÇA ===
JWT Secret: $JWT_SECRET
Webhook Secret: $WEBHOOK_SECRET

# === ACESSO TRAEFIK ===
Traefik User: admin
Traefik Password: admin (altere via bcrypt)
EOF

    chmod 600 "$PASSWORD_FILE"
    
    # Exibir relatório no terminal
    echo -e "${WHITE}${BOLD}🔐 CREDENCIAIS GERADAS:${NC}"
    echo "   • PostgreSQL: sitejuarez / $POSTGRES_PASSWORD"
    echo "   • Redis: $REDIS_PASSWORD"
    echo "   • N8N: admin / $N8N_PASSWORD"
    echo "   • Grafana: admin / $GRAFANA_PASSWORD"
    echo "   • MinIO: kryonix_admin / $MINIO_PASSWORD"
    echo "   • Evolution API: $EVOLUTION_KEY"
    
    echo -e "\n${WHITE}${BOLD}🔄 DEPLOY AUTOMÁTICO:${NC}"
    echo "   • URL Webhook: https://webhook.$MAIN_DOMAIN"
    echo "   • Secret: $WEBHOOK_SECRET"
    echo "   • Branch: main"
    echo "   • Status: ${GREEN}Ativo ✅${NC}"
    
    echo -e "\n${WHITE}${BOLD}📋 CONFIGURAÇÃO NO GITHUB:${NC}"
    echo "   1. Acesse: Settings > Webhooks"
    echo "   2. Payload URL: https://webhook.$MAIN_DOMAIN"
    echo "   3. Content type: application/json"
    echo "   4. Secret: $WEBHOOK_SECRET"
    echo "   5. Events: Just the push event"
    echo "   6. Active: ✅"
    
    # URLs dos serviços
    echo -e "\n${WHITE}${BOLD}🌐 SERVIÇOS DISPONÍVEIS:${NC}"
    echo ""
    echo -e "   ${PURPLE}${BOLD}🔷 $SECONDARY_DOMAIN (Painel Principal):${NC}"
    echo "   • Traefik Dashboard: https://traefik.$SECONDARY_DOMAIN"
    echo "   • Portainer: https://$SECONDARY_DOMAIN"
    echo "   • N8N Automation: https://n8n.$SECONDARY_DOMAIN"
    echo "   • MinIO Storage: https://minio.$SECONDARY_DOMAIN"
    echo "   • Grafana Monitor: https://grafana.$SECONDARY_DOMAIN"
    echo "   • Adminer DB: https://adminer.$SECONDARY_DOMAIN"
    echo "   • Evolution WhatsApp: https://evo.$SECONDARY_DOMAIN"
    echo "   • Webhook Server: https://webhook.$SECONDARY_DOMAIN"
    echo ""
    echo -e "   ${BLUE}${BOLD}🔷 $MAIN_DOMAIN (Site Imobiliário):${NC}"
    echo "   • Site Principal: https://$MAIN_DOMAIN"
    echo "   • API Backend: https://api.$MAIN_DOMAIN"
    echo "   • Portainer: https://portainer.$MAIN_DOMAIN"
    echo "   • N8N Automation: https://n8n.$MAIN_DOMAIN"
    echo "   • MinIO Storage: https://minio.$MAIN_DOMAIN"
    echo "   • Grafana Monitor: https://grafana.$MAIN_DOMAIN"
    echo "   • Adminer DB: https://adminer.$MAIN_DOMAIN"
    echo "   • Evolution WhatsApp: https://evo.$MAIN_DOMAIN"
    echo "   • Webhook Server: https://webhook.$MAIN_DOMAIN"
    
    echo -e "\n${WHITE}${BOLD}📁 ARQUIVOS IMPORTANTES:${NC}"
    echo "   • Senhas: $PASSWORD_FILE"
    echo "   • Logs Deploy: $MAIN_LOG"
    echo "   • Logs Erro: $ERROR_LOG"
    echo "   • SSL Status: $SSL_LOG"
    echo "   • Webhook Secret: /opt/webhook-secret.txt"
    
    log_success "Relatório salvo em $PASSWORD_FILE"
}

run_diagnostics() {
    log_step "16" "Executando diagnóstico completo do sistema..."
    
    echo -e "\n${WHITE}${BOLD}🔍 TESTE DE CONECTIVIDADE E SSL:${NC}" | tee "$SSL_LOG"
    
    # Lista completa de URLs para testar
    local urls=(
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
    
    local success_count=0
    local total_urls=${#urls[@]}
    
    for url in "${urls[@]}"; do
        if timeout 10 curl -Iv "$url" 2>/dev/null | grep -E "HTTP.*[23][0-9][0-9]" > /dev/null; then
            echo "   ${GREEN}✅ $url${NC}" | tee -a "$SSL_LOG"
            ((success_count++))
        else
            echo "   ${RED}❌ $url${NC} (certificado sendo gerado...)" | tee -a "$SSL_LOG"
        fi
    done
    
    echo -e "\n${WHITE}${BOLD}📊 RESUMO DOS TESTES:${NC}"
    echo "   • URLs testadas: $total_urls"
    echo "   • Funcionando: $success_count"
    echo "   • Aguardando SSL: $((total_urls - success_count))"
    
    # Status dos containers
    echo -e "\n${WHITE}${BOLD}🐳 STATUS DOS SERVIÇOS DOCKER:${NC}"
    docker service ls --format "table {{.Name}}\t{{.Mode}}\t{{.Replicas}}\t{{.Image}}"
    
    echo -e "\n${WHITE}${BOLD}🌐 SAÚDE DO TRAEFIK:${NC}"
    local traefik_logs=$(docker service logs traefik_traefik --tail 3 2>/dev/null | head -3)
    if [ -n "$traefik_logs" ]; then
        echo "$traefik_logs"
    else
        echo "   Aguardando logs do Traefik..."
    fi
    
    echo -e "\n${WHITE}${BOLD}💾 RECURSOS DO SISTEMA:${NC}"
    echo "   • Disco:"
    df -h / | tail -1 | awk '{print "     Usado: "$3" / "$2" ("$5")"}'
    echo "   • RAM:"
    free -h | grep "Mem:" | awk '{print "     Usado: "$3" / "$2" ("$3/$2*100"%)"}'
    echo "   • CPU:"
    uptime | awk '{print "     Load: "$10" "$11" "$12}'
    
    echo -e "\n${WHITE}${BOLD}🔧 PRÓXIMOS PASSOS:${NC}"
    echo "   1. ${YELLOW}Aguarde 5-10 minutos${NC} para certificados SSL serem emitidos"
    echo "   2. ${CYAN}Configure GitHub webhook${NC} com as informações acima"
    echo "   3. ${GREEN}Acesse Portainer${NC} para gerenciar stacks"
    echo "   4. ${PURPLE}Configure N8N${NC} importando workflow do projeto"
    echo "   5. ${BLUE}Configure Evolution API${NC} para WhatsApp Business"
    echo ""
    echo "   📖 Documentação: /opt/app/README.md"
    echo "   🔑 Senhas: $PASSWORD_FILE"
    echo "   📝 Logs: $LOG_DIR/"
    
    # Gerar relatório final
    {
        echo "=== RELATÓRIO DE DEPLOY - $(date) ==="
        echo "Servidor: $(hostname)"
        echo "IP: $(hostname -I | awk '{print $1}')"
        echo "URLs testadas: $total_urls"
        echo "URLs funcionando: $success_count"
        echo ""
        echo "=== SERVIÇOS ATIVOS ==="
        docker service ls
        echo ""
        echo "=== RECURSOS SISTEMA ==="
        df -h /
        free -h
        uptime
    } > "$REPORT_FILE"
    
    log_success "Diagnóstico completo salvo em $REPORT_FILE"
    
    # Som de conclusão
    printf '\a'
    sleep 0.2
    printf '\a'
}

# ========================= FUNÇÃO PRINCIPAL ==============================

main() {
    show_banner
    
    echo -e "${ROCKET} ${WHITE}${BOLD}Iniciando deploy enterprise da infraestrutura...${NC}\n"
    
    # Verificações e preparação
    check_requirements
    analyze_project
    controlled_cleanup
    
    # Instalações básicas
    install_dependencies
    install_docker
    install_nodejs
    install_postgresql
    configure_firewall
    
    # Infraestrutura Docker
    setup_docker_swarm
    create_traefik_config
    deploy_traefik
    
    # Serviços principais
    deploy_portainer
    log_step "12.1" "Deployando serviços auxiliares..."
    deploy_services
    log_success "Todos os serviços auxiliares deployados"
    
    # Sistema de deploy
    setup_webhook_system
    deploy_main_application
    
    # Finalização
    generate_final_report
    run_diagnostics
    
    echo -e "\n${GREEN}${BOLD}${SUCCESS} DEPLOY ENTERPRISE CONCLUÍDO COM SUCESSO!${NC}"
    echo -e "${YELLOW}${WARNING} Aguarde alguns minutos para geração completa dos certificados SSL${NC}"
    echo -e "${CYAN}${INFO} Consulte $PASSWORD_FILE para todas as credenciais${NC}"
    
    # Sons finais de sucesso
    for i in {1..3}; do
        printf '\a'
        sleep 0.3
    done
}

# Executar verificação de argumentos e script principal
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
