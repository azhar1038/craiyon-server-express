import { PrismaClient } from '@prisma/client';
import { HashService } from './hash-service';
import { UserAlreadyExistsError, UserDoesNotExistsError } from '../exceptions/user-error';

export class UserService {
  readonly hashService: HashService = new HashService();
  readonly prisma: PrismaClient = new PrismaClient();

  verifyUser = async (email: string, password: string): Promise<boolean> => {
    const user = await this.prisma.user.findFirst({
      select: {
        email: true,
        password: true,
      },
      where: {
        email,
      },
    });

    if (!user) throw new UserDoesNotExistsError();

    if (this.hashService.compareHash(password, user.password)) {
      return true;
    }

    return false;
  };

  addUser = async (email: string, name: string, password: string): Promise<void> => {
    // Check if user already exists
    const user = await this.prisma.user.findFirst({
      select: {
        id: true,
      },
      where: {
        email,
      },
    });

    if (user) throw new UserAlreadyExistsError();

    // Add New user
    const hashedPassword = await this.hashService.getHash(password);
    await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });
  };
}
