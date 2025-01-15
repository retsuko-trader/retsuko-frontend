import { getLiveMarkets } from '@/lib/retsuko/core/liveMarket'
import { startPapertrade } from './action';
import { formatDateShort } from '@/lib/helper';

export default async function RetsukoPapertradePage() {
  const liveMakets = getLiveMarkets();

  const reports = await Promise.all(liveMakets.map(async x => {
    return {
      key: x.key,
      report: await x.market.report(),
    }
  }));

  const create = async () => {
    'use server';
    await startPapertrade('BTCUSDT', '1m', 'RbbAdxBb');
    await startPapertrade('BTCUSDT', '1m', 'StochRSI');
  };

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto'>
        {
          reports.map((x, i) => {
            return (
              <div key={`trade-${i}`} className=''>
                <div>
                  {x.key.symbol}_{x.key.interval}
                </div>
                <div>
                  {x.report.portfolio.asset} {x.report.portfolio.currency} {x.report.portfolio.totalBalance}
                </div>

                <div>
                  {x.report.trades.map((trade, i) => (
                    <div key={`trade-${i}`}>
                      {formatDateShort(trade.ts)} {trade.action} {trade.price} {trade.asset} {trade.currency} {trade.profit}
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        }
      </div>

      <div className='h-full top-0 bottom-0 right-0 w-[30rem] bg-h-background drop-shadow-lg'>
        <div className='w-full h-full bg-h-tone/5 p-3'>
          <button onClick={create} className=''>
            create test
          </button>
        </div>
      </div>
    </div>
  )
}