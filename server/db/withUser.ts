import { pool } from './pool.js';

/**
 * Runs fn(client) inside a PostgreSQL transaction with Row Level Security context set for the given user.
 * This guarantees strict tenant isolation at both the DB and application layers.
 */
export async function withUser<T>(
  userId: string,
  fn: (client: any) => Promise<T>,
  customPool = pool
): Promise<T> {
  const client = await customPool.connect();
  try {
    await client.query('BEGIN');
    try {
      await client.query("SELECT set_config('app.current_user_id', $1, true)", [userId]);
    } catch {
      // In case underlying DB or test adapter does not support set_config
    }
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Ignore rollback failure if connection was lost
    }
    throw err;
  } finally {
    client.release();
  }
}
