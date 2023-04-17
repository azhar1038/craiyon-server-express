import { Request, Response } from 'express';
import { AuthService } from '../../../../services/auth-service';
import { UserService } from '../../../../services/user-service';
import { HashService } from '../../../../services/hash-service';

export class AuthController {
  authService: AuthService = new AuthService();
  hashService: HashService = new HashService();
  userService: UserService = new UserService();

  loginUser = async (req: Request, res: Response): Promise<Response | void> => {
    const email = req.body.email;
    const password = req.body.password;

    if (!email || !password) {
      return res.status(400).json({ error: 'Missing Email or Password' });
    }

    const hashedPassword: string = await this.userService.getPassword(email);
    if (!this.hashService.compareHash(password, hashedPassword)) {
      return res.status(401).json({ error: 'Incorrect email or password' });
    }

    try {
      const accessToken = this.authService.createToken({ email });
      res.json({ token: accessToken });
    } catch (error) {
      res.status(500).json({ error: 'Failed to login, please try again later' });
    }
  };

  registerUser = async (req: Request, res: Response): Promise<Response | void> => {
    const email = req.body.email;
    const name = req.body.name;
    const password = req.body.password;

    if (!email || !name || !password) {
      return res.status(400).json({ error: 'Please provide all data: name, email and password' });
    }

    try {
      await this.userService.addUser(email, name, password);
      res.json({ msg: 'User created' });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Something went wrong' });
    }
  };
}
