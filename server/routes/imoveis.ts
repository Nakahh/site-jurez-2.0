import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import { CreateImovelRequest, FiltroImoveis, Paginacao } from "@shared/types";

const prisma = new PrismaClient();

export const getImoveis: RequestHandler = async (req, res) => {
  try {
    const {
      tipo,
      finalidade,
      precoMin,
      precoMax,
      quartos,
      banheiros,
      bairro,
      cidade,
      status,
      page = 1,
      limit = 12,
      orderBy = "criadoEm",
      orderDirection = "desc",
    } = req.query;

    const filtros: any = {};

    if (tipo) filtros.tipo = tipo;
    if (finalidade) filtros.finalidade = finalidade;
    if (quartos) filtros.quartos = parseInt(quartos as string);
    if (banheiros) filtros.banheiros = parseInt(banheiros as string);
    if (bairro) filtros.bairro = { contains: bairro, mode: "insensitive" };
    if (cidade) filtros.cidade = { contains: cidade, mode: "insensitive" };
    if (status) filtros.status = status;

    if (precoMin || precoMax) {
      filtros.preco = {};
      if (precoMin) filtros.preco.gte = parseFloat(precoMin as string);
      if (precoMax) filtros.preco.lte = parseFloat(precoMax as string);
    }

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [imoveis, total] = await Promise.all([
      prisma.imovel.findMany({
        where: filtros,
        include: {
          corretor: {
            select: {
              id: true,
              nome: true,
              whatsapp: true,
            },
          },
        },
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
    console.error("Erro ao buscar imóveis:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getImovel: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;

    const imovel = await prisma.imovel.findUnique({
      where: { id },
      include: {
        corretor: {
          select: {
            id: true,
            nome: true,
            whatsapp: true,
          },
        },
        historicosPreco: {
          orderBy: { criadoEm: "desc" },
          take: 5,
        },
      },
    });

    if (!imovel) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    // Incrementar visualizações (opcional)
    await prisma.logSistema.create({
      data: {
        acao: "VISUALIZACAO_IMOVEL",
        detalhes: `Imóvel ${imovel.titulo} visualizado`,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.json(imovel);
  } catch (error) {
    console.error("Erro ao buscar imóvel:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const createImovel: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const dadosImovel: CreateImovelRequest = req.body;

    const imovel = await prisma.imovel.create({
      data: {
        ...dadosImovel,
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
      },
    });

    // Log da ação
    await prisma.logSistema.create({
      data: {
        acao: "CRIAR_IMOVEL",
        detalhes: `Imóvel ${imovel.titulo} criado`,
        usuarioId: req.user.userId,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.status(201).json(imovel);
  } catch (error) {
    console.error("Erro ao criar imóvel:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const updateImovel: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const { id } = req.params;
    const dadosAtualizacao = req.body;

    // Verificar se o imóvel existe e se o usuário tem permissão
    const imovelExistente = await prisma.imovel.findUnique({
      where: { id },
    });

    if (!imovelExistente) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    // Apenas admin ou o próprio corretor pode editar
    if (
      req.user.papel !== "ADMIN" &&
      imovelExistente.corretorId !== req.user.userId
    ) {
      return res
        .status(403)
        .json({ error: "Sem permissão para editar este imóvel" });
    }

    // Registrar mudança de preço se houver
    if (
      dadosAtualizacao.preco &&
      dadosAtualizacao.preco !== imovelExistente.preco
    ) {
      await prisma.historicoPreco.create({
        data: {
          precoAnterior: imovelExistente.preco,
          precoNovo: dadosAtualizacao.preco,
          motivo: dadosAtualizacao.motivoMudancaPreco || "Atualização de preço",
          imovelId: id,
        },
      });
    }

    const imovelAtualizado = await prisma.imovel.update({
      where: { id },
      data: dadosAtualizacao,
      include: {
        corretor: {
          select: {
            id: true,
            nome: true,
            whatsapp: true,
          },
        },
      },
    });

    // Log da ação
    await prisma.logSistema.create({
      data: {
        acao: "ATUALIZAR_IMOVEL",
        detalhes: `Imóvel ${imovelAtualizado.titulo} atualizado`,
        usuarioId: req.user.userId,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.json(imovelAtualizado);
  } catch (error) {
    console.error("Erro ao atualizar imóvel:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const deleteImovel: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const { id } = req.params;

    // Verificar se o imóvel existe e se o usuário tem permissão
    const imovel = await prisma.imovel.findUnique({
      where: { id },
    });

    if (!imovel) {
      return res.status(404).json({ error: "Imóvel não encontrado" });
    }

    // Apenas admin ou o próprio corretor pode deletar
    if (req.user.papel !== "ADMIN" && imovel.corretorId !== req.user.userId) {
      return res
        .status(403)
        .json({ error: "Sem permissão para deletar este imóvel" });
    }

    await prisma.imovel.delete({
      where: { id },
    });

    // Log da ação
    await prisma.logSistema.create({
      data: {
        acao: "DELETAR_IMOVEL",
        detalhes: `Imóvel ${imovel.titulo} deletado`,
        usuarioId: req.user.userId,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.json({ message: "Imóvel deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar imóvel:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getImoveisDestaque: RequestHandler = async (req, res) => {
  try {
    const imoveis = await prisma.imovel.findMany({
      where: {
        destaque: true,
        status: "DISPONIVEL",
      },
      include: {
        corretor: {
          select: {
            id: true,
            nome: true,
            whatsapp: true,
          },
        },
      },
      take: 6,
      orderBy: {
        criadoEm: "desc",
      },
    });

    res.json(imoveis);
  } catch (error) {
    console.error("Erro ao buscar imóveis em destaque:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const toggleFavorito: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const { id } = req.params;
    const usuarioId = req.user.userId;

    // Verificar se já existe
    const favoritoExistente = await prisma.favorito.findUnique({
      where: {
        usuarioId_imovelId: {
          usuarioId,
          imovelId: id,
        },
      },
    });

    if (favoritoExistente) {
      // Remover dos favoritos
      await prisma.favorito.delete({
        where: {
          usuarioId_imovelId: {
            usuarioId,
            imovelId: id,
          },
        },
      });

      res.json({ favorito: false, message: "Removido dos favoritos" });
    } else {
      // Adicionar aos favoritos
      await prisma.favorito.create({
        data: {
          usuarioId,
          imovelId: id,
        },
      });

      res.json({ favorito: true, message: "Adicionado aos favoritos" });
    }
  } catch (error) {
    console.error("Erro ao toggle favorito:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const getFavoritos: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const favoritos = await prisma.favorito.findMany({
      where: {
        usuarioId: req.user.userId,
      },
      include: {
        imovel: {
          include: {
            corretor: {
              select: {
                id: true,
                nome: true,
                whatsapp: true,
              },
            },
          },
        },
      },
      orderBy: {
        criadoEm: "desc",
      },
    });

    res.json(favoritos.map((f) => f.imovel));
  } catch (error) {
    console.error("Erro ao buscar favoritos:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
