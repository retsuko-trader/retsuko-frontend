import { Database } from 'duckdb';
import { Database as DatabaseAsync } from 'duckdb-async';
import { Kysely } from 'kysely';
import { DuckDbAsyncDialect } from 'kysely-duckdb-async';
import { DatabaseTables } from './tables';
import { DuckDbDialect } from 'kysely-duckdb';

const DB_URL = process.env.DB_URL || 'db.db';

const duckdb = new Database(DB_URL);
export const db: Kysely<DatabaseTables> = new Kysely<DatabaseTables>({
  dialect: new DuckDbDialect({
    database: duckdb,
    tableMappings: {},
  }),
});

export async function initAsync() {
  const duckdb = await DatabaseAsync.create(DB_URL);

  const db = new Kysely<DatabaseTables>({
    dialect: new DuckDbAsyncDialect({
      database: duckdb,
    }),
  });

  return { duckdb, db };
}