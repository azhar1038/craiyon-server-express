export class NoImageError extends Error {
  constructor() {
    super('Requested image does not exists or you do not have permission to view');
    Object.setPrototypeOf(this, NoImageError.prototype);
  }
}
