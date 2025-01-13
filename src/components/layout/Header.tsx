'use client';

import { getPage } from '@/app/pages';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const curPath = usePathname();

  const { page, subMenu } = getPage(curPath);

  return (
    <header className='h-11'>
      <div className='p-3'>
        {page?.header ?? '404'}
        {
          subMenu && (
            <span>
              /{subMenu.title}
            </span>
          )
        }
      </div>
    </header>
  );
}