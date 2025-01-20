/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('backtest_single')
		.addColumn('metrics_raw', 'text')
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('backtest_single')
		.dropColumn('metrics_raw')
		.execute();
}
