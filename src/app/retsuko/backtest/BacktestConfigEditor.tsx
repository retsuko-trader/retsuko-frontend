'use client';

import React from 'react';
import type { DatasetGroup } from '@/lib/retsuko/tables';
import type { BacktestConfig } from '@/lib/retsuko/core/backtester';

interface Props {
  datasetGroups: DatasetGroup[];
  strategies: Array<{
    name: string;
    config: Record<string, number>;
  }>;
  runBacktest: (config: BacktestConfig) => void;
}

export function BacktestConfigEditor({ datasetGroups, strategies, runBacktest }: Props) {
  const [config, setConfig] = React.useState<BacktestConfig>({
    datasetGroupId: datasetGroups.length > 0 ? datasetGroups[0].id : -1,
    strategyVariants: [],
    trader: {
      balanceInitial: 1000,
      fee: 0.05,
    },
  });

  const updateConfig = (option: Partial<BacktestConfig>) => {
    setConfig({
      ...config,
      ...option,
    });
  };

  const addStrategy = () => {
    setConfig(x => {
      return {
        ...x,
        strategyVariants: [...x.strategyVariants, {
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
        strategyVariants: x.strategyVariants.map((y, i) => {
          if (i === index) {
            return {
              name,
              config: strategies.find(z => z.name === name)?.config || {},
            }
          }
          return y;
        }),
      }
    });
  };

  const updateStrategyConfig = (index: number, key: string, value: number) => {
    setConfig(x => {
      return {
        ...x,
        strategyVariants: x.strategyVariants.map((y, i) => {
          if (i === index) {
            return {
              ...y,
              config: {
                ...y.config,
                [key]: value,
              }
            };
          }
          return y;
        }),
      };
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
          <select value={config.datasetGroupId} onChange={e => updateConfig({ datasetGroupId: parseInt(e.target.value) })} className='inline-block w-52'>
            {datasetGroups.map(group => {
              return (
                <option key={group.id} value={group.id}>{group.name}</option>
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
              config.strategyVariants.map((strategy, i) => (
                <div key={`strategy-${i}`} className='border-l-2 border-h-yellow/80 mt-1 pl-2'>

                  <select value={strategy.name} onChange={e => selectStrategy(i, e.target.value)} className='inline-block w-52'>
                    {strategies.map(entry => (
                      <option key={entry.name} value={entry.name}>{entry.name}</option>
                    ))}
                  </select>

                  <div className='mt-1 pl-2'>
                    {
                      Object.entries(strategy.config).map(([key, value]) => (
                        <div key={key}>
                          <label className='w-28 inline-block pr-2'>
                            {key}:
                          </label>
                          <input
                            type='number'
                            value={value}
                            onChange={e => updateStrategyConfig(i, key, e.target.valueAsNumber)}
                            className='inline-block w-36'
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