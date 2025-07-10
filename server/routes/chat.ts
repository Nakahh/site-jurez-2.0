import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { ChatRequest, ChatResponse } from "@shared/types";

const prisma = new PrismaClient();

// Simulação de IA - em produção, usar OpenAI ou outro provedor
async function processarMensagemIA(
  mensagem: string,
  contexto?: string,
): Promise<string> {
  // Respostas pré-programadas para simulação
  const respostas = {
    saudacao: [
      "Olá! Sou a assistente da Siqueira Campos Imóveis. Como posso ajudar você hoje?",
      "Oi! Bem-vindo à Siqueira Campos Imóveis! Em que posso ajudar?",
      "Olá! Estou aqui para ajudar com suas dúvidas sobre imóveis. O que você procura?",
    ],
    imoveis: [
      "Temos vários imóveis disponíveis! Você está procurando para comprar ou alugar?",
      "Nosso catálogo tem casas, apartamentos e terrenos. Qual tipo te interessa?",
      "Posso ajudar você a encontrar o imóvel ideal! Em qual região você prefere?",
    ],
    visita: [
      "Claro! Posso agendar uma visita para você. Um de nossos corretores entrará em contato em breve.",
      "Vou conectar você com um de nossos corretores para agendar a visita!",
      "Perfeito! Nosso corretor irá entrar em contato para agendar sua visita.",
    ],
    financiamento: [
      "Temos parcerias com vários bancos para financiamento. Nossos corretores podem te orientar sobre as melhores condições!",
      "Posso te explicar sobre as opções de financiamento disponíveis. Um corretor especializado irá te atender!",
    ],
    default: [
      "Entendi sua pergunta! Um de nossos corretores especialistas irá te atender para dar mais detalhes.",
      "Vou conectar você com um corretor que pode ajudar melhor com sua solicitação!",
      "Deixe-me chamar um corretor para conversar com você e esclarecer todas suas dúvidas!",
    ],
  };

  const mensagemLower = mensagem.toLowerCase();

  let categoria = "default";

  if (
    mensagemLower.includes("olá") ||
    mensagemLower.includes("oi") ||
    mensagemLower.includes("bom dia") ||
    mensagemLower.includes("boa tarde") ||
    mensagemLower.includes("boa noite")
  ) {
    categoria = "saudacao";
  } else if (
    mensagemLower.includes("imóvel") ||
    mensagemLower.includes("casa") ||
    mensagemLower.includes("apartamento") ||
    mensagemLower.includes("terreno")
  ) {
    categoria = "imoveis";
  } else if (
    mensagemLower.includes("visita") ||
    mensagemLower.includes("agendar") ||
    mensagemLower.includes("conhecer") ||
    mensagemLower.includes("ver")
  ) {
    categoria = "visita";
  } else if (
    mensagemLower.includes("financiamento") ||
    mensagemLower.includes("financiar") ||
    mensagemLower.includes("banco") ||
    mensagemLower.includes("prestação")
  ) {
    categoria = "financiamento";
  }

  const respostasCategoria = respostas[categoria as keyof typeof respostas];
  const resposta =
    respostasCategoria[Math.floor(Math.random() * respostasCategoria.length)];

  return resposta;
}

export const chat: RequestHandler = async (req, res) => {
  try {
    const { mensagem, usuarioId, contexto }: ChatRequest = req.body;

    if (!mensagem || mensagem.trim().length === 0) {
      return res.status(400).json({ error: "Mensagem é obrigatória" });
    }

    // Processar com IA
    const resposta = await processarMensagemIA(mensagem, contexto);

    // Salvar conversa se usuário logado
    if (usuarioId) {
      await prisma.mensagem.createMany({
        data: [
          {
            conteudo: mensagem,
            tipo: "TEXTO",
            remetenteId: usuarioId,
          },
          {
            conteudo: resposta,
            tipo: "TEXTO",
            remetenteId: "sistema", // We'll need to handle this properly
          },
        ],
      });
    }

    // Log da ação
    await prisma.logSistema.create({
      data: {
        acao: "CHAT_IA",
        detalhes: `Chat IA - Pergunta: ${mensagem.substring(0, 100)}`,
        usuarioId: usuarioId || undefined,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    const response: ChatResponse = {
      resposta,
      timestamp: new Date(),
    };

    res.json(response);
  } catch (error) {
    console.error("Erro no chat IA:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getHistoricoChat: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const { page = 1, limit = 50 } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const mensagens = await prisma.mensagem.findMany({
      where: {
        OR: [
          { remetente: req.user.userId },
          { destinatario: req.user.userId },
          { remetente: "IA" },
        ],
      },
      skip,
      take: parseInt(limit as string),
      orderBy: {
        criadoEm: "asc",
      },
    });

    // Agrupar mensagens por conversa
    const conversas = mensagens.reduce(
      (acc, mensagem) => {
        const key = `${mensagem.remetenteId}-IA`;
        if (!acc[key]) acc[key] = [];
        acc[key].push({
          id: mensagem.id,
          conteudo: mensagem.conteudo,
          remetente: mensagem.remetente === req.user!.userId ? "usuario" : "ia",
          timestamp: mensagem.criadoEm,
        });
        return acc;
      },
      {} as Record<string, any[]>,
    );

    res.json(Object.values(conversas).flat());
  } catch (error) {
    console.error("Erro ao buscar histórico do chat:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const chatComCorretor: RequestHandler = async (req, res) => {
  try {
    const { corretorId, mensagem } = req.body;
    const clienteId = req.user?.userId;

    if (!clienteId) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    // Verificar se o corretor existe
    const corretor = await prisma.usuario.findUnique({
      where: { id: corretorId },
      select: { id: true, nome: true, whatsapp: true, ativo: true },
    });

    if (!corretor) {
      return res.status(404).json({ error: "Corretor não encontrado" });
    }

    if (!corretor.ativo) {
      return res
        .status(400)
        .json({ error: "Corretor não está disponível no momento" });
    }

    // Salvar mensagem
    const novaMensagem = await prisma.mensagem.create({
      data: {
        conteudo: mensagem,
        remetente: clienteId,
        destinatario: corretorId,
      },
    });

    // Criar notificação para o corretor
    await prisma.notificacao.create({
      data: {
        titulo: "Nova mensagem",
        mensagem: `Você recebeu uma nova mensagem: ${mensagem.substring(0, 50)}...`,
        tipo: "SISTEMA",
        usuarioId: corretorId,
      },
    });

    // Aqui você pode integrar com WhatsApp ou outra forma de notificar o corretor
    if (corretor.whatsapp && process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(`${process.env.N8N_WEBHOOK_URL}/mensagem-corretor`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            corretorWhatsApp: corretor.whatsapp,
            corretorNome: corretor.nome,
            clienteId,
            mensagem,
          }),
        });
      } catch (error) {
        console.error("Erro ao notificar corretor via N8N:", error);
      }
    }

    res.json({
      message: "Mensagem enviada com sucesso",
      mensagem: novaMensagem,
    });
  } catch (error) {
    console.error("Erro ao enviar mensagem para corretor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const responderCliente: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const { clienteId, mensagem } = req.body;

    // Verificar se é corretor
    if (
      req.user.papel !== "CORRETOR" &&
      req.user.papel !== "ASSISTENTE" &&
      req.user.papel !== "ADMIN"
    ) {
      return res
        .status(403)
        .json({ error: "Apenas corretores podem responder clientes" });
    }

    // Salvar resposta
    const novaMensagem = await prisma.mensagem.create({
      data: {
        conteudo: mensagem,
        remetente: req.user.userId,
        destinatario: clienteId,
      },
    });

    // Criar notificação para o cliente
    await prisma.notificacao.create({
      data: {
        titulo: "Resposta do corretor",
        mensagem: `Seu corretor respondeu: ${mensagem.substring(0, 50)}...`,
        tipo: "SISTEMA",
        usuarioId: clienteId,
      },
    });

    res.json({
      message: "Resposta enviada com sucesso",
      mensagem: novaMensagem,
    });
  } catch (error) {
    console.error("Erro ao responder cliente:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
