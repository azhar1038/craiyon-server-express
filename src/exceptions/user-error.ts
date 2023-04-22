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

export class UserCredentialsInvalidError extends Error {
  constructor() {
    super('Email or Password is incorrect');
    Object.setPrototypeOf(this, UserCredentialsInvalidError.prototype);
  }
}
