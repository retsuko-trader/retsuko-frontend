import { StrategyEntries } from '@/lib/retsuko/core/strategies';
import { SingleBacktestRunner } from './SingleBacktestRunner';
import { searchDatasets } from '@/lib/retsuko/repository';

export default async function RetsukoDatasetPage() {
  const datasets = await searchDatasets();
  const entries = StrategyEntries.map(x => ({
    name: x.name,
    config: x.config,
  }));

  return (
    <div className='w-full h-full'>
      {
        datasets.length === 0 || entries.length === 0 ? (
          <div>
            <p>no datasets or entries</p>
          </div>
        ) : (
            <SingleBacktestRunner datasets={datasets} entries={entries} />
        )
      }
    </div>
  )
}