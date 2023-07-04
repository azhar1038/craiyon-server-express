import { Response } from 'express';
import { CustomRequest } from '../../../middleware/auth-middleware';
import { OpenaiService } from '../../../../services/openai-service';
import { ImageService } from '../../../../services/image-service';
import { logger } from '../../../../services/logger-service';
import { NoImageError } from '../../../../exceptions/image-error';
import { Model, Resolution, SortBy, SortOrder, getEnumFromString } from '../../../../config/enums';

export class ImageController {
  private openaiService = new OpenaiService();
  private imageService = new ImageService();

  getImage = async (req: CustomRequest, res: Response) => {
    try {
      const imageId = Number(req.params.id);
      if (Number.isNaN(imageId)) throw new NoImageError();
      const userId = req.userId;
      const imagePath = await this.imageService.resolvePath(userId, imageId);
      res.sendFile(imagePath);
    } catch (error) {
      let statusCode = 500;
      let msg = 'Something went wrong';

      if (error instanceof NoImageError) {
        statusCode = 404;
        msg = error.message;
      } else {
        logger.error(error);
      }
      res.status(statusCode).json(msg);
    }
  };

  getPublicImages = async (req: CustomRequest, res: Response) => {
    const userId = req.userId;
    const page: number = req.body.page ?? 0;
    const limit: number = req.body.limit ?? 10;
    const sort: SortBy | null = getEnumFromString(req.body.sort ?? 'like', SortBy);
    const order: SortOrder | null = getEnumFromString(req.body.order ?? 'desc', SortOrder);
    if (!sort) {
      return res.status(400).json("Parameter sort can only be 'like' or 'created'");
    }
    if (!order) {
      return res.status(400).json("Parameter order can only be 'asc' or 'desc'");
    }

    try {
      const images = await this.imageService.getPublicImages(userId, limit, page, sort, order);
      return res.json(images);
    } catch (error) {
      const msg = 'Failed to fetch images';
      const statusCode = 500;
      logger.error(error);
      res.status(statusCode).json(msg);
    }
  };

  generateImage = async (req: CustomRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(400).json('User ID is missing');

    const prompt: string = req.body.prompt;
    if (!prompt) return res.status(400).json('Prompt is missing, cannot generate image without prompt');

    const model: Model | null = getEnumFromString(req.body.model ?? Model.DALLE, Model);
    if (!model) return res.status(400).json('Invalid model provided');

    const resolution: Resolution | null = getEnumFromString(req.body.resolution ?? Resolution.RES_256x256, Resolution);
    if (resolution === null) {
      return res.status(400).json("Resolution only supports '256x256', '512x512' or '1024x1024'");
    }

    try {
      let filePath = '';
      if (model === Model.DALLE) {
        filePath = await this.openaiService.generateImage(prompt, resolution);
      }
      const imageId = await this.imageService.saveImage(userId, prompt, model, resolution, filePath);

      res.json({ imageId });
    } catch (error) {
      logger.error(error);
      res.status(500).json('Failed to generate image');
    }
  };

  favorite = async (req: CustomRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(400).json('User ID is missing');

    const imageId = Number(req.body.id);
    if (Number.isNaN(imageId)) return res.status(400).json('Image ID is missing');
    try {
      const isFavorite = await this.imageService.isFavorite(userId, imageId);
      let msg = '';
      if (isFavorite) {
        await this.imageService.removeFromFavorite(userId, imageId);
        msg = 'Removed from favorite';
      } else {
        await this.imageService.addToFavorite(userId, imageId);
        msg = 'Added to favorite';
      }
      res.json(msg);
    } catch (error) {
      let msg = 'Failed to fetch images';
      let statusCode = 500;
      if (error instanceof NoImageError) {
        statusCode = 404;
        msg = error.message;
      } else {
        logger.error(error);
      }
      res.status(statusCode).json(msg);
    }
  };

  togglePrivate = async (req: CustomRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(400).json('User ID is missing');

    const imageId = Number(req.body.id);
    if (Number.isNaN(imageId)) return res.status(400).json('Image ID is missing');

    try {
      const action = await this.imageService.toggleImagePrivate(userId, imageId);
      res.json(action);
    } catch (error) {
      let msg = 'Failed to update images state';
      let statusCode = 500;
      if (error instanceof NoImageError) {
        statusCode = 404;
        msg = error.message;
      } else {
        logger.error(error);
      }
      res.status(statusCode).json(msg);
    }
  };
}
