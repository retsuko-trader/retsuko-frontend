export const formatBalance = (balance: number) => {
  return balance.toFixed(2);
};

export const formatPercent = (percent: number) => {
  return (percent * 100).toFixed(2) + '%';
};