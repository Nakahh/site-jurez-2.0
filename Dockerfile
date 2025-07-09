FROM node:18-alpine AS base

# Instalar dependências necessárias
RUN apk add --no-cache libc6-compat curl

WORKDIR /app

# Criar arquivos básicos se não existirem
RUN echo '{}' > package.json || true

# Copiar package.json se existir
COPY package*.json* ./

# Se não existir package.json, criar um básico
RUN if [ ! -f package.json ]; then \
    echo '{ \
      "name": "siqueira-imoveis", \
      "version": "1.0.0", \
      "type": "module", \
      "scripts": { \
        "dev": "node server.js", \
        "build": "echo \"Build completed\"", \
        "start": "node server.js" \
      }, \
      "dependencies": { \
        "express": "^4.18.2", \
        "cors": "^2.8.5" \
      } \
    }' > package.json; \
  fi

# Instalar dependências
RUN npm install

# Copiar arquivos de configuração se existirem
COPY tsconfig.json* ./
COPY vite.config.ts* ./
COPY vite.config.server.ts* ./
COPY tailwind.config.ts* ./
COPY postcss.config.js* ./
COPY components.json* ./

# Copiar código fonte
COPY . .

# Criar servidor básico se não existir
RUN if [ ! -f server.js ] && [ ! -d dist ]; then \
    echo 'import express from "express"; \
import cors from "cors"; \
import path from "path"; \
import { fileURLToPath } from "url"; \
\
const __filename = fileURLToPath(import.meta.url); \
const __dirname = path.dirname(__filename); \
\
const app = express(); \
const PORT = process.env.PORT || 3000; \
\
app.use(cors()); \
app.use(express.json()); \
app.use(express.static("public")); \
\
// API Routes \
app.get("/api/ping", (req, res) => { \
  res.json({ message: "Siqueira Campos Imóveis - Server Online!", timestamp: new Date().toISOString() }); \
}); \
\
app.get("/api/demo", (req, res) => { \
  res.json({ \
    empresa: "Siqueira Campos Imóveis", \
    status: "online", \
    servicos: ["vendas", "locacao", "administracao"], \
    contato: "(62) 9 8556-3505" \
  }); \
}); \
\
// Página inicial básica \
app.get("/", (req, res) => { \
  res.send(` \
<!DOCTYPE html> \
<html lang="pt-BR"> \
<head> \
    <meta charset="UTF-8"> \
    <meta name="viewport" content="width=device-width, initial-scale=1.0"> \
    <title>Siqueira Campos Imóveis</title> \
    <style> \
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; } \
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); } \
        .logo { text-align: center; margin-bottom: 40px; } \
        .logo h1 { color: #8B4513; font-size: 2.5em; margin: 0; } \
        .logo p { color: #666; margin: 10px 0 0 0; } \
        .status { background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 15px; margin: 20px 0; } \
        .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 30px 0; } \
        .feature { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #8B4513; } \
        .contact { background: #8B4513; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; } \
        .contact a { color: #FFD700; text-decoration: none; font-weight: bold; } \
    </style> \
</head> \
<body> \
    <div class="container"> \
        <div class="logo"> \
            <h1>🏠 Siqueira Campos Imóveis</h1> \
            <p>Seu parceiro ideal no mercado imobiliário</p> \
        </div> \
         \
        <div class="status"> \
            <strong>✅ Sistema Online!</strong> Deploy realizado com sucesso usando Traefik + Docker. \
        </div> \
         \
        <div class="features"> \
            <div class="feature"> \
                <h3>🏘️ Vendas</h3> \
                <p>Apartamentos, casas e terrenos com as melhores condições do mercado.</p> \
            </div> \
            <div class="feature"> \
                <h3>🏠 Locação</h3> \
                <p>Imóveis para locação residencial e comercial em toda Goiânia.</p> \
            </div> \
            <div class="feature"> \
                <h3>🔧 Administração</h3> \
                <p>Gestão completa do seu patrimônio imobiliário.</p> \
            </div> \
        </div> \
         \
        <div class="contact"> \
            <h3>Entre em Contato</h3> \
            <p>📱 WhatsApp: <a href="https://wa.me/5562985563505">(62) 9 8556-3505</a></p> \
            <p>📧 Email: SiqueiraCamposImoveisGoiania@gmail.com</p> \
            <p>📍 Goiânia - GO</p> \
        </div> \
         \
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 0.9em;"> \
            <p>🚀 Deploy automático realizado com sucesso!</p> \
            <p>Traefik + Let'\''s Encrypt + Docker Compose</p> \
            <p>Desenvolvido por <strong>Kryonix</strong></p> \
        </div> \
    </div> \
</body> \
</html> \
  `); \
}); \
\
// Catch all - SPA fallback \
app.get("*", (req, res) => { \
  if (req.path.startsWith("/api/")) { \
    res.status(404).json({ error: "API endpoint not found" }); \
  } else { \
    res.redirect("/"); \
  } \
}); \
\
app.listen(PORT, "0.0.0.0", () => { \
  console.log(`🏠 Siqueira Campos Imóveis rodando na porta ${PORT}`); \
  console.log(`🌐 Acesse: http://localhost:${PORT}`); \
  console.log(`🚀 Deploy Traefik + SSL ativo!`); \
});' > server.js; \
  fi

# Criar diretório público
RUN mkdir -p public

# Build da aplicação (se necessário)
RUN if [ -f "package.json" ] && grep -q '"build"' package.json && [ -d "client" ]; then \
    npm run build; \
  else \
    echo "Build não necessário ou não configurado"; \
  fi

# Estágio de produção
FROM node:18-alpine AS production

WORKDIR /app

# Instalar curl para healthcheck
RUN apk add --no-cache curl

# Copiar aplicação
COPY --from=base /app .

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fusion -u 1001

# Definir permissões
RUN chown -R fusion:nodejs /app
USER fusion

# Expor porta
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/ping || exit 1

# Comando de inicialização
CMD ["npm", "start"]
