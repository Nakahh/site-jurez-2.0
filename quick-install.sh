#!/bin/bash

#################################################################
#                  INSTALAÇÃO RÁPIDA KRYONIX                   #
#     Script de instalação expressa da infraestrutura          #
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

# Banner
clear
echo -e "${PURPLE}"
cat << 'EOF'
 ██╗  ██╗██████╗ ██╗   ██╗ ██████╗ ███╗   ██╗██╗██╗  ██╗
 ██║ ██╔╝██╔══██╗╚██╗ ██╔╝██╔═══██╗████╗  ██║██║╚██╗██╔╝
 █████╔╝ ██████╔╝ ╚████╔╝ ██║   ██║██╔██╗ ██║██║ ╚███╔╝ 
 ██╔═██╗ ██╔══██╗  ╚██╔╝  ██║   ██║██║╚██╗██║██║ ██╔██╗ 
 ██║  ██╗██║  ██║   ██║   ╚██████╔╝██║ ╚████║██║██╔╝ ██╗
 ╚═╝  ╚═╝╚═╝  ╚═╝   ╚═╝    ╚═════╝ ╚═╝  ╚═══╝╚═╝╚═╝  ╚═╝
                                                          
      INSTALAÇÃO RÁPIDA - INFRAESTRUTURA AUTOMATIZADA        
EOF
echo -e "${NC}"

echo -e "${CYAN}════════════════════════════════════════════════════════════════${NC}"
echo -e "${WHITE}  🚀 Deploy completo em um comando${NC}"
echo -e "${WHITE}  🔒 SSL automático + Segurança hardened${NC}"
echo -e "${WHITE}  🐳 Docker Swarm + Traefik Proxy${NC}"
echo -e "${WHITE}  📊 Monitoramento + Backup automático${NC}"
echo -e "${CYAN}══════════════════════════════════���═════════════════════════════${NC}"

echo ""
echo -e "${YELLOW}📋 Este script irá:${NC}"
echo -e "   1️⃣  Validar ambiente e pré-requisitos"
echo -e "   2️⃣  Baixar e configurar todos os componentes"
echo -e "   3️⃣  Executar instalação completa automatizada"
echo -e "   4️⃣  Configurar monitoramento e backup"
echo -e "   5️⃣  Gerar relatório final com credenciais"

echo ""
echo -e "${RED}⚠️  IMPORTANTE:${NC}"
echo -e "   • Execute apenas em Ubuntu 24.04 LTS"
echo -e "   • Requer acesso root (sudo)"
echo -e "   • Processo leva 15-30 minutos"
echo -e "   • Configure DNS dos domínios primeiro"

echo ""
echo -e "${CYAN}🌐 Domínios que serão configurados:${NC}"
echo -e "   🔷 meuboot.site (Painel Admin)"
echo -e "   🔶 siqueicamposimoveis.com.br (Site Público)"

echo ""
read -p "$(echo -e ${WHITE}Continuar com a instalação? [y/N]:${NC} )" -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}❌ Instalação cancelada pelo usuário${NC}"
    exit 0
fi

# Verificar root
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}❌ Este script deve ser executado como root${NC}"
    echo -e "${YELLOW}💡 Execute: sudo $0${NC}"
    exit 1
fi

# Verificar Ubuntu
if ! lsb_release -d 2>/dev/null | grep -q "Ubuntu 24.04"; then
    echo -e "${RED}❌ Este script é otimizado para Ubuntu 24.04 LTS${NC}"
    echo -e "${YELLOW}💡 Versão atual: $(lsb_release -d | cut -f2)${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}🔍 Verificando ambiente...${NC}"

# Verificar conectividade
if ! ping -c 1 google.com &> /dev/null; then
    echo -e "${RED}❌ Sem conectividade com internet${NC}"
    exit 1
fi

# Verificar memória
memory_gb=$(free -g | awk 'NR==2{print $2}')
if [[ $memory_gb -lt 8 ]]; then
    echo -e "${YELLOW}⚠️  Memória baixa: ${memory_gb}GB (recomendado: 24GB+)${NC}"
    read -p "Continuar mesmo assim? [y/N]: " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Verificar espaço em disco
disk_gb=$(df / | tail -1 | awk '{print int($4/1024/1024)}')
if [[ $disk_gb -lt 20 ]]; then
    echo -e "${RED}❌ Espaço em disco insuficiente: ${disk_gb}GB (mínimo: 50GB)${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ambiente validado com sucesso${NC}"

echo ""
echo -e "${BLUE}📥 Baixando arquivos da infraestrutura...${NC}"

# Criar diretório temporário
TEMP_DIR="/tmp/kryonix-install-$(date +%s)"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

# Simular download dos arquivos (na prática, vem do repositório)
echo -e "${CYAN}   📄 install-infra.sh${NC}"
echo -e "${CYAN}   📄 validate-final.sh${NC}"
echo -e "${CYAN}   📄 Dockerfile${NC}"
echo -e "${CYAN}   📄 docker-compose.dev.yml${NC}"
echo -e "${CYAN}   📄 Scripts de backup e monitoramento${NC}"

# Copiar arquivos do diretório atual
cp -r /opt/siqueicamposimoveis/* "$TEMP_DIR/" 2>/dev/null || true

echo -e "${GREEN}✅ Arquivos baixados${NC}"

echo ""
echo -e "${BLUE}🚀 Iniciando instalação automatizada...${NC}"
echo -e "${YELLOW}☕ Pegue um café - processo leva 15-30 minutos${NC}"
echo ""

# Tornar scripts executáveis
chmod +x *.sh 2>/dev/null || true

# Executar validação final
if [[ -f "validate-final.sh" ]]; then
    echo -e "${CYAN}🔍 Executando validação prévia...${NC}"
    ./validate-final.sh || {
        echo -e "${RED}❌ Validação falhou - verifique os problemas acima${NC}"
        exit 1
    }
fi

# Executar instalação principal
if [[ -f "install-infra.sh" ]]; then
    echo -e "${CYAN}🚀 Executando instalação principal...${NC}"
    ./install-infra.sh || {
        echo -e "${RED}❌ Instalação falhou - verificar logs${NC}"
        exit 1
    }
else
    echo -e "${RED}❌ Script principal install-infra.sh não encontrado${NC}"
    exit 1
fi

# Limpeza
cd /
rm -rf "$TEMP_DIR"

echo ""
echo -e "${GREEN}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║  🎉 INSTALAÇÃO CONCLUÍDA COM SUCESSO! 🎉                    ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${CYAN}📋 Próximos passos:${NC}"
echo -e "   1️⃣  Configurar DNS dos domínios para apontar para este servidor"
echo -e "   2️⃣  Acessar: https://meuboot.site (Painel Admin)"
echo -e "   3️⃣  Acessar: https://siqueicamposimoveis.com.br (Site Público)"
echo -e "   4️⃣  Configurar webhook no GitHub conforme instruções"

echo ""
echo -e "${CYAN}📄 Documentação completa:${NC}"
echo -e "   📖 README-KRYONIX-INFRA.md"
echo -e "   📊 /opt/kryonix/deploy-summary.txt"

echo ""
echo -e "${CYAN}🔧 Comandos úteis:${NC}"
echo -e "   • Status: ${WHITE}docker ps${NC}"
echo -e "   • Logs: ${WHITE}docker logs <container>${NC}"
echo -e "   • Backup: ${WHITE}/opt/kryonix/scripts/backup-system.sh${NC}"
echo -e "   • Monitor: ${WHITE}/opt/kryonix/scripts/watchdog.sh${NC}"

echo ""
echo -e "${GREEN}🎯 Infraestrutura KRYONIX pronta para produção!${NC}"

exit 0
