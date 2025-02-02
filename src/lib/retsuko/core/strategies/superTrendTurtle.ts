import { Candle } from '../../tables';
import { DebugIndicator } from '../DebugIndicator';
import { Signal, SignalKind, SignalWithConfidence } from '../Signal';
import { Strategy, StrategyConfig } from '../strategy';
import { SuperTrendStrategy } from './superTrend';
import { TurtleRegimeStrategy } from './turtleRegime';

export interface SuperTrendTurtleStrategyConfig extends StrategyConfig {
  atrPeriod: number;
  bandFactor: number;
  trailingStop: number;

  enterFast: number;
  exitFast: number;
  enterSlow: number;
  exitSlow: number;
  bullPeriod: number;
}

export class SuperTrendTurtleStrategy extends Strategy<SuperTrendTurtleStrategyConfig> {
  $superTrend: SuperTrendStrategy;
  $turtle: TurtleRegimeStrategy;

  $superTrendDirection: SignalWithConfidence | null = null;
  $turtleDirection: SignalWithConfidence | null = null;

  constructor(
    name: string,
    config: SuperTrendTurtleStrategyConfig,
  ) {
    super(name, config);

    this.$superTrend = new SuperTrendStrategy('superTrend', {
      atrPeriod: config.atrPeriod,
      bandFactor: config.bandFactor,
      trailingStop: config.trailingStop,
    });
    this.$turtle = new TurtleRegimeStrategy('turtle', {
      enterFast: config.enterFast,
      exitFast: config.exitFast,
      enterSlow: config.enterSlow,
      exitSlow: config.exitSlow,
      bullPeriod: config.bullPeriod,
    });
  }

  public async preload(candles: Candle[]): Promise<void> {
    await super.preload(candles);
    await this.$superTrend.preload(candles);
    await this.$turtle.preload(candles);
  }

  public async update(candle: Candle): Promise<Signal | null> {
    const superTrend = await this.$superTrend.update(candle);
    const poincare = await this.$turtle.update(candle);

    if (superTrend) {
      this.$superTrendDirection = Signal.format(superTrend);
    }
    if (poincare) {
      this.$turtleDirection = Signal.format(poincare);
    }

    if (!this.$superTrendDirection || !this.$turtleDirection) {
      return null;
    }

    if (this.$superTrendDirection.action === 'long' && this.$turtleDirection.action === 'long') {
      return this.$superTrendDirection;
    }

    const sells = ['closeLong', 'short'];
    if (sells.includes(this.$superTrendDirection.action) && sells.includes(this.$turtleDirection.action)) {
      return this.$superTrendDirection;
    }

    return null;
  }

  async debug(candle: Candle): Promise<DebugIndicator[]> {
    return [
      ...await this.$superTrend.debug(candle),
      ...await this.$turtle.debug(candle),
    ];
  }

  public serialize(): string {
    return JSON.stringify({
      superTrend: this.$superTrend.serialize(),
      turtle: this.$turtle.serialize(),
      superTrendDirection: this.$superTrendDirection,
      turtleDirection: this.$turtleDirection,
    });
  }

  public deserialize(data: string): void {
    const { superTrend, turtle, superTrendDirection, turtleDirection } = JSON.parse(data);
    this.$superTrend.deserialize(superTrend);
    this.$turtle.deserialize(turtle);
    this.$superTrendDirection = typeof superTrendDirection === 'string' ? Signal.format(superTrendDirection as SignalKind) : superTrendDirection;
    this.$turtleDirection = typeof turtleDirection === 'string' ? Signal.format(turtleDirection as SignalKind) : turtleDirection;
  }
}