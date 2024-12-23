'use client';

import { pages } from '@/app/pages';
import { usePathname } from 'next/navigation';

export const Header = () => {
  const path = usePathname();

  const page = pages.find(({ header }) => path.startsWith(`/${header}`));

  return (
    <header className='h-11'>
      <div className='p-3'>
        {page?.header ?? '404'}
      </div>
    </header>
  );
}