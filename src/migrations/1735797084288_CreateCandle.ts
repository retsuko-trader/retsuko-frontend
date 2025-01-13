/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('candle')
		.addColumn('source', 'varchar(32)')
		.addColumn('interval', 'varchar(16)')
		.addColumn('symbol', 'varchar(32)')
		.addColumn('ts', 'timestamp')
		.addColumn('open', 'float8')
		.addColumn('close', 'float8')
		.addColumn('high', 'float8')
		.addColumn('low', 'float8')
		.addColumn('volume', 'float8')
		.addPrimaryKeyConstraint('primary_key', ['source', 'interval', 'symbol', 'ts'])
		.execute()

	await db.schema
		.createIndex('candle_symbol_index')
		.on('candle')
		.columns(['source', 'interval', 'symbol'])
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropIndex('candle_symbol_index').execute();
	await db.schema.dropTable('candle').execute();
}
