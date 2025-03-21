'use client';

import React from 'react';
import classNames from 'classnames';
import { StrategyEntry } from '@/lib/retsuko/interfaces/Strategy';
import { Dataset } from '@/lib/retsuko/interfaces/Dataset';
import { BulkBacktestConfig, DatasetConfig } from '@/lib/retsuko/interfaces/BacktestConfig';
import { Symbol } from '@/lib/retsuko/interfaces/Symbol';

interface Props {
  datasets: Dataset[];
  symbols: Symbol[];
  strategies: StrategyEntry[];
  runBacktest: (config: BulkBacktestConfig) => void;
}

export function BacktestConfigEditor({ datasets, strategies, runBacktest }: Props) {
  const [config, setConfig] = React.useState<BulkBacktestConfig>({
    name: '',
    description: '',
    datasets: [
      datasets[0],
    ],
    strategies: [],
    broker: {
      initialBalance: 1000,
      fee: 0.001,
      enableMargin: false,
      validTradeOnly: true,
    },
  });

  const updateConfig = (option: Partial<BulkBacktestConfig>) => {
    setConfig({
      ...config,
      ...option,
    });
  };

  const addStrategy = () => {
    setConfig(x => {
      return {
        ...x,
        strategies: [...x.strategies, {
          name: strategies[0].name,
          config: strategies[0].config,
        }]
      }
    })
  };

  const selectStrategy = (index: number, name: string) => {
    setConfig(x => {
      return {
        ...x,
        strategies: x.strategies.map((y, i) => {
          if (i === index) {
            return {
              name,
              config: strategies.find(z => z.name === name)?.config || '{}',
            }
          }
          return y;
        }),
      }
    });
  };

  const updateStrategyConfig = (index: number, key: string, value: number | boolean) => {
    setConfig(x => {
      return {
        ...x,
        strategies: x.strategies.map((y, i) => {
          if (i === index) {
            return {
              ...y,
              config: JSON.stringify({
                ...JSON.parse(y.config),
                [key]: value,
              }),
            };
          }
          return y;
        }),
      };
    });
  };

  const removeStrategy = (index: number) => {
    setConfig(x => {
      return {
        ...x,
        strategies: x.strategies.filter((_, i) => i !== index),
      };
    });
  };

  return (
    <div>
      <p>Backtest Config</p>

      <div className='font-mono flex flex-col gap-y-6'>
        <div className='mt-4'>
          <label className='w-20 inline-block'>
            datasets:
          </label>
          <select value={DatasetConfig.alias(config.datasets[0])} onChange={e => updateConfig({ datasets: [datasets.find(x => DatasetConfig.alias(x) === e.target.value)!] })} className='inline-block w-52'>
            {datasets.map(dataset => {
              var alias = DatasetConfig.alias(dataset);
              return (
                <option key={alias} value={alias}>{alias}</option>
              )
            })}
          </select>
        </div>

        <div>
          <label className='w-20'>
            strategy
          </label>
          <div className='flex flex-col gap-2'>
            {
              config.strategies.map((strategy, i) => (
                <div key={`strategy-${i}`} className='border-l-2 border-h-yellow/80 mt-1 pl-2'>

                  <div className='flex flex-row justify-between'>

                  <select value={strategy.name} onChange={e => selectStrategy(i, e.target.value)} className='inline-block w-52'>
                    {strategies.map(entry => (
                      <option key={entry.name} value={entry.name}>{entry.name}</option>
                    ))}
                  </select>

                    <button onClick={() => removeStrategy(i)} className='mr-2 font-bold text-h-red/60 hover:text-h-red/80'>
                      X
                    </button>
                  </div>
                  <div className='mt-1 pl-2'>
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
                </div>
              ))
            }

            <button onClick={addStrategy} className='w-full px-4 py-0.5 bg-h-yellow/60 hover:bg-h-yellow/40'>
              add dataset
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

        <div className=''>
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
