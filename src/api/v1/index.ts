import { Application, Request, Response } from 'express';
import { registerMiddleware } from '../middleware';
import { UserRoutes } from './components/user/user-routes';
import { AuthRoutes } from './components/auth/auth-routes';
import { ImageRoutes } from './components/image/image-routes';

export function initRestRoutesV1(app: Application): void {
  const prefix = '/api/v1';
  registerMiddleware(app);
  app.get(prefix, (req: Request, res: Response) => res.send('v1'));

  const routes = [new UserRoutes(), new AuthRoutes(), new ImageRoutes()];

  routes.forEach((route) => {
    app.use(`${prefix}/${route.name}`, route.router);
  });
}
