import { Response } from 'express';
import { CustomRequest } from '../../../middleware/auth-middleware';
import { OpenaiService } from '../../../../services/openai-service';
import { ImageService } from '../../../../services/image-service';
import { logger } from '../../../../services/logger-service';

export class ImageController {
  private openaiService = new OpenaiService();
  private imageService = new ImageService();

  getImage = async (req: CustomRequest, res: Response) => {
    const imageId = parseInt(req.params.id);
    const imagePath = await this.imageService.resolvePath(imageId);
    res.sendFile(imagePath);
  };

  getPublicImages = async (req: CustomRequest, res: Response) => {
    const userId = req.userId;
    const page: number = req.body.page ?? 0;
    const limit: number = req.body.limit ?? 10;
    const sort: string = req.body.sort ?? 'like';
    const order: string = req.body.order ?? 'desc';
    if (sort !== 'like' && sort !== 'created') {
      return res.status(400).json('Parameter sort can only be like or created');
    }
    if (order !== 'asc' && order !== 'desc') {
      return res.status(400).json('Parameter order can only be asc or desc');
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
    if (!prompt) res.status(400).json('Prompt is missing, cannot generate image without prompt');

    const model: string = req.body.model ?? 'DALLE';
    if (model !== 'DALLE') res.status(400).json('Invalid model provided');

    const validResolution = ['256x256', '512x512', '1024x1024'];
    const resolution: string = req.body.resolution ?? '256x256';
    if (!validResolution.includes(resolution)) res.status(400).json('Invalid resolution provided');

    try {
      const filePath = await this.openaiService.generateImage(prompt, resolution);

      const imageId = await this.imageService.saveImage(userId, prompt, filePath);

      res.json({ imageId });
    } catch (error) {
      logger.error(error);
    }
  };

  favorite = async (req: CustomRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) return res.status(400).json('User ID is missing');

    try {
      const imageId: number = parseInt(req.params.id);
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
      logger.error(error);
      res.status(500).json('Failed to favorite');
    }
  };
}
