import { Strategy, StrategyConfig } from '../strategy';
import { Tulip, TulipIndicator } from '../indicators/tulip';
import { Indicator } from '../Indicator';
import { RSI, SMA } from '../indicators';
import { Candle } from '../../tables';

export interface NeoStrategyConfig extends StrategyConfig {
  smaLong: number;
  smaShort: number;
  bullRsi: number;
  bullRsiHigh: number;
  bullRsiLow: number;
  idleRsi: number;
  idleRsiHigh: number;
  idleRsiLow: number;
  bearRsi: number;
  bearRsiHigh: number;
  bearRsiLow: number;
  roc: number;
  rocLvl: number;
}

interface NeoStrategyState {
  direction: 'none' | 'up' | 'down';
}

export class NeoStrategy extends Strategy<NeoStrategyConfig> {
  $maSlow: Indicator;
  $maFast: Indicator;
  $bullRsi: Indicator;
  $idleRsi: Indicator;
  $bearRsi: Indicator;
  $roc: TulipIndicator;
  $state: NeoStrategyState;

  $candles: Candle[];

  constructor(
    name: string,
    config: NeoStrategyConfig,
  ) {
    super(name, config);

    this.$maSlow = this.addIndicator(new SMA('maSlow', config.smaLong));
    this.$maFast = this.addIndicator(new SMA('maFast', config.smaShort));
    this.$bullRsi = this.addIndicator(new RSI('bullRsi', config.bullRsi));
    this.$idleRsi = this.addIndicator(new RSI('idleRsi', config.idleRsi));
    this.$bearRsi = this.addIndicator(new RSI('bearRsi', config.bearRsi));
    this.$roc = this.addIndicator(Tulip.ROC('roc', config.roc));

    this.$state = {
      direction: 'none',
    };

    this.$candles = [];
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
    super.update(candle);

    this.$candles.push(candle);

    if (this.$candles.length < this.config.smaLong) {
      return null;
    }

    if (this.$candles.length > this.config.smaLong) {
      this.$candles.shift();
    }

    const maSlow = this.$maSlow.value;
    const maFast = this.$maFast.value;
    const roc = this.$roc.value;

    if (maFast < maSlow) {
      const rsi = this.$bearRsi.value;
      if (rsi > this.config.bearRsiHigh) {
        if (this.short()) {
          return 'short';
        }
      } else if (rsi < this.config.bearRsiLow) {
        if (this.long()) {
          return 'long';
        }
      }
    } else {
      if (roc <= this.config.rocLvl) {
        const rsi = this.$idleRsi.value;
        if (rsi > this.config.idleRsiHigh) {
          if (this.short()) {
            return 'short';
          }
        } else if (rsi < this.config.idleRsiLow) {
          if (this.long()) {
            return 'long';
          }
        }
      } else {
        const rsi = this.$bullRsi.value;
        if (rsi > this.config.bullRsiHigh) {
          if (this.short()) {
            return 'short';
          }
        } else if (rsi < this.config.bullRsiLow) {
          if (this.long()) {
            return 'long';
          }
        }
      }
    }

    return null;
  }

  resetTrend() {
    this.$state = {
      direction: 'none',
    };
  }

  short() {
    if (this.$state.direction !== 'down') {
      this.resetTrend();
      this.$state.direction = 'down';
      return 'short';
    }

    return null;
  }

  long() {
    if (this.$state.direction !== 'up') {
      this.resetTrend();
      this.$state.direction = 'up';
      return 'long';
    }

    return null;
  }

  public serialize(): string {
    return JSON.stringify({
      name: this.name,
      config: this.config,
      maSlow: this.$maSlow.serialize(),
      maFast: this.$maFast.serialize(),
      bullRsi: this.$bullRsi.serialize(),
      idleRsi: this.$idleRsi.serialize(),
      bearRsi: this.$bearRsi.serialize(),
      roc: this.$roc.serialize(),
      state: this.$state,
    });
  }

  public deserialize(data: string): void {
    const obj = JSON.parse(data);
    this.name = obj.name;
    this.config = obj.config;
    this.$maSlow.deserialize(obj.maSlow);
    this.$maFast.deserialize(obj.maFast);
    this.$bullRsi.deserialize(obj.bullRsi);
    this.$idleRsi.deserialize(obj.idleRsi);
    this.$bearRsi.deserialize(obj.bearRsi);
    this.$roc.deserialize(obj.roc);
    this.$state = obj.state;
  }
}
