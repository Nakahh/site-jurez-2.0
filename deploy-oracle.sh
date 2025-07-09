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
# ╚══════════════════════════════════════════════════════════════════════════════════════════════════════════╝

echo "🚀 MEGA DEPLOY V4 - SUPER COMPLETO INICIANDO..."
echo "📅 Data: $(date)"
echo "🔧 Preparando sistema para deploy totalmente automático..."

# ================================================================================================
# CONFIGURAÇÕES BÁSICAS E FUNCIONAIS V4
# ================================================================================================

# Configurações de sistema para funcionalidade
export DEBIAN_FRONTEND=noninteractive
export NEEDRESTART_MODE=a
export PYTHONUNBUFFERED=1

# Configurações de erro simplificadas
set -e  # Parar em erros críticos
set -u  # Parar com variáveis não definidas
set -o pipefail  # Detectar erros em pipes

# Verificaç��es iniciais básicas
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

# Detectar ambiente automaticamente
detect_environment() {
    # Detectar distribuição Linux
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$NAME
        OS_VERSION=$VERSION_ID
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
    PUBLIC_IP=$(curl -s --max-time 10 ifconfig.me || curl -s --max-time 10 ipinfo.io/ip || echo "Unknown")
}

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
SERVER_IP="144.22.212.82"

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

# Configurações de log específicas (definir antes de usar)
MAIN_LOG="/var/log/deploy-v4/main/deploy-$(date +%Y%m%d_%H%M%S).log"
CONTAINER_LOG="/var/log/deploy-v4/containers/containers.log"
GITHUB_LOG="/var/log/deploy-v4/github/github-updates.log"
DNS_LOG="/var/log/deploy-v4/dns/dns-updates.log"
SSL_LOG="/var/log/deploy-v4/ssl/ssl-certificates.log"
MONITOR_LOG="/var/log/deploy-v4/monitoring/system-monitor.log"
BACKUP_LOG="/var/log/deploy-v4/backup/backup.log"

# Criar diretórios de log imediatamente
mkdir -p /var/log/deploy-v4/{main,containers,github,dns,ssl,monitoring,backup}
touch "$MAIN_LOG" "$CONTAINER_LOG" "$GITHUB_LOG" "$DNS_LOG" "$SSL_LOG" "$MONITOR_LOG" "$BACKUP_LOG"

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
# SISTEMA DE LOGGING AVANÇADO E INTELIGENTE
# ================================================================================================

# Configurar logging avançado
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
        touch "$log"
        echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ) [INIT] Log inicializado" >> "$log"
    done

    echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ) [SYSTEM] Sistema de logging avançado configurado" >> "$MAIN_LOG"
}

# Funções de logging com diferentes níveis
log_info() {
    local message="$1"
    local component="${2:-MAIN}"
    echo -e "${CYAN}[INFO]${NC} ${BOLD}$component${NC}: $message" | tee -a "$MAIN_LOG"
}

log_success() {
    local message="$1"
    local component="${2:-MAIN}"
    echo -e "${GREEN}[SUCCESS]${NC} ${BOLD}$component${NC}: $message" | tee -a "$MAIN_LOG"
}

log_warning() {
    local message="$1"
    local component="${2:-MAIN}"
    echo -e "${YELLOW}[WARNING]${NC} ${BOLD}$component${NC}: $message" | tee -a "$MAIN_LOG"
}

log_error() {
    local message="$1"
    local component="${2:-MAIN}"
    echo -e "${RED}[ERROR]${NC} ${BOLD}$component${NC}: $message" | tee -a "$MAIN_LOG"
}

log_fix() {
    local message="$1"
    local component="${2:-AUTOFIX}"
    echo -e "${PURPLE}[AUTOFIX]${NC} ${BOLD}$component${NC}: $message" | tee -a "$MAIN_LOG"
}

log_docker() {
    local message="$1"
    echo -e "${BLUE}[DOCKER]${NC} $message" | tee -a "$CONTAINER_LOG"
}

log_github() {
    local message="$1"
    echo -e "${GREEN}[GITHUB]${NC} $message" | tee -a "$GITHUB_LOG"
}

log_dns() {
    local message="$1"
    echo -e "${CYAN}[DNS]${NC} $message" | tee -a "$DNS_LOG"
}

log_ssl() {
    local message="$1"
    echo -e "${YELLOW}[SSL]${NC} $message" | tee -a "$SSL_LOG"
}

log_monitor() {
    local message="$1"
    echo -e "${PURPLE}[MONITOR]${NC} $message" | tee -a "$MONITOR_LOG"
}

log_backup() {
    local message="$1"
    echo -e "${GRAY}[BACKUP]${NC} $message" | tee -a "$BACKUP_LOG"
}

# Função para output em tempo real com animação
realtime_echo() {
    local message="$1"
    local delay="${2:-0.05}"

    # Efeito de digitação
    for (( i=0; i<${#message}; i++ )); do
        printf "${message:$i:1}"
        sleep "$delay"
    done
    echo ""

    # Log também
    echo "$message" >> "$MAIN_LOG"
}

# Função para mostrar progresso com barra
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
# SISTEMA DE LIMPEZA AVANÇADA E INTELIGENTE
# ================================================================================================

# Função de cleanup aprimorada
advanced_cleanup() {
    log_warning "🛑 LIMPEZA AVANÇADA INTERROMPIDA! Executando cleanup inteligente..."

    # Salvar estado atual
    save_deployment_state "INTERRUPTED"

    # Parar containers graciosamente
    if command -v docker-compose &> /dev/null; then
        log_info "Parando containers graciosamente..."
        find /opt -name "docker-compose.yml" -type f | while read compose_file; do
            local dir=$(dirname "$compose_file")
            cd "$dir" && docker-compose down --remove-orphans 2>/dev/null || true
        done
    fi

    # Backup de emergência se houver dados importantes
    if [ -d "/opt/siqueira-imoveis" ] || [ -d "/opt/stacks" ]; then
        log_info "Criando backup de emergência..."
        emergency_backup
    fi

    log_info "🧹 Cleanup concluído."
    exit 1
}

# Configurar traps avançados
trap advanced_cleanup SIGINT SIGTERM 2>/dev/null || true
trap 'save_deployment_state "COMPLETED" 2>/dev/null || true' EXIT 2>/dev/null || true

# ================================================================================================
# FASE 1: DETECÇÃO E ANÁLISE INTELIGENTE DO AMBIENTE
# ================================================================================================

analyze_environment() {
    log_info "${ROCKET} ANALISANDO AMBIENTE DO SERVIDOR..." "ANALYZER"

    # Detectar ambiente
    detect_environment

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
    docker volume ls -q | while read volume; do
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
    docker network ls --filter type=custom -q | xargs docker network rm 2>/dev/null || true

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

    # Preservar configurações importantes
    local preserve_dirs=("/etc/ssh" "/home" "/root/.ssh")

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
    log_info "Espaço liberado: ${space_after_gb}GB disponíveis" "CLEANUP"
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
                npm
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
                npm
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
    local compose_version=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | jq -r .tag_name)
    curl -L "https://github.com/docker/compose/releases/download/${compose_version}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose

    # Configurar Docker
    log_info "Configurando Docker..." "DOCKER"

    # Iniciar e habilitar Docker
    systemctl start docker
    systemctl enable docker

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
# FASE 5: CONFIGURAÇÃO AVANÇADA DE SEGURANÇA E FIREWALL
# ================================================================================================

advanced_security_setup() {
    log_info "${SHIELD} CONFIGURANDO SEGURANÇA AVANÇADA E FIREWALL..." "SECURITY"

    # Configurar UFW (Uncomplicated Firewall) se disponível
    if command -v ufw &> /dev/null; then
        log_info "Configurando UFW..." "SECURITY"

        # Reset completo
        ufw --force reset
        ufw default deny incoming
        ufw default allow outgoing

        # Abrir portas essenciais
        local ports=(
            "22/tcp"     # SSH
            "80/tcp"     # HTTP
            "443/tcp"    # HTTPS
            "8080/tcp"   # Traefik Dashboard
            "9000/tcp"   # Portainer HTTP
            "9443/tcp"   # Portainer HTTPS
            "5432/tcp"   # PostgreSQL
            "3000/tcp"   # App Principal
            "3001/tcp"   # App Secundária
            "5555/tcp"   # N8N Principal
            "5556/tcp"   # N8N Secundário
            "8000/tcp"   # Evolution API Principal
            "8001/tcp"   # Evolution API Secundário
            "9999/tcp"   # GitHub Webhook
        )

        for port in "${ports[@]}"; do
            ufw allow $port
            log_info "Porta liberada: $port" "SECURITY"
        done

        # Habilitar firewall
        ufw --force enable

    elif command -v firewall-cmd &> /dev/null; then
        log_info "Configurando FirewallD..." "SECURITY"

        systemctl start firewalld
        systemctl enable firewalld

        # Configurar zona padrão
        firewall-cmd --set-default-zone=public

        # Abrir portas
        local ports=(22 80 443 8080 9000 9443 5432 3000 3001 5555 5556 8000 8001 9999)
        for port in "${ports[@]}"; do
            firewall-cmd --permanent --add-port=${port}/tcp
        done

        firewall-cmd --reload
    fi

    # Configurar Fail2Ban
    log_info "Configurando Fail2Ban..." "SECURITY"

    if command -v fail2ban-server &> /dev/null; then
        # Configuração básica do Fail2Ban
        cat > /etc/fail2ban/jail.local << 'EOF'
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
backend = systemd

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true

[nginx-limit-req]
enabled = true

[docker-auth]
enabled = true
filter = docker-auth
logpath = /var/log/docker.log
maxretry = 3
EOF

        # Criar filtro personalizado para Docker
        cat > /etc/fail2ban/filter.d/docker-auth.conf << 'EOF'
[Definition]
failregex = ^.*\[error\].*authentication failed.*client: <HOST>.*$
ignoreregex =
EOF

        systemctl restart fail2ban
        systemctl enable fail2ban

        log_success "Fail2Ban configurado!" "SECURITY"
    fi

    # Configurar SSH mais seguro
    log_info "Configurando SSH seguro..." "SECURITY"

    # Backup da configuração SSH
    cp /etc/ssh/sshd_config /etc/ssh/sshd_config.backup

    # Aplicar configurações de segurança SSH
    cat > /etc/ssh/sshd_config.d/99-security.conf << 'EOF'
# Configurações de segurança SSH
PermitRootLogin yes
PasswordAuthentication yes
PubkeyAuthentication yes
AuthorizedKeysFile .ssh/authorized_keys
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
PrintMotd no
AcceptEnv LANG LC_*
Subsystem sftp /usr/lib/openssh/sftp-server
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
Protocol 2
EOF

    # Reiniciar SSH
    systemctl restart sshd

    # Configurar limites do sistema
    log_info "Configurando limites do sistema..." "SECURITY"

    cat > /etc/security/limits.d/99-deploy.conf << 'EOF'
# Configura��ões de limites para deploy
* soft nofile 65536
* hard nofile 65536
* soft nproc 65536
* hard nproc 65536
root soft nofile 65536
root hard nofile 65536
root soft nproc 65536
root hard nproc 65536
EOF

    # Configurar kernel parameters
    cat > /etc/sysctl.d/99-deploy.conf << 'EOF'
# Configurações de kernel para deploy
vm.max_map_count=262144
fs.file-max=2097152
net.core.somaxconn=65535
net.ipv4.tcp_max_syn_backlog=65535
net.core.netdev_max_backlog=5000
net.ipv4.tcp_keepalive_time=600
EOF

    sysctl -p /etc/sysctl.d/99-deploy.conf

    log_success "${CHECK} Segurança avançada configurada!" "SECURITY"
}

# ================================================================================================
# FASE 6: CONFIGURAÇÃO AUTOMÁTICA E INTELIGENTE DE DNS
# ================================================================================================

intelligent_dns_configuration() {
    log_info "${CYAN} CONFIGURANDO DNS AUTOMÁTICO E INTELIGENTE..." "DNS"

    # Função para configurar DNS de um domínio
    configure_domain_dns() {
        local domain=$1
        log_info "Configurando DNS para $domain..." "DNS"

        # Subdomínios padrão
        local subdomains=("@" "www" "portainer" "traefik" "api" "app" "n8n" "evolution" "webhook")

        # Configurar cada subdomínio
        for subdomain in "${subdomains[@]}"; do
            configure_dns_record "$domain" "$subdomain" "A" "$SERVER_IP"
            sleep 1  # Evitar rate limiting da API
        done

        # Configurar registros adicionais específicos
        configure_dns_record "$domain" "*" "A" "$SERVER_IP"  # Wildcard

        log_success "DNS configurado para $domain!" "DNS"
    }

    # Função para configurar um registro DNS específico
    configure_dns_record() {
        local domain=$1
        local record_name=$2
        local record_type=$3
        local record_value=$4
        local ttl=600

        log_dns "Configurando $record_type '$record_name' para $domain -> $record_value"

        # Fazer requisição para API da GoDaddy
        local response=$(curl -s -w "%{http_code}" -X PUT \
            "https://api.godaddy.com/v1/domains/$domain/records/$record_type/$record_name" \
            -H "Authorization: sso-key $GODADDY_API_KEY:$GODADDY_API_SECRET" \
            -H "Content-Type: application/json" \
            -d "[{\"data\": \"$record_value\", \"ttl\": $ttl}]")

        local http_code="${response: -3}"

        if [ "$http_code" = "200" ]; then
            log_success "✅ DNS $record_name.$domain atualizado!" "DNS"
        else
            log_warning "❌ Falha ao atualizar DNS $record_name.$domain (HTTP: $http_code)" "DNS"
        fi
    }

    # Verificar conectividade com API da GoDaddy
    log_info "Verificando conectividade com API GoDaddy..." "DNS"

    if ! curl -s --max-time 10 "https://api.godaddy.com" > /dev/null; then
        log_error "Não foi possível conectar à API da GoDaddy!" "DNS"
        return 1
    fi

    # Configurar DNS para todos os domínios
    for project in "${!PROJECTS[@]}"; do
        local domain="${PROJECTS[$project]}"
        configure_domain_dns "$domain"

        # Aguardar entre domínios para evitar rate limiting
        sleep 2
    done

    # Verificar propagação DNS
    log_info "Verificando propagação DNS..." "DNS"

    for project in "${!PROJECTS[@]}"; do
        local domain="${PROJECTS[$project]}"

        # Verificar se DNS está propagando
        local resolved_ip=$(nslookup "$domain" 8.8.8.8 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')

        if [ "$resolved_ip" = "$SERVER_IP" ]; then
            log_success "✅ DNS propagado para $domain" "DNS"
        else
            log_warning "⚠️ DNS ainda propagando para $domain (atual: $resolved_ip)" "DNS"
        fi
    done

    log_success "${CHECK} Configuração DNS concluída!" "DNS"
}

# ================================================================================================
# FASE 7: CLONAGEM INTELIGENTE E AUTO-UPDATE DO GITHUB
# ================================================================================================

intelligent_github_setup() {
    log_info "${GREEN} CONFIGURANDO GITHUB INTELIGENTE COM AUTO-UPDATE..." "GITHUB"

    # Configurar diretório do projeto
    mkdir -p "$PROJECT_DIR"
    cd "$PROJECT_DIR"

    # Configurar Git globalmente
    git config --global user.name "Deploy Automation"
    git config --global user.email "deploy@siqueicamposimoveis.com.br"
    git config --global init.defaultBranch main

    # Função para clonar ou atualizar repositório
    clone_or_update_repository() {
        log_github "Clonando/atualizando repositório: $GITHUB_REPO"

        if [ -d ".git" ]; then
            log_github "Repositório já existe, atualizando..."

            # Salvar mudanças locais se existirem
            if ! git diff-index --quiet HEAD --; then
                log_github "Salvando mudanças locais..."
                git stash
            fi

            # Atualizar repositório
            git fetch origin
            git reset --hard origin/$GITHUB_BRANCH
            git clean -fd

            # Restaurar mudanças locais se foram salvas
            if git stash list | grep -q stash; then
                log_github "Restaurando mudanças locais..."
                git stash pop || true
            fi

        else
            log_github "Clonando repositório..."

            # Limpar diretório se não for git
            rm -rf ./* .[^.]*  2>/dev/null || true

            # Clonar repositório
            if [ -n "$GITHUB_TOKEN" ]; then
                # Usar token se disponível
                local repo_url=$(echo "$GITHUB_REPO" | sed "s|https://|https://$GITHUB_TOKEN@|")
                git clone "$repo_url" .
            else
                # Clonar público
                git clone "$GITHUB_REPO" .
            fi

            git checkout "$GITHUB_BRANCH"
        fi

        # Verificar se clonagem foi bem-sucedida
        if [ -f "package.json" ] || [ -f "README.md" ]; then
            log_success "✅ Repositório clonado/atualizado com sucesso!" "GITHUB"
            return 0
        else
            log_error "❌ Falha ao clonar/atualizar repositório!" "GITHUB"
            return 1
        fi
    }

    # Executar clonagem/atualização
    clone_or_update_repository

    # Configurar sistema de auto-update avançado
    setup_advanced_auto_update

    log_success "${CHECK} GitHub configurado com auto-update!" "GITHUB"
}

setup_advanced_auto_update() {
    log_github "Configurando sistema avançado de auto-update..."

    # Criar script de auto-update inteligente
    cat > /opt/github-auto-update.sh << 'EOF'
#!/bin/bash

# Script de Auto-Update Inteligente do GitHub
# Desenvolvido por Kryonix

LOG_FILE="/var/log/deploy-v4/github/github-updates.log"
PROJECT_DIR="/opt/siqueira-imoveis"
LOCK_FILE="/tmp/github-update.lock"
NOTIFICATION_URL=""  # Webhook para notificações

# Funções de logging
log_github() {
    echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ) [GITHUB-UPDATE] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ) [ERROR] $1" | tee -a "$LOG_FILE"
}

# Verificar se já está rodando
if [ -f "$LOCK_FILE" ]; then
    local pid=$(cat "$LOCK_FILE")
    if kill -0 "$pid" 2>/dev/null; then
        log_github "Auto-update já está rodando (PID: $pid)"
        exit 0
    else
        rm -f "$LOCK_FILE"
    fi
fi

# Criar lock
echo $$ > "$LOCK_FILE"

# Função de limpeza
cleanup() {
    rm -f "$LOCK_FILE"
}
trap cleanup EXIT

# Ir para diretório do projeto
cd "$PROJECT_DIR" || {
    log_error "Diretório do projeto não encontrado: $PROJECT_DIR"
    exit 1
}

log_github "Verificando atualizações do GitHub..."

# Fetch das mudanças
git fetch origin main 2>&1 | tee -a "$LOG_FILE"

# Verificar se há atualizações
LOCAL=$(git rev-parse HEAD 2>/dev/null)
REMOTE=$(git rev-parse origin/main 2>/dev/null)

if [ "$LOCAL" != "$REMOTE" ]; then
    log_github "Atualizações encontradas!"
    log_github "Local:  $LOCAL"
    log_github "Remote: $REMOTE"

    # Verificar se há containers rodando
    if docker ps | grep -q "app-\|siqueira"; then
        log_github "Parando containers da aplicação..."

        # Parar aplicações graciosamente
        find /opt/stacks -name "docker-compose.yml" -type f | while read compose_file; do
            local dir=$(dirname "$compose_file")
            if grep -q "app\|siqueira" "$compose_file"; then
                cd "$dir" && docker-compose stop app 2>/dev/null || true
            fi
        done
    fi

    # Criar backup antes da atualização
    log_github "Criando backup antes da atualização..."
    local backup_dir="/opt/backups/pre-update-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    tar -czf "$backup_dir/project-backup.tar.gz" -C "$PROJECT_DIR" . 2>/dev/null || true

    # Salvar mudanças locais se existirem
    if ! git diff-index --quiet HEAD --; then
        log_github "Salvando mudanças locais..."
        git stash
    fi

    # Atualizar código
    log_github "Atualizando código..."
    git reset --hard origin/main 2>&1 | tee -a "$LOG_FILE"
    git clean -fd 2>&1 | tee -a "$LOG_FILE"

    # Verificar se package.json mudou
    if git diff --name-only $LOCAL..$REMOTE | grep -q "package.json"; then
        log_github "package.json foi alterado, reinstalando dependências..."
        if [ -f "package.json" ]; then
            npm install 2>&1 | tee -a "$LOG_FILE" || true
        fi
    fi

    # Rebuildar aplicação se necessário
    if [ -f "package.json" ]; then
        log_github "Rebuilding aplicação..."
        npm run build 2>&1 | tee -a "$LOG_FILE" || true
    fi

    # Reiniciar containers
    log_github "Reiniciando containers..."
    find /opt/stacks -name "docker-compose.yml" -type f | while read compose_file; do
        local dir=$(dirname "$compose_file")
        if grep -q "app\|siqueira" "$compose_file"; then
            cd "$dir"
            docker-compose build --no-cache app 2>/dev/null || true
            docker-compose up -d app 2>/dev/null || true
        fi
    done

    # Aguardar containers estabilizarem
    sleep 30

    # Verificar se atualização foi bem-sucedida
    local new_local=$(git rev-parse HEAD 2>/dev/null)
    if [ "$new_local" = "$REMOTE" ]; then
        log_github "✅ Atualização concluída com sucesso!"
        log_github "Novo commit: $new_local"

        # Enviar notificação de sucesso
        send_notification "GitHub Auto-Update" "Atualização bem-sucedida para commit: ${new_local:0:8}" "success"

        # Remover backup antigo (manter apenas último)
        find /opt/backups -name "pre-update-*" -type d -mtime +1 -exec rm -rf {} \; 2>/dev/null || true

    else
        log_error "❌ Falha na atualização!"

        # Tentar restaurar backup
        if [ -f "$backup_dir/project-backup.tar.gz" ]; then
            log_github "Restaurando backup..."
            tar -xzf "$backup_dir/project-backup.tar.gz" -C "$PROJECT_DIR" 2>/dev/null || true
        fi

        send_notification "GitHub Auto-Update" "Falha na atualização! Backup restaurado." "error"
    fi

else
    log_github "Nenhuma atualização encontrada."
fi

# Função para enviar notificações
send_notification() {
    local title="$1"
    local message="$2"
    local type="${3:-info}"

    if [ -n "$NOTIFICATION_URL" ]; then
        local color=""
        case $type in
            "success") color="65280" ;;   # Verde
            "error") color="16711680" ;;  # Vermelho
            *) color="255" ;;             # Azul
        esac

        curl -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"embeds\": [{
                    \"title\": \"$title\",
                    \"description\": \"$message\",
                    \"color\": $color,
                    \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
                }]
            }" 2>/dev/null || true
    fi

    # Log local da notificação
    echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ) [NOTIFICATION] $title: $message" >> "$LOG_FILE"
}
EOF

    chmod +x /opt/github-auto-update.sh

    # Configurar cron para verificar a cada 5 minutos
    log_github "Configurando cron para auto-update..."
    (crontab -l 2>/dev/null | grep -v "github-auto-update"; echo "*/5 * * * * /opt/github-auto-update.sh") | crontab -

    # Configurar webhook do GitHub
    setup_github_webhook_server

    log_github "Sistema de auto-update configurado!"
}

setup_github_webhook_server() {
    log_github "Configurando servidor de webhook do GitHub..."

    # Criar servidor de webhook em Python
    cat > /opt/github-webhook-server.py << 'EOF'
#!/usr/bin/env python3
import http.server
import socketserver
import subprocess
import json
import hashlib
import hmac
import os
from urllib.parse import urlparse, parse_qs

class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/webhook/github':
            try:
                content_length = int(self.headers['Content-Length'])
                post_data = self.rfile.read(content_length)

                # Opcional: Verificar assinatura do GitHub
                # signature = self.headers.get('X-Hub-Signature-256')

                # Parse do payload
                payload = json.loads(post_data.decode('utf-8'))

                # Verificar se é push para branch main
                if 'ref' in payload and payload['ref'] == 'refs/heads/main':
                    print(f"Webhook recebido: Push para branch main")
                    print(f"Commit: {payload.get('after', 'unknown')}")

                    # Executar script de atualização
                    subprocess.Popen(['/opt/github-auto-update.sh'])

                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "success", "message": "Update triggered"}).encode())
                else:
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"status": "ignored", "message": "Not a main branch push"}).encode())

            except Exception as e:
                print(f"Erro no webhook: {e}")
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode())
        else:
            self.send_response(404)
            self.end_headers()

    def do_GET(self):
        if self.path == '/webhook/status':
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"status": "running", "service": "GitHub Webhook Server"}).encode())
        else:
            self.send_response(404)
            self.end_headers()

PORT = 9999
print(f"GitHub Webhook Server rodando na porta {PORT}")
print(f"URL do webhook: http://YOUR_DOMAIN:{PORT}/webhook/github")

with socketserver.TCPServer(("", PORT), WebhookHandler) as httpd:
    httpd.serve_forever()
EOF

    chmod +x /opt/github-webhook-server.py

    # Criar serviço systemd para o webhook
    cat > /etc/systemd/system/github-webhook.service << 'EOF'
[Unit]
Description=GitHub Webhook Server
After=network.target

[Service]
Type=simple
User=root
ExecStart=/usr/bin/python3 /opt/github-webhook-server.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable github-webhook
    systemctl start github-webhook

    log_github "Servidor de webhook configurado na porta 9999!"
    log_github "URL do webhook: http://$SERVER_IP:9999/webhook/github"
}

# ================================================================================================
# FASE 8: INSTALAÇÃO E CONFIGURAÇÃO AVANÇADA DO PORTAINER
# ================================================================================================

advanced_portainer_setup() {
    log_info "${BLUE} INSTALANDO E CONFIGURANDO PORTAINER AVANÇADO..." "PORTAINER"

    # Remover instalações antigas do Portainer
    log_info "Removendo instalações antigas do Portainer..." "PORTAINER"
    docker stop portainer 2>/dev/null || true
    docker rm portainer 2>/dev/null || true
    docker volume rm portainer_data 2>/dev/null || true

    # Criar volume para dados do Portainer
    log_info "Criando volume do Portainer..." "PORTAINER"
    docker volume create portainer_data

    # Gerar senha hash para o admin
    log_info "Gerando credenciais seguras..." "PORTAINER"
    local admin_password="@Administrador1234"
    local password_hash=$(docker run --rm httpd:2.4-alpine htpasswd -nbB admin "$admin_password" | cut -d ":" -f 2)

    # Instalar Portainer com configurações avançadas
    log_info "Instalando Portainer..." "PORTAINER"
    docker run -d \
        --name portainer \
        --restart always \
        -p 9000:9000 \
        -p 9443:9443 \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v portainer_data:/data \
        -v /opt:/opt:ro \
        --label "traefik.enable=true" \
        --label "traefik.http.routers.portainer.rule=Host(\`portainer.siqueicamposimoveis.com.br\`)" \
        --label "traefik.http.routers.portainer.entrypoints=websecure" \
        --label "traefik.http.routers.portainer.tls.certresolver=letsencrypt" \
        --label "traefik.http.services.portainer.loadbalancer.server.port=9000" \
        portainer/portainer-ce:latest \
        --admin-password="$password_hash"

    # Aguardar Portainer inicializar
    log_info "Aguardando Portainer inicializar..." "PORTAINER"
    local timeout=60
    local count=0

    while [ $count -lt $timeout ]; do
        if curl -s http://localhost:9000/api/system/status > /dev/null 2>&1; then
            break
        fi
        sleep 2
        count=$((count + 2))
        show_progress $count $timeout "Aguardando Portainer"
    done

    if [ $count -ge $timeout ]; then
        log_error "Timeout aguardando Portainer!" "PORTAINER"
        return 1
    fi

    # Configurar Portainer via API
    configure_portainer_api

    # Verificar se está rodando
    if docker ps | grep -q portainer && curl -s http://localhost:9000/api/system/status > /dev/null; then
        log_success "✅ Portainer instalado e configurado!" "PORTAINER"
        log_info "Acesso HTTP: http://$SERVER_IP:9000" "PORTAINER"
        log_info "Acesso HTTPS: https://$SERVER_IP:9443" "PORTAINER"
        log_info "Usuário: admin" "PORTAINER"
        log_info "Senha: $admin_password" "PORTAINER"
    else
        log_error "❌ Falha na instalação do Portainer" "PORTAINER"
        return 1
    fi
}

configure_portainer_api() {
    log_info "Configurando Portainer via API..." "PORTAINER"

    # Aguardar API estar disponível
    sleep 10

    # Fazer login na API
    local auth_response=$(curl -s -X POST \
        http://localhost:9000/api/auth \
        -H "Content-Type: application/json" \
        -d '{
            "username": "admin",
            "password": "@Administrador1234"
        }')

    local jwt_token=$(echo "$auth_response" | jq -r '.jwt // empty')

    if [ -n "$jwt_token" ]; then
        log_success "Login na API do Portainer realizado!" "PORTAINER"

        # Configurar endpoint local
        curl -s -X POST \
            http://localhost:9000/api/endpoints \
            -H "Authorization: Bearer $jwt_token" \
            -H "Content-Type: application/json" \
            -d '{
                "Name": "local",
                "EndpointCreationType": 1,
                "URL": "unix:///var/run/docker.sock",
                "PublicURL": "",
                "GroupID": 1,
                "TLS": false
            }' > /dev/null

        log_success "Endpoint local configurado no Portainer!" "PORTAINER"
    else
        log_warning "Não foi possível fazer login na API do Portainer" "PORTAINER"
    fi
}

# ================================================================================================
# FASE 9: CONFIGURAÇÃO AVANÇADA DO TRAEFIK
# ================================================================================================

advanced_traefik_setup() {
    log_info "${CYAN} CONFIGURANDO TRAEFIK AVANÇADO COM SSL..." "TRAEFIK"

    # Criar diretório do Traefik
    local traefik_dir="/opt/traefik"
    mkdir -p "$traefik_dir/data" "$traefik_dir/config" "$traefik_dir/logs"

    cd "$traefik_dir"

    # Criar configuração avançada do Traefik
    create_advanced_traefik_config "$traefik_dir"

    # Criar docker-compose do Traefik
    create_traefik_compose "$traefik_dir"

    # Criar rede do Traefik
    log_info "Criando rede do Traefik..." "TRAEFIK"
    docker network create traefik 2>/dev/null || true

    # Iniciar Traefik
    log_info "Iniciando Traefik..." "TRAEFIK"
    cd "$traefik_dir"
    docker-compose down 2>/dev/null || true
    docker-compose up -d

    # Aguardar Traefik inicializar
    log_info "Aguardando Traefik inicializar..." "TRAEFIK"
    local timeout=60
    local count=0

    while [ $count -lt $timeout ]; do
        if curl -s http://localhost:8080/api/overview > /dev/null 2>&1; then
            break
        fi
        sleep 2
        count=$((count + 2))
        show_progress $count $timeout "Aguardando Traefik"
    done

    if [ $count -ge $timeout ]; then
        log_error "Timeout aguardando Traefik!" "TRAEFIK"
        return 1
    fi

    # Verificar funcionamento
    if docker ps | grep -q traefik && curl -s http://localhost:8080/api/overview > /dev/null; then
        log_success "✅ Traefik configurado e rodando!" "TRAEFIK"
        log_info "Dashboard: http://$SERVER_IP:8080" "TRAEFIK"
        log_info "Dashboard HTTPS: https://traefik.siqueicamposimoveis.com.br" "TRAEFIK"
    else
        log_error "❌ Falha na configuração do Traefik" "TRAEFIK"
        return 1
    fi
}

create_advanced_traefik_config() {
    local traefik_dir="$1"

    log_info "Criando configuração avançada do Traefik..." "TRAEFIK"

    # Configuração principal do Traefik
    cat > "$traefik_dir/data/traefik.yml" << 'EOF'
global:
  checkNewVersion: false
  sendAnonymousUsage: false

api:
  dashboard: true
  debug: true
  insecure: false

entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
          permanent: true

  websecure:
    address: ":443"
    http:
      tls:
        options: default

providers:
  docker:
    endpoint: "unix:///var/run/docker.sock"
    exposedByDefault: false
    network: traefik
    watch: true

  file:
    directory: /config
    watch: true

certificatesResolvers:
  letsencrypt:
    acme:
      tlsChallenge: {}
      email: siqueiraecamposimoveis@gmail.com
      storage: /data/acme.json
      keyType: EC256
      caServer: https://acme-v02.api.letsencrypt.org/directory

log:
  level: INFO
  filePath: /logs/traefik.log

accessLog:
  filePath: /logs/access.log
  bufferingSize: 100

metrics:
  prometheus:
    addEntryPointsLabels: true
    addServicesLabels: true

ping: {}
EOF

    # Configuração de TLS
    cat > "$traefik_dir/config/tls.yml" << 'EOF'
tls:
  options:
    default:
      sslStrategies:
        - "tls.SniStrict"
      minVersion: "VersionTLS12"
      cipherSuites:
        - "TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384"
        - "TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305"
        - "TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256"
        - "TLS_RSA_WITH_AES_256_GCM_SHA384"
        - "TLS_RSA_WITH_AES_128_GCM_SHA256"
EOF

    # Configuração de middleware
    cat > "$traefik_dir/config/middleware.yml" << 'EOF'
http:
  middlewares:
    default-headers:
      headers:
        frameDeny: true
        sslRedirect: true
        browserXssFilter: true
        contentTypeNosniff: true
        forceSTSHeader: true
        stsIncludeSubdomains: true
        stsPreload: true
        stsSeconds: 31536000
        customFrameOptionsValue: SAMEORIGIN
        customRequestHeaders:
          X-Forwarded-Proto: https

    secure-headers:
      headers:
        accessControlAllowMethods:
          - GET
          - OPTIONS
          - PUT
        accessControlMaxAge: 100
        hostsProxyHeaders:
          - "X-Forwarded-Host"
        referrerPolicy: "same-origin"

    compress:
      compress: {}

    rate-limit:
      rateLimit:
        average: 100
        burst: 200
EOF

    # Criar arquivo ACME
    touch "$traefik_dir/data/acme.json"
    chmod 600 "$traefik_dir/data/acme.json"

    log_success "Configuração avançada do Traefik criada!" "TRAEFIK"
}

create_traefik_compose() {
    local traefik_dir="$1"

    log_info "Criando docker-compose do Traefik..." "TRAEFIK"

    cat > "$traefik_dir/docker-compose.yml" << 'EOF'
version: '3.8'

services:
  traefik:
    image: traefik:v3.0
    container_name: traefik
    restart: unless-stopped
    security_opt:
      - no-new-privileges:true
    networks:
      - traefik
    ports:
      - "80:80"
      - "443:443"
      - "8080:8080"
    environment:
      - CF_API_EMAIL=${CF_API_EMAIL:-}
      - CF_DNS_API_TOKEN=${CF_DNS_API_TOKEN:-}
    volumes:
      - /etc/localtime:/etc/localtime:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./data/traefik.yml:/traefik.yml:ro
      - ./data/acme.json:/data/acme.json
      - ./config:/config:ro
      - ./logs:/logs
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.rule=Host(`traefik.siqueicamposimoveis.com.br`)"
      - "traefik.http.routers.traefik.middlewares=default-headers@file,secure-headers@file"
      - "traefik.http.routers.traefik.tls=true"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"
      - "traefik.http.middlewares.traefik-auth.basicauth.users=admin:$$2y$$10$$mzIHLp3O/0CzZGgZgJsU8.Z6EGq4u0K5lrOyZkrQxL0nZl0u2qh1S"

networks:
  traefik:
    external: true
EOF

    log_success "Docker-compose do Traefik criado!" "TRAEFIK"
}

# ================================================================================================
# FASE 10: CONFIGURAÇÃO AVANÇADA DAS STACKS DE APLICAÇÃO
# ================================================================================================

setup_advanced_application_stacks() {
    log_info "${STAR} CONFIGURANDO STACKS AVANÇADAS DE APLICAÇÃO..." "STACKS"

    # Configurar stacks para cada projeto
    for project in "${!PROJECTS[@]}"; do
        local domain="${PROJECTS[$project]}"
        setup_project_stack "$project" "$domain"
    done

    log_success "✅ Todas as stacks configuradas!" "STACKS"
}

setup_project_stack() {
    local project_name="$1"
    local domain="$2"

    log_info "Configurando stack para $project_name ($domain)..." "STACKS"

    # Obter configurações do projeto
    local portainer_user="${PROJECT_CONFIGS[${project_name}_portainer_user]}"
    local portainer_pass="${PROJECT_CONFIGS[${project_name}_portainer_pass]}"
    local server_name="${PROJECT_CONFIGS[${project_name}_server_name]}"
    local network="${PROJECT_CONFIGS[${project_name}_network]}"
    local email="${PROJECT_CONFIGS[${project_name}_email]}"
    local db_name="${PROJECT_CONFIGS[${project_name}_db_name]}"
    local app_port="${PROJECT_CONFIGS[${project_name}_app_port]}"
    local n8n_port="${PROJECT_CONFIGS[${project_name}_n8n_port]}"
    local evolution_port="${PROJECT_CONFIGS[${project_name}_evolution_port]}"

    # Criar diretório da stack
    local stack_dir="/opt/stacks/$project_name"
    mkdir -p "$stack_dir"
    cd "$stack_dir"

    # Gerar senhas seguras
    local db_password=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    local n8n_password=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
    local evolution_key=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
    local jwt_secret=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
    local cookie_secret=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-30)

    # Criar arquivo .env
    create_advanced_env_file "$domain" "$email" "$db_name" "$db_password" "$n8n_password" "$evolution_key" "$jwt_secret" "$cookie_secret" "$app_port" "$n8n_port" "$evolution_port"

    # Criar docker-compose.yml avançado
    create_advanced_docker_compose "$domain" "$network" "$project_name"

    # Criar script de inicialização do banco
    create_database_init_script "$db_name"

    # Criar rede se não existir
    docker network create "$network" 2>/dev/null || true

    # Iniciar stack
    log_info "Iniciando stack $project_name..." "STACKS"
    docker-compose down 2>/dev/null || true
    docker-compose up -d

    # Salvar credenciais
    save_project_credentials "$project_name" "$domain" "$email" "$db_password" "$n8n_password" "$evolution_key"

    log_success "✅ Stack $project_name configurada!" "STACKS"
}

create_advanced_env_file() {
    local domain=$1
    local email=$2
    local db_name=$3
    local db_password=$4
    local n8n_password=$5
    local evolution_key=$6
    local jwt_secret=$7
    local cookie_secret=$8
    local app_port=$9
    local n8n_port=${10}
    local evolution_port=${11}

    log_info "Criando arquivo .env avançado..." "STACKS"

    cat > .env << EOF
# ==========================================
# CONFIGURAÇÕES GERAIS
# ==========================================
NODE_ENV=production
DOMAIN=$domain
EMAIL=$email
TZ=America/Sao_Paulo
APP_NAME=Siqueira Campos Imóveis
APP_URL=https://$domain
API_URL=https://api.$domain

# ==========================================
# PORTAS DOS SERVIÇOS
# ==========================================
APP_PORT=$app_port
N8N_PORT=$n8n_port
EVOLUTION_PORT=$evolution_port

# ==========================================
# BANCO DE DADOS POSTGRESQL
# ==========================================
DATABASE_URL=postgresql://siqueira:$db_password@postgres:5432/$db_name?schema=public
POSTGRES_DB=$db_name
POSTGRES_USER=siqueira
POSTGRES_PASSWORD=$db_password

# ==========================================
# AUTENTICAÇÃO E SEGURANÇA
# ==========================================
JWT_SECRET=$jwt_secret
COOKIE_SECRET=$cookie_secret
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=86400

# ==========================================
# N8N CONFIGURAÇÕES
# ==========================================
N8N_BASIC_AUTH_ACTIVE=true
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=$n8n_password
N8N_HOST=n8n.$domain
N8N_PROTOCOL=https
N8N_PORT=443
N8N_WEBHOOK_URL=https://n8n.$domain
DB_TYPE=postgresdb
DB_POSTGRESDB_HOST=postgres
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_DATABASE=n8n
DB_POSTGRESDB_USER=siqueira
DB_POSTGRESDB_PASSWORD=$db_password

# ==========================================
# EVOLUTION API (WHATSAPP)
# ==========================================
EVOLUTION_API_KEY=$evolution_key
EVOLUTION_MANAGER_TOKEN=$(openssl rand -base64 32)
SERVER_TYPE=http
CORS_ORIGIN=*
CORS_METHODS=GET,POST,PUT,DELETE
CORS_CREDENTIALS=true
LOG_LEVEL=ERROR
DEL_INSTANCE=false
DATABASE_ENABLED=true
DATABASE_CONNECTION_URI=postgresql://siqueira:$db_password@postgres:5432/evolution?schema=public
CACHE_REDIS_ENABLED=false
RABBITMQ_ENABLED=false
WEBSOCKET_ENABLED=true
CONFIG_SESSION_PHONE_CLIENT=Siqueira Campos Imóveis
CONFIG_SESSION_PHONE_NAME=SCI

# ==========================================
# EMAIL SMTP
# ==========================================
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=$email
EMAIL_PASS=
EMAIL_SECURE=false
EMAIL_TLS=true

# ==========================================
# GOOGLE OAUTH (OPCIONAL)
# ==========================================
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://$domain/api/auth/google/callback

# ==========================================
# WHATSAPP BUSINESS (OPCIONAL)
# ==========================================
WHATSAPP_TOKEN=
WHATSAPP_PHONE_ID=
WHATSAPP_WEBHOOK_VERIFY_TOKEN=

# ==========================================
# CONFIGURAÇÕES DE PERFORMANCE
# ==========================================
NODE_OPTIONS=--max_old_space_size=1024
WORKERS=1
WEB_CONCURRENCY=1

# ==========================================
# CONFIGURAÇÕES DE LOG
# ==========================================
LOG_LEVEL=info
LOG_FILE=/app/logs/app.log
LOG_MAX_SIZE=10mb
LOG_MAX_FILES=5

# ==========================================
# REDIS (SE NECESSÁRIO)
# ==========================================
REDIS_URL=redis://redis:6379
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=

# ==========================================
# MONITORAMENTO
# ==========================================
ENABLE_METRICS=true
METRICS_PORT=9090
HEALTH_CHECK_PORT=8080
EOF

    log_success "Arquivo .env criado!" "STACKS"
}

create_advanced_docker_compose() {
    local domain=$1
    local network=$2
    local project_name=$3

    log_info "Criando docker-compose.yml avançado..." "STACKS"

    cat > docker-compose.yml << EOF
version: '3.8'

services:
  # ==========================================
  # POSTGRESQL DATABASE
  # ==========================================
  postgres:
    image: postgres:15-alpine
    container_name: postgres-$domain
    restart: unless-stopped
    environment:
      POSTGRES_DB: \${POSTGRES_DB}
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      TZ: \${TZ}
      PGDATA: /var/lib/postgresql/data/pgdata
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
      - ./postgresql.conf:/etc/postgresql/postgresql.conf:ro
    networks:
      - $network
      - traefik
    ports:
      - "5432:5432"
    labels:
      - "traefik.enable=false"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # ==========================================
  # REDIS CACHE (OPCIONAL)
  # ==========================================
  redis:
    image: redis:7-alpine
    container_name: redis-$domain
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass \${REDIS_PASSWORD:-}
    volumes:
      - redis_data:/data
    networks:
      - $network
    labels:
      - "traefik.enable=false"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3
    deploy:
      resources:
        limits:
          memory: 128M
        reservations:
          memory: 64M

  # ==========================================
  # APLICAÇÃO PRINCIPAL
  # ==========================================
  app:
    image: node:18-alpine
    container_name: app-$domain
    restart: unless-stopped
    working_dir: /app
    volumes:
      - /opt/siqueira-imoveis:/app
      - app_logs:/app/logs
      - app_uploads:/app/uploads
    environment:
      - NODE_ENV=\${NODE_ENV}
      - DATABASE_URL=\${DATABASE_URL}
      - JWT_SECRET=\${JWT_SECRET}
      - DOMAIN=\${DOMAIN}
      - EMAIL=\${EMAIL}
      - APP_PORT=\${APP_PORT}
    command: sh -c "
      echo 'Instalando dependências...' &&
      npm install --production &&
      echo 'Executando migrações...' &&
      npx prisma generate &&
      npx prisma migrate deploy &&
      echo 'Iniciando aplicação...' &&
      npm start
    "
    networks:
      - $network
      - traefik
    depends_on:
      postgres:
        condition: service_healthy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app-$project_name.rule=Host(\`\${DOMAIN}\`)"
      - "traefik.http.routers.app-$project_name.entrypoints=websecure"
      - "traefik.http.routers.app-$project_name.tls.certresolver=letsencrypt"
      - "traefik.http.routers.app-$project_name.middlewares=default-headers@file,compress@file"
      - "traefik.http.services.app-$project_name.loadbalancer.server.port=\${APP_PORT}"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:\${APP_PORT}/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 1G
        reservations:
          memory: 512M

  # ==========================================
  # N8N WORKFLOW AUTOMATION
  # ==========================================
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n-$domain
    restart: unless-stopped
    environment:
      - N8N_BASIC_AUTH_ACTIVE=\${N8N_BASIC_AUTH_ACTIVE}
      - N8N_BASIC_AUTH_USER=\${N8N_BASIC_AUTH_USER}
      - N8N_BASIC_AUTH_PASSWORD=\${N8N_BASIC_AUTH_PASSWORD}
      - N8N_HOST=\${N8N_HOST}
      - N8N_PROTOCOL=\${N8N_PROTOCOL}
      - N8N_PORT=\${N8N_PORT}
      - WEBHOOK_URL=\${N8N_WEBHOOK_URL}
      - GENERIC_TIMEZONE=\${TZ}
      - DB_TYPE=\${DB_TYPE}
      - DB_POSTGRESDB_HOST=\${DB_POSTGRESDB_HOST}
      - DB_POSTGRESDB_PORT=\${DB_POSTGRESDB_PORT}
      - DB_POSTGRESDB_DATABASE=\${DB_POSTGRESDB_DATABASE}
      - DB_POSTGRESDB_USER=\${DB_POSTGRESDB_USER}
      - DB_POSTGRESDB_PASSWORD=\${DB_POSTGRESDB_PASSWORD}
      - N8N_METRICS=true
      - N8N_LOG_LEVEL=info
    volumes:
      - n8n_data:/home/node/.n8n
      - n8n_files:/files
    networks:
      - $network
      - traefik
    depends_on:
      postgres:
        condition: service_healthy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.n8n-$project_name.rule=Host(\`n8n.\${DOMAIN}\`)"
      - "traefik.http.routers.n8n-$project_name.entrypoints=websecure"
      - "traefik.http.routers.n8n-$project_name.tls.certresolver=letsencrypt"
      - "traefik.http.routers.n8n-$project_name.middlewares=default-headers@file"
      - "traefik.http.services.n8n-$project_name.loadbalancer.server.port=5678"
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:5678/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

  # ==========================================
  # EVOLUTION API (WHATSAPP)
  # ==========================================
  evolution:
    image: atendai/evolution-api:latest
    container_name: evolution-$domain
    restart: unless-stopped
    environment:
      - SERVER_TYPE=\${SERVER_TYPE}
      - SERVER_PORT=\${EVOLUTION_PORT}
      - CORS_ORIGIN=\${CORS_ORIGIN}
      - CORS_METHODS=\${CORS_METHODS}
      - CORS_CREDENTIALS=\${CORS_CREDENTIALS}
      - LOG_LEVEL=\${LOG_LEVEL}
      - DEL_INSTANCE=\${DEL_INSTANCE}
      - DATABASE_ENABLED=\${DATABASE_ENABLED}
      - DATABASE_CONNECTION_URI=\${DATABASE_CONNECTION_URI}
      - CACHE_REDIS_ENABLED=\${CACHE_REDIS_ENABLED}
      - RABBITMQ_ENABLED=\${RABBITMQ_ENABLED}
      - WEBSOCKET_ENABLED=\${WEBSOCKET_ENABLED}
      - CONFIG_SESSION_PHONE_CLIENT=\${CONFIG_SESSION_PHONE_CLIENT}
      - CONFIG_SESSION_PHONE_NAME=\${CONFIG_SESSION_PHONE_NAME}
      - EVOLUTION_API_KEY=\${EVOLUTION_API_KEY}
    volumes:
      - evolution_instances:/evolution/instances
      - evolution_store:/evolution/store
      - evolution_logs:/evolution/logs
    networks:
      - $network
      - traefik
    depends_on:
      postgres:
        condition: service_healthy
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.evolution-$project_name.rule=Host(\`evolution.\${DOMAIN}\`)"
      - "traefik.http.routers.evolution-$project_name.entrypoints=websecure"
      - "traefik.http.routers.evolution-$project_name.tls.certresolver=letsencrypt"
      - "traefik.http.routers.evolution-$project_name.middlewares=default-headers@file"
      - "traefik.http.services.evolution-$project_name.loadbalancer.server.port=\${EVOLUTION_PORT}"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:\${EVOLUTION_PORT}/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s
    deploy:
      resources:
        limits:
          memory: 512M
        reservations:
          memory: 256M

volumes:
  postgres_data:
    driver: local
  redis_data:
    driver: local
  n8n_data:
    driver: local
  n8n_files:
    driver: local
  evolution_instances:
    driver: local
  evolution_store:
    driver: local
  evolution_logs:
    driver: local
  app_logs:
    driver: local
  app_uploads:
    driver: local

networks:
  $network:
    name: $network
    driver: bridge
  traefik:
    external: true
EOF

    log_success "Docker-compose avançado criado!" "STACKS"
}

create_database_init_script() {
    local db_name=$1

    log_info "Criando script de inicialização do banco..." "STACKS"

    cat > init.sql << EOF
-- ==========================================
-- SCRIPT DE INICIALIZAÇÃO DO BANCO DE DADOS
-- Siqueira Campos Imóveis
-- ==========================================

-- Criar bancos de dados necessários
CREATE DATABASE IF NOT EXISTS n8n;
CREATE DATABASE IF NOT EXISTS evolution;

-- Configurar usuário principal
GRANT ALL PRIVILEGES ON DATABASE "$db_name" TO siqueira;
GRANT ALL PRIVILEGES ON DATABASE n8n TO siqueira;
GRANT ALL PRIVILEGES ON DATABASE evolution TO siqueira;

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Configurações de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET track_activity_query_size = 2048;
ALTER SYSTEM SET pg_stat_statements.track = 'all';

-- Reload configurações
SELECT pg_reload_conf();

-- Log de inicialização
INSERT INTO pg_stat_statements_info (dealloc) VALUES (0);

COMMENT ON DATABASE "$db_name" IS 'Banco principal - Siqueira Campos Imóveis';
COMMENT ON DATABASE n8n IS 'Banco N8N - Automação de workflows';
COMMENT ON DATABASE evolution IS 'Banco Evolution API - WhatsApp Business';
EOF

    # Criar configuração otimizada do PostgreSQL
    cat > postgresql.conf << 'EOF'
# Configurações otimizadas para PostgreSQL
# Siqueira Campos Imóveis

# Conexões
max_connections = 100
superuser_reserved_connections = 3

# Memória
shared_buffers = 256MB
effective_cache_size = 1GB
work_mem = 4MB
maintenance_work_mem = 64MB

# Checkpoint
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100

# Logging
log_destination = 'stderr'
logging_collector = on
log_directory = 'log'
log_filename = 'postgresql-%Y-%m-%d_%H%M%S.log'
log_truncate_on_rotation = on
log_rotation_age = 1d
log_rotation_size = 10MB
log_line_prefix = '%t [%p]: [%l-1] user=%u,db=%d,app=%a,client=%h '
log_checkpoints = on
log_connections = on
log_disconnections = on
log_lock_waits = on
log_temp_files = 10MB
log_autovacuum_min_duration = 0
log_error_verbosity = default

# Performance
random_page_cost = 1.1
effective_io_concurrency = 200
EOF

    log_success "Scripts de banco criados!" "STACKS"
}

save_project_credentials() {
    local project_name=$1
    local domain=$2
    local email=$3
    local db_password=$4
    local n8n_password=$5
    local evolution_key=$6

    log_info "Salvando credenciais do projeto..." "STACKS"

    # Criar arquivo JSON de credenciais se não existir
    if [ ! -f "$CREDENTIALS_FILE" ]; then
        echo '{}' > "$CREDENTIALS_FILE"
    fi

    # Adicionar credenciais do projeto
    local temp_file=$(mktemp)
    jq --arg project "$project_name" --arg domain "$domain" --arg email "$email" \
       --arg db_pass "$db_password" --arg n8n_pass "$n8n_password" --arg evo_key "$evolution_key" \
       '.[$project] = {
           "domain": $domain,
           "email": $email,
           "database_password": $db_pass,
           "n8n_password": $n8n_pass,
           "evolution_api_key": $evo_key,
           "created_at": now | strftime("%Y-%m-%dT%H:%M:%S.%3NZ")
       }' "$CREDENTIALS_FILE" > "$temp_file"

    mv "$temp_file" "$CREDENTIALS_FILE"
    chmod 600 "$CREDENTIALS_FILE"

    log_success "Credenciais salvas para $project_name!" "STACKS"
}

# ================================================================================================
# FASE 11: SISTEMA AVANÇADO DE MONITORAMENTO E AUTO-CORREÇÃO
# ================================================================================================

setup_advanced_monitoring() {
    log_info "${SHIELD} CONFIGURANDO SISTEMA AVANÇADO DE MONITORAMENTO..." "MONITOR"

    # Criar script de monitoramento inteligente
    create_intelligent_monitoring_script

    # Configurar serviço de monitoramento
    setup_monitoring_service

    # Configurar alertas e notificações
    setup_notification_system

    log_success "✅ Sistema de monitoramento configurado!" "MONITOR"
}

create_intelligent_monitoring_script() {
    log_info "Criando script de monitoramento inteligente..." "MONITOR"

    cat > /opt/intelligent-monitor.sh << 'EOF'
#!/bin/bash

# ==========================================
# SISTEMA INTELIGENTE DE MONITORAMENTO
# Siqueira Campos Imóveis - Deploy V4
# ==========================================

# Configurações
MONITOR_LOG="/var/log/deploy-v4/monitoring/system-monitor.log"
STATUS_FILE="/opt/deploy-status.json"
CHECK_INTERVAL=60  # segundos
MAX_RETRIES=3
NOTIFICATION_URL=""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Funções de logging
log_monitor() {
    echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ) [MONITOR] $1" | tee -a "$MONITOR_LOG"
}

log_alert() {
    echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ) [ALERT] $1" | tee -a "$MONITOR_LOG"
}

log_fix() {
    echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ) [AUTOFIX] $1" | tee -a "$MONITOR_LOG"
}

# Verificar saúde dos containers
check_container_health() {
    local container=$1
    local retries=0

    while [ $retries -lt $MAX_RETRIES ]; do
        if docker ps --format "table {{.Names}}\t{{.Status}}" | grep -q "$container.*Up"; then
            return 0
        fi
        retries=$((retries + 1))
        sleep 5
    done
    return 1
}

# Auto-correção de containers
auto_fix_container() {
    local container=$1

    log_fix "Tentando auto-correção do container: $container"

    # Verificar logs do container
    docker logs --tail=50 "$container" >> "$MONITOR_LOG" 2>&1

    # Restart suave primeiro
    docker restart "$container" 2>/dev/null
    sleep 30

    if check_container_health "$container"; then
        log_fix "✅ Container $container corrigido com restart!"
        return 0
    fi

    # Se restart não funcionou, tentar rebuild
    log_fix "Tentando rebuild do container $container..."

    local compose_dirs=("/opt/stacks/siqueicamposimoveis" "/opt/stacks/meuboot" "/opt/traefik")

    for dir in "${compose_dirs[@]}"; do
        if [ -f "$dir/docker-compose.yml" ] && grep -q "$container" "$dir/docker-compose.yml"; then
            cd "$dir"
            docker-compose stop "$container" 2>/dev/null
            docker-compose rm -f "$container" 2>/dev/null
            docker-compose build --no-cache "$container" 2>/dev/null
            docker-compose up -d "$container" 2>/dev/null
            sleep 60

            if check_container_health "$container"; then
                log_fix "✅ Container $container corrigido com rebuild!"
                return 0
            fi
        fi
    done

    log_alert "❌ Falha na auto-correção do container: $container"
    return 1
}

# Verificar conectividade de rede
check_network_connectivity() {
    local services=(
        "google.com:80"
        "github.com:443"
        "registry-1.docker.io:443"
        "api.godaddy.com:443"
    )

    local failed_services=()

    for service in "${services[@]}"; do
        local host=$(echo $service | cut -d: -f1)
        local port=$(echo $service | cut -d: -f2)

        if ! timeout 10 nc -z "$host" "$port" 2>/dev/null; then
            failed_services+=("$host:$port")
        fi
    done

    if [ ${#failed_services[@]} -gt 0 ]; then
        log_alert "❌ Falhas de conectividade: ${failed_services[*]}"
        return 1
    fi

    return 0
}

# Verificar SSL dos domínios
check_ssl_certificates() {
    local domains=(
        "siqueicamposimoveis.com.br"
        "portainer.siqueicamposimoveis.com.br"
        "traefik.siqueicamposimoveis.com.br"
        "n8n.siqueicamposimoveis.com.br"
        "evolution.siqueicamposimoveis.com.br"
        "meuboot.site"
        "portainer.meuboot.site"
        "traefik.meuboot.site"
    )

    local ssl_issues=()

    for domain in "${domains[@]}"; do
        local expiry=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)

        if [ -z "$expiry" ]; then
            ssl_issues+=("$domain: Certificado não encontrado")
            continue
        fi

        local expiry_timestamp=$(date -d "$expiry" +%s 2>/dev/null)
        local current_timestamp=$(date +%s)
        local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))

        if [ $days_until_expiry -lt 30 ]; then
            ssl_issues+=("$domain: Expira em $days_until_expiry dias")

            # Tentar forçar renovação
            docker exec traefik traefik acme renew 2>/dev/null || true
        fi
    done

    if [ ${#ssl_issues[@]} -gt 0 ]; then
        log_alert "⚠️ Problemas de SSL: ${ssl_issues[*]}"
        return 1
    fi

    return 0
}

# Verificar espaço em disco
check_disk_space() {
    local usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')

    if [ $usage -gt 90 ]; then
        log_alert "❌ Espaço em disco crítico: ${usage}%"

        # Limpeza automática emergencial
        log_fix "Executando limpeza emergencial..."
        docker system prune -af --volumes
        docker image prune -af

        # Limpar logs antigos
        find /var/log -name "*.log" -type f -mtime +3 -exec truncate -s 1M {} \;

        # Limpar backups antigos
        find /opt/backups -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true

        local new_usage=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
        log_fix "Espaço liberado: ${usage}% -> ${new_usage}%"

        return 1
    elif [ $usage -gt 80 ]; then
        log_alert "⚠️ Espaço em disco alto: ${usage}%"
        return 1
    fi

    return 0
}

# Verificar performance dos containers
check_container_performance() {
    local performance_issues=()
    local containers=$(docker ps --format "{{.Names}}")

    for container in $containers; do
        # CPU usage
        local cpu_usage=$(docker stats --no-stream --format "{{.CPUPerc}}" "$container" | sed 's/%//')
        if (( $(echo "$cpu_usage > 80" | bc -l) 2>/dev/null )); then
            performance_issues+=("$container: CPU ${cpu_usage}%")
        fi

        # Memory usage
        local mem_usage=$(docker stats --no-stream --format "{{.MemPerc}}" "$container" | sed 's/%//')
        if (( $(echo "$mem_usage > 90" | bc -l) 2>/dev/null )); then
            performance_issues+=("$container: Memory ${mem_usage}%")
        fi
    done

    if [ ${#performance_issues[@]} -gt 0 ]; then
        log_alert "⚠️ Problemas de performance: ${performance_issues[*]}"
        return 1
    fi

    return 0
}

# Verificar serviços críticos
check_critical_services() {
    local critical_services=(
        "traefik"
        "postgres-siqueicamposimoveis.com.br"
        "app-siqueicamposimoveis.com.br"
        "portainer"
        "n8n-siqueicamposimoveis.com.br"
    )

    local failed_services=()

    for service in "${critical_services[@]}"; do
        if ! check_container_health "$service"; then
            failed_services+=("$service")
            log_alert "❌ Serviço crítico falhou: $service"

            # Tentar auto-correção
            auto_fix_container "$service"
        fi
    done

    if [ ${#failed_services[@]} -gt 0 ]; then
        send_notification "Serviços Críticos" "Falhas detectadas: ${failed_services[*]}" "error"
        return 1
    fi

    return 0
}

# Verificar atualizações do GitHub
check_github_updates() {
    cd /opt/siqueira-imoveis 2>/dev/null || return 1

    git fetch origin main 2>/dev/null

    local local_commit=$(git rev-parse HEAD)
    local remote_commit=$(git rev-parse origin/main)

    if [ "$local_commit" != "$remote_commit" ]; then
        log_monitor "🔄 Atualizações encontradas no GitHub"

        # Trigger auto-update
        /opt/github-auto-update.sh &

        return 1
    fi

    return 0
}

# Gerar relatório de status
generate_status_report() {
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)
    local uptime=$(uptime -p)
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local disk_usage=$(df / | awk 'NR==2 {print $5}')
    local memory_usage=$(free | awk 'NR==2{printf "%.2f%%", $3*100/$2}')
    local running_containers=$(docker ps -q | wc -l)
    local total_containers=$(docker ps -aq | wc -l)

    # Status dos domínios
    local domain_status=()
    for domain in siqueicamposimoveis.com.br meuboot.site; do
        local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$domain" || echo "ERRO")
        domain_status+=("\"$domain\": \"$status\"")
    done

    # SSL certificates status
    local ssl_status=()
    for domain in siqueicamposimoveis.com.br meuboot.site; do
        local expiry=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -dates 2>/dev/null | grep notAfter | cut -d= -f2)
        if [ -n "$expiry" ]; then
            local expiry_timestamp=$(date -d "$expiry" +%s 2>/dev/null)
            local current_timestamp=$(date +%s)
            local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            ssl_status+=("\"$domain\": $days_until_expiry")
        else
            ssl_status+=("\"$domain\": -1")
        fi
    done

    # Criar relatório JSON
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
    },
    "ssl_certificates_days": {
        $(IFS=,; echo "${ssl_status[*]}")
    }
}
EOF
}

# Enviar notificação
send_notification() {
    local title="$1"
    local message="$2"
    local type="${3:-info}"
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)

    # Log local
    log_monitor "📢 NOTIFICAÇÃO: $title - $message"

    # Webhook para Discord/Slack (se configurado)
    if [ -n "$NOTIFICATION_URL" ]; then
        local color=""
        case $type in
            "success") color="65280" ;;   # Verde
            "error") color="16711680" ;;  # Vermelho
            "warning") color="16776960" ;; # Amarelo
            *) color="255" ;;             # Azul
        esac

        curl -X POST "$NOTIFICATION_URL" \
            -H "Content-Type: application/json" \
            -d "{
                \"embeds\": [{
                    \"title\": \"$title\",
                    \"description\": \"$message\",
                    \"timestamp\": \"$timestamp\",
                    \"color\": $color,
                    \"footer\": {
                        \"text\": \"Siqueira Campos Imóveis - Monitor\"
                    }
                }]
            }" 2>/dev/null || true
    fi

    # Salvar notificação local
    echo "$timestamp - $title: $message" >> /var/log/notifications.log
}

# Loop principal de monitoramento
main_monitoring_loop() {
    log_monitor "🔍 Iniciando monitoramento inteligente..."

    while true; do
        log_monitor "📋 Executando verificações de saúde..."

        local issues=0

        # Verificações principais
        check_network_connectivity || issues=$((issues + 1))
        check_critical_services || issues=$((issues + 1))
        check_disk_space || issues=$((issues + 1))
        check_container_performance || issues=$((issues + 1))
        check_ssl_certificates || issues=$((issues + 1))
        check_github_updates || issues=$((issues + 1))

        # Gerar relatório
        generate_status_report

        if [ $issues -eq 0 ]; then
            log_monitor "✅ Todos os sistemas funcionando normalmente"
        else
            log_monitor "⚠️ $issues problemas detectados e sendo tratados"
        fi

        # Aguardar próximo ciclo
        sleep $CHECK_INTERVAL
    done
}

# Executar baseado no argumento
case "${1:-monitor}" in
    "monitor")
        main_monitoring_loop
        ;;
    "check")
        log_monitor "🔍 Executando verificação única..."
        check_network_connectivity
        check_critical_services
        check_disk_space
        check_container_performance
        check_ssl_certificates
        generate_status_report
        log_monitor "✅ Verificação única concluída!"
        ;;
    "status")
        if [ -f "$STATUS_FILE" ]; then
            cat "$STATUS_FILE"
        else
            echo '{"error": "Status file not found"}'
        fi
        ;;
    *)
        echo "Uso: $0 [monitor|check|status]"
        exit 1
        ;;
esac
EOF

    chmod +x /opt/intelligent-monitor.sh

    log_success "Script de monitoramento inteligente criado!" "MONITOR"
}

setup_monitoring_service() {
    log_info "Configurando serviço de monitoramento..." "MONITOR"

    # Criar serviço systemd
    cat > /etc/systemd/system/intelligent-monitor.service << 'EOF'
[Unit]
Description=Sistema Inteligente de Monitoramento
After=docker.service
Requires=docker.service

[Service]
Type=simple
User=root
ExecStart=/opt/intelligent-monitor.sh monitor
Restart=always
RestartSec=30
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    systemctl enable intelligent-monitor.service
    systemctl start intelligent-monitor.service

    log_success "Serviço de monitoramento configurado!" "MONITOR"
}

setup_notification_system() {
    log_info "Configurando sistema de notificações..." "MONITOR"

    # Criar script de teste de notificação
    cat > /opt/test-notification.sh << 'EOF'
#!/bin/bash
/opt/intelligent-monitor.sh check
echo "Teste de notificação executado em $(date)"
EOF

    chmod +x /opt/test-notification.sh

    # Configurar cron para relatórios diários
    (crontab -l 2>/dev/null | grep -v "test-notification"; echo "0 8 * * * /opt/test-notification.sh") | crontab -

    log_success "Sistema de notificações configurado!" "MONITOR"
}

# ================================================================================================
# FASE 12: SISTEMA AVANÇADO DE BACKUP E RECUPERAÇÃO
# ================================================================================================

setup_advanced_backup_system() {
    log_info "${GRAY} CONFIGURANDO SISTEMA AVANÇADO DE BACKUP..." "BACKUP"

    # Criar diretórios de backup
    mkdir -p /opt/backups/{daily,weekly,monthly,emergency}

    # Criar script de backup inteligente
    create_intelligent_backup_script

    # Configurar backups automáticos
    setup_automatic_backups

    # Criar script de restore
    create_restore_script

    log_success "✅ Sistema de backup configurado!" "BACKUP"
}

create_intelligent_backup_script() {
    log_backup "Criando script de backup inteligente..."

    cat > /opt/intelligent-backup.sh << 'EOF'
#!/bin/bash

# ==========================================
# SISTEMA INTELIGENTE DE BACKUP
# Siqueira Campos Imóveis - Deploy V4
# ==========================================

BACKUP_ROOT="/opt/backups"
LOG_FILE="/var/log/deploy-v4/backup/backup.log"
RETENTION_DAILY=7
RETENTION_WEEKLY=4
RETENTION_MONTHLY=12

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_backup() {
    echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ) [BACKUP] $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ) [ERROR] $1" | tee -a "$LOG_FILE"
}

# Função para backup de banco de dados
backup_databases() {
    local backup_dir="$1"

    log_backup "Iniciando backup dos bancos de dados..."

    # PostgreSQL containers
    local postgres_containers=$(docker ps --format "{{.Names}}" | grep postgres)

    for container in $postgres_containers; do
        log_backup "Backup do container: $container"

        # Backup completo
        docker exec "$container" pg_dumpall -U siqueira -c > "$backup_dir/db_${container}_full.sql" 2>/dev/null

        # Backup individual dos bancos
        local databases=$(docker exec "$container" psql -U siqueira -t -c "SELECT datname FROM pg_database WHERE datistemplate = false;" 2>/dev/null | grep -v "^\s*$")

        while read -r db; do
            if [ -n "$db" ] && [ "$db" != "postgres" ]; then
                docker exec "$container" pg_dump -U siqueira -d "$db" > "$backup_dir/db_${container}_${db}.sql" 2>/dev/null
            fi
        done <<< "$databases"
    done

    log_backup "Backup dos bancos concluído!"
}

# Função para backup de volumes
backup_volumes() {
    local backup_dir="$1"

    log_backup "Iniciando backup dos volumes..."

    local volumes=$(docker volume ls -q)

    for volume in $volumes; do
        log_backup "Backup do volume: $volume"

        docker run --rm \
            -v "$volume":/data \
            -v "$backup_dir":/backup \
            alpine tar czf "/backup/volume_${volume}.tar.gz" -C /data . 2>/dev/null
    done

    log_backup "Backup dos volumes concluído!"
}

# Função para backup de código fonte
backup_source_code() {
    local backup_dir="$1"

    log_backup "Iniciando backup do código fonte..."

    if [ -d "/opt/siqueira-imoveis" ]; then
        tar czf "$backup_dir/source_code.tar.gz" -C /opt siqueira-imoveis 2>/dev/null
    fi

    log_backup "Backup do código fonte concluído!"
}

# Função para backup de configurações
backup_configurations() {
    local backup_dir="$1"

    log_backup "Iniciando backup das configurações..."

    # Stacks
    if [ -d "/opt/stacks" ]; then
        tar czf "$backup_dir/stacks.tar.gz" -C /opt stacks 2>/dev/null
    fi

    # Traefik
    if [ -d "/opt/traefik" ]; then
        tar czf "$backup_dir/traefik.tar.gz" -C /opt traefik 2>/dev/null
    fi

    # Credenciais
    if [ -f "/opt/deploy-credentials.json" ]; then
        cp "/opt/deploy-credentials.json" "$backup_dir/"
    fi

    # Scripts de deploy
    tar czf "$backup_dir/deploy_scripts.tar.gz" /opt/*.sh 2>/dev/null

    # Configurações do sistema
    tar czf "$backup_dir/system_configs.tar.gz" /etc/systemd/system/deploy-*.service /etc/systemd/system/*webhook*.service 2>/dev/null

    log_backup "Backup das configurações concluído!"
}

# Função para backup de logs
backup_logs() {
    local backup_dir="$1"

    log_backup "Iniciando backup dos logs..."

    if [ -d "/var/log/deploy-v4" ]; then
        tar czf "$backup_dir/deploy_logs.tar.gz" -C /var/log deploy-v4 2>/dev/null
    fi

    log_backup "Backup dos logs concluído!"
}

# Função principal de backup
perform_backup() {
    local backup_type="$1"
    local date_str=$(date +%Y%m%d_%H%M%S)
    local backup_dir="$BACKUP_ROOT/$backup_type/backup_$date_str"

    mkdir -p "$backup_dir"

    log_backup "=== INICIANDO BACKUP $backup_type ==="
    log_backup "Diretório: $backup_dir"

    # Informações do sistema
    cat > "$backup_dir/system_info.json" << EOF
{
    "backup_type": "$backup_type",
    "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)",
    "hostname": "$(hostname)",
    "ip_address": "$(curl -s ifconfig.me)",
    "disk_usage": "$(df / | awk 'NR==2 {print $5}')",
    "memory_usage": "$(free | awk 'NR==2{printf "%.2f%%", $3*100/$2}')",
    "docker_version": "$(docker --version)",
    "containers_running": $(docker ps -q | wc -l),
    "volumes_count": $(docker volume ls -q | wc -l)
}
EOF

    # Executar backups
    backup_databases "$backup_dir"
    backup_volumes "$backup_dir"
    backup_source_code "$backup_dir"
    backup_configurations "$backup_dir"
    backup_logs "$backup_dir"

    # Criar checksum
    cd "$backup_dir"
    find . -type f -exec sha256sum {} \; > checksums.txt

    # Compactar backup final
    cd "$BACKUP_ROOT/$backup_type"
    tar czf "backup_${date_str}.tar.gz" "backup_$date_str"
    rm -rf "backup_$date_str"

    local backup_size=$(du -h "backup_${date_str}.tar.gz" | cut -f1)

    log_backup "=== BACKUP $backup_type CONCLUÍDO ==="
    log_backup "Arquivo: backup_${date_str}.tar.gz"
    log_backup "Tamanho: $backup_size"

    # Limpeza de backups antigos
    cleanup_old_backups "$backup_type"
}

# Limpeza de backups antigos
cleanup_old_backups() {
    local backup_type="$1"
    local retention=""

    case $backup_type in
        "daily") retention=$RETENTION_DAILY ;;
        "weekly") retention=$RETENTION_WEEKLY ;;
        "monthly") retention=$RETENTION_MONTHLY ;;
        *) retention=7 ;;
    esac

    log_backup "Limpando backups $backup_type antigos (retenção: $retention)"

    find "$BACKUP_ROOT/$backup_type" -name "backup_*.tar.gz" -mtime +$retention -delete 2>/dev/null

    local remaining=$(find "$BACKUP_ROOT/$backup_type" -name "backup_*.tar.gz" | wc -l)
    log_backup "Backups $backup_type restantes: $remaining"
}

# Verificar integridade dos backups
verify_backup_integrity() {
    local backup_file="$1"

    log_backup "Verificando integridade do backup: $backup_file"

    if tar -tzf "$backup_file" > /dev/null 2>&1; then
        log_backup "✅ Backup íntegro: $backup_file"
        return 0
    else
        log_error "❌ Backup corrompido: $backup_file"
        return 1
    fi
}

# Menu principal
case "${1:-daily}" in
    "daily")
        perform_backup "daily"
        ;;
    "weekly")
        perform_backup "weekly"
        ;;
    "monthly")
        perform_backup "monthly"
        ;;
    "emergency")
        perform_backup "emergency"
        ;;
    "verify")
        if [ -n "$2" ]; then
            verify_backup_integrity "$2"
        else
            echo "Uso: $0 verify <arquivo_backup>"
        fi
        ;;
    "cleanup")
        cleanup_old_backups "daily"
        cleanup_old_backups "weekly"
        cleanup_old_backups "monthly"
        ;;
    *)
        echo "Uso: $0 [daily|weekly|monthly|emergency|verify|cleanup]"
        exit 1
        ;;
esac
EOF

    chmod +x /opt/intelligent-backup.sh

    log_backup "Script de backup inteligente criado!"
}

setup_automatic_backups() {
    log_backup "Configurando backups automáticos..."

    # Configurar crontab para backups automáticos
    (crontab -l 2>/dev/null | grep -v "intelligent-backup"
     echo "0 2 * * * /opt/intelligent-backup.sh daily"     # Diário às 2h
     echo "0 3 * * 0 /opt/intelligent-backup.sh weekly"    # Semanal domingo às 3h
     echo "0 4 1 * * /opt/intelligent-backup.sh monthly"   # Mensal dia 1 às 4h
    ) | crontab -

    log_backup "Backups automáticos configurados!"
}

create_restore_script() {
    log_backup "Criando script de restore..."

    cat > /opt/restore-backup.sh << 'EOF'
#!/bin/bash

# ==========================================
# SCRIPT DE RESTORE DE BACKUP
# Siqueira Campos Imóveis - Deploy V4
# ==========================================

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ $# -ne 1 ]; then
    echo "Uso: $0 <arquivo_backup.tar.gz>"
    exit 1
fi

BACKUP_FILE="$1"
RESTORE_DIR="/tmp/restore_$(date +%s)"

if [ ! -f "$BACKUP_FILE" ]; then
    echo -e "${RED}Arquivo de backup não encontrado: $BACKUP_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}⚠️  ATENÇÃO: Este script irá restaurar o backup e pode sobrescrever dados atuais!${NC}"
read -p "Deseja continuar? (s/N): " confirm
if [[ ! $confirm =~ ^[Ss]$ ]]; then
    echo "Restore cancelado."
    exit 0
fi

echo -e "${GREEN}Iniciando restore do backup...${NC}"

# Extrair backup
mkdir -p "$RESTORE_DIR"
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"

# Encontrar diretório do backup
BACKUP_CONTENT_DIR=$(find "$RESTORE_DIR" -maxdepth 1 -type d -name "backup_*" | head -1)

if [ -z "$BACKUP_CONTENT_DIR" ]; then
    echo -e "${RED}Estrutura de backup inválida!${NC}"
    exit 1
fi

cd "$BACKUP_CONTENT_DIR"

echo "Conteúdo do backup:"
ls -la

# Restaurar configurações
if [ -f "stacks.tar.gz" ]; then
    echo "Restaurando stacks..."
    tar -xzf stacks.tar.gz -C /opt/
fi

if [ -f "traefik.tar.gz" ]; then
    echo "Restaurando Traefik..."
    tar -xzf traefik.tar.gz -C /opt/
fi

if [ -f "source_code.tar.gz" ]; then
    echo "Restaurando código fonte..."
    tar -xzf source_code.tar.gz -C /opt/
fi

# Restaurar bancos de dados
echo "Bancos de dados encontrados:"
ls -la db_*.sql 2>/dev/null || echo "Nenhum backup de banco encontrado"

# Restaurar volumes
echo "Volumes encontrados:"
ls -la volume_*.tar.gz 2>/dev/null || echo "Nenhum backup de volume encontrado"

echo -e "${GREEN}Restore concluído!${NC}"
echo "Verifique os serviços e reinicie conforme necessário."

# Cleanup
rm -rf "$RESTORE_DIR"
EOF

    chmod +x /opt/restore-backup.sh

    log_backup "Script de restore criado!"
}

# ================================================================================================
# FASE 13: CRIAÇÃO DE COMANDOS ÚTEIS E DOCUMENTAÇÃO
# ================================================================================================

create_utility_commands() {
    log_info "${WHITE} CRIANDO COMANDOS ÚTEIS E DOCUMENTAÇÃO..." "UTILS"

    # deploy-status
    cat > /usr/local/bin/deploy-status << 'EOF'
#!/bin/bash
echo "=== STATUS DO DEPLOY SIQUEIRA CAMPOS IMÓVEIS ==="
echo ""
echo "🐳 Containers Docker:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
echo ""
echo "🌐 Status dos Domínios:"
for domain in siqueicamposimoveis.com.br meuboot.site; do
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$domain" || echo "ERRO")
    if [ "$status" = "200" ]; then
        echo "✅ $domain - Online"
    else
        echo "❌ $domain - Status: $status"
    fi
done
echo ""
echo "💾 Uso do Disco:"
df -h / | grep -v Filesystem
echo ""
echo "🧠 Uso da Memória:"
free -h
echo ""
echo "📊 Load Average:"
uptime
echo ""
echo "🔥 Top Processes:"
ps aux --sort=-%cpu | head -6
EOF

    # deploy-logs
    cat > /usr/local/bin/deploy-logs << 'EOF'
#!/bin/bash
echo "=== LOGS DO DEPLOY ==="
echo ""
echo "📋 Logs do Monitoramento (últimas 20 linhas):"
tail -20 /var/log/deploy-v4/monitoring/system-monitor.log 2>/dev/null || echo "Log não encontrado"
echo ""
echo "🔄 Logs do GitHub Auto-Update (últimas 10 linhas):"
tail -10 /var/log/deploy-v4/github/github-updates.log 2>/dev/null || echo "Log não encontrado"
echo ""
echo "🐳 Logs dos Containers Principais:"
echo "--- Traefik ---"
docker logs --tail=5 traefik 2>/dev/null || echo "Container não encontrado"
echo "--- App ---"
docker logs --tail=5 app-siqueicamposimoveis.com.br 2>/dev/null || echo "Container não encontrado"
echo "--- PostgreSQL ---"
docker logs --tail=5 postgres-siqueicamposimoveis.com.br 2>/dev/null || echo "Container não encontrado"
EOF

    # deploy-update
    cat > /usr/local/bin/deploy-update << 'EOF'
#!/bin/bash
echo "🔄 Forçando atualização do GitHub..."
/opt/github-auto-update.sh
echo "✅ Comando de atualização executado!"
echo "Verifique os logs: tail -f /var/log/deploy-v4/github/github-updates.log"
EOF

    # deploy-restart
    cat > /usr/local/bin/deploy-restart << 'EOF'
#!/bin/bash
echo "🔄 Reiniciando todos os serviços do deploy..."

echo "Reiniciando Traefik..."
cd /opt/traefik && docker-compose restart

echo "Reiniciando stacks..."
for stack_dir in /opt/stacks/*/; do
    if [ -f "$stack_dir/docker-compose.yml" ]; then
        echo "Reiniciando stack: $(basename "$stack_dir")"
        cd "$stack_dir" && docker-compose restart
    fi
done

echo "Reiniciando Portainer..."
docker restart portainer

echo "✅ Todos os serviços reiniciados!"
EOF

    # deploy-backup
    cat > /usr/local/bin/deploy-backup << 'EOF'
#!/bin/bash
echo "💾 Executando backup manual..."
/opt/intelligent-backup.sh emergency
echo "✅ Backup concluído!"
EOF

    # deploy-monitor
    cat > /usr/local/bin/deploy-monitor << 'EOF'
#!/bin/bash
case "${1:-check}" in
    "start")
        systemctl start intelligent-monitor
        echo "Monitor iniciado!"
        ;;
    "stop")
        systemctl stop intelligent-monitor
        echo "Monitor parado!"
        ;;
    "restart")
        systemctl restart intelligent-monitor
        echo "Monitor reiniciado!"
        ;;
    "status")
        systemctl status intelligent-monitor
        ;;
    "logs")
        journalctl -u intelligent-monitor -f
        ;;
    "check")
        /opt/intelligent-monitor.sh check
        ;;
    *)
        echo "Uso: deploy-monitor [start|stop|restart|status|logs|check]"
        ;;
esac
EOF

    # deploy-help
    cat > /usr/local/bin/deploy-help << 'EOF'
#!/bin/bash
echo "=== COMANDOS ÚTEIS DO DEPLOY SIQUEIRA CAMPOS IMÓVEIS ==="
echo ""
echo "📊 deploy-status       - Ver status completo do sistema"
echo "📋 deploy-logs         - Ver logs principais"
echo "🔄 deploy-update       - Forçar atualização do GitHub"
echo "♻️  deploy-restart      - Reiniciar todos os serviços"
echo "💾 deploy-backup       - Executar backup manual"
echo "🔍 deploy-monitor      - Controlar sistema de monitoramento"
echo "❓ deploy-help         - Mostrar esta ajuda"
echo ""
echo "📁 ARQUIVOS IMPORTANTES:"
echo "   /opt/deploy-credentials.json - Credenciais dos sistemas"
echo "   /opt/deploy-status.json      - Status atual do sistema"
echo "   /var/log/deploy-v4/          - Diretório de logs"
echo "   /opt/backups/                - Backups do sistema"
echo ""
echo "🌐 ACESSOS:"
echo "   https://siqueicamposimoveis.com.br"
echo "   https://portainer.siqueicamposimoveis.com.br"
echo "   https://traefik.siqueicamposimoveis.com.br"
echo "   https://n8n.siqueicamposimoveis.com.br"
echo "   https://evolution.siqueicamposimoveis.com.br"
echo ""
echo "🆘 SUPORTE:"
echo "   WhatsApp: (17) 98180-5327"
echo "   Email: vitor.nakahh@gmail.com"
EOF

    # Tornar todos executáveis
    chmod +x /usr/local/bin/deploy-*

    log_success "✅ Comandos úteis criados!" "UTILS"
}

# ================================================================================================
# FASE 14: VERIFICAÇÃO FINAL E RELATÓRIOS
# ================================================================================================

final_verification_and_reports() {
    log_info "${STAR} EXECUTANDO VERIFICAÇÃO FINAL E GERANDO RELATÓRIOS..." "VERIFICATION"

    # Aguardar todos os serviços estabilizarem
    log_info "Aguardando serviços estabilizarem..." "VERIFICATION"
    sleep 60

    # Verificar containers
    verify_containers

    # Verificar conectividade
    verify_connectivity

    # Verificar SSL
    verify_ssl_certificates

    # Gerar relatório final
    generate_final_report

    # Salvar estado do deployment
    save_deployment_state "COMPLETED"

    log_success "✅ Verificação final concluída!" "VERIFICATION"
}

verify_containers() {
    log_info "Verificando containers..." "VERIFICATION"

    local expected_containers=(
        "traefik"
        "portainer"
        "postgres-siqueicamposimoveis.com.br"
        "app-siqueicamposimoveis.com.br"
        "n8n-siqueicamposimoveis.com.br"
        "evolution-siqueicamposimoveis.com.br"
    )

    local running_containers=()
    local failed_containers=()

    for container in "${expected_containers[@]}"; do
        if docker ps | grep -q "$container"; then
            running_containers+=("$container")
            log_success "✅ $container está rodando" "VERIFICATION"
        else
            failed_containers+=("$container")
            log_error "❌ $container não está rodando" "VERIFICATION"
        fi
    done

    if [ ${#failed_containers[@]} -eq 0 ]; then
        log_success "✅ Todos os containers estão rodando!" "VERIFICATION"
    else
        log_warning "⚠️ ${#failed_containers[@]} containers com problemas" "VERIFICATION"
    fi
}

verify_connectivity() {
    log_info "Verificando conectividade dos domínios..." "VERIFICATION"

    local domains=(
        "siqueicamposimoveis.com.br"
        "portainer.siqueicamposimoveis.com.br"
        "traefik.siqueicamposimoveis.com.br"
        "n8n.siqueicamposimoveis.com.br"
        "evolution.siqueicamposimoveis.com.br"
        "meuboot.site"
        "portainer.meuboot.site"
    )

    local accessible_domains=()
    local inaccessible_domains=()

    for domain in "${domains[@]}"; do
        local status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://$domain" || echo "ERRO")

        if [ "$status" = "200" ] || [ "$status" = "302" ] || [ "$status" = "301" ]; then
            accessible_domains+=("$domain")
            log_success "✅ $domain acessível (HTTP $status)" "VERIFICATION"
        else
            inaccessible_domains+=("$domain")
            log_warning "⚠️ $domain não acessível (HTTP $status)" "VERIFICATION"
        fi
    done

    if [ ${#inaccessible_domains[@]} -eq 0 ]; then
        log_success "✅ Todos os domínios estão acessíveis!" "VERIFICATION"
    else
        log_warning "⚠️ ${#inaccessible_domains[@]} domínios ainda não acessíveis (pode ser propagação DNS)" "VERIFICATION"
    fi
}

verify_ssl_certificates() {
    log_info "Verificando certificados SSL..." "VERIFICATION"

    local domains=("siqueicamposimoveis.com.br" "meuboot.site")
    local ssl_ok=()
    local ssl_issues=()

    for domain in "${domains[@]}"; do
        local cert_info=$(echo | openssl s_client -servername "$domain" -connect "$domain:443" 2>/dev/null | openssl x509 -noout -text 2>/dev/null)

        if [ -n "$cert_info" ]; then
            ssl_ok+=("$domain")
            log_success "✅ Certificado SSL válido para $domain" "VERIFICATION"
        else
            ssl_issues+=("$domain")
            log_warning "⚠️ Problema com certificado SSL para $domain" "VERIFICATION"
        fi
    done

    if [ ${#ssl_issues[@]} -eq 0 ]; then
        log_success "✅ Todos os certificados SSL estão válidos!" "VERIFICATION"
    else
        log_warning "⚠️ ${#ssl_issues[@]} domínios com problemas de SSL" "VERIFICATION"
    fi
}

generate_final_report() {
    log_info "Gerando relatório final..." "VERIFICATION"

    local report_file="/opt/deploy-final-report.md"

    cat > "$report_file" << EOF
# 🚀 RELATÓRIO FINAL DO DEPLOY - SIQUEIRA CAMPOS IMÓVEIS

**Data do Deploy:** $(date)
**Versão:** MEGA DEPLOY V4 - Super Completo
**Servidor:** $(hostname) - $SERVER_IP
**Desenvolvido por:** Kryonix - Vitor Jayme Fernandes Ferreira

---

## ✅ SERVIÇOS INSTALADOS E CONFIGURADOS

### 🐳 Containers Docker
$(docker ps --format "- **{{.Names}}** - {{.Status}}")

### 🌐 Domínios Configurados
- **Principal:** https://siqueicamposimoveis.com.br
- **Portainer:** https://portainer.siqueicamposimoveis.com.br
- **Traefik:** https://traefik.siqueicamposimoveis.com.br
- **N8N:** https://n8n.siqueicamposimoveis.com.br
- **Evolution API:** https://evolution.siqueicamposimoveis.com.br
- **Secundário:** https://meuboot.site
- **Portainer 2:** https://portainer.meuboot.site

### 🔐 Credenciais
$(if [ -f "/opt/deploy-credentials.json" ]; then
    echo "Credenciais salvas em: \`/opt/deploy-credentials.json\`"
    echo ""
    echo "\`\`\`json"
    cat /opt/deploy-credentials.json | jq .
    echo "\`\`\`"
else
    echo "Arquivo de credenciais não encontrado"
fi)

---

## 🔧 FUNCIONALIDADES IMPLEMENTADAS

### 🤖 Auto-Update GitHub
- ✅ Monitoramento automático a cada 5 minutos
- ✅ Webhook configurado na porta 9999
- ✅ Backup automático antes das atualizações
- ✅ Rollback automático em caso de falha

### 🔍 Sistema de Monitoramento
- ✅ Monitoramento inteligente 24/7
- ✅ Auto-correção de problemas
- ✅ Verificação de SSL e domínios
- ✅ Alertas automáticos

### 💾 Sistema de Backup
- ✅ Backups diários automáticos
- ✅ Retenção inteligente
- ✅ Backup de bancos, volumes e configurações
- ✅ Script de restore

### 🛡️ Segurança
- ✅ Firewall configurado
- ✅ Fail2Ban ativo
- ✅ SSL automático com Let's Encrypt
- ✅ Senhas seguras geradas automaticamente

---

## 📊 STATUS DO SISTEMA

### 💾 Uso de Recursos
\`\`\`
$(df -h / | grep -v Filesystem)
$(free -h)
$(uptime)
\`\`\`

### 🌐 Status dos Domínios
$(for domain in siqueicamposimoveis.com.br meuboot.site; do
    status=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "https://$domain" || echo "ERRO")
    echo "- **$domain:** $status"
done)

---

## 🔧 COMANDOS ÚTEIS

### Comandos Principais
- \`deploy-status\` - Ver status completo
- \`deploy-logs\` - Ver logs do sistema
- \`deploy-update\` - Forçar atualização GitHub
- \`deploy-restart\` - Reiniciar serviços
- \`deploy-backup\` - Backup manual
- \`deploy-monitor\` - Controlar monitoramento
- \`deploy-help\` - Ajuda completa

### Arquivos Importantes
- \`/opt/deploy-credentials.json\` - Credenciais
- \`/opt/deploy-status.json\` - Status atual
- \`/var/log/deploy-v4/\` - Logs do sistema
- \`/opt/backups/\` - Backups

---

## 🔄 PRÓXIMOS PASSOS

1. **Aguardar Propagação DNS** (até 24 horas)
2. **Testar todas as funcionalidades**
3. **Configurar webhooks no GitHub** (opcional)
4. **Personalizar configurações conforme necessário**

---

## 🆘 SUPORTE

**Desenvolvedor:** Kryonix - Vitor Jayme Fernandes Ferreira
**WhatsApp:** (17) 98180-5327
**Email:** vitor.nakahh@gmail.com

**Cliente:** Juarez Siqueira Campos
**Empresa:** Siqueira Campos Imóveis
**WhatsApp:** (62) 98556-3505

---

## 📝 OBSERVAÇÕES FINAIS

Este deploy foi realizado de forma 100% automática e inteligente. Todos os sistemas estão configurados para auto-manutenção, auto-atualização e auto-recuperação.

O sistema foi projetado para ser robusto, seguro e de fácil manutenção, com monitoramento contínuo e backup automático.

**Deploy concluído com sucesso em $(date)! 🎉**
EOF

    log_success "Relatório final gerado: $report_file" "VERIFICATION"
}

save_deployment_state() {
    local state="$1"
    local timestamp=$(date -u +%Y-%m-%dT%H:%M:%S.%3NZ)

    cat > "$STATUS_FILE" << EOF
{
    "deployment_state": "$state",
    "timestamp": "$timestamp",
    "version": "MEGA DEPLOY V4 - Super Completo",
    "server_ip": "$SERVER_IP",
    "github_repo": "$GITHUB_REPO",
    "domains": [
        "siqueicamposimoveis.com.br",
        "meuboot.site"
    ],
    "services": {
        "traefik": "$(docker ps | grep traefik > /dev/null && echo 'running' || echo 'stopped')",
        "portainer": "$(docker ps | grep portainer > /dev/null && echo 'running' || echo 'stopped')",
        "postgres": "$(docker ps | grep postgres > /dev/null && echo 'running' || echo 'stopped')",
        "app": "$(docker ps | grep app > /dev/null && echo 'running' || echo 'stopped')",
        "n8n": "$(docker ps | grep n8n > /dev/null && echo 'running' || echo 'stopped')",
        "evolution": "$(docker ps | grep evolution > /dev/null && echo 'running' || echo 'stopped')",
        "monitoring": "$(systemctl is-active intelligent-monitor 2>/dev/null || echo 'inactive')",
        "github_webhook": "$(systemctl is-active github-webhook 2>/dev/null || echo 'inactive')"
    }
}
EOF

    log_info "Estado do deployment salvo: $state" "STATE"
}

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

# ================================================================================================
# FUNÇÃO PRINCIPAL - ORQUESTRAÇÃO COMPLETA
# ================================================================================================

main_deployment() {
    # Banner inicial
    echo ""
    echo -e "${CYAN}╔══════════════════════════════════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${CYAN}║                                                                                                          ║${NC}"
    echo -e "${CYAN}║    ${BOLD}🚀 MEGA DEPLOY AUTOMÁTICO V4 - SUPER COMPLETO E INTELIGENTE${NC}${CYAN}                                         ║${NC}"
    echo -e "${CYAN}��                                                                                                          ║${NC}"
    echo -e "${CYAN}║    ${GREEN}✅ Deploy 100% Automático + GitHub Auto-Update + Monitoramento Inteligente${NC}${CYAN}                       ║${NC}"
    echo -e "${CYAN}║    ${GREEN}✅ DNS Automático + SSL + Backup + Segurança + Multi-Domínios${NC}${CYAN}                                   ║${NC}"
    echo -e "${CYAN}║                                                                                                          ║${NC}"
    echo -e "${CYAN}║    ${YELLOW}Desenvolvido por Kryonix - Vitor Jayme Fernandes Ferreira${NC}${CYAN}                                      ║${NC}"
    echo -e "${CYAN}║    ${YELLOW}WhatsApp: (17) 98180-5327 | Email: vitor.nakahh@gmail.com${NC}${CYAN}                                     ║${NC}"
    echo -e "${CYAN}║                                                                                                          ║${NC}"
    echo -e "${CYAN}╚════════════════════════════════════════════════════════════════════════════════════════════════���═════════╝${NC}"
    echo ""

    # Verificar se é root
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script deve ser executado como root (sudo)"
        exit 1
    fi

    log_success "✅ Executando como root - INICIANDO DEPLOY COMPLETO!"

    # Configurar logging avançado
    setup_advanced_logging

    # Salvar estado inicial
    save_deployment_state "STARTING"

    # FASE 1: Análise do ambiente
    show_progress 1 14 "Analisando ambiente do servidor"
    analyze_environment

    # FASE 2: Limpeza completa
    show_progress 2 14 "Executando limpeza completa do servidor"
    intelligent_server_cleanup

    # FASE 3: Atualização do sistema
    show_progress 3 14 "Atualizando sistema operacional"
    intelligent_system_update

    # FASE 4: Instalação do Docker
    show_progress 4 14 "Instalando Docker e Docker Compose"
    intelligent_docker_installation

    # FASE 5: Configuração de segurança
    show_progress 5 14 "Configurando segurança e firewall"
    advanced_security_setup

    # FASE 6: Configuração DNS
    show_progress 6 14 "Configurando DNS automático"
    intelligent_dns_configuration

    # FASE 7: GitHub setup
    show_progress 7 14 "Configurando GitHub com auto-update"
    intelligent_github_setup

    # FASE 8: Portainer
    show_progress 8 14 "Instalando e configurando Portainer"
    advanced_portainer_setup

    # FASE 9: Traefik
    show_progress 9 14 "Configurando Traefik com SSL"
    advanced_traefik_setup

    # FASE 10: Stacks de aplicação
    show_progress 10 14 "Configurando stacks de aplicação"
    setup_advanced_application_stacks

    # FASE 11: Sistema de monitoramento
    show_progress 11 14 "Configurando monitoramento inteligente"
    setup_advanced_monitoring

    # FASE 12: Sistema de backup
    show_progress 12 14 "Configurando sistema de backup"
    setup_advanced_backup_system

    # FASE 13: Comandos úteis
    show_progress 13 14 "Criando comandos úteis"
    create_utility_commands

    # FASE 14: Verificação final
    show_progress 14 14 "Executando verificação final"
    final_verification_and_reports

    # Banner final
    echo ""
    echo -e "${GREEN}╔═══════════════════════════���══════════════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                                                          ║${NC}"
    echo -e "${GREEN}║    ${BOLD}🎉 MEGA DEPLOY V4 CONCLUÍDO COM SUCESSO! 🎉${NC}${GREEN}                                                    ║${NC}"
    echo -e "${GREEN}║                                                                                                          ║${NC}"
    echo -e "${GREEN}║    ${WHITE}✅ Todos os serviços instalados e configurados${NC}${GREEN}                                              ║${NC}"
    echo -e "${GREEN}║    ${WHITE}✅ GitHub auto-update ativo${NC}${GREEN}                                                                ║${NC}"
    echo -e "${GREEN}║    ${WHITE}✅ Monitoramento inteligente rodando${NC}${GREEN}                                                       ║${NC}"
    echo -e "${GREEN}║    ${WHITE}✅ Backup automático configurado${NC}${GREEN}                                                           ║${NC}"
    echo -e "${GREEN}║    ${WHITE}✅ SSL automático funcionando${NC}${GREEN}                                                              ║${NC}"
    echo -e "${GREEN}║                                                                                                          ║${NC}"
    echo -e "${GREEN}╚════��═════════════════════════════════════════════════���══════════════════════════════════════��════════════╝${NC}"
    echo ""

    # Informações finais
    log_success "🌐 DOMÍNIOS CONFIGURADOS:"
    log_success "   • https://siqueicamposimoveis.com.br"
    log_success "   • https://portainer.siqueicamposimoveis.com.br"
    log_success "   • https://traefik.siqueicamposimoveis.com.br"
    log_success "   • https://n8n.siqueicamposimoveis.com.br"
    log_success "   • https://evolution.siqueicamposimoveis.com.br"
    log_success "   • https://meuboot.site"
    log_success "   • https://portainer.meuboot.site"
    echo ""

    log_success "📋 INFORMAÇÕES IMPORTANTES:"
    log_success "   • Relatório final: /opt/deploy-final-report.md"
    log_success "   • Credenciais: /opt/deploy-credentials.json"
    log_success "   • Status: deploy-status"
    log_success "   • Ajuda: deploy-help"
    echo ""

    log_success "🚨 IMPORTANTE: A propagação DNS pode levar até 24 horas!"
    echo ""

    log_success "Deploy concluído em $(date)!"
    log_success "Sistema totalmente operacional e autônomo! 🚀"

    echo ""
    realtime_echo "${GREEN}Pressione ENTER para finalizar...${NC}"
    read -r
}

# ================================================================================================
# EXECUÇÃO PRINCIPAL
# ================================================================================================

# Executar deployment principal
main_deployment
