import { Menu } from '@/lib/menu';
import { getSubMenus as getIndexSubMenus } from './page';
import { getSubMenus as getRetsukoSubMenus } from './retsuko/page';
import { getSubMenus as getTaskSubMenus } from './track/page';

export const pages: Menu[] = [
  {
    title: '/',
    header: 'index',
    path: '/',
    subMenusFn: getIndexSubMenus,
  },
  {
    title: '/track',
    header: 'tracker',
    path: '/track',
    subMenusFn: getTaskSubMenus,
  },
  {
    title: '/retsuko',
    header: 'retsuko',
    path: '/retsuko',
    subMenusFn: getRetsukoSubMenus,
  },
];