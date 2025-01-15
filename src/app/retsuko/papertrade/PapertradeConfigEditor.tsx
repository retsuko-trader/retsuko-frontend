'use client';

import { EditableText } from '@/components/EditableText';
import { BinanceInterval } from '@/lib/retsuko/binance';
import { CreateMarketPaperTraderConfig } from '@/lib/retsuko/core/marketPaperTrader';
import React from 'react';
import { createTrader } from './action';

interface Props {
  strategies: Array<{
    name: string;
    config: Record<string, number>;
  }>;
}

export function PapertradeConfigEditor({ strategies }: Props) {
  const [config, setConfig] = React.useState<CreateMarketPaperTraderConfig>({
    name: '',
    description: '',
    input: {
      market: 'futures',
      symbol: 'BTCUSDT',
      interval: '1h',
    },
    strategy: {
      name: strategies[0].name,
      config: strategies[0].config,
    },
    trader: {
      balanceInitial: 1000,
      fee: 0.001,
    },
  });

  const updateConfig = (option: Partial<CreateMarketPaperTraderConfig>) => {
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

  const create = async () => {
    await createTrader(config);
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
              text={config.name}
              placeHolder='Name'
              setText={name => updateConfig({ name })}
              className='inline'
            />
          </div>
          <div>
            <label>description:</label>
            <EditableText
              text={config.description}
              placeHolder='Description'
              setText={description => updateConfig({ description })}
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
                value={config.input.symbol}
                onChange={e => updateConfig({ input: { ...config.input, symbol: e.target.value } })}
                className='inline-block w-44'
              />
            </div>
            <div>
              <label className='inline-block w-24'>Interval</label>
              <select
                value={config.input.interval}
                onChange={e => updateConfig({ input: { ...config.input, interval: e.target.value as BinanceInterval } })}
              >
                <option value='1m'>1m</option>
                <option value='5m'>5m</option>
                <option value='15m'>15m</option>
                <option value='1h'>1h</option>
                <option value='4h'>4h</option>
                <option value='1d'>1d</option>
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
                onChange={e => updateConfig({ trader: { ...config.trader, balanceInitial: +e.target.value } })}
              />
            </div>
            <div>
              <label className='w-28 inline-block pr-2'>
                fee:
              </label>
              <input
                type='number'
                value={config.trader.fee}
                onChange={e => updateConfig({ trader: { ...config.trader, fee: +e.target.value } })}
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