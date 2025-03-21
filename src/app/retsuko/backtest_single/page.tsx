import { SingleBacktestRunner } from './SingleBacktestRunner';
import { getStrategies } from '@/lib/retsuko/api/strategy';
import { getDataset, getSymbols } from '@/lib/retsuko/api/candle';

export default async function RetsukoSingleBacktestPage() {
  const datasets = await getDataset();
  const symbols = await getSymbols();
  const strategies = await getStrategies();

  return (
    <div className='w-full h-full'>
      {
        datasets.length === 0 || strategies.length === 0 ? (
          <div>
            <p>no datasets or entries</p>
          </div>
        ) : (
            <SingleBacktestRunner datasets={datasets} strategies={strategies} symbols={symbols} />
        )
      }
    </div>
  )
}
