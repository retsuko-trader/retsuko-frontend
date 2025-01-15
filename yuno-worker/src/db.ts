import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';

const sqlite = new Database('db.sqlite');

export interface KlineStream {
  id?: number;
  symbol: string;
  interval: string;
  createdAt: number;

  lastOpenTs: number;
  lastEndTs: number;

  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

interface Database {
  klineStream: KlineStream;
}

export const db = new Kysely<Database>({
  dialect: new SqliteDialect({
    database: sqlite,
  }),
});

export async function prepare() {
  await db.schema
    .createTable('klineStream')
    .ifNotExists()
    .addColumn('id', 'integer', col => col.primaryKey().autoIncrement())
    .addColumn('symbol', 'varchar(32)')
    .addColumn('interval', 'varchar(32)')
    .addColumn('createdAt', 'integer')
    .addColumn('lastOpenTs', 'integer')
    .addColumn('lastEndTs', 'integer')
    .addColumn('open', 'real')
    .addColumn('close', 'real')
    .addColumn('high', 'real')
    .addColumn('low', 'real')
    .addColumn('volume', 'real')
    .execute();
}