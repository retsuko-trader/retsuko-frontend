import { formatBalance, formatDateShort, formatPercent } from '@/lib/helper';
import { getMarketPaperTraderById, getMarketPaperTradesByTraderId } from '@/lib/retsuko/core/marketPaperTrader';
import classNames from 'classnames';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';

interface Props {
  params: Promise<{ traderId: string }>;
}

export default async function RetsukoPapertradeTraderPage({ params }: Props) {
  const { traderId } = await params;

  await connection();
  const trader = await getMarketPaperTraderById(traderId);
  const trades = await getMarketPaperTradesByTraderId(traderId);

  if (!trader) {
    notFound();
  }

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto'>
        <div>
          Papertrader {trader.name}
        </div>

        <div className='mt-3'>
          <table className='font-mono'>
            <thead>
              <tr>
                <th>ts</th>
                <th>action</th>
                <th>price</th>
                <th>asset</th>
                <th>currency</th>
                <th>total</th>
                <th>profit</th>
              </tr>
            </thead>
            <tbody>
              {
                trades.map((trade) => (
                  <tr key={trade.id} className={classNames('text-h-text/60 group hover:text-h-text/80 cursor-pointer', {
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
                      {formatBalance(trade.asset, 6)}
                    </td>
                    <td className='w-20 text-right'>
                      {formatBalance(trade.currency)}
                    </td>
                    <td className='w-20 text-right'>
                      {formatBalance(trade.asset * trade.price + trade.currency)}
                    </td>
                    <td className='w-20 text-right'>
                      {trade.profit ? formatPercent(trade.profit) : '-'}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}