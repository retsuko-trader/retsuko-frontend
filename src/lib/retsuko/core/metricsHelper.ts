import moment from 'moment';
import { Candle } from '../tables';
import { Portfolio } from './Portfolio';
import { BacktestMetrics, SingleBacktestConfig } from './singleBacktester';
import { Trade } from './Trade';

export class MetricsHelper {
  constructor(
    private readonly config: SingleBacktestConfig,
    private readonly portfolio: Portfolio,
    private readonly metrics: BacktestMetrics,
    private readonly firstCandle: Candle,
    private readonly lastCandle: Candle,
  ) { }

  days(): number {
    return moment(this.lastCandle.ts).diff(moment(this.firstCandle.ts), 'days');
  }

  public cagr(): number {
    const days = this.days();

    return Math.pow(this.portfolio.totalBalance / this.config.trader.initialBalance, 1 / days / 365 - 1);
  }

  public avgTrades(): number {
    const days = this.days();

    return this.metrics.totalTrades / days;
  }

  public sortino(trades: Trade[]): number {
    const profit = this.metrics.totalProfit;
    const days = this.days();

    const expectedReturn = profit / days;
    const downStdev = Math.sqrt(
      trades
        .map((trade) => trade.profit)
        .filter((profit) => profit < 0)
        .reduce((acc, profit) => acc + Math.pow(profit - expectedReturn, 2), 0) / trades.length,
    );

    return expectedReturn / downStdev * Math.sqrt(365);
  }

  public sharpes(trades: Trade[]): number {
    const profit = this.metrics.totalProfit;
    const days = this.days();

    const expectedReturn = profit / days;
    const stdev = Math.sqrt(
      trades
        .map((trade) => trade.profit)
        .reduce((acc, profit) => acc + Math.pow(profit - expectedReturn, 2), 0) / trades.length,
    );

    return expectedReturn / stdev * Math.sqrt(365);
  }

  public calmar(): number {
    const expectedReturn = this.metrics.totalProfit / this.days();
    return expectedReturn / this.metrics.drawdown * Math.sqrt(365);
  }
}