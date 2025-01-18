'use client';

import React from 'react';
import classNames from 'classnames';
import * as R from 'remeda';
import type { SingleBacktestConfig, BacktestReport } from '@/lib/retsuko/core/singleBacktester';
import type { Dataset } from '@/lib/retsuko/repository/dataset';
import { formatBalance, formatDateShort, formatPercent } from '@/lib/helper';
import { loadCandles, runBacktest } from './actions';
import { SingleBacktestConfigEditor } from './SingleBacktestConfigEditor';
import { TradingChart } from '@/components/TradingChart';
import type { SimpleCandle } from '@/lib/retsuko/tables';

interface Props {
  datasets: Dataset[];
  entries: Array<{
    name: string;
    config: Record<string, number>;
  }>
}

export function SingleBacktestRunner({ datasets, entries }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [report, setReport] = React.useState<BacktestReport | null>(null);
  const [candles, setCandles] = React.useState<SimpleCandle[]>([]);

  const run = async (config: SingleBacktestConfig) => {
    setLoading(true);
    const resp = await runBacktest(config);
    setReport(resp);
    setCandles(await loadCandles(config));
    setLoading(false);
  };

  const wins = report?.trades.filter(x => x.profit > 0).length;
  const loses = report?.trades.filter(x => x.profit < 0).length;
  const avgTradeProfits = R.mean(report?.trades.map(x => x.profit) ?? []) ?? 0;
  const candlesProfit = candles.length <= 1 ? 1 : (candles[candles.length - 1].close - candles[0].close) / candles[0].close;

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto'>

        <div>
          {report === null && (
            <p className='text-h-text/40'>backtest result not loaded</p>
          )}
          {report !== null && (
            <div className='flex flex-col gap-y-4'>
              <div>
                <p>configs</p>

                <div className='border-l-2 border-h-yellow/80 pl-2 font-mono'>
                  <Row label='dataset' value={report.config.dataset.alias} />
                  <Row label='start' value={formatDateShort(report.config.dataset.start!)} />
                  <Row label='end' value={formatDateShort(report.config.dataset.end!)} />

                  <Row label='strategy' value={report.config.strategy.name} />
                  <Row label='config' value={<div className='max-w-[48rem] break-words'>{JSON.stringify(report.config.strategy.config)}</div>} />
                  <Row label='balance' value={report.config.trader.initialBalance} />
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
                  <Row label='sharpe ratio' value={formatPercent((report.profit) / candlesProfit)} />
                </div>
              </div>

              <div>
                <TradingChart
                  title='backtest single simulation result'
                  candles={candles}
                  trades={report.trades}
                  showBalance
                />
              </div>

              <div>
                <p>trades</p>

                <table className='font-mono'>
                  <thead>
                    <tr className='text-h-text/80 bg-h-tone/10 border-l-2 border-h-tone/10'>
                      <th>date</th>
                      <th>action</th>
                      <th>price</th>
                      <th>asset</th>
                      <th>currency</th>
                      <th>total</th>
                      <th>profit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.trades.reverse().map(trade => (
                      <tr key={trade.ts.toISOString()} className={classNames('text-h-text/60 group hover:text-h-text/80 cursor-pointer border-l-2', {
                        'bg-h-red/10': trade.action === 'sell',
                        'bg-h-green/10': trade.action === 'buy',
                        'border-h-red/80': trade.profit < 0,
                        'border-h-green/80': trade.profit > 0,
                      })}>
                        <td className='w-36 pl-1'>
                          {formatDateShort(trade.ts)}
                        </td>
                        <td className='w-12'>
                          {trade.action}
                        </td>
                        <td className='w-24 text-right'>
                          {formatBalance(trade.price)}
                        </td>
                        <td className='w-24 text-right'>
                          {formatBalance(trade.asset, 6)}
                        </td>
                        <td className='w-24 text-right'>
                          {formatBalance(trade.currency)}
                        </td>
                        <td className='w-24 text-right'>
                          {formatBalance(trade.asset * trade.price + trade.currency)}
                        </td>
                        <td className='w-20 text-right pr-1'>
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

      <div className='h-full top-0 bottom-0 right-0 w-[32rem] bg-h-background drop-shadow-lg'>
        <div className='w-full h-full bg-h-tone/5 p-3 overflow-y-auto'>
          <SingleBacktestConfigEditor
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
      <div className='inline-block'>
        {value}
      </div>
    </div>
  );
}
