import { getMarketPaperTraders, getMarketPaperTradesByTraderId } from '@/lib/retsuko/core/marketPaperTrader'
import { PapertradeConfigEditor } from './PapertradeConfigEditor';
import { StrategyEntriesLight } from '@/lib/retsuko/core/strategies';

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
      <div className='w-full h-full overflow-y-auto'>
        {
          traderZips.map(({ trader, trades }, i) => {
            return (
              <div key={`trade-${i}`} className=''>
                <div>
                  {trader.symbol}_{trader.interval}
                </div>
                <div>
                  {trader.trader.portfolio.asset} {trader.trader.portfolio.currency} {trader.trader.portfolio.totalBalance}
                </div>

                <div>
                  trades: {trades.length}
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