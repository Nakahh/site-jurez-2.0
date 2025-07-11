#!/bin/bash

#################################################################
#                    TESTE DE INFRAESTRUTURA                   #
#           Script para validar ambiente localmente            #
#################################################################

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Contadores
TESTS_PASSED=0
TESTS_TOTAL=0

# Função de teste
test_service() {
    local name="$1"
    local url="$2"
    local expected_code="${3:-200}"
    
    ((TESTS_TOTAL++))
    
    echo -n "Testando $name... "
    
    if curl -s -o /dev/null -w "%{http_code}" "$url" | grep -q "$expected_code"; then
        echo -e "${GREEN}✅ OK${NC}"
        ((TESTS_PASSED++))
        return 0
    else
        echo -e "${RED}❌ FALHOU${NC}"
        return 1
    fi
}

# Banner
echo -e "${BLUE}"
echo "════════════════════════════════════════════════════════════════"
echo "              TESTE DE INFRAESTRUTURA KRYONIX"
echo "════════════════════════════════════════════════════════════════"
echo -e "${NC}"

# Configurar hosts locais para teste
echo "127.0.0.1 meuboot.site" >> /etc/hosts
echo "127.0.0.1 traefik.meuboot.site" >> /etc/hosts
echo "127.0.0.1 n8n.meuboot.site" >> /etc/hosts
echo "127.0.0.1 siqueicamposimoveis.com.br" >> /etc/hosts
echo "127.0.0.1 api.siqueicamposimoveis.com.br" >> /etc/hosts

# Aguardar serviços iniciarem
echo "Aguardando serviços iniciarem..."
sleep 30

# Testes de conectividade básica
echo -e "\n${YELLOW}📡 Testando conectividade básica...${NC}"

test_service "Docker" "http://localhost:2375/version" "200"
test_service "Traefik Dashboard" "http://localhost:8080/api/rawdata" "200"

# Testes dos serviços administrativos
echo -e "\n${YELLOW}🔷 Testando serviços administrativos...${NC}"

test_service "Portainer Admin" "http://localhost:9000" "200"
test_service "N8N" "http://localhost:5678" "401"  # 401 porque requer auth
test_service "MinIO" "http://localhost:9001" "200"
test_service "Grafana" "http://localhost:3000" "200"
test_service "Adminer" "http://localhost:8080" "200"

# Testes da aplicação pública
echo -e "\n${YELLOW}🔶 Testando aplicação pública...${NC}"

test_service "API Pública" "http://localhost:3001/api/ping" "200"
test_service "Frontend" "http://localhost:80" "200"

# Testes de banco de dados
echo -e "\n${YELLOW}💾 Testando bancos de dados...${NC}"

# PostgreSQL
if pg_isready -h localhost -p 5432 -U app_user -d siqueicampos_db; then
    echo -e "PostgreSQL... ${GREEN}✅ OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "PostgreSQL... ${RED}❌ FALHOU${NC}"
fi
((TESTS_TOTAL++))

# Redis
if redis-cli -h localhost -p 6379 ping | grep -q "PONG"; then
    echo -e "Redis... ${GREEN}✅ OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Redis... ${RED}❌ FALHOU${NC}"
fi
((TESTS_TOTAL++))

# Teste de SSL (se configurado)
echo -e "\n${YELLOW}🔒 Testando certificados SSL...${NC}"

if command -v openssl &> /dev/null; then
    for domain in "meuboot.site" "siqueicamposimoveis.com.br"; do
        if echo | openssl s_client -connect "$domain:443" -servername "$domain" 2>/dev/null | grep -q "Verify return code: 0"; then
            echo -e "$domain SSL... ${GREEN}✅ OK${NC}"
            ((TESTS_PASSED++))
        else
            echo -e "$domain SSL... ${YELLOW}⚠️ PENDENTE${NC}"
        fi
        ((TESTS_TOTAL++))
    done
fi

# Teste de performance
echo -e "\n${YELLOW}⚡ Testando performance...${NC}"

# Teste de resposta da API
response_time=$(curl -o /dev/null -s -w "%{time_total}" "http://localhost:3001/api/ping")
if (( $(echo "$response_time < 1.0" | bc -l) )); then
    echo -e "Tempo de resposta API ($response_time s)... ${GREEN}✅ OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Tempo de resposta API ($response_time s)... ${YELLOW}⚠️ LENTO${NC}"
fi
((TESTS_TOTAL++))

# Verificar uso de recursos
echo -e "\n${YELLOW}💻 Verificando recursos do sistema...${NC}"

# Memória
mem_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$mem_usage" -lt 80 ]; then
    echo -e "Uso de memória (${mem_usage}%)... ${GREEN}✅ OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Uso de memória (${mem_usage}%)... ${YELLOW}⚠️ ALTO${NC}"
fi
((TESTS_TOTAL++))

# Disco
disk_usage=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$disk_usage" -lt 80 ]; then
    echo -e "Uso de disco (${disk_usage}%)... ${GREEN}✅ OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Uso de disco (${disk_usage}%)... ${YELLOW}⚠️ ALTO${NC}"
fi
((TESTS_TOTAL++))

# Containers em execução
echo -e "\n${YELLOW}🐳 Verificando containers...${NC}"

containers_running=$(docker ps --format "table {{.Names}}" | wc -l)
containers_expected=8  # Ajustar conforme necessário

if [ "$containers_running" -ge "$containers_expected" ]; then
    echo -e "Containers ativos ($containers_running)... ${GREEN}✅ OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Containers ativos ($containers_running)... ${RED}❌ INSUFICIENTES${NC}"
fi
((TESTS_TOTAL++))

# Logs de erro
echo -e "\n${YELLOW}📝 Verificando logs de erro...${NC}"

error_count=$(docker logs --since=10m $(docker ps -q) 2>&1 | grep -i "error\|fatal\|exception" | wc -l)
if [ "$error_count" -eq 0 ]; then
    echo -e "Logs de erro (${error_count})... ${GREEN}✅ OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Logs de erro (${error_count})... ${YELLOW}⚠️ ENCONTRADOS${NC}"
fi
((TESTS_TOTAL++))

# Relatório final
echo -e "\n${BLUE}═════════════════════════════════════════════════════════��══════${NC}"
echo -e "${YELLOW}📊 RELATÓRIO FINAL${NC}"
echo -e "${BLUE}════════════════════════════════════════════════════════════════${NC}"

echo "Testes executados: $TESTS_TOTAL"
echo "Testes aprovados: $TESTS_PASSED"
echo "Taxa de sucesso: $(( TESTS_PASSED * 100 / TESTS_TOTAL ))%"

if [ "$TESTS_PASSED" -eq "$TESTS_TOTAL" ]; then
    echo -e "\n${GREEN}🎉 TODOS OS TESTES PASSARAM!${NC}"
    echo -e "${GREEN}✅ Infraestrutura está funcionando perfeitamente${NC}"
    exit 0
elif [ "$TESTS_PASSED" -gt $(( TESTS_TOTAL * 80 / 100 )) ]; then
    echo -e "\n${YELLOW}⚠️ MAIORIA DOS TESTES PASSOU${NC}"
    echo -e "${YELLOW}✅ Infraestrutura funcional com alguns ajustes necessários${NC}"
    exit 0
else
    echo -e "\n${RED}❌ MUITOS TESTES FALHARAM${NC}"
    echo -e "${RED}🔧 Revisar configuração da infraestrutura${NC}"
    exit 1
fi
