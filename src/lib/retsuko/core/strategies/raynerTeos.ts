import { Candle } from '../../tables';
import { stdev, TrailingStopLoss } from '../helper';
import { RSI, SMA } from '../indicators';
import { StrategyConfig, Strategy } from '../strategy';

export interface RaynerTeosStrategyConfig extends StrategyConfig {
  window: number;
  smaLong: number;
  smaShort: number;
  rsiPeriod: number;
}

export class RaynerTeosStrategy extends Strategy<RaynerTeosStrategyConfig> {
  $sma200: SMA;
  $sma20: SMA;
  $rsi: RSI;
  $prices: number[] = [];
  $prevLow: number = 0;
  $stopLoss: TrailingStopLoss;

  constructor(
    name: string,
    config: RaynerTeosStrategyConfig,
  ) {
    super(name, config);

    this.$sma200 = this.addIndicator(new SMA('sma200', config.smaLong));
    this.$sma20 = this.addIndicator(new SMA('sma20', config.smaShort));
    this.$rsi = this.addIndicator(new RSI('rsi', config.rsiPeriod));
    this.$stopLoss = new TrailingStopLoss(15);
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
    super.update(candle);

    this.$prices.push(candle.close);
    if (this.$prices.length > this.config.window) {
      this.$prices.shift();
    }

    if (this.$prices.length < this.config.window) {
      return null;
    }

    const stddev = stdev(this.$prices);
    const sma200 = this.$sma200.value;
    const sma20 = this.$sma20.value;
    const rsi = this.$rsi.value;
    const prevLow = this.$prevLow;

    this.$prevLow = candle.low;

    if (this.$stopLoss.isTriggered(candle.close)) {
      this.$stopLoss.destroy();
      return 'short';
    }

    if (candle.close > sma200 && candle.close < sma20 + 2.5 * stddev && candle.close * 0.97 >= prevLow) {
      this.$stopLoss.create(15, candle.close);
      return 'long';
    }

    if (rsi > 50) {
      this.$stopLoss.destroy();
      return 'short';
    }

    return null;
  }

  public serialize(): string {
    return JSON.stringify({
      sma200: this.$sma200.serialize(),
      sma20: this.$sma20.serialize(),
      rsi: this.$rsi.serialize(),
      prices: this.$prices,
      prevLow: this.$prevLow,
      stopLoss: this.$stopLoss.serialize(),
    });
  }

  public deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.$sma200.deserialize(parsed.sma200);
    this.$sma20.deserialize(parsed.sma20);
    this.$rsi.deserialize(parsed.rsi);
    this.$prices = parsed.prices;
    this.$prevLow = parsed.prevLow;
    this.$stopLoss.deserialize(parsed.stopLoss);
  }
}