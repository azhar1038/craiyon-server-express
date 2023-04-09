import express from 'express';
import { initRestRoutesV1 } from './v1';

export class Server {
  private readonly _app: express.Application = express();

  constructor() {
    initRestRoutesV1(this._app);
  }

  public get app(): express.Application {
    return this._app;
  }
}
