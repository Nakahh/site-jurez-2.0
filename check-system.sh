#!/bin/bash

#==============================================================================
# 🔍 SYSTEM CHECK - SIQUEIRA CAMPOS IMÓVEIS
# Script de verificação pós-deploy e monitoramento
#==============================================================================

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Configurações
MAIN_DOMAIN="siqueicamposimoveis.com.br"
SECONDARY_DOMAIN="meuboot.site"

show_banner() {
    clear
    echo -e "${CYAN}"
    cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   🔍 SYSTEM CHECK - SIQUEIRA CAMPOS IMÓVEIS                                 ║
║                                                                              ║
║   Verificação Completa do Sistema Pós-Deploy                                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
    echo -e "${NC}"
}

check_docker_services() {
    echo -e "${BLUE}🐳 Verificando serviços Docker...${NC}"
    
    local services=(
        "traefik_traefik"
        "portainer_portainer"
        "n8n_n8n"
        "minio_minio"
        "grafana_grafana"
        "adminer_adminer"
        "evolution_evolution-api"
        "webhook_webhook"
        "app_frontend"
        "app_backend"
        "app_postgres"
        "app_redis"
    )
    
    local running=0
    local total=${#services[@]}
    
    for service in "${services[@]}"; do
        if docker service ps "$service" 2>/dev/null | grep -q "Running"; then
            echo -e "   ${GREEN}✅ $service${NC}"
            ((running++))
        else
            echo -e "   ${RED}❌ $service${NC}"
        fi
    done
    
    echo -e "\n${WHITE}📊 Status: $running/$total serviços rodando${NC}"
    
    if [ $running -eq $total ]; then
        echo -e "${GREEN}🎉 Todos os serviços estão funcionando!${NC}"
    else
        echo -e "${YELLOW}⚠️  Alguns serviços podem estar iniciando...${NC}"
    fi
}

check_ssl_certificates() {
    echo -e "\n${BLUE}🔐 Verificando certificados SSL...${NC}"
    
    local urls=(
        "$MAIN_DOMAIN"
        "api.$MAIN_DOMAIN"
        "portainer.$MAIN_DOMAIN"
        "n8n.$MAIN_DOMAIN"
        "minio.$MAIN_DOMAIN"
        "grafana.$MAIN_DOMAIN"
        "adminer.$MAIN_DOMAIN"
        "evo.$MAIN_DOMAIN"
        "webhook.$MAIN_DOMAIN"
        "$SECONDARY_DOMAIN"
        "traefik.$SECONDARY_DOMAIN"
        "n8n.$SECONDARY_DOMAIN"
        "minio.$SECONDARY_DOMAIN"
        "grafana.$SECONDARY_DOMAIN"
        "adminer.$SECONDARY_DOMAIN"
        "evo.$SECONDARY_DOMAIN"
        "webhook.$SECONDARY_DOMAIN"
    )
    
    local ssl_ok=0
    local total_urls=${#urls[@]}
    
    for url in "${urls[@]}"; do
        if timeout 10 curl -Iv "https://$url" 2>/dev/null | grep -E "HTTP.*[23][0-9][0-9]" > /dev/null; then
            # Verificar se o certificado é válido
            if timeout 10 openssl s_client -connect "$url:443" -servername "$url" 2>/dev/null | grep -q "Verify return code: 0"; then
                echo -e "   ${GREEN}✅ https://$url ${CYAN}(SSL Válido)${NC}"
                ((ssl_ok++))
            else
                echo -e "   ${YELLOW}⚠️  https://$url ${YELLOW}(SSL Inválido)${NC}"
            fi
        else
            echo -e "   ${RED}❌ https://$url ${RED}(Não Acessível)${NC}"
        fi
    done
    
    echo -e "\n${WHITE}📊 SSL Status: $ssl_ok/$total_urls certificados válidos${NC}"
    
    if [ $ssl_ok -eq $total_urls ]; then
        echo -e "${GREEN}🔒 Todos os certificados SSL estão válidos!${NC}"
    else
        echo -e "${YELLOW}⏰ Alguns certificados ainda estão sendo emitidos...${NC}"
    fi
}

check_system_resources() {
    echo -e "\n${BLUE}💻 Verificando recursos do sistema...${NC}"
    
    # RAM
    local ram_info=$(free -h | grep "Mem:")
    local ram_used=$(echo $ram_info | awk '{print $3}')
    local ram_total=$(echo $ram_info | awk '{print $2}')
    local ram_percent=$(free | grep "Mem:" | awk '{printf "%.1f", $3/$2 * 100.0}')
    
    echo -e "   ${WHITE}🧠 RAM:${NC} $ram_used / $ram_total (${ram_percent}%)"
    
    if (( $(echo "$ram_percent > 80" | bc -l) )); then
        echo -e "      ${RED}⚠️  Alto uso de RAM!${NC}"
    else
        echo -e "      ${GREEN}✅ RAM OK${NC}"
    fi
    
    # Disco
    local disk_info=$(df -h / | tail -1)
    local disk_used=$(echo $disk_info | awk '{print $3}')
    local disk_total=$(echo $disk_info | awk '{print $2}')
    local disk_percent=$(echo $disk_info | awk '{print $5}' | sed 's/%//')
    
    echo -e "   ${WHITE}💾 Disco:${NC} $disk_used / $disk_total (${disk_percent}%)"
    
    if [ $disk_percent -gt 80 ]; then
        echo -e "      ${RED}⚠️  Pouco espaço em disco!${NC}"
    else
        echo -e "      ${GREEN}✅ Disco OK${NC}"
    fi
    
    # CPU Load
    local load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    echo -e "   ${WHITE}⚡ CPU Load:${NC} $load"
    
    # Uptime
    local uptime_info=$(uptime -p)
    echo -e "   ${WHITE}⏰ Uptime:${NC} $uptime_info"
}

check_database() {
    echo -e "\n${BLUE}🗄️  Verificando banco de dados...${NC}"
    
    # Verificar se PostgreSQL está rodando
    if docker service ps app_postgres 2>/dev/null | grep -q "Running"; then
        echo -e "   ${GREEN}✅ PostgreSQL rodando${NC}"
        
        # Tentar conectar ao banco
        if docker exec $(docker ps -q -f "name=app_postgres") psql -U sitejuarez -d bdsitejuarez -c "SELECT 1;" >/dev/null 2>&1; then
            echo -e "   ${GREEN}✅ Conexão com banco OK${NC}"
        else
            echo -e "   ${YELLOW}⚠️  Não foi possível conectar ao banco${NC}"
        fi
    else
        echo -e "   ${RED}❌ PostgreSQL não está rodando${NC}"
    fi
    
    # Verificar Redis
    if docker service ps app_redis 2>/dev/null | grep -q "Running"; then
        echo -e "   ${GREEN}✅ Redis rodando${NC}"
    else
        echo -e "   ${RED}❌ Redis não está rodando${NC}"
    fi
}

check_traefik_dashboard() {
    echo -e "\n${BLUE}🌐 Verificando Traefik Dashboard...${NC}"
    
    if timeout 10 curl -Iv "https://traefik.$SECONDARY_DOMAIN" 2>/dev/null | grep -q "HTTP.*401"; then
        echo -e "   ${GREEN}✅ Traefik Dashboard acessível (requer autenticação)${NC}"
        echo -e "   ${CYAN}🔑 Acesso: https://traefik.$SECONDARY_DOMAIN${NC}"
        echo -e "   ${WHITE}👤 User: admin / Pass: admin (altere após primeiro acesso)${NC}"
    else
        echo -e "   ${RED}❌ Traefik Dashboard não acessível${NC}"
    fi
}

check_webhook() {
    echo -e "\n${BLUE}🔗 Verificando sistema de webhook...${NC}"
    
    if timeout 10 curl -s "https://webhook.$MAIN_DOMAIN/health" | grep -q "healthy"; then
        echo -e "   ${GREEN}✅ Webhook server funcionando${NC}"
        echo -e "   ${CYAN}🔗 URL: https://webhook.$MAIN_DOMAIN${NC}"
        
        if [ -f "/opt/webhook-secret.txt" ]; then
            local secret=$(cat /opt/webhook-secret.txt)
            echo -e "   ${WHITE}🔑 Secret: ${secret:0:16}...${NC}"
        fi
    else
        echo -e "   ${RED}❌ Webhook server não acessível${NC}"
    fi
}

show_quick_links() {
    echo -e "\n${WHITE}🔗 LINKS RÁPIDOS:${NC}"
    
    echo -e "\n${CYAN}🔷 $SECONDARY_DOMAIN (Painel Principal):${NC}"
    echo -e "   • Portainer: https://$SECONDARY_DOMAIN"
    echo -e "   • Traefik: https://traefik.$SECONDARY_DOMAIN"
    echo -e "   • N8N: https://n8n.$SECONDARY_DOMAIN"
    echo -e "   • Grafana: https://grafana.$SECONDARY_DOMAIN"
    
    echo -e "\n${BLUE}🔷 $MAIN_DOMAIN (Site Imobiliário):${NC}"
    echo -e "   • Site: https://$MAIN_DOMAIN"
    echo -e "   • API: https://api.$MAIN_DOMAIN"
    echo -e "   • WhatsApp: https://evo.$MAIN_DOMAIN"
    echo -e "   • Webhook: https://webhook.$MAIN_DOMAIN"
}

show_credentials() {
    echo -e "\n${WHITE}🔑 CREDENCIAIS:${NC}"
    
    if [ -f "/opt/senhas-sistema.txt" ]; then
        echo -e "   ${GREEN}✅ Arquivo de senhas: /opt/senhas-sistema.txt${NC}"
        echo -e "   ${YELLOW}⚠️  Acesso restrito apenas ao root${NC}"
    else
        echo -e "   ${RED}❌ Arquivo de senhas não encontrado${NC}"
    fi
}

show_logs() {
    echo -e "\n${WHITE}📝 LOGS DISPONÍVEIS:${NC}"
    
    local log_files=(
        "/var/log/kryonix-deploy/deploy.log"
        "/var/log/kryonix-deploy/error.log"
        "/var/log/kryonix-deploy/ssl-status.log"
        "/var/log/auto-deploy.log"
        "/opt/deploy-report.log"
    )
    
    for log_file in "${log_files[@]}"; do
        if [ -f "$log_file" ]; then
            local size=$(du -h "$log_file" | cut -f1)
            echo -e "   ${GREEN}✅ $log_file${NC} ${DIM}($size)${NC}"
        else
            echo -e "   ${YELLOW}⚠️  $log_file${NC} ${DIM}(não encontrado)${NC}"
        fi
    done
}

show_next_steps() {
    echo -e "\n${WHITE}🔧 PRÓXIMOS PASSOS:${NC}"
    echo -e "   1. ${CYAN}Configure GitHub Webhook:${NC}"
    echo -e "      - URL: https://webhook.$MAIN_DOMAIN"
    echo -e "      - Secret: cat /opt/webhook-secret.txt"
    echo -e "   2. ${PURPLE}Configure N8N:${NC}"
    echo -e "      - Acesse: https://n8n.$MAIN_DOMAIN"
    echo -e "      - Importe o workflow do projeto"
    echo -e "   3. ${GREEN}Configure Evolution API:${NC}"
    echo -e "      - Acesse: https://evo.$MAIN_DOMAIN"
    echo -e "      - Configure instância WhatsApp"
    echo -e "   4. ${BLUE}Configure Grafana:${NC}"
    echo -e "      - Acesse: https://grafana.$MAIN_DOMAIN"
    echo -e "      - Configure datasources e dashboards"
}

main() {
    show_banner
    
    check_docker_services
    check_ssl_certificates
    check_system_resources
    check_database
    check_traefik_dashboard
    check_webhook
    show_quick_links
    show_credentials
    show_logs
    show_next_steps
    
    echo -e "\n${GREEN}🎉 Verificação completa!${NC}"
    echo -e "${CYAN}💡 Execute este script novamente para monitorar o sistema${NC}"
}

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
    echo -e "${YELLOW}⚠️  Execute como root para verificação completa: sudo $0${NC}"
fi

main "$@"
