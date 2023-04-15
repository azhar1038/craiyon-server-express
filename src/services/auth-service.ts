import { sign, verify } from 'jsonwebtoken';
import { env } from '../config/globals';

export class AuthService {
  public createToken(payload: object): string {
    try {
      const accessToken = sign(payload, env.ACCESS_TOKEN_SECRET);
      return accessToken;
    } catch (error) {
      throw error;
    }
  }

  public verifyToken(token: string): void {
    try {
      verify(token, env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      throw error;
    }
  }
}
