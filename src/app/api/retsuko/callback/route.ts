import { BinanceInterval } from '@/lib/retsuko/binance';
import { handleLiveCandle } from '@/lib/retsuko/core/liveMarket';

interface StreamInput {
  symbol: string;
  interval: string;
  lastOpenTs: number;
  lastEndTs: number;
  open: number;
  close: number;
  high: number;
  low: number;
  volume: number;
}

export async function POST(request: Request) {
  const input = await request.json() as StreamInput;
  await handleLiveCandle({
    market: 'futures',
    symbol: input.symbol,
    interval: input.interval as BinanceInterval,
    ts: new Date(input.lastOpenTs),
    open: input.open,
    close: input.close,
    high: input.high,
    low: input.low,
    volume: input.volume,
  });

  return new Response('');
}