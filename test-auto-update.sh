#!/bin/bash

# 🔍 TESTE RÁPIDO DE AUTO-ATUALIZAÇÃO GITHUB
# Execute: sudo bash test-auto-update.sh

echo "🔍 VERIFICANDO AUTO-ATUALIZAÇÃO DO GITHUB..."
echo "============================================="

# Encontrar projeto
echo "📁 Procurando projeto..."
PROJECT_FOUND=false
for dir in "/opt/site-jurez-2.0" "/opt/mega-deploy/app/site-jurez-2.0" "/home/ubuntu/site-jurez-2.0"; do
    if [ -d "$dir" ]; then
        echo "✅ Projeto encontrado em: $dir"
        cd "$dir"
        PROJECT_FOUND=true
        break
    fi
done

if [ "$PROJECT_FOUND" = false ]; then
    echo "❌ Projeto não encontrado!"
    echo "📝 Criando teste em /tmp..."
    cd /tmp
    git clone https://github.com/Nakahh/site-jurez-2.0 test-repo 2>/dev/null || echo "Erro ao clonar"
    cd test-repo 2>/dev/null || exit 1
fi

# Verificar Git
echo ""
echo "📋 STATUS DO REPOSITÓRIO:"
echo "Remote: $(git remote get-url origin 2>/dev/null || echo 'Não configurado')"
echo "Branch: $(git branch --show-current 2>/dev/null || echo 'Não identificada')"
echo "Último commit: $(git log -1 --oneline 2>/dev/null || echo 'Nenhum commit')"

# Verificar atualizações
echo ""
echo "🔄 VERIFICANDO ATUALIZAÇÕES..."
git fetch origin 2>/dev/null && echo "✅ Fetch realizado" || echo "❌ Erro no fetch"

COMMITS_BEHIND=$(git rev-list HEAD...origin/main --count 2>/dev/null || echo "0")
if [ "$COMMITS_BEHIND" -gt 0 ]; then
    echo "⚠️ PROJETO ESTÁ $COMMITS_BEHIND COMMIT(S) ATRÁS!"
    echo "🔄 Para atualizar manualmente: git pull origin main"
else
    echo "✅ Projeto está atualizado"
fi

# Verificar serviços
echo ""
echo "🔧 VERIFICANDO SERVIÇOS AUTOMÁTICOS..."

# Webhook services
echo "Serviços webhook:"
for service in github-webhook kryonix-webhook webhook-deploy auto-update-webhook; do
    if systemctl is-active --quiet "${service}.service" 2>/dev/null; then
        echo "  ✅ $service.service - ATIVO"
    elif systemctl list-unit-files 2>/dev/null | grep -q "$service"; then
        echo "  ⚠️ $service.service - EXISTE MAS INATIVO"
    else
        echo "  ❌ $service.service - NÃO ENCONTRADO"
    fi
done

# Cron jobs
echo ""
echo "Cron jobs:"
if crontab -l 2>/dev/null | grep -i "git\|pull\|update\|deploy" >/dev/null; then
    echo "  ✅ Cron job encontrado:"
    crontab -l | grep -i "git\|pull\|update\|deploy" | while read line; do
        echo "    $line"
    done
else
    echo "  ❌ Nenhum cron job de atualização encontrado"
fi

# Portas webhook
echo ""
echo "Portas webhook:"
for port in 9999 9001 3001; do
    if netstat -tulpn 2>/dev/null | grep -q ":$port "; then
        echo "  ✅ Porta $port - EM USO"
        netstat -tulpn | grep ":$port " | head -1
    else
        echo "  ❌ Porta $port - LIVRE"
    fi
done

# Resultado final
echo ""
echo "📊 RESUMO:"
if systemctl is-active --quiet github-webhook.service 2>/dev/null || \
   systemctl is-active --quiet kryonix-webhook.service 2>/dev/null || \
   systemctl is-active --quiet webhook-deploy.service 2>/dev/null || \
   (crontab -l 2>/dev/null | grep -q "git\|pull\|update"); then
    echo "✅ SISTEMA DE AUTO-ATUALIZAÇÃO PARECE ESTAR ATIVO"
else
    echo "❌ SISTEMA DE AUTO-ATUALIZAÇÃO NÃO ESTÁ CONFIGURADO"
    echo ""
    echo "🔧 PARA CONFIGURAR AGORA:"
    echo "1. Execute: sudo bash check-and-setup-auto-update.sh"
    echo "2. Ou configure manualmente um webhook no GitHub"
    echo "3. URL webhook: http://SEU_IP:9999/webhook"
fi

echo ""
echo "🕐 Verificação concluída em $(date)"
