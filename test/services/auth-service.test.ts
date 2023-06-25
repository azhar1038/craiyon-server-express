import { sign } from 'jsonwebtoken';
import { beforeAll, describe, expect, test, vi } from 'vitest';
import { env, setEnv } from '../../src/config/globals';
import { AuthService } from '../../src/services/auth-service';
import prisma from '../../src/services/__mocks__/prisma-service';
import { InvalidTokenError } from '../../src/exceptions/auth-error';
import { UserDoesNotExistsError } from '../../src/exceptions/user-error';

let authService: AuthService;
vi.mock('../../src/services/prisma-service');

beforeAll(() => {
  authService = new AuthService();
  setEnv();
});

describe('Verify Auth token', () => {
  test('A valid token', () => {
    const accessToken = sign({ type: 'Access Token', userId: 1 }, env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });

    const userId = authService.verifyToken(accessToken);
    expect(userId).toBe(1);
  });

  test('Bad token throws InvalidTokenError', () => {
    expect(() => authService.verifyToken('aBadTokenWillThrowError')).toThrowError(InvalidTokenError);
  });

  test('If no userId in token throw InvalidTokenError', () => {
    const accessToken = sign({ type: 'Access Token' }, env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });

    expect(() => authService.verifyToken(accessToken)).toThrowError(InvalidTokenError);
  });

  test('If userId is not number throw UserDoesNotExistsError', () => {
    const accessToken = sign({ type: 'Access Token', userId: 'someRandomUserId' }, env.ACCESS_TOKEN_SECRET, {
      expiresIn: '1h',
    });

    expect(() => authService.verifyToken(accessToken)).toThrowError(UserDoesNotExistsError);
  });
});

describe('Create Refresh token', () => {
  test('Create a refresh token after deleting the token family', async () => {
    const familyId = 'family-id';
    const refreshToken = await authService.createRefreshToken(1, familyId);
    expect(prisma.refreshTokens.deleteMany).toHaveBeenCalledOnce();
    expect(prisma.refreshTokens.deleteMany).toBeCalledWith({
      where: {
        familyId,
      },
    });
    expect(prisma.refreshTokens.create).toHaveBeenCalledOnce();
    expect(refreshToken).toBeTypeOf('string');
  });
});

describe('Verify Refresh token', () => {
  let validToken: string;
  let validUserId: number;

  beforeAll(() => {
    validUserId = 1;
    validToken = sign(
      {
        type: 'Refresh Token',
        familyId: 'family-id',
        tokenId: 'token-id',
        userId: validUserId,
      },
      env.REFRESH_TOKEN_SECRET,
    );
  });

  test('Bad token should throw InvalidTokenError', async () => {
    await expect(authService.verifyRefreshToken('aBadTokenWillThrowError')).rejects.toThrowError(InvalidTokenError);
  });

  test('Token with missing data should throw InvalidTokenError', async () => {
    const refreshToken = sign(
      {
        type: 'Refresh Token',
        tokenId: 'token-id',
        userId: 1,
      },
      env.REFRESH_TOKEN_SECRET,
    );

    await expect(authService.verifyRefreshToken(refreshToken)).rejects.toThrowError(InvalidTokenError);
  });

  test('If userId is not number throw UserDoesNotExistsError', async () => {
    const refreshToken = sign(
      {
        type: 'Refresh Token',
        familyId: 'family-id',
        tokenId: 'token-id',
        userId: 'user-id',
      },
      env.REFRESH_TOKEN_SECRET,
    );

    await expect(authService.verifyRefreshToken(refreshToken)).rejects.toThrowError(UserDoesNotExistsError);
  });

  test('If token not in refreshToken throw InvalidTokenError', async () => {
    prisma.refreshTokens.findFirst.mockResolvedValueOnce(null);
    await expect(authService.verifyRefreshToken(validToken)).rejects.toThrowError(InvalidTokenError);
  });

  test("If token details don't match throw InvalidTokenError and delete whole family of tokens", async () => {
    prisma.refreshTokens.findFirst.mockResolvedValueOnce({
      tokenId: 'token-id',
      userId: 2,
      validTill: new Date(),
      familyId: 'family-id',
    });

    await expect(authService.verifyRefreshToken(validToken)).rejects.toThrowError(InvalidTokenError);
    expect(prisma.refreshTokens.findFirst).toHaveBeenCalledOnce();
    expect(prisma.refreshTokens.deleteMany).toHaveBeenCalledOnce();
  });

  test('If token is older then needed throw InvalidTokenError and delete whole family of tokens', async () => {
    prisma.refreshTokens.findFirst.mockResolvedValueOnce({
      tokenId: 'token-id',
      userId: 1,
      validTill: new Date(),
      familyId: 'family-id',
    });

    await expect(authService.verifyRefreshToken(validToken)).rejects.toThrowError(InvalidTokenError);
    expect(prisma.refreshTokens.findFirst).toHaveBeenCalledOnce();
    expect(prisma.refreshTokens.deleteMany).toHaveBeenCalledOnce();
  });

  test('Verifying a valid refresh token should not delete whole family', async () => {
    const mockTokenData = {
      tokenId: 'token-id',
      userId: 1,
      validTill: new Date(),
      familyId: 'family-id',
    };
    prisma.refreshTokens.findFirst.mockResolvedValueOnce(mockTokenData);

    vi.useFakeTimers();
    const now = new Date();
    // Set 1 previous day, so that mock token data becomes valid
    now.setDate(now.getDate() - 1);
    vi.setSystemTime(now);

    const refreshToken = await authService.verifyRefreshToken(validToken);
    expect(prisma.refreshTokens.deleteMany).not.toBeCalled();
    expect(refreshToken).toStrictEqual(mockTokenData);

    vi.useRealTimers();
  });
});
