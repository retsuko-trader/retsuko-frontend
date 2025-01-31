'use client';

import moment from 'moment';
import React from 'react';
import type { SingleBacktestConfig } from '@/lib/retsuko/core/singleBacktester';
import { getDatasetAlias } from '@/lib/retsuko/core/dataset';
import type { Dataset } from '@/lib/retsuko/repository/dataset';
import classNames from 'classnames';

interface Props {
  datasets: Dataset[];
  entries: Array<{
    name: string;
    config: Record<string, number>;
  }>;
  runBacktest: (configs: SingleBacktestConfig[]) => void;
}

type Config = Omit<SingleBacktestConfig, 'strategy'>;
type Strategy = SingleBacktestConfig['strategy'];

export function SingleBacktestConfigEditor({ datasets, entries, runBacktest }: Props) {
  const [config, setConfig] = React.useState<Config>({
    dataset: {
      alias: getDatasetAlias(datasets[0]),
      start: datasets[0].start,
      end: datasets[0].end,
    },
    trader: {
      initialBalance: 1000,
      fee: 0.001,
      enableMargin: false,
      marginTradeAllWhenDirectionChanged: true,
      validTradeOnly: true,
    },
  });

  const [strategies, setStrategies] = React.useState<Strategy[]>([
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
    const dataset = datasets.find(x => getDatasetAlias(x) === alias);
    if (!dataset) {
      return;
    }

    if (config.dataset.alias === alias) {
      return;
    }

    updateConfig({
      dataset: {
        alias,
        start: new Date(Math.max(config.dataset.start.getTime(), dataset.start.getTime())),
        end: new Date(Math.min(config.dataset.end.getTime(), dataset.end.getTime())),
      },
    });
  };

  const updateDatasetDate = (options: { start?: Date; end?: Date }) => {
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

  const updateStrategyConfig = (index: number, name: string, value: number) => {
    setStrategies(xs => xs.map((x, i) => {
      if (i === index) {
        return {
          ...x,
          config: {
            ...x.config,
            [name]: value,
          }
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
          <select value={config.dataset.alias} onChange={e => selectDataset(e.target.value)} className='inline-block w-52'>
            {datasets.map(dataset => {
              const key = getDatasetAlias(dataset);
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
                onChange={e => updateDatasetDate({ start: new Date(e.target.value) })}
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
                onChange={e => updateDatasetDate({ end: new Date(e.target.value) })}
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
                    Object.entries(strategy.config).map(([key, value]) => (
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
                value={config.trader.initialBalance}
                onChange={e => updateConfig({ trader: { ...config.trader, initialBalance: e.target.valueAsNumber } })}
                className='inline-block w-32'
              />
            </div>

            <div>
              <label className='w-48 inline-block pr-2'>
                fee:
              </label>
              <input
                type='number'
                value={config.trader.fee}
                onChange={e => updateConfig({ trader: { ...config.trader, fee: e.target.valueAsNumber } })}
                className='inline-block w-32'
              />
            </div>

            <div>
              <label className='w-48 inline-block pr-2'>
                enable margin:
              </label>
              <input
                type='checkbox'
                checked={config.trader.enableMargin}
                onChange={e => updateConfig({ trader: { ...config.trader, enableMargin: e.target.checked } })}
                className='inline-block w-32'
              />
            </div>

            <div>
              <label className={classNames('w-48 inline-block pr-2', {
                'text-h-text/40': !config.trader.enableMargin,
                'text-h-text/80': config.trader.enableMargin,
              })}>
                margin trade all:
              </label>
              <input
                type='checkbox'
                disabled={!config.trader.enableMargin}
                checked={config.trader.marginTradeAllWhenDirectionChanged}
                onChange={e => updateConfig({ trader: { ...config.trader, marginTradeAllWhenDirectionChanged: e.target.checked } })}
                className='inline-block w-32'
              />
            </div>

            <div>
              <label className={classNames('w-48 inline-block pr-2')}>
                valid trade only:
              </label>
              <input
                type='checkbox'
                checked={config.trader.validTradeOnly}
                onChange={e => updateConfig({ trader: { ...config.trader, validTradeOnly: e.target.checked } })}
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