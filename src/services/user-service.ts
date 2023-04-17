import { PrismaClient } from '@prisma/client';
import { HashService } from './hash-service';

export class UserService {
  public async getPassword(email: string): Promise<string> {
    const prisma = new PrismaClient();

    try {
      const user = await prisma.user.findFirst({
        where: {
          email,
        },
      });
      if (user) {
        return user.password;
      }
    } catch (error) {
      throw error;
    }

    return '';
  }

  public async addUser(email: string, name: string, password: string): Promise<void> {
    const prisma = new PrismaClient();
    const hashService: HashService = new HashService();
    const hashedPassword = await hashService.getHash(password);
    try {
      await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });
    } catch (error) {
      throw error;
    }
  }
}
