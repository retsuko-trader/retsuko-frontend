import { Candle } from '../../tables';
import { Indicator } from '../Indicator';

export class EMA implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public name: string,
    public weight: number,
  ) { }

  public update(candle: Pick<Candle, 'close'>) {
    const price = candle.close;

    if (!this.ready) {
      this.ready = true;
      this.value = price;
      return;
    }

    const k = 2 / (this.weight + 1);
    this.value = price * k + this.value * (1 - k);
  }

  serialize(): string {
    return JSON.stringify({
      name: this.name,
      weight: this.weight,
      value: this.value,
      ready: this.ready,
    });
  }

  deserialize(data: string): void {
    const obj = JSON.parse(data);
    this.name = obj.name;
    this.weight = obj.weight;
    this.value = obj.value;
    this.ready = obj.ready;
  }
}