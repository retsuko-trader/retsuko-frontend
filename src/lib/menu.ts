export type SubMenu = {
  title: string;
  path: string;
}

export type GetSubMenu = () => SubMenu[];

export type Menu = {
  title: string;
  header: string;
  path: string;
  subMenusFn: GetSubMenu;
}