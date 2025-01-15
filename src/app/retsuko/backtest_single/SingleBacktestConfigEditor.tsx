'use client';

import moment from 'moment';
import React from 'react';
import type { SingleBacktestConfig } from '@/lib/retsuko/core/singleBacktester';
import { getDatasetAlias } from '@/lib/retsuko/core/dataset';
import type { Dataset } from '@/lib/retsuko/repository/dataset';

interface Props {
  datasets: Dataset[];
  entries: Array<{
    name: string;
    config: Record<string, number>;
  }>;
  runBacktest: (config: SingleBacktestConfig) => void;
}

export function SingleBacktestConfigEditor({ datasets, entries, runBacktest }: Props) {
  const [config, setConfig] = React.useState<SingleBacktestConfig>({
    dataset: {
      alias: getDatasetAlias(datasets[0]),
      start: datasets[0].start,
      end: datasets[0].end,
    },
    strategy: {
      name: entries[0].name,
      config: entries[0].config,
    },
    trader: {
      balanceInitial: 1000,
      fee: 0.001,
    },
  });

  const updateConfig = (option: Partial<SingleBacktestConfig>) => {
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

  const selectStrategy = (name: string) => {
    const entry = entries.find(x => x.name === name);
    if (!entry) {
      return;
    }

    if (entry.name === config.strategy.name) {
      return;
    }

    updateConfig({
      strategy: {
        name,
        config: entry.config,
      }
    });
  };

  const updateStrategyConfig = (name: string, value: number) => {
    updateConfig({
      strategy: {
        name: config.strategy.name,
        config: {
          ...config.strategy.config,
          [name]: value,
        }
      }
    });
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
              <label className='w-28 inline-block pr-2'>
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
              <label className='w-28 inline-block pr-2'>
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
          <select value={config.strategy.name} onChange={e => selectStrategy(e.target.value)} className='inline-block w-52'>
            {entries.map(entry => (
              <option key={entry.name} value={entry.name}>{entry.name}</option>
            ))}
          </select>

          <div className='border-l-2 border-h-yellow/80 mt-1 pl-2'>
            {
              Object.entries(config.strategy.config).map(([key, value]) => (
                <div key={key}>
                  <label className='w-28 inline-block pr-2'>
                    {key}:
                  </label>
                  <input
                    type='number'
                    value={value}
                    onChange={e => updateStrategyConfig(key, e.target.valueAsNumber)}
                    className='inline-block w-36'
                  />
                </div>
              ))
            }
          </div>
        </div>

        <div>
          <label className='w-20 inline-block'>
            trader
          </label>

          <div className='border-l-2 border-h-yellow/80 mt-1 pl-2'>
            <div>
              <label className='w-28 inline-block pr-2'>
                balance:
              </label>
              <input
                type='number'
                value={config.trader.balanceInitial}
                onChange={e => updateConfig({ trader: { ...config.trader, balanceInitial: e.target.valueAsNumber } })}
                className='inline-block w-36'
              />
            </div>

            <div>
              <label className='w-28 inline-block pr-2'>
                fee:
              </label>
              <input
                type='number'
                value={config.trader.fee}
                onChange={e => updateConfig({ trader: { ...config.trader, fee: e.target.valueAsNumber } })}
                className='inline-block w-36'
              />
            </div>
          </div>
        </div>

        <div className='flex'>
          <button
            onClick={() => runBacktest(config)}
            className='w-32 px-4 py-2 bg-h-green/80 hover:bg-h-green/60'
          >
            Run
          </button>
        </div>

      </div>
    </div>
  )
}