import * as R from 'remeda';
import { Candle } from '../../tables';
import { Strategy, StrategyConfig } from '../strategy';

export interface PoincareStrategyConfig extends StrategyConfig {
  window: number;
  bandWindow: number;
  bandFactor: number;
  lowerIbs: number;
}

export class PoincareStrategy extends Strategy<PoincareStrategyConfig> {
  $highs: number[] = [];
  $highMinusLows: number[] = [];

  constructor(
    name: string,
    config: PoincareStrategyConfig,
  ) {
    super(name, config);
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
    super.update(candle);

    this.$highs.push(candle.high);
    this.$highMinusLows.push(candle.high - candle.low);

    if (this.$highs.length > this.config.window) {
      this.$highs.shift();
    }
    if (this.$highMinusLows.length > this.config.window) {
      this.$highMinusLows.shift();
    }

    if (this.$highs.length < this.config.window || this.$highMinusLows.length < this.config.window) {
      return null;
    }

    const ibs = (candle.close - candle.low) / (candle.high - candle.low);
    const rollingHigh = R.mean(this.$highs)!;
    const rollingRollingHighMinusLow = R.mean(this.$highMinusLows)!;

    const lowerBand = rollingHigh - rollingRollingHighMinusLow * this.config.bandFactor;

    if (candle.close < lowerBand && ibs < this.config.lowerIbs) {
      return 'long';
    }

    if (candle.close > rollingHigh) {
      return 'short';
    }

    return null;
  }

  public serialize(): string {
    return JSON.stringify({
      highs: this.$highs,
      highMinusLows: this.$highMinusLows,
    });
  }

  public deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.$highs = parsed.highs;
    this.$highMinusLows = parsed.highMinusLows;
  }
}