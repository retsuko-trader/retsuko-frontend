/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.dropIndex('market_paper_trade_trader_id')
		.execute();
	await db.schema
		.alterTable('market_paper_trade')
		.alterColumn('action', col => col.setDataType('varchar(24)'))
		.execute();
	await db.schema
		.alterTable('market_paper_trade')
		.addColumn('confidence', 'float8', col => col.defaultTo(1))
		.execute();
	await db.schema
		.alterTable('market_paper_trade')
		.alterColumn('confidence', col => col.setNotNull())
		.execute();
	await db.schema
		.createIndex('market_paper_trade_trader_id')
		.on('market_paper_trade')
		.columns(['trader_id'])
		.execute();

	await db.schema
		.dropIndex('backtest_trade_backtest_single_id')
		.execute();
	await db.schema
		.alterTable('backtest_trade')
		.alterColumn('action', col => col.setDataType('varchar(24)'))
		.execute();
	await db.schema
		.alterTable('backtest_trade')
		.addColumn('confidence', 'float8', col => col.defaultTo(1))
		.execute();
	await db.schema
		.alterTable('backtest_trade')
		.alterColumn('confidence', col => col.setNotNull())
		.execute();
	await db.schema
		.createIndex('backtest_trade_backtest_single_id')
		.on('backtest_trade')
		.columns(['backtest_single_id'])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.dropIndex('market_paper_trade_trader_id')
		.execute();
	await db.schema
		.alterTable('market_paper_trade')
		.alterColumn('action', col => col.setDataType('varchar(8)'))
		.execute();
	await db.schema
		.alterTable('market_paper_trade')
		.dropColumn('confidence')
		.execute();
	await db.schema
		.createIndex('market_paper_trade_trader_id')
		.on('market_paper_trade')
		.columns(['trader_id'])
		.execute();

	await db.schema
		.dropIndex('backtest_trade_backtest_single_id')
		.execute();
	await db.schema
		.alterTable('backtest_trade')
		.alterColumn('action', col => col.setDataType('varchar(8)'))
		.execute();
	await db.schema
		.alterTable('backtest_trade')
		.dropColumn('confidence')
		.execute();
	await db.schema
		.createIndex('backtest_trade_backtest_single_id')
		.on('backtest_trade')
		.columns(['backtest_single_id'])
		.execute();
}
