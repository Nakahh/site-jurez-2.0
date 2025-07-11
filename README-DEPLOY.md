# 🏠 Siqueira Campos Imóveis - Deploy Enterprise

## 🚀 Deploy Automatizado de Infraestrutura Completa

Este script realiza a configuração completa de um servidor de produção para o sistema imobiliário Siqueira Campos, com arquitetura enterprise e alta disponibilidade.

### 📋 Pré-requisitos

- **Servidor**: Ubuntu 20.04+ ou Debian 11+
- **RAM**: Mínimo 8GB (recomendado 24GB)
- **Disco**: Mínimo 50GB SSD
- **Rede**: IPs públicos com domínios configurados
- **Acesso**: Root/sudo

### 🌐 Domínios Configurados

#### 🔷 meuboot.site (Painel Principal)

- **Traefik**: https://traefik.meuboot.site
- **Portainer**: https://meuboot.site
- **N8N**: https://n8n.meuboot.site
- **MinIO**: https://minio.meuboot.site
- **Grafana**: https://grafana.meuboot.site
- **Adminer**: https://adminer.meuboot.site
- **Evolution**: https://evo.meuboot.site
- **Webhook**: https://webhook.meuboot.site

#### 🔷 siqueicamposimoveis.com.br (Site Imobiliário)

- **Frontend**: https://siqueicamposimoveis.com.br
- **API**: https://api.siqueicamposimoveis.com.br
- **Portainer**: https://portainer.siqueicamposimoveis.com.br
- **N8N**: https://n8n.siqueicamposimoveis.com.br
- **MinIO**: https://minio.siqueicamposimoveis.com.br
- **Grafana**: https://grafana.siqueicamposimoveis.com.br
- **Adminer**: https://adminer.siqueicamposimoveis.com.br
- **Evolution**: https://evo.siqueicamposimoveis.com.br
- **Webhook**: https://webhook.siqueicamposimoveis.com.br

## 🛠️ Como Executar

### 1. Preparação

```bash
# Fazer download dos arquivos
wget https://raw.githubusercontent.com/seu-repo/install-infra.sh
wget https://raw.githubusercontent.com/seu-repo/make-executable.sh

# Tornar executável
chmod +x make-executable.sh
./make-executable.sh
```

### 2. Execução

```bash
# Executar como root
sudo ./install-infra.sh
```

### 3. Acompanhar Logs

```bash
# Em outro terminal, acompanhar o progresso
tail -f /var/log/kryonix-deploy/deploy.log
```

## 📊 O Que o Script Faz

### ✅ Etapa 1-3: Verificação e Preparação

- Verifica requisitos do sistema
- Analisa estrutura do projeto GitHub
- Faz limpeza controlada preservando SSH

### ✅ Etapa 4-8: Instalação de Base

- Instala Docker, Node.js, PostgreSQL
- Configura firewall UFW
- Prepara ambiente de produção

### ✅ Etapa 9-11: Proxy Reverso

- Configura Docker Swarm
- Deploy do Traefik com SSL automático
- Configuração de roteamento

### ✅ Etapa 12: Deploy de Serviços

- Portainer (Gerenciamento)
- N8N (Automação)
- MinIO (Storage)
- Grafana (Monitoramento)
- Adminer (Database)
- Evolution API (WhatsApp)

### ✅ Etapa 13-14: Aplicação

- Sistema de webhook GitHub
- Deploy da aplicação principal
- Configuração de auto-deploy

### ✅ Etapa 15-16: Finalização

- Geração de relatórios
- Testes de conectividade
- Diagnóstico completo

## 🔐 Credenciais Geradas

Todas as senhas são geradas automaticamente e salvas em:

- **Arquivo**: `/opt/senhas-sistema.txt`
- **Permissões**: 600 (apenas root)

### Serviços com Autenticação:

- **PostgreSQL**: `sitejuarez` / `[senha-gerada]`
- **N8N**: `admin` / `[senha-gerada]`
- **Grafana**: `admin` / `[senha-gerada]`
- **MinIO**: `kryonix_admin` / `[senha-gerada]`
- **Evolution API**: `[chave-gerada]`
- **Traefik**: `admin` / `admin` (altere após primeiro acesso)

## 🔄 GitHub Webhook

### Configuração Automática:

O script configura automaticamente um webhook em:

- **URL**: `https://webhook.siqueicamposimoveis.com.br`
- **Secret**: Salvo em `/opt/webhook-secret.txt`

### Manual no GitHub:

1. Acesse: `Settings > Webhooks`
2. **Payload URL**: `https://webhook.siqueicamposimoveis.com.br`
3. **Content type**: `application/json`
4. **Secret**: Conteúdo de `/opt/webhook-secret.txt`
5. **Events**: `Just the push event`
6. **Active**: ✅

### Auto-Deploy:

- **Branch**: `main` (apenas)
- **Ação**: Pull + Build + Restart automático
- **Logs**: `/var/log/auto-deploy.log`

## 📈 Monitoramento

### Logs Disponíveis:

- **Deploy Principal**: `/var/log/kryonix-deploy/deploy.log`
- **Erros**: `/var/log/kryonix-deploy/error.log`
- **SSL Status**: `/var/log/kryonix-deploy/ssl-status.log`
- **Auto-Deploy**: `/var/log/auto-deploy.log`
- **Relatório Final**: `/opt/deploy-report.log`

### Saúde dos Serviços:

```bash
# Status dos containers
docker service ls

# Logs específicos
docker service logs [nome-do-serviço]

# Teste de conectividade
curl -I https://siqueicamposimoveis.com.br
```

## 🔧 Pós-Deploy

### Configurações Necessárias:

1. **N8N** (https://n8n.siqueicamposimoveis.com.br)
   - Importar workflow do projeto
   - Configurar credenciais PostgreSQL
   - Conectar com Evolution API

2. **Evolution API** (https://evo.siqueicamposimoveis.com.br)
   - Criar instância WhatsApp
   - Escanear QR Code
   - Configurar webhooks para N8N

3. **Grafana** (https://grafana.siqueicamposimoveis.com.br)
   - Configurar datasources
   - Importar dashboards
   - Configurar alertas

### Manutenção Regular:

```bash
# Backup dos volumes
docker run --rm -v postgres_data:/data -v $(pwd):/backup ubuntu tar czf /backup/postgres-backup.tar.gz -C /data .

# Atualização de imagens
docker service update --image nova-imagem:tag nome-do-serviço

# Limpeza do sistema
docker system prune -af --volumes
```

## ⚠️ Troubleshooting

### Problemas Comuns:

1. **Certificados SSL não funcionando**

   ```bash
   # Verificar logs do Traefik
   docker service logs traefik_traefik

   # Verificar DNS
   dig +short siqueicamposimoveis.com.br
   ```

2. **Serviços não iniciando**

   ```bash
   # Verificar recursos
   docker stats
   free -h
   df -h
   ```

3. **Webhook não funcionando**

   ```bash
   # Verificar logs
   docker service logs webhook_webhook

   # Testar manualmente
   curl -X POST https://webhook.siqueicamposimoveis.com.br/health
   ```

### Recuperação:

Se algo der errado, o script preserva:

- Chaves SSH em backup
- Dados em volumes Docker
- Logs detalhados para diagnóstico

## 📞 Suporte

**Desenvolvido por**: Kryonix - Vitor Jayme Fernandes Ferreira

- **WhatsApp**: (17) 9 8180-5327
- **Instagram**: @kryon.ix
- **Email**: contato@kryonix.dev

## 📄 Licença

Sistema desenvolvido exclusivamente para Siqueira Campos Imóveis.
Todos os direitos reservados © 2024 Kryonix.
