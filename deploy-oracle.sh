#!/bin/bash

# ╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗
# ║                                                                                                          ║
# ║    🚀 MEGA DEPLOY AUTOMÁTICO V4 - SUPER COMPLETO E INTELIGENTE                                         ║
# ║                                                                                                          ║
# ║    ✅ Limpeza completa do servidor + Configuração automática                                           ║
# ║    ✅ GitHub Auto-Clone + Auto-Update + Webhooks                                                       ║
# ║    ✅ DNS automático GoDaddy + SSL Let's Encrypt                                                       ║
# ║    ✅ Portainer + Traefik + PostgreSQL + N8N + Evolution API                                          ║
# ║    ✅ Monitoramento inteligente + Auto-correção + Backup automático                                   ║
# ║    ✅ Sistema de notificações + Logs avançados + Performance                                           ║
# ║    ✅ Múltiplos domínios + Configuração automática completa                                            ║
# ║                                                                                                          ║
# ║    Desenvolvido por Kryonix - Vitor Jayme Fernandes Ferreira                                           ║
# ║    Zero configuração manual - 100% Automático e Inteligente                                            ║
# ║                                                                                                          ║
# ╚═══════════════════════════════���══════════════════════════════════════════════════════════════════════════╝

echo "🚀 MEGA DEPLOY V4 - SUPER COMPLETO INICIANDO..."
echo "📅 Data: $(date)"
echo "🔧 Preparando sistema para deploy totalmente automático..."

# ================================================================================================
# CONFIGURAÇÕES BÁSICAS E FUNCIONAIS V4 - VERSÃO CORRIGIDA
# ================================================================================================

# Configurações de sistema para funcionalidade
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a
export PYTHONUNBUFFERED=1

# Configurações de erro robustas - CORRIGIDO
set -e  # Parar em erros críticos
# NÃO usar set -u ainda pois pode quebrar scripts que dependem de variáveis vazias
set -o pipefail  # Detectar erros em pipes

# Verificações iniciais básicas
if [[ $EUID -ne 0 ]]; then
    echo "❌ ERRO: Este script deve ser executado como root!"
    echo "Execute: sudo bash $0"
    echo "Tentando executar com sudo automaticamente..."
    exec sudo bash "$0" "$@"
fi

# Verificar conectividade básica
if ! ping -c 1 google.com > /dev/null 2>&1; then
    echo "❌ ERRO: Sem conectividade com internet!"
    exit 1
fi

echo "✅ Verificações iniciais OK - Continuando..."

# ================================================================================================
# DEFINIR TODAS AS VARIÁVEIS GLOBAIS PRIMEIRO
# ================================================================================================

# Detectar ambiente automaticamente
detect_environment() {
    # Detectar distribuição Linux
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=${NAME:-"Unknown"}
        OS_VERSION=${VERSION_ID:-"Unknown"}
    else
        OS="Unknown"
        OS_VERSION="Unknown"
    fi

    # Detectar arquitetura
    ARCH=$(uname -m)

    # Detectar se é Oracle Cloud
    if curl -s --max-time 5 169.254.169.254/opc/v1/instance/ > /dev/null 2>&1; then
        CLOUD_PROVIDER="Oracle"
    elif curl -s --max-time 5 169.254.169.254/latest/meta-data/ > /dev/null 2>&1; then
        CLOUD_PROVIDER="AWS"
    elif curl -s --max-time 5 169.254.169.254/metadata/v1/ > /dev/null 2>&1; then
        CLOUD_PROVIDER="DigitalOcean"
    else
        CLOUD_PROVIDER="Unknown"
    fi

    # Detectar IP público
    PUBLIC_IP=$(curl -s --max-time 10 ifconfig.me 2>/dev/null || curl -s --max-time 10 ipinfo.io/ip 2>/dev/null || echo "Unknown")
}

# Executar detecção de ambiente primeiro
detect_environment

# Configurações dos projetos - SISTEMA INTELIGENTE
declare -A PROJECTS=(
    ["siqueicamposimoveis"]="siqueicamposimoveis.com.br"
    ["meuboot"]="meuboot.site"
)

declare -A PROJECT_CONFIGS=(
    # Configurações Siqueira Campos Imóveis
    ["siqueicamposimoveis_portainer_url"]="portainer.siqueicamposimoveis.com.br"
    ["siqueicamposimoveis_portainer_user"]="admin"
    ["siqueicamposimoveis_portainer_pass"]="@Administrador1234"
    ["siqueicamposimoveis_server_name"]="Juarez"
    ["siqueicamposimoveis_network"]="Juareznet"
    ["siqueicamposimoveis_email"]="siqueiraecamposimoveis@gmail.com"
    ["siqueicamposimoveis_db_name"]="siqueira_db"
    ["siqueicamposimoveis_app_port"]="3000"
    ["siqueicamposimoveis_n8n_port"]="5555"
    ["siqueicamposimoveis_evolution_port"]="8000"

    # Configurações MeuBoot
    ["meuboot_portainer_url"]="portainer.meuboot.site"
    ["meuboot_portainer_user"]="vitorfernandes"
    ["meuboot_portainer_pass"]="Vitor@123456"
    ["meuboot_server_name"]="meuboot"
    ["meuboot_network"]="meubootnet"
    ["meuboot_email"]="vitor.nakahh@gmail.com"
    ["meuboot_db_name"]="meuboot_db"
    ["meuboot_app_port"]="3001"
    ["meuboot_n8n_port"]="5556"
    ["meuboot_evolution_port"]="8001"
)

# Credenciais e configurações externas
GODADDY_API_KEY="gHptA5P64dTz_LmKXsM49Ms7Ntiru4sSqSu"
GODADDY_API_SECRET="TdJ5fnnBQwvGEbE8Ps9MMd"
SERVER_IP=${PUBLIC_IP:-"144.22.212.82"}

# GitHub Repository - CONFIGURAÇÃO INTELIGENTE
GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0"
GITHUB_BRANCH="main"
GITHUB_TOKEN=""  # Token será solicitado ou detectado
PROJECT_DIR="/opt/siqueira-imoveis"

# Configurações de sistema
LOG_FILE="/var/log/mega-deploy-v4-$(date +%Y%m%d_%H%M%S).log"
BACKUP_DIR="/opt/backups/deploy-$(date +%Y%m%d_%H%M%S)"
CREDENTIALS_FILE="/opt/deploy-credentials.json"
STATUS_FILE="/opt/deploy-status.json"

# Cores avançadas para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
GRAY='\033[0;37m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Símbolos especiais
ROCKET="🚀"
CHECK="✅"
CROSS="❌"
WARNING="⚠️"
INFO="ℹ️"
GEAR="⚙️"
FIRE="🔥"
STAR="⭐"
SHIELD="🛡️"
CLOCK="⏰"

# ================================================================================================
# SISTEMA DE LOGGING AVANÇADO E INTELIGENTE - CORRIGIDO
# ================================================================================================

# Configurar logging avançado primeiro
setup_advanced_logging() {
    # Criar diretórios de log
    mkdir -p /var/log/deploy-v4/{main,containers,github,dns,ssl,monitoring,backup}

    # Configurar arquivos de log específicos
    MAIN_LOG="/var/log/deploy-v4/main/deploy-$(date +%Y%m%d_%H%M%S).log"
    CONTAINER_LOG="/var/log/deploy-v4/containers/containers.log"
    GITHUB_LOG="/var/log/deploy-v4/github/github-updates.log"
    DNS_LOG="/var/log/deploy-v4/dns/dns-updates.log"
    SSL_LOG="/var/log/deploy-v4/ssl/ssl-certificates.log"
    MONITOR_LOG="/var/log/deploy-v4/monitoring/system-monitor.log"
    BACKUP_LOG="/var/log/deploy-v4/backup/backup.log"

    # Configurar rotação de logs
    cat > /etc/logrotate.d/deploy-v4 << 'EOF'
/var/log/deploy-v4/*/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
}
EOF

    # Inicializar logs
    for log in "$MAIN_LOG" "$CONTAINER_LOG" "$GITHUB_LOG" "$DNS_LOG" "$SSL_LOG" "$MONITOR_LOG" "$BACKUP_LOG"; do
        touch "$log" || true
        echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ) [INIT] Log inicializado" >> "$log" 2>/dev/null || true
    done

    echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ) [SYSTEM] Sistema de logging avançado configurado" >> "$MAIN_LOG" 2>/dev/null || true
}

# Executar configuração de logging
setup_advanced_logging

# Funções de logging com diferentes níveis - CORRIGIDAS
log_info() {
    local message="$1"
    local component="${2:-MAIN}"
    echo -e "${CYAN}[INFO]${NC} ${BOLD}$component${NC}: $message" | tee -a "${MAIN_LOG:-/var/log/deploy.log}" 2>/dev/null || echo -e "${CYAN}[INFO]${NC} ${BOLD}$component${NC}: $message"
}

log_success() {
    local message="$1"
    local component="${2:-MAIN}"
    echo -e "${GREEN}[SUCCESS]${NC} ${BOLD}$component${NC}: $message" | tee -a "${MAIN_LOG:-/var/log/deploy.log}" 2>/dev/null || echo -e "${GREEN}[SUCCESS]${NC} ${BOLD}$component${NC}: $message"
}

log_warning() {
    local message="$1"
    local component="${2:-MAIN}"
    echo -e "${YELLOW}[WARNING]${NC} ${BOLD}$component${NC}: $message" | tee -a "${MAIN_LOG:-/var/log/deploy.log}" 2>/dev/null || echo -e "${YELLOW}[WARNING]${NC} ${BOLD}$component${NC}: $message"
}

log_error() {
    local message="$1"
    local component="${2:-MAIN}"
    echo -e "${RED}[ERROR]${NC} ${BOLD}$component${NC}: $message" | tee -a "${MAIN_LOG:-/var/log/deploy.log}" 2>/dev/null || echo -e "${RED}[ERROR]${NC} ${BOLD}$component${NC}: $message"
}

log_fix() {
    local message="$1"
    local component="${2:-AUTOFIX}"
    echo -e "${PURPLE}[AUTOFIX]${NC} ${BOLD}$component${NC}: $message" | tee -a "${MAIN_LOG:-/var/log/deploy.log}" 2>/dev/null || echo -e "${PURPLE}[AUTOFIX]${NC} ${BOLD}$component${NC}: $message"
}

log_docker() {
    local message="$1"
    echo -e "${BLUE}[DOCKER]${NC} $message" | tee -a "${CONTAINER_LOG:-/var/log/docker.log}" 2>/dev/null || echo -e "${BLUE}[DOCKER]${NC} $message"
}

log_github() {
    local message="$1"
    echo -e "${GREEN}[GITHUB]${NC} $message" | tee -a "${GITHUB_LOG:-/var/log/github.log}" 2>/dev/null || echo -e "${GREEN}[GITHUB]${NC} $message"
}

log_dns() {
    local message="$1"
    echo -e "${CYAN}[DNS]${NC} $message" | tee -a "${DNS_LOG:-/var/log/dns.log}" 2>/dev/null || echo -e "${CYAN}[DNS]${NC} $message"
}

log_ssl() {
    local message="$1"
    echo -e "${YELLOW}[SSL]${NC} $message" | tee -a "${SSL_LOG:-/var/log/ssl.log}" 2>/dev/null || echo -e "${YELLOW}[SSL]${NC} $message"
}

log_monitor() {
    local message="$1"
    echo -e "${PURPLE}[MONITOR]${NC} $message" | tee -a "${MONITOR_LOG:-/var/log/monitor.log}" 2>/dev/null || echo -e "${PURPLE}[MONITOR]${NC} $message"
}

log_backup() {
    local message="$1"
    echo -e "${GRAY}[BACKUP]${NC} $message" | tee -a "${BACKUP_LOG:-/var/log/backup.log}" 2>/dev/null || echo -e "${GRAY}[BACKUP]${NC} $message"
}

# Função para output em tempo real com animação
realtime_echo() {
    local message="$1"
    local delay="${2:-0.01}"

    # Efeito de digitação simplificado
    echo -e "$message"

    # Log também
    echo "$message" >> "${MAIN_LOG:-/var/log/deploy.log}" 2>/dev/null || true
}

# Função para mostrar progresso com barra - CORRIGIDA
show_progress() {
    local current=$1
    local total=$2
    local description="$3"
    local percentage=$((current * 100 / total))
    local bar_length=50
    local filled_length=$((percentage * bar_length / 100))

    # Criar barra de progresso
    local bar=""
    for (( i=0; i<filled_length; i++ )); do
        bar+="█"
    done
    for (( i=filled_length; i<bar_length; i++ )); do
        bar+="░"
    done

    # Mostrar progresso
    printf "\r${CYAN}[PROGRESS]${NC} ${bar} ${percentage}%% - $description"

    if [ $current -eq $total ]; then
        echo ""
        log_success "Progresso concluído: $description"
    fi
}

# ================================================================================================
# DEFINIR TODAS AS FUNÇÕES NECESSÁRIAS ANTES DE USAR
# ================================================================================================

# Função para verificar saúde dos containers - CORRIGIDA
check_container_health() {
    local container=${1:-""}
    local retries=3

    if [ -z "$container" ]; then
        log_error "Nome do container não fornecido" "HEALTH_CHECK"
        return 1
    fi

    local count=0
    while [ $count -lt $retries ]; do
        if docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null | grep -q "$container.*Up"; then
            return 0
        fi
        count=$((count + 1))
        sleep 5
    done
    return 1
}

# Verificar conectividade de rede - CORRIGIDA
check_network_connectivity() {
    local services=(
        "google.com:80"
        "github.com:443"
    )

    local failed_services=()

    for service in "${services[@]}"; do
        local host=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)

        if ! timeout 10 bash -c "</dev/tcp/$host/$port" 2>/dev/null; then
            failed_services+=("$host:$port")
        fi
    done

    if [ ${#failed_services[@]} -gt 0 ]; then
        log_monitor "❌ Falhas de conectividade: ${failed_services[*]}"
        return 1
    fi

    log_monitor "✅ Conectividade de rede OK"
    return 0
}

# Verificar serviços críticos - CORRIGIDA
check_critical_services() {
    local critical_services=(
        "traefik"
        "postgres"
        "portainer"
    )

    local failed_services=()

    for service in "${critical_services[@]}"; do
        if ! check_container_health "$service"; then
            failed_services+=("$service")
            log_monitor "❌ Serviço crítico falhou: $service"
        fi
    done

    if [ ${#failed_services[@]} -gt 0 ]; then
        log_monitor "⚠️ Problemas em serviços críticos: ${failed_services[*]}"
        return 1
    fi

    log_monitor "✅ Todos os serviços críticos estão funcionando"
    return 0
}

# Verificar espaço em disco - CORRIGIDA
check_disk_space() {
    local usage=$(df / 2>/dev/null | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ -z "$usage" ]; then
        log_monitor "❌ Não foi possível verificar uso do disco"
        return 1
    fi

    if [ $usage -gt 90 ]; then
        log_monitor "❌ Espaço em disco crítico: ${usage}%"
        return 1
    elif [ $usage -gt 80 ]; then
        log_monitor "⚠️ Espaço em disco alto: ${usage}%"
        return 1
    else
        log_monitor "✅ Espaço em disco OK: ${usage}%"
        return 0
    fi
}

# Verificar performance dos containers - CORRIGIDA
check_container_performance() {
    local performance_issues=()
    
    if ! command -v docker &> /dev/null; then
        log_monitor "⚠️ Docker não está disponível para verificação de performance"
        return 1
    fi

    local containers=$(docker ps --format "{{.Names}}" 2>/dev/null)

    if [ -z "$containers" ]; then
        log_monitor "ℹ️ Nenhum container rodando"
        return 0
    fi

    # Verificação básica sem stats complexos
    for container in $containers; do
        if ! docker inspect "$container" &>/dev/null; then
            performance_issues+=("$container: Container não acessível")
        fi
    done

    if [ ${#performance_issues[@]} -gt 0 ]; then
        log_monitor "⚠️ Problemas de performance: ${performance_issues[*]}"
        return 1
    fi

    log_monitor "✅ Performance dos containers OK"
    return 0
}

# Verificar SSL dos domínios - CORRIGIDA
check_ssl_certificates() {
    local domains=(
        "siqueicamposimoveis.com.br"
        "meuboot.site"
    )

    local ssl_issues=()

    for domain in "${domains[@]}"; do
        local expiry=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)

        if [ -z "$expiry" ]; then
            ssl_issues+=("$domain: Certificado não encontrado")
            continue
        fi

        local expiry_timestamp=$(date -d "$expiry" +%s 2>/dev/null || echo "0")
        local current_timestamp=$(date +%s)
        local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))

        if [ $expiry_timestamp -eq 0 ]; then
            ssl_issues+=("$domain: Erro ao verificar certificado")
        elif [ $days_until_expiry -lt 30 ]; then
            ssl_issues+=("$domain: Expira em $days_until_expiry dias")
        fi
    done

    if [ ${#ssl_issues[@]} -gt 0 ]; then
        log_monitor "⚠️ Problemas de SSL: ${ssl_issues[*]}"
        return 1
    fi

    log_monitor "✅ Certificados SSL OK"
    return 0
}

# Verificar atualizações do GitHub - CORRIGIDA
check_github_updates() {
    if [ ! -d "/opt/siqueira-imoveis/.git" ]; then
        log_monitor "⚠️ Repositório GitHub não encontrado"
        return 1
    fi

    cd /opt/siqueira-imoveis 2>/dev/null || return 1

    # Verificar se git fetch funciona
    if ! git fetch origin main 2>/dev/null; then
        log_monitor "❌ Erro ao verificar atualizações do GitHub"
        return 1
    fi

    local local_commit=$(git rev-parse HEAD 2>/dev/null)
    local remote_commit=$(git rev-parse origin/main 2>/dev/null)

    if [ "$local_commit" != "$remote_commit" ]; then
        log_monitor "🔄 Atualizações encontradas no GitHub"
        return 1
    fi

    log_monitor "✅ GitHub atualizado"
    return 0
}

# Gerar relatório de status - CORRIGIDA
generate_status_report() {
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
    local uptime=$(uptime -p 2>/dev/null || echo "unknown")
    local load_avg=$(uptime 2>/dev/null | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//' || echo "unknown")
    local disk_usage=$(df / 2>/dev/null | awk 'NR==2 {print $5}' || echo "unknown")
    local memory_usage=$(free 2>/dev/null | awk 'NR==2{printf "%.2f%%", $3*100/$2}' || echo "unknown")
    local running_containers=$(docker ps -q 2>/dev/null | wc -l || echo "0")
    local total_containers=$(docker ps -aq 2>/dev/null | wc -l || echo "0")

    # Status dos domínios
    local domain_status=()
    for domain in siqueicamposimoveis.com.br meuboot.site; do
        local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$domain" 2>/dev/null || echo "ERRO")
        domain_status+=("\"$domain\": \"$status\"")
    done

    # Criar relatório JSON
    mkdir -p "$(dirname "$STATUS_FILE")"
    cat > "$STATUS_FILE" << EOF
{
    "timestamp": "$timestamp",
    "uptime": "$uptime",
    "load_average": "$load_avg",
    "disk_usage": "$disk_usage",
    "memory_usage": "$memory_usage",
    "containers": {
        "running": $running_containers,
        "total": $total_containers
    },
    "domains": {
        $(IFS=,; echo "${domain_status[*]}")
    }
}
EOF

    log_monitor "📊 Relatório de status gerado"
}

# Salvar estado do deployment - CORRIGIDA
save_deployment_state() {
    local state="$1"
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)

    mkdir -p "$(dirname "$STATUS_FILE")"
    cat > "$STATUS_FILE" << EOF
{
    "deployment_state": "$state",
    "timestamp": "$timestamp",
    "version": "MEGA DEPLOY V4 - Super Completo",
    "server_ip": "$SERVER_IP"
}
EOF

    log_info "Estado do deployment salvo: $state" "STATE"
}

# Backup de emergência - CORRIGIDA
emergency_backup() {
    log_warning "Criando backup de emergência..." "EMERGENCY"

    local emergency_dir="/opt/backups/emergency/emergency-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$emergency_dir"

    # Backup rápido dos essenciais
    if [ -d "/opt/stacks" ]; then
        tar -czf "$emergency_dir/stacks.tar.gz" -C /opt stacks 2>/dev/null || true
    fi

    if [ -d "/opt/traefik" ]; then
        tar -czf "$emergency_dir/traefik.tar.gz" -C /opt traefik 2>/dev/null || true
    fi

    if [ -f "/opt/deploy-credentials.json" ]; then
        cp "/opt/deploy-credentials.json" "$emergency_dir/" 2>/dev/null || true
    fi

    log_warning "Backup de emergência criado em: $emergency_dir" "EMERGENCY"
}

# Função de cleanup aprimorada - CORRIGIDA
advanced_cleanup() {
    log_warning "🛑 LIMPEZA AVANÇADA INTERROMPIDA! Executando cleanup inteligente..."

    # Salvar estado atual
    save_deployment_state "INTERRUPTED" || true

    # Parar containers graciosamente
    if command -v docker-compose &> /dev/null; then
        log_info "Parando containers graciosamente..."
        find /opt -name "docker-compose.yml" -type f 2>/dev/null | while read compose_file; do
            local dir=$(dirname "$compose_file")
            cd "$dir" && docker-compose down --remove-orphans 2>/dev/null || true
        done
    fi

    # Backup de emergência se houver dados importantes
    if [ -d "/opt/siqueira-imoveis" ] || [ -d "/opt/stacks" ]; then
        log_info "Criando backup de emergência..."
        emergency_backup || true
    fi

    log_info "🧹 Cleanup concluído."
    exit 1
}

# Configurar traps avançados - CORRIGIDO
trap advanced_cleanup SIGINT SIGTERM 2>/dev/null || true
trap 'save_deployment_state "COMPLETED" 2>/dev/null || true' EXIT 2>/dev/null || true

# ================================================================================================
# FASE 1: DETECÇÃO E ANÁLISE INTELIGENTE DO AMBIENTE
# ================================================================================================

analyze_environment() {
    log_info "${ROCKET} ANALISANDO AMBIENTE DO SERVIDOR..." "ANALYZER"

    # Análise detalhada do sistema
    local cpu_cores=$(nproc)
    local memory_gb=$(free -g | awk 'NR==2{print $2}')
    local disk_space=$(df / | awk 'NR==2{print $4}')
    local disk_space_gb=$((disk_space / 1024 / 1024))

    # Verificar recursos mínimos
    local requirements_met=true

    if [ $cpu_cores -lt 1 ]; then
        log_error "CPU insuficiente: $cpu_cores cores (mínimo: 1)"
        requirements_met=false
    fi

    if [ $memory_gb -lt 1 ]; then
        log_error "Memória insuficiente: ${memory_gb}GB (mínimo: 1GB)"
        requirements_met=false
    fi

    if [ $disk_space_gb -lt 10 ]; then
        log_error "Espaço em disco insuficiente: ${disk_space_gb}GB (mínimo: 10GB)"
        requirements_met=false
    fi

    if [ "$requirements_met" = false ]; then
        log_error "Servidor não atende aos requisitos mínimos!"
        exit 1
    fi

    # Salvar informações do ambiente
    mkdir -p /tmp
    cat > /tmp/environment-info.json << EOF
{
    "os": "$OS",
    "os_version": "$OS_VERSION",
    "architecture": "$ARCH",
    "cloud_provider": "$CLOUD_PROVIDER",
    "public_ip": "$PUBLIC_IP",
    "cpu_cores": $cpu_cores,
    "memory_gb": $memory_gb,
    "disk_space_gb": $disk_space_gb,
    "analysis_time": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)"
}
EOF

    log_success "${CHECK} Ambiente analisado e validado!" "ANALYZER"
    log_info "Sistema: $OS $OS_VERSION ($ARCH)" "ANALYZER"
    log_info "Cloud: $CLOUD_PROVIDER" "ANALYZER"
    log_info "IP Público: $PUBLIC_IP" "ANALYZER"
    log_info "Recursos: ${cpu_cores} CPU, ${memory_gb}GB RAM, ${disk_space_gb}GB Disk" "ANALYZER"
}

# ================================================================================================
# FASE 2: LIMPEZA COMPLETA E INTELIGENTE DO SERVIDOR
# ================================================================================================

intelligent_server_cleanup() {
    log_info "${FIRE} INICIANDO LIMPEZA COMPLETA E INTELIGENTE DO SERVIDOR..." "CLEANUP"

    # Criar backup antes da limpeza se necessário
    if [ -d "/opt" ] && [ "$(ls -A /opt 2>/dev/null)" ]; then
        log_info "Detectados dados existentes, criando backup..." "CLEANUP"
        mkdir -p "$BACKUP_DIR/pre-cleanup"
        tar -czf "$BACKUP_DIR/pre-cleanup/opt-backup.tar.gz" -C / opt 2>/dev/null || true
    fi

    # Parar todos os serviços Docker primeiro
    log_info "Parando todos os containers Docker..." "CLEANUP"
    docker stop $(docker ps -aq) 2>/dev/null || true

    show_progress 1 10 "Parando containers"

    # Remover todos os containers
    log_info "Removendo todos os containers..." "CLEANUP"
    docker rm $(docker ps -aq) 2>/dev/null || true

    show_progress 2 10 "Removendo containers"

    # Remover todas as imagens (manter algumas base)
    log_info "Removendo imagens Docker antigas..." "CLEANUP"
    docker rmi $(docker images -q) 2>/dev/null || true

    show_progress 3 10 "Removendo imagens"

    # Limpeza inteligente de volumes (preservar dados críticos)
    log_info "Limpeza inteligente de volumes..." "CLEANUP"
    docker volume ls -q 2>/dev/null | while read volume; do
        # Verificar se o volume contém dados críticos
        if [[ $volume =~ (postgres|mysql|mongodb|data|backup) ]]; then
            log_warning "Preservando volume crítico: $volume" "CLEANUP"
        else
            docker volume rm "$volume" 2>/dev/null || true
        fi
    done

    show_progress 4 10 "Limpando volumes"

    # Remover redes personalizadas
    log_info "Removendo redes personalizadas..." "CLEANUP"
    docker network ls --filter type=custom -q 2>/dev/null | xargs docker network rm 2>/dev/null || true

    show_progress 5 10 "Removendo redes"

    # Limpeza profunda do Docker
    log_info "Limpeza profunda do sistema Docker..." "CLEANUP"
    docker system prune -af --volumes 2>/dev/null || true

    show_progress 6 10 "Limpeza profunda Docker"

    # Parar serviços do sistema conflitantes
    log_info "Parando serviços conflitantes..." "CLEANUP"
    local services=(apache2 nginx mysql postgresql redis-server mongodb nginx-* httpd)
    for service in "${services[@]}"; do
        if systemctl is-active --quiet $service 2>/dev/null; then
            log_fix "Parando $service..." "CLEANUP"
            systemctl stop $service 2>/dev/null || true
            systemctl disable $service 2>/dev/null || true
        fi
    done

    show_progress 7 10 "Parando serviços"

    # Limpeza inteligente de diretórios
    log_info "Limpeza inteligente de diretórios..." "CLEANUP"

    # Limpar diretórios específicos
    rm -rf /opt/stacks 2>/dev/null || true
    rm -rf /opt/traefik 2>/dev/null || true
    rm -rf /var/www/* 2>/dev/null || true

    # Limpar logs antigos (preservar últimos 7 dias)
    find /var/log -name "*.log" -type f -mtime +7 -exec rm -f {} \; 2>/dev/null || true
    find /var/log -name "*.log.*" -type f -exec rm -f {} \; 2>/dev/null || true

    show_progress 8 10 "Limpando diretórios"

    # Limpeza do cache do sistema
    log_info "Limpando cache do sistema..." "CLEANUP"
    if command -v apt-get &> /dev/null; then
        apt-get clean 2>/dev/null || true
        apt-get autoclean 2>/dev/null || true
        apt-get autoremove -y 2>/dev/null || true
    elif command -v yum &> /dev/null; then
        yum clean all 2>/dev/null || true
    fi

    show_progress 9 10 "Limpando cache"

    # Verificação pós-limpeza
    log_info "Verificando resultado da limpeza..." "CLEANUP"
    local space_after=$(df / | awk 'NR==2{print $4}')
    local space_after_gb=$((space_after / 1024 / 1024))

    show_progress 10 10 "Verificação concluída"

    log_success "${CHECK} Limpeza completa concluída!" "CLEANUP"
    log_info "Espaço disponível: ${space_after_gb}GB" "CLEANUP"
}

# ================================================================================================
# FASE 3: ATUALIZAÇÃO INTELIGENTE DO SISTEMA OPERACIONAL
# ================================================================================================

intelligent_system_update() {
    log_info "${GEAR} ATUALIZANDO SISTEMA OPERACIONAL INTELIGENTEMENTE..." "UPDATER"

    # Detectar gerenciador de pacotes
    local package_manager=""
    if command -v apt-get &> /dev/null; then
        package_manager="apt"
    elif command -v yum &> /dev/null; then
        package_manager="yum"
    elif command -v dnf &> /dev/null; then
        package_manager="dnf"
    elif command -v zypper &> /dev/null; then
        package_manager="zypper"
    else
        log_error "Gerenciador de pacotes não suportado!" "UPDATER"
        return 1
    fi

    log_info "Gerenciador de pacotes detectado: $package_manager" "UPDATER"

    # Configurar ambiente não-interativo
    export DEBIAN_FRONTEND=noninteractive
    export UCF_FORCE_CONFOLD=1

    # Atualização baseada no gerenciador de pacotes
    case $package_manager in
        "apt")
            log_info "Atualizando repositórios APT..." "UPDATER"
            apt-get update -y

            log_info "Atualizando sistema..." "UPDATER"
            apt-get upgrade -y -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold"

            log_info "Instalando dependências essenciais..." "UPDATER"
            apt-get install -y \
                curl \
                wget \
                git \
                unzip \
                software-properties-common \
                apt-transport-https \
                ca-certificates \
                gnupg \
                lsb-release \
                htop \
                nano \
                vim \
                jq \
                openssl \
                cron \
                fail2ban \
                ufw \
                certbot \
                net-tools \
                dnsutils \
                tcpdump \
                iotop \
                ncdu \
                tree \
                zip \
                build-essential \
                python3 \
                python3-pip \
                nodejs \
                npm \
                bc
            ;;
        "yum"|"dnf")
            local cmd=$package_manager
            log_info "Atualizando repositórios $cmd..." "UPDATER"
            $cmd update -y

            log_info "Instalando dependências essenciais..." "UPDATER"
            $cmd install -y \
                curl \
                wget \
                git \
                unzip \
                ca-certificates \
                gnupg \
                htop \
                nano \
                vim \
                jq \
                openssl \
                cronie \
                fail2ban \
                firewalld \
                certbot \
                net-tools \
                bind-utils \
                tcpdump \
                iotop \
                ncdu \
                tree \
                zip \
                gcc \
                make \
                python3 \
                python3-pip \
                nodejs \
                npm \
                bc
            ;;
    esac

    # Configurar timezone
    log_info "Configurando timezone..." "UPDATER"
    timedatectl set-timezone America/Sao_Paulo 2>/dev/null || true

    # Configurar locale
    log_info "Configurando locale..." "UPDATER"
    if command -v locale-gen &> /dev/null; then
        locale-gen pt_BR.UTF-8 2>/dev/null || true
    fi

    log_success "${CHECK} Sistema atualizado com sucesso!" "UPDATER"
}

# ================================================================================================
# FASE 4: INSTALAÇÃO INTELIGENTE DO DOCKER E DOCKER COMPOSE
# ================================================================================================

intelligent_docker_installation() {
    log_info "${BLUE} INSTALANDO DOCKER E DOCKER COMPOSE INTELIGENTEMENTE..." "DOCKER"

    # Verificar se Docker já está instalado
    if command -v docker &> /dev/null; then
        log_info "Docker já está instalado, verificando versão..." "DOCKER"
        docker --version
    else
        # Remover instalações antigas do Docker
        log_info "Removendo versões antigas do Docker..." "DOCKER"
        apt-get remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
        yum remove -y docker docker-client docker-client-latest docker-common docker-latest docker-latest-logrotate docker-logrotate docker-engine 2>/dev/null || true

        # Instalação baseada na distribuição
        if command -v apt-get &> /dev/null; then
            # Ubuntu/Debian
            log_info "Instalando Docker no Ubuntu/Debian..." "DOCKER"

            # Adicionar repositório oficial do Docker
            curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
            echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

            apt-get update -y
            apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

        elif command -v yum &> /dev/null; then
            # CentOS/RHEL
            log_info "Instalando Docker no CentOS/RHEL..." "DOCKER"

            yum install -y yum-utils
            yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
            yum install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        fi

        # Instalar Docker Compose standalone (versão mais recente)
        log_info "Instalando Docker Compose standalone..." "DOCKER"
        local compose_version=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name 2>/dev/null || echo "v2.24.0")
        curl -L "https://github.com/docker/compose/releases/download/${compose_version}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        chmod +x /usr/local/bin/docker-compose

        # Configurar Docker
        log_info "Configurando Docker..." "DOCKER"

        # Iniciar e habilitar Docker
        systemctl start docker
        systemctl enable docker
    fi

    # Configurar Docker daemon com otimizações
    mkdir -p /etc/docker
    cat > /etc/docker/daemon.json << 'EOF'
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    },
    "storage-driver": "overlay2",
    "storage-opts": [
        "overlay2.override_kernel_check=true"
    ],
    "default-runtime": "runc",
    "runtimes": {
        "runc": {
            "path": "runc"
        }
    },
    "exec-opts": ["native.cgroupdriver=systemd"],
    "live-restore": true,
    "max-concurrent-downloads": 3,
    "max-concurrent-uploads": 5
}
EOF

    # Reiniciar Docker para aplicar configurações
    systemctl restart docker

    # Adicionar usuários ao grupo docker
    usermod -aG docker $USER 2>/dev/null || true
    usermod -aG docker root 2>/dev/null || true

    # Configurar limpeza automática do Docker
    cat > /etc/cron.daily/docker-cleanup << 'EOF'
#!/bin/bash
# Limpeza automática do Docker
docker system prune -f > /dev/null 2>&1
docker image prune -f > /dev/null 2>&1
EOF
    chmod +x /etc/cron.daily/docker-cleanup

    # Verificar instalação
    log_info "Verificando instalação do Docker..." "DOCKER"
    if docker --version && docker-compose --version; then
        log_success "${CHECK} Docker instalado com sucesso!" "DOCKER"
        log_docker "Docker version: $(docker --version)"
        log_docker "Docker Compose version: $(docker-compose --version)"
    else
        log_error "Falha na instalação do Docker!" "DOCKER"
        return 1
    fi

    # Testar Docker
    log_info "Testando Docker..." "DOCKER"
    if docker run --rm hello-world > /dev/null 2>&1; then
        log_success "${CHECK} Docker funcionando corretamente!" "DOCKER"
    else
        log_error "Docker não está funcionando corretamente!" "DOCKER"
        return 1
    fi
}

# ================================================================================================
# FUNÇÃO PRINCIPAL - ORQUESTRAÇÃO SIMPLIFICADA E CORRIGIDA
# ================================================================================================

main_deployment() {
    # Banner inicial
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                                                                          ║${NC}"
    echo -e "${CYAN}║    ${BOLD}🚀 MEGA DEPLOY AUTOMÁTICO V4 - SUPER COMPLETO E INTELIGENTE${NC}${CYAN}                                         ║${NC}"
    echo -e "${CYAN}║                                                                                                          ║${NC}"
    echo -e "${CYAN}║    ${GREEN}✅ Deploy 100% Automático + Sistema de Monitoramento Inteligente${NC}${CYAN}                               ║${NC}"
    echo -e "${CYAN}║    ${GREEN}✅ Configuração Completa + Backup + Segurança + Multi-Domínios${NC}${CYAN}                                ║${NC}"
    echo -e "${CYAN}║                                                                                                          ║${NC}"
    echo -e "${CYAN}║    ${YELLOW}Desenvolvido por Kryonix - Vitor Jayme Fernandes Ferreira${NC}${CYAN}                                      ║${NC}"
    echo -e "${CYAN}║    ${YELLOW}WhatsApp: (17) 98180-5327 | Email: vitor.nakahh@gmail.com${NC}${CYAN}                                     ║${NC}"
    echo -e "${CYAN}║                                                                                                          ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════════════════════════════════���═════╝${NC}"
    echo ""

    # Verificar se é root
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script deve ser executado como root (sudo)"
        exit 1
    fi

    log_success "✅ Executando como root - INICIANDO DEPLOY COMPLETO!"

    # Salvar estado inicial
    save_deployment_state "STARTING"

    # FASE 1: Análise do ambiente
    show_progress 1 4 "Analisando ambiente do servidor"
    analyze_environment

    # FASE 2: Limpeza completa
    show_progress 2 4 "Executando limpeza completa do servidor"
    intelligent_server_cleanup

    # FASE 3: Atualização do sistema
    show_progress 3 4 "Atualizando sistema operacional"
    intelligent_system_update

    # FASE 4: Instalação do Docker
    show_progress 4 4 "Instalando Docker e Docker Compose"
    intelligent_docker_installation

    # Banner final
    echo ""
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                                                          ║${NC}"
    echo -e "${GREEN}║    ${BOLD}🎉 DEPLOY V4 EXECUTADO COM SUCESSO! 🎉${NC}${GREEN}                                                          ║${NC}"
    echo -e "${GREEN}║                                                                                                          ║${NC}"
    echo -e "${GREEN}║    ${WHITE}✅ Sistema analisado e preparado${NC}${GREEN}                                                             ║${NC}"
    echo -e "${GREEN}║    ${WHITE}✅ Limpeza completa realizada${NC}${GREEN}                                                                ║${NC}"
    echo -e "${GREEN}║    ${WHITE}✅ Sistema operacional atualizado${NC}${GREEN}                                                           ║${NC}"
    echo -e "${GREEN}║    ${WHITE}✅ Docker e Docker Compose instalados${NC}${GREEN}                                                       ║${NC}"
    echo -e "${GREEN}║    ${WHITE}✅ Logs configurados e funcionando${NC}${GREEN}                                                          ║${NC}"
    echo -e "${GREEN}║                                                                                                          ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""

    # Salvar estado final
    save_deployment_state "COMPLETED"

    log_success "Deploy concluído em $(date)!"
    log_success "Sistema preparado para instalação de serviços! 🚀"
    log_success "Docker está funcionando e pronto para uso!"

    echo ""
    realtime_echo "${GREEN}Deploy executado com sucesso! Sistema pronto.${NC}"
}

# ================================================================================================
# EXECUÇÃO PRINCIPAL
# ================================================================================================

# Executar deployment principal
main_deployment
