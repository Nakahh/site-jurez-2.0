# Tutorial Completo - Configuração Siqueira Campos Imóveis

Este tutorial te guiará passo a passo para configurar todo o sistema, desde a instalação local até a configuração do N8N e Evolution API.

## 📋 O que você vai precisar fazer fora do sistema

### 1. 🗄️ Configurar PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar serviço
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Criar banco e usuário
sudo -u postgres psql
CREATE DATABASE bdsitejuarez;
CREATE USER sitejuarez WITH PASSWORD 'juarez123';
GRANT ALL PRIVILEGES ON DATABASE bdsitejuarez TO sitejuarez;
\q
```

### 2. 🤖 Configurar N8N

```bash
# Instalar globalmente
npm install -g n8n

# Ou usar Docker
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -v ~/.n8n:/home/node/.n8n \
  n8io/n8n

# Acessar http://localhost:5678
```

#### Importar Fluxo N8N:

1. Abra N8N em http://localhost:5678
2. Vá em **Settings → Import**
3. Carregue o arquivo `n8n-fluxo-imobiliaria-completo.json`
4. Configure as credenciais (detalhes abaixo)

#### Configurar Credenciais no N8N:

**📊 PostgreSQL**:

- Name: `PostgreSQL Siqueira Campos`
- Host: `localhost`
- Database: `bdsitejuarez`
- User: `sitejuarez`
- Password: `juarez123`
- Port: `5432`

**🤖 OpenAI**:

- Name: `OpenAI Siqueira Campos`
- API Key: Sua chave da OpenAI (obtenha em https://platform.openai.com/api-keys)

**📱 Evolution API**:

- Name: `Evolution API Siqueira Campos`
- URL: `http://localhost:8080` (ou sua URL do Evolution)
- API Key: Sua chave do Evolution

**📧 SMTP Email**:

- Name: `SMTP Siqueira Campos`
- Host: `smtp.gmail.com`
- Port: `587`
- User: `siqueiraecamposimoveisgoiania@gmail.com`
- Password: `Juarez.123`

### 3. 📱 Configurar Evolution API (WhatsApp)

```bash
# Via Docker
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=siqueira_api_key_2024 \
  -e AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true \
  atendai/evolution-api:latest
```

#### Configurar Instância WhatsApp:

1. Acesse http://localhost:8080/manager
2. Clique em **"Create Instance"**
3. Nome da instância: `siqueira`
4. Configure webhook para N8N:
   - URL: `http://localhost:5678/webhook/resposta-corretor`
   - Events: `messages.upsert`
5. Conecte com QR Code

### 4. 🔑 Configurar Google OAuth

1. Vá para [Google Cloud Console](https://console.cloud.google.com/)
2. Crie um novo projeto ou use existente
3. Ative a **Google+ API**
4. Vá em **Credenciais → Criar Credenciais → ID do cliente OAuth**
5. Tipo: Aplicação Web
6. URLs autorizadas:
   - `http://localhost:3000`
   - `https://siqueicamposimoveis.com.br`
7. Copie Client ID e Client Secret para o `.env`

### 5. 🔑 Configurar OpenAI

1. Crie conta em https://platform.openai.com/
2. Vá em **API Keys**
3. Clique **"Create new secret key"**
4. Copie a chave para o `.env`

## 🚀 Passo a Passo para Rodar o Sistema

### Passo 1: Preparar o Ambiente

```bash
# Clonar o repositório
git clone <url-do-repositorio>
cd siqueira-campos-imoveis

# Instalar dependências
npm install

# Copiar configurações
cp .env.example .env
```

### Passo 2: Configurar .env

Edite o arquivo `.env` com suas configurações:

```env
# Banco de dados
DATABASE_URL="postgresql://sitejuarez:juarez123@localhost:5432/bdsitejuarez?schema=public"

# JWT
JWT_SECRET=468465454567653554546524
JWT_EXPIRES_IN=7d
COOKIE_SECRET=645454564867654575565

# Portas
PORT=3000
ADMIN_PORT=3001
APP_PORT=3002

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=siqueiraecamposimoveisgoiania@gmail.com
EMAIL_PASS=Juarez.123

# Google OAuth (substitua pelos seus)
GOOGLE_CLIENT_ID=7452076957-v6740revpqo1s3f0ek25dr1tpua6q893.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# N8N e Evolution API
N8N_WEBHOOK_URL=http://localhost:5678/webhook
EVOLUTION_API_URL=http://localhost:8080
EVOLUTION_API_KEY=siqueira_api_key_2024

# OpenAI (substitua pela sua)
OPENAI_API_KEY=sk-...your-key-here...
```

### Passo 3: Configurar Banco de Dados

```bash
# Gerar cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev --name init

# (Opcional) Visualizar banco
npx prisma studio
```

### Passo 4: Iniciar Serviços

**Terminal 1 - Aplicação Principal**:

```bash
npm run dev
# Acesse: http://localhost:3000
```

**Terminal 2 - N8N**:

```bash
n8n start
# Acesse: http://localhost:5678
```

**Terminal 3 - Evolution API**:

```bash
# Se usando Docker, já está rodando
# Se local, siga documentação da Evolution API
```

### Passo 5: Configurar N8N

1. Abra http://localhost:5678
2. Importe o fluxo `n8n-fluxo-imobiliaria-completo.json`
3. Configure todas as credenciais conforme seção anterior
4. Ative o workflow

### Passo 6: Testar o Sistema

1. **Teste o chat**: Acesse http://localhost:3000 e use o chat
2. **Teste WhatsApp**: Envie mensagem no chat, verifique se chega no WhatsApp
3. **Teste "ASSUMIR"**: Responda "ASSUMIR" no WhatsApp
4. **Teste login**: Faça login em http://localhost:3000/login
5. **Teste dashboard**: Configure WhatsApp no dashboard do corretor

## 👥 Usuários de Teste

O sistema criará automaticamente estes usuários após a primeira migração:

```sql
-- Admin
Email: admin@siqueicamposimoveis.com.br
Senha: admin123

-- Corretor
Email: corretor@siqueicamposimoveis.com.br
Senha: corretor123

-- Cliente
Email: cliente@siqueicamposimoveis.com.br
Senha: cliente123
```

## 🧪 Como Testar Cada Funcionalidade

### 1. Teste do Chat com IA

```bash
# No site principal, clique no balão do chat
# Digite: "Olá, gostaria de agendar uma visita"
# Verifique se a IA responde
```

### 2. Teste do Fluxo N8N

```bash
# Certifique-se que N8N está rodando
# No chat, envie: "Quero comprar um apartamento"
# Verifique logs do N8N
# Confirme se chegou WhatsApp do corretor ativo
```

### 3. Teste WhatsApp Integration

```bash
# Faça login como corretor
# Configure seu WhatsApp no dashboard
# Marque status como "ATIVO"
# Envie mensagem no chat do site
# Responda "ASSUMIR" no WhatsApp
```

### 4. Teste Google OAuth

```bash
# Na tela de login, clique "Continuar com Google"
# Autorize a aplicação
# Verifique se foi redirecionado corretamente
```

## 🔧 Solução de Problemas Comuns

### Erro de Conexão com Banco

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U sitejuarez -d bdsitejuarez
```

### N8N não está recebendo webhooks

```bash
# Verificar se N8N está rodando na porta 5678
curl http://localhost:5678/webhook/lead-site

# Verificar firewall
sudo ufw allow 5678
```

### Evolution API não conecta

```bash
# Verificar container Docker
docker ps | grep evolution

# Ver logs
docker logs evolution-api

# Reconectar WhatsApp
# Vá em http://localhost:8080/manager
# Conecte novamente com QR Code
```

### Chat não funciona

```bash
# Verificar se OpenAI está configurada
# Verificar se endpoint /api/chat responde
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"mensagem":"teste"}'
```

## 📱 Configuração Mobile

### Para testar no celular na mesma rede:

```bash
# Descobrir IP local
ip addr show | grep inet

# Iniciar app com IP
npm run dev -- --host 0.0.0.0

# Acessar no celular: http://SEU_IP:3000
```

## 🚀 Deploy para Produção

### Docker Compose

```bash
# Criar arquivo docker-compose.yml (já incluído no projeto)
docker-compose up -d

# Verificar serviços
docker-compose ps
```

### Configurar SSL (Certbot)

```bash
# Instalar Certbot
sudo apt install certbot nginx

# Configurar Nginx
sudo nano /etc/nginx/sites-available/siqueira-campos

# Obter certificado
sudo certbot --nginx -d siqueicamposimoveis.com.br
```

## 📞 Suporte

Se encontrar problemas:

1. **Verifique os logs**: `npm run dev` mostra erros em tempo real
2. **Consulte este tutorial**: Revisit seções específicas
3. **Entre em contato**:
   - WhatsApp Desenvolvedor: (17) 9 8180-5327
   - Instagram: @kryon.ix

## ✅ Checklist Final

Antes de considerar o sistema funcionando:

- [ ] PostgreSQL conectando
- [ ] N8N importado e rodando
- [ ] Evolution API conectada ao WhatsApp
- [ ] OpenAI configurada
- [ ] Chat do site respondendo
- [ ] WhatsApp recebendo leads
- [ ] "ASSUMIR" funcionando
- [ ] Login com Google
- [ ] Dashboard do corretor carregando
- [ ] Configuração WhatsApp salvando

## 🎯 Próximos Passos

Após configurar tudo:

1. **Personalize**: Ajuste textos, cores e imagens
2. **Adicione Dados**: Cadastre imóveis e usuários reais
3. **Configure Backups**: Automatize backup do banco
4. **Monitore**: Use dashboard do desenvolvedor
5. **Expanda**: Adicione novas funcionalidades

---

**🎉 Parabéns! Seu sistema está pronto para uso!**
