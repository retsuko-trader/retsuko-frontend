import { formatDateShort } from '@/lib/helper';
import { getSymbols } from '@/lib/retsuko/api/candle';
import { getLiveTraders, getLiveTraderTrades } from '@/lib/retsuko/api/liveTrader';
import { getStrategies } from '@/lib/retsuko/api/strategy';
import classNames from 'classnames';
import Link from 'next/link';
import { connection } from 'next/server';

export default async function RetsukoLiveTradePage() {
  await connection();

  const symbols = await getSymbols();
  const symbolsMap = new Map<number, string>();
  symbols.forEach((symbol) => symbolsMap.set(symbol.id, symbol.name));

  const strategies = await getStrategies();
  const liveTraders = await getLiveTraders();

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto flex flex-col gap-y-4'>
        {
          liveTraders.map((trader, i) => {

            return (
              <Link key={i} href={`/retsuko/livetrade/${trader.id}`} className={classNames('w-[48rem] bg-h-tone/5 p-3 border-l-2 hover:bg-h-tone/10 cursor-pointer', {
                'border-h-green/80': trader.endedAt === null,
                'border-h-tone/30': trader.endedAt !== null,
              })}>
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
                        {symbolsMap.get(trader.config.dataset.symbolId)}_{trader.config.dataset.interval}
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
                        {trader.config.strategy.name}
                      </div>
                    </div>
                    <div className='w-40'>
                      <div>
                        status
                      </div>
                      <div className='text-h-text/80'>
                        {trader.endedAt === null ? 'running' : 'ended'}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            )
          })
        }
        </div>
    </div>
  )
}
