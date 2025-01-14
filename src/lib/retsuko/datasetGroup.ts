'use server';

import { db } from '../db/duckdb';
import { DatasetGroup, RawDatasetGroup } from './tables';

function convertGroupToRaw(row: DatasetGroup | Omit<DatasetGroup, 'id'>): RawDatasetGroup {
  return {
    id: 'id' in row ? row.id : null,
    name: row.name,
    datasetsRaw: JSON.stringify(row.datasets),
  };
}

function convertRawToGroup(row: RawDatasetGroup): DatasetGroup {
  return {
    id: row.id!,
    name: row.name,
    datasets: JSON.parse(row.datasetsRaw),
  };
}

export async function getDatasetGroups(): Promise<DatasetGroup[]> {
  const resp = db.selectFrom('datasetGroup')
    .selectAll()
    .execute();

  return (await resp).map(convertRawToGroup);
}

export async function createDatasetGroup(group: Omit<DatasetGroup, 'id'>): Promise<void> {
  await db.insertInto('datasetGroup')
    .values({
      ...convertGroupToRaw(group),
      id: undefined,
    })
    .execute();
}

export async function updateDatasetGroup(group: DatasetGroup): Promise<void> {
  await db.updateTable('datasetGroup')
    .set({
      ...convertGroupToRaw(group),
      id: undefined,
    })
    .where('id', '=', group.id)
    .execute();
}

export async function deleteDatasetGroup(id: number): Promise<void> {
  await db.deleteFrom('datasetGroup')
    .where('id', '=', id)
    .execute();
}
