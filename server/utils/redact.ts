/**
 * Redaction utility for security
 * Strips tokens, passwords, API keys, and authorization headers from logs and error dumps.
 */

const SENSITIVE_PATTERNS = [
  /AIza[0-9A-Za-z_-]{35}/g,
  /AQ\.[0-9A-Za-z_-]{40,}/g,
  /Bearer\s+[A-Za-z0-9\-_.]+/gi,
  /"password"\s*:\s*"[^"]+"/gi,
  /"password_hash"\s*:\s*"[^"]+"/gi,
  /"token"\s*:\s*"[^"]+"/gi,
];

export function redactString(str: string): string {
  if (!str) return str;
  let result = str;
  for (const pattern of SENSITIVE_PATTERNS) {
    result = result.replace(pattern, '[REDACTED]');
  }
  return result;
}

export function redactObject<T>(obj: T): T {
  if (!obj || typeof obj !== 'object') {
    if (typeof obj === 'string') {
      return redactString(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => redactObject(item)) as unknown as T;
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj as Record<string, any>)) {
    const lowerKey = key.toLowerCase();
    if (
      lowerKey.includes('password') ||
      lowerKey.includes('secret') ||
      lowerKey.includes('apikey') ||
      lowerKey.includes('api_key') ||
      lowerKey.includes('authorization') ||
      lowerKey.includes('token')
    ) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'string') {
      sanitized[key] = redactString(val);
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = redactObject(val);
    } else {
      sanitized[key] = val;
    }
  }

  return sanitized as T;
}
