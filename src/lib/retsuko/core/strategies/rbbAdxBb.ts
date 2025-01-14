// https://github.com/nmikaty/Gekko-Strategies/blob/master/RBB_ADX_BB.js

import { Strategy, StrategyConfig } from '../strategy';
import { Tulip, TulipIndicator } from '../indicators/tulip';
import { SMA } from '../indicators';
import { Indicator } from '../Indicator';
import { Candle } from '../../tables';

export interface RbbAdxBbConfig extends StrategyConfig {
  smaLong: number;
  smaShort: number;

  bullHigh: number;
  bullLow: number;
  bullModHigh: number;
  bullModLow: number;
  bullRsi: number;

  bearHigh: number;
  bearLow: number;
  bearModHigh: number;
  bearModLow: number;
  bearRsi: number;

  adx: number;
  adxHigh: number;
  adxLow: number;

  bbandNbDevDn: number;
  bbandNbDevUp: number;
  bbandTimePeriod: number;

  bbtrendUpperThreshold: number;
  bbtrendLowerThreshold: number;
  bbtrendPersistence: number;
}

type Zone = 'none' | 'middle' | 'high' | 'low';

export class RbbAdxBb extends Strategy<RbbAdxBbConfig> {
  $maSlow: Indicator;
  $maFast: Indicator;
  $bullRsi: TulipIndicator;
  $bearRsi: TulipIndicator;
  $adx: TulipIndicator;
  $bb: TulipIndicator;
  $bbTrend: {
    zone: Zone;
    duration: number;
    persisted: boolean;
  };
  $trend: {
    duration: number;
    direction: 'none' | 'up' | 'down';
    longPos: boolean;
  };

  constructor(
    name: string,
    config: RbbAdxBbConfig,
  ) {
    super(name, config);

    this.$maSlow = this.addIndicator(new SMA('maSlow', config.smaLong));
    this.$maFast = this.addIndicator(new SMA('maFast', config.smaShort));
    this.$bullRsi = this.addIndicator(Tulip.RSI('bullRsi', config.bullRsi));
    this.$bearRsi = this.addIndicator(Tulip.RSI('bearRsi', config.bearRsi));
    this.$adx = this.addIndicator(Tulip.ADX('adx', config.adx));
    this.$bb = this.addIndicator(Tulip.BBANDS('bb', config.bbandTimePeriod, config.bbandNbDevDn));
    this.$trend = {
      duration: 0,
      direction: 'none',
      longPos: false,
    }

    this.$bbTrend = {
      zone: 'none',
      duration: 0,
      persisted: false,
    };
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
    super.update(candle);

    const price = candle.close;
    const bb = {
      lower: this.$bb.values[0],
      middle: this.$bb.values[1],
      upper: this.$bb.values[2],
    };

    let zone: Zone = 'none';
    const priceUpperBb = bb.lower + (bb.upper - bb.lower) / 100 * this.config.bbtrendUpperThreshold;
    const priceLowerBb = bb.lower + (bb.upper - bb.lower) / 100 * this.config.bbtrendLowerThreshold;
    if (price >= priceUpperBb) {
      zone = 'high';
    } else if (price < priceUpperBb && price > priceLowerBb) {
      zone = 'middle';
    } else if (price <= priceLowerBb) {
      zone = 'low';
    }

    if (this.$bbTrend.zone === zone) {
      this.$bbTrend.duration += 1;
      this.$bbTrend.persisted = true;
    } else {
      this.$bbTrend.zone = zone;
      this.$bbTrend.duration = 0;
      this.$bbTrend.persisted = false;
    }

    let rsi = 0;
    let rsiHigh = 0;
    let rsiLow = 0;
    if (this.$maFast.value < this.$maSlow.value) {
      rsi = this.$bearRsi.value;
      rsiHigh = this.config.bearHigh;
      rsiLow = this.config.bearLow;

      if (this.$adx.value > this.config.adxHigh) {
        rsiHigh += this.config.bearModHigh;
      } else if (this.$adx.value < this.config.adxLow) {
        rsiLow += this.config.bearModLow;
      }
    } else {
      rsi = this.$bullRsi.value;
      rsiHigh = this.config.bullHigh;
      rsiLow = this.config.bullLow;

      if (this.$adx.value > this.config.adxHigh) {
        rsiHigh += this.config.bullModHigh;
      } else if (this.$adx.value < this.config.adxLow) {
        rsiLow += this.config.bullModLow;
      }
    }

    if (rsi < rsiLow && this.$bbTrend.zone === 'low' && this.$bbTrend.duration >= this.config.bbtrendPersistence) {
      if (this.long()) {
        return 'long';
      }
    } else if (rsi > rsiHigh && price >= priceUpperBb) {
      if (this.short()) {
        return 'short';
      }
    }

    return null;
  }

  long(): boolean {
    if (this.$trend.direction === 'up') {
      return false;
    }

    this.resetTrend();
    this.$trend.direction = 'up';
    return true;
  }

  short(): boolean {
    if (this.$trend.direction === 'down') {
      return false;
    }

    this.resetTrend();
    this.$trend.direction = 'down';
    return true;
  }

  resetTrend() {
    this.$trend = {
      duration: 0,
      direction: 'none',
      longPos: false,
    };
  }
}