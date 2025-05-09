import * as R from 'remeda';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';
import interpolate from 'color-interpolate';
import { formatBalance, formatDateShort, formatPercent } from '@/lib/helper';
import { getBacktestBulkRun, getBacktestSingleTrades } from '@/lib/retsuko/api/backtester';
import { DatasetConfig } from '@/lib/retsuko/interfaces/BacktestConfig';
import { getSymbols } from '@/lib/retsuko/api/candle';
import { SimpleChart } from '@/components/SimpleChart';

interface Props {
  params: Promise<{ runId: string }>;
}

export default async function RestsukoBacktestRunPage({ params }: Props) {
  const { runId } = await params;

  await connection();
  const backtestRun = await getBacktestBulkRun(runId);
  const symbols = await getSymbols();

  if (!backtestRun) {
    notFound();
  }

  const { run, singles } = backtestRun;

  const singlesByDataset = R.groupBy(
    R.sortBy(singles, x => x.config.dataset.symbolId, x => x.config.dataset.interval),
    x => DatasetConfig.alias(x.config.dataset, symbols));

  const getStrategyIndex = (strategy: { name: string, config: string }) => {
    return run.config.strategies.findIndex(x => (
      x.name === strategy.name && x.config === strategy.config
    ));
  };

  const color = interpolate(['rgb(228 86 73)', 'rgb(1 132 188)', 'rgb(1 132 188)', 'rgb(80 161 79)']);

  const removeRun = async () => {
    'use server';
    // await deleteBacktestRun(run.id);
    // revalidatePath('/retsuko/backtest');
    // redirect('/retsuko/backtest');
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
                run.config.datasets.map((dataset, i) => (
                  <div key={`dataset-${i}`}>
                    {DatasetConfig.alias(dataset, symbols)} ({formatDateShort(dataset.start)} - {formatDateShort(dataset.end)})
                  </div>
                ))
              }
            </div>} />

            <Row label='strategies' value={<div className='border-l-2 border-h-yellow/80 pl-2 mb-2'>
              {
                run.config.strategies.map((strategy, i) => (
                  <div key={`strategy-${i}`}>
                    <div className='inline-block mr-2 align-top'>
                      {strategy.name}
                    </div>
                    <div className='inline-block'>
                      <div className='max-w-[48rem] break-words'>
                        {strategy.config}
                      </div>
                    </div>
                  </div>
                ))
              }
            </div>} />

            <Row label='balance' value={run.config.broker.initialBalance} />
            <Row label='fee' value={formatPercent(run.config.broker.fee)} />
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
                <th className='text-right'>CAGR %</th>
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
                Object.entries(singlesByDataset).flatMap(([alias, singles], i) => (
                  singles.map((single, j) => (
                    <tr key={single.id} className='even:bg-h-tone/5 hover:text-h-text/80 cursor-pointer'>
                      {
                        j === 0 && (
                          <td className='w-52 overflow-clip pl-1' rowSpan={singles.length}>
                            {alias}
                          </td>
                        )
                      }
                      <td className='w-48 pl-1'>
                        {single.config.strategy.name}[{getStrategyIndex(single.config.strategy)}]
                      </td>
                      <td className='w-12 text-right'>
                        {formatBalance(single.metrics.endBalance)}
                      </td>
                      <td className='w-20 text-right' style={{
                        color: color((single.metrics.totalProfit - 1) / 3),
                      }}>
                        {formatPercent(single.metrics.totalProfit)}
                      </td>
                      <td className='w-20 text-right' style={{
                        color: color((single.metrics.cagr)),
                      }}>
                        {formatPercent(single.metrics.cagr)}
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
                        color: color(single.metrics.drawdown + 0.6),
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
                        {single.metrics.totalTrades}
                      </td>
                      <td className='w-24 text-center'>
                        {single.trades.filter(x => x.profit > 0).length}/{single.trades.filter(x => x.profit < 0).length}
                      </td>
                      <td className='w-20 text-right pr-2'>
                        {formatPercent(R.sumBy(single.trades, x => x.profit) / single.trades.length)}
                      </td>
                      <td className='w-36'>
                        <SimpleChart data={single.trades.map(x => x.currency + x.asset * x.price)} reference={run.config.broker.initialBalance} />
                      </td>
                    </tr>
                  ))
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
