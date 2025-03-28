import { Menu } from '@/lib/menu';
import { getSubMenus as getIndexSubMenus } from './subMenus';
import { getSubMenus as getRetsukoSubMenus } from './retsuko/subMenus';

export const pages: Menu[] = [
  {
    title: '/',
    header: 'index',
    path: '/',
    subMenusFn: getIndexSubMenus,
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
  const pathWithoutPage = curPath.replace((page?.path ?? ''), '').split('/')[1];
  const subMenu = pathWithoutPage ? (
    subMenus.find(({ path }) => pathWithoutPage === path)
    ?? subMenus.find(({ path }) => pathWithoutPage.startsWith(path))
  ) : null;

  return { page, subMenus, subMenu };
}
