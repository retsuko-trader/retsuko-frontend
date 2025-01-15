import { isWsFormattedKline, WebsocketClient, type KlineInterval, type WsMessageKlineFormatted } from 'binance';
import { db, type KlineStream } from './db.js';

interface StreamInput {
  symbol: string;
  interval: string;
}

function format(input: StreamInput) {
  return `${input.symbol}_${input.interval}`;
}

export class StreamClient {
  $client = new WebsocketClient({
    beautify: true,
  });
  $states: Map<string, KlineStream> = new Map();
  $sockets: Map<string, WebSocket> = new Map();

  constructor() {
    this.$client.on('formattedMessage', data => {
      if (isWsFormattedKline(data)) {
        this.handleKline(data);
      }
    });
  }

  public async load() {
    const streams = await db.selectFrom('klineStream')
      .selectAll()
      .execute();

    for (const stream of streams) {
      this.$states.set(format(stream), stream);
      this.start(stream);
    }
  }

  public async subscribe(input: StreamInput) {
    if (this.$states.has(format(input))) {
      return;
    }

    const result = await db.insertInto('klineStream')
      .values({
        symbol: input.symbol,
        interval: input.interval,
        createdAt: Date.now(),
        lastOpenTs: 0,
        lastEndTs: 0,
        open: 0,
        close: 0,
        high: 0,
        low: 0,
        volume: 0,
      })
      .returningAll()
      .executeTakeFirst();

    if (!result) {
      return;
    }
    this.$states.set(format(input), result);

    this.start(input);
  }

  public async unsubscribe(input: StreamInput) {
    if (!this.$states.has(format(input))) {
      return;
    }

    const state = this.$states.get(format(input));
    if (state) {
      await db.deleteFrom('klineStream')
        .where('id', '=', state.id)
        .execute();
    }

    this.stop(input);
  }

  start(input: StreamInput) {
    const webSocket = this.$client.subscribeKlines(input.symbol, input.interval as KlineInterval, 'usdm');
    this.$sockets.set(format(input), webSocket);
  }

  stop(input: StreamInput) {
    const state = this.$states.get(format(input));
    if (state) {
      this.$states.delete(format(input));
    }

    const webSocket = this.$sockets.get(format(input));
    if (webSocket) {
      this.$client.closeWs(webSocket);
      this.$sockets.delete(format(input));
    }
  }

  handleKline(data: WsMessageKlineFormatted) {
    const input = {
      symbol: data.symbol,
      interval: data.kline.interval,
    };

    const state = this.$states.get(format(input));
    if (!state) {
      console.log('state not found')
      return;
    }

    if (state.lastEndTs < data.kline.startTime) {
      // skip when lastEndTs = 0 or after long break
      console.log(state.lastEndTs, data.kline.startTime)
      if (data.kline.startTime - state.lastEndTs < 3) {
        this.send(state)
          .then(() => console.log(`[${new Date().toISOString()}] Sent ${format(input)}: ${state.close}`))

        db.updateTable('klineStream')
          .set(state)
          .where('id', '=', state.id)
          .execute()
          .then(() => console.log(`[${new Date().toISOString()}] Updated ${format(input)}`))
          .catch(err => console.error(err));
      }
    }

    state.lastOpenTs = data.kline.startTime;
    state.lastEndTs = data.kline.endTime;
    state.open = data.kline.open;
    state.close = data.kline.close;
    state.high = data.kline.high;
    state.low = data.kline.low;
    state.volume = data.kline.volume;
    this.$states.set(format(input), state);
  }

  async send(data: KlineStream) {

  }
}