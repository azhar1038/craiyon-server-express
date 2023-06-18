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
    this.router.get('/', authenticate, this.controller.getUserDetails);
    this.router.patch('/new-verificaion-token', authenticate, this.controller.generateNewVerificationToken);
    this.router.get('/verify/:user/:token', this.controller.verifyAccount);
    this.router.post('/password-reset-mail', this.controller.sendPasswordResetMail);
    this.router.patch('/reset-password', this.controller.resetPassword);
    this.router.get('/generated-images', authenticate, this.controller.getImages);
  }
}
