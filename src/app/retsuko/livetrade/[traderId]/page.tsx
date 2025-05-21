'use server';

import { formatBalance, formatDateShort, formatPercent } from '@/lib/helper';
import { getLiveTrader, getLiveTraderTrades } from '@/lib/retsuko/api/liveTrader';
import { OrderStatus } from '@/lib/retsuko/interfaces/LiveTrader';
import { SignalKind } from '@/lib/retsuko/interfaces/Trade';
import classNames from 'classnames';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ traderId: string }>;
}

export default async function RetsukoLiveTraderTraderPage({ params }: Props) {
  const { traderId } = await params;

  const trader = await getLiveTrader(traderId);
  const { trades, orders } = await getLiveTraderTrades(traderId);

  if (!trader) {
    notFound();
  }

  const dump = JSON.parse(trader.dump);
  const dumpParsed = Object.fromEntries(Object.entries(dump).map(([key, value]) => [key, typeof value === 'string' ? JSON.parse(value) : value]));

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto'>
        <div>
          LiveTrader {trader.name}
        </div>

        <details>
          <summary>dump</summary>

          <pre className='font-mono max-w-full break-words'>
            {JSON.stringify(dumpParsed, null, 2)}
          </pre>
        </details>

        <div className='mt-3'>
          <table className='font-mono'>
            <thead>
              <tr>
                <th>ts</th>
                <th>action</th>
                <th>confidence</th>
                <th>price</th>
                <th>asset</th>
                <th>currency</th>
                <th>profit</th>
              </tr>
            </thead>
            <tbody>
              {
                trades.map((trade) => (
                  <tr key={trade.id} className={classNames('text-h-text/60 group hover:text-h-text/80 cursor-pointer', {
                    'bg-h-red/10': trade.signal === SignalKind.long,
                    'bg-h-green/10': trade.signal === SignalKind.short,
                  })}>
                    <td className='w-36'>
                      {formatDateShort(new Date(trade.ts))}
                    </td>
                    <td className='w-20'>
                      {SignalKind[trade.signal]}
                    </td>
                    <td className='w-20'>
                      {formatPercent(trade.confidence)}
                    </td>
                    <td className='w-20 text-right'>
                      {formatBalance(trade.price)}
                    </td>
                    <td className='w-20 text-right'>
                      {formatBalance(trade.asset, 6)}
                    </td>
                    <td className='w-20 text-right'>
                      {formatBalance(trade.currency)}
                    </td>
                    <td className='w-20 text-right'>
                      {formatPercent(trade.profit)}
                    </td>

                    <td className='relative'>
                      <div className='hidden group-hover:block absolute left-2 top-0 border-l-2 border-h-yellow/80 '>
                        <div className='flex flex-col pl-2'>
                          {
                            orders.filter(x => x.tradeId === trade.id).map((x, i) => (
                              <div key={`order-${x.tradeId}-${x.orderId}-${i}`} className='flex flex-row gap-x-2'>
                                <div className='w-72'>
                                  {formatDateShort(new Date(x.updateTime))} ~ {x.closedAt ? formatDateShort(new Date(x.closedAt)) : '--'}
                                </div>

                                <div className='w-20'>
                                  {formatBalance(x.price)}
                                </div>
                                <div className='w-36'>
                                  {x.quantityFilled} / {x.quantity}
                                </div>
                                <div className='w-20'>
                                  {OrderStatus[x.status]}
                                </div>
                              </div>
                            ))
                          }
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>

          {/* {JSON.stringify(trades, null, 2)} */}
        </div>

      </div>

    </div>
  );
}
