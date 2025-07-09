#!/bin/bash

##############################################################################
#                             🚀 KRYONIX DEPLOY                              #
#          Sistema de Deploy Completo e Autônomo para VPS Oracle             #
#                        Ubuntu 22.04 - Versão 1.0                          #
##############################################################################

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações principais
DOMAIN1="siqueicamposimoveis.com.br"
DOMAIN2="meuboot.site"
SERVER_IP="144.22.212.82"
PROJECT_DIR="/opt/site-jurez-2.0"
GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0"

# Configurações GoDaddy API
GODADDY_API_KEY="gHptA5P64dTz_LmKXsM49Ms7Ntiru4sSqSu"
GODADDY_API_SECRET="TdJ5fnnBQwvGEbE8Ps9MMd"

# Configurações SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="465"
SMTP_USER="vitor.nakahh@gmail.com"
SMTP_PASS="@Vitor.12345@"

# Configurações Portainer
PORTAINER_USER="vitorfernandes"
PORTAINER_PASS="Vitor@123456"

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR $(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING $(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO $(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

# Banner inicial
show_banner() {
    clear
    echo -e "${PURPLE}"
    echo "##############################################################################"
    echo "#                             🚀 KRYONIX DEPLOY                              #"
    echo "#          Sistema de Deploy Completo e Autônomo para VPS Oracle             #"
    echo "#                        Ubuntu 22.04 - Versão 1.0                          #"
    echo "##############################################################################"
    echo -e "${NC}"
    echo
    log "Iniciando deploy KRYONIX..."
    echo
}

# Função para verificar se é root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "Este script deve ser executado como root!"
        echo "Execute: sudo bash deploy_kryonix.sh"
        exit 1
    fi
}

# Função para resetar servidor
reset_server() {
    log "🔄 Iniciando reset completo do servidor..."
    
    # Parar todos os containers Docker
    if command -v docker &> /dev/null; then
        warning "Parando todos os containers Docker..."
        docker stop $(docker ps -aq) 2>/dev/null || true
        docker rm $(docker ps -aq) 2>/dev/null || true
        docker system prune -af --volumes 2>/dev/null || true
        docker volume prune -f 2>/dev/null || true
        docker network prune -f 2>/dev/null || true
    fi
    
    # Remover Docker completamente
    warning "Removendo Docker..."
    apt-get remove -y docker docker-engine docker.io containerd runc docker-compose-plugin docker-ce docker-ce-cli containerd.io docker-buildx-plugin 2>/dev/null || true
    apt-get purge -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin 2>/dev/null || true
    rm -rf /var/lib/docker /etc/docker ~/.docker 2>/dev/null || true
    
    # Limpar processos
    warning "Limpando processos..."
    pkill -f traefik 2>/dev/null || true
    pkill -f portainer 2>/dev/null || true
    pkill -f postgres 2>/dev/null || true
    pkill -f redis 2>/dev/null || true
    pkill -f n8n 2>/dev/null || true
    
    # Remover diretórios de projetos antigos
    warning "Removendo projetos antigos..."
    rm -rf /opt/site-jurez-2.0 /opt/kryonix /var/lib/portainer /var/lib/traefik 2>/dev/null || true
    
    # Resetar firewall
    warning "Resetando firewall..."
    ufw --force reset 2>/dev/null || true
    iptables -F 2>/dev/null || true
    iptables -X 2>/dev/null || true
    iptables -t nat -F 2>/dev/null || true
    iptables -t nat -X 2>/dev/null || true
    
    log "✅ Reset do servidor concluído!"
}

# Atualizar sistema
update_system() {
    log "🔄 Atualizando sistema Ubuntu..."
    export DEBIAN_FRONTEND=noninteractive
    
    apt-get update -y
    apt-get upgrade -y
    apt-get install -y curl wget git jq unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release
    
    log "✅ Sistema atualizado!"
}

# Instalar Docker
install_docker() {
    log "🐳 Instalando Docker..."
    
    # Remover versões antigas
    apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Adicionar repositório Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Instalar Docker
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Iniciar e habilitar Docker
    systemctl start docker
    systemctl enable docker
    
    # Adicionar usuário ao grupo docker
    usermod -aG docker ubuntu 2>/dev/null || true
    
    # Instalar Docker Compose standalone
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    # Verificar instalação
    docker --version
    docker-compose --version
    
    log "✅ Docker instalado com sucesso!"
}

# Configurar Docker Swarm
setup_swarm() {
    log "🐝 Configurando Docker Swarm..."
    
    # Inicializar Swarm se não estiver ativo
    if ! docker info | grep -q "Swarm: active"; then
        docker swarm init --advertise-addr $SERVER_IP
        log "✅ Docker Swarm inicializado!"
    else
        info "Docker Swarm já está ativo"
    fi
    
    # Criar rede overlay
    docker network create -d overlay --attachable kryonixnet 2>/dev/null || true
    docker network create -d overlay --attachable meubootnet 2>/dev/null || true
    
    log "✅ Docker Swarm configurado!"
}

# Configurar firewall
setup_firewall() {
    log "🔥 Configurando firewall..."
    
    # Instalar UFW
    apt-get install -y ufw
    
    # Resetar UFW
    ufw --force reset
    
    # Configurar regras básicas
    ufw default deny incoming
    ufw default allow outgoing
    
    # Permitir SSH
    ufw allow 22/tcp
    
    # Permitir HTTP e HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Permitir portas específicas dos serviços
    ufw allow 3000:9000/tcp  # Faixa para serviços internos
    ufw allow 5432/tcp       # PostgreSQL
    ufw allow 6379/tcp       # Redis
    ufw allow 9090/tcp       # Prometheus
    ufw allow 3001/tcp       # Grafana
    ufw allow 5678/tcp       # N8N
    ufw allow 8080/tcp       # Adminer
    ufw allow 9001/tcp       # MinIO Console
    
    # Habilitar UFW
    ufw --force enable
    
    log "✅ Firewall configurado!"
}

# Configurar DNS via GoDaddy API
setup_dns() {
    log "🌐 Configurando DNS via GoDaddy API..."
    
    # Função para criar/atualizar registro DNS
    update_dns_record() {
        local domain=$1
        local subdomain=$2
        local ip=$3
        
        info "Configurando $subdomain.$domain -> $ip"
        
        # Verificar se o registro existe
        existing=$(curl -s -X GET "https://api.godaddy.com/v1/domains/$domain/records/A/$subdomain" \
            -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
            -H "Content-Type: application/json")
        
        # Criar/atualizar registro
        curl -s -X PUT "https://api.godaddy.com/v1/domains/$domain/records/A/$subdomain" \
            -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
            -H "Content-Type: application/json" \
            -d "[{\"data\":\"$ip\",\"ttl\":3600}]"
    }
    
    # Configurar DNS para siqueicamposimoveis.com.br
    info "Configurando DNS para $DOMAIN1..."
    update_dns_record "$DOMAIN1" "portainer" "$SERVER_IP"
    update_dns_record "$DOMAIN1" "traefik" "$SERVER_IP"
    update_dns_record "$DOMAIN1" "evolution" "$SERVER_IP"
    update_dns_record "$DOMAIN1" "n8n" "$SERVER_IP"
    update_dns_record "$DOMAIN1" "chatgpt" "$SERVER_IP"
    update_dns_record "$DOMAIN1" "bot" "$SERVER_IP"
    update_dns_record "$DOMAIN1" "minio" "$SERVER_IP"
    update_dns_record "$DOMAIN1" "storage" "$SERVER_IP"
    update_dns_record "$DOMAIN1" "redis" "$SERVER_IP"
    update_dns_record "$DOMAIN1" "adminer" "$SERVER_IP"
    update_dns_record "$DOMAIN1" "grafana" "$SERVER_IP"
    update_dns_record "$DOMAIN1" "prometheus" "$SERVER_IP"
    
    # Configurar DNS para meuboot.site
    info "Configurando DNS para $DOMAIN2..."
    update_dns_record "$DOMAIN2" "portainer" "$SERVER_IP"
    update_dns_record "$DOMAIN2" "n8n" "$SERVER_IP"
    update_dns_record "$DOMAIN2" "webhookn8n" "$SERVER_IP"
    update_dns_record "$DOMAIN2" "evo" "$SERVER_IP"
    
    # Aguardar propagação DNS
    info "Aguardando propagação DNS (30 segundos)..."
    sleep 30
    
    log "✅ DNS configurado!"
}

# Criar diretórios necessários
create_directories() {
    log "📁 Criando estrutura de diretórios..."
    
    mkdir -p /opt/kryonix/{traefik,portainer,postgres,redis,n8n,evolution,minio,grafana,prometheus}
    mkdir -p /opt/kryonix/traefik/{config,certs}
    mkdir -p /opt/kryonix/postgres/data
    mkdir -p /opt/kryonix/redis/data
    mkdir -p /opt/kryonix/n8n/data
    mkdir -p /opt/kryonix/evolution/data
    mkdir -p /opt/kryonix/minio/{data,config}
    mkdir -p /opt/kryonix/grafana/{data,config}
    mkdir -p /opt/kryonix/prometheus/{data,config}
    
    # Definir permissões
    chown -R 1001:1001 /opt/kryonix/n8n
    chown -R 999:999 /opt/kryonix/postgres
    chown -R 472:472 /opt/kryonix/grafana
    chown -R 65534:65534 /opt/kryonix/prometheus
    
    log "✅ Diretórios criados!"
}

# Função principal
main() {
    show_banner
    check_root
    
    log "🚀 Iniciando deploy KRYONIX..."
    
    reset_server
    update_system
    install_docker
    setup_swarm
    setup_firewall
    setup_dns
    create_directories
    
    log "🎉 Deploy básico concluído! Continuando com configuração dos serviços..."
}

# Executar se script for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
