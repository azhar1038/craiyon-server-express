import { JsonWebTokenError, JwtPayload, sign, verify } from 'jsonwebtoken';
import { env } from '../config/globals';
import { InvalidTokenError } from '../exceptions/auth-error';
import { UserDoesNotExistsError } from '../exceptions/user-error';

export class AuthService {
  public createToken(payload: object): string {
    const accessToken = sign(payload, env.ACCESS_TOKEN_SECRET);
    return accessToken;
  }

  public verifyToken(token: string): number {
    try {
      const decoded = verify(token, env.ACCESS_TOKEN_SECRET);
      const payload = decoded as JwtPayload;
      if (!('id' in payload)) {
        throw new InvalidTokenError();
      }
      const userId = Number(payload.id);
      if (Number.isNaN(userId)) throw new UserDoesNotExistsError();
      return payload.id as number;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new InvalidTokenError();
      }
      throw error;
    }
  }
}
