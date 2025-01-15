import { Candle } from '../tables';
import { getDatasetAlias, getDatasetCandidate, MarketDefinition } from './dataset';
import { Strategy, StrategyConfig } from './strategy';
import { Trade } from './Trade';
import { Trader } from './trader';
import { subscribeWorkerStream } from './worker';

// TODO: fix
const liveMarkets = new Map<string, LiveMarket[]>();

class LiveMarket {
  constructor(
    private readonly strategy: Strategy<StrategyConfig>,
    private readonly trader: Trader,
  ) { }

  $trades: Trade[] = [];

  public async handle(candle: Candle) {
    const direction = await this.strategy.update(candle);

    if (direction) {
      const trade = await this.trader.handleAdvice(candle, direction);

      if (this.$trades.length > 0) {
        const lastTrade = this.$trades[this.$trades.length - 1];
        const profit = lastTrade.action === 'buy'
          ? (candle.close - lastTrade.price) / lastTrade.price
          : (lastTrade.price - candle.close) / candle.close;

        lastTrade.profit = profit;
        this.$trades[this.$trades.length - 1] = lastTrade;
      }

      if (trade) {
        this.$trades.push(trade);
      }
    }
  }

  public async report() {
    return {
      portfolio: await this.trader.getPortfolio(),
      trades: this.$trades,
    };
  }
}

export async function createLiveMarket(
  market: MarketDefinition,
  strategy: Strategy<StrategyConfig>,
  trader: Trader
) {
  const key = getDatasetAlias(market);

  const markets = liveMarkets.get(key);
  if (markets) {
    markets.push(new LiveMarket(strategy, trader));
  } else {
    liveMarkets.set(key, [new LiveMarket(strategy, trader)]);

    await subscribeWorkerStream(market);
  }
}

export function getLiveMarkets() {
  return [...liveMarkets.entries()]
    .flatMap(([key, markets]) => markets.map(market => ({ key: getDatasetCandidate(key), market })));
}

export async function handleLiveCandle(candle: Candle) {
  const key = getDatasetAlias(candle);

  const markets = liveMarkets.get(key);
  if (!markets) {
    return;
  }

  await Promise.all(markets.map(x => x.handle(candle)));
}