import { compareSync, hash } from 'bcrypt';

export class HashService {
  public async getHash(value: string | Buffer): Promise<string> {
    return await hash(value, 10);
  }

  public compareHash(value: string | Buffer, hashedValue: string): boolean {
    return compareSync(value, hashedValue);
  }
}
