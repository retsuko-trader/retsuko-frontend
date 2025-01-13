'use server';

import { importFromCandleDb } from '@/lib/retsuko/dataset';

export async function importDataFromCandleDatabase() {
  await importFromCandleDb();
}