import { Candle } from '../../tables';
import { DebugIndicator } from '../DebugIndicator';
import { SMA } from '../indicators';
import { Signal } from '../Signal';
import { Strategy, StrategyConfig } from '../strategy';

export interface TurtleRegimeStrategyConfig extends StrategyConfig {
  enterFast: number;
  exitFast: number;
  enterSlow: number;
  exitSlow: number;
  bullPeriod: number;
}

enum TradeType {
  OPEN_FLONG = 'OPEN_FLONG',
  OPEN_FSHORT = 'OPEN_FSHORT',
  CLOSE_FAST = 'CLOSE_FAST',
  OPEN_SLONG = 'OPEN_SLONG',
  OPEN_SSHORT = 'OPEN_SSHORT',
  CLOSE_SLOW = 'CLOSE_SLOW',
}

export class TurtleRegimeStrategy extends Strategy<TurtleRegimeStrategyConfig> {
  $candles: Candle[];
  $sma: SMA;

  constructor(
    name: string,
    config: TurtleRegimeStrategyConfig,
  ) {
    super(name, config);

    this.$candles = [];
    this.$sma = this.addIndicator(new SMA('sma', config.bullPeriod));
  }

  async preload(candles: Candle[]): Promise<void> {
    await super.preload(candles);

    for (const candle of candles) {
      this.updateInner(candle);
    }
  }

  public async update(candle: Candle): Promise<Signal | null> {
    const status = this.updateInner(candle);

    if (status === null) {
      return null;
    }

    if (!this.$sma.ready) {
      return null;
    }

    if (candle.close < this.$sma.value) {
      return 'closeLong';
    }

    if (status === TradeType.OPEN_FLONG || status === TradeType.OPEN_SLONG) {
      return 'long';
    }
    if (status === TradeType.CLOSE_FAST || status === TradeType.CLOSE_SLOW) {
      return 'closeLong';
    }

    return null;
  }

  updateInner(candle: Candle): TradeType | null {
    super.update(candle);
    this.$candles.push(candle);

    const price = candle.close;
    let status: TradeType | null = null;

    const maxCandlesLength = Math.max(
      this.config.enterFast,
      this.config.exitFast,
      this.config.enterSlow,
      this.config.exitSlow,
    ) + 1;
    if (this.$candles.length > maxCandlesLength) {
      this.$candles.shift();
    }

    if (this.$candles.length > this.config.enterFast) {
      const { high } = this.calculateBreakOut(this.config.enterFast);
      if (high === price) {
        status = TradeType.OPEN_FLONG;
      }
    }

    if (this.$candles.length > this.config.exitFast) {
      const { low } = this.calculateBreakOut(this.config.exitFast);
      if (low === price) {
        status = TradeType.CLOSE_FAST;
      }
    }

    if (this.$candles.length > this.config.enterSlow) {
      const { high } = this.calculateBreakOut(this.config.enterSlow);
      if (high === price) {
        status = TradeType.OPEN_SLONG;
      }
    }

    if (this.$candles.length > this.config.exitSlow) {
      const { low } = this.calculateBreakOut(this.config.exitSlow);
      if (low === price) {
        status = TradeType.CLOSE_SLOW;
      }
    }

    return status;
  }

  calculateBreakOut(count: number) {
    const list = this.$candles.slice(-count);
    const high = Math.max(...list.map(c => c.close));
    const low = Math.min(...list.map(c => c.close));
    return { high, low };
  }

  public async debug(_candle: Candle): Promise<DebugIndicator[]> {
    return [
      {
        name: 'sma',
        index: 2,
        value: this.$sma.value,
      },
      {
        name: 'enterFast',
        index: 2,
        value: this.calculateBreakOut(this.config.enterFast).high,
      },
      {
        name: 'exitFast',
        index: 2,
        value: this.calculateBreakOut(this.config.exitFast).low,
      },
      {
        name: 'enterSlow',
        index: 2,
        value: this.calculateBreakOut(this.config.enterSlow).high,
      },
      {
        name: 'exitSlow',
        index: 2,
        value: this.calculateBreakOut(this.config.exitSlow).low,
      },
    ];
  }

  public serialize(): string {
    return JSON.stringify({
      name: this.name,
      config: this.config,
      candles: this.$candles,
      sma: this.$sma.serialize(),
    });
  }

  public deserialize(data: string): void {
    const obj = JSON.parse(data);

    this.config = obj.config;
    this.$candles = obj.candles;
    this.$sma.deserialize(obj.sma);
  }
}