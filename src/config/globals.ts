import path from 'path';

export const env = {
  NODE_ENV: '',
  NODE_PORT: '',
  DOMAIN: '',
  ACCESS_TOKEN_SECRET: '',
  DATABASE_URL: '',
  OPENAI_TOKEN: '',
  ROOT: path.join(__dirname, '..', '..'),
};

export function setEnv(): void {
  env.DOMAIN = process.env.DOMAIN || 'http://localhost';
  env.NODE_ENV = process.env.NODE_ENV || 'development';
  env.NODE_PORT = process.env.PORT || '4000';
  env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || '';
  env.DATABASE_URL = process.env.DATABASE_URL || '';
  env.OPENAI_TOKEN = process.env.OPENAI_TOKEN || '';
}

export const globalPaths = {
  ROOT: path.join(__dirname, '..', '..'),
  GENERATED_IMAGES: path.join(__dirname, '..', '..', 'generatedimages'),
};
