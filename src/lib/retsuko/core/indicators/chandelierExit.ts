import { Candle } from '../../tables';
import { Indicator } from '../Indicator';
import { HHV } from './hhv';
import { LLV } from './llv';
import { Tulip, TulipIndicator } from './tulip';

export class ChandelierExit implements Indicator {
  public value = 0;
  public ready = false;

  public long = 0;
  public short = 0;

  constructor(
    public name: string,
    public period: number,
    public multiplier: number,
  ) {
    this.$atr = Tulip.ATR('atr', period);
    this.$hhv = new HHV('hhv', period);
    this.$llv = new LLV('llv', period);
  }

  $atr: TulipIndicator;
  $hhv: HHV;
  $llv: LLV;

  public update(candle: Candle): void {
    this.$atr.update(candle);
    this.$hhv.update(candle);
    this.$llv.update(candle);


    if (!this.$atr.ready || !this.$hhv.ready || !this.$llv.ready) {
      return;
    }

    const atr = this.$atr.value;
    const high = this.$hhv.value;
    const low = this.$llv.value;

    this.long = high - atr * this.multiplier;
    this.short = low + atr * this.multiplier;

    if (high === candle.high) {
      this.value = 1;
    } else if (low === candle.low) {
      this.value = -1;
    } else {
      this.value = 0;
    }
  }

  serialize(): string {
    return JSON.stringify({
      name: this.name,
      period: this.period,
      multiplier: this.multiplier,
      value: this.value,
      ready: this.ready,
      atr: this.$atr.serialize(),
      hhv: this.$hhv.serialize(),
      llv: this.$llv.serialize(),
      long: this.long,
      short: this.short,
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.name = parsed.name;
    this.period = parsed.period;
    this.multiplier = parsed.multiplier;
    this.value = parsed.value;
    this.ready = parsed.ready;
    this.$atr.deserialize(parsed.atr);
    this.$hhv.deserialize(parsed.hhv);
    this.$llv.deserialize(parsed.llv);
    this.long = parsed.long;
    this.short = parsed.short;
  }
}