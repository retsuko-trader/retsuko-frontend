import { Candle } from '../tables';
import { DebugIndicator } from './DebugIndicator';
import { Indicator } from './Indicator';
import { Serializable } from './serializable';
import { Signal } from './Signal';

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

  public async update(candle: Candle): Promise<Signal | null> {
    for (const indicator of this.$indicators) {
      indicator.update(candle);
    }

    return null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async debug(candle: Candle): Promise<DebugIndicator[]> {
    return [];
  }

  public abstract serialize(): string;

  public abstract deserialize(data: string): void;
}