import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { CreateLeadRequest, StatusLead } from "@shared/types";

const prisma = new PrismaClient();

export const getLeads: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const {
      status,
      page = 1,
      limit = 20,
      orderBy = "criadoEm",
      orderDirection = "desc",
    } = req.query;

    const filtros: any = {};

    // Filtrar por papel do usuário
    if (req.user.papel === "CORRETOR" || req.user.papel === "ASSISTENTE") {
      filtros.corretorId = req.user.userId;
    } else if (req.user.papel === "CLIENTE") {
      // Cliente só vê seus próprios leads criados por ele
      filtros.email = req.user.email;
    }
    // Admin e Marketing veem todos

    if (status) filtros.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where: filtros,
        include: {
          corretor: {
            select: {
              id: true,
              nome: true,
              whatsapp: true,
            },
          },
          imovel: {
            select: {
              id: true,
              titulo: true,
              tipo: true,
              preco: true,
              bairro: true,
            },
          },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: {
          [orderBy as string]: orderDirection,
        },
      }),
      prisma.lead.count({ where: filtros }),
    ]);

    res.json({
      data: leads,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    console.error("Erro ao buscar leads:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createLead: RequestHandler = async (req, res) => {
  try {
    const { nome, telefone, email, mensagem, imovelId }: CreateLeadRequest =
      req.body;

    // Criar lead no banco
    const lead = await prisma.lead.create({
      data: {
        nome,
        telefone,
        email,
        mensagem,
        imovelId,
        origem: "SITE",
        status: StatusLead.PENDENTE,
      },
      include: {
        imovel: {
          select: {
            id: true,
            titulo: true,
            tipo: true,
            preco: true,
            bairro: true,
          },
        },
      },
    });

    // Enviar para N8N se configurado
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        const response = await fetch(
          `${process.env.N8N_WEBHOOK_URL}/lead-site`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              leadId: lead.id,
              nome: lead.nome,
              telefone: lead.telefone,
              mensagem: lead.mensagem,
              imovelTitulo: lead.imovel?.titulo,
            }),
          },
        );

        if (!response.ok) {
          console.error("Erro ao enviar lead para N8N:", response.statusText);
        }
      } catch (error) {
        console.error("Erro ao conectar com N8N:", error);
      }
    }

    // Log da ação
    await prisma.logSistema.create({
      data: {
        acao: "NOVO_LEAD",
        detalhes: `Novo lead criado: ${nome} - ${telefone}`,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.status(201).json(lead);
  } catch (error) {
    console.error("Erro ao criar lead:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const assumirLead: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const { id } = req.params;

    // Verificar se o lead existe e está pendente
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return res.status(404).json({ error: "Lead não encontrado" });
    }

    if (lead.status !== StatusLead.PENDENTE) {
      return res.status(400).json({ error: "Lead já foi assumido ou expirou" });
    }

    // Assumir o lead
    const leadAtualizado = await prisma.lead.update({
      where: { id },
      data: {
        status: StatusLead.ASSUMIDO,
        corretorId: req.user.userId,
      },
      include: {
        corretor: {
          select: {
            id: true,
            nome: true,
            whatsapp: true,
          },
        },
        imovel: {
          select: {
            id: true,
            titulo: true,
            tipo: true,
            preco: true,
            bairro: true,
          },
        },
      },
    });

    // Notificar N8N sobre a assumição do lead
    if (process.env.N8N_WEBHOOK_URL) {
      try {
        await fetch(`${process.env.N8N_WEBHOOK_URL}/resposta-corretor`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leadId: id,
            corretorId: req.user.userId,
            corretorNome: req.user.email,
            mensagem: "ASSUMIR",
          }),
        });
      } catch (error) {
        console.error("Erro ao notificar N8N:", error);
      }
    }

    // Criar notificação
    await prisma.notificacao.create({
      data: {
        titulo: "Lead Assumido",
        mensagem: `Você assumiu o lead de ${lead.nome}`,
        tipo: "LEAD",
        usuarioId: req.user.userId,
      },
    });

    // Log da ação
    await prisma.logSistema.create({
      data: {
        acao: "ASSUMIR_LEAD",
        detalhes: `Lead ${lead.nome} assumido`,
        usuarioId: req.user.userId,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.json(leadAtualizado);
  } catch (error) {
    console.error("Erro ao assumir lead:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const atualizarStatusLead: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const { id } = req.params;
    const { status, observacoes } = req.body;

    // Verificar se o lead existe
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return res.status(404).json({ error: "Lead não encontrado" });
    }

    // Verificar permissão
    if (
      req.user.papel !== "ADMIN" &&
      req.user.papel !== "MARKETING" &&
      lead.corretorId !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ error: "Sem permissão para atualizar este lead" });
    }

    const leadAtualizado = await prisma.lead.update({
      where: { id },
      data: { status },
      include: {
        corretor: {
          select: {
            id: true,
            nome: true,
            whatsapp: true,
          },
        },
        imovel: {
          select: {
            id: true,
            titulo: true,
            tipo: true,
            preco: true,
            bairro: true,
          },
        },
      },
    });

    // Log da ação
    await prisma.logSistema.create({
      data: {
        acao: "ATUALIZAR_STATUS_LEAD",
        detalhes: `Status do lead ${lead.nome} alterado para ${status}`,
        usuarioId: req.user.userId,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.json(leadAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar status do lead:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getLeadsPorCorretor: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    // Verificar se é admin ou marketing
    if (req.user.papel !== "ADMIN" && req.user.papel !== "MARKETING") {
      return res.status(403).json({ error: "Acesso negado" });
    }

    const leadsPorCorretor = await prisma.lead.groupBy({
      by: ["corretorId"],
      _count: {
        id: true,
      },
      where: {
        corretorId: {
          not: null,
        },
      },
    });

    // Buscar informações dos corretores
    const corretoresIds = leadsPorCorretor.map((item) => item.corretorId!);
    const corretores = await prisma.usuario.findMany({
      where: {
        id: {
          in: corretoresIds,
        },
      },
      select: {
        id: true,
        nome: true,
      },
    });

    const resultado = leadsPorCorretor.map((item) => ({
      corretor: corretores.find((c) => c.id === item.corretorId),
      totalLeads: item._count.id,
    }));

    res.json(resultado);
  } catch (error) {
    console.error("Erro ao buscar leads por corretor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getEstatisticasLeads: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const filtros: any = {};

    // Filtrar por papel do usuário
    if (req.user.papel === "CORRETOR" || req.user.papel === "ASSISTENTE") {
      filtros.corretorId = req.user.userId;
    }

    const [total, pendentes, assumidos, convertidos, expirados] =
      await Promise.all([
        prisma.lead.count({ where: filtros }),
        prisma.lead.count({
          where: { ...filtros, status: StatusLead.PENDENTE },
        }),
        prisma.lead.count({
          where: { ...filtros, status: StatusLead.ASSUMIDO },
        }),
        prisma.lead.count({
          where: { ...filtros, status: StatusLead.CONVERTIDO },
        }),
        prisma.lead.count({
          where: { ...filtros, status: StatusLead.EXPIRADO },
        }),
      ]);

    const estatisticas = {
      total,
      pendentes,
      assumidos,
      convertidos,
      expirados,
      taxaConversao: total > 0 ? (convertidos / total) * 100 : 0,
    };

    res.json(estatisticas);
  } catch (error) {
    console.error("Erro ao buscar estatísticas de leads:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

// Webhook para receber respostas dos corretores via N8N
export const webhookRespostaCorretor: RequestHandler = async (req, res) => {
  try {
    const { leadId, corretorId, mensagem } = req.body;

    if (mensagem?.toLowerCase().includes("assumir")) {
      // Verificar se o lead ainda está pendente
      const lead = await prisma.lead.findUnique({
        where: { id: leadId },
      });

      if (lead && lead.status === StatusLead.PENDENTE) {
        // Assumir o lead
        await prisma.lead.update({
          where: { id: leadId },
          data: {
            status: StatusLead.ASSUMIDO,
            corretorId: corretorId,
          },
        });

        // Log da ação
        await prisma.logSistema.create({
          data: {
            acao: "ASSUMIR_LEAD_WEBHOOK",
            detalhes: `Lead ${leadId} assumido via webhook por corretor ${corretorId}`,
            usuarioId: corretorId,
          },
        });

        res.json({ success: true, message: "Lead assumido com sucesso" });
      } else {
        res.status(400).json({ error: "Lead não disponível para assumir" });
      }
    } else {
      res.json({ success: true, message: "Mensagem processada" });
    }
  } catch (error) {
    console.error("Erro no webhook de resposta do corretor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
