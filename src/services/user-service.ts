import { PrismaClient } from '@prisma/client';
import { HashService } from './hash-service';
import { UserAlreadyExistsError, UserCredentialsInvalidError, UserDoesNotExistsError } from '../exceptions/user-error';
import { UserModel } from '../models/user-model';
import { GeneratedImageModel } from '../models/generated-image-model';

export class UserService {
  readonly hashService: HashService = new HashService();
  readonly prisma: PrismaClient = new PrismaClient();

  verifyUser = async (email: string, password: string): Promise<number> => {
    const user = await this.prisma.user.findFirst({
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
  };

  addUser = async (email: string, name: string, password: string): Promise<UserModel> => {
    // Check if user already exists
    let user = await this.prisma.user.findFirst({
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
    user = await this.prisma.user.create({
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
    };
  };

  getUser = async (id: number): Promise<UserModel> => {
    const user = await this.prisma.user.findFirst({
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
    };
  };

  getUserGeneratedImages = async (id: number, limit: number, page: number): Promise<GeneratedImageModel[]> => {
    const images = await this.prisma.generatedImage.findMany({
      where: {
        userId: id,
      },
      skip: page * limit,
      take: limit,
    });

    return images.map((img) => {
      return {
        id: img.id,
        prompt: img.prompt,
        isPrivate: img.isPrivate,
        url: img.url,
        likes: img.likes,
        model: img.model,
        resolution: img.resolution,
      };
    });
  };
}
