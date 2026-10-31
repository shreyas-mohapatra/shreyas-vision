import { redactObject, redactString } from './redact.js';

export const logger = {
  info: (msg: string, meta?: any) => {
    if (meta) {
      console.log(`[INFO] ${redactString(msg)}`, redactObject(meta));
    } else {
      console.log(`[INFO] ${redactString(msg)}`);
    }
  },
  warn: (msg: string, meta?: any) => {
    if (meta) {
      console.warn(`[WARN] ${redactString(msg)}`, redactObject(meta));
    } else {
      console.warn(`[WARN] ${redactString(msg)}`);
    }
  },
  error: (msg: string, error?: any) => {
    if (error) {
      const errObj = error instanceof Error
        ? { message: error.message, stack: process.env.NODE_ENV === 'development' ? error.stack : undefined }
        : error;
      console.error(`[ERROR] ${redactString(msg)}`, redactObject(errObj));
    } else {
      console.error(`[ERROR] ${redactString(msg)}`);
    }
  },
};
