'use client';

import { useRouter } from 'next/navigation'
import type { DatasetGroup } from '@/lib/retsuko/tables';
import { createNewGroup } from './actions';

interface Props {
  groups: DatasetGroup[];
}

export function DatasetGroupTable({ groups }: Props) {
  const router = useRouter();

  const createAndRefresh = async () => {
    await createNewGroup();
    router.refresh();
  }

  const navigateToGroup = (id: number) => {
    router.push(`?id=${id}`);
  };

  return (
    <div className='w-fit'>
      <table className='font-mono'>
        <thead>
          <tr className='text-h-text/80 bg-h-tone/10'>
            <th>name</th>
            <th>alias</th>
          </tr>
        </thead>
        <tbody>
          {
            groups.map(x => (
              <tr key={x.id} className='group hover:bg-h-tone/5 cursor-pointer' onClick={() => navigateToGroup(x.id)}>
                <td className='w-48'>
                  {x.name === ''
                    ? <span className='text-h-text/40'>untitled</span>
                    : x.name}
                </td>
                <td className='w-20 text-right'>
                  {x.datasets.length}
                </td>
              </tr>
            ))
          }
        </tbody>
      </table>
      <button className='w-full text-center bg-h-green/60 hover:bg-h-green/40' onClick={createAndRefresh}>
        +
      </button>
    </div>
  )
}