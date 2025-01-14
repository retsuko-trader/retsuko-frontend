'use server';

import { db } from '../db/duckdb';
import { DatasetGroup, RawDatasetGroup } from './tables';

function convertGroupToRaw(row: DatasetGroup | Omit<DatasetGroup, 'id'>): RawDatasetGroup {
  return {
    id: 'id' in row ? row.id : null,
    name: row.name,
    datasets_raw: JSON.stringify(row.datasets),
  };
}

function convertRawToGroup(row: RawDatasetGroup): DatasetGroup {
  return {
    id: row.id!,
    name: row.name,
    datasets: JSON.parse(row.datasets_raw),
  };
}

export async function getDatasetGroups(): Promise<DatasetGroup[]> {
  const resp = db.selectFrom('dataset_group')
    .selectAll()
    .execute();

  return (await resp).map(convertRawToGroup);
}

export async function createDatasetGroup(group: Omit<DatasetGroup, 'id'>): Promise<void> {
  await db.insertInto('dataset_group')
    .values({
      ...convertGroupToRaw(group),
      id: undefined,
    })
    .execute();
}

export async function updateDatasetGroup(group: DatasetGroup): Promise<void> {
  await db.updateTable('dataset_group')
    .set({
      ...convertGroupToRaw(group),
      id: undefined,
    })
    .where('id', '=', group.id)
    .execute();
}

export async function deleteDatasetGroup(id: number): Promise<void> {
  await db.deleteFrom('dataset_group')
    .where('id', '=', id)
    .execute();
}