import { Candle } from '../../tables/candle';
import { Indicator } from '../Indicator';
import { StochRSI } from '../indicators';
import { Strategy, StrategyConfig } from '../strategy';

export interface StochRSIStrategyConfig extends StrategyConfig {
  weight: number;
  low: number;
  high: number;
  persistence: number;
  reversed: number;
}

export interface StochRSIState {
  direction: 'up' | 'down' | 'none';
  duration: number;
  persisted: boolean;
  adviced: boolean;
}

export class StochRSIStrategy extends Strategy<StochRSIStrategyConfig> {
  $state: StochRSIState;
  $stochRsi: Indicator;

  constructor(
    name: string,
    config: StochRSIStrategyConfig,
  ) {
    super(name, config);

    this.$stochRsi = this.addIndicator(new StochRSI('stochRsi', config.weight));
    this.$state = {
      direction: 'none',
      duration: 0,
      persisted: false,
      adviced: false,
    };
  }

  public override async update(candle: Candle): Promise<'long' | 'short' | null> {
    super.update(candle);

    const stochRsi = this.$stochRsi.value;

    if (stochRsi > this.config.high) {
      if (this.$state.direction !== 'up') {
        this.$state = {
          direction: 'up',
          duration: 0,
          persisted: false,
          adviced: false,
        };
      }

      this.$state.duration += 1;

      if (this.$state.duration >= this.config.persistence) {
        this.$state.persisted = true;
      }

      if (this.$state.persisted && !this.$state.adviced) {
        this.$state.adviced = true;
        return 'short';
      }
    } else if (stochRsi < this.config.low) {
      if (this.$state.direction !== 'down') {
        this.$state = {
          direction: 'down',
          duration: 0,
          persisted: false,
          adviced: false,
        };
      }

      this.$state.duration += 1;

      if (this.$state.duration >= this.config.persistence) {
        this.$state.persisted = true;
      }

      if (this.$state.persisted && !this.$state.adviced) {
        this.$state.adviced = true;
        return 'long';
      }
    } else {
      this.$state.duration = 0;
    }

    return null;
  }
}