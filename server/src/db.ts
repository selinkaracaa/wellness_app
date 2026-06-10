import pg from 'pg'
import { config } from './config.ts'

// Postgres returns DATE columns as JS Date objects by default; we want the
// raw 'YYYY-MM-DD' string so date math stays timezone-stable.
pg.types.setTypeParser(1082, (v) => v)

export const pool = new pg.Pool({ connectionString: config.databaseUrl })

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params)
}

export type PoolClient = pg.PoolClient

/** Run a function inside a transaction, committing on success. */
export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
