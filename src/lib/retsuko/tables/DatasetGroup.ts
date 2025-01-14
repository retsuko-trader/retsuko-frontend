export interface DatasetGroup {
  id: number;
  name: string;
  datasets: Array<{
    alias: string;
    start: Date;
    end: Date;
  }>;
}

export interface RawDatasetGroup {
  id: number | null;
  name: string;
  datasetsRaw: string;
}
