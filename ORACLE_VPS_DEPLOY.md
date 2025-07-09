# 🚀 Deploy Completo - Oracle VPS com Docker

Sistema automatizado para deploy da **Siqueira Campos Imóveis** em Oracle VPS usando Docker.

## 🎯 Características do Deploy Oracle

✅ **Otimizado para Oracle Cloud Infrastructure**  
✅ **Deploy automático com SSL/HTTPS**  
✅ **Backup automático configurado**  
✅ **Monitoramento em tempo real**  
✅ **Firewall configurado automaticamente**  
✅ **N8N + WhatsApp Business + PostgreSQL**  
✅ **Nginx com proxy reverso**  
✅ **Let's Encrypt SSL automático**

---

## 🚀 Passo 1: Preparar VPS Oracle

### 1.1 Especificações Mínimas

- **CPU**: 2 vCPUs (Ampere/Intel)
- **RAM**: 4GB
- **Disco**: 50GB
- **OS**: Ubuntu 20.04/22.04 LTS

### 1.2 Configurar VPS Oracle

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências básicas
sudo apt install -y curl wget git unzip htop nano
```

---

## 🔧 Passo 2: Executar Deploy Automático

### 2.1 Download dos Scripts

```bash
# Fazer download do repositório
wget https://github.com/seu-usuario/siqueira-campos-imoveis/archive/main.zip
unzip main.zip
cd siqueira-campos-imoveis-main

# Ou clonar via Git
git clone https://github.com/seu-usuario/siqueira-campos-imoveis.git
cd siqueira-campos-imoveis
```

### 2.2 Executar Deploy

```bash
# Dar permissão de execução
chmod +x deploy-oracle.sh

# Executar deploy
./deploy-oracle.sh
```

### 2.3 Informações Solicitadas

- **Domínio**: siqueicamposimoveis.com.br
- **Email**: admin@siqueicamposimoveis.com.br
- **URL do Repositório**: (se não estiver clonado)

---

## 🌐 Passo 3: Configurar DNS

### 3.1 Apontar Domínio para VPS

Configure no seu provedor de domínio:

```
Tipo: A
Nome: @
Valor: IP_DO_SEU_VPS_ORACLE
TTL: 3600

Tipo: A
Nome: n8n
Valor: IP_DO_SEU_VPS_ORACLE
TTL: 3600

Tipo: A
Nome: api
Valor: IP_DO_SEU_VPS_ORACLE
TTL: 3600
```

### 3.2 Verificar Propagação

```bash
# Verificar se DNS propagou
nslookup siqueicamposimoveis.com.br
nslookup n8n.siqueicamposimoveis.com.br
nslookup api.siqueicamposimoveis.com.br
```

---

## 📊 Passo 4: Verificar Deploy

### 4.1 Status dos Serviços

```bash
# Usar monitor automático
./monitor-oracle.sh

# Ou verificar manualmente
docker-compose -f docker-compose.oracle.yml ps
```

### 4.2 Testar Acessos

- **Site**: https://siqueicamposimoveis.com.br
- **N8N**: https://n8n.siqueicamposimoveis.com.br
- **Evolution**: https://api.siqueicamposimoveis.com.br

---

## 🔐 Passo 5: Configurar Serviços Premium

### 5.1 N8N (Automação)

```bash
# Acessar N8N
https://n8n.siqueicamposimoveis.com.br

# Credenciais (salvas em ACESSO.md)
Usuário: admin
Senha: [gerada automaticamente]

# Importar workflow
Settings > Import from file > n8n-fluxo-imobiliaria-completo.json
```

### 5.2 Evolution API (WhatsApp)

```bash
# Acessar Evolution API
https://api.siqueicamposimoveis.com.br

# Criar instância WhatsApp
POST /instance/create
{
  "instanceName": "siqueira-whatsapp",
  "token": "[chave gerada]"
}

# Conectar WhatsApp
GET /instance/connect/siqueira-whatsapp
# Escanear QR Code com WhatsApp Business
```

### 5.3 Configurar no Dashboard

```bash
# Acessar dashboard como desenvolvedor
https://siqueicamposimoveis.com.br/login

# Credenciais padrão
Email: dev@sistema.com
Senha: dev123

# Ir para Dashboard > Aba Premium
# Configurar URLs dos serviços
```

---

## 🛠️ Comandos Úteis

### Gerenciamento de Containers

```bash
# Ver status
docker-compose -f docker-compose.oracle.yml ps

# Ver logs
docker-compose -f docker-compose.oracle.yml logs -f [serviço]

# Reiniciar serviço
docker-compose -f docker-compose.oracle.yml restart [serviço]

# Parar tudo
docker-compose -f docker-compose.oracle.yml down

# Iniciar tudo
docker-compose -f docker-compose.oracle.yml up -d
```

### Monitoramento

```bash
# Monitor completo
./monitor-oracle.sh

# Uso de recursos
docker stats

# Espaço em disco
df -h

# Logs do sistema
journalctl -f
```

### Backup e Manutenção

```bash
# Backup manual
./backup.sh

# Atualizar sistema
./update-oracle.sh

# Ver backups
ls -la backups/
```

---

## 🔒 Segurança Implementada

### Firewall Oracle

```bash
# Portas abertas automaticamente
22/tcp   - SSH
80/tcp   - HTTP (redirect para HTTPS)
443/tcp  - HTTPS

# Verificar status
sudo ufw status verbose
```

### SSL/HTTPS

- **Certificados**: Let's Encrypt automático
- **Renovação**: Automática via Certbot
- **Criptografia**: TLS 1.2/1.3
- **HSTS**: Habilitado

### Autenticação

- **JWT**: Tokens seguros com expiração
- **Bcrypt**: Hash de senhas
- **Rate Limiting**: Proteção contra ataques
- **Validação**: Sanitização de inputs

---

## 📈 Performance Otimizada

### Nginx

- **Gzip**: Compressão automática
- **Cache**: Headers otimizados
- **Proxy**: Balanceamento de carga
- **SSL**: Session cache

### Docker

- **Multi-stage**: Build otimizado
- **Health checks**: Monitoramento automático
- **Restart policies**: Alta disponibilidade
- **Resource limits**: Controle de recursos

### PostgreSQL

- **Configurações**: Otimizadas para Oracle VPS
- **Conexões**: Pool configurado
- **Backup**: Automático diário
- **Índices**: Otimizados para performance

---

## 🚨 Troubleshooting

### Problemas Comuns

#### 1. SSL não funciona

```bash
# Verificar certificados
docker-compose -f docker-compose.oracle.yml exec certbot certbot certificates

# Renovar manualmente
docker-compose -f docker-compose.oracle.yml run --rm certbot

# Recarregar nginx
docker-compose -f docker-compose.oracle.yml exec nginx nginx -s reload
```

#### 2. Site não carrega

```bash
# Verificar logs
docker-compose -f docker-compose.oracle.yml logs -f app nginx

# Verificar conectividade
curl -I https://siqueicamposimoveis.com.br

# Verificar DNS
nslookup siqueicamposimoveis.com.br
```

#### 3. Banco não conecta

```bash
# Verificar PostgreSQL
docker-compose -f docker-compose.oracle.yml logs postgres

# Testar conexão
docker-compose -f docker-compose.oracle.yml exec postgres psql -U sitejuarez -d bdsitejuarez

# Executar migrações
docker-compose -f docker-compose.oracle.yml exec app npm run db:migrate
```

#### 4. N8N não funciona

```bash
# Verificar logs N8N
docker-compose -f docker-compose.oracle.yml logs n8n

# Acessar container
docker-compose -f docker-compose.oracle.yml exec n8n bash

# Verificar workflow
curl http://localhost:5678/webhook/test
```

### Logs Importantes

```bash
# Aplicação principal
docker-compose -f docker-compose.oracle.yml logs -f app

# Nginx (proxy)
docker-compose -f docker-compose.oracle.yml logs -f nginx

# Sistema operacional
sudo journalctl -f -u docker
```

---

## 📋 Checklist de Deploy

### Pré-Deploy

- [ ] VPS Oracle configurado
- [ ] Docker instalado
- [ ] Repositório clonado
- [ ] DNS apontado

### Deploy

- [ ] Script `deploy-oracle.sh` executado
- [ ] Containers iniciados
- [ ] SSL configurado
- [ ] Serviços respondendo

### Pós-Deploy

- [ ] N8N configurado
- [ ] WhatsApp conectado
- [ ] Dashboard acessível
- [ ] Backup funcionando
- [ ] Monitor configurado

### Configuração Final

- [ ] Google OAuth (opcional)
- [ ] OpenAI API (opcional)
- [ ] Email SMTP configurado
- [ ] Templates personalizados

---

## 💰 Custos Oracle VPS

### Oracle Cloud Free Tier

- **VM**: 2 OCPUs Ampere + 12GB RAM
- **Disco**: 100GB Boot Volume
- **Tráfego**: 10TB/mês
- **IP**: 1 IP público
- **Custo**: **GRATUITO** (Always Free)

### Recursos Inclusos

- **Backup**: 50GB gratuito
- **Monitoring**: Incluso
- **Load Balancer**: Incluso
- **DNS**: Incluso

**Total: R$ 0,00/mês** 🎉

---

## 📞 Suporte

### Logs de Erro

```bash
# Salvar logs para análise
./monitor-oracle.sh > diagnostico.txt
docker-compose -f docker-compose.oracle.yml logs > logs-completos.txt
```

### Informações de Sistema

```bash
# Informações do sistema
uname -a
docker --version
docker-compose --version
free -h
df -h
```

### Contato

- **WhatsApp**: (17) 9 8180-5327
- **Email**: contato@kryonix.dev
- **Instagram**: @kryon.ix

---

## 🎉 Conclusão

Seu site **Siqueira Campos Imóveis** está agora rodando em:

✅ **Oracle VPS** com alta performance  
✅ **Docker** para máxima confiabilidade  
✅ **SSL/HTTPS** com renovação automática  
✅ **N8N + WhatsApp** para automação completa  
✅ **Backup automático** para segurança  
✅ **Monitoramento** em tempo real

**Sistema Premium funcionando 24/7!** 🚀

---

**Desenvolvido com ❤️ pela Kryonix**  
**Deploy Oracle VPS otimizado para máxima performance**
