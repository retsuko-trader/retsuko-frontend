import { GetSubMenu } from '@/lib/menu';

export const getSubMenus: GetSubMenu = () => {
  return [
    {
      title: 'dataset',
      path: 'dataset',
    },
    {
      title: 'datasetGroup',
      path: 'dataset_group',
    },
    {
      title: 'backtest',
      path: 'backtest',
    },
  ];
};