import { Transporter, createTransport } from 'nodemailer';
import { env } from '../config/globals';
import { logger } from './logger-service';

export class MailService {
  private static _instance: MailService;
  private readonly transporter: Transporter;
  private constructor() {
    this.transporter = createTransport({
      service: 'gmail',
      auth: {
        user: env.EMAIL_USER,
        pass: env.EMAIL_PASSWORD,
      },
    });
    MailService._instance = this;
  }

  public static get instance() {
    return MailService._instance || new this();
  }

  public sendMail(to: string, subject: string, message: string) {
    return new Promise<void>((resolve, reject) => {
      this.transporter.sendMail(
        {
          to,
          from: `Craiyon <${env.EMAIL_USER}>`,
          subject,
          html: message,
        },
        (err) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        },
      );
    });
  }

  public sendAccoutVerificationMail(to: string, verificationUrl: string) {
    const subject = 'Craiyon: account verification needed';
    const message = `
      <h2 align='center'>Welcome to Craiyon!</h2>
      <p>Thank you for registering. To use all of our features, please verify your account by clicking on the link below:</p>
      <a href='${verificationUrl}'>Verify Email</a>
      <p>If you cannot click on the link above, paste this url in browser: ${verificationUrl}</p>
      <p>If you did not create an account, you can safely ignore this email.</p>
      <p>Thank you,<br>Team Craiyon</p>
    `;

    try {
      this.sendMail(to, subject, message);
    } catch (error) {
      logger.error(error);
    }
  }
}
