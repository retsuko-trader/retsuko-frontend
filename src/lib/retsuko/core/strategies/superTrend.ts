import { Candle } from '../../tables';
import { Tulip, TulipIndicator } from '../indicators/tulip';
import { Strategy, StrategyConfig } from '../strategy';

export interface SuperTrendStrategyConfig extends StrategyConfig {
  atrPeriod: number;
  bandFactor: number;
}

interface SuperTrendState {
  upperBandBasic: number;
  lowerBandBasic: number;
  upperBand: number;
  lowerBand: number;
  superTrend: number;
}

export class SuperTrendStrategy extends Strategy<SuperTrendStrategyConfig> {
  $atr: TulipIndicator;
  $trend: SuperTrendState;
  $lastTrend: SuperTrendState;
  $lastCandleClose: number;

  constructor(
    name: string,
    config: SuperTrendStrategyConfig,
  ) {
    super(name, config);

    this.$atr = this.addIndicator(Tulip.ATR('atr', config.atrPeriod));
    this.$trend = {
      upperBandBasic: 0,
      lowerBandBasic: 0,
      upperBand: 0,
      lowerBand: 0,
      superTrend: 0,
    };
    this.$lastTrend = {
      upperBandBasic: 0,
      lowerBandBasic: 0,
      upperBand: 0,
      lowerBand: 0,
      superTrend: 0,
    };
    this.$lastCandleClose = 0;
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
    super.update(candle);

    const atr = this.$atr.value;

    this.$trend.upperBandBasic = (candle.high + candle.low) / 2 + atr * this.config.bandFactor;
    this.$trend.lowerBandBasic = (candle.high + candle.low) / 2 - atr * this.config.bandFactor;

    if (this.$trend.upperBandBasic < this.$lastTrend.upperBand || this.$lastCandleClose > this.$lastTrend.upperBand) {
      this.$trend.upperBand = this.$trend.upperBandBasic;
    } else {
      this.$trend.upperBand = this.$lastTrend.upperBand;
    }

    if (this.$trend.lowerBandBasic > this.$lastTrend.lowerBand || this.$lastCandleClose < this.$lastTrend.lowerBand) {
      this.$trend.lowerBand = this.$trend.lowerBandBasic;
    } else {
      this.$trend.lowerBand = this.$lastTrend.lowerBand;
    }

    if (this.$lastTrend.superTrend === this.$lastTrend.upperBand && candle.close <= this.$trend.upperBand) {
      this.$trend.superTrend = this.$trend.upperBand;
    } else if (this.$lastTrend.superTrend === this.$lastTrend.upperBand && candle.close >= this.$trend.upperBand) {
      this.$trend.superTrend = this.$trend.lowerBand;
    } else if (this.$lastTrend.superTrend === this.$lastTrend.lowerBand && candle.close >= this.$trend.lowerBand) {
      this.$trend.superTrend = this.$trend.lowerBand;
    } else if (this.$lastTrend.superTrend === this.$lastTrend.lowerBand && candle.close <= this.$trend.lowerBand) {
      this.$trend.superTrend = this.$trend.upperBand;
    } else {
      this.$trend.superTrend = 0;
    }

    this.$lastCandleClose = candle.close;
    this.$lastTrend = { ...this.$trend };

    if (candle.close > this.$trend.superTrend) {
      return 'long';
    }

    if (candle.close < this.$trend.superTrend) {
      return 'short';
    }

    return null;
  }

  public serialize(): string {
    return JSON.stringify({
      name: this.name,
      config: this.config,
      trend: this.$trend,
      lastTrend: this.$lastTrend,
      lastCandleClose: this.$lastCandleClose,
    });
  }

  public deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.name = parsed.name;
    this.config = parsed.config;
    this.$trend = parsed.trend;
    this.$lastTrend = parsed.lastTrend;
    this.$lastCandleClose = parsed.lastCandleClose;
  }
}
