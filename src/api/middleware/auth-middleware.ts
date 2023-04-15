import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../../services/auth-service';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authService: AuthService = new AuthService();
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) throw new Error();
    authService.verifyToken(token);
    next();
  } catch (e) {
    res.status(401).json({ error: 'Authentication failed' });
  }
};
