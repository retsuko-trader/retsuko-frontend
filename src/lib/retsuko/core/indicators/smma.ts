import { Candle } from '../../tables';
import { Indicator } from '../Indicator';
import { SMA } from './sma';

export class SMMA implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public name: string,
    public windowLength: number,
  ) {
    this.$sma = new SMA('_sma', windowLength);
  }

  $sma: SMA;
  $age = 0;

  public update(candle: Candle): void {
    const price = candle.close;
    this.$age += 1;

    if (this.$age < this.windowLength) {
      this.$sma.update(candle);
    } else if (this.$age === this.windowLength) {
      this.$sma.update(candle);
      this.value = this.$sma.value;
    } else {
      this.ready = true;
      this.value = (this.value * (this.windowLength - 1) + price) / this.windowLength;
    }
  }

  serialize(): string {
    return JSON.stringify({
      name: this.name,
      windowLength: this.windowLength,
      value: this.value,
      ready: this.ready,
      age: this.$age,
      sma: this.$sma.serialize(),
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.name = parsed.name;
    this.windowLength = parsed.windowLength;
    this.value = parsed.value;
    this.ready = parsed.ready;
    this.$age = parsed.age;
    this.$sma.deserialize(parsed.sma);
  }
}