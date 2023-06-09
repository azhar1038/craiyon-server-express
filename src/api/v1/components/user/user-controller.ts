import { Request, Response } from 'express';
import { CustomRequest } from '../../../middleware/auth-middleware';
import { UserService } from '../../../../services/user-service';
import { logger } from '../../../../services/logger-service';
import { UserDoesNotExistsError } from '../../../../exceptions/user-error';
import { ImageService } from '../../../../services/image-service';
import { MailService } from '../../../../services/mail-service';
import { InvalidTokenError } from '../../../../exceptions/auth-error';
import { env } from '../../../../config/globals';
import { UserModel } from '../../../../models/user-model';

export class UserController {
  readonly userService = new UserService();
  readonly imageService = new ImageService();
  readonly mailService = MailService.instance;

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

  generateNewVerificationToken = async (req: CustomRequest, res: Response) => {
    try {
      const userId = req.userId;
      if (!userId) throw new UserDoesNotExistsError();

      let handleUrl: string = req.body.handleUrl ?? `${env.DOMAIN}/api/v1/user/verify/`;
      const user: UserModel = await this.userService.getUser(userId);
      const newToken = await this.userService.updateVerificationToken(userId);
      handleUrl += `${userId}/${newToken}`;
      this.mailService.sendAccoutVerificationMail(user.email, handleUrl);
      res.json('Sent verification mail');
    } catch (error) {
      let statusCode = 500;
      let msg = 'Failed to generate verification token';
      if (error instanceof UserDoesNotExistsError) {
        statusCode = 404;
        msg = error.message;
      } else {
        logger.error(error);
      }
      res.status(statusCode).json(msg);
    }
  };

  verifyAccount = async (req: Request, res: Response) => {
    const userId = Number(req.params.user ?? req.body.user);
    const verificationToken = req.params.token ?? req.body.token;

    if (Number.isNaN(userId) || !verificationToken) return res.status(400).json('Invalid link');

    try {
      await this.userService.verifyUserAccount(userId, verificationToken);
      res.json('User verified');
    } catch (error) {
      let msg = 'Failed to verify account';
      let statusCode = 500;

      if (error instanceof UserDoesNotExistsError || error instanceof InvalidTokenError) {
        msg = 'Invalid link';
        statusCode = 400;
      } else {
        logger.error(error);
      }

      res.status(statusCode).json(msg);
    }
  };

  sendPasswordResetMail = async (req: Request, res: Response) => {
    const email = req.body.email;
    if (!email) return res.status(400).json('Missing email');
    try {
      let handleUrl: string = req.body.handleUrl ?? `${env.DOMAIN}/api/v1/user/verify-password-reset-token/`;
      const userId: number = await this.userService.getIdFromEmail(email);
      const newToken = await this.userService.updateVerificationToken(userId);
      handleUrl += `${userId}/${newToken}`;
      this.mailService.sendPasswordResetMail(email, handleUrl);
      res.json('Sent password reset mail');
    } catch (error) {
      let statusCode = 500;
      let msg = 'Failed to generate verification token';
      if (error instanceof UserDoesNotExistsError) {
        statusCode = 404;
        msg = error.message;
      } else {
        logger.error(error);
      }
      res.status(statusCode).json(msg);
    }
  };

  resetPassword = async (req: Request, res: Response) => {
    try {
      const userId = Number(req.body.user);
      if (Number.isNaN(userId)) throw new UserDoesNotExistsError();

      const token: string = req.body.token;
      if (!token) throw new InvalidTokenError();

      const newPassword: string = req.body.newPassword;
      if (!newPassword) return res.status(400).json('New password is missing');

      await this.userService.resetUserPassword(userId, token, newPassword);
      res.json('Password has been reset successfully');
    } catch (error) {
      let msg = 'Failed to reset password';
      let statusCode = 500;

      if (error instanceof UserDoesNotExistsError || error instanceof InvalidTokenError) {
        msg = error.message;
        statusCode = 400;
      } else {
        logger.error(error);
      }

      res.status(statusCode).json(msg);
    }
  };
}
