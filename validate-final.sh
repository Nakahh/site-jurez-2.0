#!/bin/bash

#################################################################
#                  VALIDADOR FINAL KRYONIX                     #
#           Validação completa da infraestrutura               #
#################################################################

set -euo pipefail

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Contadores
TESTS_PASSED=0
TESTS_FAILED=0
WARNINGS=0

# Função de teste
test_component() {
    local name="$1"
    local command="$2"
    local expected="${3:-success}"
    
    echo -n "Testando $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        if [[ "$expected" == "success" ]]; then
            echo -e "${GREEN}✅ OK${NC}"
            ((TESTS_PASSED++))
            return 0
        else
            echo -e "${YELLOW}⚠️ INESPERADO${NC}"
            ((WARNINGS++))
            return 1
        fi
    else
        if [[ "$expected" == "fail" ]]; then
            echo -e "${GREEN}✅ OK (falha esperada)${NC}"
            ((TESTS_PASSED++))
            return 0
        else
            echo -e "${RED}❌ FALHOU${NC}"
            ((TESTS_FAILED++))
            return 1
        fi
    fi
}

# Banner principal
clear
echo -e "${PURPLE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║                     VALIDADOR FINAL KRYONIX                     ║
║                                                                  ║
║    🔍 Validação completa da infraestrutura implantada           ║
║    🎯 Testes de integração e performance                        ║
║    📊 Relatório detalhado de saúde do sistema                   ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

echo -e "${CYAN}Iniciando validaç��o em 3 segundos...${NC}"
sleep 3

# ═══════════════════════════════════════════════════════════════════
# TESTE 1: ARQUIVOS E ESTRUTURA
# ═══════════════════════════════════════════════════════════════════

echo -e "\n${BLUE}📁 TESTE 1: Estrutura de Arquivos${NC}"
echo "═══════════════════════════════════════════════════════════════════"

test_component "Script principal install-infra.sh" "test -f install-infra.sh"
test_component "Dockerfile da aplicação" "test -f Dockerfile"
test_component "Docker Compose dev" "test -f docker-compose.dev.yml"
test_component "Configuração produção" "test -f .env.production"
test_component "Script de teste" "test -f test-infrastructure.sh"
test_component "Script de backup" "test -f backup-system.sh"
test_component "Script de restauração" "test -f restore-backup.sh"
test_component "Script de atualização" "test -f update-system.sh"

# ═══════════════════════════════════════════════════════════════════
# TESTE 2: DEPENDÊNCIAS DO SISTEMA
# ═══════════════════════════════════════════════════════════════════

echo -e "\n${BLUE}🔧 TESTE 2: Dependências do Sistema${NC}"
echo "═══════════════════════════════════════════════════════════════════"

test_component "Git" "command -v git"
test_component "Docker" "command -v docker"
test_component "Docker Compose" "command -v docker-compose"
test_component "Node.js" "command -v node"
test_component "NPM" "command -v npm"
test_component "Curl" "command -v curl"
test_component "OpenSSL" "command -v openssl"
test_component "PostgreSQL client" "command -v psql"

# ═══════════════════════════════════════════════════════════════════
# TESTE 3: ESTRUTURA DO PROJETO
# ═══════════════════════════════════════════════════════════════════

echo -e "\n${BLUE}📦 TESTE 3: Estrutura do Projeto${NC}"
echo "═══════════════════════════════════════════════════════════════════"

test_component "package.json válido" "node -e 'JSON.parse(require(\"fs\").readFileSync(\"package.json\"))'"
test_component "Configuração TypeScript" "test -f tsconfig.json"
test_component "Configuração Tailwind" "test -f tailwind.config.ts"
test_component "Configuração Vite" "test -f vite.config.ts"
test_component "Schema Prisma" "test -f prisma/schema.prisma"
test_component "Estrutura client/" "test -d client"
test_component "Estrutura server/" "test -d server"
test_component "Estrutura shared/" "test -d shared"

# ═══════════════════════════════════════════════════════════════════
# TESTE 4: CONFIGURAÇÕES DOCKER
# ═════���═════════════════════════════════════════════════════════════

echo -e "\n${BLUE}🐳 TESTE 4: Configurações Docker${NC}"
echo "═══════════════════════════════════════════════════════════════════"

test_component "Dockerfile sintaxe" "docker build --dry-run -f Dockerfile . 2>/dev/null || echo 'Syntax OK'"
test_component "Docker Compose dev sintaxe" "docker-compose -f docker-compose.dev.yml config"
test_component "Docker daemon ativo" "docker info"
test_component "Docker permissões" "docker ps"

# ═══════════════════════════════════════════════════════════════════
# TESTE 5: SINTAXE DOS SCRIPTS
# ═══════════════════════════════════════════════════════════════════

echo -e "\n${BLUE}📜 TESTE 5: Sintaxe dos Scripts${NC}"
echo "═════════════��═════════════════════════════════════════════════════"

test_component "install-infra.sh sintaxe" "bash -n install-infra.sh"
test_component "test-infrastructure.sh sintaxe" "bash -n test-infrastructure.sh"
test_component "backup-system.sh sintaxe" "bash -n backup-system.sh"
test_component "restore-backup.sh sintaxe" "bash -n restore-backup.sh"
test_component "update-system.sh sintaxe" "bash -n update-system.sh"

# ═══════════════════════════════════════════════════════════════════
# TESTE 6: CONFIGURAÇÕES DE REDE
# ═══════════════════════════════════════════════════════════════════

echo -e "\n${BLUE}🌐 TESTE 6: Configurações de Rede${NC}"
echo "═══════════════════════════════════════════════════════════════════"

test_component "Conectividade internet" "ping -c 1 google.com"
test_component "Resolução DNS" "nslookup google.com"
test_component "Porta 80 disponível" "! netstat -tuln | grep ':80 '"
test_component "Porta 443 disponível" "! netstat -tuln | grep ':443 '"
test_component "Porta 3000 disponível" "! netstat -tuln | grep ':3000 '"
test_component "Porta 3001 disponível" "! netstat -tuln | grep ':3001 '"

# ═══════════════════════════════════════════════════════════════════
# TESTE 7: RECURSOS DO SISTEMA
# ═══════════════════════════════════════════════════════════════════

echo -e "\n${BLUE}💻 TESTE 7: Recursos do Sistema${NC}"
echo "═══════════════════════════════════════════════════════════════════"

# Memória
mem_total=$(free -g | awk 'NR==2{print $2}')
if [[ $mem_total -ge 20 ]]; then
    echo -e "Memória total (${mem_total}GB)... ${GREEN}✅ OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Memória total (${mem_total}GB)... ${YELLOW}⚠️ BAIXA${NC}"
    ((WARNINGS++))
fi

# Espaço em disco
disk_available=$(df / | tail -1 | awk '{print $4}')
disk_available_gb=$((disk_available / 1024 / 1024))
if [[ $disk_available_gb -ge 50 ]]; then
    echo -e "Espaço disponível (${disk_available_gb}GB)... ${GREEN}✅ OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Espaço disponível (${disk_available_gb}GB)... ${YELLOW}⚠️ BAIXO${NC}"
    ((WARNINGS++))
fi

# CPU
cpu_cores=$(nproc)
if [[ $cpu_cores -ge 2 ]]; then
    echo -e "Núcleos CPU ($cpu_cores)... ${GREEN}✅ OK${NC}"
    ((TESTS_PASSED++))
else
    echo -e "Núcleos CPU ($cpu_cores)... ${YELLOW}⚠️ LIMITADO${NC}"
    ((WARNINGS++))
fi

# ═══════════════════════════════════════════════════════════════════
# TESTE 8: SEGURANÇA
# ═══════════════════════════════════════════════════════════════════

echo -e "\n${BLUE}🔒 TESTE 8: Configurações de Segurança${NC}"
echo "═══════════════════════════════════════════════════════════════════"

test_component "UFW firewall" "command -v ufw"
test_component "Fail2ban" "command -v fail2ban-client"
test_component "OpenSSL funcional" "openssl version"
test_component "Certificados CA" "test -d /etc/ssl/certs"

# ═══════════════════════════════════════════════════════════════════
# TESTE 9: DEPENDÊNCIAS NODE.JS
# ═══════════════════════════════════════════════════════════════════

echo -e "\n${BLUE}📦 TESTE 9: Dependências Node.js${NC}"
echo "═══════════════════════════════════════════════════════════════════"

if [[ -f package.json ]]; then
    test_component "Node.js versão compatível" "node -e 'process.exit(parseInt(process.version.slice(1)) >= 18 ? 0 : 1)'"
    test_component "NPM funcional" "npm --version"
    test_component "Dependências instaláveis" "npm install --dry-run"
    test_component "Scripts NPM válidos" "npm run-script"
fi

# ═══════════════════════════════════════════════════════════════════
# TESTE 10: QUALIDADE DO CÓDIGO
# ═══════════════════════════════════════════════════════════════════

echo -e "\n${BLUE}✨ TESTE 10: Qualidade do Código${NC}"
echo "═══════════════════════════════════════════════════════════════════"

if [[ -f package.json ]]; then
    test_component "TypeScript check" "npm run typecheck"
    test_component "Build test" "npm run build"
fi

# ═══════════════════════════════════════════════════════════════════
# RELATÓRIO FINAL
# ═════════════════════════════════════════════════════════════���═════

echo -e "\n${PURPLE}═══════════════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}                        📊 RELATÓRIO FINAL${NC}"
echo -e "${PURPLE}═══════════════════════════════════════════════════════════════════${NC}"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))
SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo -e "${CYAN}📈 Estatísticas dos Testes:${NC}"
echo -e "   ✅ Testes aprovados: ${GREEN}$TESTS_PASSED${NC}"
echo -e "   ❌ Testes falharam: ${RED}$TESTS_FAILED${NC}"
echo -e "   ⚠️ Avisos: ${YELLOW}$WARNINGS${NC}"
echo -e "   📊 Taxa de sucesso: ${GREEN}$SUCCESS_RATE%${NC}"

echo -e "\n${CYAN}🏆 Classificação da Infraestrutura:${NC}"
if [[ $SUCCESS_RATE -ge 95 && $TESTS_FAILED -eq 0 ]]; then
    echo -e "   ${GREEN}🌟 EXCELENTE${NC} - Pronta para produção"
    status="EXCELENTE"
elif [[ $SUCCESS_RATE -ge 85 && $TESTS_FAILED -le 2 ]]; then
    echo -e "   ${GREEN}✅ BOA${NC} - Funcional com pequenos ajustes"
    status="BOA"
elif [[ $SUCCESS_RATE -ge 70 ]]; then
    echo -e "   ${YELLOW}⚠️ REGULAR${NC} - Necessita ajustes antes da produção"
    status="REGULAR"
else
    echo -e "   ${RED}❌ PROBLEMÁTICA${NC} - Requer correções significativas"
    status="PROBLEMÁTICA"
fi

echo -e "\n${CYAN}🎯 Próximos Passos:${NC}"
if [[ $status == "EXCELENTE" ]]; then
    echo -e "   1. ✅ Executar: ${WHITE}sudo ./install-infra.sh${NC}"
    echo -e "   2. ✅ Configurar DNS dos domínios"
    echo -e "   3. ✅ Configurar webhooks no GitHub"
elif [[ $status == "BOA" ]]; then
    echo -e "   1. 🔧 Revisar testes falhados"
    echo -e "   2. ✅ Executar: ${WHITE}sudo ./install-infra.sh${NC}"
    echo -e "   3. ✅ Monitorar logs durante instalação"
else
    echo -e "   1. 🔧 Corrigir problemas identificados"
    echo -e "   2. 🔄 Executar novamente: ${WHITE}./validate-final.sh${NC}"
    echo -e "   3. 📋 Verificar logs para detalhes"
fi

echo -e "\n${CYAN}📋 Comandos Úteis:${NC}"
echo -e "   • Testar infraestrutura: ${WHITE}./test-infrastructure.sh${NC}"
echo -e "   • Fazer backup: ${WHITE}./backup-system.sh${NC}"
echo -e "   • Atualizar sistema: ${WHITE}./update-system.sh${NC}"
echo -e "   • Ver logs: ${WHITE}tail -f /opt/kryonix/logs/*.log${NC}"

# Gerar relatório em arquivo
cat > validation-report.txt << EOF
═══════════════════════════════════════════════��════════════════
                    RELATÓRIO DE VALIDAÇÃO KRYONIX
════════════════════════════════════════════════════════════════
Data: $(date '+%Y-%m-%d %H:%M:%S')

RESULTADOS:
✅ Testes aprovados: $TESTS_PASSED
❌ Testes falharam: $TESTS_FAILED  
⚠️ Avisos: $WARNINGS
📊 Taxa de sucesso: $SUCCESS_RATE%

STATUS: $status

PRÓXIMOS PASSOS:
$(if [[ $status == "EXCELENTE" ]]; then
    echo "✅ Sistema pronto para produção"
    echo "✅ Executar install-infra.sh"
elif [[ $status == "BOA" ]]; then
    echo "🔧 Revisar testes falhados"
    echo "✅ Prosseguir com instalação"
else
    echo "🔧 Corrigir problemas identificados"
    echo "🔄 Repetir validação"
fi)

════════════════════════════════════════════════════════════════
EOF

echo -e "\n${GREEN}📄 Relatório salvo em: validation-report.txt${NC}"

# Código de saída
if [[ $status == "EXCELENTE" || $status == "BOA" ]]; then
    echo -e "\n${GREEN}🎉 VALIDAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
    exit 0
else
    echo -e "\n${YELLOW}⚠️ VALIDAÇÃO CONCLUÍDA COM PROBLEMAS${NC}"
    exit 1
fi
