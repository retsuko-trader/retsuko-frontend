'use client';

import { pages } from '@/app/pages';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const curPath = usePathname();

  const page = pages.find(({ path }) => curPath === path)
    ?? pages.find(({ path }) => curPath.startsWith(`/${path}`));

  return (
    <header className='h-11'>
      <div className='p-3'>
        {page?.header ?? '404'}
      </div>
    </header>
  );
}