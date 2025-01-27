import { Candle } from '../../tables';
import { Strategy, StrategyConfig } from '../strategy';

export interface MinMaxStrategyConfig extends StrategyConfig {
  window: number;
}

export class MinMaxStrategy extends Strategy<MinMaxStrategyConfig> {
  $prices: number[] = [];
  $age: number = 0;
  $bought: boolean = false;

  constructor(
    name: string,
    config: MinMaxStrategyConfig,
  ) {
    super(name, config);
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
    super.update(candle);

    const price = candle.close;

    this.$prices.push(price);
    this.$age += 1;

    if (this.$age < this.config.window) {
      return null;
    }

    if (this.$prices.length > this.config.window) {
      this.$prices.shift();
    }

    const highest = Math.max(...this.$prices);
    const lowest = Math.min(...this.$prices);

    if (price === highest || price === lowest) {
      if (!this.$bought) {
        this.$bought = true;
        return 'long';
      }
    } else if (this.$bought) {
      this.$bought = false;
      return 'short';
    }

    return null;
  }

  public serialize(): string {
    return JSON.stringify({
      bought: this.$bought,
    });
  }

  public deserialize(data: string): void {
    const { bought } = JSON.parse(data);
    this.$bought = bought;
  }
}