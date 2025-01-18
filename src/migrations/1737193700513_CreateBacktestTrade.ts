/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('backtest_trade')
		.addColumn('backtest_single_id', 'varchar(32)', col => col.notNull())
		.addColumn('ts', 'timestamp', col => col.notNull())
		.addColumn('action', 'varchar(8)', col => col.notNull())
		.addColumn('asset', 'float8', col => col.notNull())
		.addColumn('currency', 'float8', col => col.notNull())
		.addColumn('price', 'float8', col => col.notNull())
		.addColumn('profit', 'float8')
		.addPrimaryKeyConstraint('primary_key', ['backtest_single_id', 'ts'])
		.execute();

	await db.schema
		.createIndex('backtest_trade_backtest_single_id')
		.on('backtest_trade')
		.columns(['backtest_single_id'])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('backtest_trade').execute();
}
