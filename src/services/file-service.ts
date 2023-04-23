import { randomBytes } from 'crypto';
import { mkdir, writeFile, access } from 'fs';
import { join } from 'path';

export class FileService {
  private createDirectoryIfNotExists(dirPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      access(dirPath, (error) => {
        if (!error) return resolve(); // Directory already exists

        mkdir(dirPath, { recursive: true }, (error) => {
          if (error) {
            reject(error);
          } else {
            resolve();
          }
        });
      });
    });
  }

  createImageFromBase64 = (data: string, fileType = 'jpg'): Promise<string> => {
    const dataBuffer = Buffer.from(data, 'base64');
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const folderName = `${year}${month}${day}`;

    const imgDir = `generatedimages/${folderName}`;
    const fileName = `${randomBytes(16).toString('hex')}.${fileType}`;

    return new Promise<string>(async (resolve, reject) => {
      try {
        await this.createDirectoryIfNotExists(imgDir);
      } catch (error) {
        reject(error);
      }

      writeFile(join(imgDir, fileName), dataBuffer, (error) => {
        if (error) {
          reject(error);
        } else {
          resolve(`${folderName}/${fileName}`);
        }
      });
    });
  };
}
