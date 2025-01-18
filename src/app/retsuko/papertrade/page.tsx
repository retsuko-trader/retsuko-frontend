import { getMarketPaperTraders, getMarketPaperTradesByTraderId } from '@/lib/retsuko/core/marketPaperTrader'
import { PapertradeConfigEditor } from './PapertradeConfigEditor';
import { StrategyEntriesLight } from '@/lib/retsuko/core/strategies';
import { formatBalance, formatDateShort, formatPercent } from '@/lib/helper';
import React from 'react';
import { connection } from 'next/server';
import classNames from 'classnames';
import Link from 'next/link';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const cache = 'no-store';

export default async function RetsukoPapertradePage() {
  await connection();

  const marketTraders = await getMarketPaperTraders();
  const traderZips = await Promise.all(marketTraders.map(async trader => {
    return {
      trader,
      trades: await getMarketPaperTradesByTraderId(trader.id),
    }
  }));

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto flex flex-col gap-y-4'>
        {
          traderZips.map(({ trader, trades }, i) => {
            const inititalBalance = trader.trader.inititalBalance ?? 1000;
            const profit = (trader.trader.portfolio.totalBalance - inititalBalance) / inititalBalance;

            const avgTradeProfits = trades.length > 0 ? trades.reduce((acc, trade) => acc + (trade.profit ?? 0), 0) / trades.length : 0;

            return (
              <Link
                key={`trade-${i}`}
                href={`/retsuko/papertrade/${trader.id}`}
                className={classNames('w-[48rem] bg-h-tone/5 p-3 border-l-2 hover:bg-h-tone/10 cursor-pointer', {
                  'border-h-green/80': trader.endedAt === null,
                  'border-h-tone/30': trader.endedAt !== null,
                })}
              >
                <div className='text-h-text font-bold'>
                  {trader.name}
                </div>

                <div className='mt-3 text-h-text/60 font-mono flex flex-col gap-y-0.5'>
                  <div className='flex flex-row gap-x-4'>
                    <div className='w-40'>
                      <div>
                        market
                      </div>
                      <div className='text-h-text/80'>
                        {trader.symbol}_{trader.interval}
                      </div>
                    </div>
                    <div className='w-40'>
                      <div>
                        createdAt
                      </div>
                      <div className='text-h-text/80'>
                        {formatDateShort(trader.createdAt)}
                      </div>
                    </div>
                    <div className='w-40'>
                      <div>
                        updatedAt
                      </div>
                      <div className='text-h-text/80'>
                        {formatDateShort(trader.updatedAt)}
                      </div>
                    </div>
                    <div className='w-40'>
                      <div>
                        endedAt
                      </div>
                      <div className='text-h-text/80'>
                        {trader.endedAt ? formatDateShort(trader.endedAt) : '--'}
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-row gap-x-4'>
                    <div className='w-40'>
                      <div>
                        strategy
                      </div>
                      <div className='text-h-text/80'>
                        {trader.strategyName}
                      </div>
                    </div>
                    <div className='w-40'>
                      <div>
                        initial / fee
                      </div>
                      <div className='text-h-text/80'>
                        {formatBalance(inititalBalance)} / {formatPercent(trader.trader.fee)}
                      </div>
                    </div>
                    <div className='w-40'>
                      <div>
                        trades
                      </div>
                      <div className='text-h-text/80'>
                        {trades.length}
                      </div>
                    </div>
                    <div className='w-40'>
                      <div>
                        avg trade profit
                      </div>
                      <div className={classNames({
                        'text-h-green/80': avgTradeProfits > 0,
                        'text-h-red/80': avgTradeProfits < 0,
                        'text-h-text/80': avgTradeProfits === 0,
                      })}>
                        {formatPercent(avgTradeProfits)}
                      </div>
                    </div>
                  </div>

                  <div className='flex flex-row gap-x-4'>
                    <div className='w-40'>
                      <div>
                        asset
                      </div>
                      <div className='text-h-text/80'>
                        {formatBalance(trader.trader.portfolio.asset, 6)}
                      </div>
                    </div>
                    <div className='w-40'>
                      <div>
                        currency
                      </div>
                      <div className='text-h-text/80'>
                        {formatBalance(trader.trader.portfolio.currency)}
                      </div>
                    </div>
                    <div className='w-40'>
                      <div>
                        total balance
                      </div>
                      <div className='text-h-text/80'>
                        {formatBalance(trader.trader.portfolio.totalBalance)}
                      </div>
                    </div>
                    <div className='w-40'>
                      <div>
                        profit
                      </div>
                      <div className={classNames({
                        'text-h-green/80': profit > 0,
                        'text-h-red/80': profit < 0,
                        'text-h-text/80': profit === 0,
                      })}>
                        {formatPercent(profit)}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        }
      </div>

      <div className='h-full top-0 bottom-0 right-0 w-[32rem] bg-h-background drop-shadow-lg'>
        <div className='w-full h-full bg-h-tone/5 p-3'>
          <PapertradeConfigEditor strategies={StrategyEntriesLight} />
        </div>
      </div>
    </div>
  )
}
