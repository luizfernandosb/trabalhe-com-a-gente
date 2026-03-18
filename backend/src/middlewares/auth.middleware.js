import { AppError } from '../utils/app-error.js';
import { env } from '../config/env.js';

/**
 * Middleware de autenticação simples por Bearer token.
 * Compara o token enviado no header Authorization com API_TOKEN do .env.
 */
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Token de autorização ausente.', 401));
  }

  const token = authHeader.slice(7); // Remove o prefixo "Bearer "

  if (token !== env.API_TOKEN) {
    return next(new AppError('Token de autorização inválido.', 401));
  }

  next();
};

export { authMiddleware };
