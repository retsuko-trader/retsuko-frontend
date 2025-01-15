import { getMarketPaperTraders } from '@/lib/retsuko/core/marketPaperTrader'
import { PapertradeConfigEditor } from './PapertradeConfigEditor';
import { StrategyEntriesLight } from '@/lib/retsuko/core/strategies';

export default async function RetsukoPapertradePage() {
  const marketTraders = await getMarketPaperTraders();

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto'>
        {
          marketTraders.map((x, i) => {
            return (
              <div key={`trade-${i}`} className=''>
                <div>
                  {x.symbol}_{x.interval}
                </div>
                <div>
                  {x.trader.portfolio.asset} {x.trader.portfolio.currency} {x.trader.portfolio.totalBalance}
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