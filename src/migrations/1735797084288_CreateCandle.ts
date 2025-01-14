/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('candle')
		.addColumn('market', 'varchar(32)')
		.addColumn('symbol', 'varchar(32)')
		.addColumn('interval', 'varchar(16)')
		.addColumn('ts', 'timestamp')
		.addColumn('open', 'float8')
		.addColumn('close', 'float8')
		.addColumn('high', 'float8')
		.addColumn('low', 'float8')
		.addColumn('volume', 'float8')
		.addPrimaryKeyConstraint('primary_key', ['market', 'symbol', 'interval', 'ts'])
		.execute()

	await db.schema
		.createIndex('candle_symbol_index')
		.on('candle')
		.columns(['market', 'symbol', 'interval'])
		.execute()
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropIndex('candle_symbol_index').execute();
	await db.schema.dropTable('candle').execute();
}
