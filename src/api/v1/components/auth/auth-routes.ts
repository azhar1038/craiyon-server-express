import { Router } from 'express';
import { ComponentRoutes } from '../../../helper/component-routes';
import { AuthController } from './auth-controller';

export class AuthRoutes implements ComponentRoutes<AuthController> {
  name = 'auth';
  controller: AuthController = new AuthController();
  router: Router = Router();

  constructor() {
    this.initRoutes();
  }

  initRoutes(): void {
    this.router.post('/register', this.controller.registerUser);
    this.router.post('/login', this.controller.loginUser);
    this.router.post('/refresh-token', this.controller.refreshToken);
  }
}
