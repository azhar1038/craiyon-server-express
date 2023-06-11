import { randomUUID } from 'crypto';
import { JsonWebTokenError, JwtPayload, sign, verify } from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { env } from '../config/globals';
import { InvalidTokenError } from '../exceptions/auth-error';
import { UserDoesNotExistsError } from '../exceptions/user-error';
import { RefreshTokenModel } from '../models/refresh-token-model';

export class AuthService {
  private readonly prisma = new PrismaClient();

  public createToken(userId: number): string {
    const accessToken = sign({ type: 'Access Token', userId }, env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });
    return accessToken;
  }

  public verifyToken(token: string): number {
    try {
      const decoded = verify(token, env.ACCESS_TOKEN_SECRET);
      const payload = decoded as JwtPayload;
      if (!('userId' in payload)) {
        throw new InvalidTokenError();
      }
      const userId = Number(payload.userId);
      if (Number.isNaN(userId)) throw new UserDoesNotExistsError();
      return userId;
    } catch (error) {
      if (error instanceof JsonWebTokenError) {
        throw new InvalidTokenError();
      }
      throw error;
    }
  }

  createRefreshToken = async (userId: number, familyId?: string): Promise<string> => {
    if (familyId) {
      // A valid request, so remove the previous token
      await this.prisma.refreshTokens.deleteMany({
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

    await this.prisma.refreshTokens.create({
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

    // Refresh token don't expire on there own, so verify from database
    const tokenData = await this.prisma.refreshTokens.findFirst({
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
      const expiryDaysInMs = env.REFRESH_TOKEN_EXPIRE_DAY * 24 * 60 * 60 * 1000;
      const timeDiffInMs = new Date().getTime() - tokenData.validTill.getTime();
      if (timeDiffInMs > expiryDaysInMs) {
        invalid = true;
      }
    }

    if (invalid) {
      // Delete tokens belonging to this family and throw error
      await this.prisma.refreshTokens.deleteMany({
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
