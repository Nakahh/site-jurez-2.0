#!/bin/bash

# 📊 Monitor Siqueira Campos Imóveis - Oracle VPS
# Desenvolvido por Kryonix

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

clear
echo -e "${BLUE}🏠 =========================================="
echo -e "📊 Monitor Siqueira Campos Imóveis"
echo -e "🏠 ==========================================${NC}"
echo ""

# Função para verificar status do serviço
check_service() {
    local service=$1
    local url=$2
    
    if docker-compose -f docker-compose.oracle.yml ps | grep -q "$service.*Up"; then
        if curl -s --max-time 5 "$url" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $service - ONLINE${NC}"
        else
            echo -e "${YELLOW}⚠️  $service - Container OK, mas serviço não responde${NC}"
        fi
    else
        echo -e "${RED}❌ $service - OFFLINE${NC}"
    fi
}

# Status dos serviços
echo -e "${CYAN}📋 Status dos Serviços:${NC}"
echo ""

check_service "siqueira-app" "http://localhost:3000/api/ping"
check_service "siqueira-postgres" "tcp://localhost:5432"
check_service "siqueira-redis" "tcp://localhost:6379"
check_service "siqueira-n8n" "http://localhost:5678"
check_service "siqueira-evolution" "http://localhost:8080"
check_service "siqueira-nginx" "http://localhost:80"

echo ""

# Uso de recursos
echo -e "${CYAN}💾 Uso de Recursos:${NC}"
echo ""

# CPU e Memória
echo -e "${BLUE}🖥️  CPU e Memória:${NC}"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{printf "CPU: %.1f%%\n", $1}'
free -h | awk 'NR==2{printf "RAM: %s/%s (%.1f%%)\n", $3,$2,$3*100/$2}'
echo ""

# Disco
echo -e "${BLUE}💿 Uso de Disco:${NC}"
df -h | grep -E '^/dev/' | awk '{printf "%s: %s/%s (%s)\n", $6, $3, $2, $5}'
echo ""

# Docker stats
echo -e "${BLUE}🐳 Containers (Docker Stats):${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}" | head -7
echo ""

# Logs recentes
echo -e "${CYAN}📝 Logs Recentes (últimas 5 linhas):${NC}"
echo ""

echo -e "${PURPLE}🌐 Nginx:${NC}"
docker-compose -f docker-compose.oracle.yml logs --tail=3 nginx 2>/dev/null | tail -3
echo ""

echo -e "${PURPLE}🏠 App:${NC}"
docker-compose -f docker-compose.oracle.yml logs --tail=3 app 2>/dev/null | tail -3
echo ""

# Verificar conectividade externa
echo -e "${CYAN}🌍 Conectividade Externa:${NC}"
echo ""

# Verificar se o site está acessível externamente
if [ -f ".env" ]; then
    DOMAIN=$(grep "DOMAIN=" .env | cut -d'=' -f2)
    if [ ! -z "$DOMAIN" ]; then
        if curl -s --max-time 10 "https://$DOMAIN" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ Site principal ($DOMAIN) - ACESSÍVEL${NC}"
        else
            echo -e "${RED}❌ Site principal ($DOMAIN) - INACESSÍVEL${NC}"
        fi
        
        if curl -s --max-time 10 "https://n8n.$DOMAIN" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ N8N (n8n.$DOMAIN) - ACESSÍVEL${NC}"
        else
            echo -e "${RED}❌ N8N (n8n.$DOMAIN) - INACESSÍVEL${NC}"
        fi
    fi
fi

echo ""

# Certificados SSL
echo -e "${CYAN}🔒 Certificados SSL:${NC}"
echo ""

if [ -d "./ssl" ] || docker volume ls | grep -q certbot_conf; then
    if docker-compose -f docker-compose.oracle.yml exec -T certbot certbot certificates 2>/dev/null | grep -q "Found the following"; then
        echo -e "${GREEN}✅ Certificados SSL ativos${NC}"
        # Mostrar expiração
        docker-compose -f docker-compose.oracle.yml exec -T certbot certbot certificates 2>/dev/null | grep -A2 "Expiry Date"
    else
        echo -e "${YELLOW}⚠️  Certificados SSL não encontrados${NC}"
    fi
else
    echo -e "${RED}❌ SSL não configurado${NC}"
fi

echo ""

# Backup status
echo -e "${CYAN}💾 Status dos Backups:${NC}"
echo ""

if [ -d "./backups" ]; then
    BACKUP_COUNT=$(ls -1 ./backups/*.sql 2>/dev/null | wc -l)
    if [ $BACKUP_COUNT -gt 0 ]; then
        LAST_BACKUP=$(ls -t ./backups/*.sql 2>/dev/null | head -1 | xargs basename)
        echo -e "${GREEN}✅ $BACKUP_COUNT backups encontrados${NC}"
        echo -e "${BLUE}📅 Último backup: $LAST_BACKUP${NC}"
    else
        echo -e "${YELLOW}⚠️  Nenhum backup encontrado${NC}"
    fi
else
    echo -e "${RED}❌ Diretório de backup não existe${NC}"
fi

echo ""

# Uptime
echo -e "${CYAN}⏰ Uptime do Sistema:${NC}"
uptime
echo ""

# Portas abertas
echo -e "${CYAN}🔌 Portas em Uso:${NC}"
echo ""
netstat -tulpn 2>/dev/null | grep LISTEN | grep -E ':(80|443|3000|5432|5678|6379|8080)\s' | awk '{print $1, $4}' | sort -k2 -n
echo ""

# Comandos úteis
echo -e "${CYAN}🛠️  Comandos Úteis:${NC}"
echo ""
echo -e "${BLUE}Ver logs em tempo real:${NC}"
echo "docker-compose -f docker-compose.oracle.yml logs -f [serviço]"
echo ""
echo -e "${BLUE}Reiniciar serviço:${NC}"
echo "docker-compose -f docker-compose.oracle.yml restart [serviço]"
echo ""
echo -e "${BLUE}Fazer backup manual:${NC}"
echo "./backup.sh"
echo ""
echo -e "${BLUE}Ver este monitor novamente:${NC}"
echo "./monitor-oracle.sh"
echo ""

# Alertas importantes
echo -e "${YELLOW}⚠️  Alertas:${NC}"

# Verificar uso de disco > 80%
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo -e "${RED}🚨 ATENÇÃO: Uso de disco alto ($DISK_USAGE%)${NC}"
fi

# Verificar uso de RAM > 85%
RAM_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $RAM_USAGE -gt 85 ]; then
    echo -e "${RED}🚨 ATENÇÃO: Uso de RAM alto ($RAM_USAGE%)${NC}"
fi

# Verificar se algum container está parado
STOPPED_CONTAINERS=$(docker-compose -f docker-compose.oracle.yml ps | grep -c "Exit\|Down")
if [ $STOPPED_CONTAINERS -gt 0 ]; then
    echo -e "${RED}🚨 ATENÇÃO: $STOPPED_CONTAINERS container(s) parado(s)${NC}"
fi

echo ""
echo -e "${GREEN}📊 Monitor executado em $(date)${NC}"
echo ""
