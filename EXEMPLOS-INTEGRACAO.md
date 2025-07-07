# 📋 Exemplos Práticos de Integração

**Exemplos de código e configuração para cada integração do sistema premium**

---

## 🤖 Exemplos N8N

### Webhook Lead Site - Payload Exemplo

```json
{
  "nome": "João Silva",
  "telefone": "5562999887766",
  "mensagem": "Gostaria de conhecer apartamentos de 2 quartos no Setor Bueno",
  "origem": "chat_site",
  "timestamp": "2024-12-15T10:30:00Z"
}
```

### Resposta da IA - Exemplo

```json
{
  "response": "Olá João Silva! Obrigado pelo contato. Nossa equipe está analisando sua solicitação de apartamentos de 2 quartos no Setor Bueno. Um de nossos corretores entrará em contato em breve para apresentar as melhores opções. Aguarde!"
}
```

### Webhook Resposta Corretor - Payload Exemplo

```json
{
  "from": "5562988776655",
  "message": "ASSUMIR",
  "leadId": "123",
  "corretorId": "456",
  "timestamp": "2024-12-15T10:35:00Z",
  "instanceName": "siqueirainstance"
}
```

---

## 📱 Exemplos Evolution API

### Enviar Mensagem para Corretor

```bash
curl -X POST http://localhost:8080/message/sendText/siqueirainstance \
  -H "Content-Type: application/json" \
  -H "apikey: siqueira_key_2024" \
  -d '{
    "number": "5562988776655",
    "text": "🏠 *Novo Lead - Siqueira Campos Imóveis*\n\n👤 *Cliente:* João Silva\n📞 *Telefone:* (62) 9 9988-7766\n💬 *Mensagem:* \"Gostaria de conhecer apartamentos de 2 quartos no Setor Bueno\"\n\n✅ Para assumir este atendimento, responda: *ASSUMIR*\n\n⏰ _Recebido em 15/12/2024 às 10:30_"
  }'
```

### Resposta de Confirmação

```bash
curl -X POST http://localhost:8080/message/sendText/siqueirainstance \
  -H "Content-Type: application/json" \
  -H "apikey: siqueira_key_2024" \
  -d '{
    "number": "5562988776655",
    "text": "✅ *Lead assumido com sucesso!*\n\nVocê assumiu o atendimento do cliente João Silva e pode iniciar o contato.\n\n👤 *Cliente:* João Silva\n📞 *Telefone:* (62) 9 9988-7766\n\n🏠 _Siqueira Campos Imóveis_"
  }'
```

### Notificação para Outros Corretores

```bash
curl -X POST http://localhost:8080/message/sendText/siqueirainstance \
  -H "Content-Type: application/json" \
  -H "apikey: siqueira_key_2024" \
  -d '{
    "number": "5562977665544",
    "text": "ℹ️ O lead foi assumido por Carlos Silva.\n\nObrigado pela disponibilidade! 😊\n\n🏠 _Siqueira Campos Imóveis_"
  }'
```

### Fallback para Cliente

```bash
curl -X POST http://localhost:8080/message/sendText/siqueirainstance \
  -H "Content-Type: application/json" \
  -H "apikey: siqueira_key_2024" \
  -d '{
    "number": "5562999887766",
    "text": "Olá João Silva! 👋\n\nNo momento nossos corretores estão ocupados, mas não se preocupe! 😊\n\nEntraremos em contato com você o mais breve possível para atendê-lo(a) da melhor forma.\n\nObrigado pelo interesse! 🏠✨\n\n_Siqueira Campos Imóveis_"
  }'
```

---

## 🧠 Exemplos OpenAI

### Prompt Sistema para N8N

```javascript
// Node Function no N8N
const systemPrompt = `Você é um assistente virtual inteligente da Siqueira Campos Imóveis, uma das principais imobiliárias de Goiânia.

Sua função é gerar respostas cordiais e profissionais para clientes que enviaram leads através do site.

Diretrizes:
1. Use o nome do cliente na resposta
2. Seja cordial e acolhedor
3. Confirme que recebeu a mensagem
4. Informe que um corretor entrará em contato
5. Mantenha tom profissional mas amigável
6. Resposta deve ter entre 20 a 40 palavras
7. Use emojis com moderação

Informações da empresa:
- Nome: Siqueira Campos Imóveis
- Localização: Goiânia, Goiás
- Especialidade: Apartamentos, casas, terrenos
- Diferenciais: Atendimento personalizado, experiência no mercado`;

const userMessage = `Cliente: ${$json.nome}
Telefone: ${$json.telefone}
Mensagem: "${$json.mensagem}"

Gere uma resposta automática cordial e profissional para este cliente.`;

return [
  {
    json: {
      systemPrompt: systemPrompt,
      userMessage: userMessage,
    },
  },
];
```

### Exemplos de Respostas da IA

```javascript
// Exemplo 1 - Busca por apartamento
const response1 =
  "Olá João Silva! Obrigado pelo interesse em apartamentos no Setor Bueno. Nossa equipe especializada entrará em contato em breve para apresentar as melhores opções disponíveis. Aguarde!";

// Exemplo 2 - Visita agendada
const response2 =
  "Olá Maria! Recebemos sua solicitação de visita para o apartamento. Um corretor confirmará o agendamento e enviará todos os detalhes em breve. Obrigado!";

// Exemplo 3 - Informações gerais
const response3 =
  "Olá Carlos! Obrigado pelo contato. Nossa equipe da Siqueira Campos Imóveis irá esclarecer todas suas dúvidas sobre financiamento em breve. Aguarde nosso retorno!";
```

---

## 📅 Exemplos Google Calendar

### Criar Evento via API

```javascript
// Função para criar evento no Google Calendar
const createCalendarEvent = async (agendamento) => {
  const event = {
    summary: `Visita - ${agendamento.clienteNome}`,
    location: agendamento.imovelEndereco,
    description: `Visita agendada via sistema\n\nCliente: ${agendamento.clienteNome}\nTelefone: ${agendamento.clienteTelefone}\nImóvel: ${agendamento.imovelTitulo}\n\nObservações: ${agendamento.observacoes || "Nenhuma"}`,
    start: {
      dateTime: agendamento.dataHora.toISOString(),
      timeZone: "America/Sao_Paulo",
    },
    end: {
      dateTime: new Date(
        agendamento.dataHora.getTime() + agendamento.duracao * 60000,
      ).toISOString(),
      timeZone: "America/Sao_Paulo",
    },
    attendees: [
      {
        email: agendamento.clienteEmail,
        displayName: agendamento.clienteNome,
      },
    ],
    reminders: {
      useDefault: false,
      overrides: [
        { method: "email", minutes: 60 },
        { method: "popup", minutes: 15 },
      ],
    },
  };

  return event;
};
```

### Exemplo de Payload para Agendamento

```json
{
  "clienteNome": "João Silva",
  "clienteEmail": "joao@email.com",
  "clienteTelefone": "5562999887766",
  "imovelId": "123",
  "imovelTitulo": "Apartamento 2 quartos - Setor Bueno",
  "imovelEndereco": "Rua das Flores, 123 - Setor Bueno, Goiânia-GO",
  "dataHora": "2024-12-20T14:00:00.000Z",
  "duracao": 60,
  "observacoes": "Cliente prefere visita no período da tarde",
  "corretorId": "456",
  "corretorNome": "Carlos Silva"
}
```

---

## 🗄️ Exemplos PostgreSQL

### Queries Utilizadas no N8N

#### Salvar Lead

```sql
INSERT INTO leads (nome, telefone, mensagem, status, origem, criado_em)
VALUES ('João Silva', '5562999887766', 'Gostaria de conhecer apartamentos', 'pendente', 'site', NOW())
RETURNING id;
```

#### Buscar Corretores Ativos

```sql
SELECT id, nome, whatsapp, email
FROM usuarios
WHERE ativo = true
  AND whatsapp IS NOT NULL
  AND whatsapp != ''
  AND tipo = 'CORRETOR'
ORDER BY id;
```

#### Assumir Lead

```sql
UPDATE leads
SET status = 'assumido',
    corretor_id = 456,
    assumido_em = NOW()
WHERE id = 123
  AND status = 'pendente';
```

#### Marcar Lead como Expirado

```sql
UPDATE leads
SET status = 'expirado'
WHERE id = 123
  AND status = 'pendente';
```

#### Buscar Leads do Corretor

```sql
SELECT l.*, i.titulo as imovel_titulo
FROM leads l
LEFT JOIN imoveis i ON l.imovel_id = i.id
WHERE l.corretor_id = 456
ORDER BY l.criado_em DESC;
```

---

## 🔧 Exemplos de Configuração

### arquivo .env para Produção

```bash
# Database
DATABASE_URL="postgresql://sitejuarez:nakah123@localhost:5432/bdsitejuarez"

# N8N Configuration
N8N_BASE_URL="http://localhost:5678"
N8N_WEBHOOK_LEAD_SITE="http://localhost:5678/webhook/lead-site"
N8N_WEBHOOK_RESPOSTA_CORRETOR="http://localhost:5678/webhook/resposta-corretor"

# Evolution API
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="siqueira_key_2024"
EVOLUTION_INSTANCE_NAME="siqueirainstance"

# OpenAI
OPENAI_API_KEY="sk-..."

# Google Calendar
GOOGLE_CLIENT_ID="xxx.googleusercontent.com"
GOOGLE_CLIENT_SECRET="..."

# Email SMTP
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="notificacoes@siqueicamposimoveis.com.br"
SMTP_PASS="..."

# JWT
JWT_SECRET="siqueira_secret_2024"
JWT_EXPIRES_IN="7d"
```

### Configuração Docker Compose para Produção

```yaml
version: "3.8"

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://sitejuarez:nakah123@db:5432/bdsitejuarez
    depends_on:
      - db
      - n8n
      - evolution-api

  db:
    image: postgres:15
    environment:
      POSTGRES_DB: bdsitejuarez
      POSTGRES_USER: sitejuarez
      POSTGRES_PASSWORD: nakah123
    volumes:
      - postgres_data:/var/lib/postgresql/data

  n8n:
    image: n8nio/n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=siqueira2024
    volumes:
      - n8n_data:/home/node/.n8n

  evolution-api:
    image: atendai/evolution-api:latest
    ports:
      - "8080:8080"
    environment:
      - AUTHENTICATION_API_KEY=siqueira_key_2024
      - STORE_MESSAGES=true

volumes:
  postgres_data:
  n8n_data:
```

---

## 📊 Exemplos de Templates de Mensagem

### Template Novo Lead

```javascript
const templateNovoLead = (lead) => `
🏠 *Novo Lead - Siqueira Campos Imóveis*

👤 *Cliente:* ${lead.nome}
📞 *Telefone:* ${lead.telefone}
💬 *Mensagem:* "${lead.mensagem}"
🌐 *Origem:* ${lead.origem}

✅ Para assumir este atendimento, responda: *ASSUMIR*

⏰ _Recebido em ${new Date().toLocaleString("pt-BR")}_
`;
```

### Template Lead Assumido

```javascript
const templateLeadAssumido = (lead, corretor) => `
✅ *Lead assumido com sucesso!*

Você assumiu o atendimento do cliente e pode iniciar o contato.

👤 *Cliente:* ${lead.nome}
📞 *Telefone:* ${lead.telefone}

🏠 _Siqueira Campos Imóveis_
`;
```

### Template Notificação Outros Corretores

```javascript
const templateOutrosCorretores = (corretor) => `
ℹ️ O lead foi assumido por ${corretor.nome}.

Obrigado pela disponibilidade! 😊

🏠 _Siqueira Campos Imóveis_
`;
```

### Template Fallback Cliente

```javascript
const templateFallbackCliente = (cliente) => `
Olá ${cliente.nome}! 👋

No momento nossos corretores estão ocupados, mas não se preocupe! 😊

Entraremos em contato com você o mais breve possível para atendê-lo(a) da melhor forma.

Obrigado pelo interesse! 🏠✨

_Siqueira Campos Imóveis_
`;
```

---

## 🎯 Exemplos de Estatísticas

### Query para Dashboard de Performance

```sql
-- Performance do Corretor
SELECT
  c.nome as corretor_nome,
  COUNT(l.id) as total_leads,
  COUNT(CASE WHEN l.status = 'assumido' THEN 1 END) as leads_assumidos,
  COUNT(CASE WHEN l.status = 'pendente' THEN 1 END) as leads_pendentes,
  COUNT(CASE WHEN l.status = 'expirado' THEN 1 END) as leads_expirados,
  AVG(EXTRACT(EPOCH FROM (l.assumido_em - l.criado_em))/60) as tempo_medio_resposta_min,
  ROUND(
    COUNT(CASE WHEN l.status = 'assumido' THEN 1 END) * 100.0 /
    NULLIF(COUNT(l.id), 0),
    2
  ) as taxa_conversao
FROM usuarios c
LEFT JOIN leads l ON c.id = l.corretor_id
WHERE c.tipo = 'CORRETOR'
  AND l.criado_em >= NOW() - INTERVAL '30 days'
GROUP BY c.id, c.nome
ORDER BY taxa_conversao DESC;
```

### Exemplo de Resposta da Query

```json
{
  "corretor_nome": "Carlos Silva",
  "total_leads": 45,
  "leads_assumidos": 38,
  "leads_pendentes": 2,
  "leads_expirados": 5,
  "tempo_medio_resposta_min": 3.2,
  "taxa_conversao": 84.44
}
```

---

## 🚨 Exemplos de Logs e Monitoramento

### Log de Execução N8N

```json
{
  "executionId": "12345",
  "workflowId": "lead-management",
  "status": "success",
  "startTime": "2024-12-15T10:30:00Z",
  "endTime": "2024-12-15T10:30:15Z",
  "duration": 15000,
  "nodes": [
    {
      "name": "Webhook Lead Site",
      "status": "success",
      "data": {
        "nome": "João Silva",
        "telefone": "5562999887766"
      }
    },
    {
      "name": "Salvar Lead",
      "status": "success",
      "data": {
        "leadId": 123
      }
    },
    {
      "name": "Enviar WhatsApp",
      "status": "success",
      "data": {
        "messagesSent": 3
      }
    }
  ]
}
```

### Log de Erro

```json
{
  "executionId": "12346",
  "workflowId": "lead-management",
  "status": "error",
  "error": {
    "message": "Connection to Evolution API failed",
    "node": "Enviar WhatsApp",
    "details": "HTTP 500 - Service unavailable"
  },
  "timestamp": "2024-12-15T10:35:00Z"
}
```

---

## 📧 Exemplo de Email de Fallback

### Template HTML para Gerente

```html
<!doctype html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Lead não atendido - Siqueira Campos Imóveis</title>
  </head>
  <body
    style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;"
  >
    <div
      style="background: #8B4513; color: white; padding: 20px; text-align: center;"
    >
      <h1>🚨 Lead não atendido</h1>
    </div>

    <div style="padding: 20px;">
      <h2>Atenção necessária!</h2>

      <p>
        Um lead não foi assumido por nenhum corretor nos últimos 15 minutos:
      </p>

      <div
        style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;"
      >
        <strong>👤 Cliente:</strong> {{nome}}<br />
        <strong>📞 Telefone:</strong> {{telefone}}<br />
        <strong>💬 Mensagem:</strong> "{{mensagem}}"<br />
        <strong>🌐 Origem:</strong> {{origem}}<br />
        <strong>⏰ Recebido em:</strong> {{criadoEm}}
      </div>

      <p><strong>Ação necessária:</strong></p>
      <ul>
        <li>Verificar disponibilidade dos corretores</li>
        <li>Fazer contato manual com o cliente</li>
        <li>Revisar configurações do sistema de leads</li>
      </ul>

      <div style="text-align: center; margin: 30px 0;">
        <a
          href="http://localhost:5173/dashboard/leads/{{leadId}}"
          style="background: #8B4513; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;"
        >
          Ver Lead no Sistema
        </a>
      </div>
    </div>

    <div
      style="background: #f5f5f5; padding: 20px; text-align: center; color: #666;"
    >
      <p>Siqueira Campos Imóveis - Sistema de Gestão de Leads</p>
    </div>
  </body>
</html>
```

---

**📞 Suporte Técnico:**

- WhatsApp: (17) 9 8180-5327
- Instagram: @kryon.ix
- Email: contato@kryonix.dev

---

_Desenvolvido por Kryonix - Vitor Jayme Fernandes Ferreira_
_Exemplos criados em: Dezembro 2024_
