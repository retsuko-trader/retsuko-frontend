import { Candle } from '../../tables';
import { TrailingStopLoss } from '../helper';
import { Strategy, StrategyConfig } from '../strategy';

export interface MichaelHarrisDaxStrategyConfig extends StrategyConfig {
  window: number;
  delay: number;
  trailingStop: number;
  buyAlgorithm: number;
  sellAlgorithm: number;
}

export class MichaelHarrisDaxStrategy extends Strategy<MichaelHarrisDaxStrategyConfig> {
  $candles: Candle[] = [];
  $stopLoss: TrailingStopLoss;

  constructor(
    name: string,
    config: MichaelHarrisDaxStrategyConfig,
  ) {
    super(name, config);
    this.$stopLoss = new TrailingStopLoss(config.trailingStop);
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
    this.$candles.push(candle);

    if (this.$candles.length > this.config.window) {
      this.$candles.shift();
    }

    if (this.$candles.length < this.config.window) {
      return null;
    }

    if (this.$stopLoss.isTriggered(candle.close)) {
      this.$stopLoss.destroy();
      return 'short';
    }

    const curr = this.$candles[this.$candles.length - 1 - this.config.delay];
    const pre1 = this.$candles[this.$candles.length - 2 - this.config.delay];
    const pre2 = this.$candles[this.$candles.length - 3 - this.config.delay];
    const pre3 = this.$candles[this.$candles.length - 4 - this.config.delay];
    const pre4 = this.$candles[this.$candles.length - 5 - this.config.delay];

    const buyConditions = this.config.buyAlgorithm === 0 ? [
      pre2.low > curr.high,
      curr.high > pre3.low,
      pre3.low > pre1.low,
    ] : [
      curr.high > pre1.high,
      pre1.high > curr.low,
      curr.low > pre2.high,
      pre2.high > pre1.low,
      pre1.low > pre3.high,
      pre3.high > pre2.low,
      pre2.low > pre3.low,
    ];

    if (buyConditions.every(x => x)) {
      this.$stopLoss.create(this.config.trailingStop, candle.close);
      return 'long';
    }

    const sellConditions = this.config.sellAlgorithm === 0 ? [
      curr.high > pre1.high,
      pre1.high > pre2.high,
      pre2.high > curr.close,
      curr.close > curr.low,
      curr.low > pre1.low,
      pre1.low > pre2.low,
    ] : this.config.sellAlgorithm === 1 ? [
      curr.low < pre1.low,
      pre1.low < curr.high,
      curr.high < pre2.low,
      pre2.low < pre1.high,
      pre1.high < pre3.low,
      pre3.low < pre2.high,
      pre2.high < pre3.high,
    ] : [
      pre4.close > pre2.close,
      pre2.close > pre3.close,
      pre3.close > pre1.close,
      pre1.close > curr.close,
    ];

    if (sellConditions.every(x => x)) {
      this.$stopLoss.destroy();
      return 'short';
    }

    return null;
  }

  public serialize(): string {
    return JSON.stringify({
      candles: this.$candles,
    });
  }

  public deserialize(data: string): void {
    const { candles } = JSON.parse(data);
    this.$candles = candles;
  }
}