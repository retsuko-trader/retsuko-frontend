import { Candle } from '../../tables';
import { EMA, HHV, LLV } from '../indicators';
import { Tulip, TulipIndicator } from '../indicators/tulip';
import { Strategy, StrategyConfig } from '../strategy';

export interface CriticalStrategyConfig extends StrategyConfig {
  period: number;
  atrPeriod: number;
  atrMultiplier: number;
  maPeriod: number;
}

export class CriticalStrategy extends Strategy<CriticalStrategyConfig> {
  $atr: TulipIndicator;
  $ma: EMA;
  $llv: LLV;
  $hhv: HHV;

  $prevLLV: number = 0;
  $prevHHV: number = 0;

  constructor(
    name: string,
    config: CriticalStrategyConfig,
  ) {
    super(name, config);

    this.$atr = this.addIndicator(Tulip.ATR('atr', config.atrPeriod));
    this.$ma = this.addIndicator(new EMA('ma', config.maPeriod));
    this.$llv = this.addIndicator(new LLV('llv', config.period));
    this.$hhv = this.addIndicator(new HHV('hhv', config.period));
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
    await super.update(candle);

    if (!this.$atr.ready || !this.$ma.ready || !this.$llv.ready || !this.$hhv.ready) {
      return null;
    }

    const atr = this.$atr.value;
    const ma = this.$ma.value;

    const prevLLV = this.$prevLLV;
    const prevHHV = this.$prevHHV;

    this.$prevLLV = this.$llv.value;
    this.$prevHHV = this.$hhv.value;

    if (candle.close < prevLLV && candle.close > ma) {
      return 'long';
    } else if (candle.close > prevHHV) {
      return 'short';
    }

    return null;
  }
}