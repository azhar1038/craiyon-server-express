import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../services/auth-service';
import { InvalidTokenError } from '../../exceptions/auth-errors';
import { logger } from '../../services/logger-service';

export interface CustomRequest extends Request {
  userId?: number;
}

export const authenticate = (req: CustomRequest, res: Response, next: NextFunction) => {
  const authService: AuthService = new AuthService();
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const userId = authService.verifyToken(token ?? '');
    req.userId = userId;
    next();
  } catch (error) {
    let msg = 'Authentication failed';
    const statusCode = 401;
    if (error instanceof InvalidTokenError) {
      msg = 'Invalid token provided';
    } else {
      logger.error(error);
    }
    res.status(statusCode).json(msg);
  }
};
