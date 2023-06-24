import path from 'path';

export const env = {
  NODE_ENV: '',
  NODE_PORT: '',
  DOMAIN: '',
  ACCESS_TOKEN_SECRET: '',
  REFRESH_TOKEN_SECRET: '',
  REFRESH_TOKEN_EXPIRE_DAY: 7,
  DATABASE_URL: '',
  OPENAI_TOKEN: '',
  EMAIL_USER: '',
  EMAIL_PASSWORD: '',
};

export function setEnv(): void {
  env.DOMAIN = process.env.DOMAIN || 'http://localhost';
  env.NODE_ENV = process.env.NODE_ENV || 'development';
  env.NODE_PORT = process.env.PORT || '4000';
  env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'some-secret-token';
  env.REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'some-secret-token-2';
  env.DATABASE_URL = process.env.DATABASE_URL || '';
  env.OPENAI_TOKEN = process.env.OPENAI_TOKEN || 'some-secret-token-3';
  env.EMAIL_USER = process.env.EMAIL_USER || '';
  env.EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || '';
}

export const globalPaths = {
  ROOT: path.join(__dirname, '..', '..'),
  GENERATED_IMAGES: path.join(__dirname, '..', '..', 'generatedimages'),
};
