import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../services/auth-service';
import { InvalidTokenError, MissingTokenError } from '../../exceptions/auth-errors';
import { logger } from '../../services/logger-service';

export interface CustomRequest extends Request {
  userId?: number;
}

export const authenticate = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authService: AuthService = new AuthService();
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new MissingTokenError();
    const userId = authService.verifyToken(token);
    req.userId = userId;
    next();
  } catch (error) {
    let msg = 'Authentication failed';
    const statusCode = 401;
    if (error instanceof InvalidTokenError) {
      msg = 'Invalid token provided';
    } else if (error instanceof MissingTokenError) {
      msg = error.message;
    } else {
      logger.error(error);
    }
    res.status(statusCode).json(msg);
  }
};

export const isAuthenticated = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authService: AuthService = new AuthService();
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return next();

  try {
    const userId = authService.verifyToken(token);
    req.userId = userId;
    next();
  } catch (error) {
    let msg = 'Authentication failed';
    const statusCode = 401;
    if (error instanceof InvalidTokenError) {
      msg = 'Invalid token provided';
    } else if (error instanceof MissingTokenError) {
      msg = error.message;
    } else {
      logger.error(error);
    }
    res.status(statusCode).json(msg);
  }
};
