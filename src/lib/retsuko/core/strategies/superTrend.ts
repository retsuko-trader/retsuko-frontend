import { Candle } from '../../tables';
import { TrailingStopLoss } from '../helper';
import { Tulip, TulipIndicator } from '../indicators/tulip';
import { Signal } from '../Signal';
import { Strategy, StrategyConfig } from '../strategy';

export interface SuperTrendStrategyConfig extends StrategyConfig {
  atrPeriod: number;
  bandFactor: number;
  trailingStop: number;
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
  $age: number = 0;
  $stopLoss: TrailingStopLoss;

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
    this.$stopLoss = new TrailingStopLoss(this.config.trailingStop);
  }

  async preload(candles: Candle[]): Promise<void> {
    await super.preload(candles);
    for (const candle of candles) {
      this.updateInner(candle);
    }
  }

  public async update(candle: Candle): Promise<Signal | null> {
    const ready = this.updateInner(candle);
    if (!ready) {
      return null;
    }

    if (this.$stopLoss.isTriggered(candle.close)) {
      this.$stopLoss.destroy();
      return 'closeLong';
    }

    if (candle.close > this.$trend.superTrend) {
      this.$stopLoss.create(this.config.trailingStop, candle.close);
      return 'long';
    }

    if (candle.close < this.$trend.superTrend) {
      this.$stopLoss.destroy();
      return { action: 'short', confidence: 0 };
    }

    return null;
  }

  updateInner(candle: Candle) {
    super.update(candle);

    const atr = this.$atr.value;
    this.$age += 1;

    if (this.$age < this.config.atrPeriod) {
      return false;
    }

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

    return true;
  }

  public serialize(): string {
    return JSON.stringify({
      name: this.name,
      config: this.config,
      trend: this.$trend,
      lastTrend: this.$lastTrend,
      lastCandleClose: this.$lastCandleClose,
      age: this.$age,
      stopLoss: this.$stopLoss.serialize(),
    });
  }

  public deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.name = parsed.name;
    this.config = parsed.config;
    this.$trend = parsed.trend;
    this.$lastTrend = parsed.lastTrend;
    this.$lastCandleClose = parsed.lastCandleClose;
    this.$age = parsed.age;
    this.$stopLoss.deserialize(parsed.stopLoss);
  }
}
