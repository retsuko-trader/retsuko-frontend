import { Candle } from '../../tables/candle';
import { Indicator } from '../Indicator';
import { RSI } from './rsi';

export class StochRSI implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public readonly name: string,
    public readonly weight: number,
  ) {
    this.$rsi = new RSI(name, weight);
  }

  $rsi: RSI;
  $history: number[] = [];

  public update(candle: Candle): void {
    this.$rsi.update(candle);

    const rsi = this.$rsi.value;
    this.$history.push(rsi);

    if (this.$history.length > this.weight) {
      this.$history.shift();

      if (!this.ready) {
        this.ready = true;
      }
    }

    const lowest = Math.min(...this.$history);
    const highest = Math.max(...this.$history);
    this.value = (rsi - lowest) / (highest - lowest) * 100;
  }
}