import { GetSubMenu } from '@/lib/menu';

export const getSubMenus: GetSubMenu = () => {
  return [
    {
      title: 'dataset',
    },
    {
      title: 'strategy',
    },
    {
      title: 'transaction',
    },
  ];
};

export default function RetsukoHome() {
  return (
    <div>
      레츠코 페이지지롱
    </div>
  );
}