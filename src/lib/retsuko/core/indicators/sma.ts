import { Candle } from '../../tables/candle';
import { Indicator } from '../Indicator';

export class SMA implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public readonly name: string,
    public readonly windowLength: number,
  ) {
    this.$prices = new Array(windowLength);
  }

  $prices: number[];
  $age = 0;
  $sum = 0;

  public update(candle: Candle): void {
    const price = candle.close;

    if (!this.ready) {
      if (this.$age === this.windowLength - 1) {
        this.ready = true;
      }
    }

    const tail = this.$prices[this.$age] || 0;
    this.$prices[this.$age] = price;
    this.$sum += price - tail;
    this.value = this.$sum / this.windowLength;
    this.$age = (this.$age + 1) % this.windowLength;
  }
}