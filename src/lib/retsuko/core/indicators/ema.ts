import { Candle } from '../../tables';
import { Indicator } from '../Indicator';

export class EMA implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public readonly name: string,
    public readonly weight: number,
  ) { }

  public update(candle: Candle) {
    const price = candle.close;

    if (!this.ready) {
      this.ready = true;
      this.value = price;
      return;
    }

    const k = 2 / (this.weight + 1);
    this.value = price * k + this.value * (1 - k);
  }
}