import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import interpolate from 'color-interpolate';
import { formatBalance, formatDateShort, formatPercent } from '@/lib/helper';
import { deleteBacktestRun, getBacktestRunGroup, getBacktestTradesBalancesSampled } from '@/lib/retsuko/repository';
import { SimpleChart } from '@/components/SimpleChart';
import { revalidatePath } from 'next/cache';

interface Props {
  params: Promise<{ runId: string }>;
}

export default async function RestsukoBacktestRunPage({ params }: Props) {
  const { runId } = await params;

  await connection();
  const backtestRunGroup = await getBacktestRunGroup(runId);

  if (!backtestRunGroup) {
    notFound();
  }

  const { run, singles } = backtestRunGroup;
  const trades = await Promise.all(singles.map(x => getBacktestTradesBalancesSampled(x.id)));

  const getStrategyIndex = (strategy: { name: string, config: Record<string, number> }) => {
    return run.strategyVariants.findIndex(x => (
      x.name === strategy.name && JSON.stringify(x.config) === JSON.stringify(strategy.config)
    ));
  };

  const color = interpolate(['rgb(228 86 73)', 'rgb(1 132 188)', 'rgb(1 132 188)', 'rgb(80 161 79)']);

  const removeRun = async () => {
    'use server';
    await deleteBacktestRun(run.id);
    revalidatePath('/retsuko/backtest');
    redirect('/retsuko/backtest');
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
                    <div className='inline-block mr-2 align-top'>
                      {strategy.name}
                    </div>
                    <div className='inline-block'>
                      <div className='max-w-[48rem] break-words'>
                        {JSON.stringify(strategy.config)}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>} />

            <Row label='balance' value={run.tradeOptions.initialBalance} />
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
                <th className='text-right'>sharpe</th>
                <th className='text-right'>sortino</th>
                <th className='text-right'>drawdown</th>
                <th className='text-right'>profit/m</th>
                <th className='text-right'>market</th>
                <th className='text-right'>trades</th>
                <th>w/l</th>
                <th className='text-right pr-2'>avg p%</th>
                <th>balances</th>
              </tr>
            </thead>
            <tbody className='text-h-text/60'>
              {
                singles.map((single, i) => (
                  <tr key={single.id} className='even:bg-h-tone/5 hover:text-h-text/80 cursor-pointer'>
                    <td className='w-44 pl-1'>
                      {single.dataset.alias}
                    </td>
                    <td className='w-28'>
                      {single.strategy.name}[{getStrategyIndex(single.strategy)}]
                    </td>
                    <td className='w-12 text-right'>
                      {formatBalance(single.result.balanceFinal)}
                    </td>
                    <td className='w-20 text-right' style={{
                      color: color((single.result.profit - 1) / 3),
                    }}>
                      {formatPercent(single.result.profit)}
                    </td>
                    <td className='w-16 text-right' style={{
                      color: color((single.metrics.sharpe - 0.2) / 2),
                    }}>
                      {formatBalance(single.metrics.sharpe, 3)}
                    </td>
                    <td className='w-16 text-right' style={{
                      color: color((single.metrics.sortino - 0.2) / 2),
                    }}>
                      {formatBalance(single.metrics.sortino, 3)}
                    </td>
                    <td className='w-20 text-right' style={{
                      color: color(single.metrics.drawdown + 0.8),
                    }}>
                      {formatPercent(single.metrics.drawdown)}
                    </td>
                    <td className='w-20 text-right' style={{
                      color: color(single.metrics.totalProfit / single.metrics.marketChange),
                    }}>
                      {formatPercent(single.metrics.totalProfit / single.metrics.marketChange)}
                    </td>
                    <td className='w-20 text-right'>
                      {formatPercent(single.metrics.marketChange)}
                    </td>
                    <td className='w-16 text-right'>
                      {single.result.tradesCount}
                    </td>
                    <td className='w-24 text-center'>
                      {single.result.tradesWin}/{single.result.tradesLoss}
                    </td>
                    <td className='w-20 text-right pr-2'>
                      {formatPercent(single.result.avgTradeProfit)}
                    </td>
                    <td className='w-36'>
                      <SimpleChart data={trades[i]} reference={single.result.balanceInitial} />
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>

        </div>

        <button onClick={removeRun} className='mt-6 w-32 px-4 py-1 bg-h-red/80 hover:bg-h-red/60'>
          delete
        </button>

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
