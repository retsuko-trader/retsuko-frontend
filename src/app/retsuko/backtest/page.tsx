import { getBacktests, getDatasetGroups } from '@/lib/retsuko/repository'
import Link from 'next/link';
import { BacktestConfigEditor } from './BacktestConfigEditor';
import { BacktestConfig, Backtester } from '@/lib/retsuko/core/backtester';
import { redirect } from 'next/navigation';
import { StrategyEntries } from '@/lib/retsuko/core/strategies';
import { formatDateShort, formatPercent } from '@/lib/helper';

export default async function RetsukoBacktestPage() {
  const backtestRuns = await getBacktests();
  const datasetGroups = await getDatasetGroups();
  const strategies = StrategyEntries.map(x => ({
    name: x.name,
    config: x.config,
  }));

  const run = async (config: BacktestConfig) => {
    'use server';

    const backtester = new Backtester(config);
    await backtester.init();

    backtester.run().then(() => {
      console.log('backtest done');
    });

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
                    {x.datasets.length}
                  </div>

                  <div className='w-24 text-right'>
                    {x.strategyVariants.length}
                  </div>

                  <div className='w-16 text-right'>
                    {formatPercent(x.tradeOptions.fee)}
                  </div>
                </div>
              </Link>
            ))
          }
        </div>

      </div>

      <div className='h-full top-0 bottom-0 right-0 w-[30rem] bg-h-background drop-shadow-lg'>
        <div className='w-full h-full bg-h-tone/5 p-3'>
          <BacktestConfigEditor
            datasetGroups={datasetGroups}
            strategies={strategies}
            runBacktest={run}
          />
        </div>
      </div>
    </div>
  )
}
