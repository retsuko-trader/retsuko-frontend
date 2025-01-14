import { Candle } from '../../tables';
import { Indicator } from '../Indicator';
import { SMA } from './sma';

export class SMMA implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public readonly name: string,
    public readonly windowLength: number,
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
}