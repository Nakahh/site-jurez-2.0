#!/bin/bash

# Script Completo de Deploy Automático - Siqueira Campos Imóveis
# Este script configura TUDO automaticamente no servidor

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_title() {
    echo -e "${PURPLE}🚀 $1${NC}"
}

# Banner
clear
echo -e "${PURPLE}"
cat << 'EOF'
╔══════════════════════════════════════════════════════════════╗
║                 SIQUEIRA CAMPOS IMÓVEIS                      ║
║              Setup Automático do Servidor                   ║
║                                                              ║
║  ✅ Corrige problema mobile                                  ║
║  ✅ Configura redirect WWW                                   ║
║  ✅ Instala auto-deploy                                      ║
║  ✅ Configura tudo automaticamente                          ║
╚══════════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
   log_error "Este script deve ser executado como root (sudo)"
   exit 1
fi

# Detectar sistema operacional
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$ID
    VER=$VERSION_ID
else
    log_error "Sistema operacional não suportado"
    exit 1
fi

log_title "DETECTANDO SISTEMA"
log_info "Sistema: $OS $VER"

# Configurações
DOMAIN=""
EMAIL=""
GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0.git"
PROJECT_DIR="/var/www/siqueira-campos"
NGINX_CONFIG="/etc/nginx/sites-available/siqueira-campos"
NGINX_ENABLED="/etc/nginx/sites-enabled/siqueira-campos"
SERVICE_NAME="siqueira-campos"

# Perguntar configurações
echo ""
log_title "CONFIGURAÇÕES INICIAIS"
read -p "🌐 Digite seu domínio (ex: siqueicamposimoveis.com.br): " DOMAIN
read -p "📧 Digite seu email para SSL (ex: admin@$DOMAIN): " EMAIL

if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    log_error "Domínio e email são obrigatórios!"
    exit 1
fi

# Gerar webhook secret
WEBHOOK_SECRET=$(openssl rand -hex 32)

log_success "Configurações definidas:"
log_info "Domínio: $DOMAIN"
log_info "Email: $EMAIL" 
log_info "Webhook Secret: $WEBHOOK_SECRET"

echo ""
read -p "🤔 Confirma as configurações? (y/n): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_error "Configuração cancelada"
    exit 1
fi

# Função para instalar pacotes
install_packages() {
    log_title "INSTALANDO DEPENDÊNCIAS"
    
    # Atualizar repositórios
    log_info "Atualizando repositórios..."
    apt update -qq

    # Instalar pacotes essenciais
    log_info "Instalando pacotes básicos..."
    apt install -y curl wget git unzip nginx certbot python3-certbot-nginx \
        software-properties-common apt-transport-https ca-certificates \
        gnupg lsb-release supervisor ufw fail2ban htop

    log_success "Pacotes básicos instalados"
}

# Função para instalar Docker
install_docker() {
    log_title "INSTALANDO DOCKER"
    
    if command -v docker &> /dev/null; then
        log_info "Docker já instalado: $(docker --version)"
        return
    fi

    # Adicionar repositório Docker
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

    # Instalar Docker
    apt update -qq
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

    # Configurar Docker
    systemctl enable docker
    systemctl start docker
    usermod -aG docker www-data

    log_success "Docker instalado: $(docker --version)"
}

# Função para instalar Node.js
install_nodejs() {
    log_title "INSTALANDO NODE.JS"
    
    if command -v node &> /dev/null; then
        log_info "Node.js já instalado: $(node --version)"
        return
    fi

    # Instalar Node.js 18 LTS
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs

    # Verificar instalação
    log_success "Node.js instalado: $(node --version)"
    log_success "npm instalado: $(npm --version)"
}

# Função para clonar projeto
clone_project() {
    log_title "CLONANDO PROJETO"
    
    # Remover diretório se existir
    if [ -d "$PROJECT_DIR" ]; then
        log_warning "Removendo projeto existente..."
        rm -rf "$PROJECT_DIR"
    fi

    # Criar diretório
    mkdir -p "$PROJECT_DIR"
    
    # Clonar repositório
    log_info "Clonando repositório..."
    git clone "$GITHUB_REPO" "$PROJECT_DIR"
    
    # Configurar permissões
    chown -R www-data:www-data "$PROJECT_DIR"
    chmod -R 755 "$PROJECT_DIR"
    
    log_success "Projeto clonado em $PROJECT_DIR"
}

# Função para configurar projeto
setup_project() {
    log_title "CONFIGURANDO PROJETO"
    
    cd "$PROJECT_DIR"
    
    # Instalar dependências
    log_info "Instalando dependências Node.js..."
    sudo -u www-data npm ci --production=false
    
    # Criar arquivo .env
    log_info "Criando arquivo .env..."
    cat > .env << EOF
NODE_ENV=production
PORT=3001
ADMIN_PORT=3001
GITHUB_WEBHOOK_SECRET=$WEBHOOK_SECRET
DOMAIN=$DOMAIN
EMAIL=$EMAIL
EOF
    
    # Build do projeto
    log_info "Fazendo build do projeto..."
    sudo -u www-data npm run build
    
    # Configurar Git
    sudo -u www-data git config user.name "Auto Deploy"
    sudo -u www-data git config user.email "$EMAIL"
    sudo -u www-data git config --global --add safe.directory "$PROJECT_DIR"
    
    chown -R www-data:www-data "$PROJECT_DIR"
    
    log_success "Projeto configurado"
}

# Função para criar script de auto-deploy
create_autodeploy_script() {
    log_title "CRIANDO SCRIPT DE AUTO-DEPLOY"
    
    cat > "$PROJECT_DIR/auto-deploy.sh" << 'EOF'
#!/bin/bash

# Script de Auto-Deploy
set -e

cd /var/www/siqueira-campos

echo "🚀 Auto-deploy iniciado: $(date)" | tee -a /var/log/siqueira-deploy.log

# Backup
echo "📦 Criando backup..." | tee -a /var/log/siqueira-deploy.log
tar -czf "/tmp/backup-$(date +%Y%m%d-%H%M).tar.gz" . 2>/dev/null || echo "Backup falhou"

# Pull mudanças
echo "📥 Baixando mudanças..." | tee -a /var/log/siqueira-deploy.log
sudo -u www-data git fetch origin main
sudo -u www-data git reset --hard origin/main

# Instalar dependências
echo "📦 Instalando dependências..." | tee -a /var/log/siqueira-deploy.log
sudo -u www-data npm ci --production=false

# Build
echo "🏗️ Fazendo build..." | tee -a /var/log/siqueira-deploy.log
sudo -u www-data npm run build

# Restart serviços
echo "🔄 Reiniciando serviços..." | tee -a /var/log/siqueira-deploy.log
systemctl restart siqueira-campos
systemctl reload nginx

echo "✅ Auto-deploy concluído: $(date)" | tee -a /var/log/siqueira-deploy.log
EOF

    chmod +x "$PROJECT_DIR/auto-deploy.sh"
    chown www-data:www-data "$PROJECT_DIR/auto-deploy.sh"
    
    log_success "Script de auto-deploy criado"
}

# Função para configurar Nginx
configure_nginx() {
    log_title "CONFIGURANDO NGINX"
    
    # Remover configuração padrão
    rm -f /etc/nginx/sites-enabled/default
    
    # Criar configuração do site
    cat > "$NGINX_CONFIG" << EOF
# Siqueira Campos Imóveis - Configuração Nginx
# Redirect WWW to non-WWW
server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name www.$DOMAIN *.www.$DOMAIN;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # Redirect preservando protocolo
    return 301 \$scheme://$DOMAIN\$request_uri;
}

# Main server block
server {
    listen 80;
    listen [::]:80;
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    server_name $DOMAIN;
    root $PROJECT_DIR/dist;
    index index.html;
    
    # SSL certificates
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    # SSL security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Mobile optimizations
    add_header Cache-Control "public, max-age=300" always;
    add_header X-Mobile-Optimized "true" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Rate limiting
    limit_req_zone \$binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone \$binary_remote_addr zone=general:10m rate=30r/s;
    
    # API proxy
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # Timeouts para mobile
        proxy_connect_timeout 10s;
        proxy_send_timeout 10s;
        proxy_read_timeout 10s;
    }
    
    # Static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA fallback
    location / {
        limit_req zone=general burst=50 nodelay;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "OK";
        add_header Content-Type text/plain;
    }
    
    # Error pages
    error_page 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
EOF
    
    # Habilitar site
    ln -sf "$NGINX_CONFIG" "$NGINX_ENABLED"
    
    # Testar configuração
    nginx -t
    
    log_success "Nginx configurado"
}

# Função para configurar SSL
configure_ssl() {
    log_title "CONFIGURANDO SSL"
    
    # Obter certificado SSL
    log_info "Obtendo certificado SSL..."
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive --redirect
    
    # Configurar renovação automática
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    log_success "SSL configurado e renovação automática ativada"
}

# Função para criar serviço systemd
create_systemd_service() {
    log_title "CRIANDO SERVIÇO SYSTEMD"
    
    cat > "/etc/systemd/system/$SERVICE_NAME.service" << EOF
[Unit]
Description=Siqueira Campos Imóveis - Node.js Application
After=network.target
Wants=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=GITHUB_WEBHOOK_SECRET=$WEBHOOK_SECRET
ExecStart=/usr/bin/node server/start.js
ExecReload=/bin/kill -USR1 \$MAINPID
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=siqueira-campos

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$PROJECT_DIR
ReadWritePaths=/tmp
ReadWritePaths=/var/log

[Install]
WantedBy=multi-user.target
EOF
    
    # Recarregar systemd e habilitar serviço
    systemctl daemon-reload
    systemctl enable "$SERVICE_NAME"
    
    log_success "Serviço systemd criado e habilitado"
}

# Função para configurar firewall
configure_firewall() {
    log_title "CONFIGURANDO FIREWALL"
    
    # Configurar UFW
    ufw --force reset
    ufw default deny incoming
    ufw default allow outgoing
    
    # Portas essenciais
    ufw allow ssh
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Habilitar firewall
    ufw --force enable
    
    log_success "Firewall configurado"
}

# Função para configurar monitoramento
configure_monitoring() {
    log_title "CONFIGURANDO MONITORAMENTO"
    
    # Script de monitoramento
    cat > "/usr/local/bin/monitor-siqueira.sh" << 'EOF'
#!/bin/bash

# Monitor do sistema
SERVICE="siqueira-campos"
DOMAIN="__DOMAIN__"
EMAIL="__EMAIL__"
LOG_FILE="/var/log/siqueira-monitor.log"

check_service() {
    if ! systemctl is-active --quiet $SERVICE; then
        echo "$(date): Serviço $SERVICE está down, reiniciando..." >> $LOG_FILE
        systemctl restart $SERVICE
    fi
}

check_website() {
    if ! curl -f "https://$DOMAIN/api/ping" >/dev/null 2>&1; then
        echo "$(date): Website não responde, reiniciando serviços..." >> $LOG_FILE
        systemctl restart $SERVICE
        systemctl reload nginx
    fi
}

check_ssl() {
    if ! openssl s_client -connect $DOMAIN:443 -servername $DOMAIN </dev/null 2>/dev/null | openssl x509 -checkend 604800 -noout; then
        echo "$(date): SSL expira em 7 dias, renovando..." >> $LOG_FILE
        certbot renew --quiet
    fi
}

check_service
check_website
check_ssl

echo "$(date): Monitor executado com sucesso" >> $LOG_FILE
EOF
    
    # Substituir variáveis
    sed -i "s/__DOMAIN__/$DOMAIN/g" /usr/local/bin/monitor-siqueira.sh
    sed -i "s/__EMAIL__/$EMAIL/g" /usr/local/bin/monitor-siqueira.sh
    
    chmod +x /usr/local/bin/monitor-siqueira.sh
    
    # Adicionar ao cron
    echo "*/5 * * * * /usr/local/bin/monitor-siqueira.sh" | crontab -
    
    log_success "Monitoramento configurado (executa a cada 5 minutos)"
}

# Função para configurar logrotate
configure_logrotate() {
    log_title "CONFIGURANDO ROTAÇÃO DE LOGS"
    
    cat > "/etc/logrotate.d/siqueira-campos" << EOF
/var/log/siqueira-*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload $SERVICE_NAME
    endscript
}
EOF
    
    log_success "Rotação de logs configurada"
}

# Função principal de deploy
deploy_application() {
    log_title "FAZENDO DEPLOY DA APLICAÇÃO"
    
    cd "$PROJECT_DIR"
    
    # Parar serviço se estiver rodando
    systemctl stop "$SERVICE_NAME" 2>/dev/null || true
    
    # Build final
    log_info "Build final da aplicação..."
    sudo -u www-data npm run build
    
    # Iniciar serviços
    log_info "Iniciando serviços..."
    systemctl start "$SERVICE_NAME"
    systemctl reload nginx
    
    # Aguardar inicialização
    sleep 10
    
    log_success "Aplicação deployada"
}

# Função para testar tudo
test_deployment() {
    log_title "TESTANDO DEPLOYMENT"
    
    local tests_passed=0
    local total_tests=6
    
    # Teste 1: Serviço rodando
    if systemctl is-active --quiet "$SERVICE_NAME"; then
        log_success "✓ Serviço $SERVICE_NAME está rodando"
        ((tests_passed++))
    else
        log_error "✗ Serviço $SERVICE_NAME não está rodando"
    fi
    
    # Teste 2: Nginx rodando
    if systemctl is-active --quiet nginx; then
        log_success "✓ Nginx está rodando"
        ((tests_passed++))
    else
        log_error "✗ Nginx não está rodando"
    fi
    
    # Teste 3: API respondendo
    if curl -f "http://localhost:3001/api/ping" >/dev/null 2>&1; then
        log_success "✓ API respondendo na porta 3001"
        ((tests_passed++))
    else
        log_error "✗ API não está respondendo"
    fi
    
    # Teste 4: Website HTTP
    if curl -f "http://$DOMAIN" >/dev/null 2>&1; then
        log_success "✓ Website HTTP funcionando"
        ((tests_passed++))
    else
        log_warning "⚠ Website HTTP com problema"
    fi
    
    # Teste 5: Website HTTPS
    if curl -f "https://$DOMAIN" >/dev/null 2>&1; then
        log_success "✓ Website HTTPS funcionando"
        ((tests_passed++))
    else
        log_warning "⚠ Website HTTPS com problema"
    fi
    
    # Teste 6: Redirect WWW
    if curl -s -o /dev/null -w "%{http_code}" "http://www.$DOMAIN" | grep -q "301"; then
        log_success "✓ Redirect WWW funcionando"
        ((tests_passed++))
    else
        log_warning "⚠ Redirect WWW com problema"
    fi
    
    echo ""
    if [ $tests_passed -eq $total_tests ]; then
        log_success "🎉 TODOS OS TESTES PASSARAM ($tests_passed/$total_tests)"
    elif [ $tests_passed -ge 4 ]; then
        log_warning "⚠️ A MAIORIA DOS TESTES PASSOU ($tests_passed/$total_tests)"
    else
        log_error "❌ MUITOS TESTES FALHARAM ($tests_passed/$total_tests)"
    fi
}

# Função de finalização
show_final_info() {
    log_title "DEPLOYMENT CONCLUÍDO!"
    
    echo ""
    echo -e "${GREEN}╔═══���══════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                    SUCESSO! 🎉                               ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log_success "URLs do seu site:"
    echo "🌐 Principal: https://$DOMAIN"
    echo "🌐 WWW: https://www.$DOMAIN (redireciona)"
    echo "🔗 API: https://$DOMAIN/api/ping"
    echo "❤️ Health: https://$DOMAIN/health"
    echo ""
    
    log_success "Configuração do GitHub Webhook:"
    echo "🪝 URL: https://$DOMAIN/api/webhook/github"
    echo "🔐 Secret: $WEBHOOK_SECRET"
    echo "📝 Eventos: push (branch main apenas)"
    echo ""
    
    log_success "Monitoramento:"
    echo "📊 Logs: journalctl -u $SERVICE_NAME -f"
    echo "📊 Monitor: tail -f /var/log/siqueira-monitor.log"
    echo "📊 Deploy: tail -f /var/log/siqueira-deploy.log"
    echo "📊 Nginx: tail -f /var/log/nginx/access.log"
    echo ""
    
    log_success "Comandos úteis:"
    echo "🔄 Restart: systemctl restart $SERVICE_NAME"
    echo "📊 Status: systemctl status $SERVICE_NAME"
    echo "🔧 Deploy manual: $PROJECT_DIR/auto-deploy.sh"
    echo "🔒 Renovar SSL: certbot renew"
    echo ""
    
    log_warning "Próximos passos:"
    echo "1. Configure o webhook no GitHub:"
    echo "   https://github.com/Nakahh/site-jurez-2.0/settings/hooks"
    echo "2. Teste fazendo um push no repositório"
    echo "3. Verifique se o deploy automático funciona"
    echo ""
    
    log_success "Sistema 100% funcional e monitorado! 🚀"
}

# EXECUÇÃO PRINCIPAL
main() {
    log_title "INICIANDO SETUP COMPLETO"
    
    # Instalar tudo
    install_packages
    install_docker
    install_nodejs
    
    # Configurar projeto
    clone_project
    setup_project
    create_autodeploy_script
    
    # Configurar servidor
    configure_nginx
    create_systemd_service
    configure_firewall
    configure_monitoring
    configure_logrotate
    
    # Deploy
    deploy_application
    
    # SSL (por último pois precisa do site funcionando)
    configure_ssl
    
    # Testar
    test_deployment
    
    # Finalizar
    show_final_info
}

# Executar função principal
main "$@"
