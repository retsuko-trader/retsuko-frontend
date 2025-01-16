/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('backtest_run')
		.addColumn('enable_margin', 'boolean', col => col.defaultTo(false))
		.execute();
	await db.schema
		.alterTable('backtest_run')
		.alterColumn('enable_margin', col => col.setNotNull())
		.execute();

	await db.schema
		.alterTable('backtest_run')
		.addColumn('valid_trade_only', 'boolean', col => col.defaultTo(false))
		.execute();
	await db.schema
		.alterTable('backtest_run')
		.alterColumn('valid_trade_only', col => col.setNotNull())
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('backtest_run')
		.dropColumn('enable_margin')
		.execute();

	await db.schema
		.alterTable('backtest_run')
		.dropColumn('valid_trade_only')
		.execute();
}
