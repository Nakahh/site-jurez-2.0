import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Papel } from "@shared/types";

interface JWTPayload {
  userId: string;
  email: string;
  papel: Papel;
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authenticateToken: RequestHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Token de acesso necessário" });
  }

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Token inválido" });
  }
};

export const requireRole = (roles: Papel[]): RequestHandler => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Não autenticado" });
    }

    if (!roles.includes(req.user.papel)) {
      return res.status(403).json({ error: "Acesso negado para este papel" });
    }

    next();
  };
};

export const requireAdmin = requireRole([Papel.ADMIN]);
export const requireCorretor = requireRole([
  Papel.ADMIN,
  Papel.CORRETOR,
  Papel.ASSISTENTE,
]);
export const requireCliente = requireRole([Papel.ADMIN, Papel.CLIENTE]);
export const requireMarketing = requireRole([Papel.ADMIN, Papel.MARKETING]);
export const requireDev = requireRole([Papel.ADMIN, Papel.DESENVOLVEDOR]);
