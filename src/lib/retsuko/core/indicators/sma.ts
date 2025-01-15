import { Candle } from '../../tables';
import { Indicator } from '../Indicator';

export class SMA implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public name: string,
    public windowLength: number,
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

  serialize(): string {
    return JSON.stringify({
      name: this.name,
      windowLength: this.windowLength,
      value: this.value,
      ready: this.ready,
      prices: this.$prices,
      age: this.$age,
      sum: this.$sum,
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.name = parsed.name;
    this.windowLength = parsed.windowLength;
    this.value = parsed.value;
    this.ready = parsed.ready;
    this.$prices = parsed.prices;
    this.$age = parsed.age;
    this.$sum = parsed.sum;
  }
}