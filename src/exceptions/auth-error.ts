export class MissingTokenError extends Error {
  constructor() {
    super('Auth token is missing, please provide in header as Bearer <token>');
    Object.setPrototypeOf(this, MissingTokenError.prototype);
  }
}

export class InvalidTokenError extends Error {
  constructor() {
    super('Invalid token provided');
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}
