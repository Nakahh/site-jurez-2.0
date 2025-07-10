import { RequestHandler } from "express";
import { exec } from "child_process";
import { promisify } from "util";
import crypto from "crypto";

const execAsync = promisify(exec);

// Secret do webhook (você deve configurar no GitHub)
const WEBHOOK_SECRET =
  process.env.GITHUB_WEBHOOK_SECRET || "your-webhook-secret";

// Função para verificar a assinatura do GitHub
function verifySignature(body: string, signature: string): boolean {
  if (!signature) return false;

  const hmac = crypto.createHmac("sha256", WEBHOOK_SECRET);
  const digest = "sha256=" + hmac.update(body, "utf8").digest("hex");

  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

export const handleWebhook: RequestHandler = async (req, res) => {
  try {
    const signature = req.headers["x-hub-signature-256"] as string;
    const body = JSON.stringify(req.body);

    // Verificar assinatura do GitHub
    if (!verifySignature(body, signature)) {
      console.log("❌ Webhook: Assinatura inválida");
      return res.status(401).json({ error: "Unauthorized" });
    }

    const event = req.headers["x-github-event"];

    // Só processar eventos de push na branch main
    if (event === "push" && req.body.ref === "refs/heads/main") {
      console.log("🚀 Webhook: Iniciando auto-deploy...");

      // Executar script de deploy
      const deployResult = await execAsync("./scripts/auto-deploy.sh");

      console.log("✅ Webhook: Deploy concluído");
      console.log("📝 Saída:", deployResult.stdout);

      if (deployResult.stderr) {
        console.log("⚠️ Avisos:", deployResult.stderr);
      }

      return res.json({
        message: "Deploy executado com sucesso",
        timestamp: new Date().toISOString(),
      });
    }

    // Para outros eventos, apenas confirmar recebimento
    console.log(`📨 Webhook recebido: ${event}`);
    res.json({ message: "Webhook recebido", event });
  } catch (error) {
    console.error("❌ Erro no webhook:", error);
    res.status(500).json({
      error: "Erro interno do servidor",
      timestamp: new Date().toISOString(),
    });
  }
};
