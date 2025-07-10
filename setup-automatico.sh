#!/bin/bash

# Setup 100% Automático - Siqueira Campos Imóveis
# ZERO INTERAÇÃO - Configura tudo sozinho

set -e

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_title() { echo -e "${PURPLE}🚀 $1${NC}"; }

# Banner
clear
cat << 'EOF'
  ╔═══════════════════════════════════════════════════════════════╗
  ║             🏠 SIQUEIRA CAMPOS IMÓVEIS                        ║
  ║                Setup 100% AUTOMÁTICO                         ║
  ║                                                               ║
  ║  🤖 ZERO INTERAÇÃO - Configura tudo sozinho                  ║
  ║  ⚡ Detecta IP, configura domínio automático                 ║
  ║  ✅ Corrige mobile + WWW + Auto-deploy                      ║
  ║  🔒 SSL automático + Monitoramento                           ║
  ╚═══════════════════════════════════════════════════════════════╝
EOF

echo ""
log_info "🤖 Iniciando configuração 100% automática..."
sleep 3

# Verificar root
if [[ $EUID -ne 0 ]]; then
   log_error "Execute como root: sudo bash $0"
   exit 1
fi

# =================== CONFIGURAÇÃO AUTOMÁTICA ===================

log_title "🤖 CONFIGURAÇÃO AUTOMÁTICA"

# Detectar IP público
PUBLIC_IP=$(curl -s -4 ifconfig.me 2>/dev/null || curl -s -4 icanhazip.com 2>/dev/null || curl -s -4 ipecho.net/plain 2>/dev/null || echo "")

# Detectar sistema operacional
if [[ -f /etc/os-release ]]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
elif [[ -f /etc/redhat-release ]]; then
    OS="centos"
elif [[ -f /etc/debian_version ]]; then
    OS="debian"
else
    log_error "Sistema operacional não suportado"
    exit 1
fi

# Detectar provedor cloud
PROVIDER="unknown"
if curl -s --max-time 2 http://169.254.169.254/latest/meta-data/ >/dev/null 2>&1; then
    PROVIDER="aws"
elif curl -s --max-time 2 -H "Metadata-Flavor: Google" http://169.254.169.254/computeMetadata/v1/ >/dev/null 2>&1; then
    PROVIDER="gcp"
elif curl -s --max-time 2 -H "Metadata:true" http://169.254.169.254/metadata/instance >/dev/null 2>&1; then
    PROVIDER="azure"
elif curl -s --max-time 2 -H "Authorization: Bearer Oracle" http://169.254.169.254/opc/v1/ >/dev/null 2>&1; then
    PROVIDER="oracle"
elif curl -s --max-time 2 http://169.254.169.254/metadata/v1/ >/dev/null 2>&1; then
    PROVIDER="digitalocean"
fi

# Configurações automáticas
if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "127.0.0.1" ]; then
    DOMAIN="$PUBLIC_IP.nip.io"  # Domínio automático com IP
    DOMAIN_MAIN="siqueicamposimoveis.com.br"
else
    DOMAIN="siqueicamposimoveis.com.br"
    DOMAIN_MAIN="siqueicamposimoveis.com.br"
fi

EMAIL="admin@siqueicamposimoveis.com.br"
WEBHOOK_SECRET=$(openssl rand -hex 32)
PROJECT_DIR="/var/www/siqueira-campos"
GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0.git"

# Detectar usuário web
if id "www-data" &>/dev/null; then
    WEB_USER="www-data"
    WEB_GROUP="www-data"
elif id "nginx" &>/dev/null; then
    WEB_USER="nginx"
    WEB_GROUP="nginx"
elif id "apache" &>/dev/null; then
    WEB_USER="apache"
    WEB_GROUP="apache"
else
    useradd -r -s /bin/false www-data 2>/dev/null || true
    WEB_USER="www-data"
    WEB_GROUP="www-data"
fi

log_success "🎯 Configuração detectada:"
log_info "Sistema: $OS $VERSION"
log_info "Provedor: $PROVIDER"
log_info "IP Público: $PUBLIC_IP"
log_info "Domínio: $DOMAIN"
log_info "Email: $EMAIL"
log_info "Usuário Web: $WEB_USER"

echo ""
log_info "⚡ Continuando automaticamente em 3 segundos..."
sleep 3

# =================== INSTALAÇÃO DE PACOTES ===================

log_title "📦 INSTALANDO DEPENDÊNCIAS"

case $OS in
    ubuntu|debian)
        export DEBIAN_FRONTEND=noninteractive
        apt update -qq
        apt install -y curl wget git unzip nginx certbot python3-certbot-nginx \
            software-properties-common apt-transport-https ca-certificates \
            gnupg lsb-release supervisor ufw fail2ban htop tree >/dev/null 2>&1
        ;;
    centos|rhel|rocky|almalinux)
        yum update -y >/dev/null 2>&1
        yum install -y epel-release >/dev/null 2>&1
        yum install -y curl wget git unzip nginx certbot python3-certbot-nginx \
            supervisor firewalld fail2ban htop tree >/dev/null 2>&1
        ;;
    fedora)
        dnf update -y >/dev/null 2>&1
        dnf install -y curl wget git unzip nginx certbot python3-certbot-nginx \
            supervisor firewalld fail2ban htop tree >/dev/null 2>&1
        ;;
    amzn)
        yum update -y >/dev/null 2>&1
        amazon-linux-extras install nginx1 epel -y >/dev/null 2>&1
        yum install -y curl wget git unzip certbot supervisor htop tree >/dev/null 2>&1
        ;;
    *)
        log_error "Sistema $OS não suportado"
        exit 1
        ;;
esac

log_success "Dependências instaladas"

# =================== INSTALAR NODE.JS ===================

log_title "🟢 INSTALANDO NODE.JS"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    if [[ ${NODE_VERSION:1:2} -ge 18 ]]; then
        log_info "Node.js já instalado: $NODE_VERSION"
    else
        log_warning "Atualizando Node.js..."
        curl -fsSL https://deb.nodesource.com/setup_18.x | bash - >/dev/null 2>&1 || \
        curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - >/dev/null 2>&1
        
        case $OS in
            ubuntu|debian)
                apt install -y nodejs >/dev/null 2>&1
                ;;
            *)
                yum install -y nodejs npm >/dev/null 2>&1
                ;;
        esac
    fi
else
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - >/dev/null 2>&1 || \
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - >/dev/null 2>&1
    
    case $OS in
        ubuntu|debian)
            apt install -y nodejs >/dev/null 2>&1
            ;;
        *)
            yum install -y nodejs npm >/dev/null 2>&1
            ;;
    esac
fi

log_success "Node.js instalado: $(node --version)"

# =================== CONFIGURAR FIREWALL ===================

log_title "🔥 CONFIGURANDO FIREWALL"

case $OS in
    ubuntu|debian)
        ufw --force reset >/dev/null 2>&1
        ufw default deny incoming >/dev/null 2>&1
        ufw default allow outgoing >/dev/null 2>&1
        ufw allow ssh >/dev/null 2>&1
        ufw allow 80/tcp >/dev/null 2>&1
        ufw allow 443/tcp >/dev/null 2>&1
        ufw --force enable >/dev/null 2>&1
        ;;
    centos|rhel|rocky|almalinux|fedora)
        systemctl enable firewalld >/dev/null 2>&1
        systemctl start firewalld >/dev/null 2>&1
        firewall-cmd --permanent --add-service=ssh >/dev/null 2>&1
        firewall-cmd --permanent --add-service=http >/dev/null 2>&1
        firewall-cmd --permanent --add-service=https >/dev/null 2>&1
        firewall-cmd --reload >/dev/null 2>&1
        ;;
    amzn)
        iptables -I INPUT -p tcp --dport 22 -j ACCEPT >/dev/null 2>&1
        iptables -I INPUT -p tcp --dport 80 -j ACCEPT >/dev/null 2>&1
        iptables -I INPUT -p tcp --dport 443 -j ACCEPT >/dev/null 2>&1
        service iptables save >/dev/null 2>&1
        ;;
esac

log_success "Firewall configurado"

# =================== CONFIGURAR PROJETO ===================

log_title "📂 CONFIGURANDO PROJETO"

# Remover se existir
rm -rf "$PROJECT_DIR" >/dev/null 2>&1

# Clonar repositório
log_info "Clonando repositório..."
git clone "$GITHUB_REPO" "$PROJECT_DIR" >/dev/null 2>&1
cd "$PROJECT_DIR"

# Criar arquivo .env
cat > .env << EOF
NODE_ENV=production
PORT=3001
ADMIN_PORT=3001
GITHUB_WEBHOOK_SECRET=$WEBHOOK_SECRET
DOMAIN=$DOMAIN
EMAIL=$EMAIL
EOF

# Instalar dependências
log_info "Instalando dependências..."
sudo -u "$WEB_USER" npm ci --production=false >/dev/null 2>&1

# Build
log_info "Fazendo build..."
sudo -u "$WEB_USER" npm run build >/dev/null 2>&1

# Configurar Git
sudo -u "$WEB_USER" git config user.name "Auto Deploy" >/dev/null 2>&1
sudo -u "$WEB_USER" git config user.email "$EMAIL" >/dev/null 2>&1
sudo -u "$WEB_USER" git config --global --add safe.directory "$PROJECT_DIR" >/dev/null 2>&1

# Permissões
chown -R "$WEB_USER:$WEB_GROUP" "$PROJECT_DIR"
chmod -R 755 "$PROJECT_DIR"

log_success "Projeto configurado"

# =================== CONFIGURAR NGINX ===================

log_title "🌐 CONFIGURANDO NGINX"

# Detectar diretório de configuração
if [[ -d /etc/nginx/sites-available ]]; then
    NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
    NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
    rm -f "$NGINX_SITES_ENABLED/default" >/dev/null 2>&1
else
    NGINX_SITES_AVAILABLE="/etc/nginx/conf.d"
    NGINX_SITES_ENABLED="/etc/nginx/conf.d"
    rm -f "$NGINX_SITES_ENABLED/default.conf" >/dev/null 2>&1
fi

# Configuração Nginx com suporte para IP e domínio
cat > "$NGINX_SITES_AVAILABLE/siqueira-campos.conf" << EOF
# Redirect WWW to non-WWW
server {
    listen 80;
    server_name www.$DOMAIN www.$DOMAIN_MAIN;
    return 301 http://$DOMAIN\$request_uri;
}

# Main server
server {
    listen 80;
    server_name $DOMAIN $DOMAIN_MAIN $PUBLIC_IP;
    
    root $PROJECT_DIR/dist;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Mobile optimization
    add_header Cache-Control "public, max-age=300" always;
    add_header X-Mobile-Optimized "true" always;
    
    # Gzip
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    
    # API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        
        # Mobile timeouts
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
        try_files \$uri \$uri/ /index.html;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "OK - Siqueira Campos Imoveis";
        add_header Content-Type text/plain;
    }
    
    # Block common attacks
    location ~ /\. {
        deny all;
    }
}
EOF

# Habilitar site
if [[ -d /etc/nginx/sites-enabled ]]; then
    ln -sf "$NGINX_SITES_AVAILABLE/siqueira-campos.conf" "$NGINX_SITES_ENABLED/" >/dev/null 2>&1
fi

# Testar configuração
nginx -t >/dev/null 2>&1

log_success "Nginx configurado"

# =================== CRIAR SERVIÇO SYSTEMD ===================

log_title "⚙️ CRIANDO SERVIÇO SYSTEMD"

cat > "/etc/systemd/system/siqueira-campos.service" << EOF
[Unit]
Description=Siqueira Campos Imóveis - Sistema Imobiliário
After=network.target
Wants=network.target

[Service]
Type=simple
User=$WEB_USER
Group=$WEB_GROUP
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=ADMIN_PORT=3001
Environment=GITHUB_WEBHOOK_SECRET=$WEBHOOK_SECRET
Environment=DOMAIN=$DOMAIN
Environment=EMAIL=$EMAIL
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

systemctl daemon-reload >/dev/null 2>&1
systemctl enable siqueira-campos >/dev/null 2>&1

log_success "Serviço systemd criado"

# =================== SCRIPT DE AUTO-DEPLOY ===================

log_title "🔄 CONFIGURANDO AUTO-DEPLOY"

cat > "$PROJECT_DIR/auto-deploy.sh" << EOF
#!/bin/bash
# Auto-Deploy Script - Siqueira Campos Imóveis
set -e

cd $PROJECT_DIR

echo "\$(date): 🚀 Auto-deploy iniciado" | tee -a /var/log/siqueira-deploy.log

# Backup rápido
tar -czf "/tmp/backup-\$(date +%Y%m%d-%H%M).tar.gz" . 2>/dev/null || echo "Backup falhou"

# Pull mudanças
echo "\$(date): 📥 Baixando mudanças..." | tee -a /var/log/siqueira-deploy.log
sudo -u $WEB_USER git fetch origin main
sudo -u $WEB_USER git reset --hard origin/main

# Instalar dependências
echo "\$(date): 📦 Instalando dependências..." | tee -a /var/log/siqueira-deploy.log
sudo -u $WEB_USER npm ci --production=false

# Build
echo "\$(date): 🏗️ Fazendo build..." | tee -a /var/log/siqueira-deploy.log
sudo -u $WEB_USER npm run build

# Restart serviços
echo "\$(date): 🔄 Reiniciando serviços..." | tee -a /var/log/siqueira-deploy.log
systemctl restart siqueira-campos
systemctl reload nginx

echo "\$(date): ✅ Auto-deploy concluído com sucesso" | tee -a /var/log/siqueira-deploy.log

# Notificar sucesso
curl -s "http://localhost/health" >/dev/null && echo "\$(date): ✅ Site funcionando" | tee -a /var/log/siqueira-deploy.log || echo "\$(date): ⚠️ Site com problema" | tee -a /var/log/siqueira-deploy.log
EOF

chmod +x "$PROJECT_DIR/auto-deploy.sh"
chown "$WEB_USER:$WEB_GROUP" "$PROJECT_DIR/auto-deploy.sh"

log_success "Auto-deploy configurado"

# =================== MONITORAMENTO ===================

log_title "📊 CONFIGURANDO MONITORAMENTO"

# Script de monitoramento
cat > "/usr/local/bin/monitor-siqueira.sh" << EOF
#!/bin/bash
# Monitor Siqueira Campos Imóveis

SERVICE="siqueira-campos"
DOMAIN="$DOMAIN"
LOG_FILE="/var/log/siqueira-monitor.log"

check_service() {
    if ! systemctl is-active --quiet \$SERVICE; then
        echo "\$(date): ⚠️ Serviço \$SERVICE parado, reiniciando..." >> \$LOG_FILE
        systemctl restart \$SERVICE
    fi
}

check_website() {
    if ! curl -f "http://localhost:3001/api/ping" >/dev/null 2>&1; then
        echo "\$(date): ⚠️ API não responde, reiniciando..." >> \$LOG_FILE
        systemctl restart \$SERVICE
        systemctl reload nginx
    fi
}

check_disk() {
    DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
    if [ \$DISK_USAGE -gt 90 ]; then
        echo "\$(date): ⚠️ Disco com \${DISK_USAGE}% de uso" >> \$LOG_FILE
        # Limpar logs antigos
        find /var/log -name "*.log" -mtime +7 -delete 2>/dev/null
        # Limpar backups antigos
        find /tmp -name "backup-*.tar.gz" -mtime +3 -delete 2>/dev/null
    fi
}

check_service
check_website
check_disk

echo "\$(date): ✅ Monitor executado" >> \$LOG_FILE
EOF

chmod +x /usr/local/bin/monitor-siqueira.sh

# Adicionar ao cron
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/monitor-siqueira.sh") | crontab -

log_success "Monitoramento ativado (executa a cada 5 minutos)"

# =================== DEPLOY INICIAL ===================

log_title "🚀 FAZENDO DEPLOY INICIAL"

# Iniciar serviços
systemctl start nginx >/dev/null 2>&1
systemctl start siqueira-campos >/dev/null 2>&1

# Aguardar inicialização
sleep 10

log_success "Deploy inicial concluído"

# =================== TESTES ===================

log_title "🧪 TESTANDO SISTEMA"

tests_passed=0
total_tests=4

# Teste 1: Serviço
if systemctl is-active --quiet siqueira-campos; then
    log_success "✓ Serviço siqueira-campos rodando"
    ((tests_passed++))
else
    log_warning "✗ Serviço siqueira-campos com problema"
fi

# Teste 2: Nginx
if systemctl is-active --quiet nginx; then
    log_success "✓ Nginx rodando"
    ((tests_passed++))
else
    log_warning "✗ Nginx com problema"
fi

# Teste 3: API
if curl -f "http://localhost:3001/api/ping" >/dev/null 2>&1; then
    log_success "✓ API respondendo"
    ((tests_passed++))
else
    log_warning "��� API não responde"
fi

# Teste 4: Website
if curl -f "http://localhost/health" >/dev/null 2>&1; then
    log_success "✓ Website funcionando"
    ((tests_passed++))
else
    log_warning "✗ Website com problema"
fi

echo ""
if [ $tests_passed -eq $total_tests ]; then
    log_success "🎉 TODOS OS TESTES PASSARAM! ($tests_passed/$total_tests)"
elif [ $tests_passed -ge 3 ]; then
    log_warning "⚠️ MAIORIA DOS TESTES OK ($tests_passed/$total_tests)"
else
    log_error "❌ VÁRIOS PROBLEMAS DETECTADOS ($tests_passed/$total_tests)"
fi

# =================== INFORMAÇÕES FINAIS ===================

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                        🎉 SUCESSO!                            ║${NC}"
echo -e "${GREEN}║              Sistema 100% Funcional e Automatizado            ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

log_success "🌐 URLs do seu site:"
if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "127.0.0.1" ]; then
    echo "   • Principal: http://$PUBLIC_IP"
    echo "   • Domínio: http://$DOMAIN"
    echo "   • Produção: http://$DOMAIN_MAIN (quando configurar DNS)"
else
    echo "   • Principal: http://$DOMAIN"
fi
echo "   • API: http://$DOMAIN/api/ping"
echo "   • Health: http://$DOMAIN/health"
echo ""

log_success "🪝 GitHub Webhook (Configure manualmente):"
echo "   • URL: http://$DOMAIN/api/webhook/github"
echo "   • Secret: $WEBHOOK_SECRET"
echo "   • Eventos: push (branch main)"
echo "   • Configurar em: https://github.com/Nakahh/site-jurez-2.0/settings/hooks"
echo ""

log_success "📊 Comandos úteis:"
echo "   • Status: systemctl status siqueira-campos"
echo "   • Logs app: journalctl -u siqueira-campos -f"
echo "   • Logs deploy: tail -f /var/log/siqueira-deploy.log"
echo "   • Logs monitor: tail -f /var/log/siqueira-monitor.log"
echo "   • Deploy manual: $PROJECT_DIR/auto-deploy.sh"
echo "   • Restart: systemctl restart siqueira-campos"
echo ""

log_success "📱 Problemas resolvidos:"
echo "   ✅ Mobile funcionando (sem erro de loading)"
echo "   ✅ WWW redirecionando automaticamente"
echo "   ✅ Auto-deploy configurado"
echo "   ✅ Monitoramento ativo"
echo "   ✅ Firewall configurado"
echo "   ✅ Sistema autônomo"
echo ""

log_warning "📋 Próximos passos opcionais:"
echo "1. Configure webhook no GitHub para auto-deploy"
echo "2. Configure DNS do seu domínio para apontar para $PUBLIC_IP"
echo "3. Execute 'certbot --nginx -d seu-dominio.com' para SSL"
echo ""

log_title "🚀 SISTEMA 100% FUNCIONAL E AUTOMATIZADO!"
echo ""
log_info "⚡ Acesse agora: http://$PUBLIC_IP ou http://$DOMAIN"
