'use client';

import moment from 'moment';
import React from 'react';
import classNames from 'classnames';
import { StrategyEntry } from '@/lib/retsuko/interfaces/Strategy';
import { BacktestConfig, DatasetConfig, StrategyConfig } from '@/lib/retsuko/interfaces/BacktestConfig';
import { Dataset } from '@/lib/retsuko/interfaces/Dataset';

interface Props {
  datasets: Dataset[];
  strategies: StrategyEntry[];
  runBacktest: (configs: BacktestConfig[]) => void;
}

type Config = Omit<BacktestConfig, 'strategy'>;

export function SingleBacktestConfigEditor({ datasets, strategies: entries, runBacktest }: Props) {
  const [config, setConfig] = React.useState<Config>({
    dataset: {
      market: datasets[0].market,
      symbolId: datasets[0].symbolId,
      interval: datasets[0].interval,
      start: datasets[0].start,
      end: datasets[0].end,
    },
    broker: {
      initialBalance: 1000,
      fee: 0.001,
      enableMargin: false,
      validTradeOnly: true,
    },
  });

  const [strategies, setStrategies] = React.useState<StrategyConfig[]>([
    {
      name: entries[0].name,
      config: entries[0].config,
    },
  ]);

  const updateConfig = (option: Partial<Config>) => {
    setConfig({
      ...config,
      ...option,
    });
  };

  const selectDataset = (alias: string) => {
    const dataset = datasets.find(x => DatasetConfig.alias(x) === alias);
    if (!dataset) {
      return;
    }

    if (DatasetConfig.alias(config.dataset) === alias) {
      return;
    }

    updateConfig({
      dataset: {
        market: dataset.market,
        symbolId: dataset.symbolId,
        interval: dataset.interval,
        start: new Date(Math.max(new Date(config.dataset.start).getTime(), new Date(dataset.start).getTime())).toISOString(),
        end: new Date(Math.min(new Date(config.dataset.end).getTime(), new Date(dataset.end).getTime())).toISOString(),
      },
    });
  };

  const updateDatasetDate = (options: { start?: string; end?: string }) => {
    updateConfig({
      dataset: {
        ...config.dataset,
        ...options,
      }
    });
  };

  const addStrategy = () => {
    setStrategies([
      ...strategies,
      {
        name: entries[0].name,
        config: entries[0].config,
      }
    ]);
  };

  const removeStrategy = (index: number) => {
    setStrategies(xs => xs.filter((_, i) => i !== index));
  }

  const selectStrategy = (index: number, name: string) => {
    const entry = entries.find(x => x.name === name);
    if (!entry) {
      return;
    }

    setStrategies(xs => {
      if (xs[index].name === name) {
        return xs;
      }

      return xs.map((x, i) => {
        if (i === index) {
          return {
            name,
            config: entry.config,
          };
      }
        return x;
      })
    });
  };

  const updateStrategyConfig = (index: number, name: string, value: number | boolean) => {
    setStrategies(xs => xs.map((x, i) => {
      if (i === index) {
        return {
          ...x,
          config: JSON.stringify({
            ...JSON.parse(x.config),
            [name]: value,
          }),
        };
      }
      return x;
    }));
  };

  return (
    <div>
      <p>Backtest Config</p>

      <div className='mt-4 font-mono flex flex-col gap-y-6'>
        <div>
          <label className='w-20 inline-block'>
            datasets:
          </label>
          <select value={DatasetConfig.alias(config.dataset)} onChange={e => selectDataset(e.target.value)} className='inline-block w-52'>
            {datasets.map(dataset => {
              const key = DatasetConfig.alias(dataset);
              return (
                <option key={key} value={key}>{key}</option>
              )
            })}
          </select>

          <div className='border-l-2 border-h-yellow/80 mt-1 pl-2'>
            <div>
              <label className='w-32 inline-block pr-2'>
                start:
              </label>
              <input
                type='date'
                value={moment(config.dataset.start).format('YYYY-MM-DD')}
                onChange={e => updateDatasetDate({ start: new Date(e.target.value).toISOString() })}
                className='inline-block w-36'
              />
            </div>

            <div>
              <label className='w-32 inline-block pr-2'>
                end:
              </label>
              <input
                type='date'
                value={moment(config.dataset.end).format('YYYY-MM-DD')}
                onChange={e => updateDatasetDate({ end: new Date(e.target.value).toISOString() })}
                className='inline-block w-36'
              />
            </div>
          </div>
        </div>

        <div>
          <label className='w-20 inline-block'>
            strategy:
          </label>
          <div className='flex flex-col gap-2'>
            {
              strategies.map((strategy, i) => (
                <div key={i} className='border-l-2 border-h-yellow/80 mt-1 pl-2'>
                  <div className='flex flex-row justify-between'>

                    <select value={strategy.name} onChange={e => selectStrategy(i, e.target.value)} className='inline-block w-52'>
                      {entries.map(entry => (
                        <option key={entry.name} value={entry.name}>{entry.name}</option>
                      ))}
                    </select>

                    <button onClick={() => removeStrategy(i)} className='mr-2 font-bold text-h-red/60 hover:text-h-red/80'>
                      X
                    </button>
                  </div>

                  {
                    Object.entries(JSON.parse(strategy.config)).map(([key, value]) => typeof value === 'number' ? (
                      <div key={key}>
                        <label className='w-48 inline-block pr-2'>
                          {key}:
                        </label>
                        <input
                          type='number'
                          value={value}
                          onChange={e => updateStrategyConfig(i, key, e.target.valueAsNumber)}
                          className='inline-block w-32'
                        />
                      </div>
                    ) : (
                      <div key={key}>
                        <label className='w-48 inline-block pr-2'>
                          {key}:
                        </label>
                        <input
                          type='checkbox'
                          checked={value as boolean}
                          onChange={e => updateStrategyConfig(i, key, e.target.checked)}
                          className='inline-block w-32'
                        />
                      </div>
                    ))
                  }
                </div>
              ))
            }

            <button onClick={addStrategy} className='w-full px-4 py-0.5 bg-h-yellow/60 hover:bg-h-yellow/40'>
              add strategy
            </button>
          </div>

        </div>

        <div>
          <label className='w-20 inline-block'>
            trader
          </label>

          <div className='border-l-2 border-h-yellow/80 mt-1 pl-2'>
            <div>
              <label className='w-48 inline-block pr-2'>
                balance:
              </label>
              <input
                type='number'
                value={config.broker.initialBalance}
                onChange={e => updateConfig({ broker: { ...config.broker, initialBalance: e.target.valueAsNumber } })}
                className='inline-block w-32'
              />
            </div>

            <div>
              <label className='w-48 inline-block pr-2'>
                fee:
              </label>
              <input
                type='number'
                value={config.broker.fee}
                onChange={e => updateConfig({ broker: { ...config.broker, fee: e.target.valueAsNumber } })}
                className='inline-block w-32'
              />
            </div>

            <div>
              <label className='w-48 inline-block pr-2'>
                enable margin:
              </label>
              <input
                type='checkbox'
                checked={config.broker.enableMargin}
                onChange={e => updateConfig({ broker: { ...config.broker, enableMargin: e.target.checked } })}
                className='inline-block w-32'
              />
            </div>

            <div>
              <label className={classNames('w-48 inline-block pr-2')}>
                valid trade only:
              </label>
              <input
                type='checkbox'
                checked={config.broker.validTradeOnly}
                onChange={e => updateConfig({ broker: { ...config.broker, validTradeOnly: e.target.checked } })}
                className='inline-block w-32'
              />
            </div>
          </div>
        </div>

        <div className='flex'>
          <button
            onClick={() => runBacktest(strategies.map(strategy => ({
              ...config,
              strategy,
            })))}
            className='w-32 px-4 py-2 bg-h-green/80 hover:bg-h-green/60'
          >
            Run
          </button>
        </div>

      </div>
    </div>
  )
}
