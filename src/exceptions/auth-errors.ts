export class InvalidTokenError extends Error {
  constructor() {
    super('Invalid token provided');
    Object.setPrototypeOf(this, InvalidTokenError.prototype);
  }
}
