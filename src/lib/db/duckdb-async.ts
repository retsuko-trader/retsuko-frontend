
import { Database } from 'duckdb-async';
import { Kysely } from 'kysely';
import { DuckDbAsyncDialect } from 'kysely-duckdb-async';
import { DatabaseTables } from './tables';

const DB_URL = process.env.DB_URL || 'db.db';

export async function init() {
  const duckdb = await Database.create(DB_URL);

  const db = new Kysely<DatabaseTables>({
    dialect: new DuckDbAsyncDialect({
      database: duckdb,
    }),
  });

  return { duckdb, db };
}