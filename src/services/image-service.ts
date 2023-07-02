import { globalPaths } from '../config/globals';
import path from 'path';
import { GeneratedImageModel } from '../models/generated-image-model';
import { NoImageError } from '../exceptions/image-error';
import { Model, Resolution, SortBy, SortOrder } from '../config/enums';
import prisma from './prisma-service';
import { GeneratorModel, ImageResolution } from '@prisma/client';
import { FileService } from './file-service';

export class ImageService {
  private readonly fileService: FileService = new FileService();

  saveImage = async (
    userId: number,
    prompt: string,
    model: Model,
    resolution: Resolution,
    path: string,
  ): Promise<number> => {
    let prismaModel: GeneratorModel = GeneratorModel.DALLE;
    let prismaResolution: ImageResolution = ImageResolution.RES_256x256;

    switch (model) {
      case Model.DALLE:
        prismaModel = GeneratorModel.DALLE;
        break;
    }

    switch (resolution) {
      case Resolution.RES_256x256:
        prismaResolution = ImageResolution.RES_256x256;
        break;
      case Resolution.RES_512x512:
        prismaResolution = ImageResolution.RES_512x512;
        break;
      case Resolution.RES_1024x1024:
        prismaResolution = ImageResolution.RES_1024x1024;
        break;
    }

    const image = await prisma.generatedImage.create({
      data: {
        userId,
        prompt,
        model: prismaModel,
        resolution: prismaResolution,
        url: path,
      },
    });

    return image.id;
  };

  resolvePath = async (userId: number | undefined, imageId: number): Promise<string> => {
    const image = await prisma.generatedImage.findFirst({
      select: {
        url: true,
      },
      where: {
        id: imageId,
        OR: [{ isPrivate: false }, { userId }],
      },
    });

    if (!image) throw new NoImageError();

    return path.join(globalPaths.GENERATED_IMAGES, image.url);
  };

  getUserGeneratedImages = async (userId: number, limit: number, page: number): Promise<GeneratedImageModel[]> => {
    const images = await prisma.generatedImage.findMany({
      where: {
        userId,
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
    sort: SortBy,
    order: SortOrder,
  ): Promise<GeneratedImageModel[]> => {
    const orderBy = [];
    if (sort === SortBy.LIKE) {
      orderBy.push({ likes: order });
    } else if (sort === SortBy.CREATED) {
      orderBy.push({ generatedAt: order });
    }

    const images = await prisma.generatedImage.findMany({
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
    const image = await prisma.generatedImage.findFirst({
      where: {
        id: imageId,
        isPrivate: false,
      },
    });

    if (!image) throw new NoImageError();

    const favorite = await prisma.favourite.findFirst({
      where: {
        userId,
        imageId,
      },
    });

    return favorite ? true : false;
  };

  addToFavorite = async (userId: number, imageId: number): Promise<void> => {
    await prisma.$transaction([
      prisma.favourite.create({
        data: {
          userId,
          imageId,
        },
      }),
      prisma.generatedImage.update({
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
    await prisma.$transaction([
      prisma.favourite.delete({
        where: {
          userId_imageId: {
            userId,
            imageId,
          },
        },
      }),
      prisma.generatedImage.update({
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

  async deleteImage(userId: number, imageId: number): Promise<void> {
    const image = await prisma.generatedImage.findFirst({
      select: {
        userId: true,
        url: true,
      },
      where: {
        id: imageId,
      },
    });

    if (!image || image.userId !== userId) throw new NoImageError();

    // Delete from favorite list
    await prisma.favourite.deleteMany({
      where: {
        imageId,
      },
    });

    // Delete from image table
    await prisma.generatedImage.delete({
      where: {
        id: imageId,
      },
    });

    // Delete file
    await this.fileService.deleteFile(image.url);
  }
}
