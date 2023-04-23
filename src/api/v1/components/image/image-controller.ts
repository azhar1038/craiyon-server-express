import { Response } from 'express';
import { CustomRequest } from '../../../middleware/auth-middleware';
import { OpenaiService } from '../../../../services/openai-service';
import { ImageService } from '../../../../services/image-service';

export class ImageController {
  private openaiService = new OpenaiService();
  private imageService = new ImageService();

  getImage = async (req: CustomRequest, res: Response) => {
    const imageId = parseInt(req.params.id);
    const imagePath = await this.imageService.resolvePath(imageId);
    res.sendFile(imagePath);
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

    const filePath = await this.openaiService.generateImage(prompt, resolution);

    const imageId = await this.imageService.saveImage(userId, prompt, filePath);

    res.json({ imageId });
  };
}
