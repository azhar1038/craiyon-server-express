import { HashService } from './hash-service';
import { UserAlreadyExistsError, UserCredentialsInvalidError, UserDoesNotExistsError } from '../exceptions/user-error';
import { UserModel } from '../models/user-model';
import { randomBytes } from 'crypto';
import { InvalidTokenError } from '../exceptions/auth-error';
import prisma from './prisma-service';

export class UserService {
  readonly hashService: HashService = new HashService();

  async verifyUser(email: string, password: string): Promise<number> {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        password: true,
      },
      where: {
        email,
      },
    });

    if (!user) throw new UserDoesNotExistsError();

    if (this.hashService.compareHash(password, user.password)) {
      return user.id;
    }

    throw new UserCredentialsInvalidError();
  }

  async addUser(email: string, name: string, password: string): Promise<UserModel> {
    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        email,
      },
    });

    if (user) throw new UserAlreadyExistsError();

    // Add New user
    const hashedPassword = await this.hashService.getHash(password);
    user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return {
      name,
      email,
      id: user.id,
      role: user.role,
      verified: user.verified,
    };
  }

  async getUser(id: number): Promise<UserModel> {
    const user = await prisma.user.findFirst({
      where: {
        id,
      },
    });

    if (!user) throw new UserDoesNotExistsError();

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verified: user.verified,
    };
  }

  async getIdFromEmail(email: string): Promise<number> {
    const user = await prisma.user.findFirst({
      select: {
        id: true,
      },
      where: {
        email,
      },
    });

    if (!user) throw new UserDoesNotExistsError();
    return user.id;
  }

  async isUserVerified(id: number): Promise<boolean> {
    const user = await prisma.user.findFirst({
      select: {
        verified: true,
      },
      where: {
        id,
      },
    });

    if (!user) return false;
    return user.verified;
  }

  async updateVerificationToken(id: number): Promise<string> {
    const newToken = randomBytes(16).toString('hex');
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        verificationToken: newToken,
        tokenGeneratedAt: new Date(),
      },
    });

    return newToken;
  }

  async verifyToken(id: number, token: string): Promise<void> {
    const user = await prisma.user.findFirst({
      select: {
        verificationToken: true,
        tokenGeneratedAt: true,
      },
      where: {
        id,
      },
    });

    if (!user) throw new UserDoesNotExistsError();

    if (token !== user.verificationToken || !user.tokenGeneratedAt) throw new InvalidTokenError();
    const timeDiff = (new Date().getTime() - user.tokenGeneratedAt.getTime()) / (1000 * 60);
    if (timeDiff > 30) {
      // Token is older than 30 minutes, so not valid
      throw new InvalidTokenError();
    }
  }

  async verifyUserAccount(id: number, verificationToken: string): Promise<void> {
    await this.verifyToken(id, verificationToken);

    // Everything is okay, mark user as verified
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        verified: true,
        verificationToken: null,
        tokenGeneratedAt: null,
      },
    });
  }

  async resetUserPassword(id: number, passwordResetToken: string, newPassword: string): Promise<void> {
    await this.verifyToken(id, passwordResetToken);

    // Token is correct, so update the password with hased value
    const hasedPassword = await this.hashService.getHash(newPassword);
    await prisma.user.update({
      where: {
        id,
      },
      data: {
        verificationToken: null,
        tokenGeneratedAt: null,
        password: hasedPassword,
      },
    });

    // Invalidate all existing refresh tokens for user
    await prisma.refreshTokens.deleteMany({
      where: {
        userId: id,
      },
    });
  }
}
