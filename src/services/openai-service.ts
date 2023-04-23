import { Configuration, OpenAIApi } from 'openai';
import { env } from '../config/globals';
import { FileService } from './file-service';

export class OpenaiService {
  private openAiConfig = new Configuration({
    apiKey: env.OPENAI_TOKEN,
  });
  private openAi = new OpenAIApi(this.openAiConfig);
  private fileService = new FileService();

  generateImage = async (prompt: string, resolution: string): Promise<string> => {
    if (resolution !== '256x256' && resolution !== '512x512' && resolution !== '1024x1024') throw new Error();

    const apiResponse = await this.openAi.createImage({
      prompt,
      n: 1,
      size: resolution,
      response_format: 'b64_json',
    });

    const data: string = apiResponse.data.data[0].b64_json as string;
    const filePath = await this.fileService.createImageFromBase64(data);
    return filePath;
  };
}
