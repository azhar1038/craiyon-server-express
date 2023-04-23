import { PrismaClient } from '@prisma/client';
import { globalPaths } from '../config/globals';
import path from 'path';

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
}
