import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { UpdateCorretorRequest } from "@shared/types";

const prisma = new PrismaClient();

export const getCorretorInfo: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const corretor = await prisma.usuario.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        nome: true,
        email: true,
        whatsapp: true,
        ativo: true,
        papel: true,
        avatar: true,
        criadoEm: true,
      },
    });

    if (!corretor) {
      return res.status(404).json({ error: "Corretor não encontrado" });
    }

    res.json(corretor);
  } catch (error) {
    console.error("Erro ao buscar informações do corretor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updateCorretorWhatsApp: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const { whatsapp, ativo }: UpdateCorretorRequest = req.body;

    // Validar formato do WhatsApp (opcional)
    if (whatsapp && !/^\d{10,15}$/.test(whatsapp.replace(/\D/g, ""))) {
      return res.status(400).json({ error: "Formato de WhatsApp inválido" });
    }

    const corretorAtualizado = await prisma.usuario.update({
      where: { id: req.user.userId },
      data: {
        ...(whatsapp !== undefined && { whatsapp }),
        ...(ativo !== undefined && { ativo }),
      },
      select: {
        id: true,
        nome: true,
        email: true,
        whatsapp: true,
        ativo: true,
        papel: true,
        avatar: true,
        criadoEm: true,
      },
    });

    // Log da ação
    await prisma.logSistema.create({
      data: {
        acao: "ATUALIZAR_WHATSAPP_STATUS",
        detalhes: `Corretor ${corretorAtualizado.nome} atualizou WhatsApp: ${whatsapp}, Ativo: ${ativo}`,
        usuarioId: req.user.userId,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.json(corretorAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar WhatsApp do corretor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getCorretorLeads: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const {
      status,
      page = 1,
      limit = 10,
      orderBy = "criadoEm",
      orderDirection = "desc",
    } = req.query;

    const filtros: any = {
      corretorId: req.user.userId,
    };

    if (status) filtros.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where: filtros,
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
    console.error("Erro ao buscar leads do corretor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getCorretorImoveis: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const {
      status,
      page = 1,
      limit = 12,
      orderBy = "criadoEm",
      orderDirection = "desc",
    } = req.query;

    const filtros: any = {
      corretorId: req.user.userId,
    };

    if (status) filtros.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [imoveis, total] = await Promise.all([
      prisma.imovel.findMany({
        where: filtros,
        skip,
        take: parseInt(limit as string),
        orderBy: {
          [orderBy as string]: orderDirection,
        },
      }),
      prisma.imovel.count({ where: filtros }),
    ]);

    res.json({
      data: imoveis,
      total,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    console.error("Erro ao buscar imóveis do corretor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getCorretorComissoes: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const {
      status,
      page = 1,
      limit = 10,
      orderBy = "criadoEm",
      orderDirection = "desc",
    } = req.query;

    const filtros: any = {
      corretorId: req.user.userId,
    };

    if (status) filtros.status = status;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [comissoes, total, totalValor] = await Promise.all([
      prisma.comissao.findMany({
        where: filtros,
        include: {
          contrato: {
            include: {
              imovel: {
                select: {
                  titulo: true,
                  tipo: true,
                  endereco: true,
                },
              },
              cliente: {
                select: {
                  nome: true,
                  email: true,
                },
              },
            },
          },
        },
        skip,
        take: parseInt(limit as string),
        orderBy: {
          [orderBy as string]: orderDirection,
        },
      }),
      prisma.comissao.count({ where: filtros }),
      prisma.comissao.aggregate({
        where: filtros,
        _sum: {
          valor: true,
        },
      }),
    ]);

    res.json({
      data: comissoes,
      total,
      totalValor: totalValor._sum.valor || 0,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    console.error("Erro ao buscar comissões do corretor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getCorretorStats: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const corretorId = req.user.userId;

    const [
      totalImoveis,
      imoveisDisponiveis,
      imoveisVendidos,
      imoveisAlugados,
      totalLeads,
      leadsAssumidos,
      leadsConvertidos,
      totalComissoes,
      comissoesPagas,
      visitasAgendadas,
    ] = await Promise.all([
      prisma.imovel.count({
        where: { corretorId },
      }),
      prisma.imovel.count({
        where: { corretorId, status: "DISPONIVEL" },
      }),
      prisma.imovel.count({
        where: { corretorId, status: "VENDIDO" },
      }),
      prisma.imovel.count({
        where: { corretorId, status: "ALUGADO" },
      }),
      prisma.lead.count({
        where: { corretorId },
      }),
      prisma.lead.count({
        where: { corretorId, status: "ASSUMIDO" },
      }),
      prisma.lead.count({
        where: { corretorId, status: "CONVERTIDO" },
      }),
      prisma.comissao.aggregate({
        where: { corretorId },
        _sum: { valor: true },
      }),
      prisma.comissao.aggregate({
        where: { corretorId, status: "PAGO" },
        _sum: { valor: true },
      }),
      prisma.visita.count({
        where: {
          imovel: {
            corretorId,
          },
          status: "AGENDADA",
        },
      }),
    ]);

    const stats = {
      totalImoveis,
      imoveisDisponiveis,
      imoveisVendidos,
      imoveisAlugados,
      totalLeads,
      leadsAssumidos,
      leadsConvertidos,
      totalComissoes: totalComissoes._sum.valor || 0,
      comissoesPagas: comissoesPagas._sum.valor || 0,
      visitasAgendadas,
      taxaConversaoLeads:
        totalLeads > 0 ? (leadsConvertidos / totalLeads) * 100 : 0,
    };

    res.json(stats);
  } catch (error) {
    console.error("Erro ao buscar estatísticas do corretor:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getCorretoresAtivos: RequestHandler = async (req, res) => {
  try {
    const corretores = await prisma.usuario.findMany({
      where: {
        papel: {
          in: ["CORRETOR", "ASSISTENTE"],
        },
        ativo: true,
        whatsapp: {
          not: null,
        },
      },
      select: {
        id: true,
        nome: true,
        whatsapp: true,
        papel: true,
      },
    });

    res.json(corretores);
  } catch (error) {
    console.error("Erro ao buscar corretores ativos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
