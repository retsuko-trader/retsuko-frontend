/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('backtest_single')
		.addColumn('id', 'varchar(32)', col => col.primaryKey().notNull())
		.addColumn('run_id', 'varchar(32)', col => col.notNull())
		.addColumn('dataset_alias', 'varchar(64)')
		.addColumn('dataset_start', 'timestamp')
		.addColumn('dataset_end', 'timestamp')
		.addColumn('strategy_name', 'varchar(64)')
		.addColumn('strategy_config_raw', 'text')
		.addColumn('balance_initial', 'float8')
		.addColumn('balance_final', 'float8')
		.addColumn('profit', 'float8')
		.addColumn('trades_count', 'integer')
		.addColumn('trades_win', 'integer')
		.addColumn('trades_loss', 'integer')
		.addColumn('avg_trade_profit', 'float8')
		.execute();

	await db.schema
		.createTable('backtest_run')
		.addColumn('id', 'varchar(32)', col => col.primaryKey().notNull())
		.addColumn('created_at', 'timestamp')
		.addColumn('ended_at', 'timestamp')
		.addColumn('dataset_group_id', 'integer')
		.addColumn('datasets', 'text')
		.addColumn('strategy_variants', 'text')
		.addColumn('balance_initial', 'float8')
		.addColumn('fee', 'float8')
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('backtest_single').execute();
	await db.schema.dropTable('backtest_run').execute();
}
