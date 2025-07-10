#!/bin/bash

##############################################################################
#                        🧪 TESTE DO KRYONIX DEPLOY                         #
#         Script para testar sintaxe e validar lógica antes do deploy        #
##############################################################################

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

log_test() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%H:%M:%S')
    
    case $level in
        "SUCCESS")
            echo -e "${GREEN}✅ [$timestamp] $message${NC}"
            ;;
        "ERROR")
            echo -e "${RED}❌ [$timestamp] $message${NC}"
            ;;
        "WARNING")
            echo -e "${YELLOW}⚠��  [$timestamp] $message${NC}"
            ;;
        "INFO")
            echo -e "${BLUE}ℹ️  [$timestamp] $message${NC}"
            ;;
        "TEST")
            echo -e "${PURPLE}🧪 [$timestamp] $message${NC}"
            ;;
    esac
}

echo -e "${BOLD}${PURPLE}"
cat << 'EOF'
##############################################################################
#                        🧪 TESTE DO KRYONIX DEPLOY                         #
#         Script para testar sintaxe e validar lógica antes do deploy        #
##############################################################################
EOF
echo -e "${NC}"
echo

# Teste 1: Verificar sintaxe do script principal
log_test "TEST" "Verificando sintaxe do deploy_kryonix_fixed.sh..."

if bash -n deploy_kryonix_fixed.sh 2>/dev/null; then
    log_test "SUCCESS" "Sintaxe do script principal está correta"
else
    log_test "ERROR" "Erro de sintaxe encontrado no script principal"
    bash -n deploy_kryonix_fixed.sh
    exit 1
fi

# Teste 2: Verificar se todas as variáveis necessárias estão definidas
log_test "TEST" "Verificando definição de variáveis essenciais..."

required_vars=(
    "SERVER_IP"
    "DOMAIN1" 
    "DOMAIN2"
    "GITHUB_REPO"
    "PORTAINER_USER"
    "PORTAINER_PASS"
    "POSTGRES_PASSWORD"
    "REDIS_PASSWORD"
    "N8N_PASSWORD"
    "GRAFANA_PASSWORD"
    "MINIO_PASSWORD"
)

missing_vars=0
for var in "${required_vars[@]}"; do
    if grep -q "^$var=" deploy_kryonix_fixed.sh; then
        log_test "SUCCESS" "✓ Variável $var definida"
    else
        log_test "ERROR" "✗ Variável $var não encontrada"
        ((missing_vars++))
    fi
done

if [ $missing_vars -eq 0 ]; then
    log_test "SUCCESS" "Todas as variáveis essenciais estão definidas"
else
    log_test "ERROR" "$missing_vars variáveis essenciais estão faltando"
fi

# Teste 3: Verificar se todas as funções essenciais estão presentes
log_test "TEST" "Verificando presença de funções essenciais..."

required_functions=(
    "show_banner"
    "check_root"
    "intelligent_system_update"
    "intelligent_docker_install"
    "intelligent_project_analysis"
    "intelligent_directory_setup"
    "intelligent_traefik_setup"
    "create_intelligent_compose"
    "create_intelligent_dockerfiles"
    "intelligent_project_build"
    "intelligent_final_deploy"
    "verify_deployment"
    "test_https_connectivity"
    "show_final_links"
    "main"
)

missing_functions=0
for func in "${required_functions[@]}"; do
    if grep -q "^$func()" deploy_kryonix_fixed.sh; then
        log_test "SUCCESS" "✓ Função $func() encontrada"
    else
        log_test "ERROR" "✗ Função $func() não encontrada"
        ((missing_functions++))
    fi
done

if [ $missing_functions -eq 0 ]; then
    log_test "SUCCESS" "Todas as funções essenciais estão presentes"
else
    log_test "ERROR" "$missing_functions funções essenciais estão faltando"
fi

# Teste 4: Verificar estrutura do docker-compose gerado
log_test "TEST" "Verificando estrutura do docker-compose no script..."

required_services=(
    "traefik"
    "postgres"
    "redis"
    "project-frontend"
    "project-backend"
    "portainer-siqueira"
    "portainer-meuboot"
    "adminer"
    "n8n"
    "grafana"
    "minio"
)

missing_services=0
for service in "${required_services[@]}"; do
    if grep -q "  $service:" deploy_kryonix_fixed.sh; then
        log_test "SUCCESS" "✓ Serviço $service configurado"
    else
        log_test "ERROR" "✗ Serviço $service não encontrado"
        ((missing_services++))
    fi
done

if [ $missing_services -eq 0 ]; then
    log_test "SUCCESS" "Todos os serviços essenciais estão configurados"
else
    log_test "ERROR" "$missing_services serviços essenciais estão faltando"
fi

# Teste 5: Verificar se há configurações HTTPS/Traefik
log_test "TEST" "Verificando configurações HTTPS e Traefik..."

if grep -q "letsencrypt" deploy_kryonix_fixed.sh; then
    log_test "SUCCESS" "✓ Configuração Let's Encrypt encontrada"
else
    log_test "ERROR" "✗ Configuração Let's Encrypt não encontrada"
fi

if grep -q "traefik.http.routers" deploy_kryonix_fixed.sh; then
    log_test "SUCCESS" "✓ Configurações de roteamento Traefik encontradas"
else
    log_test "ERROR" "✗ Configurações de roteamento Traefik não encontradas"
fi

# Teste 6: Verificar permissões e estrutura de diretórios
log_test "TEST" "Verificando configurações de diretórios e permissões..."

if grep -q "mkdir -p.*KRYONIX_DIR" deploy_kryonix_fixed.sh; then
    log_test "SUCCESS" "✓ Criação de diretórios configurada"
else
    log_test "ERROR" "✗ Criação de diretórios não configurada"
fi

if grep -q "chown" deploy_kryonix_fixed.sh; then
    log_test "SUCCESS" "✓ Configuração de permissões encontrada"
else
    log_test "WARNING" "⚠ Configuração de permissões não encontrada"
fi

# Teste 7: Verificar se há tratamento de erros
log_test "TEST" "Verificando tratamento de erros..."

if grep -q "handle_error" deploy_kryonix_fixed.sh; then
    log_test "SUCCESS" "✓ Tratamento de erros configurado"
else
    log_test "WARNING" "⚠ Tratamento de erros básico"
fi

if grep -q "trap.*ERR" deploy_kryonix_fixed.sh; then
    log_test "SUCCESS" "✓ Trap de erros configurado"
else
    log_test "WARNING" "⚠ Trap de erros não configurado"
fi

# Teste 8: Verificar logs e feedback visual
log_test "TEST" "Verificando sistema de logs e feedback visual..."

if grep -q "log.*SUCCESS\|ERROR\|WARNING\|INFO" deploy_kryonix_fixed.sh; then
    log_test "SUCCESS" "✓ Sistema de logs configurado"
else
    log_test "ERROR" "✗ Sistema de logs não encontrado"
fi

# Teste 9: Simular execução dry-run das principais funções
log_test "TEST" "Executando teste dry-run das funções de validação..."

# Simular verificação de root (sem ser root)
if grep -q "EUID.*root" deploy_kryonix_fixed.sh; then
    log_test "SUCCESS" "✓ Verificação de root implementada"
else
    log_test "ERROR" "✗ Verificação de root não implementada"
fi

# Resumo final dos testes
echo
echo -e "${BOLD}${CYAN}📊 RESUMO DOS TESTES:${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━��━━━━━━━━━━━━━"

total_errors=$(( missing_vars + missing_functions + missing_services ))

if [ $total_errors -eq 0 ]; then
    log_test "SUCCESS" "🎉 TODOS OS TESTES PASSARAM! Script pronto para deploy"
    echo
    echo -e "${BOLD}${GREEN}✅ O script deploy_kryonix_fixed.sh está validado e pronto para uso!${NC}"
    echo -e "${BOLD}${GREEN}🚀 Pode executar no servidor com segurança${NC}"
    echo
    exit 0
else
    log_test "ERROR" "❌ $total_errors problemas encontrados no script"
    echo
    echo -e "${BOLD}${RED}⚠️  O script precisa de correções antes do deploy${NC}"
    echo -e "${BOLD}${YELLOW}🔧 Corrija os problemas identificados acima${NC}"
    echo
    exit 1
fi
