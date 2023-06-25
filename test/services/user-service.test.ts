import { beforeAll, describe, expect, test, vi } from 'vitest';
import { setEnv } from '../../src/config/globals';
import { UserService } from '../../src/services/user-service';
import prisma from '../../src/services/__mocks__/prisma-service';
import { InvalidTokenError } from '../../src/exceptions/auth-error';
import {
  UserAlreadyExistsError,
  UserCredentialsInvalidError,
  UserDoesNotExistsError,
} from '../../src/exceptions/user-error';
import { HashService } from '../../src/services/hash-service';
import { User } from '@prisma/client';

let userService: UserService;
let user: User;
const password = 'password';
const verificationToken = 'verification-token';
const now = new Date(2023, 0, 1, 0, 0, 0);
vi.mock('../../src/services/prisma-service');

beforeAll(async () => {
  userService = new UserService();
  setEnv();
  user = {
    id: 1,
    email: 'example@test.com',
    name: 'Test',
    password: await new HashService().getHash(password),
    role: 'USER',
    tokenGeneratedAt: now,
    verificationToken,
    verified: false,
  };
});

describe('Verify User', () => {
  test('If email does not exists throw UserDoesNotExistsError', async () => {
    await expect(userService.verifyUser('', '')).rejects.toThrowError(UserDoesNotExistsError);
  });

  test('If incorrect credentials provided, throw UserCredentialsInvalidError', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(user);

    await expect(userService.verifyUser(user.email, 'incorrect_password')).rejects.toThrowError(
      UserCredentialsInvalidError,
    );
  });

  test('For correct credentials returns user ID', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(user);

    const userId = await userService.verifyUser(user.email, password);
    expect(userId).toEqual(user.id);
  });
});

describe('Add new user', () => {
  test('If email already exists throw UserAlreadyExistsError', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(user);

    await expect(userService.addUser(user.email, '', '')).rejects.toThrowError(UserAlreadyExistsError);
  });
});

describe('Verify validation token', () => {
  test('If user does not exists throw UserDoesNotExistsError', async () => {
    await expect(userService.verifyToken(1, '')).rejects.toThrowError(UserDoesNotExistsError);
  });

  test('If not token is different or does not exists throw InvalidTokenError', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(user);
    await expect(userService.verifyToken(user.id, 'wrong-token')).rejects.toThrowError(InvalidTokenError);
  });

  test('If token is valid but is older than 30 minutes throw InvalidTokenError', async () => {
    prisma.user.findFirst.mockResolvedValueOnce(user);

    vi.useFakeTimers();
    // Set to 31 minutes later, so that mock token becomes invalid
    const sysTime = new Date(now.getTime());
    sysTime.setMinutes(sysTime.getMinutes() + 31);
    vi.setSystemTime(sysTime);
    await expect(userService.verifyToken(user.id, verificationToken)).rejects.toThrowError(InvalidTokenError);

    vi.useRealTimers();
  });
});
