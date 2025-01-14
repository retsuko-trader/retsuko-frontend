import { pages } from '@/app/pages';

export async function SubMenuLoader({ title }: { title: string }) {
  const subMenus = pages.find(x => x.title === title)?.subMenusFn() ?? [];

  return (
    <>
      {subMenus.map((subMenu, i) => (
        <div key={i} className='p-3'>
          {subMenu.title}
        </div>
      ))}
    </>
  );
}