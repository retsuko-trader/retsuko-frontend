import { Candle } from '../../tables';
import { Indicator } from '../Indicator';

export class HHV implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public name: string,
    public windowLength: number,
  ) {
    this.$prices = new Array(windowLength);
  }

  $prices: number[];

  public update(candle: Candle): void {
    const high = candle.high;

    this.$prices.push(high);

    if (this.$prices.length > this.windowLength) {
      this.$prices.shift();
    }

    if (this.$prices.length < this.windowLength) {
      return;
    }

    if (!this.ready) {
      this.ready = true;
    }

    this.value = Math.max(...this.$prices);
  }

  serialize(): string {
    return JSON.stringify({
      name: this.name,
      windowLength: this.windowLength,
      value: this.value,
      ready: this.ready,
      prices: this.$prices,
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.name = parsed.name;
    this.windowLength = parsed.windowLength;
    this.value = parsed.value;
    this.ready = parsed.ready;
    this.$prices = parsed.prices;
  }
}