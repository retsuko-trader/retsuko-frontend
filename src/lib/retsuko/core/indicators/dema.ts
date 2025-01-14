import { Candle } from '../../tables';
import { Indicator } from '../Indicator';
import { EMA } from './ema';

export class DEMA implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public readonly name: string,
    public readonly weight: number,
  ) {
    this.$inner = new EMA('_inner', weight);
    this.$outer = new EMA('_outer', weight);
  }

  $inner: EMA;
  $outer: EMA;

  public update(candle: Candle) {
    this.$inner.update(candle);
    this.$outer.update({ ...candle, close: this.$inner.value });

    this.value = 2 * this.$inner.value - this.$outer.value;

    if (!this.ready) {
      this.ready = true;
    }
  }
}