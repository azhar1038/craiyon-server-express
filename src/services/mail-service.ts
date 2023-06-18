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
    const subject = 'Craiyon: Account verification needed';
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

  public sendPasswordResetMail(to: string, passwordResetUrl: string) {
    const subject = 'Craiyon: Password reset';
    const message = `
      <h2 align='center'>Reset your password</h2>
      <p>Please click on this link to reset your password:</p>
      <a href='${passwordResetUrl}'>Reset Password</a>
      <p>If you cannot click on the link above, paste this url in browser: ${passwordResetUrl}</p>
      <p>If you did not request for a password reset, please ignore this email.</p>
      <p>Thank you,<br>Team Craiyon</p>
    `;

    try {
      this.sendMail(to, subject, message);
    } catch (error) {
      logger.error(error);
    }
  }
}
