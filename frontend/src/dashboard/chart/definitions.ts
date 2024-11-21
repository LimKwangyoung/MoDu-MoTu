export interface IChartStockData {
  time: string;
  open: number;
  close: number;
  high: number;
  low: number;
}

export interface IChartVolumeData {
  time: string;
  value: number;
  color: string;
}