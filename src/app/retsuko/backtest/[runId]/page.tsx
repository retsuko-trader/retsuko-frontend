import { formatDateShort } from '@/lib/helper/date';
import { getBacktestRunGroup } from '@/lib/retsuko/repository';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ runId: string }>;
}

export default async function RestsukoBacktestRunPage({ params }: Props) {
  const { runId } = await params;

  const backtestRunGroup = await getBacktestRunGroup(runId);

  if (!backtestRunGroup) {
    notFound();
  }

  const { run, singles } = backtestRunGroup;

  const getStrategyIndex = (strategy: { name: string, config: Record<string, number> }) => {
    return run.strategyVariants.findIndex(x => (
      x.name === strategy.name && JSON.stringify(x.config) === JSON.stringify(strategy.config)
    ));
  };

  const formatBalance = (balance: number) => {
    return balance.toFixed(2);
  };

  const formatPercent = (percent: number) => {
    return (percent * 100).toFixed(2) + '%';
  };

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto'>
        <div className=''>
          Backtest result for {run.id}
        </div>

        <div className='mt-3'>
          <p>info</p>
          <div className='border-l-2 border-h-yellow/80 pl-2 font-mono'>
            <Row label='createdAt' value={formatDateShort(run.createdAt)} />
            <Row label='endedAt' value={run.endedAt ? formatDateShort(run.endedAt) : 'running'} />

            <Row label='datasets' value={<div className='border-l-2 border-h-yellow/80 pl-2 mb-2'>
              {
                run.datasets.map((dataset, i) => (
                  <div key={`dataset-${i}`}>
                    {dataset.alias} ({formatDateShort(dataset.start)} - {formatDateShort(dataset.end)})
                  </div>
                ))
              }
            </div>} />

            <Row label='strategies' value={<div className='border-l-2 border-h-yellow/80 pl-2 mb-2'>
              {
                run.strategyVariants.map((strategy, i) => (
                  <div key={`strategy-${i}`}>
                    {strategy.name} ({JSON.stringify(strategy.config)})
                  </div>
                ))
              }
            </div>} />

            <Row label='balance' value={run.tradeOptions.balanceInitial} />
            <Row label='fee' value={formatPercent(run.tradeOptions.fee)} />
          </div>
        </div>

        <div className='mt-3 font-mono'>
          <table>
            <thead>
              <tr className='text-h-text/80 bg-h-tone/10'>
                <th>dataset</th>
                <th>strategy</th>
                <th>balance</th>
                <th className='text-right'>profit</th>
                <th className='text-right'>trades</th>
                <th>w/l</th>
                <th className='text-right'>avg p%</th>
              </tr>
            </thead>
            <tbody className='text-h-text/60'>
              {
                singles.map(single => (
                  <tr key={single.id} className='even:bg-h-tone/5 hover:text-h-text/80 cursor-pointer'>
                    <td className='w-44'>
                      {single.dataset.alias}
                    </td>
                    <td className='w-28'>
                      {single.strategy.name}[{getStrategyIndex(single.strategy)}]
                    </td>
                    <td className='w-12 text-right'>
                      {formatBalance(single.result.balanceFinal)}
                    </td>
                    <td className='w-20 text-right'>
                      {formatPercent(single.result.profit)}
                    </td>
                    <td className='w-16 text-right'>
                      {single.result.tradesCount}
                    </td>
                    <td className='w-24 text-center'>
                      {single.result.tradesWin}/{single.result.tradesLoss}
                    </td>
                    <td className='w-20 text-right'>
                      {formatPercent(single.result.avgTradeProfit)}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>

        </div>

      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className='w-32 inline-block align-top'>
        {label}:
      </p>
      <div className='inline-block'>
        {value}
      </div>
    </div>
  );
}