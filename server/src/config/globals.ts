export const env = {
  NODE_ENV: '',
  NODE_PORT: '',
  DOMAIN: '',
  ACCESS_TOKEN_SECRET: '',
};

export function setEnv(): void {
  env.DOMAIN = process.env.DOMAIN || 'http://localhost';
  env.NODE_ENV = process.env.NODE_ENV || 'development';
  env.NODE_PORT = process.env.PORT || '4000';
  env.ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || '';
}
