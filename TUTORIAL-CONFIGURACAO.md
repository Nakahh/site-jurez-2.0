# 🔧 Tutorial Completo de Configuração - Sistema Premium

**Guia passo-a-passo para configurar N8N + WhatsApp Business + Evolution API + Google Calendar**

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:

- ✅ Sistema básico rodando (`npm run dev`)
- ✅ PostgreSQL instalado e configurado
- ✅ Docker instalado (recomendado)
- ✅ Node.js 18+ instalado
- ✅ Acesso à internet para APIs externas

---

## 🗄️ Etapa 1: Configurar PostgreSQL (5 minutos)

### 1.1 Instalar PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS
brew install postgresql

# Windows
# Baixar de: https://www.postgresql.org/download/windows/
```

### 1.2 Configurar Banco

```bash
# Conectar como superusuário
sudo -u postgres psql

# No prompt do PostgreSQL:
CREATE DATABASE bdsitejuarez;
CREATE USER sitejuarez WITH PASSWORD 'nakah123';
GRANT ALL PRIVILEGES ON DATABASE bdsitejuarez TO sitejuarez;
\q
```

### 1.3 Adicionar Campos para Premium

```bash
# No projeto, atualizar schema Prisma
npm run db:migrate
npm run db:seed  # Dados de teste
```

### 1.4 Verificar Configuração

```bash
# Testar conexão
psql -h localhost -U sitejuarez -d bdsitejuarez
# Se conectou com sucesso: ✅ PostgreSQL configurado
```

---

## 🤖 Etapa 2: Configurar N8N (15 minutos)

### 2.1 Instalar N8N via Docker (Recomendado)

```bash
# Criar diretório para dados
mkdir ~/.n8n

# Rodar N8N
docker run -d \
  --name n8n-imobiliaria \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=siqueira2024 \
  n8nio/n8n

# Verificar se está rodando
docker ps | grep n8n
```

### 2.2 Acessar N8N

```bash
# Abrir no navegador
http://localhost:5678

# Login:
# Usuário: admin
# Senha: siqueira2024
```

### 2.3 Configurar Credenciais

#### PostgreSQL Credential:

1. **Settings** > **Credentials** > **Add Credential**
2. Selecionar **Postgres**
3. Configurar:
   - **Host**: localhost
   - **Database**: bdsitejuarez
   - **User**: sitejuarez
   - **Password**: nakah123
   - **Port**: 5432
4. **Save** com nome: `PostgreSQL - Imobiliária`

#### OpenAI Credential:

1. **Add Credential** > **OpenAI**
2. **API Key**: `sk-sua-chave-openai`
3. **Save** com nome: `OpenAI - Imobiliária`

### 2.4 Importar Workflow

```bash
# 1. Baixar arquivo do projeto
cp n8n-imobiliaria-flow.json ~/Downloads/

# 2. No N8N interface:
# - Settings > Import workflow
# - Upload: n8n-imobiliaria-flow.json
# - Import

# 3. Ativar workflow
# - Clicar no workflow importado
# - Toggle "Active" no canto superior direito
```

### 2.5 Configurar Webhooks

```bash
# Webhook URLs que o N8N irá gerar:
# http://localhost:5678/webhook/lead-site
# http://localhost:5678/webhook/resposta-corretor

# Anotar essas URLs para usar no sistema
```

---

## 📱 Etapa 3: Configurar Evolution API (15 minutos)

### 3.1 Instalar Evolution API

```bash
# Via Docker (método mais simples)
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=siqueira_key_2024 \
  -e STORE_MESSAGES=true \
  -e STORE_MESSAGE_UP=true \
  -e STORE_CONTACTS=true \
  -e STORE_CHATS=true \
  -e CLEAN_STORE_CLEANING_INTERVAL=7200 \
  -e CLEAN_STORE_MESSAGES=true \
  -e CLEAN_STORE_MESSAGE_UP=true \
  -e CLEAN_STORE_CONTACTS=true \
  -e CLEAN_STORE_CHATS=true \
  atendai/evolution-api:latest

# Verificar se está rodando
curl http://localhost:8080
```

### 3.2 Acessar Manager

```bash
# Abrir no navegador
http://localhost:8080/manager

# Página de gerenciamento da Evolution API
```

### 3.3 Criar Instância WhatsApp

```bash
# 1. No Manager, clicar "Create Instance"
# 2. Configurar:
#    - Instance Name: siqueirainstance
#    - Token: siqueira_instance_token
#    - Webhook URL: http://localhost:5678/webhook/resposta-corretor

# 3. Gerar QR Code
# 4. Escanear com WhatsApp Business do telefone
```

### 3.4 Testar Instância

```bash
# Testar envio de mensagem via API
curl -X POST http://localhost:8080/message/sendText/siqueirainstance \
  -H "Content-Type: application/json" \
  -H "apikey: siqueira_key_2024" \
  -d '{
    "number": "5562999999999",
    "text": "Teste Evolution API - Siqueira Campos Imóveis"
  }'

# Se receber mensagem no WhatsApp: ✅ Evolution API configurada
```

---

## 🧠 Etapa 4: Configurar OpenAI (5 minutos)

### 4.1 Obter API Key

```bash
# 1. Acessar: https://platform.openai.com/api-keys
# 2. Fazer login ou criar conta
# 3. Clicar "Create new secret key"
# 4. Copiar chave: sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
# 5. Salvar em local seguro
```

### 4.2 Configurar no N8N

```bash
# Já foi feito na Etapa 2.3
# Mas verificar se está funcionando:

# 1. No N8N, abrir workflow
# 2. Clicar no nó "🤖 Gerar Resposta com IA"
# 3. Credentials > OpenAI - Imobiliária
# 4. Test connection
# Se OK: ✅ OpenAI configurada
```

### 4.3 Configurar Modelo

```bash
# No nó OpenAI do N8N:
# - Model: gpt-3.5-turbo
# - Temperature: 0.7
# - Max Tokens: 150

# Sistema já vem pré-configurado no workflow
```

---

## 📅 Etapa 5: Configurar Google Calendar (Opcional - 10 minutos)

### 5.1 Criar Projeto Google Cloud

```bash
# 1. Acessar: https://console.cloud.google.com/
# 2. Criar novo projeto: "Siqueira Campos Imóveis"
# 3. Ativar APIs:
#    - Google Calendar API
#    - Google+ API (para OAuth)
```

### 5.2 Configurar OAuth 2.0

```bash
# 1. APIs & Services > Credentials
# 2. Create Credentials > OAuth 2.0 Client ID
# 3. Application type: Web application
# 4. Authorized redirect URIs:
#    - http://localhost:5173/auth/google/callback
# 5. Baixar JSON das credenciais
```

### 5.3 Configurar no Sistema

```bash
# 1. Copiar Client ID e Client Secret
# 2. No dashboard do sistema:
#    - Corretor > Integrações > Google Calendar
#    - Inserir Client ID e Client Secret
#    - Conectar conta
```

---

## 🔗 Etapa 6: Conectar Tudo no Sistema (10 minutos)

### 6.1 Dashboard do Desenvolvedor

```bash
# 1. Acessar: http://localhost:5173/dashboard
# 2. Login: dev@sistema.com / dev123
# 3. Aba "Premium" > Configurações:
#    - N8N URL: http://localhost:5678
#    - Evolution API URL: http://localhost:8080
#    - Evolution API Key: siqueira_key_2024
#    - OpenAI API Key: sk-sua-chave
# 4. Ativar serviços para "Siqueira Campos Imóveis"
```

### 6.2 Dashboard do Corretor

```bash
# 1. Acessar como corretor:
#    Email: corretor@siqueicamposimoveis.com.br
#    Senha: corretor123

# 2. Aba "Configurações" > WhatsApp Integration:
#    - Número: (62) 98556-3505
#    - Status: ATIVO
#    - Salvar

# 3. Google Calendar (se configurado):
#    - Conectar conta
#    - Configurar disponibilidade
```

### 6.3 Configurar Webhooks no Sistema

```bash
# No código do projeto, atualizar URLs:

# src/config/n8n.ts
export const N8N_CONFIG = {
  baseURL: 'http://localhost:5678',
  webhooks: {
    leadSite: 'http://localhost:5678/webhook/lead-site',
    respostaCorretor: 'http://localhost:5678/webhook/resposta-corretor'
  }
};

# src/config/evolution.ts
export const EVOLUTION_CONFIG = {
  baseURL: 'http://localhost:8080',
  apiKey: 'siqueira_key_2024',
  instanceName: 'siqueirainstance'
};
```

---

## ✅ Etapa 7: Teste Completo (5 minutos)

### 7.1 Teste Manual do Fluxo

```bash
# 1. Sistema rodando
npm run dev  # http://localhost:5173

# 2. Abrir site > Chat flutuante
# 3. Enviar mensagem: "Quero conhecer apartamentos"
# 4. Verificar:
#    ✅ IA respondeu no chat
#    ✅ Corretor recebeu no WhatsApp
#    ✅ Lead apareceu no N8N executions

# 5. No WhatsApp, responder: "ASSUMIR"
# 6. Verificar:
#    ✅ Lead mudou status no dashboard
#    ✅ Outros corretores foram notificados
#    ✅ Cliente foi informado
```

### 7.2 Teste do Fallback

```bash
# 1. Enviar nova mensagem no chat
# 2. NÃO responder no WhatsApp
# 3. Aguardar 15 minutos
# 4. Verificar:
#    ✅ Cliente recebeu mensagem de fallback
#    ✅ Gerente recebeu email
#    ✅ Lead marcado como "expirado"
```

### 7.3 Teste do Google Calendar

```bash
# 1. Dashboard Corretor > Agendamentos > Novo
# 2. Preencher dados da visita
# 3. Salvar
# 4. Verificar:
#    ✅ Evento criado no Google Calendar
#    ✅ Lembrete configurado
#    ✅ Email de confirmação enviado
```

---

## 🚨 Troubleshooting

### Problemas Comuns:

#### N8N não conecta ao PostgreSQL:

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar credenciais no N8N
# Settings > Credentials > PostgreSQL - Imobiliária
```

#### Evolution API não recebe mensagens:

```bash
# Verificar webhook no N8N
curl -X POST http://localhost:5678/webhook/resposta-corretor \
  -H "Content-Type: application/json" \
  -d '{"message": "teste", "from": "5562999999999"}'

# Verificar instância WhatsApp
curl http://localhost:8080/instance/siqueirainstance
```

#### OpenAI retorna erro:

```bash
# Verificar saldo da conta OpenAI
# Verificar se API Key está correta
# Verificar rate limits
```

#### Google Calendar não sincroniza:

```bash
# Verificar credenciais OAuth
# Verificar se APIs estão ativadas no Google Cloud
# Verificar se redirect URI está correto
```

---

## 📊 Monitoramento

### URLs de Monitoramento:

- **Sistema Principal**: http://localhost:5173
- **N8N Dashboard**: http://localhost:5678
- **Evolution API Manager**: http://localhost:8080/manager
- **Dashboard Desenvolvedor**: http://localhost:5173/dashboard

### Logs Importantes:

```bash
# Logs do N8N
docker logs n8n-imobiliaria

# Logs da Evolution API
docker logs evolution-api

# Logs do Sistema
npm run dev  # Console do Vite

# Logs do PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log
```

---

## ��� Resumo de URLs e Credenciais

### URLs:

- **Sistema**: http://localhost:5173
- **N8N**: http://localhost:5678 (admin / siqueira2024)
- **Evolution API**: http://localhost:8080
- **PostgreSQL**: localhost:5432

### Credenciais Importantes:

- **N8N**: admin / siqueira2024
- **Evolution API Key**: siqueira_key_2024
- **PostgreSQL**: sitejuarez / nakah123
- **Instance WhatsApp**: siqueirainstance

### Webhooks:

- **Lead Site**: http://localhost:5678/webhook/lead-site
- **Resposta Corretor**: http://localhost:5678/webhook/resposta-corretor

---

## ✅ Checklist Final

- [ ] PostgreSQL configurado e rodando
- [ ] N8N instalado e workflow importado
- [ ] Evolution API rodando com instância conectada
- [ ] OpenAI API configurada
- [ ] Dashboard desenvolvedor configurado
- [ ] Dashboard corretor com WhatsApp ativo
- [ ] Teste completo realizado com sucesso
- [ ] Fallback testado e funcionando
- [ ] Google Calendar conectado (opcional)
- [ ] Monitoramento configurado

**🎉 Parabéns! Sistema Premium 100% configurado e funcionando!**

---

**📞 Suporte Técnico:**

- WhatsApp: (17) 9 8180-5327
- Instagram: @kryon.ix
- Email: contato@kryonix.dev

---

_Desenvolvido por Kryonix - Vitor Jayme Fernandes Ferreira_
_Tutorial criado em: Dezembro 2024_
