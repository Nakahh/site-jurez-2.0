#!/bin/bash

##############################################################################
#                     🛠️ PREPARADOR KRYONIX                                 #
#               Preparação Final dos Arquivos do Sistema                     #
##############################################################################

echo "🛠️ Preparando arquivos do sistema KRYONIX..."

# Dar permissões de execução
chmod +x deploy_kryonix_complete.sh
chmod +x install_kryonix.sh  
chmod +x github-webhook.sh

# Verificar se todos os arquivos estão presentes
files=("deploy_kryonix_complete.sh" "install_kryonix.sh" "github-webhook.sh" "docker-compose.kryonix.yml" "prometheus.yml")

echo "📋 Verificando arquivos necessários..."

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file - ARQUIVO FALTANDO!"
    fi
done

echo
echo "🎯 Preparação concluída!"
echo
echo "📖 INSTRUÇÕES DE USO:"
echo "===================="
echo
echo "1️⃣ INSTALAÇÃO RÁPIDA (Recomendado):"
echo "   sudo ./install_kryonix.sh"
echo
echo "2️⃣ INSTALAÇÃO MANUAL:"
echo "   sudo ./deploy_kryonix_complete.sh"
echo
echo "3️⃣ VERIFICAR DOCUMENTAÇÃO:"
echo "   cat README_KRYONIX.md"
echo
echo "🚀 Sistema KRYONIX pronto para instalação!"
