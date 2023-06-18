import { Request, Response } from 'express';
import { AuthService } from '../../../../services/auth-service';
import { UserService } from '../../../../services/user-service';
import { HashService } from '../../../../services/hash-service';
import { logger } from '../../../../services/logger-service';
import {
  UserAlreadyExistsError,
  UserCredentialsInvalidError,
  UserDoesNotExistsError,
} from '../../../../exceptions/user-error';
import { MailService } from '../../../../services/mail-service';
import { env } from '../../../../config/globals';
import { InvalidTokenError, MissingTokenError } from '../../../../exceptions/auth-error';

export class AuthController {
  private readonly authService: AuthService = new AuthService();
  private readonly hashService: HashService = new HashService();
  private readonly userService: UserService = new UserService();
  private readonly mailService: MailService = MailService.instance;

  private async generateTokenResponse(userId: number, tokenFamilyId?: string) {
    const accessToken = this.authService.createToken(userId);
    const refreshToken = await this.authService.createRefreshToken(userId, tokenFamilyId);
    return {
      accessToken,
      refreshToken,
    };
  }

  loginUser = async (req: Request, res: Response): Promise<void> => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      res.status(400).json('Missing Email or Password');
      return;
    }

    try {
      const userId = await this.userService.verifyUser(email, password);
      res.json(await this.generateTokenResponse(userId));
    } catch (error) {
      let msg = 'Failed to login, please try again later';
      let statusCode = 500;
      if (error instanceof UserCredentialsInvalidError) {
        msg = 'Incorrect email or password';
        statusCode = 401;
      } else if (error instanceof UserDoesNotExistsError) {
        msg = 'User does not exists, please register first';
        statusCode = 404;
      } else {
        logger.error(error);
      }
      res.status(statusCode).json(msg);
    }
  };

  registerUser = async (req: Request, res: Response): Promise<void> => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    if (!email || !name || !password) {
      res.status(400).json('Please provide all data: name, email and password');
      return;
    }

    try {
      const user = await this.userService.addUser(email, name, password);

      // Generate and send verification mail
      const verificationToken = await this.userService.updateVerificationToken(user.id);
      const verificationUrl = `${env.DOMAIN}/api/v1/user/verify/${user.id}/${verificationToken}`;
      this.mailService.sendAccoutVerificationMail(email, verificationUrl);

      res.status(201).json(await this.generateTokenResponse(user.id));
    } catch (error) {
      let msg = 'Something went wrong';
      let statusCode = 500;
      if (error instanceof UserAlreadyExistsError) {
        msg = 'This email is already registered, please try to login';
        statusCode = 409;
      } else {
        logger.error(error);
      }
      res.status(statusCode).json(msg);
    }
  };

  refreshToken = async (req: Request, res: Response): Promise<void> => {
    const refreshToken = req.headers.authorization?.replace('Bearer ', '');
    try {
      if (!refreshToken) throw new MissingTokenError();
      const refreshTokenData = await this.authService.verifyRefreshToken(refreshToken);
      res.json(await this.generateTokenResponse(refreshTokenData.userId, refreshTokenData.familyId));
    } catch (error) {
      let msg = 'Failed to generate token';
      let statusCode = 500;

      if (error instanceof MissingTokenError || error instanceof InvalidTokenError) {
        statusCode = 403;
        msg = error.message;
      } else {
        logger.error(error);
      }

      res.status(statusCode).json(msg);
    }
  };
}
