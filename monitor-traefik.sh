#!/bin/bash

# 📊 Monitor Siqueira Campos Imóveis - Traefik + SSL
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
echo -e "📊 Monitor Traefik + SSL"
echo -e "🏠 Siqueira Campos Imóveis"
echo -e "🏠 ==========================================${NC}"
echo ""

# Função para verificar status do serviço
check_service() {
    local service=$1
    local url=$2
    
    if docker-compose ps | grep -q "$service.*Up"; then
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

check_service "siqueira-traefik" "http://localhost:8080"
check_service "siqueira-app" "http://localhost:3000/api/ping"
check_service "siqueira-postgres" "tcp://localhost:5432"
check_service "siqueira-redis" "tcp://localhost:6379"
check_service "siqueira-n8n" "http://localhost:5678"
check_service "siqueira-evolution" "http://localhost:8080"

echo ""

# Status do Traefik
echo -e "${CYAN}🔀 Status do Traefik:${NC}"
echo ""

if docker-compose ps | grep -q "siqueira-traefik.*Up"; then
    echo -e "${GREEN}✅ Traefik rodando${NC}"
    
    # Verificar routers
    echo -e "${BLUE}📍 Routers Configurados:${NC}"
    docker-compose exec -T traefik wget -qO- http://localhost:8080/api/http/routers 2>/dev/null | grep -o '"rule":"[^"]*"' | head -10
    
    echo ""
    echo -e "${BLUE}🔒 Certificados SSL:${NC}"
    
    # Verificar certificados
    ACME_FILE="/var/lib/docker/volumes/$(docker-compose ps -q traefik | head -1)_traefik_acme/_data"
    if [ -f "$ACME_FILE" ]; then
        echo -e "${GREEN}✅ Arquivo ACME encontrado${NC}"
    else
        echo -e "${YELLOW}⚠️  Arquivo ACME não encontrado ou certificados ainda não gerados${NC}"
    fi
    
else
    echo -e "${RED}❌ Traefik não está rodando${NC}"
fi

echo ""

# Verificar SSL externa
echo -e "${CYAN}🌍 Verificação SSL Externa:${NC}"
echo ""

if [ -f ".env" ]; then
    DOMAIN=$(grep "DOMAIN=" .env | cut -d'=' -f2)
    if [ ! -z "$DOMAIN" ]; then
        echo -e "${BLUE}🔍 Testando SSL para $DOMAIN...${NC}"
        
        # Testar site principal
        if curl -s --max-time 10 "https://$DOMAIN" > /dev/null 2>&1; then
            echo -e "${GREEN}✅ $DOMAIN - SSL FUNCIONANDO${NC}"
            
            # Verificar detalhes do certificado
            CERT_INFO=$(echo | openssl s_client -servername $DOMAIN -connect $DOMAIN:443 2>/dev/null | openssl x509 -noout -issuer -dates 2>/dev/null)
            if [ ! -z "$CERT_INFO" ]; then
                echo -e "${BLUE}📄 Certificado:${NC}"
                echo "$CERT_INFO" | while read line; do
                    echo "   $line"
                done
            fi
        else
            echo -e "${RED}❌ $DOMAIN - SSL NÃO FUNCIONANDO${NC}"
            echo -e "${YELLOW}   Possíveis causas: DNS não propagado, certificado não gerado${NC}"
        fi
        
        echo ""
        
        # Testar subdomínios
        for subdomain in "n8n" "api" "traefik"; do
            if curl -s --max-time 10 "https://$subdomain.$DOMAIN" > /dev/null 2>&1; then
                echo -e "${GREEN}✅ $subdomain.$DOMAIN - SSL OK${NC}"
            else
                echo -e "${YELLOW}⚠️  $subdomain.$DOMAIN - SSL pendente${NC}"
            fi
        done
    fi
fi

echo ""

# Uso de recursos
echo -e "${CYAN}💾 Uso de Recursos:${NC}"
echo ""

echo -e "${BLUE}🖥️  Sistema:${NC}"
echo "CPU: $(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{printf "%.1f%%", $1}')"
echo "RAM: $(free -h | awk 'NR==2{printf "%s/%s (%.1f%%)", $3,$2,$3*100/$2}')"
echo "Disco: $(df -h / | awk 'NR==2{printf "%s/%s (%s)", $3,$2,$5}')"

echo ""
echo -e "${BLUE}🐳 Containers:${NC}"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -7

echo ""

# Logs recentes do Traefik
echo -e "${CYAN}📝 Logs Recentes do Traefik:${NC}"
echo ""
docker-compose logs --tail=5 traefik 2>/dev/null | tail -5

echo ""

# Verificar DNS
echo -e "${CYAN}🌐 Verificação DNS:${NC}"
echo ""

if [ ! -z "$DOMAIN" ]; then
    echo -e "${BLUE}🔍 DNS para $DOMAIN:${NC}"
    DNS_RESULT=$(nslookup $DOMAIN 2>/dev/null | grep "Address:" | tail -1 | awk '{print $2}')
    if [ ! -z "$DNS_RESULT" ]; then
        echo -e "${GREEN}✅ DNS resolvido: $DNS_RESULT${NC}"
        
        # Verificar se é o IP local
        LOCAL_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null)
        if [ "$DNS_RESULT" = "$LOCAL_IP" ]; then
            echo -e "${GREEN}✅ DNS aponta para este servidor${NC}"
        else
            echo -e "${YELLOW}⚠️  DNS não aponta para este servidor (Local: $LOCAL_IP)${NC}"
        fi
    else
        echo -e "${RED}❌ DNS não resolvido${NC}"
    fi
fi

echo ""

# Portas em uso
echo -e "${CYAN}🔌 Portas em Uso:${NC}"
echo ""
netstat -tulpn 2>/dev/null | grep LISTEN | grep -E ':(80|443|3000|5432|5678|6379|8080)\s' | awk '{print $1, $4}' | sort -k2 -n

echo ""

# Comandos úteis
echo -e "${CYAN}🛠️  Comandos Úteis:${NC}"
echo ""
echo -e "${BLUE}Ver certificados Traefik:${NC}"
echo "docker-compose exec traefik traefik healthcheck"
echo ""
echo -e "${BLUE}Logs do Traefik em tempo real:${NC}"
echo "docker-compose logs -f traefik"
echo ""
echo -e "${BLUE}Forçar renovação SSL:${NC}"
echo "docker-compose restart traefik"
echo ""
echo -e "${BLUE}Ver API do Traefik:${NC}"
echo "curl http://localhost:8080/api/http/routers"
echo ""
echo -e "${BLUE}Testar SSL manualmente:${NC}"
echo "curl -I https://$DOMAIN"

echo ""

# Alertas
echo -e "${YELLOW}⚠️  Alertas:${NC}"
echo ""

# Verificar se Traefik está funcionando
if ! docker-compose ps | grep -q "siqueira-traefik.*Up"; then
    echo -e "${RED}🚨 TRAEFIK NÃO ESTÁ RODANDO!${NC}"
fi

# Verificar uso de disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo -e "${RED}🚨 Uso de disco alto: $DISK_USAGE%${NC}"
fi

# Verificar se SSL está funcionando
if [ ! -z "$DOMAIN" ]; then
    if ! curl -s --max-time 10 "https://$DOMAIN" > /dev/null 2>&1; then
        echo -e "${RED}🚨 SSL não está funcionando para $DOMAIN${NC}"
        echo -e "${YELLOW}   Verifique: DNS propagado, Traefik rodando, portas abertas${NC}"
    fi
fi

echo ""

# Status final
if docker-compose ps | grep -q "Up.*Up.*Up.*Up"; then
    echo -e "${GREEN}🎉 Sistema funcionando corretamente!${NC}"
else
    echo -e "${YELLOW}⚠️  Alguns serviços podem estar com problemas${NC}"
fi

echo ""
echo -e "${BLUE}📊 Monitor executado em $(date)${NC}"
echo -e "${BLUE}🔄 Execute novamente: ./monitor-traefik.sh${NC}"
echo ""
