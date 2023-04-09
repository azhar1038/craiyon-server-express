import { HashService } from './hash-service';

export class UserService {
  public async getPassword(email: string): Promise<string> {
    const hashService: HashService = new HashService();
    if (email === 'admin@example.com') {
      return hashService.getHash('password');
    }
    return hashService.getHash('wrong_password');
  }
}
