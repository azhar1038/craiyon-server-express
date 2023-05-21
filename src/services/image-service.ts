import { PrismaClient } from '@prisma/client';
import { globalPaths } from '../config/globals';
import path from 'path';
import { GeneratedImageModel } from '../models/generated-image-model';

export class ImageService {
  private prisma = new PrismaClient();

  saveImage = async (userId: number, prompt: string, path: string): Promise<number> => {
    const image = await this.prisma.generatedImage.create({
      data: {
        userId,
        prompt,
        model: 'DALLE2',
        url: path,
        resolution: 'RES_256x256',
      },
    });

    return image.id;
  };

  resolvePath = async (imageId: number): Promise<string> => {
    const image = await this.prisma.generatedImage.findFirst({
      select: {
        url: true,
      },
      where: {
        id: imageId,
      },
    });

    if (!image) throw new Error('Image not found');

    return path.join(globalPaths.GENERATED_IMAGES, image.url);
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

  getPublicImages = async (
    userId: number | undefined,
    limit: number,
    page: number,
    sort: string,
    order: 'asc' | 'desc',
  ): Promise<GeneratedImageModel[]> => {
    const orderBy = [];
    if (sort === 'like') {
      orderBy.push({ likes: order });
    } else if (sort === 'created') {
      orderBy.push({ generatedAt: order });
    }

    const images = await this.prisma.generatedImage.findMany({
      where: {
        isPrivate: false,
      },
      include: {
        Favourite: {
          select: {
            userId: true,
          },
          where: {
            userId: userId ?? 0,
          },
        },
      },
      skip: page * limit,
      take: limit,
      orderBy,
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
        likedByUser: img.Favourite.length > 0,
      };
    });
  };

  isFavorite = async (userId: number, imageId: number): Promise<boolean> => {
    const favorite = await this.prisma.favourite.findFirst({
      where: {
        userId,
        imageId,
      },
    });

    return favorite ? true : false;
  };

  addToFavorite = async (userId: number, imageId: number): Promise<void> => {
    await this.prisma.$transaction([
      this.prisma.favourite.create({
        data: {
          userId,
          imageId,
        },
      }),
      this.prisma.generatedImage.update({
        where: {
          id: imageId,
        },
        data: {
          likes: {
            increment: 1,
          },
        },
      }),
    ]);
  };

  removeFromFavorite = async (userId: number, imageId: number): Promise<void> => {
    await this.prisma.$transaction([
      this.prisma.favourite.delete({
        where: {
          userId_imageId: {
            userId,
            imageId,
          },
        },
      }),
      this.prisma.generatedImage.update({
        where: {
          id: imageId,
        },
        data: {
          likes: {
            decrement: 1,
          },
        },
      }),
    ]);
  };
}
