import { Candle } from '../../tables';
import { TrailingStopLoss } from '../helper';
import { Strategy, StrategyConfig } from '../strategy';

export interface TurtleStrategyConfig extends StrategyConfig {
  enterFast: number;
  exitFast: number;
  enterSlow: number;
  exitSlow: number;
  trailingStop: number;
}

enum TradeType {
  OPEN_FLONG = 'OPEN_FLONG',
  OPEN_FSHORT = 'OPEN_FSHORT',
  CLOSE_FAST = 'CLOSE_FAST',
  OPEN_SLONG = 'OPEN_SLONG',
  OPEN_SSHORT = 'OPEN_SSHORT',
  CLOSE_SLOW = 'CLOSE_SLOW',
}

export class TurtleStrategy extends Strategy<TurtleStrategyConfig> {
  $candles: Candle[];
  $stopLoss: TrailingStopLoss;

  constructor(
    name: string,
    config: TurtleStrategyConfig,
  ) {
    super(name, config);

    this.$candles = [];
    this.$stopLoss = new TrailingStopLoss(config.trailingStop);
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
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

    if (this.$stopLoss.isTriggered(price)) {
      this.$stopLoss.destroy();
      return 'short';
    }

    if (status === null) {
      return null;
    }

    if (status === TradeType.OPEN_FLONG || status === TradeType.OPEN_SLONG) {
      this.$stopLoss.create(this.config.trailingStop, price);
      return 'long';
    }
    if (status === TradeType.CLOSE_FAST || status === TradeType.CLOSE_SLOW) {
      this.$stopLoss.destroy();
      return 'short';
    }

    return null;
  }

  calculateBreakOut(count: number) {
    const list = this.$candles.slice(-count);
    const high = Math.max(...list.map(c => c.close));
    const low = Math.min(...list.map(c => c.close));
    return { high, low };
  }

  public serialize(): string {
    return JSON.stringify({
      name: this.name,
      config: this.config,
      candles: this.$candles,
      stopLoss: this.$stopLoss.serialize(),
    });
  }

  public deserialize(data: string): void {
    const obj = JSON.parse(data);

    this.config = obj.config;
    this.$candles = obj.candles;
    this.$stopLoss.deserialize(obj.stopLoss);
  }
}