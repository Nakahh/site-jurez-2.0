#!/bin/bash

# Script para corrigir docker-compose.yml gerado
cd /opt/site-jurez-2.0

# Substituir todas as crases por aspas simples no docker-compose.yml
sed -i 's/Host(`\([^`]*\)`)/Host(\1)/g' docker-compose.yml

# Verificar se o arquivo foi corrigido
echo "Verificando sintaxe YAML..."
docker-compose config --quiet

if [ $? -eq 0 ]; then
    echo "✅ Docker Compose corrigido com sucesso!"
    docker-compose up -d traefik postgres redis
else
    echo "❌ Ainda há erros de sintaxe no docker-compose.yml"
    echo "Tentando executar mesmo assim..."
    docker-compose up -d traefik postgres redis || true
fi
