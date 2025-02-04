import { Candle } from '../../tables';
import { DebugIndicator } from '../DebugIndicator';
import { TrailingStopLoss } from '../helper';
import { ChandelierExit } from '../indicators';
import { Tulip, TulipIndicator } from '../indicators/tulip';
import { Signal } from '../Signal';
import { Strategy, StrategyConfig } from '../strategy';

export interface ScalpingStrategyConfig extends StrategyConfig {
  atrPeriod: number;
  atrMultiplier: number;
  zlemaPeriod: number;
  trailingStop: number;
}

export class ScalpingStrategy extends Strategy<ScalpingStrategyConfig> {
  $chandelierExit: ChandelierExit;
  $zlema: TulipIndicator;
  $stopLoss: TrailingStopLoss;

  $readyFor: 'long' | 'short' | null = null;

  constructor(
    name: string,
    config: ScalpingStrategyConfig,
  ) {
    super(name, config);

    this.$chandelierExit = this.addIndicator(new ChandelierExit('chandelierExit', config.atrPeriod, config.atrMultiplier));
    this.$zlema = this.addIndicator(Tulip.ZLEMA('zlema', config.zlemaPeriod));

    this.$stopLoss = new TrailingStopLoss(config.trailingStop);
  }

  public async update(candle: Candle): Promise<Signal | null> {
    super.update(candle);

    if (this.$chandelierExit.value === 1) {
      this.$readyFor = 'long';
      return 'closeShort';
    } else if (this.$chandelierExit.value === -1) {
      this.$readyFor = 'short';
      return 'closeLong';
    }

    if (this.$readyFor === 'long' && this.$zlema.value > candle.close) {
      this.$readyFor = null;
      return 'long';
    } else if (this.$readyFor === 'short' && this.$zlema.value < candle.close) {
      this.$readyFor = null;
      return 'short';
    }

    return null;
  }

  public async debug(_candle: Candle): Promise<DebugIndicator[]> {
    return [
      {
        name: 'chandelierExitLong',
        index: 0,
        value: this.$chandelierExit.long,
      },
      {
        name: 'chandelierExitShort',
        index: 0,
        value: this.$chandelierExit.short,
      },
      {
        name: 'chandelierSignal',
        index: 1,
        value: this.$chandelierExit.value,
      },
      {
        name: 'zlema',
        index: 2,
        value: this.$zlema.value,
      },
    ];
  }

  public serialize(): string {
    return JSON.stringify({
      name: this.name,
      config: this.config,
      chandelierExit: this.$chandelierExit.serialize(),
      zlema: this.$zlema.serialize(),
      stopLoss: this.$stopLoss.serialize(),
      readyFor: this.$readyFor,
    });
  }

  public deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.name = parsed.name;
    this.config = parsed.config;
    this.$chandelierExit.deserialize(parsed.chandelierExit);
    this.$zlema.deserialize(parsed.zlema);
    this.$stopLoss.deserialize(parsed.stopLoss);
    this.$readyFor = parsed.readyFor;
  }
}

