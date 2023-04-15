import { Request, Response } from 'express';
import { AuthService } from '../../../../services/auth-service';
import { UserService } from '../../../../services/user-service';
import { HashService } from '../../../../services/hash-service';

export class AuthController {
  public async loginUser(req: Request, res: Response): Promise<Response | void> {
    const authService: AuthService = new AuthService();
    const userService: UserService = new UserService();
    const hashService: HashService = new HashService();

    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing Email or Password' });
    }

    const hashedPassword: string = await userService.getPassword(email);
    if (!hashService.compareHash(password, hashedPassword)) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    try {
      const accessToken = authService.createToken({ email });
      res.json({ token: accessToken });
    } catch (error) {
      res.status(500).json({ error: 'Failed to login, please try again later' });
    }
  }
}
