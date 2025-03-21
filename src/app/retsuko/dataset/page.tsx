import { formatDateShort } from '@/lib/helper';
import React from 'react';
import { connection } from 'next/server';
import { getDataset, getSymbols } from '@/lib/retsuko/api/candle';
import { Market } from '@/lib/retsuko/interfaces/Dataset';
import { Intervals } from '@/lib/helper/interval';

async function get() {
  'use server';

  const datasets = await getDataset();
  const symbols = await getSymbols();
  return { datasets, symbols };
}

export default async function RetsukoDatasetPage() {
  await connection();
  const { datasets, symbols } = await get();

  const symbolsMap = new Map<number, string>();
  symbols.forEach((symbol) => symbolsMap.set(symbol.id, symbol.name));

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
              const symbol = symbolsMap.get(dataset.symbolId);
              const key = `${dataset.market}_${symbol}_${dataset.interval}`;

              return (
                <tr key={key} className='text-h-text/60 group hover:text-h-text/80 cursor-pointer even:bg-h-tone/5'>
                  <td className='w-20 pl-1'>
                    {Market[dataset.market]}
                  </td>
                  <td className='w-20'>
                    {symbol}
                  </td>
                  <td className='w-10'>
                    {Intervals[dataset.interval]}
                  </td>
                  <td className='w-36'>
                    {formatDateShort(new Date(dataset.start))}
                  </td>
                  <td className='w-36'>
                    {formatDateShort(new Date(dataset.end))}
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
