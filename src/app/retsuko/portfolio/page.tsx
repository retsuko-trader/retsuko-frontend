import * as R from 'remeda';
import { Table } from '@/components/Table';
import { getPortfolio } from '@/lib/retsuko/api/portfolio';
import { connection } from 'next/server';
import { formatBalance, formatPercent } from '@/lib/helper';

export default async function RetsukoPortfolioPage() {
  await connection();

  const portfolio = await getPortfolio();

  var assetsBalance = R.sumBy(portfolio.assets, x => x.currentBalance);

  return (
    <div className='w-full h-full relative flex flex-row'>
      <div className='w-full h-full overflow-y-auto flex flex-col gap-y-4'>
        <div className='text-h-text font-bold'>
          Portfolio
        </div>

        <div>
          <Table
            name='assets'
            rows={[
              ['asset', formatBalance(assetsBalance)],
              ['currency', formatBalance(portfolio.currency)],
              ['totalBalance', formatBalance(portfolio.totalBalance)],
            ]}
            firstColumnAsRowHeader
            className='border-l-2 border-h-yellow/80 text-right'
          />

          <div className='text-h-text/80 mt-3'>
          assets
          </div>

          <Table
            name='portfolio'
            rows={[
              ['symbol', 'amount', 'entryPrice', 'currentPrice', 'initialBalance', 'currentBalance', 'profitBalance', 'profit'],
              ...portfolio.assets.map(x => [
                x.symbol,
                x.amount,
                formatBalance(x.entryPrice),
                formatBalance(x.marketPrice),
                formatBalance(x.initialBalance),
                formatBalance(x.currentBalance),
                formatBalance(x.profitBalance),
                formatPercent(x.profit),
              ]),
            ]}
            transpose
            firstColumnAsRowHeader
            className='border-l-2 border-h-yellow/80 text-right'
          />
        </div>
      </div>
    </div>
  )
}
