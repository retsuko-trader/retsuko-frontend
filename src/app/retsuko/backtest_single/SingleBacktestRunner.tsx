'use client';

import React from 'react';
import classNames from 'classnames';
import * as R from 'remeda';
import type { SingleBacktestConfig, BacktestReport } from '@/lib/retsuko/core/singleBacktester';
import type { Dataset } from '@/lib/retsuko/repository/dataset';
import { formatBalance, formatDateShort, formatPercent } from '@/lib/helper';
import { loadCandles, runBacktest } from './actions';
import { SingleBacktestConfigEditor } from './SingleBacktestConfigEditor';
import type { SimpleCandle } from '@/lib/retsuko/tables';
import { Table } from '@/components/Table';
import dynamic from 'next/dynamic';

const TradingChart = dynamic(() => import('@/components/TradingChart').then(x => x.TradingChart), { ssr: false });

interface Props {
  datasets: Dataset[];
  entries: Array<{
    name: string;
    config: Record<string, number>;
  }>
}

export function SingleBacktestRunner({ datasets, entries }: Props) {
  const [loading, setLoading] = React.useState(false);
  const [reports, setReports] = React.useState<BacktestReport[]>([]);
  const [candles, setCandles] = React.useState<SimpleCandle[]>([]);
  const [logarithmicBalance, setLogarithmicBalance] = React.useState(false);

  const run = async (configs: SingleBacktestConfig[]) => {
    setLoading(true);
    const resp = (await Promise.all(configs.map(x => runBacktest(x)))).filter(x => x !== null);
    setReports(resp);
    setCandles(await loadCandles(configs[0]));
    setLoading(false);
  };

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto'>

        <div>
          {reports.length === 0 && (
            <p className='text-h-text/40'>backtest result not loaded</p>
          )}
        </div>

        <div className='flex flex-col gap-y-4'>
          <div>
            <p>configs</p>

            <Table
              name='configs'
              rows={[
                ['dataset', 'start', 'end', 'strategy', 'config', 'balance', 'fee'],
                ...reports.map((report, i) => [
                  report.config.dataset.alias,
                  formatDateShort(report.config.dataset.start!),
                  formatDateShort(report.config.dataset.end!),
                  report.config.strategy.name,
                  <div key={`config-${i}`} className='max-w-[24rem] break-words'>{JSON.stringify(report.config.strategy.config)}</div>,
                  report.config.trader.initialBalance,
                  report.config.trader.fee,
                ]),
              ]}
              transpose
              firstColumnAsRowHeader
              className='border-l-2 border-h-yellow/80'
            />
          </div>

          <div>
            <p>results</p>

            <Table
              name='results'
              rows={[
                ['start balance', 'end balance', 'trade count', 'total profit%', 'CAGR %', 'sortino', 'sharpe', 'calmar', 'min/max balance', 'drawdown', 'drawdown high', 'drawdown low', 'drawdown start', 'drawdown end', 'market change', 'wins/loses (%)', 'avg trade p%', 'profit/market'],
                ...reports.map(report => [
                  formatBalance(report.startBalance),
                  formatBalance(report.endBalance),
                  report.trades.length,
                  formatPercent(report.profit),
                  formatPercent(report.metrics.cagr),
                  formatBalance(report.metrics.sortino),
                  formatBalance(report.metrics.sharpe),
                  formatBalance(report.metrics.calmar),
                  `${formatBalance(report.metrics.minBalance)} / ${formatBalance(report.metrics.maxBalance)}`,
                  formatPercent(report.metrics.drawdown),
                  formatBalance(report.metrics.drawdownHigh),
                  formatBalance(report.metrics.drawdownLow),
                  formatDateShort(new Date(report.metrics.drawdownStartTs)),
                  formatDateShort(new Date(report.metrics.drawdownEndTs)),
                  formatPercent(report.metrics.marketChange),
                  `${report.trades.filter(x => x.profit > 0).length}/${report.trades.filter(x => x.profit < 0).length} (${formatPercent(report.trades.filter(x => x.profit > 0).length / (report.trades.filter(x => x.profit > 0).length + report.trades.filter(x => x.profit < 0).length))})`,
                  formatPercent(R.mean(report.trades.map(x => x.profit)) ?? 0),
                  formatPercent(report.profit / report.metrics.marketChange),
                ]),
              ]}
              transpose
              firstColumnAsRowHeader
              className='border-l-2 border-h-blue/80'
            />
          </div>

          <TradingChart
            title='backtest single simulation result'
            candles={candles}
            tradesList={reports.map(report => report.trades)}
            showBalance
            logarithmicBalance={logarithmicBalance}
          />

          <div className='flex flex-row justify-center'>
            <label>
              logaritmic balance
              <input
                type='checkbox'
                checked={logarithmicBalance}
                onChange={e => setLogarithmicBalance(e.target.checked)}
                className='ml-2'
              />
            </label>
          </div>

          {reports.map((report, i) => (
            <div key={i} className='flex flex-col gap-y-4'>
              <div>
                <TradingChart
                  title='backtest single simulation result'
                  candles={candles}
                  tradesList={[report.trades]}
                  showBalance
                  showTrades
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
          ))}
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