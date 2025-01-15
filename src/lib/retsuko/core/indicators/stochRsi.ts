import { Candle } from '../../tables';
import { Indicator } from '../Indicator';
import { RSI } from './rsi';

export class StochRSI implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public name: string,
    public weight: number,
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

  serialize(): string {
    return JSON.stringify({
      name: this.name,
      weight: this.weight,
      value: this.value,
      ready: this.ready,
      rsi: this.$rsi.serialize(),
      history: this.$history,
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.name = parsed.name;
    this.weight = parsed.weight;
    this.value = parsed.value;
    this.ready = parsed.ready;
    this.$rsi.deserialize(parsed.rsi);
    this.$history = parsed.history;
  }
}