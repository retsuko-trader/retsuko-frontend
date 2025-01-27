import * as R from 'remeda';

export function stdev(values: number[]): number {
  const mean = R.mean(values)!;

  return Math.sqrt(
    R.sumBy(values, x => Math.pow(x - mean, 2)) / values.length,
  );
}

export function pearsonCorr(xs: number[], ys: number[]): number {
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  const n = Math.min(xs.length, ys.length);
  for (let i = 0; i < n; i += 1) {
    sumX += xs[i];
    sumY += ys[i];
    sumXY += xs[i] * ys[i];
    sumX2 += xs[i] * xs[i];
    sumY2 += ys[i] * ys[i];
  }

  return (n * sumXY - sumX * sumY) / Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
}