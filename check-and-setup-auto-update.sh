#!/bin/bash

##############################################################################
#                    🔍 VERIFICAÇÃO E SETUP AUTO-UPDATE                     #
#              Verifica e configura atualização automática GitHub            #
##############################################################################

set -euo pipefail

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configurações
PROJECT_NAME="site-jurez-2.0"
GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0"
WEBHOOK_PORT="9999"
WEBHOOK_SECRET="kryonix_webhook_secret_2024"
LOG_FILE="/var/log/auto-update-check.log"

# Função para logging
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR $(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING $(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

info() {
    echo -e "${BLUE}[INFO $(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

echo -e "${BLUE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║     🔍 VERIFICAÇÃO DE AUTO-ATUALIZAÇÃO GITHUB                   ║
║                                                                  ║
║     Checando se o sistema está atualizando automaticamente      ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}\n"

# Verificar se estamos executando como root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "❌ Execute como root: sudo bash $0"
        exit 1
    fi
}

# Encontrar diretório do projeto
find_project_directory() {
    log "🔍 Procurando diretório do projeto..."
    
    local possible_dirs=(
        "/opt/site-jurez-2.0"
        "/opt/mega-deploy/app/site-jurez-2.0"
        "/home/ubuntu/site-jurez-2.0"
        "/var/www/site-jurez-2.0"
        "$(pwd)/site-jurez-2.0"
    )
    
    for dir in "${possible_dirs[@]}"; do
        if [ -d "$dir" ]; then
            PROJECT_DIR="$dir"
            log "✅ Projeto encontrado em: $PROJECT_DIR"
            return 0
        fi
    done
    
    warning "⚠️ Projeto não encontrado nos diretórios padrão"
    return 1
}

# Verificar se o repositório Git está atualizado
check_git_status() {
    log "📋 Verificando status do repositório Git..."
    
    if [ ! -d "$PROJECT_DIR" ]; then
        error "❌ Diretório do projeto não encontrado: $PROJECT_DIR"
        return 1
    fi
    
    cd "$PROJECT_DIR"
    
    if [ ! -d ".git" ]; then
        error "❌ Não é um repositório Git válido"
        return 1
    fi
    
    # Verificar origem remota
    local remote_url=$(git remote get-url origin 2>/dev/null || echo "")
    info "🔗 URL remota: $remote_url"
    
    # Fazer fetch para verificar atualizações
    log "📡 Verificando atualizações remotas..."
    git fetch origin 2>/dev/null || {
        error "❌ Erro ao fazer fetch do repositório"
        return 1
    }
    
    # Verificar se há commits para puxar
    local commits_behind=$(git rev-list HEAD...origin/main --count 2>/dev/null || echo "0")
    if [ "$commits_behind" -gt 0 ]; then
        warning "⚠️ Repositório está $commits_behind commit(s) atrás da branch main"
        return 2
    else
        log "✅ Repositório está atualizado"
        return 0
    fi
}

# Verificar serviços systemd relacionados ao webhook
check_webhook_services() {
    log "🔍 Verificando serviços webhook..."
    
    local services=(
        "github-webhook.service"
        "kryonix-webhook.service"
        "webhook-deploy.service"
    )
    
    local active_services=0
    
    for service in "${services[@]}"; do
        if systemctl is-active --quiet "$service" 2>/dev/null; then
            log "✅ Serviço $service está ativo"
            ((active_services++))
        elif systemctl list-unit-files | grep -q "$service"; then
            warning "⚠️ Serviço $service existe mas não está ativo"
            systemctl status "$service" --no-pager -l
        else
            info "ℹ️ Serviço $service não encontrado"
        fi
    done
    
    if [ $active_services -eq 0 ]; then
        warning "⚠️ Nenhum serviço webhook ativo encontrado"
        return 1
    else
        log "✅ $active_services serviço(s) webhook ativo(s)"
        return 0
    fi
}

# Verificar cron jobs
check_cron_jobs() {
    log "⏰ Verificando cron jobs de atualização..."
    
    local cron_found=0
    
    # Verificar crontab do usuário root
    if crontab -l 2>/dev/null | grep -i "git\|pull\|update\|deploy" >/dev/null; then
        log "✅ Cron job de atualização encontrado no crontab do root"
        crontab -l | grep -i "git\|pull\|update\|deploy"
        ((cron_found++))
    fi
    
    # Verificar cron jobs em /etc/cron.d/
    if ls /etc/cron.d/ 2>/dev/null | xargs grep -l "git\|pull\|update\|deploy" 2>/dev/null >/dev/null; then
        log "✅ Cron job de atualização encontrado em /etc/cron.d/"
        ls /etc/cron.d/ | xargs grep -l "git\|pull\|update\|deploy" 2>/dev/null
        ((cron_found++))
    fi
    
    if [ $cron_found -eq 0 ]; then
        warning "⚠️ Nenhum cron job de atualização encontrado"
        return 1
    else
        log "✅ $cron_found cron job(s) de atualização encontrado(s)"
        return 0
    fi
}

# Verificar portas webhook
check_webhook_ports() {
    log "🔌 Verificando portas webhook..."
    
    local webhook_ports=("9999" "9001" "3001")
    local active_ports=0
    
    for port in "${webhook_ports[@]}"; do
        if netstat -tulpn 2>/dev/null | grep -q ":$port "; then
            log "✅ Porta $port está em uso (possível webhook)"
            netstat -tulpn | grep ":$port "
            ((active_ports++))
        fi
    done
    
    if [ $active_ports -eq 0 ]; then
        warning "⚠️ Nenhuma porta webhook ativa encontrada"
        return 1
    else
        log "✅ $active_ports porta(s) webhook ativa(s)"
        return 0
    fi
}

# Configurar auto-atualização se não estiver ativa
setup_auto_update() {
    log "🔧 Configurando sistema de auto-atualização..."
    
    # Criar diretório para scripts
    mkdir -p /opt/auto-update
    
    # Script de atualização manual
    cat > /opt/auto-update/update-project.sh << 'EOF'
#!/bin/bash

PROJECT_DIR="/opt/site-jurez-2.0"
LOG_FILE="/var/log/auto-update.log"

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Procurar diretório do projeto
if [ ! -d "$PROJECT_DIR" ]; then
    for possible_dir in "/opt/mega-deploy/app/site-jurez-2.0" "/home/ubuntu/site-jurez-2.0" "/var/www/site-jurez-2.0"; do
        if [ -d "$possible_dir" ]; then
            PROJECT_DIR="$possible_dir"
            break
        fi
    done
fi

if [ ! -d "$PROJECT_DIR" ]; then
    log "❌ Projeto não encontrado"
    exit 1
fi

cd "$PROJECT_DIR"

log "🔄 Iniciando atualização do projeto..."

# Verificar se há mudanças
git fetch origin
commits_behind=$(git rev-list HEAD...origin/main --count 2>/dev/null || echo "0")

if [ "$commits_behind" -eq 0 ]; then
    log "✅ Projeto já está atualizado"
    exit 0
fi

log "📥 Atualizando projeto ($commits_behind commit(s) atrás)..."

# Fazer backup antes de atualizar
if [ -d "node_modules" ]; then
    log "💾 Fazendo backup dos node_modules..."
    tar -czf "/tmp/node_modules_backup_$(date +%Y%m%d_%H%M%S).tar.gz" node_modules/ 2>/dev/null || true
fi

# Atualizar código
git pull origin main

if [ $? -eq 0 ]; then
    log "✅ Código atualizado com sucesso"
    
    # Instalar dependências se package.json foi modificado
    if git diff --name-only HEAD~1 HEAD | grep -q "package.json"; then
        log "📦 package.json modificado, instalando dependências..."
        npm install
    fi
    
    # Reiniciar serviços se necessário
    if [ -f "docker-compose.yml" ]; then
        log "🔄 Reiniciando containers Docker..."
        docker-compose down && docker-compose up -d --build
    elif [ -f "package.json" ] && pgrep -f "node" >/dev/null; then
        log "🔄 Reiniciando aplicação Node.js..."
        pkill -f "node" || true
        nohup npm start > /var/log/app.log 2>&1 &
    fi
    
    log "🎉 Atualização concluída com sucesso!"
else
    log "❌ Erro na atualização do código"
    exit 1
fi
EOF
    
    chmod +x /opt/auto-update/update-project.sh
    
    # Configurar cron job para verificar atualizações a cada 10 minutos
    (crontab -l 2>/dev/null || true; echo "*/10 * * * * /opt/auto-update/update-project.sh >/dev/null 2>&1") | crontab -
    
    # Criar script de webhook simples
    cat > /opt/auto-update/webhook-server.py << EOF
#!/usr/bin/env python3
import http.server
import socketserver
import subprocess
import json
import hashlib
import hmac
import urllib.parse

WEBHOOK_SECRET = "$WEBHOOK_SECRET"
PORT = $WEBHOOK_PORT

class WebhookHandler(http.server.BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path == '/webhook':
            content_length = int(self.headers['Content-Length'])
            payload = self.rfile.read(content_length)
            
            signature = self.headers.get('X-Hub-Signature-256', '')
            
            # Verificar assinatura (se configurada no GitHub)
            if WEBHOOK_SECRET and signature:
                expected = 'sha256=' + hmac.new(
                    WEBHOOK_SECRET.encode(),
                    payload,
                    hashlib.sha256
                ).hexdigest()
                
                if not hmac.compare_digest(signature, expected):
                    self.send_response(401)
                    self.end_headers()
                    return
            
            try:
                data = json.loads(payload.decode('utf-8'))
                
                # Verificar se é push para branch main
                if data.get('ref') == 'refs/heads/main':
                    print(f"[{datetime.now()}] Webhook recebido - Atualizando projeto...")
                    
                    result = subprocess.run(
                        ['/opt/auto-update/update-project.sh'],
                        capture_output=True,
                        text=True,
                        timeout=300
                    )
                    
                    if result.returncode == 0:
                        self.send_response(200)
                        self.send_header('Content-type', 'text/plain')
                        self.end_headers()
                        self.wfile.write(b'Atualização executada com sucesso!')
                    else:
                        self.send_response(500)
                        self.send_header('Content-type', 'text/plain')
                        self.end_headers()
                        self.wfile.write(f'Erro na atualização: {result.stderr}'.encode())
                else:
                    self.send_response(200)
                    self.end_headers()
                    
            except Exception as e:
                print(f"Erro no webhook: {e}")
                self.send_response(500)
                self.end_headers()
        else:
            self.send_response(404)
            self.end_headers()
    
    def log_message(self, format, *args):
        pass  # Suprimir logs padrão

if __name__ == '__main__':
    from datetime import datetime
    
    try:
        with socketserver.TCPServer(('', PORT), WebhookHandler) as httpd:
            print(f'Webhook server iniciado na porta {PORT}')
            print(f'URL: http://SEU_IP:{PORT}/webhook')
            httpd.serve_forever()
    except Exception as e:
        print(f'Erro ao iniciar servidor webhook: {e}')
EOF
    
    chmod +x /opt/auto-update/webhook-server.py
    
    # Criar serviço systemd para webhook
    cat > /etc/systemd/system/auto-update-webhook.service << EOF
[Unit]
Description=Auto Update Webhook Server
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/auto-update
ExecStart=/usr/bin/python3 /opt/auto-update/webhook-server.py
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF
    
    # Ativar e iniciar serviço
    systemctl daemon-reload
    systemctl enable auto-update-webhook.service
    systemctl start auto-update-webhook.service
    
    log "✅ Sistema de auto-atualização configurado!"
}

# Gerar relatório
generate_report() {
    log "📊 Gerando relatório de verificação..."
    
    local report_file="/tmp/auto-update-report.txt"
    
    cat > "$report_file" << EOF
🔍 RELATÓRIO DE VERIFICAÇÃO DE AUTO-ATUALIZAÇÃO
===============================================
Data: $(date)
Servidor: $(hostname -I | awk '{print $1}')

📁 PROJETO
----------
Diretório: ${PROJECT_DIR:-"Não encontrado"}
Status Git: $(cd "$PROJECT_DIR" 2>/dev/null && git status --porcelain | wc -l) arquivo(s) modificado(s)
Branch atual: $(cd "$PROJECT_DIR" 2>/dev/null && git branch --show-current)
Último commit: $(cd "$PROJECT_DIR" 2>/dev/null && git log -1 --pretty=format:"%h - %s (%cr)")

🔧 SERVIÇOS WEBHOOK
------------------
$(systemctl list-units --type=service | grep -E "(webhook|deploy)" || echo "Nenhum serviço webhook encontrado")

⏰ CRON JOBS
------------
$(crontab -l 2>/dev/null | grep -E "(git|pull|update|deploy)" || echo "Nenhum cron job de atualização encontrado")

🔌 PORTAS ATIVAS
---------------
$(netstat -tulpn 2>/dev/null | grep -E ":(9999|9001|3001) " || echo "Nenhuma porta webhook encontrada")

📝 LOGS RECENTES
---------------
$(tail -10 "$LOG_FILE" 2>/dev/null || echo "Nenhum log encontrado")

💡 RECOMENDAÇÕES
---------------
EOF
    
    # Adicionar recomendações baseadas nos resultados
    if [ ! -d "$PROJECT_DIR" ]; then
        echo "❌ Configure o diretório do projeto" >> "$report_file"
    fi
    
    if ! systemctl list-units --type=service | grep -q webhook; then
        echo "❌ Configure um serviço webhook" >> "$report_file"
    fi
    
    if ! crontab -l 2>/dev/null | grep -q update; then
        echo "❌ Configure um cron job de verificação" >> "$report_file"
    fi
    
    cat "$report_file"
    log "📄 Relatório salvo em: $report_file"
}

# Função principal
main() {
    log "🚀 Iniciando verificação de auto-atualização..."
    
    check_root
    
    local project_found=false
    local webhook_active=false
    local cron_active=false
    
    # Verificações
    if find_project_directory; then
        project_found=true
        check_git_status
    fi
    
    if check_webhook_services; then
        webhook_active=true
    fi
    
    if check_cron_jobs; then
        cron_active=true
    fi
    
    check_webhook_ports
    
    # Decidir se precisa configurar auto-atualização
    if [ "$project_found" = true ] && ([ "$webhook_active" = true ] || [ "$cron_active" = true ]); then
        log "✅ Sistema de auto-atualização parece estar funcionando"
    else
        warning "⚠️ Sistema de auto-atualização não está completamente configurado"
        
        read -p "Deseja configurar o sistema de auto-atualização agora? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            setup_auto_update
        fi
    fi
    
    generate_report
    
    log "🎉 Verificação concluída!"
}

# Executar se script for chamado diretamente
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
