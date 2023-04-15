import cors from 'cors';
import { Application, json } from 'express';
import { env } from '../../config/globals';

export function registerMiddleware(app: Application): void {
  const whitelist: string[] = [env.DOMAIN];
  if (env.NODE_ENV === 'development') {
    app.use(cors());
  } else {
    app.use(
      cors({
        origin: function (origin, callback) {
          if (origin === undefined || whitelist.indexOf(origin) !== -1) {
            callback(null, true);
          } else {
            callback(new Error('Not allowed by CORS'));
          }
        },
      }),
    );
  }

  app.use(json());
}
