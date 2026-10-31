import { AppError } from './AppError.js';

export function withTimeout<T>(promise: Promise<T>, timeoutMs: number, operationName = 'Operation'): Promise<T> {
  let timer: NodeJS.Timeout;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new AppError(`${operationName} timed out after ${timeoutMs}ms`, 504, 'AI_TIMEOUT'));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}
