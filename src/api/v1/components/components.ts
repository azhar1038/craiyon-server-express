import { Application } from 'express';
import { UserRoutes } from './user/user-routes';
import { AuthRoutes } from './auth/auth-routes';

export function registerApiRoutes(app: Application, prefix: string): void {
  const userRoutes: UserRoutes = new UserRoutes();
  app.use(`${prefix}/${userRoutes.name}`, userRoutes.router);

  const authRoutes: AuthRoutes = new AuthRoutes();
  app.use(`${prefix}/${authRoutes.name}`, authRoutes.router);
}
