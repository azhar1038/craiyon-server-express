import { Application, Request, Response } from 'express';
import { registerMiddleware } from '../middleware';
import { registerApiRoutes } from './components/components';

export function initRestRoutesV1(app: Application): void {
  const prefix = '/api/v1';
  registerMiddleware(app);
  app.get(prefix, (req: Request, res: Response) => res.send('v1'));
  registerApiRoutes(app, prefix);
}
