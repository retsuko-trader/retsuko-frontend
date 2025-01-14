'use server';

import { importFromCandleDb } from '@/lib/retsuko/importer';

export async function importDataFromCandleDatabase() {
  await importFromCandleDb();
}