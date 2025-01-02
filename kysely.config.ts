import { defineConfig } from 'kysely-ctl';
import { db } from './src/lib/db/duckdb';

export default defineConfig({
  kysely: db,
  migrations: {
    migrationFolder: 'src/migrations',
  },
});