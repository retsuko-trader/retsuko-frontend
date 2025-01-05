import { Database } from 'duckdb-async';
import { Kysely } from 'kysely';
import { DuckDbAsyncDialect } from 'kysely-duckdb-async';
import { DatabaseTables } from './tables';

const DB_URL = process.env.DB_URL || 'db.db';

let duckdb: Database;
export let db: Kysely<DatabaseTables>;

export async function init() {
  duckdb = await Database.create(DB_URL);

  db = new Kysely<DatabaseTables>({
    dialect: new DuckDbAsyncDialect({
      database: duckdb,
    }),
  });
}