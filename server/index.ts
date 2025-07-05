import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { authenticateToken } from "./middleware/auth";

// Importar rotas
import * as authRoutes from "./routes/auth";
import * as imovelRoutes from "./routes/imoveis";
import * as leadRoutes from "./routes/leads";
import * as corretorRoutes from "./routes/corretor";
import * as chatRoutes from "./routes/chat";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Rotas públicas
  app.get("/api/ping", (_req, res) => {
    res.json({ message: "Siqueira Campos Imóveis API v1.0" });
  });

  app.get("/api/demo", handleDemo);

  // Rotas de autenticação
  app.post("/api/auth/login", authRoutes.login);
  app.post("/api/auth/register", authRoutes.register);
  app.post("/api/auth/google/callback", authRoutes.googleCallback);
  app.post("/api/auth/logout", authenticateToken, authRoutes.logout);
  app.get("/api/auth/me", authenticateToken, authRoutes.me);

  // Rotas de imóveis
  app.get("/api/imoveis", imovelRoutes.getImoveis);
  app.get("/api/imoveis/destaque", imovelRoutes.getImoveisDestaque);
  app.get("/api/imoveis/:id", imovelRoutes.getImovel);
  app.post("/api/imoveis", authenticateToken, imovelRoutes.createImovel);
  app.put("/api/imoveis/:id", authenticateToken, imovelRoutes.updateImovel);
  app.delete("/api/imoveis/:id", authenticateToken, imovelRoutes.deleteImovel);

  // Rotas de favoritos
  app.post(
    "/api/imoveis/:id/favorito",
    authenticateToken,
    imovelRoutes.toggleFavorito,
  );
  app.get("/api/favoritos", authenticateToken, imovelRoutes.getFavoritos);

  // Rotas de leads
  app.post("/api/leads", leadRoutes.createLead);
  app.get("/api/leads", authenticateToken, leadRoutes.getLeads);
  app.post("/api/leads/:id/assumir", authenticateToken, leadRoutes.assumirLead);
  app.patch(
    "/api/leads/:id/status",
    authenticateToken,
    leadRoutes.atualizarStatusLead,
  );
  app.get(
    "/api/leads/stats",
    authenticateToken,
    leadRoutes.getEstatisticasLeads,
  );
  app.get(
    "/api/leads/por-corretor",
    authenticateToken,
    leadRoutes.getLeadsPorCorretor,
  );

  // Webhook para N8N
  app.post(
    "/api/webhook/resposta-corretor",
    leadRoutes.webhookRespostaCorretor,
  );

  // Rotas do corretor
  app.get(
    "/api/corretor/info",
    authenticateToken,
    corretorRoutes.getCorretorInfo,
  );
  app.patch(
    "/api/corretor/whatsapp",
    authenticateToken,
    corretorRoutes.updateCorretorWhatsApp,
  );
  app.get(
    "/api/corretor/leads",
    authenticateToken,
    corretorRoutes.getCorretorLeads,
  );
  app.get(
    "/api/corretor/imoveis",
    authenticateToken,
    corretorRoutes.getCorretorImoveis,
  );
  app.get(
    "/api/corretor/comissoes",
    authenticateToken,
    corretorRoutes.getCorretorComissoes,
  );
  app.get(
    "/api/corretor/stats",
    authenticateToken,
    corretorRoutes.getCorretorStats,
  );
  app.get("/api/corretores/ativos", corretorRoutes.getCorretoresAtivos);

  // Rotas de chat
  app.post("/api/chat", chatRoutes.chat);
  app.get(
    "/api/chat/historico",
    authenticateToken,
    chatRoutes.getHistoricoChat,
  );
  app.post("/api/chat/corretor", authenticateToken, chatRoutes.chatComCorretor);
  app.post(
    "/api/chat/responder",
    authenticateToken,
    chatRoutes.responderCliente,
  );

  return app;
}
