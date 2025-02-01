import { Candle } from '../tables';
import { Indicator } from './Indicator';
import { Serializable } from './serializable';

export type StrategyConfig = Record<string, number>;

export abstract class Strategy<TConfig extends StrategyConfig> implements Serializable {
  constructor(
    public name: string,
    public config: TConfig,
  ) { }

  $indicators: Indicator[] = [];

  protected addIndicator<T extends Indicator>(indicator: T): T {
    this.$indicators.push(indicator);
    return indicator;
  }

  public async preload(candles: Candle[]): Promise<void> {
    for (const indicator of this.$indicators) {
      for (const candle of candles) {
        indicator.update(candle);
      }
    }
  }

  public async update(candle: Candle): Promise<'long' | 'short' | null> {
    for (const indicator of this.$indicators) {
      indicator.update(candle);
    }

    return null;
  }

  public abstract serialize(): string;

  public abstract deserialize(data: string): void;
}