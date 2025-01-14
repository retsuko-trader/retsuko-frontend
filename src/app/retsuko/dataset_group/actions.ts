'use server';

import { createDatasetGroup } from '@/lib/retsuko/datasetGroup';

export async function createNewGroup() {
  await createDatasetGroup({
    name: '',
    datasets: [],
  });
}