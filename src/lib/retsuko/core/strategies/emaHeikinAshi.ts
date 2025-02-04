import { Candle } from '../../tables';
import { DebugIndicator } from '../DebugIndicator';
import { EMA } from '../indicators';
import { Signal } from '../Signal';
import { Strategy, StrategyConfig } from '../strategy';

export interface EmaHeikinAshiStrategyConfig extends StrategyConfig {
  emaPeriod: number;
  ema2Period: number;
}

export class EmaHeikinAshiStrategy extends Strategy<EmaHeikinAshiStrategyConfig> {
  $emaO: EMA;
  $emaH: EMA;
  $emaL: EMA;
  $emaC: EMA;
  $emaO2: EMA;
  $emaC2: EMA;

  constructor(
    name: string,
    config: EmaHeikinAshiStrategyConfig,
  ) {
    super(name, config);

    this.$emaO = new EMA('emaO', config.emaPeriod);
    this.$emaH = new EMA('emaH', config.emaPeriod);
    this.$emaL = new EMA('emaL', config.emaPeriod);
    this.$emaC = new EMA('emaC', config.emaPeriod);
    this.$emaO2 = new EMA('emaO2', config.ema2Period);
    this.$emaC2 = new EMA('emaC2', config.ema2Period);
  }

  public async update(candle: Candle): Promise<Signal | null> {

    this.$emaC.update({ close: candle.close });
    this.$emaO.update({ close: candle.open });
    this.$emaH.update({ close: candle.high });
    this.$emaL.update({ close: candle.low });

    const haClose = (this.$emaC.value + this.$emaO.value + this.$emaH.value + this.$emaL.value) / 4;
    const haOpen = (this.$emaO.value + this.$emaC.value) / 2;
    const _haHigh = Math.max(candle.high, haOpen, haClose);
    const _haLow = Math.min(candle.low, haOpen, haClose);

    this.$emaO2.update({ close: haOpen });
    this.$emaC2.update({ close: haClose });

    return null;
  }

  public async debug(_candle: Candle): Promise<DebugIndicator[]> {
    return [
      {
        name: 'emaO2',
        index: 0,
        value: this.$emaO2.value,
      },
      {
        name: 'emaC2',
        index: 0,
        value: this.$emaC2.value,
      },
      {
        name: 'up',
        index: 1,
        value: this.$emaO2.value > this.$emaC2.value ? 1 : 0,
      },
    ];
  }

  public serialize(): string {
    return JSON.stringify({
      name: this.name,
      config: this.config,
      emaO: this.$emaO.serialize(),
      emaH: this.$emaH.serialize(),
      emaL: this.$emaL.serialize(),
      emaC: this.$emaC.serialize(),
      emaO2: this.$emaO2.serialize(),
      emaC2: this.$emaC2.serialize(),
    });
  }

  public deserialize(str: string) {
    const parsed = JSON.parse(str);
    this.name = parsed.name;
    this.config = parsed.config;
    this.$emaO.deserialize(parsed.emaO);
    this.$emaH.deserialize(parsed.emaH);
    this.$emaL.deserialize(parsed.emaL);
    this.$emaC.deserialize(parsed.emaC);
    this.$emaO2.deserialize(parsed.emaO2);
    this.$emaC2.deserialize(parsed.emaC2);
  }
}