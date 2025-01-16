import { getMarketPaperTraders, getMarketPaperTradesByTraderId } from '@/lib/retsuko/core/marketPaperTrader'
import { PapertradeConfigEditor } from './PapertradeConfigEditor';
import { StrategyEntriesLight } from '@/lib/retsuko/core/strategies';
import { formatBalance, formatDateLong, formatDateShort } from '@/lib/helper';
import React from 'react';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const cache = 'no-store';

export default async function RetsukoPapertradePage() {
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
            return (
              <div key={`trade-${i}`} className=''>
                <div>
                  {trader.symbol}_{trader.interval}
                </div>
                <div>
                  <p>
                    createdAt: {formatDateShort(trader.createdAt)}
                  </p>
                  <p>

                    updatedAt: {formatDateLong(trader.updatedAt)}
                  </p>
                </div>
                <div>
                  {trader.trader.portfolio.asset} {trader.trader.portfolio.currency} {trader.trader.portfolio.totalBalance}
                </div>

                <div>
                  trades: {trades.length}

                  <div className='flex flex-col'>
                    {
                      trades.map((trade, i) => {
                        return (
                          <div key={`trade-${i}`} className='flex flex-row gap-x-4'>
                            <div>{trade.id}</div>
                            <div>{formatDateLong(trade.ts)}</div>
                            <div>{trade.action}</div>
                            <div>{trade.price}</div>
                            <div>{trade.asset}</div>
                            <div>{formatBalance(trade.currency)}</div>
                            <div>{formatBalance(trade.asset * trade.price + trade.currency)}</div>
                          </div>
                        )
                      })
                    }
                  </div>
                </div>
              </div>
            )
          })
        }
      </div>

      <div className='h-full top-0 bottom-0 right-0 w-[30rem] bg-h-background drop-shadow-lg'>
        <div className='w-full h-full bg-h-tone/5 p-3'>
          <PapertradeConfigEditor strategies={StrategyEntriesLight} />
        </div>
      </div>
    </div>
  )
}