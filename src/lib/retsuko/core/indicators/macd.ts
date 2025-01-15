import { Candle } from '../../tables';
import { Indicator } from '../Indicator';
import { EMA } from './ema';

export class MACD implements Indicator {
  public value = 0;
  public ready = false;

  constructor(
    public name: string,
    public short: number,
    public long: number,
    public signal: number,
  ) {
    this.$short = new EMA('_short', short);
    this.$long = new EMA('_long', long);
    this.$signal = new EMA('_signal', signal);
  }

  $short: EMA;
  $long: EMA;
  $signal: EMA;

  update(candle: Candle): void {
    this.$short.update(candle);
    this.$long.update(candle);

    const diff = this.$short.value - this.$long.value;
    this.$signal.update({ ...candle, close: diff });
    this.value = diff - this.$signal.value;

    if (!this.ready) {
      this.ready = true;
    }
  }

  serialize(): string {
    return JSON.stringify({
      name: this.name,
      cfgShort: this.short,
      cfgLong: this.long,
      cfgSignal: this.signal,
      value: this.value,
      ready: this.ready,
      short: this.$short.serialize(),
      long: this.$long.serialize(),
      signal: this.$signal.serialize(),
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);

    this.name = parsed.name;
    this.short = parsed.cfgShort;
    this.long = parsed.cfgLong;
    this.signal = parsed.cfgSignal;
    this.value = parsed.value;
    this.ready = parsed.ready;
    this.$short.deserialize(parsed.short);
    this.$long.deserialize(parsed.long);
    this.$signal.deserialize(parsed.signal);
  }
}