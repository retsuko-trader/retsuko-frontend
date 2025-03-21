'use client';

import { EditableText } from '@/components/EditableText';
import React from 'react';
import classNames from 'classnames';
import { redirect } from 'next/navigation';
import { StrategyEntry } from '@/lib/retsuko/interfaces/Strategy';
import { PapertraderConfig } from '@/lib/retsuko/interfaces/PapertraderConfig';
import { Market } from '@/lib/retsuko/interfaces/Dataset';
import { Intervals } from '@/lib/helper/interval';
import { Symbol } from '@/lib/retsuko/interfaces/Symbol';

interface Props {
  symbols: Symbol[];
  strategies: StrategyEntry[];
}

export function PapertradeConfigEditor({ symbols, strategies }: Props) {
  const [config, setConfig] = React.useState<PapertraderConfig>({
    info: {
      name: '',
      description: '',
    },
    dataset: {
      market: Market.futures,
      symbolId: 0,
      interval: 60,
      preloadCount: 0,
    },
    strategy: {
      name: strategies[0].name,
      config: strategies[0].config,
    },
    broker: {
      initialBalance: 1000,
      fee: 0.001,
      enableMargin: false,
      validTradeOnly: false,
    },
  });

  const updateConfig = (option: Partial<PapertraderConfig>) => {
    setConfig({
      ...config,
      ...option,
    });
  };

  const selectStrategy = (name: string) => {
    const entry = strategies.find(x => x.name === name);
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

  const updateStrategyConfig = (name: string, value: number | boolean) => {
    updateConfig({
      strategy: {
        name: config.strategy.name,
        config: JSON.stringify({
          ...JSON.parse(config.strategy.config),
          [name]: value,
        }),
      }
    });
  };

  const create = async () => {
    // await createTrader(config);
    redirect('/retsuko/papertrade');
  };

  return (
    <div className='h-full overflow-y-auto'>
      <p>
        Papertrade Config
      </p>
      <div className='mt-4 font-mono flex flex-col gap-y-6'>
        <div>
          <div>
            <label className='mr-2'>name:</label>
            <EditableText
              text={config.info.name}
              placeHolder='Name'
              setText={name => updateConfig({ info: { ...config.info, name } })}
              className='inline'
            />
          </div>
          <div>
            <label>description:</label>
            <EditableText
              text={config.info.description}
              placeHolder='Description'
              setText={description => updateConfig({ info: { ...config.info, description } })}
              className='block pl-2 border-l-2 border-h-yellow/80 w-full break-words'
            />
          </div>
        </div>

        <div>
          <label>
            market:
          </label>

          <div className='border-l-2 border-h-yellow/80 mt-1 pl-2'>
            <div>
              <label className='inline-block w-24'>Symbol</label>
              <input
                type='text'
                value={config.dataset.symbolId}
                onChange={e => updateConfig({ dataset: { ...config.dataset, symbolId: symbols.find(x => x.name === e.target.value)!.id } })}
                className='inline-block w-44'
              />
            </div>
            <div>
              <label className='inline-block w-24'>Interval</label>
              <select
                value={config.dataset.interval}
                onChange={e => updateConfig({ dataset: { ...config.dataset, interval: parseInt(e.target.value) } })}
              >
                {
                  Object.entries(Intervals).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))
                }
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className='inline-block w-20'>strategy:</label>
          <select
            value={config.strategy.name}
            onChange={e => selectStrategy(e.target.value)}
            className='w-52'
          >
            {strategies.map(x => (
              <option key={x.name} value={x.name}>{x.name}</option>
            ))}
          </select>

          <div className='border-l-2 border-h-yellow/80 mt-1 pl-2'>
            {
              Object.entries(JSON.parse(config.strategy.config)).map(([key, value]) => typeof value === 'number' ? (
                <div key={key}>
                  <label className='w-48 inline-block pr-2'>
                    {key}:
                  </label>
                  <input
                    type='number'
                    value={value}
                    onChange={e => updateStrategyConfig(key, e.target.valueAsNumber)}
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
                    onChange={e => updateStrategyConfig(key, e.target.checked)}
                    className='inline-block w-32'
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
              <label className={classNames('w-48 inline-block pr-2', {
                'text-h-text/40': config.broker.enableMargin,
                'text-h-text/80': !config.broker.enableMargin,
              })}>
                valid trade only:
              </label>
              <input
                type='checkbox'
                disabled={config.broker.enableMargin}
                checked={config.broker.validTradeOnly}
                onChange={e => updateConfig({ broker: { ...config.broker, validTradeOnly: e.target.checked } })}
                className='inline-block w-32'
              />
            </div>

          </div>
        </div>

        <div>
          <button onClick={create} className='w-full px-4 py-0.5 bg-h-yellow/60 hover:bg-h-yellow/40'>
            create
          </button>
        </div>
      </div>
    </div>
  );
}
