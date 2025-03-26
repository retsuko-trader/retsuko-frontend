import Link from 'next/link';
import { BacktestConfigEditor } from './BacktestConfigEditor';
import { redirect } from 'next/navigation';
import { formatDateShort, formatPercent } from '@/lib/helper';
import { connection } from 'next/server';
import { getBacktestBulkRuns, runBacktestBulk } from '@/lib/retsuko/api/backtester';
import { getDataset, getSymbols } from '@/lib/retsuko/api/candle';
import { getStrategies } from '@/lib/retsuko/api/strategy';
import { BulkBacktestConfig } from '@/lib/retsuko/interfaces/BacktestConfig';

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function RetsukoBacktestPage() {
  await connection();

  const backtestRuns = await getBacktestBulkRuns();
  const datasets = await getDataset();
  const symbols = await getSymbols();
  const strategies = await getStrategies();

  const run = async (config: BulkBacktestConfig) => {
    'use server';

    await runBacktestBulk(config);

    redirect('/retsuko/backtest');
  };

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto'>

        <div className='flex flex-col w-fit font-mono'>
          <div className='flex flex-row text-center bg-h-tone/10 font-bold'>
            <div className='w-36'>
              created_at
            </div>

            <div className='w-14'>
              status
            </div>

            <div className='w-24 text-right'>
              datasets
            </div>

            <div className='w-24 text-right'>
              strategy
            </div>

            <div className='w-16 text-right'>
              fee
            </div>
          </div>
          {
            backtestRuns.map(x => (
              <Link key={x.id} href={`/retsuko/backtest/${x.id}`} className='odd:bg-h-tone/5'>
                <div className='flex flex-row text-h-text/60 hover:text-h-text cursor-pointer px-2 py-0.5'>
                  <div className='w-36'>
                    {formatDateShort(x.createdAt)}
                  </div>

                  <div className='w-14'>
                    {x.endedAt ? 'ended' : 'running'}
                  </div>

                  <div className='w-24 text-right'>
                    {x.config.datasets.length}
                  </div>

                  <div className='w-24 text-right'>
                    {x.config.strategies.length}
                  </div>

                  <div className='w-16 text-right'>
                    {formatPercent(x.config.broker.fee)}
                  </div>
                </div>
              </Link>
            ))
          }
        </div>

      </div>

      <div className='h-full top-0 bottom-0 right-0 w-[32rem] bg-h-background drop-shadow-lg'>
        <div className='w-full h-full bg-h-tone/5 p-3 overflow-y-auto'>
          <BacktestConfigEditor
            datasets={datasets}
            symbols={symbols}
            strategies={strategies}
            runBacktest={run}
          />
        </div>
      </div>
    </div>
  )
}
