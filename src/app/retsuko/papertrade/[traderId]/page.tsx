import { formatBalance, formatDateShort, formatPercent } from '@/lib/helper';
import { getMarketPaperTraderById, getMarketPaperTradesByTraderId, removeMarketPaperTrader } from '@/lib/retsuko/core/marketPaperTrader';
import classNames from 'classnames';
import { notFound, redirect } from 'next/navigation';
import { connection } from 'next/server';

interface Props {
  params: Promise<{ traderId: string }>;
}

const remove = async (id: string) => {
  'use server';

  await removeMarketPaperTrader(id);
  redirect('/retsuko/papertrade');
};

export default async function RetsukoPapertradeTraderPage({ params }: Props) {
  const { traderId } = await params;

  await connection();
  const trader = await getMarketPaperTraderById(traderId);
  const trades = await getMarketPaperTradesByTraderId(traderId);

  const removeThis = remove.bind(null, traderId);

  if (!trader) {
    notFound();
  }

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto'>
        <div>
          Papertrader {trader.name}
        </div>

        <details>
          <summary>dump</summary>

          <pre className='font-mono max-w-full break-words'>
            {JSON.stringify(JSON.parse(trader.strategySerialized), null, 2)}
          </pre>
        </details>

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

        <div className='mt-3'>
          <form action={removeThis}>
            <input type='submit' value='delete' className='px-4 py-1 bg-h-red/60 hover:bg-h-red/40 cursor-pointer' />
          </form>
        </div>
      </div>
    </div>
  )
}