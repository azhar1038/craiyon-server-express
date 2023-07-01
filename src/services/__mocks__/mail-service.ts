import { vi } from 'vitest';

export class MailService {
  private static _instance: MailService;

  public static get instance() {
    if (!MailService._instance) {
      MailService._instance = new this();
    }
    return MailService._instance;
  }

  sendMail = vi.fn();
  sendAccoutVerificationMail = vi.fn();
  sendPasswordResetMail = vi.fn();
}
