/* eslint-disable @typescript-eslint/no-explicit-any */
import { CompiledQuery, sql, type Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
	await db
		.executeQuery(CompiledQuery.raw(`CREATE SEQUENCE dataset_group_id_seq START 1`));

	await db.schema
		.createTable('dataset_group')
		.addColumn('id', 'integer', x => x.primaryKey().defaultTo(sql`nextval('dataset_group_id_seq')`))
		.addColumn('name', 'varchar(64)')
		.addColumn('datasets_raw', 'text')
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.dropTable('dataset_group').execute();
	await db
		.executeQuery(CompiledQuery.raw(`DROP SEQUENCE dataset_group_id_seq`));
}
