#!/bin/bash

# 🔄 Continuar Deploy após correção do Dockerfile
# Desenvolvido por Kryonix

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🔄 Continuando deploy após correção...${NC}"

# Parar containers
echo -e "${BLUE}[INFO] Parando containers...${NC}"
docker-compose down

# Limpar cache do Docker
echo -e "${BLUE}[INFO] Limpando cache do Docker...${NC}"
docker system prune -f

# Rebuild apenas o app
echo -e "${BLUE}[INFO] Reconstruindo aplicação...${NC}"
docker-compose build --no-cache app

# Iniciar todos os serviços
echo -e "${BLUE}[INFO] Iniciando todos os serviços...${NC}"
docker-compose up -d

# Aguardar serviços
echo -e "${BLUE}[INFO] Aguardando serviços iniciarem...${NC}"
sleep 30

# Verificar status
echo -e "${BLUE}[INFO] Verificando status...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Deploy continuado com sucesso!${NC}"
echo -e "${YELLOW}🌐 Aguarde o DNS propagar para SSL funcionar${NC}"
echo -e "${BLUE}📊 Execute: ./monitor-traefik.sh para monitorar${NC}"
