import { Candle } from '../../tables/candle';
import { Indicator } from '../Indicator';
import { EMA } from './ema';

export class MACD implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public readonly name: string,
    public readonly short: number,
    public readonly long: number,
    public readonly signal: number,
  ) {
    this.$short = new EMA('_short', short);
    this.$long = new EMA('_long', long);
    this.$signal = new EMA('_signal', signal);
  }

  $short: EMA;
  $long: EMA;
  $signal: EMA;

  update(candle: Candle): void {
    this.$short.update(candle);
    this.$long.update(candle);

    const diff = this.$short.value - this.$long.value;
    this.$signal.update({ ...candle, close: diff });
    this.value = diff - this.$signal.value;

    if (!this.ready) {
      this.ready = true;
    }
  }
}