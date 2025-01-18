import { formatDateShort } from '@/lib/helper';
import { searchDatasets } from '@/lib/retsuko/repository';
import { importDataFromCandleDatabase } from './actions';
import React from 'react';

export default async function RetsukoDatasetPage() {
  const datasets = await searchDatasets();

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto'>
        <table className='font-mono'>
          <thead>
            <tr className='text-h-text/80 text-left bg-h-tone/10'>
              <th className='pl-1'>source</th>
              <th>symbol</th>
              <th>int</th>
              <th className='text-center'>start</th>
              <th className='text-center'>end</th>
              <th className='text-right pr-1'>count</th>
            </tr>
          </thead>
          <tbody>
            {datasets.map((dataset) => {
              const key = `${dataset.market}_${dataset.symbol}_${dataset.interval}`;

              return (
                <tr key={key} className='text-h-text/60 group hover:text-h-text/80 cursor-pointer even:bg-h-tone/5'>
                  <td className='w-20 pl-1'>
                    {dataset.market}
                  </td>
                  <td className='w-20'>
                    {dataset.symbol}
                  </td>
                  <td className='w-10'>
                    {dataset.interval}
                  </td>
                  <td className='w-36'>
                    {formatDateShort(dataset.start)}
                  </td>
                  <td className='w-36'>
                    {formatDateShort(dataset.end)}
                  </td>
                  <td className='w-20 text-right pr-1'>
                    {dataset.count}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className='h-full top-0 bottom-0 right-0 w-[30rem] bg-h-background drop-shadow-lg'>
        <div className='w-full h-full bg-h-tone/5 p-3'>
          <div>
            actions
          </div>

          <div className='mt-4 flex flex-col gap-2'>
            <StyledButton onClick={importDataFromCandleDatabase}>
              import data from candle database
            </StyledButton>
          </div>

        </div>
      </div>
    </div>
  );
} 

const StyledButton = ({ children, onClick }: React.ComponentProps<'button'>) => (
  <button
    onClick={onClick}
    className='w-full px-4 py-1 bg-h-red/60 hover:bg-h-red/40'
  >
    {children}
  </button>
)
