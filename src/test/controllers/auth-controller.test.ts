import type { Request, Response } from 'express';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import { env, setEnv } from '../../config/globals';
import { AuthController } from '../../api/v1/components/auth/auth-controller';
import { AuthService } from '../../services/auth-service';
import { MailService } from '../../services/__mocks__/mail-service';
import { UserService } from '../../services/user-service';
import {
  UserAlreadyExistsError,
  UserCredentialsInvalidError,
  UserDoesNotExistsError,
} from '../../exceptions/user-error';
import { InvalidTokenError } from '../../exceptions/auth-error';

vi.mock('../../services/mail-service');

let mailService: MailService;
let authController: AuthController;

beforeAll(() => {
  mailService = MailService.instance;
  authController = new AuthController();
});

setEnv();

describe('Login user', () => {
  let request: Request;
  let response: Response;

  beforeEach(() => {
    vi.resetAllMocks();
    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    request = {
      body: {
        email: 'test@example.com',
        password: 'password',
      },
    } as Request;
  });

  test('If no email or password get status 400', async () => {
    request = {
      body: {},
    } as Request;

    await authController.loginUser(request, response);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith('Missing Email or Password');
  });

  test('If invalid credentials get status 401', async () => {
    const mockVerifyUser = vi.spyOn(UserService.prototype, 'verifyUser').mockImplementationOnce(async () => {
      throw new UserCredentialsInvalidError();
    });

    await authController.loginUser(request, response);
    expect(mockVerifyUser).toHaveBeenCalledWith(request.body.email, request.body.password);
    expect(response.status).toHaveBeenCalledWith(401);
    expect(response.json).toHaveBeenCalledWith('Incorrect email or password');
  });

  test('If user does not exists get status 404', async () => {
    const mockVerifyUser = vi.spyOn(UserService.prototype, 'verifyUser').mockImplementationOnce(async () => {
      throw new UserDoesNotExistsError();
    });

    await authController.loginUser(request, response);
    expect(mockVerifyUser).toHaveBeenCalledWith(request.body.email, request.body.password);
    expect(response.status).toHaveBeenCalledWith(404);
    expect(response.json).toHaveBeenCalledWith('User does not exists, please register first');
  });

  test('If valid user return access and refresh token', async () => {
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';
    const mockVerifyUser = vi.spyOn(UserService.prototype, 'verifyUser').mockImplementationOnce(async () => 1);
    vi.spyOn(AuthService.prototype, 'createToken').mockImplementationOnce(() => accessToken);
    vi.spyOn(AuthService.prototype, 'createRefreshToken').mockImplementationOnce(async () => refreshToken);

    await authController.loginUser(request, response);
    expect(mockVerifyUser).toHaveBeenCalledWith(request.body.email, request.body.password);
    expect(response.status).toHaveBeenCalledWith(200);
    expect(response.json).toHaveBeenCalledWith({
      accessToken,
      refreshToken,
    });
  });
});

describe('Register user', () => {
  let request: Request;
  let response: Response;

  beforeEach(() => {
    vi.resetAllMocks();
    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    request = {
      body: {
        email: 'test@example.com',
        name: 'Unknown',
        password: 'password',
      },
    } as Request;
  });

  test('If missing data get status 400', async () => {
    request.body.email = null;

    await authController.registerUser(request, response);
    expect(response.status).toHaveBeenCalledWith(400);
    expect(response.json).toHaveBeenCalledWith('Please provide all data: name, email and password');
  });

  test('If user is already registered get status 409', async () => {
    vi.spyOn(UserService.prototype, 'addUser').mockImplementationOnce(async () => {
      throw new UserAlreadyExistsError();
    });

    await authController.registerUser(request, response);
    expect(response.status).toHaveBeenCalledWith(409);
    expect(response.json).toHaveBeenCalledWith('This email is already registered, please try to login');
  });

  test('For successful registration send verification mail', async () => {
    const verificationToken = 'verification-token';
    const user = {
      id: 1,
      name: request.body.name,
      email: request.body.email,
      verified: false,
      role: 'USER' as const,
    };
    const verificationUrl = `${env.DOMAIN}/api/v1/user/verify/${user.id}/${verificationToken}`;

    vi.spyOn(UserService.prototype, 'addUser').mockImplementationOnce(async () => user);
    vi.spyOn(UserService.prototype, 'updateVerificationToken').mockImplementationOnce(async () => verificationToken);

    await authController.registerUser(request, response);

    expect(mailService.sendAccoutVerificationMail).toHaveBeenCalledWith(user.email, verificationUrl);
    expect(response.status).toHaveBeenCalledWith(201);
  });
});

describe('Refresh token', () => {
  let request: Request;
  let response: Response;
  const token = 'previous-token';

  beforeEach(() => {
    vi.resetAllMocks();
    response = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as unknown as Response;
    request = {
      headers: {
        authorization: `Bearer ${token}`,
      },
    } as Request;
  });

  test('If no token provided get 403', async () => {
    request.headers.authorization = undefined;

    await authController.refreshToken(request, response);
    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith('Auth token is missing, please provide in header as Bearer <token>');
  });

  test('If invalid token get 403', async () => {
    const mockVerifyRefeshToken = vi
      .spyOn(AuthService.prototype, 'verifyRefreshToken')
      .mockImplementationOnce(async () => {
        throw new InvalidTokenError();
      });

    await authController.refreshToken(request, response);

    expect(mockVerifyRefeshToken).toHaveBeenCalledWith(token);
    expect(response.status).toHaveBeenCalledWith(403);
    expect(response.json).toHaveBeenCalledWith('Invalid token provided');
  });

  test('Generate new tokens if correct refresh token is provided', async () => {
    const userId = 1;
    const tokenId = 'token-id';
    const familyId = 'family-id';
    const accessToken = 'access-token';
    const refreshToken = 'refresh-token';

    const mockVerifyRefeshToken = vi
      .spyOn(AuthService.prototype, 'verifyRefreshToken')
      .mockImplementationOnce(async () => ({
        userId,
        tokenId,
        familyId,
        validTill: new Date(),
      }));
    const mockCreateToken = vi.spyOn(AuthService.prototype, 'createToken').mockImplementationOnce(() => accessToken);
    const mockCreateRefreshToken = vi
      .spyOn(AuthService.prototype, 'createRefreshToken')
      .mockImplementationOnce(async () => refreshToken);

    await authController.refreshToken(request, response);
    expect(mockVerifyRefeshToken).toHaveBeenCalledWith(token);
    expect(mockCreateToken).toHaveBeenCalledWith(userId);
    expect(mockCreateRefreshToken).toHaveBeenCalledWith(userId, familyId);
    expect(response.status).toHaveBeenCalledWith(201);
    expect(response.json).toHaveBeenCalledWith({
      accessToken,
      refreshToken,
    });
  });
});
