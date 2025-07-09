#!/bin/bash

##############################################################################
#                      🚀 INSTALADOR KRYONIX                                #
#              Instalação Rápida do Sistema KRYONIX                         #
##############################################################################

set -euo pipefail

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}"
}

info() {
    echo -e "${BLUE}[INFO] $1${NC}"
}

error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

warning() {
    echo -e "${YELLOW}[WARNING] $1${NC}"
}

# Banner
show_banner() {
    clear
    echo -e "${BLUE}"
    echo "##############################################################################"
    echo "#                      🚀 INSTALADOR KRYONIX                                #"
    echo "#              Instalação Rápida do Sistema KRYONIX                         #"
    echo "##############################################################################"
    echo -e "${NC}"
    echo
}

check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "Este script deve ser executado como root!"
        echo "Execute: sudo bash install_kryonix.sh"
        exit 1
    fi
}

# Baixar todos os arquivos necessários
download_files() {
    log "📥 Baixando arquivos do sistema KRYONIX..."
    
    # Criar diretório temporário
    mkdir -p /tmp/kryonix-install
    cd /tmp/kryonix-install
    
    # Simular download dos arquivos (já que estão locais)
    # Em produção, você faria wget/curl dos arquivos do GitHub
    
    if [ ! -f "/root/deploy_kryonix_complete.sh" ]; then
        error "Arquivo deploy_kryonix_complete.sh não encontrado!"
        echo "Certifique-se de que todos os arquivos estão no diretório /root/"
        exit 1
    fi
    
    # Copiar arquivos para o diretório de trabalho
    cp /root/deploy_kryonix_complete.sh ./
    cp /root/docker-compose.kryonix.yml ./
    cp /root/github-webhook.sh ./
    cp /root/prometheus.yml ./
    
    # Dar permissões de execução
    chmod +x deploy_kryonix_complete.sh
    chmod +x github-webhook.sh
    
    log "✅ Arquivos baixados com sucesso!"
}

# Verificar pré-requisitos
check_prerequisites() {
    log "🔍 Verificando pré-requisitos..."
    
    # Verificar Ubuntu 22.04
    if ! grep -q "22.04" /etc/lsb-release 2>/dev/null; then
        warning "Sistema não é Ubuntu 22.04. Continuando mesmo assim..."
    fi
    
    # Verificar conectividade
    if ! ping -c 1 8.8.8.8 &> /dev/null; then
        error "Sem conectividade com a internet!"
        exit 1
    fi
    
    # Verificar espaço em disco (mínimo 10GB)
    available_space=$(df / | tail -1 | awk '{print $4}')
    if [ "$available_space" -lt 10485760 ]; then  # 10GB em KB
        warning "Pouco espaço em disco disponível. Recomendado: 10GB+"
    fi
    
    log "✅ Pré-requisitos verificados!"
}

# Fazer backup básico
backup_system() {
    log "💾 Fazendo backup básico do sistema..."
    
    # Backup de configurações importantes
    mkdir -p /backup/kryonix-$(date +%Y%m%d-%H%M%S)
    
    # Backup do cron
    crontab -l > /backup/kryonix-$(date +%Y%m%d-%H%M%S)/crontab.bak 2>/dev/null || true
    
    # Backup de iptables
    iptables-save > /backup/kryonix-$(date +%Y%m%d-%H%M%S)/iptables.bak 2>/dev/null || true
    
    log "✅ Backup realizado em /backup/"
}

# Executar instalação principal
run_installation() {
    log "🚀 Iniciando instalação do sistema KRYONIX..."
    
    # Executar o script principal
    ./deploy_kryonix_complete.sh
    
    log "✅ Instalação concluída!"
}

# Verificar instalação
verify_installation() {
    log "🔍 Verificando instalação..."
    
    # Verificar se Docker está rodando
    if ! systemctl is-active --quiet docker; then
        error "Docker não está rodando!"
        return 1
    fi
    
    # Verificar se containers estão rodando
    running_containers=$(docker ps | wc -l)
    if [ "$running_containers" -lt 5 ]; then
        warning "Poucos containers rodando. Verifique os logs."
    fi
    
    # Verificar se webhook está ativo
    if ! systemctl is-active --quiet kryonix-webhook 2>/dev/null; then
        warning "Webhook do GitHub não está ativo"
    fi
    
    log "✅ Verificação concluída!"
}

# Exibir status final
show_status() {
    echo
    log "📊 STATUS DO SISTEMA KRYONIX:"
    echo
    echo "🐳 Docker:"
    docker --version 2>/dev/null || echo "  ❌ Não instalado"
    
    echo
    echo "📦 Containers ativos:"
    docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo "  ❌ Nenhum container rodando"
    
    echo
    echo "🔗 Webhook GitHub:"
    systemctl is-active kryonix-webhook 2>/dev/null && echo "  ✅ Ativo" || echo "  ❌ Inativo"
    
    echo
    echo "🔥 Firewall:"
    ufw status 2>/dev/null | head -1 || echo "  ❌ UFW não configurado"
    
    echo
    log "🎯 Instalação do KRYONIX finalizada!"
    echo "🌐 Acesse: https://portainer.siqueicamposimoveis.com.br"
    echo "📖 Logs: docker-compose logs -f"
    echo
}

# Função principal
main() {
    show_banner
    check_root
    
    log "🚀 Iniciando instalação do sistema KRYONIX..."
    echo
    
    check_prerequisites
    backup_system
    download_files
    run_installation
    verify_installation
    show_status
    
    log "🎉 Instalação concluída com sucesso!"
}

# Executar instalação
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
