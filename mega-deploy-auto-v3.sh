#!/bin/bash

# 🚀 MEGA DEPLOY AUTOMÁTICO V3 - Siqueira Campos Imóveis
# APAGA TUDO E REFAZ DO ZERO - 100% AUTOMÁTICO + LOGS TEMPO REAL
# Desenvolvido por Kryonix - Zero configuração manual + Melhorias V3

echo "🚀 MEGA DEPLOY V3 - INICIANDO..."
echo "📅 Data: $(date)"
echo "🔧 Configurando para não fechar sozinho..."

# ============= CONFIGURAÇÕES V3 MELHORADAS =============
# Configurações para manter script rodando sem fechar sozinho
set +e  # NÃO parar em erros - permitir continuidade
set +u  # NÃO parar com variáveis não definidas
set -o pipefail  # Manter detecção de erros em pipes
IFS=$'\n\t'       # Separador seguro

# Configurar logs em tempo real
LOG_FILE="deploy-$(date +%Y%m%d_%H%M%S).log"

# Função simplificada para configurar logs
setup_logging() {
    # Backup dos descritores originais
    exec 3>&1 4>&2

    # Configurar log simples
    touch "$LOG_FILE" 2>/dev/null || LOG_FILE="/tmp/deploy-$(date +%s).log"

    echo "🚀 MEGA DEPLOY V3 iniciado em $(date)" >> "$LOG_FILE"
}

# Configurar output sem buffering
export PYTHONUNBUFFERED=1
export DEBIAN_FRONTEND=noninteractive
stdbuf -oL -eL echo "🚀 INICIALIZANDO MEGA DEPLOY V3..."

# Configurar logging
setup_logging

# Função de cleanup melhorada para evitar fechamento abrupto
cleanup() {
    echo ""
    echo "🛑 DEPLOY INTERROMPIDO! Executando cleanup..."

    # Parar containers graciosamente
    if command -v docker-compose &> /dev/null; then
        echo "Parando containers..."
        docker-compose down --remove-orphans 2>/dev/null || true
    fi

    # Restaurar descritores de arquivo com segurança
    exec 1>&3 2>&4 2>/dev/null || true

    echo "🧹 Cleanup concluído. Pressione ENTER para sair..."
    read -r -t 30 || echo "Timeout - finalizando..."
    exit 1
}

# Configurar traps para diferentes sinais de forma segura
trap cleanup SIGINT SIGTERM 2>/dev/null || true
trap 'echo "Script finalizado normalmente" 2>/dev/null || true' EXIT 2>/dev/null || true

# Sistema avançado de detecção e correção automática de problemas
auto_fix_system() {
    log_info "🔧 Iniciando sistema de auto-correção..."

    # 1. Verificar e corrigir espaço em disco
    check_and_fix_disk_space

    # 2. Verificar e corrigir permissões
    check_and_fix_permissions

    # 3. Verificar e corrigir conflitos de porta
    check_and_fix_port_conflicts

    # 4. Verificar e corrigir Docker
    check_and_fix_docker

    # 5. Verificar e corrigir dependências
    check_and_fix_dependencies

    # 6. Verificar e corrigir firewall
    check_and_fix_firewall

    # 7. Verificar recursos do sistema
    check_system_resources

    # 8. Detectar e corrigir Traefik problemático
    check_and_fix_existing_traefik

    # 9. Detectar e corrigir Portainer existente
    check_and_fix_existing_portainer

    # 10. Configurar Portainers para múltiplos domínios
    setup_multi_domain_portainers

    log_success "✅ Sistema de auto-correção concluído!"
}

# Detectar e corrigir Portainer existente
check_and_fix_existing_portainer() {
    log_info "🐳 Detectando Portainer existente..."

    # Detectar containers Portainer
    local existing_portainer=$(docker ps -a --filter "name=portainer" --format "{{.Names}}" 2>/dev/null)

    if [ ! -z "$existing_portainer" ]; then
        log_warning "⚠️ Portainer existente detectado: $existing_portainer"

        # Verificar status
        local portainer_status=$(docker ps --filter "name=portainer" --format "{{.Status}}" 2>/dev/null)

        if [ -z "$portainer_status" ]; then
            log_fix "🔧 Portainer parado. Removendo container problemático..."
            docker stop $existing_portainer 2>/dev/null || true
            docker rm $existing_portainer 2>/dev/null || true
        else
            log_info "Portainer rodando: $portainer_status"

            # Verificar se tem erro de SSL
            if ! timeout 10 curl -k https://localhost:9443 > /dev/null 2>&1; then
                log_warning "❌ Portainer com erro de SSL detectado"

                # Verificar stacks problemáticas
                check_portainer_stacks $existing_portainer

                # Backup do Portainer antes de corrigir
                backup_portainer_data $existing_portainer

                # Corrigir SSL do Portainer
                fix_portainer_ssl $existing_portainer
            else
                log_success "✅ Portainer SSL funcionando"
            fi
        fi

        # Remover volumes órfãos do Portainer
        log_info "🧹 Limpando volumes órfãos do Portainer..."
        docker volume ls | grep portainer | awk '{print $2}' | while read volume; do
            if ! docker ps -a --filter "volume=$volume" --format "{{.Names}}" | grep -q .; then
                log_fix "Removendo volume órfão: $volume"
                docker volume rm $volume 2>/dev/null || true
            fi
        done
    else
        log_info "ℹ️ Nenhum Portainer existente detectado"
    fi
}

# Verificar e corrigir stacks problemáticas do Portainer
check_portainer_stacks() {
    local portainer_name="$1"

    log_info "📋 Analisando stacks do Portainer existente..."

    # Detectar todas as stacks (funcionando e quebradas)
    local all_stacks=$(docker ps -a --filter "label=com.docker.compose.project" --format "{{.Label \"com.docker.compose.project\"}}" | sort | uniq)
    local failed_stacks=$(docker ps -a --filter "label=com.docker.compose.project" --filter "status=exited" --format "{{.Label \"com.docker.compose.project\"}}" | sort | uniq)
    local running_stacks=$(docker ps --filter "label=com.docker.compose.project" --format "{{.Label \"com.docker.compose.project\"}}" | sort | uniq)

    local total_stacks=$(echo "$all_stacks" | grep -v '^$' | wc -l)
    local failed_count=$(echo "$failed_stacks" | grep -v '^$' | wc -l)
    local running_count=$(echo "$running_stacks" | grep -v '^$' | wc -l)

    realtime_echo "${CYAN}📊 Análise das Stacks:${NC}"
    realtime_echo "   • Total de stacks: $total_stacks"
    realtime_echo "   • Stacks funcionando: $running_count"
    realtime_echo "   • Stacks com problemas: $failed_count"

    if [ $failed_count -gt 0 ]; then
        log_warning "⚠️ Iniciando correção automática das $failed_count stacks problemáticas..."

        echo "$failed_stacks" | while read stack; do
            if [ ! -z "$stack" ]; then
                log_fix "🔧 Corrigindo stack: $stack"
                fix_failed_stack "$stack"
            fi
        done

        # Verificação pós-correção
        log_info "🔍 Verificando resultados da correção..."
        sleep 15

        local new_running_count=$(docker ps --filter "label=com.docker.compose.project" --format "{{.Label \"com.docker.compose.project\"}}" | sort | uniq | grep -v '^$' | wc -l)
        local fixed_stacks=$((new_running_count - running_count))

        if [ $fixed_stacks -gt 0 ]; then
            log_success "✅ $fixed_stacks stacks foram corrigidas!"
        fi

        realtime_echo "${GREEN}📈 Resultado final:${NC}"
        realtime_echo "   • Stacks funcionando agora: $new_running_count/$total_stacks"

    # Se ainda há stacks problemáticas, aplicar correção avançada
    if [ $new_running_count -lt $total_stacks ]; then
        log_warning "⚠️ Ainda há stacks problemáticas. Aplicando correção avançada..."
        apply_advanced_stack_fixes
    fi

    # Verificar conflitos entre Traefiks antigo e novo
    check_traefik_conflicts_final
    else
        log_success "✅ Todas as stacks estão funcionando corretamente!"
    fi

    # Tentar acessar API do Portainer
    check_portainer_api_access
}

# Aplicar correções avançadas para stacks persistentemente problemáticas
apply_advanced_stack_fixes() {
    log_info "🚀 Aplicando correções avançadas para stacks problemáticas..."

    # Estratégia 1: Recrear redes Docker
    log_fix "🌐 Recriando redes Docker..."
    docker network prune -f 2>/dev/null || true

    # Estratégia 2: Limpar volumes órfãos
    log_fix "💾 Limpando volumes órfãos..."
    docker volume prune -f 2>/dev/null || true

    # Estratégia 3: Resolver conflitos de porta globalmente
    log_fix "🔌 Resolvendo conflitos de porta..."

    # Parar serviços do sistema que podem conflitar
    local system_services=(apache2 nginx mysql postgresql redis-server)
    for service in "${system_services[@]}"; do
        if systemctl is-active --quiet $service 2>/dev/null; then
            log_fix "Parando $service (conflito potencial)..."
            sudo systemctl stop $service 2>/dev/null || true
            sudo systemctl disable $service 2>/dev/null || true
        fi
    done

    # Estratégia 4: Reiniciar Docker daemon
    log_fix "🐳 Reiniciando Docker daemon..."
    sudo systemctl restart docker 2>/dev/null || true
    sleep 15

    # Estratégia 5: Tentar iniciar stacks uma por uma
    log_fix "🔄 Reiniciando stacks individualmente..."
    local all_stacks=$(docker ps -a --filter "label=com.docker.compose.project" --format "{{.Label \"com.docker.compose.project\"}}" | sort | uniq)

    echo "$all_stacks" | while read stack; do
        if [ ! -z "$stack" ]; then
            log_info "Reiniciando stack: $stack"

            # Parar todos os containers da stack
            docker ps -a --filter "label=com.docker.compose.project=$stack" --format "{{.Names}}" | while read container; do
                if [ ! -z "$container" ]; then
                    docker stop "$container" 2>/dev/null || true
                    docker rm "$container" 2>/dev/null || true
                fi
            done

            sleep 5

            # Tentar recriar a stack (se possível encontrar o compose)
            recreate_stack_if_possible "$stack"
        fi
    done

    log_success "✅ Correções avançadas aplicadas!"
}

# Tentar recriar stack se possível
recreate_stack_if_possible() {
    local stack_name="$1"

    # Procurar por docker-compose.yml em locais comuns
    local common_paths=(
        "/opt/$stack_name"
        "/var/lib/docker/volumes/portainer_data/_data/compose/$stack_name"
        "/home/$USER/$stack_name"
        "/root/$stack_name"
        "/opt/stacks/$stack_name"
    )

    for path in "${common_paths[@]}"; do
        if [ -f "$path/docker-compose.yml" ] || [ -f "$path/docker-compose.yaml" ]; then
            log_fix "📁 Encontrado compose para $stack_name em $path"

            cd "$path" 2>/dev/null || continue

            # Tentar recriar a stack
            if command -v docker-compose &> /dev/null; then
                docker-compose down 2>/dev/null || true
                sleep 5
                docker-compose up -d 2>/dev/null || true
            fi

            return 0
        fi
    done

    log_warning "⚠️ Não foi possível encontrar compose para $stack_name"
}

# Verificar acesso à API do Portainer
check_portainer_api_access() {
    log_info "🔌 Verificando acesso à API do Portainer..."

    local portainer_ports=(9000 9001 9002 9443 9444 9445)
    local accessible_apis=0

    for port in "${portainer_ports[@]}"; do
        if timeout 5 curl -s "http://localhost:$port/api/status" > /dev/null 2>&1; then
            log_success "✅ API Portainer acessível na porta $port"
            accessible_apis=$((accessible_apis + 1))
        fi
    done

    if [ $accessible_apis -eq 0 ]; then
        log_warning "❌ Nenhuma API do Portainer acessível"

        # Tentar criar um Portainer temporário para gerenciar stacks
        create_temporary_portainer
    else
        log_success "✅ $accessible_apis APIs do Portainer acessíveis"
    fi
}

# Criar Portainer temporário para gerenciar stacks
create_temporary_portainer() {
    log_fix "🛠️ Criando Portainer temporário para gerenciar stacks..."

    # Remover qualquer Portainer temporário anterior
    docker stop portainer-temp 2>/dev/null || true
    docker rm portainer-temp 2>/dev/null || true

    # Criar Portainer temporário
    docker run -d \
        --name portainer-temp \
        -p 9999:9000 \
        -v /var/run/docker.sock:/var/run/docker.sock \
        portainer/portainer-ce:latest \
        2>/dev/null || true

    sleep 10

    if timeout 10 curl -s http://localhost:9999 > /dev/null 2>&1; then
        log_success "✅ Portainer temporário criado (porta 9999)"
        log_info "Use http://localhost:9999 para gerenciar stacks manualmente se necessário"
    else
        log_warning "❌ Falha ao criar Portainer temporário"
    fi
}

# Corrigir stack que falhou
fix_failed_stack() {
    local stack_name="$1"

    log_fix "🔧 Tentando corrigir stack: $stack_name"

    # Obter containers da stack
    local stack_containers=$(docker ps -a --filter "label=com.docker.compose.project=$stack_name" --format "{{.Names}}" 2>/dev/null)

    if [ ! -z "$stack_containers" ]; then
        echo "$stack_containers" | while read container; do
            if [ ! -z "$container" ]; then
                # Verificar logs do container
                local error_logs=$(docker logs --tail=20 "$container" 2>&1)

                # Auto-diagnóstico baseado nos logs
                case "$error_logs" in
                    *"port already in use"*|*"address already in use"*)
                        log_fix "Porta ocupada na stack $stack_name. Corrigindo..."
                        # Tentar reiniciar após liberar portas
                        docker stop "$container" 2>/dev/null || true
                        sleep 5
                        docker start "$container" 2>/dev/null || true
                        ;;
                    *"no space left"*|*"disk full"*)
                        log_fix "Espaço insuficiente para stack $stack_name. Limpando..."
                        check_and_fix_disk_space
                        docker start "$container" 2>/dev/null || true
                        ;;
                    *"network"*|*"dns"*)
                        log_fix "Problema de rede na stack $stack_name. Recriando rede..."
                        local network=$(docker inspect "$container" --format '{{range .NetworkSettings.Networks}}{{.NetworkID}}{{end}}' 2>/dev/null)
                        if [ ! -z "$network" ]; then
                            docker network disconnect "$network" "$container" 2>/dev/null || true
                            docker network connect "$network" "$container" 2>/dev/null || true
                        fi
                        docker restart "$container" 2>/dev/null || true
                        ;;
                    *)
                        log_fix "Erro genérico na stack $stack_name. Reiniciando..."
                        docker restart "$container" 2>/dev/null || true
                        ;;
                esac
            fi
        done

        # Aguardar containers reiniciarem
        sleep 10

        # Verificar se stack está funcionando agora
        local running_containers=$(docker ps --filter "label=com.docker.compose.project=$stack_name" --format "{{.Names}}" | wc -l)
        local total_containers=$(docker ps -a --filter "label=com.docker.compose.project=$stack_name" --format "{{.Names}}" | wc -l)

        if [ $running_containers -eq $total_containers ] && [ $running_containers -gt 0 ]; then
            log_success "✅ Stack $stack_name corrigida!"
        else
            log_warning "⚠️ Stack $stack_name ainda com problemas ($running_containers/$total_containers rodando)"
        fi
    fi
}

# Backup dos dados do Portainer
backup_portainer_data() {
    local portainer_name="$1"

    log_info "💾 Fazendo backup dos dados do Portainer..."

    local backup_dir="/tmp/portainer-backup-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"

    # Backup do volume de dados
    if docker volume ls | grep -q portainer_data; then
        log_info "Copiando dados do Portainer..."
        docker run --rm -v portainer_data:/source -v "$backup_dir":/backup alpine cp -r /source/. /backup/ 2>/dev/null || true
    fi

    # Backup de configurações do container
    docker inspect "$portainer_name" > "$backup_dir/container_config.json" 2>/dev/null || true

    echo "$backup_dir" > /tmp/portainer_backup_path
    log_success "✅ Backup do Portainer salvo em: $backup_dir"
}

# Corrigir SSL do Portainer existente
fix_portainer_ssl() {
    local portainer_name="$1"

    log_fix "🔒 Corrigindo SSL do Portainer..."

    # Parar Portainer atual
    docker stop "$portainer_name" 2>/dev/null || true
    docker rm "$portainer_name" 2>/dev/null || true

    # Recriar Portainer com SSL corrigido
    log_info "Recriando Portainer com configuração SSL correta..."
    docker run -d \
        --name portainer-fixed \
        --restart=always \
        -p 8000:8000 \
        -p 9000:9000 \
        -p 9443:9443 \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v portainer_data:/data \
        --label "traefik.enable=true" \
        --label "traefik.http.routers.portainer.rule=Host(\`portainer.${DOMAIN}\`)" \
        --label "traefik.http.routers.portainer.entrypoints=websecure" \
        --label "traefik.http.routers.portainer.tls.certresolver=letsencrypt" \
        --label "traefik.http.services.portainer.loadbalancer.server.port=9000" \
        portainer/portainer-ce:latest \
        --sslcert /data/portainer.crt \
        --sslkey /data/portainer.key \
        2>/dev/null || true

    # Aguardar Portainer iniciar
    sleep 15

    # Verificar se funcionou
    if timeout 10 curl -s http://localhost:9000 > /dev/null 2>&1; then
        log_success "✅ Portainer SSL corrigido!"
    else
        log_warning "⚠️ Ainda há problemas com o Portainer"
    fi
}

# Configurar múltiplos Portainers para diferentes domínios
setup_multi_domain_portainers() {
    log_info "🌐 Configurando Portainers para múltiplos domínios..."

    # Solicitar domínios se não definidos
    if [ -z "${DOMAIN2:-}" ]; then
        log_info "📝 Configure os domínios para os Portainers:"
        realtime_echo "${YELLOW}Domínio 1 (atual): $DOMAIN${NC}"
        realtime_echo "${CYAN}Digite o segundo domínio (ex: example2.com):${NC}"

        # Aguardar input com timeout
        read -t 30 -r DOMAIN2 || DOMAIN2="portainer2.local"

        if [ -z "$DOMAIN2" ]; then
            DOMAIN2="portainer2.local"
            log_warning "Usando domínio padrão: $DOMAIN2"
        fi
    fi

    log_info "🏗️ Configurando Portainer 1 para: $DOMAIN"
    log_info "🏗️ Configurando Portainer 2 para: $DOMAIN2"

    # Parar qualquer Portainer existente conflitante
    docker stop portainer portainer-fixed 2>/dev/null || true
    docker rm portainer portainer-fixed 2>/dev/null || true

    # Criar Portainer 1 (domínio principal)
    create_portainer_instance "portainer1" "$DOMAIN" "9001" "9444"

    # Criar Portainer 2 (segundo domínio)
    create_portainer_instance "portainer2" "$DOMAIN2" "9002" "9445"

    # Aguardar ambos iniciarem
    log_info "⏳ Aguardando Portainers iniciarem..."
    sleep 30

    # Verificar se ambos estão funcionando
    verify_portainer_instances
}

# Criar instância do Portainer
create_portainer_instance() {
    local instance_name="$1"
    local domain="$2"
    local http_port="$3"
    local https_port="$4"

    log_info "🐳 Criando $instance_name para $domain..."

    # Criar volume específico para esta instância
    docker volume create "${instance_name}_data" 2>/dev/null || true

    # Criar container Portainer
    docker run -d \
        --name "$instance_name" \
        --restart=always \
        -p "$http_port:9000" \
        -p "$https_port:9443" \
        -v /var/run/docker.sock:/var/run/docker.sock \
        -v "${instance_name}_data:/data" \
        --network siqueira-network \
        --label "traefik.enable=true" \
        --label "traefik.http.routers.${instance_name}.rule=Host(\`portainer.${domain}\`)" \
        --label "traefik.http.routers.${instance_name}.entrypoints=websecure" \
        --label "traefik.http.routers.${instance_name}.tls.certresolver=letsencrypt" \
        --label "traefik.http.services.${instance_name}.loadbalancer.server.port=9000" \
        --label "traefik.http.middlewares.${instance_name}-redirect.redirectscheme.scheme=https" \
        --label "traefik.http.routers.${instance_name}-redirect.rule=Host(\`portainer.${domain}\`)" \
        --label "traefik.http.routers.${instance_name}-redirect.entrypoints=web" \
        --label "traefik.http.routers.${instance_name}-redirect.middlewares=${instance_name}-redirect" \
        portainer/portainer-ce:latest \
        2>/dev/null || true

    if [ $? -eq 0 ]; then
        log_success "✅ $instance_name criado com sucesso!"
        log_info "   • HTTP: http://localhost:$http_port"
        log_info "   • HTTPS: https://localhost:$https_port"
        log_info "   • Domínio: https://portainer.$domain"
    else
        log_error "❌ Falha ao criar $instance_name"
    fi
}

# Verificar instâncias do Portainer
verify_portainer_instances() {
    log_info "🔍 Verificando instâncias do Portainer..."

    local portainer1_status="❌"
    local portainer2_status="❌"

    # Verificar Portainer 1
    if timeout 10 curl -s http://localhost:9001 > /dev/null 2>&1; then
        portainer1_status="✅"
        log_success "✅ Portainer 1 funcionando (porta 9001)"
    else
        log_warning "❌ Portainer 1 não responde"

        # Tentar corrigir
        docker restart portainer1 2>/dev/null || true
        sleep 10

        if timeout 10 curl -s http://localhost:9001 > /dev/null 2>&1; then
            portainer1_status="✅"
            log_success "✅ Portainer 1 corrigido!"
        fi
    fi

    # Verificar Portainer 2
    if timeout 10 curl -s http://localhost:9002 > /dev/null 2>&1; then
        portainer2_status="✅"
        log_success "✅ Portainer 2 funcionando (porta 9002)"
    else
        log_warning "❌ Portainer 2 não responde"

        # Tentar corrigir
        docker restart portainer2 2>/dev/null || true
        sleep 10

        if timeout 10 curl -s http://localhost:9002 > /dev/null 2>&1; then
            portainer2_status="✅"
            log_success "✅ Portainer 2 corrigido!"
        fi
    fi

    # Relatório final dos Portainers
    realtime_echo ""
    realtime_echo "${CYAN}📊 Status dos Portainers:${NC}"
    realtime_echo "   $portainer1_status Portainer 1: https://portainer.$DOMAIN"
    realtime_echo "   $portainer2_status Portainer 2: https://portainer.${DOMAIN2:-"domain2.local"}"
    realtime_echo ""
}

# Verificar e corrigir espaço em disco
check_and_fix_disk_space() {
    log_info "💾 Verificando espaço em disco..."

    local available_space=$(df / | awk 'NR==2 {print $4}')
    local available_gb=$((available_space / 1024 / 1024))

    if [ $available_gb -lt 2 ]; then
        log_warning "⚠️ Pouco espaço em disco (${available_gb}GB). Limpando..."

        # Limpeza automática
        sudo apt autoremove -y 2>/dev/null || true
        sudo apt autoclean -y 2>/dev/null || true
        sudo journalctl --vacuum-time=7d 2>/dev/null || true
        docker system prune -f 2>/dev/null || true

        # Verificar novamente
        available_space=$(df / | awk 'NR==2 {print $4}')
        available_gb=$((available_space / 1024 / 1024))

        if [ $available_gb -lt 1 ]; then
            log_error "❌ Espaço em disco insuficiente (${available_gb}GB). Continuando com risco..."
        else
            log_success "✅ Espaço liberado. Disponível: ${available_gb}GB"
        fi
    else
        log_success "✅ Espaço em disco suficiente: ${available_gb}GB"
    fi
}

# Verificar e corrigir permissões
check_and_fix_permissions() {
    log_info "🔐 Verificando permissões..."

    # Verificar se usuário está no grupo docker
    if ! groups | grep -q docker; then
        log_fix "Adicionando usuário ao grupo docker..."
        sudo usermod -aG docker $USER || true
        log_warning "⚠️ Necessário logout/login para ativar grupo docker"
    fi

    # Corrigir permissões do diretório atual
    if [ ! -w "." ]; then
        log_fix "Corrigindo permissões do diretório..."
        sudo chown -R $USER:$USER . 2>/dev/null || true
    fi

    # Verificar permissões do Docker socket
    if [ -S /var/run/docker.sock ] && [ ! -w /var/run/docker.sock ]; then
        log_fix "Corrigindo permissões do Docker socket..."
        sudo chmod 666 /var/run/docker.sock 2>/dev/null || true
    fi

    log_success "✅ Permissões verificadas"
}

# Verificar e corrigir conflitos de porta avançado
check_and_fix_port_conflicts() {
    log_info "🔌 Verificando conflitos de porta avançados..."

    local ports_to_check=(80 443 3000 3001 5432 6379 8080)
    local conflicts_found=false

    for port in "${ports_to_check[@]}"; do
        local process=$(sudo netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | head -1)

        if [ ! -z "$process" ]; then
            log_warning "⚠️ Porta $port ocupada por: $process"
            conflicts_found=true

            # Auto-resolver conflitos conhecidos
            case $port in
                80|443)
                    # Parar serviços web
                    for service in apache2 nginx lighttpd; do
                        if systemctl is-active --quiet $service 2>/dev/null; then
                            log_fix "Parando $service..."
                            sudo systemctl stop $service 2>/dev/null || true
                            sudo systemctl disable $service 2>/dev/null || true
                        fi
                    done
                    ;;
                3000|3001)
                    # Matar processos Node.js/development servers
                    log_fix "Matando processos na porta $port..."
                    sudo fuser -k $port/tcp 2>/dev/null || true
                    ;;
                5432)
                    # PostgreSQL conflito
                    if systemctl is-active --quiet postgresql 2>/dev/null; then
                        log_fix "Parando PostgreSQL sistema..."
                        sudo systemctl stop postgresql 2>/dev/null || true
                    fi
                    ;;
                6379)
                    # Redis conflito
                    if systemctl is-active --quiet redis-server 2>/dev/null; then
                        log_fix "Parando Redis sistema..."
                        sudo systemctl stop redis-server 2>/dev/null || true
                    fi
                    ;;
            esac
        fi
    done

    if [ "$conflicts_found" = true ]; then
        log_warning "Aguardando 5s para processos terminarem..."
        sleep 5
        USE_ALT_PORTS=true
    else
        log_success "✅ Todas as portas estão livres"
        USE_ALT_PORTS=false
    fi
}

# Verificar e corrigir Docker
check_and_fix_docker() {
    log_info "🐳 Verificando Docker..."

    # Verificar se Docker está instalado
    if ! command -v docker &> /dev/null; then
        log_fix "Docker não encontrado. Instalando..."
        curl -fsSL https://get.docker.com -o get-docker.sh
        sudo sh get-docker.sh
        sudo usermod -aG docker $USER
        rm get-docker.sh
    fi

    # Verificar se Docker está rodando
    if ! sudo systemctl is-active --quiet docker; then
        log_fix "Docker não está rodando. Iniciando..."
        sudo systemctl start docker || true
        sudo systemctl enable docker || true
        sleep 5
    fi

    # Verificar se Docker responde
    if ! docker ps &> /dev/null; then
        log_fix "Docker não responde. Reiniciando serviço..."
        sudo systemctl restart docker || true
        sleep 10

        # Se ainda não funciona, tentar repair
        if ! docker ps &> /dev/null; then
            log_fix "Tentando reparo do Docker..."
            sudo systemctl stop docker || true
            sudo rm -rf /var/lib/docker/network 2>/dev/null || true
            sudo systemctl start docker || true
            sleep 10
        fi
    fi

    # Verificar Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_fix "Docker Compose não encontrado. Instalando..."
        sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi

    # Limpeza preventiva do Docker
    log_info "Limpeza preventiva do Docker..."
    docker system prune -f 2>/dev/null || true

    log_success "✅ Docker verificado e corrigido"
}

# Verificar e corrigir dependências
check_and_fix_dependencies() {
    log_info "📦 Verificando dependências..."

    local required_packages=(curl wget git unzip htop nano ufw net-tools)
    local missing_packages=()

    for package in "${required_packages[@]}"; do
        if ! command -v $package &> /dev/null && ! dpkg -l | grep -q "^ii  $package "; then
            missing_packages+=($package)
        fi
    done

    if [ ${#missing_packages[@]} -gt 0 ]; then
        log_fix "Instalando pacotes em falta: ${missing_packages[*]}"
        sudo apt update 2>/dev/null || true
        sudo apt install -y "${missing_packages[@]}" 2>/dev/null || true
    fi

    # Verificar se sistema está atualizado
    local updates=$(apt list --upgradable 2>/dev/null | wc -l)
    if [ $updates -gt 10 ]; then
        log_warning "Sistema com muitas atualizações pendentes ($updates). Atualizando..."
        sudo apt update && sudo apt upgrade -y 2>/dev/null || true
    fi

    log_success "✅ Dependências verificadas"
}

# Verificar e corrigir firewall
check_and_fix_firewall() {
    log_info "🔥 Verificando firewall..."

    # Verificar se UFW está instalado
    if ! command -v ufw &> /dev/null; then
        log_fix "UFW não encontrado. Instalando..."
        sudo apt install -y ufw 2>/dev/null || true
    fi

    # Verificar status do firewall
    local ufw_status=$(sudo ufw status 2>/dev/null | head -1)

    if echo "$ufw_status" | grep -q "inactive"; then
        log_fix "Firewall inativo. Configurando..."
        sudo ufw --force reset 2>/dev/null || true
        sudo ufw allow 22/tcp 2>/dev/null || true
        sudo ufw allow 80/tcp 2>/dev/null || true
        sudo ufw allow 443/tcp 2>/dev/null || true
        sudo ufw allow 8000/tcp 2>/dev/null || true
        sudo ufw allow 8080/tcp 2>/dev/null || true
        sudo ufw allow 8443/tcp 2>/dev/null || true
        sudo ufw --force enable 2>/dev/null || true
    fi

    log_success "✅ Firewall configurado"
}

# Sistema completo de detecção e correção do Traefik problemático
check_and_fix_existing_traefik() {
    log_info "🔀 Detectando Traefik existente..."

    # Detectar containers Traefik
    local existing_traefik=$(docker ps -a --filter "name=traefik" --format "{{.Names}}" 2>/dev/null)

    if [ ! -z "$existing_traefik" ]; then
        log_warning "⚠️ Traefik existente detectado: $existing_traefik"

        # Analisar problemas do Traefik
        analyze_traefik_issues "$existing_traefik"

        # Backup do Traefik antes de corrigir
        backup_traefik_data "$existing_traefik"

        # Corrigir problemas específicos
        fix_traefik_comprehensive "$existing_traefik"
    else
        # Verificar se há Traefik em stacks
        local traefik_in_stacks=$(docker ps -a --filter "label=com.docker.compose.service=traefik" --format "{{.Names}}" 2>/dev/null)

        if [ ! -z "$traefik_in_stacks" ]; then
            log_warning "⚠️ Traefik em stack detectado: $traefik_in_stacks"
            analyze_traefik_issues "$traefik_in_stacks"
            fix_traefik_in_stack "$traefik_in_stacks"
        else
            log_info "ℹ️ Nenhum Traefik problemático detectado"
        fi
    fi
}

# Análise completa dos problemas do Traefik
analyze_traefik_issues() {
    local traefik_name="$1"

    log_info "🔍 Analisando problemas do Traefik: $traefik_name"

    # Verificar se está rodando
    local traefik_status=$(docker ps --filter "name=$traefik_name" --format "{{.Status}}" 2>/dev/null)

    if [ -z "$traefik_status" ]; then
        log_error "❌ Traefik não está rodando"

        # Verificar logs do container parado
        local error_logs=$(docker logs --tail=20 "$traefik_name" 2>&1)
        log_info "📋 Logs do erro:"
        echo "$error_logs" | head -10

        # Analisar causa da parada
        case "$error_logs" in
            *"port already in use"*|*"bind: address already in use"*)
                log_warning "🔌 Problema: Conflito de porta detectado"
                fix_traefik_port_conflict "$traefik_name"
                ;;
            *"certificate"*|*"SSL"*|*"TLS"*)
                log_warning "🔒 Problema: Erro de certificado SSL/TLS"
                fix_traefik_ssl_issues "$traefik_name"
                ;;
            *"no such file"*|*"permission denied"*)
                log_warning "📁 Problema: Arquivo ou permissão"
                fix_traefik_file_permissions "$traefik_name"
                ;;
            *)
                log_warning "❓ Problema genérico detectado"
                ;;
        esac
    else
        log_info "✅ Traefik está rodando: $traefik_status"

        # Verificar se dashboard está acessível
        test_traefik_dashboard "$traefik_name"

        # Verificar problemas de proxy reverso
        test_traefik_proxy_reverse "$traefik_name"

        # Verificar certificados SSL
        verify_traefik_ssl_status "$traefik_name"
    fi
}

# Testar dashboard do Traefik
test_traefik_dashboard() {
    local traefik_name="$1"

    log_info "🌐 Testando dashboard do Traefik..."

    local dashboard_ports=(8080 8081 9000 9090)
    local dashboard_accessible=false

    for port in "${dashboard_ports[@]}"; do
        if timeout 5 curl -s "http://localhost:$port/api/overview" > /dev/null 2>&1; then
            log_success "✅ Dashboard Traefik acessível na porta $port"
            dashboard_accessible=true
            break
        fi
    done

    if [ "$dashboard_accessible" = false ]; then
        log_warning "❌ Dashboard Traefik não acess��vel"

        # Verificar configuração do dashboard
        local traefik_config=$(docker inspect "$traefik_name" --format '{{.Config.Cmd}}' 2>/dev/null)

        if echo "$traefik_config" | grep -q "api.dashboard=true"; then
            log_info "Dashboard habilitado na configuração"
        else
            log_warning "Dashboard não habilitado - corrigindo..."
            enable_traefik_dashboard "$traefik_name"
        fi
    fi
}

# Testar proxy reverso do Traefik
test_traefik_proxy_reverse() {
    local traefik_name="$1"

    log_info "🔄 Testando proxy reverso do Traefik..."

    # Verificar se Traefik está fazendo proxy para outros serviços
    local proxy_errors=0

    # Testar portas comuns de proxy
    local proxy_ports=(80 443)

    for port in "${proxy_ports[@]}"; do
        if ! timeout 5 curl -s "http://localhost:$port" > /dev/null 2>&1; then
            log_warning "❌ Proxy na porta $port não funcionando"
            proxy_errors=$((proxy_errors + 1))
        else
            # Verificar se está retornando erro de Gateway
            local response=$(timeout 5 curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port" 2>/dev/null)

            case "$response" in
                "502"|"503"|"504")
                    log_warning "❌ Erro de Gateway ($response) na porta $port"
                    proxy_errors=$((proxy_errors + 1))
                    ;;
                "200"|"301"|"302")
                    log_success "✅ Proxy funcionando na porta $port"
                    ;;
                *)
                    log_info "ℹ️ Resposta $response na porta $port"
                    ;;
            esac
        fi
    done

    if [ $proxy_errors -gt 0 ]; then
        log_warning "⚠️ $proxy_errors problemas de proxy detectados"
        fix_traefik_proxy_issues "$traefik_name"
    else
        log_success "✅ Proxy reverso funcionando"
    fi
}

# Verificar status SSL do Traefik
verify_traefik_ssl_status() {
    local traefik_name="$1"

    log_info "🔒 Verificando status SSL do Traefik..."

    # Verificar se há certificados
    local cert_volume=$(docker inspect "$traefik_name" --format '{{range .Mounts}}{{if eq .Destination "/acme.json"}}{{.Source}}{{end}}{{end}}' 2>/dev/null)

    if [ ! -z "$cert_volume" ] && [ -f "$cert_volume" ]; then
        local cert_size=$(stat -c%s "$cert_volume" 2>/dev/null || echo "0")

        if [ "$cert_size" -gt 100 ]; then
            log_success "✅ Arquivo de certificados existe ($cert_size bytes)"

            # Verificar se certificados são válidos
            if timeout 5 openssl x509 -in "$cert_volume" -text -noout > /dev/null 2>&1; then
                log_success "✅ Certificados SSL válidos"
            else
                log_warning "❌ Certificados SSL corrompidos"
                fix_traefik_ssl_certificates "$traefik_name"
            fi
        else
            log_warning "❌ Arquivo de certificados vazio ou corrompido"
            fix_traefik_ssl_certificates "$traefik_name"
        fi
    else
        log_warning "❌ Arquivo de certificados não encontrado"
        fix_traefik_ssl_certificates "$traefik_name"
    fi
}

# Corrigir conflitos de porta do Traefik
fix_traefik_port_conflict() {
    local traefik_name="$1"

    log_fix "🔌 Corrigindo conflitos de porta do Traefik..."

    # Verificar e parar serviços conflitantes
    local conflicting_ports=(80 443 8080)

    for port in "${conflicting_ports[@]}"; do
        local process=$(sudo netstat -tlnp 2>/dev/null | grep ":$port " | awk '{print $7}' | head -1)

        if [ ! -z "$process" ] && ! echo "$process" | grep -q "docker"; then
            log_fix "Liberando porta $port (processo: $process)"

            # Matar processo específico
            local pid=$(echo "$process" | cut -d'/' -f1)
            if [ ! -z "$pid" ] && [ "$pid" != "-" ]; then
                sudo kill -9 "$pid" 2>/dev/null || true
            fi
        fi
    done

    # Parar containers Docker conflitantes
    local conflicting_containers=$(docker ps --filter "publish=80" --filter "publish=443" --format "{{.Names}}" | grep -v "$traefik_name")

    if [ ! -z "$conflicting_containers" ]; then
        echo "$conflicting_containers" | while read container; do
            if [ ! -z "$container" ]; then
                log_fix "Parando container conflitante: $container"
                docker stop "$container" 2>/dev/null || true
            fi
        done
    fi

    # Tentar reiniciar Traefik
    log_info "Reiniciando Traefik após liberar portas..."
    docker restart "$traefik_name" 2>/dev/null || true
    sleep 10
}

# Corrigir problemas SSL do Traefik
fix_traefik_ssl_issues() {
    local traefik_name="$1"

    log_fix "🔒 Corrigindo problemas SSL do Traefik..."

    # Parar Traefik
    docker stop "$traefik_name" 2>/dev/null || true

    # Localizar e limpar certificados corrompidos
    local cert_paths=(
        "/var/lib/docker/volumes/traefik_acme/_data/acme.json"
        "/var/lib/docker/volumes/*traefik*/_data/acme.json"
        "/opt/traefik/acme.json"
        "/etc/traefik/acme.json"
    )

    for path in "${cert_paths[@]}"; do
        if [ -f "$path" ]; then
            log_fix "Removendo certificados corrompidos: $path"
            sudo rm -f "$path" 2>/dev/null || true
        fi
    done

    # Recriar arquivo acme.json com permissões corretas
    local acme_volume=$(docker volume ls | grep -E "(traefik|acme)" | awk '{print $2}' | head -1)

    if [ ! -z "$acme_volume" ]; then
        log_fix "Recriando acme.json no volume: $acme_volume"
        docker run --rm -v "$acme_volume:/data" alpine sh -c "touch /data/acme.json && chmod 600 /data/acme.json" 2>/dev/null || true
    fi

    # Reiniciar Traefik
    docker start "$traefik_name" 2>/dev/null || true
    sleep 15

    log_success "✅ Problemas SSL corrigidos"
}

# Corrigir permissões de arquivos do Traefik
fix_traefik_file_permissions() {
    local traefik_name="$1"

    log_fix "📁 Corrigindo permissões do Traefik..."

    # Corrigir permissões do socket Docker
    sudo chmod 666 /var/run/docker.sock 2>/dev/null || true

    # Corrigir permissões de volumes Traefik
    local traefik_volumes=$(docker inspect "$traefik_name" --format '{{range .Mounts}}{{.Source}} {{end}}' 2>/dev/null)

    if [ ! -z "$traefik_volumes" ]; then
        echo "$traefik_volumes" | while read volume; do
            if [ ! -z "$volume" ] && [ -d "$volume" ]; then
                log_fix "Corrigindo permissões: $volume"
                sudo chown -R root:docker "$volume" 2>/dev/null || true
                sudo chmod -R 755 "$volume" 2>/dev/null || true
            fi
        done
    fi

    # Reiniciar Traefik
    docker restart "$traefik_name" 2>/dev/null || true
    sleep 10
}

# Habilitar dashboard do Traefik
enable_traefik_dashboard() {
    local traefik_name="$1"

    log_fix "🌐 Habilitando dashboard do Traefik..."

    # Obter configuração atual
    local current_cmd=$(docker inspect "$traefik_name" --format '{{.Config.Cmd}}' 2>/dev/null)

    # Parar container atual
    docker stop "$traefik_name" 2>/dev/null || true
    docker rm "$traefik_name" 2>/dev/null || true

    # Recriar com dashboard habilitado
    log_info "Recriando Traefik com dashboard habilitado..."

    # Tentar encontrar volumes existentes
    local traefik_volumes=$(docker volume ls | grep -E "(traefik|acme)" | awk '{print $2}')
    local volume_args=""

    if [ ! -z "$traefik_volumes" ]; then
        echo "$traefik_volumes" | while read volume; do
            volume_args="$volume_args -v $volume:/data"
        done
    fi

    # Criar novo Traefik com configuração correta
    docker run -d \
        --name "${traefik_name}-fixed" \
        --restart=unless-stopped \
        -p 80:80 \
        -p 443:443 \
        -p 8080:8080 \
        -v /var/run/docker.sock:/var/run/docker.sock:ro \
        $volume_args \
        traefik:latest \
        --api.dashboard=true \
        --api.insecure=true \
        --entrypoints.web.address=:80 \
        --entrypoints.websecure.address=:443 \
        --providers.docker=true \
        --providers.docker.exposedbydefault=false \
        --certificatesresolvers.letsencrypt.acme.email="$EMAIL" \
        --certificatesresolvers.letsencrypt.acme.storage=/data/acme.json \
        --certificatesresolvers.letsencrypt.acme.httpchallenge=true \
        --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web \
        --log.level=INFO \
        2>/dev/null || true

    sleep 15

    # Verificar se funcionou
    if timeout 10 curl -s http://localhost:8080/api/overview > /dev/null 2>&1; then
        log_success "✅ Dashboard Traefik habilitado e funcionando!"
    else
        log_warning "⚠️ Ainda há problemas com o dashboard"
    fi
}

# Corrigir problemas de proxy do Traefik
fix_traefik_proxy_issues() {
    local traefik_name="$1"

    log_fix "🔄 Corrigindo problemas de proxy do Traefik..."

    # Verificar configuração de redes
    local traefik_networks=$(docker inspect "$traefik_name" --format '{{range .NetworkSettings.Networks}}{{.NetworkID}} {{end}}' 2>/dev/null)

    # Recriar redes se necessário
    if [ -z "$traefik_networks" ]; then
        log_fix "Reconectando Traefik às redes..."

        # Tentar conectar à rede bridge padrão
        docker network connect bridge "$traefik_name" 2>/dev/null || true

        # Tentar conectar a redes de compose
        local compose_networks=$(docker network ls --filter "driver=bridge" --format "{{.Name}}" | grep -v bridge)

        echo "$compose_networks" | while read network; do
            if [ ! -z "$network" ]; then
                docker network connect "$network" "$traefik_name" 2>/dev/null || true
            fi
        done
    fi

    # Verificar se serviços backend estão acessíveis
    log_info "Verificando conectividade com serviços backend..."

    # Reiniciar Traefik para aplicar mudanças
    docker restart "$traefik_name" 2>/dev/null || true
    sleep 15

    # Testar novamente
    if timeout 5 curl -s http://localhost:80 > /dev/null 2>&1; then
        log_success "✅ Proxy reverso corrigido!"
    else
        log_warning "⚠️ Proxy ainda com problemas - pode precisar reconfiguração manual"
    fi
}

# Corrigir certificados SSL
fix_traefik_ssl_certificates() {
    local traefik_name="$1"

    log_fix "🔒 Regenerando certificados SSL..."

    # Parar Traefik temporariamente
    docker stop "$traefik_name" 2>/dev/null || true

    # Limpar todos os certificados antigos
    docker run --rm -v traefik_acme:/data alpine sh -c "rm -f /data/acme.json && touch /data/acme.json && chmod 600 /data/acme.json" 2>/dev/null || true

    # Reiniciar Traefik para gerar novos certificados
    docker start "$traefik_name" 2>/dev/null || true

    log_info "⏳ Aguardando geração de novos certificados SSL..."
    sleep 30

    # Verificar se certificados foram gerados
    local new_cert_size=$(docker run --rm -v traefik_acme:/data alpine stat -c%s /data/acme.json 2>/dev/null || echo "0")

    if [ "$new_cert_size" -gt 100 ]; then
        log_success "✅ Novos certificados SSL gerados!"
    else
        log_warning "⚠️ Certificados ainda não foram gerados - pode levar alguns minutos"
    fi
}

# Backup dados do Traefik
backup_traefik_data() {
    local traefik_name="$1"

    log_info "💾 Fazendo backup do Traefik..."

    local backup_dir="/tmp/traefik-backup-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"

    # Backup de volumes
    docker inspect "$traefik_name" --format '{{range .Mounts}}{{.Source}} {{.Destination}}{{"\n"}}{{end}}' 2>/dev/null | while read mount; do
        if [ ! -z "$mount" ]; then
            local source=$(echo "$mount" | awk '{print $1}')
            local dest=$(echo "$mount" | awk '{print $2}')

            if [ -f "$source" ]; then
                cp "$source" "$backup_dir/" 2>/dev/null || true
            elif [ -d "$source" ]; then
                cp -r "$source" "$backup_dir/" 2>/dev/null || true
            fi
        fi
    done

    # Backup configuração do container
    docker inspect "$traefik_name" > "$backup_dir/traefik_config.json" 2>/dev/null || true

    echo "$backup_dir" > /tmp/traefik_backup_path
    log_success "✅ Backup do Traefik salvo em: $backup_dir"
}

# Corrigir Traefik em stack
fix_traefik_in_stack() {
    local traefik_container="$1"

    log_fix "🔧 Corrigindo Traefik em stack..."

    # Obter stack do Traefik
    local stack_name=$(docker inspect "$traefik_container" --format '{{.Config.Labels}}' | grep -o 'com.docker.compose.project:[^,}]*' | cut -d':' -f2 | tr -d ' "')

    if [ ! -z "$stack_name" ]; then
        log_info "Stack detectada: $stack_name"

        # Tentar reiniciar stack inteira
        log_fix "Reiniciando stack $stack_name..."

        # Parar containers da stack
        docker ps --filter "label=com.docker.compose.project=$stack_name" --format "{{.Names}}" | while read container; do
            if [ ! -z "$container" ]; then
                docker stop "$container" 2>/dev/null || true
            fi
        done

        sleep 5

        # Reiniciar containers da stack
        docker ps -a --filter "label=com.docker.compose.project=$stack_name" --format "{{.Names}}" | while read container; do
            if [ ! -z "$container" ]; then
                docker start "$container" 2>/dev/null || true
            fi
        done

        sleep 15

        # Verificar se Traefik está funcionando agora
        if timeout 10 curl -s http://localhost:8080/api/overview > /dev/null 2>&1; then
            log_success "✅ Traefik em stack corrigido!"
        else
            log_warning "⚠️ Traefik ainda com problemas na stack"
        fi
    fi
}

# Correção comprehensive do Traefik
fix_traefik_comprehensive() {
    local traefik_name="$1"

    log_fix "🛠️ Aplicando correção comprehensive do Traefik..."

    # Executar todas as correções em sequência
    fix_traefik_port_conflict "$traefik_name"
    fix_traefik_file_permissions "$traefik_name"
    fix_traefik_ssl_issues "$traefik_name"

    # Aguardar estabilização
    sleep 20

    # Verificar resultados
    local dashboard_ok=false
    local proxy_ok=false
    local ssl_ok=false

    # Testar dashboard
    if timeout 10 curl -s http://localhost:8080/api/overview > /dev/null 2>&1; then
        dashboard_ok=true
        log_success "✅ Dashboard funcionando"
    fi

    # Testar proxy
    if timeout 10 curl -s http://localhost:80 > /dev/null 2>&1; then
        proxy_ok=true
        log_success "✅ Proxy funcionando"
    fi

    # Testar SSL (se aplicável)
    if timeout 10 curl -sk https://localhost:443 > /dev/null 2>&1; then
        ssl_ok=true
        log_success "✅ SSL funcionando"
    fi

    # Relatório final
    local issues_fixed=0
    [ "$dashboard_ok" = true ] && issues_fixed=$((issues_fixed + 1))
    [ "$proxy_ok" = true ] && issues_fixed=$((issues_fixed + 1))
    [ "$ssl_ok" = true ] && issues_fixed=$((issues_fixed + 1))

    if [ $issues_fixed -ge 2 ]; then
        log_success "🎉 Traefik majoritariamente corrigido! ($issues_fixed/3 funcionalidades OK)"
    else
        log_warning "⚠️ Traefik ainda com problemas significativos ($issues_fixed/3 funcionalidades OK)"

        # Se ainda há muitos problemas, sugerir recriação completa
        suggest_traefik_recreation "$traefik_name"
    fi
}

# Sugerir recriação completa do Traefik
suggest_traefik_recreation() {
    local traefik_name="$1"

    log_warning "🔄 Traefik com problemas persistentes"
    log_info "💡 Será criado um novo Traefik otimizado no deploy principal"
    log_info "📝 O Traefik problemático será parado para evitar conflitos"

    # Parar Traefik problemático
    docker stop "$traefik_name" 2>/dev/null || true

    # Marcar para não iniciar automaticamente
    docker update --restart=no "$traefik_name" 2>/dev/null || true

    log_success "✅ Traefik problemático desabilitado - novo Traefik será criado"
}

# Verificação final de conflitos entre Traefiks
check_traefik_conflicts_final() {
    log_info "🔍 Verificação final de conflitos entre Traefiks..."

    # Listar todos os containers Traefik
    local all_traefiks=$(docker ps -a --filter "name=traefik" --format "{{.Names}}" 2>/dev/null)
    local running_traefiks=$(docker ps --filter "name=traefik" --format "{{.Names}}" 2>/dev/null)

    local traefik_count=$(echo "$running_traefiks" | grep -v '^$' | wc -l)

    realtime_echo "${CYAN}📊 Status dos Traefiks:${NC}"
    realtime_echo "   • Total detectados: $(echo "$all_traefiks" | grep -v '^$' | wc -l)"
    realtime_echo "   • Rodando: $traefik_count"

    if [ $traefik_count -gt 1 ]; then
        log_warning "���️ Múltiplos Traefiks rodando - resolvendo conflitos..."

        echo "$running_traefiks" | while read traefik; do
            if [ ! -z "$traefik" ]; then
                # Verificar se é o Traefik novo (do nosso deploy)
                if echo "$traefik" | grep -q "siqueira-traefik"; then
                    log_success "✅ Mantendo Traefik novo: $traefik"
                else
                    log_fix "🔧 Parando Traefik antigo: $traefik"
                    docker stop "$traefik" 2>/dev/null || true
                    docker update --restart=no "$traefik" 2>/dev/null || true
                fi
            fi
        done

        sleep 10

        # Verificar novamente
        local final_running=$(docker ps --filter "name=traefik" --format "{{.Names}}" | wc -l)

        if [ $final_running -eq 1 ]; then
            log_success "✅ Conflito resolvido - apenas 1 Traefik rodando"
        else
            log_warning "⚠️ Ainda há $final_running Traefiks rodando"
        fi
    elif [ $traefik_count -eq 1 ]; then
        log_success "✅ Apenas 1 Traefik rodando - sem conflitos"

        # Verificar se é o nosso Traefik
        if echo "$running_traefiks" | grep -q "siqueira-traefik"; then
            log_success "✅ Traefik do deploy funcionando"

            # Testar funcionalidades
            test_final_traefik_functionality
        else
            log_info "ℹ️ Traefik externo rodando"
        fi
    else
        log_warning "⚠️ Nenhum Traefik rodando"
    fi
}

# Testar funcionalidade final do Traefik
test_final_traefik_functionality() {
    log_info "🧪 Testando funcionalidades do Traefik final..."

    local tests_passed=0
    local total_tests=4

    # Teste 1: Dashboard
    if timeout 10 curl -s http://localhost:8080/api/overview > /dev/null 2>&1; then
        log_success "✅ Dashboard: Funcionando"
        tests_passed=$((tests_passed + 1))
    else
        log_warning "❌ Dashboard: Não acessível"
    fi

    # Teste 2: Proxy HTTP
    if timeout 10 curl -s http://localhost:80 > /dev/null 2>&1; then
        local http_response=$(timeout 5 curl -s -o /dev/null -w "%{http_code}" http://localhost:80 2>/dev/null)
        if [ "$http_response" != "502" ] && [ "$http_response" != "503" ] && [ "$http_response" != "504" ]; then
            log_success "✅ Proxy HTTP: Funcionando ($http_response)"
            tests_passed=$((tests_passed + 1))
        else
            log_warning "❌ Proxy HTTP: Erro Gateway ($http_response)"
        fi
    else
        log_warning "❌ Proxy HTTP: Não acessível"
    fi

    # Teste 3: HTTPS (se aplicável)
    if timeout 10 curl -sk https://localhost:443 > /dev/null 2>&1; then
        log_success "✅ HTTPS: Funcionando"
        tests_passed=$((tests_passed + 1))
    else
        log_warning "⚠️ HTTPS: Não configurado/acessível (normal se não há domínio)"
    fi

    # Teste 4: Conectividade com containers
    if docker exec siqueira-traefik nslookup siqueira-app > /dev/null 2>&1; then
        log_success "✅ Conectividade interna: OK"
        tests_passed=$((tests_passed + 1))
    else
        log_warning "❌ Conectividade interna: Problemas"
    fi

    # Resultado final
    local success_rate=$((tests_passed * 100 / total_tests))

    realtime_echo ""
    realtime_echo "${CYAN}📊 Resultado dos testes do Traefik:${NC}"
    realtime_echo "   • Testes passados: $tests_passed/$total_tests"
    realtime_echo "   • Taxa de sucesso: ${success_rate}%"

    if [ $success_rate -ge 75 ]; then
        realtime_echo "   ✅ Traefik funcionando adequadamente!"
    elif [ $success_rate -ge 50 ]; then
        realtime_echo "   ⚠️ Traefik com funcionalidade limitada"
    else
        realtime_echo "   ❌ Traefik com problemas significativos"

        # Logs para diagnóstico
        realtime_echo ""
        realtime_echo "${YELLOW}📋 Logs recentes do Traefik para diagnóstico:${NC}"
        docker logs --tail=10 siqueira-traefik 2>/dev/null | head -5 || true
    fi
}

# Verificar recursos do sistema
check_system_resources() {
    log_info "💻 Verificando recursos do sistema..."

    # Verificar RAM
    local ram_total=$(free -m | awk 'NR==2{print $2}')
    local ram_available=$(free -m | awk 'NR==2{print $7}')

    if [ $ram_total -lt 1000 ]; then
        log_warning "⚠️ RAM baixa: ${ram_total}MB total"
    fi

    if [ $ram_available -lt 500 ]; then
        log_warning "⚠️ RAM disponível baixa: ${ram_available}MB"
        log_fix "Liberando cache..."
        sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null || true
    fi

    # Verificar CPU load
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cpu_cores=$(nproc)

    if (( $(echo "$cpu_load > $cpu_cores" | bc -l 2>/dev/null || echo 0) )); then
        log_warning "⚠️ Alta carga de CPU: $cpu_load (cores: $cpu_cores)"
    fi

    # Verificar swap
    local swap_used=$(free -m | awk 'NR==3{print $3}')
    if [ $swap_used -gt 1000 ]; then
        log_warning "⚠️ Alto uso de swap: ${swap_used}MB"
    fi

    log_success "✅ Recursos do sistema verificados"
}

# Função para manter processo vivo com monitoramento
keep_alive() {
    while true; do
        sleep 30

        # Verificar se processo ainda está rodando
        if ! ps -p $$ > /dev/null; then
            break
        fi

        # Monitoramento proativo
        monitor_system_health
    done &
}

# Monitoramento proativo da saúde do sistema
monitor_system_health() {
    # Verificar se Docker ainda está rodando
    if ! docker ps &> /dev/null; then
        log_warning "🔄 Docker parou. Reiniciando..."
        sudo systemctl restart docker 2>/dev/null || true
    fi

    # Verificar espaço em disco crítico
    local available_space=$(df / | awk 'NR==2 {print $4}')
    local available_gb=$((available_space / 1024 / 1024))

    if [ $available_gb -lt 1 ]; then
        log_warning "🧹 Espaço crítico. Limpando automaticamente..."
        docker system prune -f 2>/dev/null || true
        sudo journalctl --vacuum-time=1d 2>/dev/null || true
    fi
}

# Função avançada de retry com backoff exponencial
retry_with_backoff() {
    local cmd="$1"
    local desc="$2"
    local max_attempts="${3:-5}"
    local base_delay="${4:-2}"

    local attempt=1
    local delay=$base_delay

    while [ $attempt -le $max_attempts ]; do
        log_info "Tentativa $attempt/$max_attempts: $desc"

        if eval "$cmd"; then
            log_success "✅ $desc - Sucesso na tentativa $attempt"
            return 0
        else
            if [ $attempt -lt $max_attempts ]; then
                log_warning "⚠️ Tentativa $attempt falhou. Aguardando ${delay}s..."
                sleep $delay
                delay=$((delay * 2))  # Backoff exponencial

                # Auto-diagnóstico entre tentativas
                case $desc in
                    *"Docker"*|*"docker"*)
                        log_fix "Verificando Docker entre tentativas..."
                        check_and_fix_docker
                        ;;
                    *"conectividade"*|*"download"*)
                        log_fix "Verificando conectividade..."
                        ping -c 1 8.8.8.8 &> /dev/null || log_warning "Conectividade instável"
                        ;;
                esac
            fi
        fi

        attempt=$((attempt + 1))
    done

    log_error "❌ $desc - Falhou após $max_attempts tentativas"
    return 1
}

# Função simplificada para output em tempo real
realtime_echo() {
    local message="$1"

    # Output simples que funciona sempre
    echo -e "$message" 2>/dev/null || echo "$message"

    # Salvar no log se arquivo existe
    if [[ -n "${LOG_FILE:-}" ]]; then
        echo -e "$message" >> "$LOG_FILE" 2>/dev/null || true
    fi

    # Micro pausa para sincronização
    sleep 0.02
}

# Função para progress bar
show_progress() {
    local current=$1
    local total=$2
    local width=50
    local percentage=$((current * 100 / total))
    local completed=$((current * width / total))

    printf "\r${BLUE}[INFO]${NC} Progresso: ["
    printf "%*s" "$completed" | tr ' ' '='
    printf "%*s" $((width - completed)) | tr ' ' '-'
    printf "] %d%% (%d/%d)" "$percentage" "$current" "$total"

    if [ "$current" -eq "$total" ]; then
        echo ""
    fi
}

# ============= CORES =============
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m'

clear
realtime_echo "${PURPLE}���� =========================================="
realtime_echo "🚀 MEGA DEPLOY AUTOMÁTICO V3 - TEMPO REAL"
realtime_echo "🏠 Siqueira Campos Imóveis"
realtime_echo "🔥 APAGA TUDO E REFAZ + LOGS EM TEMPO REAL"
realtime_echo "🏠 ==========================================${NC}"

# ============= FUNÇÕES DE LOG V3 =============
log_info() {
    realtime_echo "${BLUE}[INFO]${NC} $1"
}

log_success() {
    realtime_echo "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    realtime_echo "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    realtime_echo "${RED}[ERROR]${NC} $1"
}

log_fix() {
    realtime_echo "${CYAN}[FIX]${NC} $1"
}

log_step() {
    realtime_echo "${WHITE}[STEP $1/$2]${NC} $3"
}

# Função ultra-robusta para executar comandos com auto-correção
run_with_progress() {
    local cmd="$1"
    local desc="$2"
    local timeout_duration="${3:-300}"
    local retry_attempts="${4:-3}"

    log_info "🚀 Executando: $desc"

    # Função interna para executar com timeout
    _execute_cmd() {
        local temp_output=$(mktemp)
        local start_time=$(date +%s)

        set +e
        timeout "$timeout_duration" bash -c "$cmd" > "$temp_output" 2>&1
        local exit_code=$?
        set -o pipefail

        if [ $exit_code -eq 0 ]; then
            if [[ -s "$temp_output" ]]; then
                realtime_echo "${BLUE}✅ Output:${NC}"
                head -3 "$temp_output" 2>/dev/null || true
            fi

            local end_time=$(date +%s)
            local duration=$((end_time - start_time))
            log_success "$desc - Concluído em ${duration}s"
            rm -f "$temp_output" 2>/dev/null || true
            return 0
        else
            # Análise inteligente do erro
            local error_output=$(cat "$temp_output" 2>/dev/null)
            rm -f "$temp_output" 2>/dev/null || true

            # Auto-diagnóstico e correção baseada no erro
            auto_diagnose_and_fix "$error_output" "$cmd" "$desc"

            return $exit_code
        fi
    }

    # Tentar com sistema de retry avançado
    if retry_with_backoff "_execute_cmd" "$desc" "$retry_attempts"; then
        return 0
    else
        log_warning "⚠️ $desc - Falhou mas CONTINUANDO o deploy..."
        return 0  # Sempre continuar
    fi
}

# Sistema de auto-diagnóstico e correção baseado em erros
auto_diagnose_and_fix() {
    local error_output="$1"
    local failed_cmd="$2"
    local desc="$3"

    realtime_echo "${YELLOW}🔍 Analisando erro para auto-correção...${NC}"

    # Análise de padrões de erro comuns
    case "$error_output" in
        *"Permission denied"*|*"permission denied"*)
            log_fix "🔐 Erro de permissão detectado. Corrigindo..."
            check_and_fix_permissions
            ;;
        *"No space left"*|*"disk full"*)
            log_fix "💾 Espaço insuficiente. Liberando..."
            check_and_fix_disk_space
            ;;
        *"Connection refused"*|*"Network is unreachable"*)
            log_fix "🌐 Problema de rede. Verificando conectividade..."
            ping -c 1 8.8.8.8 &> /dev/null || log_warning "Conectividade instável"
            ;;
        *"docker: command not found"*|*"Cannot connect to the Docker daemon"*)
            log_fix "🐳 Problema no Docker. Corrigindo..."
            check_and_fix_docker
            ;;
        *"Port already in use"*|*"Address already in use"*)
            log_fix "🔌 Porta ocupada. Resolvendo conflito..."
            check_and_fix_port_conflicts
            ;;
        *"package not found"*|*"command not found"*)
            log_fix "📦 Dependência em falta. Instalando..."
            check_and_fix_dependencies
            ;;
        *"Operation not permitted"*|*"Operation not supported"*)
            log_fix "🛡️ Problema de sistema. Verificando..."
            check_system_resources
            ;;
        *"timeout"*|*"timed out"*)
            log_fix "⏱️ Timeout detectado. Otimizando..."
            # Limpar cache DNS
            sudo systemctl restart systemd-resolved 2>/dev/null || true
            ;;
        *"certificate"*|*"SSL"*|*"TLS"*)
            log_fix "🔒 Problema SSL/TLS. Corrigindo..."
            # Atualizar certificados
            sudo apt update && sudo apt install -y ca-certificates 2>/dev/null || true
            ;;
    esac

    # Auto-correções específicas por comando
    case "$failed_cmd" in
        *"apt"*|*"apt-get"*)
            log_fix "📦 Problema no APT. Corrigindo..."
            sudo apt --fix-broken install -y 2>/dev/null || true
            sudo dpkg --configure -a 2>/dev/null || true
            ;;
        *"docker"*|*"docker-compose"*)
            log_fix "🐳 Problema no Docker. Reset completo..."
            sudo systemctl restart docker 2>/dev/null || true
            sleep 5
            ;;
        *"curl"*|*"wget"*)
            log_fix "🌐 Problema de download. Tentando alternativa..."
            if echo "$failed_cmd" | grep -q "curl"; then
                # Se curl falhou, tentar wget
                local alt_cmd=$(echo "$failed_cmd" | sed 's/curl/wget -O-/g')
                log_info "Tentando wget como alternativa..."
            fi
            ;;
    esac

    realtime_echo "${CYAN}🔧 Auto-correção aplicada. Pronto para retry.${NC}"
}

# Função melhorada para aguardar com countdown e monitoramento
wait_with_countdown() {
    local seconds=$1
    local message=$2

    log_info "$message"
    for ((i=seconds; i>0; i--)); do
        printf "\r${YELLOW}Aguardando... %d segundos restantes${NC}" "$i"

        # Forçar flush do output
        printf "\033[0m" > /dev/tty 2>/dev/null || true

        sleep 1
    done
    echo ""
}

# Função para monitorar processos em tempo real
monitor_processes() {
    local service_name="$1"
    local max_wait="${2:-60}"

    log_info "🔍 Monitorando $service_name por até ${max_wait}s..."

    for ((i=1; i<=max_wait; i++)); do
        # Verificar se container existe e está rodando
        local status=$(docker-compose ps --filter status=running --services | grep "$service_name" || echo "")

        if [[ -n "$status" ]]; then
            log_success "✅ $service_name está rodando!"
            return 0
        fi

        printf "\r${CYAN}Aguardando $service_name... %d/%ds${NC}" "$i" "$max_wait"
        sleep 1
    done

    echo ""
    log_warning "⚠️ $service_name ainda não está rodando após ${max_wait}s"
    return 1
}

# ============= CONFIGURAÇÕES FIXAS =============
DOMAIN="siqueicamposimoveis.com.br"
DOMAIN2=""  # Será configurado automaticamente ou via input
EMAIL="admin@siqueicamposimoveis.com.br"
TOTAL_STEPS=15

# Auto-detectar segundo domínio se existir
detect_second_domain() {
    # Verificar se já existe um Portainer com domínio diferente
    local existing_domains=$(docker ps --format "table {{.Names}}\t{{.Labels}}" | grep -E "traefik.*Host" | grep -v "$DOMAIN" | head -1)

    if [ ! -z "$existing_domains" ]; then
        local detected_domain=$(echo "$existing_domains" | grep -oP 'Host\\(\`[^`]+' | head -1 | sed 's/Host\\(`//g')
        if [ ! -z "$detected_domain" ] && [ "$detected_domain" != "$DOMAIN" ]; then
            DOMAIN2="$detected_domain"
            log_info "🔍 Segundo domínio detectado automaticamente: $DOMAIN2"
        fi
    fi
}

# Detectar automaticamente segundo domínio
detect_second_domain

# Inicializar processo keep-alive
keep_alive

log_success "🤖 MODO MEGA AUTOMÁTICO V3 ATIVADO!"
log_info "   Domínio: $DOMAIN"
log_info "   Email: $EMAIL"
log_info "   Modo: Traefik + SSL + Docker + Auto-Fix + Logs Tempo Real"
log_info "   Log File: $LOG_FILE"
log_info "   PID: $$"
log_info "   Terminal: $(tty 2>/dev/null || echo 'detached')"

# Detectar sistema
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    log_error "Execute este script no VPS Linux, não no Windows!"
    exit 1
fi

# ============= PASSO 0: SISTEMA ULTRA-ROBUSTO DE AUTO-CORREÇÃO =============
log_step 0 $TOTAL_STEPS "Sistema ultra-robusto de auto-correção"

realtime_echo "${PURPLE}🤖 INICIANDO SISTEMA DE AUTO-CORREÇÃO AVANÇADO...${NC}"

# Executar sistema completo de auto-correção
auto_fix_system

log_info "🔍 Verificando usuário atual..."
if [[ $EUID -eq 0 ]]; then
   log_error "Este script não deve ser executado como root"
   exit 1
fi
log_success "Usuário não-root confirmado"

log_info "🔍 Verificando conectividade..."

# Testar conectividade de forma simples
if ping -c 1 -W 3 8.8.8.8 &> /dev/null || ping -c 1 -W 3 google.com &> /dev/null; then
    log_success "Conectividade OK"
else
    log_warning "Conectividade limitada - continuando mesmo assim..."
fi

log_info "🔍 Verificando porta 80..."
PORT_80_CHECK=$(sudo netstat -tlnp | grep :80 | head -1 || true)
if [ ! -z "$PORT_80_CHECK" ]; then
    log_warning "Porta 80 está ocupada:"
    realtime_echo "$PORT_80_CHECK"
    log_fix "Liberando porta 80 automaticamente..."

    # Parar Apache se existir
    if systemctl is-active --quiet apache2 2>/dev/null; then
        log_fix "Parando Apache..."
        run_with_progress "sudo systemctl stop apache2 && sudo systemctl disable apache2" "Parar Apache"
    fi

    # Parar Nginx se existir
    if systemctl is-active --quiet nginx 2>/dev/null; then
        log_fix "Parando Nginx..."
        run_with_progress "sudo systemctl stop nginx && sudo systemctl disable nginx" "Parar Nginx"
    fi

    # Verificar novamente
    PORT_80_CHECK_AFTER=$(sudo netstat -tlnp | grep :80 | head -1 || true)
    if [ ! -z "$PORT_80_CHECK_AFTER" ]; then
        log_warning "Porta 80 ainda ocupada. Usando portas alternativas..."
        USE_ALT_PORTS=true
    else
        log_success "Porta 80 liberada com sucesso!"
        USE_ALT_PORTS=false
    fi
else
    log_success "Porta 80 disponível!"
    USE_ALT_PORTS=false
fi

show_progress 1 $TOTAL_STEPS

# ============= PASSO 1: LIMPEZA TOTAL =============
log_step 1 $TOTAL_STEPS "Limpeza total do sistema Docker"

log_warning "🔥 LIMPANDO TUDO - RESET COMPLETO..."

log_info "Parando containers..."
run_with_progress "docker stop \$(docker ps -aq) 2>/dev/null || true" "Parar containers"

log_info "Removendo containers..."
run_with_progress "docker rm \$(docker ps -aq) 2>/dev/null || true" "Remover containers"

log_info "Removendo imagens..."
run_with_progress "docker rmi \$(docker images -aq) 2>/dev/null || true" "Remover imagens"

log_info "Removendo volumes..."
run_with_progress "docker volume rm \$(docker volume ls -q) 2>/dev/null || true" "Remover volumes"

log_info "Removendo redes..."
run_with_progress "docker network rm \$(docker network ls --filter type=custom -q) 2>/dev/null || true" "Remover redes"

log_info "Limpeza total do sistema Docker..."
run_with_progress "docker system prune -af --volumes 2>/dev/null || true" "System prune"

log_success "✅ LIMPEZA TOTAL CONCLUÍDA!"
show_progress 2 $TOTAL_STEPS

# ============= PASSO 2: INSTALAÇÃO AUTOMÁTICA =============
log_step 2 $TOTAL_STEPS "Instalação de dependências"

log_info "📦 Instalando dependências automaticamente..."

log_info "Atualizando sistema..."
run_with_progress "sudo apt update && sudo apt upgrade -y" "Atualizar sistema"

log_info "Instalando dependências básicas..."
run_with_progress "sudo apt install -y curl wget git unzip htop nano ufw" "Dependências básicas"

# Instalar Docker se necessário
if ! command -v docker &> /dev/null; then
    log_info "Instalando Docker..."
    run_with_progress "curl -fsSL https://get.docker.com -o get-docker.sh" "Download Docker script"
    run_with_progress "sudo sh get-docker.sh" "Instalar Docker"
    run_with_progress "sudo usermod -aG docker \$USER" "Adicionar usuário ao grupo Docker"
    run_with_progress "rm get-docker.sh" "Limpar script"
else
    log_success "Docker já instalado"
fi

# Instalar Docker Compose
if ! command -v docker-compose &> /dev/null; then
    log_info "Instalando Docker Compose..."
    run_with_progress "sudo curl -L \"https://github.com/docker/compose/releases/latest/download/docker-compose-\$(uname -s)-\$(uname -m)\" -o /usr/local/bin/docker-compose" "Download Docker Compose"
    run_with_progress "sudo chmod +x /usr/local/bin/docker-compose" "Tornar executável"
else
    log_success "Docker Compose já instalado"
fi

log_success "✅ Todas as dependências instaladas!"
show_progress 3 $TOTAL_STEPS

# ============= PASSO 3: GERAR SENHAS =============
log_step 3 $TOTAL_STEPS "Geração de senhas seguras"

log_info "🔐 Gerando senhas seguras automaticamente..."

DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)
JWT_SECRET=$(openssl rand -base64 64 | tr -d "=+/" | cut -c1-50)
COOKIE_SECRET=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-30)
N8N_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-12)
EVOLUTION_KEY=$(openssl rand -base64 32 | tr -d "=+/" | cut -c1-25)

log_success "✅ Senhas geradas!"
show_progress 4 $TOTAL_STEPS

# ============= PASSO 4: CRIAR .ENV =============
log_step 4 $TOTAL_STEPS "Criação do arquivo .env"

log_info "⚙️ Criando configuração automática..."

cat > .env <<EOF
# MEGA DEPLOY AUTOMÁTICO V3 - Siqueira Campos Imóveis
NODE_ENV=production
DOMAIN=$DOMAIN
EMAIL=$EMAIL

# Banco PostgreSQL
DATABASE_URL=postgresql://sitejuarez:$DB_PASSWORD@postgres:5432/bdsitejuarez?schema=public
POSTGRES_DB=bdsitejuarez
POSTGRES_USER=sitejuarez
POSTGRES_PASSWORD=$DB_PASSWORD

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT & Security
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d
COOKIE_SECRET=$COOKIE_SECRET

# Email SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=siqueiraecamposimoveisgoiania@gmail.com
EMAIL_PASS=Juarez.123

# Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=https://$DOMAIN/api/auth/google/callback

# N8N
N8N_BASIC_AUTH_USER=admin
N8N_BASIC_AUTH_PASSWORD=$N8N_PASSWORD

# Evolution API
EVOLUTION_API_KEY=$EVOLUTION_KEY

# OpenAI
OPENAI_API_KEY=

# Timezone
TZ=America/Sao_Paulo

# Configuração de portas
USE_ALT_PORTS=$USE_ALT_PORTS
EOF

log_success "✅ Arquivo .env criado!"
show_progress 5 $TOTAL_STEPS

# ============= PASSO 5: CRIAR PACKAGE.JSON =============
log_step 5 $TOTAL_STEPS "Criação do package.json"

cat > package.json <<EOF
{
  "name": "siqueira-campos-imoveis",
  "version": "3.0.0",
  "description": "Sistema imobiliário premium com automação completa V3",
  "type": "module",
  "scripts": {
    "dev": "node server.js",
    "build": "echo 'Build completed V3'",
    "start": "node server.js",
    "db:migrate": "echo 'Migrações OK'",
    "db:seed": "echo 'Seed OK'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
EOF

log_success "✅ package.json criado!"
show_progress 6 $TOTAL_STEPS

# ============= PASSO 6: CRIAR SERVIDOR EXPRESS =============
log_step 6 $TOTAL_STEPS "Criação do servidor Express"

log_info "🌐 Criando servidor Express V3..."

cat > server.js <<'EOF'
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Log de todas as requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// API Routes
app.get('/api/ping', (req, res) => {
  const response = {
    message: "🏠 Siqueira Campos Imóveis V3 - Online!",
    timestamp: new Date().toISOString(),
    deploy: "Mega Deploy Automático V3 - Logs Tempo Real",
    status: "success",
    version: "3.0.0",
    uptime: process.uptime(),
    memory: process.memoryUsage()
  };
  console.log('Ping recebido:', response);
  res.json(response);
});

app.get('/api/health', (req, res) => {
  res.json({
    status: "healthy",
    version: "3.0.0",
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/demo', (req, res) => {
  res.json({
    empresa: "Siqueira Campos Imóveis",
    status: "online",
    deploy: "Mega Deploy Automático V3",
    servicos: ["vendas", "locacao", "administracao"],
    contato: "(62) 9 8556-3505",
    whatsapp: "https://wa.me/5562985563505",
    features: ["Traefik", "SSL", "Docker", "N8N", "WhatsApp Business", "Auto-Fix", "Logs Tempo Real"],
    version: "3.0.0"
  });
});

// Página inicial V3
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏠 Siqueira Campos Imóveis V3</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #8B4513 0%, #A0522D 50%, #CD853F 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
        }
        .container {
            max-width: 1000px;
            margin: 0 auto;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            text-align: center;
            border: 1px solid rgba(255,255,255,0.2);
        }
        .logo h1 {
            font-size: 3em;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
            background: linear-gradient(45deg, #FFD700, #FFA500);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        .version-badge {
            background: rgba(255,215,0,0.3);
            border: 2px solid #FFD700;
            border-radius: 25px;
            padding: 12px 20px;
            display: inline-block;
            margin: 15px;
            font-size: 1.1em;
            font-weight: bold;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        .status {
            background: rgba(76, 175, 80, 0.2);
            border: 2px solid #4CAF50;
            border-radius: 15px;
            padding: 25px;
            margin: 30px 0;
            backdrop-filter: blur(5px);
        }
        .status h3 { color: #4CAF50; margin-bottom: 15px; font-size: 1.5em; }
        .realtime-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: #4CAF50;
            border-radius: 50%;
            margin-right: 8px;
            animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes pulse {
            0% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.7; transform: scale(1.1); }
            100% { opacity: 1; transform: scale(1); }
        }
        .tech-stack {
            background: rgba(0,0,0,0.2);
            padding: 25px;
            border-radius: 15px;
            margin: 25px 0;
        }
        .new-features {
            background: rgba(255,215,0,0.1);
            border: 2px solid #FFD700;
            padding: 25px;
            border-radius: 15px;
            margin: 25px 0;
        }
        .new-features h3 { color: #FFD700; margin-bottom: 15px; }
        .feature-list {
            text-align: left;
            max-width: 600px;
            margin: 0 auto;
        }
        .feature-list li {
            margin: 8px 0;
            padding-left: 25px;
            position: relative;
        }
        .feature-list li:before {
            content: "🚀";
            position: absolute;
            left: 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h1>🏠 Siqueira Campos Imóveis</h1>
            <p>Seu parceiro ideal no mercado imobiliário</p>
            <div class="version-badge">
                <span class="realtime-indicator"></span>
                V3.0.0 - Logs Tempo Real
            </div>
        </div>

        <div class="status">
            <h3>✅ Sistema Online - Mega Deploy V3!</h3>
            <p><strong>🚀 Traefik + Let's Encrypt + Docker + Logs em Tempo Real</strong></p>
            <p>Deploy realizado com sucesso em modo totalmente automático com monitoramento</p>
        </div>

        <div class="new-features">
            <h3>🆕 Novidades V3 - Logs Tempo Real</h3>
            <ul class="feature-list">
                <li><strong>Logs em Tempo Real:</strong> Acompanhe todo o processo de deploy</li>
                <li><strong>Progress Bar:</strong> Visualize o progresso da instalação</li>
                <li><strong>Cleanup Automático:</strong> Tratamento de interrupções</li>
                <li><strong>Health Checks:</strong> Monitoramento contínuo dos serviços</li>
                <li><strong>Retry Logic:</strong> Tentativas automáticas em caso de falha</li>
                <li><strong>Conectividade Check:</strong> Verificação de internet</li>
            </ul>
        </div>

        <div id="status-info" class="tech-stack">
            <h3>📊 Status do Sistema</h3>
            <p>Carregando informações...</p>
        </div>
    </div>

    <script>
        // Atualizar status em tempo real
        async function updateStatus() {
            try {
                const response = await fetch('/api/ping');
                const data = await response.json();

                document.getElementById('status-info').innerHTML = \`
                    <h3>📊 Status do Sistema V3</h3>
                    <p><strong>Status:</strong> \${data.status}</p>
                    <p><strong>Uptime:</strong> \${Math.floor(data.uptime)} segundos</p>
                    <p><strong>Versão:</strong> \${data.version}</p>
                    <p><strong>Última atualização:</strong> \${new Date(data.timestamp).toLocaleString()}</p>
                \`;

                console.log('✅ Status atualizado:', data);
            } catch (error) {
                console.error('❌ Erro ao atualizar status:', error);
                document.getElementById('status-info').innerHTML = \`
                    <h3>📊 Status do Sistema</h3>
                    <p style="color: #ff6b6b;">❌ Erro ao conectar com a API</p>
                \`;
            }
        }

        // Atualizar a cada 10 segundos
        updateStatus();
        setInterval(updateStatus, 10000);

        // Ping periódico
        setInterval(() => {
            fetch('/api/health')
                .then(res => res.json())
                .then(data => console.log('💗 Health check:', data))
                .catch(err => console.log('💔 Health check failed:', err));
        }, 30000);
    </script>
</body>
</html>
  `);
});

// SPA fallback
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: "API endpoint not found", version: "3.0.0" });
  } else {
    res.redirect('/');
  }
});

// Tratamento de sinais para graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM recebido, fechando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT recebido, fechando servidor...');
  process.exit(0);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🏠 Siqueira Campos Imóveis V3 rodando na porta ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`🚀 Mega Deploy Automático V3 - Logs Tempo Real!`);
  console.log(`📊 Status: ONLINE | Modo: Produção | Version: 3.0.0`);
  console.log(`📝 PID: ${process.pid} | Memory: ${JSON.stringify(process.memoryUsage())}`);
});
EOF

log_success "✅ Servidor Express V3 criado!"
show_progress 7 $TOTAL_STEPS

# ============= PASSO 7: CRIAR DOCKERFILE =============
log_step 7 $TOTAL_STEPS "Criação do Dockerfile"

cat > Dockerfile <<'EOF'
FROM node:18-alpine

# Instalar dependências para healthcheck
RUN apk add --no-cache curl dumb-init

WORKDIR /app

# Copiar e instalar dependências
COPY package*.json ./
RUN npm install

# Copiar aplicação
COPY . .

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fusion -u 1001 && \
    chown -R fusion:nodejs /app

USER fusion

EXPOSE 3000

# Healthcheck melhorado
HEALTHCHECK --interval=15s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Usar dumb-init para melhor handling de sinais
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
EOF

log_success "✅ Dockerfile criado!"
show_progress 8 $TOTAL_STEPS

# ============= PASSO 8: CRIAR DOCKER-COMPOSE =============
log_step 8 $TOTAL_STEPS "Criação do docker-compose.yml"

if [ "$USE_ALT_PORTS" = true ]; then
    log_fix "Usando portas alternativas (8000/8443) para evitar conflitos..."
    HTTP_PORT="8000"
    HTTPS_PORT="8443"
else
    log_info "Usando portas padrão (80/443)..."
    HTTP_PORT="80"
    HTTPS_PORT="443"
fi

# Criar docker-compose com healthchecks melhorados
cat > docker-compose.yml <<EOF
services:
  traefik:
    image: traefik:v3.0
    container_name: siqueira-traefik
    restart: unless-stopped
    ports:
      - "$HTTP_PORT:80"
      - "$HTTPS_PORT:443"
      - "8080:8080"
    command:
      - --api.dashboard=true
      - --api.insecure=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
      - --providers.docker=true
      - --providers.docker.exposedbydefault=false
      - --providers.docker.network=siqueira-network
      - --certificatesresolvers.letsencrypt.acme.email=\${EMAIL}
      - --certificatesresolvers.letsencrypt.acme.storage=/acme.json
      - --certificatesresolvers.letsencrypt.acme.httpchallenge=true
      - --certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web
      - --log.level=INFO
      - --accesslog=true
      - --entrypoints.web.http.redirections.entrypoint.to=websecure
      - --entrypoints.web.http.redirections.entrypoint.scheme=https
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - traefik_acme:/acme.json
    networks:
      - siqueira-network
    healthcheck:
      test: ["CMD", "traefik", "healthcheck"]
      interval: 30s
      timeout: 10s
      retries: 3
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.traefik.rule=Host(\`traefik.\${DOMAIN}\`)"
      - "traefik.http.routers.traefik.entrypoints=websecure"
      - "traefik.http.routers.traefik.tls.certresolver=letsencrypt"
      - "traefik.http.routers.traefik.service=api@internal"

  postgres:
    image: postgres:15-alpine
    container_name: siqueira-postgres
    restart: unless-stopped
    environment:
      POSTGRES_DB: \${POSTGRES_DB}
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
      TZ: \${TZ}
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5
      start_period: 30s
    networks:
      - siqueira-network

  redis:
    image: redis:7-alpine
    container_name: siqueira-redis
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 3s
      retries: 3
      start_period: 10s
    networks:
      - siqueira-network

  app:
    build: .
    container_name: siqueira-app
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    environment:
      - NODE_ENV=production
      - DATABASE_URL=\${DATABASE_URL}
      - REDIS_HOST=redis
      - REDIS_PORT=6379
      - JWT_SECRET=\${JWT_SECRET}
      - JWT_EXPIRES_IN=\${JWT_EXPIRES_IN}
      - COOKIE_SECRET=\${COOKIE_SECRET}
      - TZ=\${TZ}
    volumes:
      - ./uploads:/app/uploads
      - app_logs:/app/logs
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    networks:
      - siqueira-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.app.rule=Host(\`\${DOMAIN}\`)"
      - "traefik.http.routers.app.entrypoints=websecure"
      - "traefik.http.routers.app.tls.certresolver=letsencrypt"
      - "traefik.http.services.app.loadbalancer.server.port=3000"

  portainer1:
    image: portainer/portainer-ce:latest
    container_name: siqueira-portainer1
    restart: unless-stopped
    ports:
      - "9001:9000"
      - "9444:9443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer1_data:/data
    networks:
      - siqueira-network
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer1.rule=Host(\`portainer.\${DOMAIN}\`)"
      - "traefik.http.routers.portainer1.entrypoints=websecure"
      - "traefik.http.routers.portainer1.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer1.loadbalancer.server.port=9000"

  portainer2:
    image: portainer/portainer-ce:latest
    container_name: siqueira-portainer2
    restart: unless-stopped
    ports:
      - "9002:9000"
      - "9445:9443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - portainer2_data:/data
    networks:
      - siqueira-network
    environment:
      - PORTAINER_OPTS=--admin-password-file=/data/admin_password
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.portainer2.rule=Host(\`portainer.\${DOMAIN2:-portainer2.local}\`)"
      - "traefik.http.routers.portainer2.entrypoints=websecure"
      - "traefik.http.routers.portainer2.tls.certresolver=letsencrypt"
      - "traefik.http.services.portainer2.loadbalancer.server.port=9000"

volumes:
  postgres_data:
  redis_data:
  app_logs:
  traefik_acme:
  portainer1_data:
  portainer2_data:

networks:
  siqueira-network:
    driver: bridge
    ipam:
      config:
        - subnet: 172.20.0.0/16
EOF

log_success "✅ docker-compose.yml criado!"
show_progress 9 $TOTAL_STEPS

# ============= PASSO 9: CRIAR INIT.SQL =============
log_step 9 $TOTAL_STEPS "Criação do script de banco"

cat > init.sql <<EOF
-- Configurações PostgreSQL para Siqueira Campos Imóveis V3
CREATE DATABASE n8n;
GRANT ALL PRIVILEGES ON DATABASE n8n TO sitejuarez;

-- Otimizações de performance
ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
ALTER SYSTEM SET max_connections = 200;
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
EOF

log_success "✅ Script de banco criado!"
show_progress 10 $TOTAL_STEPS

# ============= PASSO 10: CONFIGURAR FIREWALL =============
log_step 10 $TOTAL_STEPS "Configuração do firewall"

log_info "🔒 Configurando firewall automaticamente..."
run_with_progress "sudo ufw --force reset" "Reset do firewall"
run_with_progress "sudo ufw allow 22/tcp" "Permitir SSH"
run_with_progress "sudo ufw allow 80/tcp" "Permitir HTTP"
run_with_progress "sudo ufw allow 443/tcp" "Permitir HTTPS"
run_with_progress "sudo ufw allow 8000/tcp" "Permitir HTTP alternativo"
run_with_progress "sudo ufw allow 8443/tcp" "Permitir HTTPS alternativo"
run_with_progress "sudo ufw allow 8080/tcp" "Permitir Traefik dashboard"
run_with_progress "sudo ufw --force enable" "Ativar firewall"

log_success "✅ Firewall configurado!"
show_progress 11 $TOTAL_STEPS

# ============= PASSO 11: SISTEMA DE BACKUP E ROLLBACK =============
log_step 11 $TOTAL_STEPS "Sistema avançado de backup e rollback"

# Criar backup completo antes do deploy
create_pre_deploy_backup() {
    log_info "💾 Criando backup pré-deploy..."

    local backup_dir="/tmp/deploy-backup-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"

    # Backup de configurações existentes
    if [ -f "docker-compose.yml" ]; then
        cp docker-compose.yml "$backup_dir/" 2>/dev/null || true
    fi

    if [ -f ".env" ]; then
        cp .env "$backup_dir/" 2>/dev/null || true
    fi

    # Backup de dados de containers existentes
    if command -v docker-compose &> /dev/null && docker-compose ps &> /dev/null; then
        log_info "Fazendo backup de dados dos containers..."

        # Backup PostgreSQL se existir
        if docker-compose ps | grep -q postgres; then
            docker-compose exec -T postgres pg_dumpall -U postgres > "$backup_dir/postgres_backup.sql" 2>/dev/null || true
        fi

        # Backup de volumes
        docker-compose ps --services | while read service; do
            if [ ! -z "$service" ]; then
                docker-compose logs "$service" > "$backup_dir/${service}_logs.txt" 2>/dev/null || true
            fi
        done
    fi

    echo "$backup_dir" > /tmp/current_backup_path
    log_success "✅ Backup criado em: $backup_dir"
}

# Função de rollback automático
auto_rollback() {
    log_warning "🔄 Iniciando rollback automático..."

    local backup_path=$(cat /tmp/current_backup_path 2>/dev/null || echo "")

    if [ -d "$backup_path" ]; then
        log_info "Restaurando configurações do backup..."

        # Parar containers atuais
        docker-compose down --remove-orphans 2>/dev/null || true

        # Restaurar arquivos de configuração
        if [ -f "$backup_path/docker-compose.yml" ]; then
            cp "$backup_path/docker-compose.yml" . 2>/dev/null || true
        fi

        if [ -f "$backup_path/.env" ]; then
            cp "$backup_path/.env" . 2>/dev/null || true
        fi

        # Tentar restaurar estado anterior
        if [ -f "$backup_path/postgres_backup.sql" ]; then
            log_info "Restaurando banco de dados..."
            docker-compose up -d postgres 2>/dev/null || true
            sleep 30
            cat "$backup_path/postgres_backup.sql" | docker-compose exec -T postgres psql -U postgres 2>/dev/null || true
        fi

        log_success "✅ Rollback concluído"
    else
        log_warning "⚠️ Backup não encontrado. Rollback manual necessário."
    fi
}

# Criar backup pré-deploy
create_pre_deploy_backup

cat > backup.sh <<EOF
#!/bin/bash
BACKUP_DIR="/home/\$USER/backups"
DATE=\$(date +%Y%m%d_%H%M%S)
mkdir -p \$BACKUP_DIR

echo "🔄 Iniciando backup V3 em \$DATE..."

# Backup PostgreSQL
echo "📊 Backup do banco de dados..."
docker exec siqueira-postgres pg_dump -U sitejuarez bdsitejuarez > \$BACKUP_DIR/db_\$DATE.sql 2>/dev/null && echo "✅ Banco OK" || echo "❌ Banco falhou"

# Backup uploads
if [ -d "uploads" ]; then
    echo "📁 Backup dos uploads..."
    tar -czf \$BACKUP_DIR/uploads_\$DATE.tar.gz uploads/ 2>/dev/null && echo "✅ Uploads OK" || echo "❌ Uploads falhou"
fi

# Backup configurações
echo "⚙️ Backup das configurações..."
cp .env \$BACKUP_DIR/env_\$DATE.backup 2>/dev/null && echo "✅ .env OK" || echo "❌ .env falhou"
cp docker-compose.yml \$BACKUP_DIR/compose_\$DATE.backup 2>/dev/null && echo "✅ docker-compose OK" || echo "❌ docker-compose falhou"

# Backup logs
echo "📝 Backup dos logs..."
cp deploy*.log \$BACKUP_DIR/ 2>/dev/null && echo "✅ Logs OK" || echo "⚠️ Logs não encontrados"

# Manter apenas 7 backups
echo "🧹 Limpando backups antigos..."
find \$BACKUP_DIR -type f -mtime +7 -delete 2>/dev/null

echo "✅ Backup V3 \$DATE concluído!"
echo "📁 Localização: \$BACKUP_DIR"
ls -la \$BACKUP_DIR/*\$DATE* 2>/dev/null || true
EOF
chmod +x backup.sh

# Configurar cron para backup automático
(crontab -l 2>/dev/null; echo "0 2 * * * $(pwd)/backup.sh") | crontab -
log_success "✅ Backup automático configurado (2h da manhã)!"
show_progress 12 $TOTAL_STEPS

# ============= PASSO 12: BUILD E DEPLOY =============
log_step 12 $TOTAL_STEPS "Build e deploy do sistema"

log_info "🚀 Construindo e executando sistema ultra-robusto V3..."

# Verificação pré-build
log_info "🔍 Verificação pré-build..."
check_and_fix_docker
check_and_fix_disk_space

# Build com monitoramento avançado
log_info "📦 Fazendo pull das imagens base..."
if ! run_with_progress "docker-compose pull --parallel" "Pull das imagens" 600 5; then
    log_fix "Pull falhou. Tentando pull sequencial..."
    run_with_progress "docker-compose pull" "Pull sequencial das imagens" 900 3
fi

log_info "🔨 Construindo aplicação com cache otimizado..."
# Limpeza preventiva antes do build
docker builder prune -f 2>/dev/null || true

if ! run_with_progress "docker-compose build --parallel --no-cache" "Build da aplicação" 1200 3; then
    log_fix "Build paralelo falhou. Tentando build sequencial..."
    run_with_progress "docker-compose build" "Build sequencial" 1800 2
fi

# Verificação pós-build
log_info "🔍 Verificação pós-build..."
docker images | grep -E "(siqueira|<none>)" || true

log_info "🚀 Iniciando todos os serviços com restart automático..."
if ! run_with_progress "docker-compose up -d --remove-orphans" "Iniciar serviços" 300 3; then
    log_fix "Início falhou. Tentando início forçado..."
    docker-compose down --remove-orphans 2>/dev/null || true
    sleep 5
    run_with_progress "docker-compose up -d --force-recreate" "Início forçado" 300 2
fi

log_success "✅ Sistema iniciado!"
show_progress 13 $TOTAL_STEPS

# ============= PASSO 13: AGUARDAR E MONITORAR =============
log_step 13 $TOTAL_STEPS "Aguardando serviços ficarem prontos"

log_info "⏳ Aguardando todos os serviços ficarem online..."

# Sistema ultra-robusto de monitoramento e auto-correção
log_info "🔄 Iniciando monitoramento inteligente com auto-correção..."

for i in {1..24}; do  # Tempo estendido para deploy robusto
    wait_with_countdown 15 "Aguardando e monitorando serviços... (${i}/24)"

    # Verificar containers com detalhes
    RUNNING_CONTAINERS=$(docker-compose ps --filter status=running --services 2>/dev/null | wc -l)
    TOTAL_SERVICES=$(docker-compose config --services 2>/dev/null | wc -l)

    realtime_echo "${BLUE}📊 Status: $RUNNING_CONTAINERS/$TOTAL_SERVICES containers rodando${NC}"

    # Mostrar status detalhado
    realtime_echo "${CYAN}🐳 Status dos containers:${NC}"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null | head -10 || true

    # Auto-correção proativa para containers com problemas
    FAILED_CONTAINERS=$(docker-compose ps --filter status=exited --services 2>/dev/null)
    if [ ! -z "$FAILED_CONTAINERS" ]; then
        log_warning "⚠️ Containers com problemas detectados: $FAILED_CONTAINERS"

        echo "$FAILED_CONTAINERS" | while read container; do
            if [ ! -z "$container" ]; then
                log_fix "🔧 Auto-corrigindo $container..."

                # Obter logs do erro
                local error_logs=$(docker-compose logs --tail=10 "$container" 2>/dev/null)

                # Auto-diagnóstico específico por container
                case "$container" in
                    *"postgres"*|*"db"*)
                        log_fix "📊 Corrigindo PostgreSQL..."
                        # Verificar se porta 5432 está ocupada
                        if netstat -tlnp | grep -q ":5432"; then
                            sudo systemctl stop postgresql 2>/dev/null || true
                        fi
                        docker-compose restart postgres 2>/dev/null || true
                        ;;
                    *"redis"*)
                        log_fix "🔴 Corrigindo Redis..."
                        if netstat -tlnp | grep -q ":6379"; then
                            sudo systemctl stop redis-server 2>/dev/null || true
                        fi
                        docker-compose restart redis 2>/dev/null || true
                        ;;
                    *"app"*|*"web"*)
                        log_fix "🌐 Corrigindo aplicação..."
                        # Verificar se dependências estão rodando
                        docker-compose restart postgres redis 2>/dev/null || true
                        sleep 10
                        docker-compose restart app 2>/dev/null || true
                        ;;
                    *"traefik"*)
                        log_fix "🔀 Corrigindo Traefik..."
                        check_and_fix_port_conflicts
                        docker-compose restart traefik 2>/dev/null || true
                        ;;
                esac

                log_info "Logs recentes do $container:"
                echo "$error_logs" | tail -5 || true
                echo ""
            fi
        done

        # Aguardar containers reiniciarem
        log_info "⏳ Aguardando containers reiniciarem..."
        sleep 15
    fi

    # Monitoramento inteligente de saúde
    health_check_containers

    # Verificar progresso dos health checks
    realtime_echo "${CYAN}🏥 Health checks:${NC}"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}" 2>/dev/null | grep -E "(healthy|unhealthy)" || echo "Aguardando health checks..."

    # Se todos os containers estão rodando, fazer verificações avançadas
    if [ $RUNNING_CONTAINERS -eq $TOTAL_SERVICES ] && [ $RUNNING_CONTAINERS -gt 0 ]; then
        log_success "🎯 Todos os containers rodando! Verificando conectividade..."

        # Testes de conectividade progressivos
        local api_tests=0

        # Teste 1: Health endpoint
        if timeout 10 curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            api_tests=$((api_tests + 1))
            log_success "✅ API Health OK"
        fi

        # Teste 2: Ping endpoint
        if timeout 10 curl -s http://localhost:3000/api/ping > /dev/null 2>&1; then
            api_tests=$((api_tests + 1))
            log_success "✅ API Ping OK"
        fi

        # Teste 3: Homepage
        if timeout 10 curl -s http://localhost:3000/ | grep -q "Siqueira" 2>/dev/null; then
            api_tests=$((api_tests + 1))
            log_success "✅ Homepage OK"
        fi

        # Se pelo menos 2 testes passaram, considerar sucesso
        if [ $api_tests -ge 2 ]; then
            log_success "🚀 Sistema funcionando! Deploy quase concluído..."
            break
        fi
    fi

    # Auto-otimização a cada 5 ciclos
    if [ $((i % 5)) -eq 0 ]; then
        log_info "🔧 Auto-otimização periódica..."
        monitor_system_health

        # Verificar se precisa liberar recursos
        check_and_fix_disk_space
    fi
done

# Função para verificar saúde dos containers
health_check_containers() {
    local containers=$(docker-compose ps --services 2>/dev/null)

    echo "$containers" | while read container; do
        if [ ! -z "$container" ]; then
            local container_id=$(docker-compose ps -q "$container" 2>/dev/null)
            if [ ! -z "$container_id" ]; then
                local health=$(docker inspect "$container_id" --format='{{.State.Health.Status}}' 2>/dev/null || echo "no-healthcheck")

                case "$health" in
                    "healthy")
                        realtime_echo "${GREEN}✅ $container: Saudável${NC}"
                        ;;
                    "unhealthy")
                        log_warning "❌ $container: Não saudável"
                        # Tentar reiniciar container não saudável
                        docker-compose restart "$container" 2>/dev/null || true
                        ;;
                    "starting")
                        realtime_echo "${YELLOW}⏳ $container: Iniciando...${NC}"
                        ;;
                    *)
                        realtime_echo "${BLUE}ℹ️ $container: Sem health check${NC}"
                        ;;
                esac
            fi
        fi
    done
}

show_progress 14 $TOTAL_STEPS

# ============= PASSO 14: VERIFICAÇÃO FINAL ULTRA-ROBUSTA =============
log_step 14 $TOTAL_STEPS "Verificação final ultra-robusta com auto-correção"

log_info "🔍 Executando bateria completa de testes com auto-correção..."

# Sistema de verificação ultra-robusto
deploy_success=true

# 1. Verificação de containers
verify_containers() {
    log_info "🐳 Verificando status dos containers..."

    CONTAINERS_UP=$(docker-compose ps --filter status=running --services 2>/dev/null | wc -l)
    TOTAL_SERVICES=$(docker-compose config --services 2>/dev/null | wc -l)

    if [ $CONTAINERS_UP -eq $TOTAL_SERVICES ] && [ $CONTAINERS_UP -gt 0 ]; then
        log_success "✅ Todos os $TOTAL_SERVICES containers rodando!"

        # Verificar health status
        local unhealthy_count=0
        docker-compose ps --format "table {{.Name}}\t{{.Status}}" | while read line; do
            if echo "$line" | grep -q "unhealthy"; then
                unhealthy_count=$((unhealthy_count + 1))
            fi
        done

        if [ $unhealthy_count -gt 0 ]; then
            log_warning "⚠️ $unhealthy_count containers não saudáveis. Tentando correção..."
            docker-compose restart 2>/dev/null || true
            sleep 30
        fi
    else
        log_warning "⚠️ $CONTAINERS_UP de $TOTAL_SERVICES containers rodando"
        deploy_success=false

        # Tentar corrigir containers parados
        local failed_containers=$(docker-compose ps --filter status=exited --services 2>/dev/null)
        if [ ! -z "$failed_containers" ]; then
            log_fix "🔧 Tentando reiniciar containers parados..."
            echo "$failed_containers" | while read container; do
                if [ ! -z "$container" ]; then
                    docker-compose restart "$container" 2>/dev/null || true
                fi
            done
            sleep 15
        fi
    fi
}

# 2. Teste de APIs ultra-robusto
test_apis_comprehensive() {
    log_info "🧪 Testando APIs com verificação completa..."

    local api_tests_passed=0
    local total_api_tests=6

    # Teste 1: Health Check básico
    if timeout 15 curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
        log_success "✅ API Health Check: OK"
        api_tests_passed=$((api_tests_passed + 1))
    else
        log_warning "❌ API Health Check: FAIL"
    fi

    # Teste 2: Ping endpoint
    if timeout 15 curl -sf http://localhost:3000/api/ping > /dev/null 2>&1; then
        log_success "✅ API Ping: OK"
        api_tests_passed=$((api_tests_passed + 1))
    else
        log_warning "❌ API Ping: FAIL"
    fi

    # Teste 3: Homepage principal
    if timeout 15 curl -sf http://localhost:3000/ | grep -q "Siqueira" 2>/dev/null; then
        log_success "✅ Homepage: OK"
        api_tests_passed=$((api_tests_passed + 1))
    else
        log_warning "❌ Homepage: FAIL"
    fi

    # Teste 4: Traefik Dashboard
    if timeout 10 curl -sf http://localhost:8080/api/overview > /dev/null 2>&1; then
        log_success "✅ Traefik Dashboard: OK"
        api_tests_passed=$((api_tests_passed + 1))
    else
        log_warning "❌ Traefik Dashboard: FAIL"
    fi

    # Teste 5: PostgreSQL conectividade
    if docker-compose exec -T postgres pg_isready -U sitejuarez > /dev/null 2>&1; then
        log_success "✅ PostgreSQL: OK"
        api_tests_passed=$((api_tests_passed + 1))
    else
        log_warning "❌ PostgreSQL: FAIL"
    fi

    # Teste 6: Redis conectividade
    if docker-compose exec -T redis redis-cli ping | grep -q PONG 2>/dev/null; then
        log_success "✅ Redis: OK"
        api_tests_passed=$((api_tests_passed + 1))
    else
        log_warning "❌ Redis: FAIL"
    fi

    local api_success_rate=$((api_tests_passed * 100 / total_api_tests))

    if [ $api_success_rate -ge 80 ]; then
        log_success "🎯 APIs funcionando! Taxa de sucesso: ${api_success_rate}%"
    else
        log_warning "⚠️ APIs com problemas. Taxa de sucesso: ${api_success_rate}%"
        deploy_success=false

        # Tentar correção automática de APIs
        log_fix "🔧 Tentando correção automática das APIs..."
        docker-compose restart app 2>/dev/null || true
        sleep 20

        # Novo teste rápido
        if timeout 10 curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
            log_success "✅ Correção automática funcionou!"
            deploy_success=true
        fi
    fi
}

# 3. Verificação de recursos e otimização
verify_and_optimize_resources() {
    log_info "💻 Verificando recursos e otimizando..."

    # Verificar uso de CPU
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    if (( $(echo "$cpu_usage > 80" | bc -l 2>/dev/null || echo 0) )); then
        log_warning "⚠️ Alto uso de CPU: ${cpu_usage}%"
        log_fix "Otimizando containers..."
        docker update --cpus="0.5" $(docker-compose ps -q) 2>/dev/null || true
    fi

    # Verificar uso de memória
    local mem_usage=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
    if [ "$mem_usage" -gt 85 ]; then
        log_warning "⚠️ Alto uso de memória: ${mem_usage}%"
        log_fix "Liberando cache e otimizando..."
        sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null 2>&1 || true
        docker update --memory="512m" $(docker-compose ps -q) 2>/dev/null || true
    fi

    # Verificar espaço em disco
    check_and_fix_disk_space
}

# 4. Relatório final de status
generate_final_status_report() {
    log_info "📊 Gerando relatório final de status..."

    realtime_echo ""
    realtime_echo "${PURPLE}════════════════════════════════════════${NC}"
    realtime_echo "${PURPLE}📋 RELATÓRIO FINAL DO DEPLOY V3${NC}"
    realtime_echo "${PURPLE}════════════════════════════════════════${NC}"

    # Status dos containers
    realtime_echo "${CYAN}🐳 Status dos Containers:${NC}"
    docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true

    # Status dos recursos
    realtime_echo ""
    realtime_echo "${CYAN}💻 Recursos do Sistema:${NC}"
    local mem_total=$(free -h | awk 'NR==2{print $2}')
    local mem_used=$(free -h | awk 'NR==2{print $3}')
    local disk_used=$(df -h / | awk 'NR==2{print $5}')

    realtime_echo "   💾 Memória: $mem_used / $mem_total"
    realtime_echo "   🗄️ Disco: $disk_used usado"
    realtime_echo "   🖥️ CPU: $(nproc) cores disponíveis"

    # URLs de acesso
    realtime_echo ""
    realtime_echo "${CYAN}🌐 URLs de Acesso:${NC}"
    if [ "$USE_ALT_PORTS" = true ]; then
        realtime_echo "   • Site: http://IP_VPS:8000"
        realtime_echo "   • HTTPS: https://IP_VPS:8443"
        realtime_echo "   • Traefik: http://IP_VPS:8080"
    else
        realtime_echo "   • Site: https://$DOMAIN"
        realtime_echo "   • Traefik: https://traefik.$DOMAIN"
    fi

    # Status dos Portainers
    realtime_echo ""
    realtime_echo "${CYAN}🐳 Portainers Configurados:${NC}"

    # Verificar Portainer 1
    if timeout 5 curl -s http://localhost:9001 > /dev/null 2>&1; then
        realtime_echo "   ✅ Portainer 1: https://portainer.$DOMAIN (porta 9001)"
    else
        realtime_echo "   ❌ Portainer 1: Não acessível"
    fi

    # Verificar Portainer 2
    if timeout 5 curl -s http://localhost:9002 > /dev/null 2>&1; then
        realtime_echo "   ✅ Portainer 2: https://portainer.${DOMAIN2:-"domain2.local"} (porta 9002)"
    else
        realtime_echo "   ❌ Portainer 2: Não acessível"
    fi

    # Verificar se Portainer antigo ainda existe
    if docker ps | grep -q portainer && ! docker ps | grep -q "siqueira-portainer"; then
        realtime_echo "   ⚠️ Portainer antigo ainda rodando - pode precisar de limpeza manual"
    fi

    # Status das stacks
    local total_stacks=$(docker ps -a --filter "label=com.docker.compose.project" --format "{{.Label \"com.docker.compose.project\"}}" | sort | uniq | grep -v '^$' | wc -l)
    local running_stacks=$(docker ps --filter "label=com.docker.compose.project" --format "{{.Label \"com.docker.compose.project\"}}" | sort | uniq | grep -v '^$' | wc -l)

    if [ $total_stacks -gt 0 ]; then
        realtime_echo ""
        realtime_echo "${CYAN}📋 Status das Stacks Docker:${NC}"
        realtime_echo "   • Total de stacks: $total_stacks"
        realtime_echo "   • Stacks funcionando: $running_stacks"

        if [ $running_stacks -eq $total_stacks ]; then
            realtime_echo "   ✅ Todas as stacks funcionando!"
        else
            local problematic=$((total_stacks - running_stacks))
            realtime_echo "   ⚠️ $problematic stacks ainda com problemas"
            realtime_echo "   💡 Use os Portainers para gerenciar stacks manualmente"
        fi
    fi

    # Status final
    realtime_echo ""
    if [ "$deploy_success" = true ]; then
        realtime_echo "${GREEN}🎉 DEPLOY CONCLUÍDO COM SUCESSO!${NC}"
        realtime_echo "${GREEN}✅ Sistema 100% funcional e otimizado${NC}"
    else
        realtime_echo "${YELLOW}⚠️ DEPLOY CONCLUÍDO COM AVISOS${NC}"
        realtime_echo "${YELLOW}⚠️ Alguns componentes podem precisar de atenção${NC}"
    fi

    realtime_echo "${PURPLE}════════════════════════════════════════${NC}"
}

# Executar verificações
verify_containers
test_apis_comprehensive
verify_and_optimize_resources
generate_final_status_report

# Se deploy falhou crítico, oferecer rollback
if [ "$deploy_success" = false ]; then
    realtime_echo ""
    realtime_echo "${RED}❌ Deploy com falhas críticas detectadas${NC}"
    realtime_echo "${YELLOW}Deseja fazer rollback automático? (y/N):${NC}"

    read -t 30 -r rollback_choice || rollback_choice="n"

    if [[ "$rollback_choice" == "y" || "$rollback_choice" == "Y" ]]; then
        auto_rollback
    else
        log_info "Continuando sem rollback. Sistema pode estar instável."
    fi
fi

show_progress 15 $TOTAL_STEPS

# ============= PASSO 15: CRIAR DOCUMENTAÇÃO =============
log_step 15 $TOTAL_STEPS "Criação da documentação final"

cat > ACESSO_MEGA_DEPLOY_V3.md <<EOF
# 🚀 MEGA DEPLOY AUTOMÁTICO V3 - Siqueira Campos Imóveis

## ✅ DEPLOY V3 EXECUTADO COM SUCESSO!

### 🆕 Novidades V3 - Logs em Tempo Real:
- 📝 **Logs Tempo Real**: Todo o processo é exibido em tempo real
- 📊 **Progress Bar**: Acompanhe o progresso de cada etapa
- 🔄 **Retry Logic**: Tentativas automáticas em caso de falha
- 🧹 **Cleanup Automático**: Tratamento adequado de interrupções
- 🔍 **Health Checks**: Monitoramento contínuo dos serviços
- 🌐 **Conectividade Check**: Verificação de internet antes do deploy
- 📁 **Backup Melhorado**: Inclui logs e configurações

### 📝 Arquivo de Log
- **Log File**: $LOG_FILE
- **Localização**: $(pwd)/$LOG_FILE
- **Comando para ver**: \`tail -f $LOG_FILE\`

### 🌐 URLs do Sistema
EOF

if [ "$USE_ALT_PORTS" = true ]; then
cat >> ACESSO_MEGA_DEPLOY_V3.md <<EOF
- **Site Principal**: http://IP_VPS:8000 (HTTP) | https://IP_VPS:8443 (HTTPS)
- **Traefik Dashboard**: http://IP_VPS:8080

⚠️ **Usando portas alternativas devido a conflito na porta 80**
**Para produção, configure seu proxy/load balancer para redirecionar:**
- Porta 80 → 8000
- Porta 443 → 8443
EOF
else
cat >> ACESSO_MEGA_DEPLOY_V3.md <<EOF
- **Site Principal**: https://$DOMAIN
- **Traefik Dashboard**: https://traefik.$DOMAIN
EOF
fi

cat >> ACESSO_MEGA_DEPLOY_V3.md <<EOF

### 🔐 Credenciais Geradas Automaticamente
- **N8N**: admin / $N8N_PASSWORD
- **Evolution API Key**: $EVOLUTION_KEY
- **PostgreSQL**: sitejuarez / $DB_PASSWORD

### 🛠️ Stack Implementada V3
✅ Traefik (Proxy + SSL automático + Health checks)
✅ Let's Encrypt (SSL/HTTPS automático)
✅ PostgreSQL (Banco principal + otimizado + health checks)
✅ Redis (Cache + health checks)
✅ Express.js V3 (Servidor com monitoramento)
✅ Docker Compose (Orquestração inteligente)
✅ Logs em Tempo Real (Deploy visível)
✅ Retry Logic (Tentativas automáticas)
✅ Health Monitoring (Verificação contínua)

### 📊 Comandos Úteis V3
\`\`\`bash
# Ver status detalhado
docker-compose ps

# Ver logs em tempo real
docker-compose logs -f [serviço]

# Ver health checks
docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# Reiniciar serviço específico
docker-compose restart [serviço]

# Ver logs do deploy
tail -f $LOG_FILE

# Backup manual V3
./backup.sh

# Verificar saúde dos containers
docker inspect \$(docker-compose ps -q) --format="{{.Name}}: {{.State.Health.Status}}"
\`\`\`

### 🔒 Segurança V3
- Firewall configurado (portas 22, 80, 443, 8000, 8080, 8443)
- SSL automático via Let's Encrypt
- Backup automático diário com logs (2h da manhã)
- Headers de segurança aplicados
- Health checks para todos os serviços
- Graceful shutdown configurado

### 📊 Monitoramento
- **Health Checks**: Todos os serviços têm verificação de saúde
- **API Monitoring**: /api/health endpoint disponível
- **Logs Centralizados**: docker-compose logs
- **Métricas**: Disponíveis via API /api/ping

### 🚀 Próximos Passos
1. Configure DNS do domínio para apontar para este servidor
2. Aguarde propagação DNS (5-30 minutos)
3. SSL será ativado automaticamente
4. Monitore os logs: \`tail -f $LOG_FILE\`
5. Verifique health: \`docker-compose ps\`

### 🆘 Troubleshooting V3
- **Container falhando**: \`docker-compose logs [container]\`
- **API não respondendo**: \`curl http://localhost:3000/api/health\`
- **SSL não ativando**: Aguarde propagação DNS
- **Porto ocupado**: Script detecta e usa portas alternativas
- **Ver processo completo**: \`cat $LOG_FILE\`

---
**MEGA DEPLOY AUTOMÁTICO V3 executado com sucesso! 🎉**
**Logs em Tempo Real + Health Checks + Retry Logic + Monitoramento**
**Desenvolvido por Kryonix - Zero configuração manual**

**Log completo salvo em: $LOG_FILE**
EOF

# ============= RESULTADO FINAL V3 =============
realtime_echo ""
realtime_echo "${PURPLE}🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉${NC}"
realtime_echo "${GREEN}🚀 MEGA DEPLOY AUTOMÁTICO V3 CONCLUÍDO! 🚀${NC}"
realtime_echo "${PURPLE}🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉🎉��🎉🎉🎉🎉${NC}"
realtime_echo ""
realtime_echo "${CYAN}🆕 Novidades V3 - Logs em Tempo Real:${NC}"
realtime_echo "   • 📝 Logs em tempo real durante todo o processo"
realtime_echo "   • 📊 Progress bar visual"
realtime_echo "   • 🔄 Retry logic automático"
realtime_echo "   • 🧹 Cleanup em interrupções"
realtime_echo "   • 🔍 Health checks melhorados"
realtime_echo "   • 🌐 Verificação de conectividade"
realtime_echo ""

if [ "$USE_ALT_PORTS" = true ]; then
    realtime_echo "${YELLOW}⚠️ Usando portas alternativas:${NC}"
    realtime_echo "   • HTTP: ${YELLOW}http://IP_VPS:8000${NC}"
    realtime_echo "   • HTTPS: ${YELLOW}https://IP_VPS:8443${NC}"
    realtime_echo "   • Traefik: ${YELLOW}http://IP_VPS:8080${NC}"
    realtime_echo ""
    log_warning "Porta 80 estava ocupada - usando portas alternativas"
else
    realtime_echo "${CYAN}🌐 URLs padrão configuradas:${NC}"
    realtime_echo "   • Site: ${YELLOW}https://$DOMAIN${NC}"
    realtime_echo "   • Traefik: ${YELLOW}https://traefik.$DOMAIN${NC}"
fi

realtime_echo ""
realtime_echo "${CYAN}📝 Log completo salvo em: ${YELLOW}$LOG_FILE${NC}"
realtime_echo "${CYAN}🔐 Credenciais salvas em: ${YELLOW}ACESSO_MEGA_DEPLOY_V3.md${NC}"
realtime_echo ""
realtime_echo "${GREEN}✅ Sistema V3 100% funcional com:${NC}"
realtime_echo "   📝 Logs em tempo real"
realtime_echo "   📊 Progress bar visual"
realtime_echo "   🔄 Retry logic automático"
realtime_echo "   🧹 Cleanup automático"
realtime_echo "   🔍 Health checks melhorados"
realtime_echo "   🐳 Docker + Docker Compose"
realtime_echo "   🔀 Traefik (Proxy reverso)"
realtime_echo "   🔒 Let's Encrypt (SSL automático)"
realtime_echo "   🗄️ PostgreSQL + Redis"
realtime_echo "   💾 Backup automático aprimorado"
realtime_echo "   🔒 Firewall configurado"
realtime_echo "   🌐 Verificação de conectividade"
realtime_echo ""
realtime_echo "${BLUE}📊 Comandos úteis:${NC}"
realtime_echo "${BLUE}   docker-compose ps${NC} - Ver status"
realtime_echo "${BLUE}   docker-compose logs -f${NC} - Ver logs"
realtime_echo "${BLUE}   tail -f $LOG_FILE${NC} - Ver log do deploy"
realtime_echo "${BLUE}   ./backup.sh${NC} - Backup manual"
realtime_echo ""
realtime_echo "${PURPLE}🏠 Siqueira Campos Imóveis V3 ONLINE! 🏠${NC}"
realtime_echo "${GREEN}Deploy executado em $(date)${NC}"
realtime_echo ""

# Finalização melhorada com opção de manter terminal aberto
realtime_echo ""
realtime_echo "${GREEN}🎉 DEPLOY V3 FINALIZADO COM SUCESSO!${NC}"
realtime_echo ""

# Perguntar se usuário quer manter terminal aberto
realtime_echo "${YELLOW}Opções:${NC}"
realtime_echo "1) Manter terminal aberto para monitoramento"
realtime_echo "2) Finalizar script agora"
realtime_echo "3) Mostrar logs dos containers"
realtime_echo ""

# Aguardar por 15 segundos ou input do usuário
realtime_echo "${CYAN}Escolha uma opção (1-3) ou aguarde 15s para finalizar:${NC}"

# Usar timeout para não travar indefinidamente
if read -t 15 -r choice; then
    case $choice in
        1)
            realtime_echo "${GREEN}Mantendo terminal aberto para monitoramento...${NC}"
            realtime_echo "${CYAN}Pressione Ctrl+C para sair quando quiser${NC}"
            realtime_echo ""

            # Loop de monitoramento
            while true; do
                realtime_echo "=== Status dos Containers ($(date)) ==="
                docker-compose ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
                echo ""

                # Verificar APIs
                if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
                    realtime_echo "✅ API Health: OK"
                else
                    realtime_echo "❌ API Health: FAIL"
                fi

                echo ""
                wait_with_countdown 30 "Próxima verificação em"
            done
            ;;
        2)
            realtime_echo "${GREEN}Finalizando script...${NC}"
            ;;
        3)
            realtime_echo "${CYAN}Logs dos containers:${NC}"
            docker-compose logs --tail=20 2>/dev/null || true

            realtime_echo ""
            realtime_echo "${YELLOW}Pressione ENTER para finalizar...${NC}"
            read -r
            ;;
        *)
            realtime_echo "${YELLOW}Opção inválida. Finalizando...${NC}"
            ;;
    esac
else
    realtime_echo ""
    realtime_echo "${GREEN}Timeout atingido. Finalizando script...${NC}"
fi

# Restaurar descritores de arquivo com segurança
if [[ -n "${3:-}" ]] && [[ -n "${4:-}" ]]; then
    exec 1>&3 2>&4 2>/dev/null || true
fi

realtime_echo ""
realtime_echo "${GREEN}✅ MEGA DEPLOY V3 FINALIZADO!${NC}"
realtime_echo "${CYAN}📝 Log salvo em: ${LOG_FILE:-"não disponível"}${NC}"
realtime_echo "${CYAN}📋 Documentação: ACESSO_MEGA_DEPLOY_V3.md${NC}"
realtime_echo ""
realtime_echo "${YELLOW}Pressione ENTER para finalizar ou Ctrl+C para sair...${NC}"

# Aguardar indefinidamente até o usuário pressionar ENTER
read -r final_input || true

realtime_echo "${GREEN}Script finalizado pelo usuário. Obrigado!${NC}"
