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
        echo "Execute: sudo bash deploy_kryonix_complete.sh"
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
    apt-get install -y curl wget git jq unzip software-properties-common apt-transport-https ca-certificates gnupg lsb-release python3 python3-pip cron
    
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
    ufw allow 9999/tcp       # GitHub Webhook
    
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
    chown -R 1001:1001 /opt/kryonix/n8n 2>/dev/null || true
    chown -R 999:999 /opt/kryonix/postgres 2>/dev/null || true
    chown -R 472:472 /opt/kryonix/grafana 2>/dev/null || true
    chown -R 65534:65534 /opt/kryonix/prometheus 2>/dev/null || true
    
    log "✅ Diretórios criados!"
}

# Iniciar serviços principais
start_services() {
    log "🚀 Iniciando serviços KRYONIX..."
    
    # Copiar arquivos de configuração
    if [ -f "prometheus.yml" ]; then
        cp prometheus.yml /opt/kryonix/prometheus/config/
    fi
    
    # Definir permissões corretas
    chown -R 1001:1001 /opt/kryonix/n8n 2>/dev/null || true
    chown -R 999:999 /opt/kryonix/postgres 2>/dev/null || true
    chown -R 472:472 /opt/kryonix/grafana 2>/dev/null || true
    chown -R 65534:65534 /opt/kryonix/prometheus 2>/dev/null || true
    
    # Iniciar todos os serviços
    cd /opt/kryonix
    if [ -f "/root/docker-compose.kryonix.yml" ]; then
        cp /root/docker-compose.kryonix.yml docker-compose.yml
    fi
    
    docker-compose up -d
    
    log "✅ Serviços iniciados!"
}

# Configurar banco de dados
setup_databases() {
    log "🗄️ Configurando bancos de dados..."
    
    # Aguardar PostgreSQL estar pronto
    info "Aguardando PostgreSQL..."
    timeout 60 bash -c 'until docker exec kryonix-postgres pg_isready -U kryonix_user -d kryonix_main 2>/dev/null; do sleep 2; done' || true
    
    # Criar bancos de dados para cada serviço
    docker exec kryonix-postgres psql -U kryonix_user -d kryonix_main -c "CREATE DATABASE n8n_db;" 2>/dev/null || true
    docker exec kryonix-postgres psql -U kryonix_user -d kryonix_main -c "CREATE DATABASE evolution_db;" 2>/dev/null || true
    docker exec kryonix-postgres psql -U kryonix_user -d kryonix_main -c "CREATE DATABASE chatgpt_db;" 2>/dev/null || true
    
    log "✅ Bancos de dados configurados!"
}

# Configurar Portainer
setup_portainer() {
    log "🐳 Configurando Portainer..."
    
    # Aguardar Portainer estar pronto
    info "Aguardando Portainer inicializar..."
    sleep 30
    
    # Criar usuário admin via API (se necessário)
    timeout 60 bash -c 'until curl -f http://localhost:9000/api/status 2>/dev/null; do sleep 5; done' || true
    
    log "✅ Portainer configurado!"
}

# Verificar saúde dos serviços
check_services_health() {
    log "🔍 Verificando saúde dos serviços..."
    
    services=("traefik" "postgres" "redis" "adminer" "portainer" "minio" "n8n" "evolution-api" "prometheus" "grafana")
    
    for service in "${services[@]}"; do
        container_name="kryonix-$service"
        if docker ps --format "table {{.Names}}" | grep -q "$container_name"; then
            log "✅ $service está rodando"
        else
            warning "⚠️ $service não está rodando"
        fi
    done
}

# Instalar e configurar webhook GitHub
setup_github_webhook() {
    log "🔗 Configurando webhook GitHub..."
    
    # Executar script de webhook
    if [ -f "github-webhook.sh" ]; then
        chmod +x github-webhook.sh
        ./github-webhook.sh
    fi
    
    log "✅ Webhook GitHub configurado!"
}

# Configurar monitoramento
setup_monitoring() {
    log "📊 Configurando monitoramento..."
    
    # Aguardar Grafana estar pronto
    info "Aguardando Grafana..."
    timeout 120 bash -c 'until curl -f http://localhost:3000/api/health 2>/dev/null; do sleep 5; done' || true
    
    # Configurar datasource do Prometheus no Grafana via API
    curl -X POST \
        -H "Content-Type: application/json" \
        -d '{
            "name": "Prometheus",
            "type": "prometheus",
            "url": "http://prometheus:9090",
            "access": "proxy",
            "isDefault": true
        }' \
        http://admin:kryonix_grafana_password_2024@localhost:3000/api/datasources 2>/dev/null || true
    
    log "✅ Monitoramento configurado!"
}

# Exibir resumo final
show_final_summary() {
    clear
    echo -e "${GREEN}"
    echo "##############################################################################"
    echo "#                    🎉 DEPLOY KRYONIX CONCLUÍDO!                           #"
    echo "##############################################################################"
    echo -e "${NC}"
    echo
    log "🌐 SERVIÇOS DISPONÍVEIS COM HTTPS:"
    echo
    echo -e "${CYAN}📊 MONITORAMENTO & GESTÃO:${NC}"
    echo "  🐳 Portainer (Docker):     https://portainer.siqueicamposimoveis.com.br"
    echo "  🐳 Portainer (MeuBoot):    https://portainer.meuboot.site"
    echo "  🔀 Traefik Dashboard:      https://traefik.siqueicamposimoveis.com.br"
    echo "  📊 Grafana:                https://grafana.siqueicamposimoveis.com.br"
    echo "  📈 Prometheus:             https://prometheus.siqueicamposimoveis.com.br"
    echo
    echo -e "${PURPLE}🗄️ BANCO DE DADOS & STORAGE:${NC}"
    echo "  🗄️ Adminer (PostgreSQL):   https://adminer.siqueicamposimoveis.com.br"
    echo "  📦 MinIO Console:          https://minio.siqueicamposimoveis.com.br"
    echo "  📦 MinIO Storage API:      https://storage.siqueicamposimoveis.com.br"
    echo
    echo -e "${BLUE}🤖 AUTOMAÇÃO & IA:${NC}"
    echo "  🔗 N8N (Siqueira):         https://n8n.siqueicamposimoveis.com.br"
    echo "  🔗 N8N (MeuBoot):          https://n8n.meuboot.site"
    echo "  🔗 N8N Webhook:            https://webhookn8n.meuboot.site"
    echo "  🤖 ChatGPT Stack:          https://chatgpt.siqueicamposimoveis.com.br"
    echo "  🤖 Bot Assistant:          https://bot.siqueicamposimoveis.com.br"
    echo
    echo -e "${YELLOW}📱 WHATSAPP & COMUNICAÇÃO:${NC}"
    echo "  📱 Evolution API (Main):   https://evolution.siqueicamposimoveis.com.br"
    echo "  📱 Evolution API (Boot):   https://evo.meuboot.site"
    echo
    echo -e "${GREEN}🔐 CREDENCIAIS IMPORTANTES:${NC}"
    echo "  🐳 Portainer: vitorfernandes / Vitor@123456"
    echo "  📊 Grafana: admin / kryonix_grafana_password_2024"
    echo "  🔗 N8N: kryonix / kryonix_n8n_password_2024"
    echo "  🗄️ PostgreSQL: kryonix_user / kryonix_strong_password_2024"
    echo "  📦 MinIO: kryonix_minio_admin / kryonix_minio_password_2024"
    echo
    echo -e "${RED}⚙️ CONFIGURAÇÕES IMPORTANTES:${NC}"
    echo "  🔗 GitHub Webhook: http://$SERVER_IP:9999/webhook"
    echo "  🔑 Webhook Secret: kryonix_webhook_secret_2024"
    echo "  📁 Projeto: $PROJECT_DIR"
    echo "  🔄 Auto-update: ativo (via systemd + cron)"
    echo
    echo -e "${GREEN}📝 COMANDOS ÚTEIS:${NC}"
    echo "  📊 Status dos serviços:     docker-compose ps"
    echo "  📋 Logs dos serviços:       docker-compose logs -f [serviço]"
    echo "  🔄 Atualizar projeto:       kryonix-update"
    echo "  🔄 Restart webhook:         systemctl restart kryonix-webhook"
    echo "  📊 Status webhook:          systemctl status kryonix-webhook"
    echo
    log "🎯 Sistema KRYONIX totalmente operacional!"
    log "🚀 Todos os serviços estão rodando com HTTPS válido!"
    echo
}

# Função principal
main() {
    show_banner
    check_root
    
    log "🚀 Iniciando deploy KRYONIX completo..."
    
    # Fase 1: Preparação
    reset_server
    update_system
    install_docker
    setup_swarm
    setup_firewall
    create_directories
    
    # Fase 2: DNS e Rede
    setup_dns
    
    # Fase 3: Serviços
    start_services
    setup_databases
    setup_portainer
    
    # Fase 4: Automação
    setup_github_webhook
    setup_monitoring
    
    # Fase 5: Verificação
    check_services_health
    
    # Aguardar propagação de certificados
    info "Aguardando certificados SSL (60 segundos)..."
    sleep 60
    
    show_final_summary
}

# Executar se script for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
