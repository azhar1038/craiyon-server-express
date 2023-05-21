import { Response } from 'express';
import { CustomRequest } from '../../../middleware/auth-middleware';
import { UserService } from '../../../../services/user-service';
import { logger } from '../../../../services/logger-service';
import { UserDoesNotExistsError } from '../../../../exceptions/user-error';
import { ImageService } from '../../../../services/image-service';

export class UserController {
  readonly userService = new UserService();
  readonly imageService = new ImageService();

  getUserDetails = async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) throw new UserDoesNotExistsError();

      const user = await this.userService.getUser(userId);
      res.json(user);
    } catch (error) {
      let msg = 'Failed to fetch user details';
      let statusCode = 500;

      if (error instanceof UserDoesNotExistsError) {
        msg = 'User does not exists';
        statusCode = 404;
      } else {
        logger.error(error);
      }

      res.status(statusCode).json(msg);
    }
  };

  getImages = async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) throw new UserDoesNotExistsError();

      const page: number = req.body.page ?? 0;
      const limit: number = req.body.limit ?? 10;

      const images = await this.imageService.getUserGeneratedImages(userId, limit, page);
      res.json(images);
    } catch (error) {
      let msg = 'Failed to fetch images';
      let statusCode = 500;

      if (error instanceof UserDoesNotExistsError) {
        msg = 'User does not exists';
        statusCode = 404;
      } else {
        logger.error(error);
      }

      res.status(statusCode).json(msg);
    }
  };
}
