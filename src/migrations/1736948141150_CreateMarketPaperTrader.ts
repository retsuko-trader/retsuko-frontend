/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('market_paper_trader_state')
		.addColumn('id', 'varchar(32)', col => col.primaryKey().notNull())
		.addColumn('name', 'varchar(255)', col => col.notNull())
		.addColumn('description', 'varchar(255)', col => col.notNull())
		.addColumn('created_at', 'timestamp', col => col.notNull())
		.addColumn('updated_at', 'timestamp', col => col.notNull())
		.addColumn('ended_at', 'timestamp')
		.addColumn('symbol', 'varchar(32)', col => col.notNull())
		.addColumn('interval', 'varchar(16)', col => col.notNull())
		.addColumn('strategy_name', 'varchar(32)', col => col.notNull())
		.addColumn('strategy_config_raw', 'text', col => col.notNull())
		.addColumn('strategy_serialized', 'text', col => col.notNull())
		.addColumn('trader_serialized', 'text', col => col.notNull())
		.execute();

	await db.schema
		.createTable('market_paper_trade')
		.addColumn('id', 'varchar(32)', col => col.primaryKey().notNull())
		.addColumn('trader_id', 'varchar(32)', col => col.notNull())
		.addColumn('ts', 'timestamp', col => col.notNull())
		.addColumn('action', 'varchar(8)', col => col.notNull())
		.addColumn('asset', 'float8', col => col.notNull())
		.addColumn('currency', 'float8', col => col.notNull())
		.addColumn('price', 'float8', col => col.notNull())
		.addColumn('profit', 'float8')
		.execute();

	await db.schema
		.createIndex('market_paper_trade_trader_id')
		.on('market_paper_trade')
		.columns(['trader_id'])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropIndex('market_paper_trade_trader_id').execute();
	await db.schema.dropTable('market_paper_trade').execute();
	await db.schema.dropTable('market_paper_trader_state').execute();
}
