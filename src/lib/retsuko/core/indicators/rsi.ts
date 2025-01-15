import { Candle } from '../../tables';
import { Indicator } from '../Indicator';
import { SMMA } from './smma';

export class RSI implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public name: string,
    public weight: number,
  ) {
    this.$avgU = new SMMA('_avgU', weight);
    this.$avgD = new SMMA('_avgD', weight);
  }

  $avgU: SMMA;
  $avgD: SMMA;
  $u = 0;
  $d = 0;
  $rs = 0;
  $age = 0;
  $lastPrice: number | null = null;

  public update(candle: Candle): void {
    const price = candle.close;

    if (this.$lastPrice === null) {
      this.$lastPrice = price;
      this.$age += 1;
      return;
    }

    if (!this.ready) {
      if (this.$avgU.ready && this.$avgD.ready) {
        this.ready = true;
      }
    }

    if (price > this.$lastPrice) {
      this.$u = price - this.$lastPrice;
      this.$d = 0;
    } else {
      this.$u = 0;
      this.$d = this.$lastPrice - price;
    }

    this.$avgU.update({ ...candle, close: this.$u });
    this.$avgD.update({ ...candle, close: this.$d });

    this.$rs = this.$avgU.value / this.$avgD.value;
    this.value = 100 - (100 / (1 + this.$rs));

    if (this.$avgD.value === 0 && this.$avgU.value !== 0) {
      this.value = 100;
    } else if (this.$avgD.value === 0) {
      this.value = 0;
    }

    this.$lastPrice = price;
    this.$age += 1;
  }

  serialize(): string {
    return JSON.stringify({
      name: this.name,
      weight: this.weight,
      value: this.value,
      ready: this.ready,
      avgU: this.$avgU.serialize(),
      avgD: this.$avgD.serialize(),
      u: this.$u,
      d: this.$d,
      rs: this.$rs,
      age: this.$age,
      lastPrice: this.$lastPrice,
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.name = parsed.name;
    this.weight = parsed.weight;
    this.value = parsed.value;
    this.ready = parsed.ready;
    this.$avgU.deserialize(parsed.avgU);
    this.$avgD.deserialize(parsed.avgD);
    this.$u = parsed.u;
    this.$d = parsed.d;
    this.$rs = parsed.rs;
    this.$age = parsed.age;
    this.$lastPrice = parsed.lastPrice;
  }
}