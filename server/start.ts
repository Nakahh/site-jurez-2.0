import { createServer } from "./index";

const app = createServer();
const PORT = process.env.ADMIN_PORT || 3001;

// Timeout global para evitar travamento mobile
app.use((req, res, next) => {
  // Detectar mobile
  const isMobile = /Mobile|Android|iPhone|iPad/.test(
    req.get("User-Agent") || "",
  );
  const timeout = isMobile ? 5000 : 15000;

  req.setTimeout(timeout, () => {
    if (!res.headersSent) {
      console.log(`⏰ Timeout na rota: ${req.path} - Mobile: ${isMobile}`);
      res.status(408).json({ error: "Request timeout", mobile: isMobile });
    }
  });

  // Headers para mobile
  if (isMobile) {
    res.set({
      "X-Mobile-Optimized": "true",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Connection: "close",
    });
  }

  next();
});

// Fallback para rotas SPA
app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }

  res.status(200).json({
    message: "SPA Route - handled by frontend",
    path: req.path,
    mobile: /Mobile|Android|iPhone|iPad/.test(req.get("User-Agent") || ""),
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor backend rodando na porta ${PORT}`);
  console.log(`📡 API disponível em http://localhost:${PORT}/api`);
  console.log(`📱 Otimizações mobile ativadas`);
});
