import { Router } from 'express';
import { ComponentRoutes } from '../../../helper/component-routes';
import { UserController } from './user-controller';
import { authenticate } from '../../../middleware/auth-middleware';

export class UserRoutes implements ComponentRoutes<UserController> {
  name = 'user';
  controller: UserController = new UserController();
  router: Router = Router();

  constructor() {
    this.initRoutes();
  }

  initRoutes(): void {
    this.router.get('/details', authenticate, this.controller.getUserDetails);
  }
}
