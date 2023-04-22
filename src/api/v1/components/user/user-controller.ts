import { Response } from 'express';
import { CustomRequest } from '../../../middleware/auth-middleware';
import { UserService } from '../../../../services/user-service';
import { logger } from '../../../../services/logger-service';
import { UserDoesNotExistsError } from '../../../../exceptions/user-error';

export class UserController {
  readonly userService = new UserService();

  getUserDetails = async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.userId ?? -1;

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
}
