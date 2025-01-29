import { Candle } from '../../tables';
import { Strategy, StrategyConfig } from '../strategy';

export interface MichaelHarrisDaxStrategyConfig extends StrategyConfig {
  window: number;
}

export class MichaelHarrisDaxStrategy extends Strategy<MichaelHarrisDaxStrategyConfig> {
  $candles: Candle[] = [];

  constructor(
    name: string,
    config: MichaelHarrisDaxStrategyConfig,
  ) {
    super(name, config);
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
    this.$candles.push(candle);

    if (this.$candles.length > this.config.window) {
      this.$candles.shift();
    }

    if (this.$candles.length < this.config.window) {
      return null;
    }

    const curr = this.$candles[this.$candles.length - 1];
    const pre1 = this.$candles[this.$candles.length - 2];
    const pre2 = this.$candles[this.$candles.length - 3];
    const pre3 = this.$candles[this.$candles.length - 4];

    const b1 = curr.high > pre1.high;
    const b2 = pre1.high > curr.low;
    const b3 = curr.low > pre2.high;
    const b4 = pre2.high > pre1.low;
    const b5 = pre1.low > pre3.high;
    const b6 = pre3.high > pre2.low;
    const b7 = pre2.low > pre3.low;

    if (b1 && b2 && b3 && b4 && b5 && b6 && b7) {
      return 'long';
    }

    const s1 = curr.low < pre1.low;
    const s2 = pre1.low < curr.high;
    const s3 = curr.high < pre2.low;
    const s4 = pre2.low < pre1.high;
    const s5 = pre1.high < pre3.low;
    const s6 = pre3.low < pre2.high;
    const s7 = pre2.high < pre3.high;

    if (s1 && s2 && s3 && s4 && s5 && s6 && s7) {
      return 'short';
    }

    return null;
  }

  public serialize(): string {
    return JSON.stringify({
      candles: this.$candles,
    });
  }

  public deserialize(data: string): void {
    const { candles } = JSON.parse(data);
    this.$candles = candles;
  }
}