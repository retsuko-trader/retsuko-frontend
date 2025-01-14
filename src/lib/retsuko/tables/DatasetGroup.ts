export interface DatasetGroup {
  id: number;
  name: string;
  datasets: DatasetConfig[];
}

export interface RawDatasetGroup {
  id: number | null;
  name: string;
  datasetsRaw: string;
}

export interface DatasetConfig {
  alias: string;
  start: Date;
  end: Date;
}