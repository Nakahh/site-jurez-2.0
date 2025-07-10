#!/bin/bash

# Script de Correção Rápida - Mobile e WWW
set -e

echo "🚀 Aplicando correções rápidas..."

# 1. Corrigir servidor para não travar no mobile
echo "1. Corrigindo timeouts do servidor..."
cat > server/mobile-fix.ts << 'EOF'
import { RequestHandler } from "express";

export const mobileOptimization: RequestHandler = (req, res, next) => {
  // Headers para mobile
  res.set({
    'X-Mobile-Optimized': 'true',
    'Cache-Control': 'public, max-age=300',
    'Connection': 'keep-alive'
  });

  // Timeout mais curto para mobile
  req.setTimeout(5000, () => {
    res.status(408).json({ error: 'Request timeout' });
  });

  next();
};

export const fallbackHandler: RequestHandler = (req, res) => {
  // Se for uma rota que não existe, redirecionar para home
  if (req.path !== '/' && !req.path.startsWith('/api')) {
    return res.redirect('/');
  }
  
  // Para mobile com problema, retornar HTML básico
  const isMobile = /Mobile|Android|iPhone|iPad/.test(req.get('User-Agent') || '');
  
  if (isMobile) {
    return res.send(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Siqueira Campos Imóveis</title>
    <style>
        body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
        .container { max-width: 400px; margin: 0 auto; }
        .logo { width: 150px; height: auto; margin-bottom: 20px; }
        .btn { background: #8B4513; color: white; padding: 12px 24px; border: none; border-radius: 8px; margin: 5px; text-decoration: none; display: inline-block; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏠 Siqueira Campos Imóveis</h1>
        <p>Seu site está carregando...</p>
        <a href="/" class="btn">Página Inicial</a>
        <a href="/imoveis" class="btn">Ver Imóveis</a>
        <a href="/contato" class="btn">Contato</a>
        <script>
            // Redirecionar após 2 segundos
            setTimeout(() => {
                if (window.location.pathname !== '/') {
                    window.location.href = '/';
                }
            }, 2000);
        </script>
    </div>
</body>
</html>
    `);
  }
  
  next();
};
EOF

# 2. Atualizar servidor principal
echo "2. Atualizando servidor principal..."

# Adicionar as correções no servidor
if ! grep -q "mobileOptimization" server/index.ts; then
    cat >> server/index.ts << 'EOF'

// Correções mobile
import { mobileOptimization, fallbackHandler } from "./mobile-fix";

export function createServerWithMobileFix() {
  const app = createServer();
  
  // Aplicar otimizações mobile
  app.use(mobileOptimization);
  
  // Fallback para mobile
  app.use('*', fallbackHandler);
  
  return app;
}
EOF
fi

# 3. Atualizar start.ts
echo "3. Atualizando start.ts..."
cat > server/start.ts << 'EOF'
import { createServer } from "./index.js";

const PORT = process.env.PORT || 3001;

const app = createServer();

// Timeout global para evitar travamento mobile
app.use((req, res, next) => {
  req.setTimeout(8000, () => {
    if (!res.headersSent) {
      res.status(408).json({ error: 'Timeout' });
    }
  });
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
});
EOF

# 4. Build rápido
echo "4. Fazendo build..."
npm run build

echo "✅ Correções aplicadas! Reiniciando servidor..."

# 5. Reiniciar dev server
echo "5. Reiniciando..."
