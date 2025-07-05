# Siqueira Campos Imóveis - Sistema Completo

Sistema imobiliário completo com dashboards especializados, chat com IA, integração WhatsApp via N8N, e automação inteligente de leads.

## 🏗️ Arquitetura do Sistema

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Radix UI
- **Backend**: Express + Node.js + Prisma + PostgreSQL
- **Automação**: N8N + Evolution API (WhatsApp) + OpenAI
- **Autenticação**: JWT + Google OAuth
- **Banco de Dados**: PostgreSQL com Prisma ORM

## 🚀 Funcionalidades Principais

### 🏠 Site Público

- Homepage moderna e responsiva
- Catálogo de imóveis com filtros avançados
- Chat com IA integrado (bubble flutuante)
- Sistema de favoritos e compartilhamento
- Agendamento de visitas online
- Simulador de financiamento
- Páginas: Sobre, Contato, Blog

### 👥 Dashboards Especializados

#### 🔧 Admin (admin.siqueicamposimoveis.com.br)

- Controle financeiro completo
- Gestão de usuários e permissões
- Relatórios de vendas e comissões
- Análise de performance dos corretores
- Configurações do sistema

#### 🏘️ Corretor/Assistente (corretor.siqueicamposimoveis.com.br)

- **Integração WhatsApp**: Configurar número e status ativo/inativo
- **Gestão de Leads**: Assumir leads via WhatsApp ("ASSUMIR")
- **Cadastro de Imóveis**: CRUD completo com upload de fotos
- **Agenda de Visitas**: Visualizar e gerenciar agendamentos
- **Comissões**: Acompanhar valores pendentes e pagos
- **Estatísticas**: Dashboard com métricas pessoais

#### 👤 Cliente (cliente.siqueicamposimoveis.com.br)

- Lista de favoritos
- Histórico de visitas
- Contratos e documentos
- Chat com corretores
- Recomendações personalizadas

#### 📊 Marketing (mkt.siqueicamposimoveis.com.br)

- Campanhas de email marketing
- Integração com Meta API
- Análise de engajamento
- Gestão de leads por origem
- Relatórios de conversão

#### 🛠️ Desenvolvedor (dev.siqueicamposimoveis.com.br)

- Monitoramento de logs e erros
- Status dos serviços
- Configurações de manutenção
- Análise de performance
- Ferramentas de debug

### 🤖 Automação Inteligente

#### Fluxo de Leads Automatizado:

1. **Cliente envia mensagem** no chat do site
2. **IA responde automaticamente** com mensagem cordial
3. **Lead é salvo** no banco PostgreSQL
4. **N8N busca corretores ativos** (status ativo + WhatsApp configurado)
5. **Mensagem é enviada** para WhatsApp dos corretores: _"Responda ASSUMIR para atender"_
6. **Primeiro corretor que responder "ASSUMIR"** fica com o lead
7. **Outros corretores são notificados** que o lead foi assumido
8. **Cliente é informado** que um corretor irá atendê-lo
9. **Se ninguém responder em 15 min**: Fallback automático + email para gerente

## ⚙️ Configuração e Instalação

### 1. Pré-requisitos

```bash
# Node.js 18+ e npm
node --version
npm --version

# PostgreSQL 14+
psql --version

# Git
git --version
```

### 2. Instalação Local

```bash
# Clonar repositório
git clone <url-do-repositorio>
cd siqueira-campos-imoveis

# Instalar dependências
npm install

# Configurar banco de dados
cp .env.example .env
# Editar .env com suas configurações

# Executar migrações
npx prisma migrate dev

# Gerar cliente Prisma
npx prisma generate

# Iniciar em desenvolvimento
npm run dev
```

### 3. Configuração do Banco (.env)

```env
# PostgreSQL
DATABASE_URL="postgresql://sitejuarez:juarez123@localhost:5432/bdsitejuarez?schema=public"

# JWT
JWT_SECRET=468465454567653554546524
JWT_EXPIRES_IN=7d

# Google OAuth
GOOGLE_CLIENT_ID=7452076957-v6740revpqo1s3f0ek25dr1tpua6q893.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Email SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=siqueiraecamposimoveisgoiania@gmail.com
EMAIL_PASS=Juarez.123

# N8N e Evolution API
N8N_WEBHOOK_URL=https://n8n.siqueicamposimoveis.com.br/webhook
EVOLUTION_API_URL=https://evolution.siqueicamposimoveis.com.br
EVOLUTION_API_KEY=your_evolution_api_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key
```

### 4. Setup do N8N (Automação)

1. **Instalar N8N**:

```bash
npm install -g n8n
# ou usar Docker:
docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8io/n8n
```

2. **Importar Fluxo**:

- Acesse http://localhost:5678
- Vá em **Settings → Import**
- Carregue o arquivo `n8n-fluxo-imobiliaria-completo.json`

3. **Configurar Credenciais**:

- **PostgreSQL**: Host, database, usuário e senha
- **OpenAI API**: Sua chave da API
- **Evolution API**: URL e token do WhatsApp
- **SMTP**: Configurações de email

4. **Ativar Webhooks**:

- `/webhook/lead-site` - Receber leads do chat
- `/webhook/resposta-corretor` - Respostas dos corretores

### 5. Setup Evolution API (WhatsApp)

```bash
# Via Docker
docker run -d \
  --name evolution-api \
  -p 8080:8080 \
  -e AUTHENTICATION_API_KEY=your_api_key \
  -e AUTHENTICATION_EXPOSE_IN_FETCH_INSTANCES=true \
  atendai/evolution-api:latest
```

Configurar instância no Evolution:

- Criar instância "siqueira"
- Conectar com QR Code
- Configurar webhook para N8N

### 6. Docker Compose (Produção)

```yaml
version: "3.8"
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: bdsitejuarez
      POSTGRES_USER: sitejuarez
      POSTGRES_PASSWORD: juarez123
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgresql://sitejuarez:juarez123@postgres:5432/bdsitejuarez
      - NODE_ENV=production

  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    environment:
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=sitejuarez
      - DB_POSTGRESDB_PASSWORD=juarez123
    volumes:
      - n8n_data:/home/node/.n8n

  evolution-api:
    image: atendai/evolution-api:latest
    ports:
      - "8080:8080"
    environment:
      - AUTHENTICATION_API_KEY=your_evolution_key

volumes:
  postgres_data:
  n8n_data:
```

## 📱 Contatos da Empresa

- **WhatsApp**: (62) 9 8556-3505
- **Instagram**: @imoveissiqueiracampos
- **Email**: SiqueiraCamposImoveisGoiania@gmail.com
- **Localização**: Goiânia - GO

## 🔧 Desenvolvido por Kryonix

- **WhatsApp**: (17) 9 8180-5327
- **Instagram**: @kryon.ix
- **CEO**: Vitor Jayme Fernandes Ferreira

## 🗂️ Estrutura do Projeto

```
├── client/                 # Frontend React
│   ├── pages/             # Páginas da aplicação
│   │   ├── dashboards/    # Dashboards especializados
│   │   ├── Index.tsx      # Homepage
│   │   └── Login.tsx      # Autenticação
│   ├── components/        # Componentes reutilizáveis
│   │   ├── ui/           # Componentes base (Radix UI)
│   │   └── ChatBubble.tsx # Chat com IA
│   └── global.css        # Estilos globais + tema
├── server/                # Backend Express
│   ├── routes/           # Rotas da API
│   │   ├── auth.ts       # Autenticação
│   │   ├── imoveis.ts    # CRUD imóveis
│   │   ├── leads.ts      # Gestão de leads
│   │   ├── corretor.ts   # APIs do corretor
│   │   └── chat.ts       # Chat com IA
│   ├── middleware/       # Middlewares
│   └── index.ts         # Servidor principal
├── shared/               # Tipos compartilhados
├── prisma/              # Esquema do banco
├── n8n-fluxo-imobiliaria-completo.json # Fluxo N8N
└── README.md           # Este arquivo
```

## 🎯 Funcionalidades por Papel

### 👑 Admin

- ✅ Gestão completa de usuários
- ✅ Relatórios financeiros
- ✅ Controle de comissões
- ✅ Análise de performance
- ✅ Configurações do sistema
- ✅ Logs de auditoria

### 🏘️ Corretor

- ✅ Configuração WhatsApp + Status ativo/inativo
- ✅ Assumir leads via "ASSUMIR" no WhatsApp
- ✅ CRUD completo de imóveis
- ✅ Gestão de visitas
- ✅ Acompanhamento de comissões
- ✅ Dashboard com estatísticas

### 👨‍💼 Assistente

- ✅ Mesmo que corretor, exceto finanças
- ✅ Não visualiza comissões
- ✅ Foco em operação e atendimento

### 👤 Cliente

- ✅ Lista de favoritos
- ✅ Histórico de interações
- ✅ Chat com corretores
- ✅ Agendamento de visitas
- ✅ Contratos e documentos

### 📊 Marketing

- ✅ Campanhas de email
- ✅ Análise de leads por origem
- ✅ Relatórios de conversão
- ✅ Integração Meta API
- ✅ Configuração N8N

### 🛠️ Desenvolvedor

- ��� Logs de sistema
- ✅ Status de serviços
- ✅ Ferramentas de debug
- ✅ Monitoramento de performance
- ✅ Configuração de manutenção

## 🔄 Fluxo de Desenvolvimento

1. **Desenvolvimento Local**: `npm run dev`
2. **Testes**: `npm test`
3. **Build**: `npm run build`
4. **Deploy**: `npm start` ou Docker

## 📋 Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar dev server
npm run build           # Build para produção
npm start              # Iniciar produção

# Banco de dados
npx prisma studio      # Interface visual do banco
npx prisma migrate dev # Aplicar migrações
npx prisma generate    # Gerar cliente

# Testes
npm test               # Executar testes
npm run test:watch     # Testes em modo watch

# Utilitários
npm run typecheck      # Verificar tipos TypeScript
npm run format.fix     # Formatar código
```

## 🔒 Segurança

- ✅ Autenticação JWT
- ✅ Middleware de autorização por papel
- ✅ Validação de dados com Zod
- ✅ Hash de senhas com bcrypt
- ✅ Rate limiting
- ✅ Logs de auditoria
- ✅ Sanitização de inputs

## 📈 Monitoramento

- ✅ Logs estruturados
- ✅ Métricas de performance
- ✅ Alertas de erro
- ✅ Dashboard do desenvolvedor
- ✅ Análise de uso

## 🚀 Deploy em Produção

### Netlify/Vercel (Frontend)

1. Build automático do cliente
2. Deploy de SPA
3. Configuração de rotas

### VPS/Cloud (Backend)

1. PostgreSQL configurado
2. N8N rodando
3. Evolution API ativa
4. SSL/HTTPS configurado
5. Backups automáticos

## 📞 Suporte

Para dúvidas ou suporte técnico:

- **Desenvolvedor**: (17) 9 8180-5327
- **Email**: contato@kryonix.dev
- **Instagram**: @kryon.ix

---

**© 2024 Siqueira Campos Imóveis | Desenvolvido por Kryonix**
