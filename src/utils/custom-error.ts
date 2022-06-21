export class CustomError extends Error {
  statusCode = 400;

  constructor(message: string, code?: number) {
    super(message);
    if (code) {
      this.statusCode = code;
    }
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  getErrorMessage() {
    return this.message;
  }

  getErrorCode() {
    return this.statusCode;
  }

  getStack() {
    return this.stack;
  }
}
