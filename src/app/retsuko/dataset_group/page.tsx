import { getDatasetGroups } from '@/lib/retsuko/datasetGroup';
import { DatasetGroupTable } from './DatasetGroupTable';
import { DatasetGroupEditor } from './DatasetGroupEditor';
import { searchDatasets } from '@/lib/retsuko/dataset';

interface Props {
  searchParams: Record<string, string>;
}

export default async function RestsukoDatasetGroupPage({ searchParams }: Props) {
  const datasets = await searchDatasets();
  const groups = await getDatasetGroups();

  const selectedGroup = groups.find(x => x.id === Number(searchParams.id));

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto'>

        <DatasetGroupTable groups={groups} />
      </div>

      <div className='h-full top-0 bottom-0 right-0 w-[30rem] bg-h-background drop-shadow-lg'>
        <div className='w-full h-full bg-h-tone/5 p-3'>
          <DatasetGroupEditor datasets={datasets} group={selectedGroup} />
        </div>
      </div>
    </div>
  )
}