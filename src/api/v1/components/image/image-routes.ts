import { Router } from 'express';
import { ComponentRoutes } from '../../../helper/component-routes';
import { ImageController } from './image-controller';
import { authenticate, addUserId, verified } from '../../../middleware/auth-middleware';

export class ImageRoutes implements ComponentRoutes<ImageController> {
  name = 'image';
  controller: ImageController = new ImageController();
  router: Router = Router();

  constructor() {
    this.initRoutes();
  }

  initRoutes(): void {
    this.router.get('/public', addUserId, this.controller.getPublicImages);
    this.router.get('/get/:id', addUserId, this.controller.getImage);
    this.router.post('/generate', authenticate, verified, this.controller.generateImage);
    this.router.patch('/favorite/:id', authenticate, this.controller.favorite);
  }
}
