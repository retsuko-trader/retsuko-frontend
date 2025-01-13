import { GetDatasetList } from '@/lib/retsuko/dataset';

export default async function RetsukoDatasetPage() {
  const datasets = await GetDatasetList();

  return (
    <div>
      {datasets.map((dataset) => {
        const key = `${dataset.source}_${dataset.symbol}_${dataset.interval}`;

        return (
          <div key={key}>
            {key}
          </div>
        )
      })}
    </div>
  );
}