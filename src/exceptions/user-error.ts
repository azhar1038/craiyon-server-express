export class UserAlreadyExistsError extends Error {
  constructor() {
    super('User already exists');
    Object.setPrototypeOf(this, UserAlreadyExistsError.prototype);
  }
}

export class UserDoesNotExistsError extends Error {
  constructor() {
    super('User does not exists');
    Object.setPrototypeOf(this, UserDoesNotExistsError.prototype);
  }
}
