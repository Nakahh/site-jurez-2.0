#!/bin/bash

#==============================================================================
# 🚀 QUICK START - SIQUEIRA CAMPOS IMÓVEIS
# Script de início rápido para deploy da infraestrutura
#==============================================================================

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

# Banner
clear
echo -e "${CYAN}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   🚀 QUICK START - SIQUEIRA CAMPOS IMÓVEIS                                  ║
║                                                                              ║
║   Deploy Enterprise em 3 passos simples                                     ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificações básicas
echo -e "${BLUE}📋 Verificando pré-requisitos...${NC}"

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}❌ Este script deve ser executado como root${NC}"
    echo -e "${YELLOW}💡 Execute: sudo $0${NC}"
    exit 1
fi

# Verificar sistema
if ! command -v apt-get &> /dev/null; then
    echo -e "${RED}❌ Sistema não compatível (precisa ser Ubuntu/Debian)${NC}"
    exit 1
fi

# Verificar conexão com internet
if ! ping -c 1 google.com &> /dev/null; then
    echo -e "${RED}❌ Sem conexão com internet${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Pré-requisitos verificados${NC}"

# Verificar se os arquivos existem
if [[ ! -f "install-infra.sh" ]]; then
    echo -e "${YELLOW}⚠️  Arquivo install-infra.sh não encontrado${NC}"
    echo -e "${BLUE}📥 Fazendo download...${NC}"
    
    # Aqui você colocaria o link real do arquivo
    # wget https://raw.githubusercontent.com/seu-repo/install-infra.sh
    echo -e "${RED}❌ Por favor, certifique-se de que install-infra.sh está no diretório atual${NC}"
    exit 1
fi

# Tornar executável
echo -e "${BLUE}🔧 Preparando instalador...${NC}"
chmod +x install-infra.sh

# Informações importantes
echo -e "\n${WHITE}📋 INFORMAÇÕES IMPORTANTES:${NC}"
echo -e "   • ${YELLOW}Duração estimada:${NC} 15-20 minutos"
echo -e "   • ${YELLOW}Domínios configurados:${NC}"
echo -e "     - siqueicamposimoveis.com.br"
echo -e "     - meuboot.site"
echo -e "   • ${YELLOW}Certificados SSL:${NC} Automático via Let's Encrypt"
echo -e "   • ${YELLOW}Senhas:${NC} Geradas automaticamente"

# Confirmação
echo -e "\n${CYAN}🚀 Pronto para iniciar o deploy enterprise?${NC}"
echo -e "${WHITE}Este processo irá:${NC}"
echo "   1. Limpar o servidor (preservando SSH)"
echo "   2. Instalar Docker, Node.js, PostgreSQL"
echo "   3. Configurar Traefik com SSL automático"
echo "   4. Fazer deploy de todos os serviços"
echo "   5. Configurar webhook GitHub"
echo "   6. Gerar relatório completo"

echo ""
read -p "$(echo -e ${YELLOW}Deseja continuar? [S/n]: ${NC})" -n 1 -r
echo ""

if [[ $REPLY =~ ^[Nn]$ ]]; then
    echo -e "${YELLOW}❌ Deploy cancelado pelo usuário${NC}"
    exit 0
fi

# Início do deploy
echo -e "\n${GREEN}🚀 Iniciando deploy enterprise...${NC}"
echo -e "${BLUE}📝 Logs em tempo real serão salvos em /var/log/kryonix-deploy/${NC}"

# Executar o script principal
./install-infra.sh

# Verificar se foi bem-sucedido
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}🎉 DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
    echo -e "${CYAN}📁 Verifique as senhas em: /opt/senhas-sistema.txt${NC}"
    echo -e "${YELLOW}⏰ Aguarde alguns minutos para certificados SSL serem emitidos${NC}"
else
    echo -e "\n${RED}❌ Erro durante o deploy${NC}"
    echo -e "${YELLOW}📝 Verifique os logs em: /var/log/kryonix-deploy/${NC}"
fi
