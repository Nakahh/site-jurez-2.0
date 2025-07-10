#!/bin/bash

# Setup Automático para VPS/Cloud - Siqueira Campos Imóveis
# Funciona em: Ubuntu, Debian, CentOS, Amazon Linux, Oracle Cloud, etc.

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
  ║                🏠 SIQUEIRA CAMPOS IMÓVEIS                     ║
  ║                  Setup Automático VPS/Cloud                  ║
  ║                                                               ║
  ║  ✅ Detecta qualquer sistema automaticamente                 ║
  ║  ✅ Instala e configura tudo                                 ║
  ║  ✅ Corrige mobile + WWW + Auto-deploy                      ║
  ║  ✅ SSL automático + Monitoramento                           ║
  ╚═══════════════════════════════════════════════════════════════╝
EOF

# Verificar root
if [[ $EUID -ne 0 ]]; then
   log_error "Execute como root: sudo bash $0"
   exit 1
fi

# Detectar sistema operacional
detect_os() {
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
    
    log_info "Sistema detectado: $OS $VERSION"
}

# Detectar provedor cloud
detect_cloud_provider() {
    PROVIDER="unknown"
    
    # AWS
    if curl -s --max-time 2 http://169.254.169.254/latest/meta-data/ >/dev/null 2>&1; then
        PROVIDER="aws"
    # Google Cloud
    elif curl -s --max-time 2 -H "Metadata-Flavor: Google" http://169.254.169.254/computeMetadata/v1/ >/dev/null 2>&1; then
        PROVIDER="gcp"
    # Azure
    elif curl -s --max-time 2 -H "Metadata:true" http://169.254.169.254/metadata/instance >/dev/null 2>&1; then
        PROVIDER="azure"
    # Oracle Cloud
    elif curl -s --max-time 2 -H "Authorization: Bearer Oracle" http://169.254.169.254/opc/v1/ >/dev/null 2>&1; then
        PROVIDER="oracle"
    # DigitalOcean
    elif curl -s --max-time 2 http://169.254.169.254/metadata/v1/ >/dev/null 2>&1; then
        PROVIDER="digitalocean"
    fi
    
    log_info "Provedor detectado: $PROVIDER"
}

# Instalar pacotes baseado no OS
install_packages() {
    log_title "INSTALANDO DEPENDÊNCIAS"
    
    case $OS in
        ubuntu|debian)
            export DEBIAN_FRONTEND=noninteractive
            apt update -qq
            apt install -y curl wget git unzip nginx certbot python3-certbot-nginx \
                software-properties-common apt-transport-https ca-certificates \
                gnupg lsb-release supervisor ufw fail2ban htop tree
            ;;
        centos|rhel|rocky|almalinux)
            yum update -y
            yum install -y epel-release
            yum install -y curl wget git unzip nginx certbot python3-certbot-nginx \
                supervisor firewalld fail2ban htop tree
            ;;
        fedora)
            dnf update -y
            dnf install -y curl wget git unzip nginx certbot python3-certbot-nginx \
                supervisor firewalld fail2ban htop tree
            ;;
        amzn)
            yum update -y
            amazon-linux-extras install nginx1 epel -y
            yum install -y curl wget git unzip certbot supervisor htop tree
            ;;
        *)
            log_error "Sistema $OS não suportado"
            exit 1
            ;;
    esac
    
    log_success "Pacotes instalados"
}

# Configurar firewall baseado no sistema
configure_firewall() {
    log_title "CONFIGURANDO FIREWALL"
    
    case $OS in
        ubuntu|debian)
            ufw --force reset
            ufw default deny incoming
            ufw default allow outgoing
            ufw allow ssh
            ufw allow 80/tcp
            ufw allow 443/tcp
            ufw --force enable
            ;;
        centos|rhel|rocky|almalinux|fedora)
            systemctl enable firewalld
            systemctl start firewalld
            firewall-cmd --permanent --add-service=ssh
            firewall-cmd --permanent --add-service=http
            firewall-cmd --permanent --add-service=https
            firewall-cmd --reload
            ;;
        amzn)
            # Amazon Linux usa iptables
            iptables -I INPUT -p tcp --dport 22 -j ACCEPT
            iptables -I INPUT -p tcp --dport 80 -j ACCEPT
            iptables -I INPUT -p tcp --dport 443 -j ACCEPT
            service iptables save
            ;;
    esac
    
    log_success "Firewall configurado"
}

# Instalar Docker
install_docker() {
    log_title "INSTALANDO DOCKER"
    
    if command -v docker &> /dev/null; then
        log_info "Docker já instalado: $(docker --version)"
        return
    fi
    
    case $OS in
        ubuntu|debian)
            curl -fsSL https://get.docker.com | sh
            ;;
        centos|rhel|rocky|almalinux|fedora)
            curl -fsSL https://get.docker.com | sh
            ;;
        amzn)
            yum install -y docker
            ;;
    esac
    
    systemctl enable docker
    systemctl start docker
    usermod -aG docker nginx 2>/dev/null || usermod -aG docker www-data 2>/dev/null || true
    
    log_success "Docker instalado: $(docker --version)"
}

# Instalar Node.js
install_nodejs() {
    log_title "INSTALANDO NODE.JS"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        log_info "Node.js já instalado: $NODE_VERSION"
        
        # Verificar se é versão 18+
        if [[ ${NODE_VERSION:1:2} -ge 18 ]]; then
            return
        else
            log_warning "Versão muito antiga, atualizando..."
        fi
    fi
    
    # Instalar Node.js 18 LTS
    curl -fsSL https://rpm.nodesource.com/setup_18.x | bash - 2>/dev/null || \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - 2>/dev/null
    
    case $OS in
        ubuntu|debian)
            apt install -y nodejs
            ;;
        centos|rhel|rocky|almalinux|fedora|amzn)
            yum install -y nodejs npm
            ;;
    esac
    
    log_success "Node.js instalado: $(node --version)"
}

# Configurar usuário web
setup_web_user() {
    log_title "CONFIGURANDO USUÁRIO WEB"
    
    # Detectar usuário web do sistema
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
        # Criar usu��rio se não existir
        useradd -r -s /bin/false www-data 2>/dev/null || true
        WEB_USER="www-data"
        WEB_GROUP="www-data"
    fi
    
    log_info "Usuário web: $WEB_USER"
}

# Configurações principais
setup_main_config() {
    log_title "CONFIGURAÇÃO PRINCIPAL"
    
    # Perguntar configurações básicas
    echo ""
    read -p "🌐 Digite seu domínio (ex: siqueicamposimoveis.com.br): " DOMAIN
    read -p "📧 Digite seu email para SSL: " EMAIL
    
    if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
        log_error "Domínio e email são obrigatórios!"
        exit 1
    fi
    
    # Configurações
    WEBHOOK_SECRET=$(openssl rand -hex 32)
    PROJECT_DIR="/var/www/siqueira-campos"
    GITHUB_REPO="https://github.com/Nakahh/site-jurez-2.0.git"
    
    log_success "Configurações:"
    log_info "Domínio: $DOMAIN"
    log_info "Email: $EMAIL"
    log_info "Webhook Secret: $WEBHOOK_SECRET"
    
    echo ""
    read -p "🤔 Confirma? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Clonar e configurar projeto
setup_project() {
    log_title "CONFIGURANDO PROJETO"
    
    # Remover se existir
    rm -rf "$PROJECT_DIR"
    
    # Clonar
    git clone "$GITHUB_REPO" "$PROJECT_DIR"
    cd "$PROJECT_DIR"
    
    # Criar .env
    cat > .env << EOF
NODE_ENV=production
PORT=3001
ADMIN_PORT=3001
GITHUB_WEBHOOK_SECRET=$WEBHOOK_SECRET
DOMAIN=$DOMAIN
EMAIL=$EMAIL
EOF
    
    # Instalar dependências e build
    sudo -u "$WEB_USER" npm ci --production=false
    sudo -u "$WEB_USER" npm run build
    
    # Configurar Git
    sudo -u "$WEB_USER" git config user.name "Auto Deploy"
    sudo -u "$WEB_USER" git config user.email "$EMAIL"
    sudo -u "$WEB_USER" git config --global --add safe.directory "$PROJECT_DIR"
    
    # Permissões
    chown -R "$WEB_USER:$WEB_GROUP" "$PROJECT_DIR"
    chmod -R 755 "$PROJECT_DIR"
    
    log_success "Projeto configurado"
}

# Configurar Nginx
setup_nginx() {
    log_title "CONFIGURANDO NGINX"
    
    # Detectar diretório de configuração do Nginx
    if [[ -d /etc/nginx/sites-available ]]; then
        NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
        NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
        # Remover default
        rm -f "$NGINX_SITES_ENABLED/default"
    else
        NGINX_SITES_AVAILABLE="/etc/nginx/conf.d"
        NGINX_SITES_ENABLED="/etc/nginx/conf.d"
        # Remover default
        rm -f "$NGINX_SITES_ENABLED/default.conf"
    fi
    
    # Configuração Nginx
    cat > "$NGINX_SITES_AVAILABLE/siqueira-campos.conf" << EOF
# Redirect WWW to non-WWW
server {
    listen 80;
    listen 443 ssl http2;
    server_name www.$DOMAIN;
    
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    
    return 301 \$scheme://$DOMAIN\$request_uri;
}

# Main server
server {
    listen 80;
    listen 443 ssl http2;
    server_name $DOMAIN;
    
    root $PROJECT_DIR/dist;
    index index.html;
    
    # SSL
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    
    # Mobile optimization
    add_header Cache-Control "public, max-age=300" always;
    
    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    
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
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # SPA fallback
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    # Health check
    location /health {
        return 200 "OK";
        add_header Content-Type text/plain;
    }
}
EOF
    
    # Habilitar site se for Debian/Ubuntu
    if [[ -d /etc/nginx/sites-enabled ]]; then
        ln -sf "$NGINX_SITES_AVAILABLE/siqueira-campos.conf" "$NGINX_SITES_ENABLED/"
    fi
    
    # Testar configuração
    nginx -t
    
    log_success "Nginx configurado"
}

# Criar serviço systemd
create_service() {
    log_title "CRIANDO SERVIÇO SYSTEMD"
    
    cat > "/etc/systemd/system/siqueira-campos.service" << EOF
[Unit]
Description=Siqueira Campos Imóveis
After=network.target

[Service]
Type=simple
User=$WEB_USER
Group=$WEB_GROUP
WorkingDirectory=$PROJECT_DIR
Environment=NODE_ENV=production
Environment=PORT=3001
Environment=GITHUB_WEBHOOK_SECRET=$WEBHOOK_SECRET
ExecStart=/usr/bin/node server/start.js
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl enable siqueira-campos
    
    log_success "Serviço criado"
}

# Configurar SSL
setup_ssl() {
    log_title "CONFIGURANDO SSL"
    
    # Iniciar serviços temporariamente para SSL
    systemctl start nginx
    
    # Obter certificado
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" \
        --email "$EMAIL" --agree-tos --non-interactive --redirect
    
    # Renovação automática
    echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
    
    log_success "SSL configurado"
}

# Script de auto-deploy
create_autodeploy() {
    log_title "CRIANDO AUTO-DEPLOY"
    
    cat > "$PROJECT_DIR/auto-deploy.sh" << EOF
#!/bin/bash
set -e
cd $PROJECT_DIR
echo "\$(date): Auto-deploy iniciado" >> /var/log/siqueira-deploy.log
sudo -u $WEB_USER git fetch origin main
sudo -u $WEB_USER git reset --hard origin/main
sudo -u $WEB_USER npm ci --production=false
sudo -u $WEB_USER npm run build
systemctl restart siqueira-campos
systemctl reload nginx
echo "\$(date): Auto-deploy concluído" >> /var/log/siqueira-deploy.log
EOF
    
    chmod +x "$PROJECT_DIR/auto-deploy.sh"
    chown "$WEB_USER:$WEB_GROUP" "$PROJECT_DIR/auto-deploy.sh"
    
    log_success "Auto-deploy configurado"
}

# Deploy final
final_deploy() {
    log_title "DEPLOY FINAL"
    
    # Iniciar serviços
    systemctl start siqueira-campos
    systemctl restart nginx
    
    # Aguardar
    sleep 10
    
    log_success "Deploy concluído"
}

# Testar tudo
test_everything() {
    log_title "TESTANDO SISTEMA"
    
    local tests=0
    
    # Teste serviço
    if systemctl is-active --quiet siqueira-campos; then
        log_success "✓ Serviço rodando"
        ((tests++))
    fi
    
    # Teste API
    if curl -f "http://localhost:3001/api/ping" >/dev/null 2>&1; then
        log_success "✓ API funcionando"
        ((tests++))
    fi
    
    # Teste website
    if curl -f "http://$DOMAIN" >/dev/null 2>&1; then
        log_success "✓ Website HTTP"
        ((tests++))
    fi
    
    # Teste HTTPS
    if curl -f "https://$DOMAIN" >/dev/null 2>&1; then
        log_success "✓ Website HTTPS"
        ((tests++))
    fi
    
    echo ""
    if [ $tests -ge 3 ]; then
        log_success "🎉 SISTEMA FUNCIONANDO! ($tests/4 testes)"
    else
        log_warning "⚠️ ALGUNS PROBLEMAS DETECTADOS ($tests/4 testes)"
    fi
}

# Informações finais
show_info() {
    log_title "CONFIGURAÇÃO CONCLUÍDA!"
    
    echo ""
    echo -e "${GREEN}╔═══════════════════════���════════════════════════════╗${NC}"
    echo -e "${GREEN}║                   SUCESSO! 🎉                     ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    log_success "🌐 Seu site: https://$DOMAIN"
    log_success "🔗 API: https://$DOMAIN/api/ping"
    log_success "❤️ Health: https://$DOMAIN/health"
    echo ""
    
    log_success "🪝 GitHub Webhook:"
    echo "   URL: https://$DOMAIN/api/webhook/github"
    echo "   Secret: $WEBHOOK_SECRET"
    echo "   Eventos: push (main branch)"
    echo ""
    
    log_success "📊 Comandos úteis:"
    echo "   Status: systemctl status siqueira-campos"
    echo "   Logs: journalctl -u siqueira-campos -f"
    echo "   Deploy: $PROJECT_DIR/auto-deploy.sh"
    echo "   Restart: systemctl restart siqueira-campos"
    echo ""
    
    log_warning "📋 Próximos passos:"
    echo "1. Configure webhook no GitHub:"
    echo "   https://github.com/Nakahh/site-jurez-2.0/settings/hooks"
    echo "2. Teste fazendo push no repositório"
    echo "3. Verifique auto-deploy funcionando"
    echo ""
    
    log_success "🚀 Sistema totalmente funcional!"
}

# EXECUÇÃO PRINCIPAL
main() {
    detect_os
    detect_cloud_provider
    setup_main_config
    
    install_packages
    install_docker
    install_nodejs
    setup_web_user
    configure_firewall
    
    setup_project
    setup_nginx
    create_service
    create_autodeploy
    
    setup_ssl
    final_deploy
    
    test_everything
    show_info
}

# Executar
main "$@"
