'use client';

import { useRouter } from 'next/navigation'
import classNames from 'classnames';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { EditableText } from '@/components/EditableText';
import { getDatasetAlias } from '@/lib/retsuko/core/dataset';
import type { Dataset } from '@/lib/retsuko/repository';
import { deleteDatasetGroup, updateDatasetGroup } from '@/lib/retsuko/repository/datasetGroup';
import { DatasetGroup } from '@/lib/retsuko/tables';
import { sortDatasetAlias } from '@/lib/helper';

interface Props {
  datasets: Dataset[];
  group?: DatasetGroup;
}

export function DatasetGroupEditor({ datasets, group: group0 }: Props) {
  const router = useRouter();
  const [group, setGroup] = useState(group0);

  useEffect(() => {
    setGroup(group0);
  }, [group0]);

  useEffect(() => {
    if (group) {
      updateDatasetGroup(group);
    }
  }, [group]);

  if (!group0 || !group) {
    return (
      <div>select a group</div>
    )
  }

  const removeGroup = async () => {
    if (!group) {
      return;
    }

    await deleteDatasetGroup(group.id);
    router.push('?');
  };

  const addDataset = () => {
    setGroup(x => {
      if (!x) {
        return x;
      }

      return {
        ...x,
        datasets: [...x.datasets, {
          alias: getDatasetAlias(datasets[0]),
          start: datasets[0].start,
          end: datasets[0].end,
        }]
      }
    })
  };

  const changeDataset = (index: number, options: {
    alias?: string;
    start?: Date;
    end?: Date;
  }) => {
    setGroup(x => {
      if (!x) {
        return x;
      }

      const datasets = [...x.datasets];
      datasets[index] = {
        ...datasets[index],
        ...options,
      };

      return {
        ...x,
        datasets,
      };
    });
  };

  const removeDataset = (index: number) => {
    setGroup(x => {
      if (!x) {
        return x;
      }

      const datasets = [...x.datasets];
      datasets.splice(index, 1);

      return {
        ...x,
        datasets,
      };
    });
  };

  return (
    <div className='font-mono'>
      <div>
        <EditableText text={group.name} setText={name => setGroup({ ...group, name })}
          className={classNames('w-full text-h-text min-h-6')}
          placeHolder={<span className='text-h-text/40'>GROUP_NAME</span>}
        />

        <div className='mt-4 flex flex-col gap-2'>
          {
            group.datasets.sort((a, b) => sortDatasetAlias(a.alias, b.alias)).map((x, i) => (
              <div key={`${group.id}_datasets${i}`} className='border-l-2 border-h-yellow/80 mt-1 pl-2'>
                <div className='flex flex-row justify-between'>
                  <select value={x.alias} onChange={e => changeDataset(i, { alias: e.target.value })} className='inline-block w-52'>
                    {datasets.map(dataset => {
                      const key = getDatasetAlias(dataset);
                      return (
                        <option key={key} value={key}>{key}</option>
                      )
                    })}
                  </select>

                  <button onClick={() => removeDataset(i)} className='mr-2 font-bold text-h-red/60 hover:text-h-red/80'>
                    X
                  </button>

                </div>

                <div className='flex flex-row'>
                  <input
                    type='date'
                    value={moment(x.start).format('YYYY-MM-DD')}
                    onChange={e => changeDataset(i, { start: new Date(e.target.value) })}
                    className='inline-block w-36'
                  />

                  <p className='px-4'>
                    ~
                  </p>

                  <input
                    type='date'
                    value={moment(x.end).format('YYYY-MM-DD')}
                    onChange={e => changeDataset(i, { end: new Date(e.target.value) })}
                    className='inline-block w-36'
                  />
                </div>
              </div>
            ))
          }

          <button onClick={addDataset} className='w-full px-4 py-0.5 bg-h-yellow/60 hover:bg-h-yellow/40'>
            add dataset
          </button>
        </div>

        <div className='mt-8'>


          <button onClick={removeGroup} className='w-full px-4 py-0.5 bg-h-red/60 hover:bg-h-red/40'>
            delete group
          </button>
        </div>
      </div>
    </div>
  )
}
