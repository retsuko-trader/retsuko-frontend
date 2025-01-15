import { Candle } from '../../tables';
import { Indicator } from '../Indicator';
import { EMA } from './ema';

export class DEMA implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public name: string,
    public weight: number,
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

  serialize(): string {
    return JSON.stringify({
      name: this.name,
      weight: this.weight,
      value: this.value,
      ready: this.ready,
      inner: this.$inner.serialize(),
      outer: this.$outer.serialize(),
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.value = parsed.value;
    this.ready = parsed.ready;

    this.$inner.deserialize(parsed.inner);
    this.$outer.deserialize(parsed.outer);
  }
}