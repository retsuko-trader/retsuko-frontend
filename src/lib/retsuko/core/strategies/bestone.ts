import { Candle } from '../../tables';
import { EMA, RSI } from '../indicators';
import { Tulip, TulipIndicator } from '../indicators/tulip';
import { Strategy, StrategyConfig } from '../strategy';

export interface BestoneStrategyConfig extends StrategyConfig {
  macdFastPeriod: number;
  macdSlowPeriod: number;
  macdSignalPeriod: number;
  emaShortTimePeriod: number;
  emaLongTimePeriod: number;
  stochFastKPeriod: number;
  stochSlowKPeriod: number;
  stochSlowDPeriod: number;
  rsiTimePeriod: number;
  rsiHigh: number;
  rsiLow: number;
  historySize: number;
}

interface BestoneState {
  direction: 'none' | 'up' | 'down';
  duration: number;
  persisted: boolean;
  adviced: boolean;
}

export class BestoneStrategy extends Strategy<BestoneStrategyConfig> {
  $macd: TulipIndicator;
  $emaShort: EMA;
  $emaLong: EMA;
  $rsi: RSI;
  $stoch: TulipIndicator;
  $candles: Candle[];
  $trend: BestoneState;

  constructor(
    name: string,
    config: BestoneStrategyConfig,
  ) {
    super(name, config);

    this.$macd = this.addIndicator(Tulip.MACD('macd', config.macdFastPeriod, config.macdSlowPeriod, config.macdSignalPeriod));
    this.$emaShort = this.addIndicator(new EMA('emaShort', config.emaShortTimePeriod));
    this.$emaLong = this.addIndicator(new EMA('emaLong', config.emaLongTimePeriod));
    this.$rsi = this.addIndicator(new RSI('rsi', config.rsiTimePeriod));
    this.$stoch = this.addIndicator(Tulip.STOCH('stoch', config.stochFastKPeriod, config.stochSlowKPeriod, config.stochSlowDPeriod));
    this.$candles = [];
    this.$trend = {
      direction: 'none',
      duration: 0,
      persisted: false,
      adviced: false,
    };
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
    super.update(candle);

    this.$candles.push(candle);
    if (this.$candles.length < this.config.historySize) {
      return null;
    }

    if (this.$candles.length > this.config.historySize) {
      this.$candles.shift();
    }

    const macd = this.$macd.value;
    const rsi = this.$rsi.value;
    const emaShort = this.$emaShort.value;
    const emaLong = this.$emaLong.value;
    const stochK = this.$stoch.values[0];
    const stochD = this.$stoch.values[1];
    if (emaShort > emaLong && stochK > stochD && macd > 0 && rsi > this.config.rsiHigh) {
      if (this.$trend.direction !== 'up') {
        this.$trend = {
          direction: 'up',
          duration: 0,
          persisted: false,
          adviced: false,
        };
      }

      this.$trend.duration += 1;
      if (this.$trend.duration >= 1) {
        this.$trend.persisted = true;
      }
      if (this.$trend.persisted && !this.$trend.adviced) {
        this.$trend.adviced = true;
        return 'long';
      } else {
        return null;
      }
    } else if (emaShort < emaLong && stochK < stochD && macd < 0 && rsi < this.config.rsiLow) {
      if (this.$trend.direction !== 'down') {
        this.$trend = {
          direction: 'down',
          duration: 0,
          persisted: false,
          adviced: false,
        };
      }

      this.$trend.duration += 1;
      if (this.$trend.duration >= 1) {
        this.$trend.persisted = true;
      }
      if (this.$trend.persisted && !this.$trend.adviced) {
        this.$trend.adviced = true;
        return 'short';
      } else {
        return null;
      }
    }

    return null;
  }

  public serialize(): string {
    return JSON.stringify({
      name: this.name,
      config: this.config,
      macd: this.$macd.serialize(),
      emaShort: this.$emaShort.serialize(),
      emaLong: this.$emaLong.serialize(),
      rsi: this.$rsi.serialize(),
      stoch: this.$stoch.serialize(),
      candles: this.$candles,
      trend: this.$trend,
    });
  }

  public deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.name = parsed.name;
    this.config = parsed.config;
    this.$macd.deserialize(parsed.macd);
    this.$emaShort.deserialize(parsed.emaShort);
    this.$emaLong.deserialize(parsed.emaLong);
    this.$rsi.deserialize(parsed.rsi);
    this.$stoch.deserialize(parsed.stoch);
    this.$candles = parsed.candles;
    this.$trend = parsed.trend;
  }
}
