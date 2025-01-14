'use client';

import React from 'react';
import classNames from 'classnames';
import * as R from 'remeda';
import type { SingleBacktestConfig, BacktestReport } from '@/lib/retsuko/core/singleBacktester';
import type { Dataset } from '@/lib/retsuko/repository/dataset';
import { formatDateShort } from '@/lib/helper/date';
import { runBacktest } from './actions';
import { BacktestConfigEditor } from './BacktestConfigEditor';

interface Props {
  datasets: Dataset[];
  entries: Array<{
    name: string;
    config: Record<string, number>;
  }>
}

export function BacktestRunner({ datasets, entries }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [report, setReport] = React.useState<BacktestReport | null>(null);

  const run = async (config: SingleBacktestConfig) => {
    setLoading(true);
    const resp = await runBacktest(config);
    setReport(resp);
    setLoading(false);
  };

  const formatBalance = (balance: number) => {
    return balance.toFixed(2);
  }

  const formatPercent = (percent: number) => {
    return (percent * 100).toFixed(2) + '%';
  }

  const wins = report?.trades.filter(x => x.profit > 0).length;
  const loses = report?.trades.filter(x => x.profit < 0).length;
  const avgTradeProfits = R.mean(report?.trades.map(x => x.profit) ?? []) ?? 0;

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full'>

        <div>
          {report === null ? (
            <p className='text-h-text/40'>backtest result not loaded</p>
          ) : (
            <div className='flex flex-col gap-y-4'>
              <div>
                <p>configs</p>

                <div className='border-l-2 border-h-yellow/80 pl-2 font-mono'>
                  <Row label='dataset' value={report.config.dataset.alias} />
                  <Row label='start' value={formatDateShort(report.config.dataset.start!)} />
                  <Row label='end' value={formatDateShort(report.config.dataset.end!)} />

                  <Row label='strategy' value={report.config.strategy.name} />
                  <Row label='config' value={JSON.stringify(report.config.strategy.config)} />
                  <Row label='balance' value={report.config.trader.balance} />
                  <Row label='fee' value={report.config.trader.fee} />
                </div>
              </div>

              <div>
                <p>result</p>

                <div className='border-l-2 border-h-blue/80 pl-2 font-mono'>
                  <Row label='start balance' value={formatBalance(report.startBalance)} />
                  <Row label='end balance' value={formatBalance(report.endBalance)} />
                  <Row label='trade count' value={report.trades.length} />
                  <Row label='profit' value={formatPercent(report.profit)} />
                  <Row label='wins/loses (%)' value={`${wins}/${loses} (${formatPercent(wins! / (wins! + loses!))})`} />
                  <Row label='avg trade p%' value={formatPercent(avgTradeProfits)} />
                </div>
              </div>

              <div>
                <p>trades</p>

                <table className='font-mono'>
                  <thead>
                    <tr className='text-h-text/80 bg-h-tone/10'>
                      <th>date</th>
                      <th>action</th>
                      <th>price</th>
                      <th>asset</th>
                      <th>currency</th>
                      <th>total_balance</th>
                      <th>profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.trades.reverse().map(trade => (
                      <tr key={trade.ts.toISOString()} className={classNames('text-h-text/60 group hover:text-h-text/80 cursor-pointer', {
                        'bg-h-red/10': trade.action === 'sell',
                        'bg-h-green/10': trade.action === 'buy',
                      })}>
                        <td className='w-36'>
                          {formatDateShort(trade.ts)}
                        </td>
                        <td className='w-20'>
                          {trade.action}
                        </td>
                        <td className='w-20 text-right'>
                          {formatBalance(trade.price)}
                        </td>
                        <td className='w-20 text-right'>
                          {formatBalance(trade.asset)}
                        </td>
                        <td className='w-20 text-right'>
                          {formatBalance(trade.currency)}
                        </td>
                        <td className='w-20 text-right'>
                          {formatBalance(trade.asset * trade.price + trade.currency)}
                        </td>
                        <td className='w-20 text-right'>
                          {formatPercent(trade.profit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div className='absolute top-0 left-0 w-full h-full bg-h-background/60 flex items-center justify-center'>
            <p>loading...</p>
          </div>
        )}
      </div>

      <div className='h-full top-0 bottom-0 right-0 w-[30rem] bg-h-background drop-shadow-lg'>
        <div className='w-full h-full bg-h-tone/5 p-3'>
          <BacktestConfigEditor
            datasets={datasets}
            entries={entries}
            runBacktest={run}
          />
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className='w-32 inline-block'>
        {label}:
      </p>
      <p className='inline-block'>
        {value}
      </p>
    </div>
  );
}