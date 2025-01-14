'use server';

import { createDatasetGroup } from '@/lib/retsuko/repository';

export async function createNewGroup() {
  await createDatasetGroup({
    name: '',
    datasets: [],
  });
}