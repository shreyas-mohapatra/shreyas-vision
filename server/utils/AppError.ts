export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public details: any[];
  public isOperational: boolean;

  constructor(message: string, statusCode = 400, code = 'APP_ERROR', details: any[] = []) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}
