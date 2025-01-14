import { Candle } from './Candle';
import { RawDatasetGroup } from './DatasetGroup';

export interface Tables {
  candle: Candle;
  datasetGroup: RawDatasetGroup;
}

export * from './Candle';
export * from './DatasetGroup';
