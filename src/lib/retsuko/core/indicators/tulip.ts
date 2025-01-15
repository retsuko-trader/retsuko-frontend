import tulind, { IndicatorIndentifier } from 'tulind';
import { Indicator } from '../Indicator';
import { Candle } from '../../tables';

type IndicatorInput = (
  | 'open'
  | 'high'
  | 'low'
  | 'close'
  | 'volume'
);

export class TulipIndicator implements Indicator {
  public value = 0;
  public ready = false;

  public values: number[] = [];
  public valuesFull: number[][] = [];

  constructor(
    public name: string,
    private indicator: tulind.Indicator,
    private inputs: IndicatorInput[],
    private options: number[],
    private windowLength: number,
    private readyWhen: number,
  ) {
    this.$inputTable = new Array(inputs.length).fill(0).map(() => []);
  }

  $inputTable: number[][];
  $age = 0;

  public update(candle: Candle): void {
    if (!this.ready) {
      if (this.$age >= this.readyWhen - 1) {
        this.ready = true;
      }
    }

    for (const [i, input] of this.inputs.entries()) {
      this.$inputTable[i].push(candle[input]);
    }

    if (this.$age >= this.windowLength) {
      for (const inputTable of this.$inputTable) {
        inputTable.shift();
      }
    }

    this.indicator.indicator(this.$inputTable, this.options, (err, results) => {
      this.value = results[0][results.length - 1];
      this.values = results.map(x => x[x.length - 1]);
      this.valuesFull = results;
    });

    this.$age += 1;
  }

  serialize(): string {
    return JSON.stringify({
      name: this.name,
      indicator: this.indicator.name,
      inputs: this.inputs,
      options: this.options,
      windowLength: this.windowLength,
      readyWhen: this.readyWhen,
      value: this.value,
      ready: this.ready,
      values: this.values,
      valuesFull: this.valuesFull,
      inputTable: this.$inputTable,
      age: this.$age,
    });
  }

  deserialize(data: string): void {
    const parsed = JSON.parse(data);
    this.name = parsed.name;
    this.indicator = tulind.indicators[parsed.indicator as IndicatorIndentifier];
    this.inputs = parsed.inputs;
    this.options = parsed.options;
    this.windowLength = parsed.windowLength;
    this.readyWhen = parsed.readyWhen
    this.value = parsed.value;
    this.ready = parsed.ready;
    this.values = parsed.values;
    this.valuesFull = parsed.valuesFull;
    this.$inputTable = parsed.inputTable;
    this.$age = parsed.age;
  }
}


// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Tulip {
  export const ADX = (name: string, period: number) => new TulipIndicator(
    name,
    tulind.indicators.dx,
    ['high', 'low', 'close'],
    [period],
    period,
    period,
  );

  export const BBANDS = (name: string, period: number, stddev: number) => new TulipIndicator(
    name,
    tulind.indicators.bbands,
    ['close'],
    [period, stddev],
    period,
    period,
  );

  export const DX = (name: string, period: number) => new TulipIndicator(
    name,
    tulind.indicators.adx,
    ['high', 'low', 'close'],
    [period],
    period,
    period,
  );

  export const RSI = (name: string, period: number) => new TulipIndicator(
    name,
    tulind.indicators.rsi,
    ['close'],
    [period],
    period,
    period,
  );
}