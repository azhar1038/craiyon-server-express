import { Request, Response } from 'express';
import { AuthService } from '../../../../services/auth-service';
import { UserService } from '../../../../services/user-service';
import { HashService } from '../../../../services/hash-service';
import { UserAlreadyExistsError, UserDoesNotExistsError } from '../../../../exceptions/user-error';
import { logger } from '../../../../services/logger-service';

export class AuthController {
  readonly authService: AuthService = new AuthService();
  readonly hashService: HashService = new HashService();
  readonly userService: UserService = new UserService();

  loginUser = async (req: Request, res: Response): Promise<void> => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      res.status(400).json({ error: 'Missing Email or Password' });
      return;
    }

    try {
      if (!(await this.userService.verifyUser(email, password))) {
        res.status(401).json({ error: 'Incorrect email or password' });
        return;
      }

      const accessToken = this.authService.createToken({ email });
      res.json({ token: accessToken });
    } catch (error) {
      let msg = 'Failed to login, please try again later';
      let statusCode = 500;
      if (error instanceof UserDoesNotExistsError) {
        msg = 'User does not exists, please register first';
        statusCode = 404;
      } else {
        logger.error(error);
      }
      res.status(statusCode).json({ error: msg });
    }
  };

  registerUser = async (req: Request, res: Response): Promise<void> => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    if (!email || !name || !password) {
      res.status(400).json({ error: 'Please provide all data: name, email and password' });
      return;
    }

    try {
      await this.userService.addUser(email, name, password);
      res.json({ msg: 'User created' });
    } catch (error) {
      let msg = 'Something went wrong';
      let statusCode = 500;
      if (error instanceof UserAlreadyExistsError) {
        msg = 'This email is already registered, please try to login';
        statusCode = 409;
      } else {
        logger.error(error);
      }
      res.status(statusCode).json({ error: msg });
    }
  };
}
