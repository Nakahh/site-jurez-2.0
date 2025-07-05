import { RequestHandler } from "express";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { LoginRequest, LoginResponse, Papel } from "@shared/types";

const prisma = new PrismaClient();

// Helper function for JWT
const createToken = (usuario: any) => {
  return jwt.sign(
    {
      userId: usuario.id,
      email: usuario.email,
      papel: usuario.papel,
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" } as SignOptions,
  );
};

export const login: RequestHandler = async (req, res) => {
  try {
    const { email, senha }: LoginRequest = req.body;

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario || !usuario.senha) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);
    if (!senhaValida) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    // Gerar token
    const token = createToken(usuario);

    const response: LoginResponse = {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        whatsapp: usuario.whatsapp,
        ativo: usuario.ativo,
        papel: usuario.papel,
        avatar: usuario.avatar,
        criadoEm: usuario.criadoEm,
      },
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Log da ação
    await prisma.logSistema.create({
      data: {
        acao: "LOGIN",
        detalhes: `Login realizado por ${usuario.email}`,
        usuarioId: usuario.id,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.json(response);
  } catch (error) {
    console.error("Erro no login:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const register: RequestHandler = async (req, res) => {
  try {
    const { nome, email, senha, whatsapp, papel = Papel.CLIENTE } = req.body;

    // Verificar se usuário já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email },
    });

    if (usuarioExistente) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 12);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        whatsapp,
        papel,
      },
    });

    // Gerar token
    const token = jwt.sign(
      {
        userId: usuario.id,
        email: usuario.email,
        papel: usuario.papel,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    const response: LoginResponse = {
      token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        whatsapp: usuario.whatsapp,
        ativo: usuario.ativo,
        papel: usuario.papel,
        avatar: usuario.avatar,
        criadoEm: usuario.criadoEm,
      },
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    // Log da ação
    await prisma.logSistema.create({
      data: {
        acao: "REGISTRO",
        detalhes: `Novo usuário registrado: ${usuario.email}`,
        usuarioId: usuario.id,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    res.status(201).json(response);
  } catch (error) {
    console.error("Erro no registro:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const googleCallback: RequestHandler = async (req, res) => {
  try {
    // Esta rota será chamada após autenticação Google
    const { googleId, email, nome, avatar } = req.body;

    let usuario = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!usuario) {
      // Criar novo usuário a partir do Google
      usuario = await prisma.usuario.create({
        data: {
          nome,
          email,
          googleId,
          avatar,
          papel: Papel.CLIENTE,
        },
      });
    } else if (!usuario.googleId) {
      // Vincular conta existente ao Google
      usuario = await prisma.usuario.update({
        where: { id: usuario.id },
        data: { googleId, avatar },
      });
    }

    // Gerar token
    const token = jwt.sign(
      {
        userId: usuario.id,
        email: usuario.email,
        papel: usuario.papel,
      },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN },
    );

    // Log da ação
    await prisma.logSistema.create({
      data: {
        acao: "LOGIN_GOOGLE",
        detalhes: `Login Google realizado por ${usuario.email}`,
        usuarioId: usuario.id,
        ip: req.ip,
        userAgent: req.get("User-Agent"),
      },
    });

    // Redirecionar com token
    res.redirect(`${process.env.MAIN_DOMAIN}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("Erro no Google callback:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const me: RequestHandler = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    const usuario = await prisma.usuario.findUnique({
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

    if (!usuario) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    res.json(usuario);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};

export const logout: RequestHandler = async (req, res) => {
  try {
    if (req.user) {
      // Log da ação
      await prisma.logSistema.create({
        data: {
          acao: "LOGOUT",
          detalhes: `Logout realizado por ${req.user.email}`,
          usuarioId: req.user.userId,
          ip: req.ip,
          userAgent: req.get("User-Agent"),
        },
      });
    }

    res.json({ message: "Logout realizado com sucesso" });
  } catch (error) {
    console.error("Erro no logout:", error);
    res.status(500).json({ error: "Erro interno do servidor" });
  }
};
