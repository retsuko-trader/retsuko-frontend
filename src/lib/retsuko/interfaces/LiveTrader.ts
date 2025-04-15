import { TraderMetrics } from './Backtest';
import { LiveTraderConfig } from './LiveTraderConfig';
import { SignalKind } from './Trade';

export interface LiveTraderState {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  endedAt: string | null;
  config: LiveTraderConfig;
  metrics: TraderMetrics;
  dump: string;
}

export interface LiveTraderTrade {
  id: string;
  traderId: string;
  ts: string;
  signal: SignalKind;
  confidence: number;
  orderId: string | null;
  asset: number;
  currency: number;
  price: number;
  profit: number;
}

export interface LiveTraderOrder {
  traderId: string;
  tradeId: string;
  orderId: number;
  rootOrderId: number;
  prevOrderId: number | null;
  nextOrderId: number | null;
  error: string | null;
  closedAt: string | null;
  cancelledAt: string | null;
  symbol: string;
  pair: string;
  price: number;
  averagePrice: number;
  quantityFilled: number;
  quantity: number;
  status: OrderStatus;
  side: OrderSide;
  timeInForce: TimeInForce;
  type: FuturesOrderType;
  orderType: FuturesOrderType;
  updateTime: string;
  createTime: string;
  positionSide: PositionSide;
}

export enum OrderStatus {
  PendingNew = 0,
  New = 1,
  PartiallyFilled = 2,
  Filled = 3,
  Canceled = 4,
  PendingCancel = 5,
  Rejected = 6,
  Expired = 7,
  Insurance = 8,
  Adl = 9,
  ExpiredInMatch = 10,
}

export enum OrderSide {
  Buy = 0,
  Sell = 1,
}

export enum TimeInForce {
  GoodTillCancel = 0,
  ImmediateOrCancel = 1,
  FillOrKill = 2,
  GoodTillCrossing = 3,
  GoodTillExpiredOrCanceled = 4,
  GoodTillDate = 5,
}

export enum FuturesOrderType {
  Limit = 0,
  Market = 1,
  Stop = 2,
  StopMarket = 3,
  TakeProfit = 4,
  TakeProfitMarket = 5,
  TrailingStopMarket = 6,
  Liquidation = 7,
}

export enum PositionSide {
  Short = 0,
  Long = 1,
  Both = 2,
}
