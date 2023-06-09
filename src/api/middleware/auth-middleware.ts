import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../services/auth-service';
import { InvalidTokenError, MissingTokenError } from '../../exceptions/auth-error';
import { logger } from '../../services/logger-service';
import { UserService } from '../../services/user-service';

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
      msg = error.message;
    } else if (error instanceof MissingTokenError) {
      msg = error.message;
    } else {
      logger.error(error);
    }
    res.status(statusCode).json(msg);
  }
};

export const addUserId = (req: CustomRequest, res: Response, next: NextFunction) => {
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

export const verified = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const userService = new UserService();
  const userId = req.userId;
  if (!userId) return res.status(401).json('Missing User ID');

  try {
    if (await userService.isUserVerified(userId)) {
      next();
    } else {
      res.status(403).json('User verification needed');
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json('Authentication failed');
  }
};
