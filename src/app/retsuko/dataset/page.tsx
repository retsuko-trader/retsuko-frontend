import { formatDateShort } from '@/lib/helper/date';
import { searchDatasets } from '@/lib/retsuko/dataset';

export default async function RetsukoDatasetPage() {
  const datasets = await searchDatasets();

  return (
    <div>
      <table className='font-mono'>
        <thead>
          <tr className='text-h-text/80 text-left bg-h-tone/10'>
            <th>source</th>
            <th>symbol</th>
            <th>int</th>
            <th className='text-center'>start</th>
            <th className='text-center'>end</th>
            <th className='text-right'>count</th>
          </tr>
        </thead>
        <tbody>
          {datasets.map((dataset) => {
            const key = `${dataset.market}_${dataset.symbol}_${dataset.interval}`;

            return (
              <tr key={key} className='text-h-text/60 group hover:text-h-text/80 cursor-pointer even:bg-h-tone/5'>
                <td className='w-20'>
                  {dataset.market}
                </td>
                <td className='w-20'>
                  {dataset.symbol}
                </td>
                <td className='w-10'>
                  {dataset.interval}
                </td>
                <td className='w-36'>
                  {formatDateShort(dataset.start)}
                </td>
                <td className='w-36'>
                  {formatDateShort(dataset.end)}
                </td>
                <td className='w-20 text-right'>
                  {dataset.count}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}