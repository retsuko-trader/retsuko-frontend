export interface AccountAsset {
  symbol: string;
  leverage: number;
  amount: number;
  entryPrice: number;
  marketPrice: number;
  initialBalance: number;
  currentBalance: number;
  profitBalance: number;
  profit: number;
}

export interface AccountPortfolio {
  assets: AccountAsset[];
  currency: number;
  totalBalance: number;
}
