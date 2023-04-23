import { Router } from 'express';
import { ComponentRoutes } from '../../../helper/component-routes';
import { ImageController } from './image-controller';
import { authenticate } from '../../../middleware/auth-middleware';

export class ImageRoutes implements ComponentRoutes<ImageController> {
  name = 'image';
  controller: ImageController = new ImageController();
  router: Router = Router();

  constructor() {
    this.initRoutes();
  }

  initRoutes(): void {
    this.router.get('/:id', this.controller.getImage);
    this.router.post('/generate', authenticate, this.controller.generateImage);
  }
}