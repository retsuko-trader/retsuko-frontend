import { StrategyEntries } from '@/lib/retsuko/core/strategies';
import { BacktestRunner } from './BacktestRunner';
import { searchDatasets } from '@/lib/retsuko/dataset';

export default async function RetsukoDatasetPage() {
  const datasets = await searchDatasets();
  const entries = StrategyEntries.map(x => ({
    name: x.name,
    config: x.config,
  }));

  return (
    <div className='w-full h-full'>
      <BacktestRunner datasets={datasets} entries={entries} />
    </div>
  )
}