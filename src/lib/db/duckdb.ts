import { Database } from 'duckdb';
import { Kysely } from 'kysely';
import { DatabaseTables } from './tables';
import { DuckDbDialect } from 'kysely-duckdb';

const DB_URL = process.env.DB_URL || 'db.db';

export const db: Kysely<DatabaseTables> = createKysely<DatabaseTables>(DB_URL);

export function createKysely<T>(dbUrl: string) {
  const duckdb = new Database(dbUrl);
  return new Kysely<T>({
    dialect: new DuckDbDialect({
      database: duckdb,
      tableMappings: {},
    }),
  });
}