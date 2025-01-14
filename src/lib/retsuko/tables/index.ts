import { Candle } from './Candle';
import { RawDatasetGroup } from './DatasetGroup';

export interface Tables {
  candle: Candle;
  dataset_group: RawDatasetGroup;
}

export * from './Candle';
export * from './DatasetGroup';