import { Application, Request, Response } from 'express';
import { registerMiddleware } from '../middleware';
import { UserRoutes } from './components/user/user-routes';
import { AuthRoutes } from './components/auth/auth-routes';

export function initRestRoutesV1(app: Application): void {
  const prefix = '/api/v1';
  registerMiddleware(app);
  app.get(prefix, (req: Request, res: Response) => res.send('v1'));

  const userRoutes: UserRoutes = new UserRoutes();
  app.use(`${prefix}/${userRoutes.name}`, userRoutes.router);

  const authRoutes: AuthRoutes = new AuthRoutes();
  app.use(`${prefix}/${authRoutes.name}`, authRoutes.router);
}
