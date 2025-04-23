import { GetSubMenu } from '@/lib/menu';

export const getSubMenus: GetSubMenu = () => {
  return [
    {
      title: 'dataset',
      path: 'dataset',
    },
    {
      title: 'backtest',
      path: 'backtest',
    },
    {
      title: 'backtest/single',
      path: 'backtest_single',
    },
    {
      title: 'papertrade',
      path: 'papertrade',
    },
    {
      title: 'livetrade',
      path: 'livetrade',
    },
    {
      title: 'portfolio',
      path: 'portfolio',
    },
  ];
};
