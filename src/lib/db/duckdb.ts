import { Database } from 'duckdb';
import { Kysely } from 'kysely';
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