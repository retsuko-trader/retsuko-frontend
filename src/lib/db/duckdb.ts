import { Database } from 'duckdb';
import { CamelCasePlugin, Kysely } from 'kysely';
import { DatabaseTables } from './tables';
import { DuckDbDialect } from '@20chan/kysely-duckdb';

const DB_URL = process.env.DB_URL || 'db.db';
const DB_ACCESS_MODE = process.env.DB_ACCESS_MODE || 'READ_WRITE';

export const db: Kysely<DatabaseTables> = createKysely<DatabaseTables>(DB_URL, {
  accessMode: DB_ACCESS_MODE,
});

export function createKysely<T>(dbUrl: string, options?: {
  accessMode?: string,
}) {
  const {
    accessMode,
  } = options ?? {};

  const duckdb = new Database(dbUrl, {
    access_mode: accessMode ?? 'READ_WRITE',
  });

  process.on('exit', () => {
    duckdb.close();
  });

  return new Kysely<T>({
    dialect: new DuckDbDialect({
      database: duckdb,
      tableMappings: {},
    }),
    plugins: [
      new CamelCasePlugin(),
    ],
  });
}
