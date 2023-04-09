import { Router } from 'express';

export interface ComponentRoutes<T> {
  readonly name: string;
  readonly controller: T;
  readonly router: Router;

  initRoutes(): void;
  initChildRoutes?(): void;
}
