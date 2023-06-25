import { randomUUID } from 'crypto';
import { JsonWebTokenError, JwtPayload, sign, verify } from 'jsonwebtoken';
import { env } from '../config/globals';
import { InvalidTokenError } from '../exceptions/auth-error';
import { UserDoesNotExistsError } from '../exceptions/user-error';
import { RefreshTokenModel } from '../models/refresh-token-model';
import prisma from './prisma-service';

export class AuthService {
  public createToken(userId: number): string {
    const accessToken = sign({ type: 'Access Token', userId }, env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });
    return accessToken;
  }

  public verifyToken(token: string): number {
    let decoded: string | JwtPayload;
    try {
      decoded = verify(token, env.ACCESS_TOKEN_SECRET);
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new InvalidTokenError();
      }
      throw error;
    }
    const payload = decoded as JwtPayload;
    if (!('userId' in payload)) {
      throw new InvalidTokenError();
    }
    const userId = Number(payload.userId);
    if (Number.isNaN(userId)) throw new UserDoesNotExistsError();
    return userId;
  }

  createRefreshToken = async (userId: number, familyId?: string): Promise<string> => {
    if (familyId) {
      // A valid request, so remove the previous token
      await prisma.refreshTokens.deleteMany({
        where: {
          familyId,
        },
      });
    } else {
      familyId = randomUUID();
    }
    const tokenId = randomUUID();
    const refreshToken = sign(
      {
        type: 'Refresh Token',
        familyId,
        tokenId,
        userId,
      },
      env.REFRESH_TOKEN_SECRET,
    );

    await prisma.refreshTokens.create({
      data: {
        familyId,
        tokenId,
        userId,
        validTill: new Date(new Date().getTime() + env.REFRESH_TOKEN_EXPIRE_DAY * 24 * 60 * 60 * 1000),
      },
    });
    return refreshToken;
  };

  verifyRefreshToken = async (token: string): Promise<RefreshTokenModel> => {
    let decoded: string | JwtPayload;
    try {
      decoded = verify(token, env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new InvalidTokenError();
      }
      throw error;
    }

    const payload = decoded as JwtPayload;
    if (!('userId' in payload) || !('tokenId' in payload) || !('familyId' in payload)) {
      throw new InvalidTokenError();
    }

    const userId = Number(payload.userId);
    const tokenId: string = payload.tokenId;
    const familyId: string = payload.familyId;

    if (Number.isNaN(userId)) throw new UserDoesNotExistsError();

    // Refresh token don't expire on there own, so verify from database
    const tokenData = await prisma.refreshTokens.findFirst({
      select: {
        tokenId: true,
        userId: true,
        validTill: true,
      },
      where: {
        familyId,
      },
    });

    let invalid = false;

    if (!tokenData) {
      throw new InvalidTokenError();
    }

    if (tokenData.tokenId !== tokenId || tokenData.userId !== userId) {
      invalid = true;
    } else {
      if (tokenData.validTill.getTime() < new Date().getTime()) {
        invalid = true;
      }
    }

    if (invalid) {
      // Delete tokens belonging to this family and throw error
      await prisma.refreshTokens.deleteMany({
        where: {
          familyId,
        },
      });
      throw new InvalidTokenError();
    }

    return {
      userId,
      tokenId,
      familyId,
      validTill: tokenData.validTill,
    };
  };
}
