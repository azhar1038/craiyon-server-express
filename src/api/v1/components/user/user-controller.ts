import { Request, Response } from 'express';

export class UserController {
  public getUserDetails(req: Request, res: Response) {
    res.json({
      email: '',
    });
  }
}
