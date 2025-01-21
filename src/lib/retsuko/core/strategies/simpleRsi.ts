import { Candle } from '../../tables';
import { RSI } from '../indicators';
import { Strategy, StrategyConfig } from '../strategy';

export interface SimpleRsiStrategyConfig extends StrategyConfig {
  rsiTimePeriod: number;
  rsiHigh: number;
  rsiLow: number;
}

export class SimpleRsiStrategy extends Strategy<SimpleRsiStrategyConfig> {
  $rsi: RSI;

  constructor(
    name: string,
    config: SimpleRsiStrategyConfig,
  ) {
    super(name, config);

    this.$rsi = this.addIndicator(new RSI('rsi', config.rsiTimePeriod));
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
    super.update(candle);

    if (!this.$rsi.ready) {
      return null;
    }

    const rsi = this.$rsi.value;
    if (rsi >= this.config.rsiHigh) {
      return 'long';
    } else if (rsi <= this.config.rsiLow) {
      return 'short';
    }

    return null;
  }

  public serialize(): string {
    return JSON.stringify({
      rsi: this.$rsi.serialize(),
    });
  }

  public deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.$rsi.deserialize(parsed.rsi);
  }
}