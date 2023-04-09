import { config } from 'dotenv';
config({
  path: `.env.${process.env.NODE_ENV || 'development'}`,
});

import { env, setEnv } from './config/globals';
setEnv();

import express from 'express';
import { Server } from './api/server';

import { logger } from './services/logger-service';

const app: express.Application = new Server().app;

const server = app.listen(env.NODE_PORT, () => {
  logger.info(`Server is listening at ${env.DOMAIN}`);
});

server.on('close', () => {
  logger.info('Server has stopped');
  logger.close();
});
