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

export function getPage(curPath: string) {
  const pagesWithoutIndex = pages.filter(({ path }) => path !== '/');

  const page = pages.find(({ path }) => curPath === path)
    ?? pagesWithoutIndex.find(({ path }) => curPath.startsWith(path));

  const subMenus = page?.subMenusFn() ?? [];
  const subMenu = subMenus.find(({ title }) => curPath.endsWith(title));

  return { page, subMenus, subMenu };
}