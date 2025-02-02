export const formatBalance = (balance: number, digits: number = 2) => {
  return balance.toFixed(digits);
};

export const formatPercent = (percent: number, digits: number = 2) => {
  return (percent * 100).toFixed(digits) + '%';
};