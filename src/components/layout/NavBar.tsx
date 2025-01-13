'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import classNames from 'classnames';
import { ThemeSwitch } from './ThemeSwitch';
import { getPage, pages } from '@/app/pages';

export const NavBar = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const curPath = usePathname();

  const { page, subMenus, subMenu } = getPage(curPath);

  const divider = (
    <hr className='text-yellow-50 my-3 border-h-text/20 mx-1.5' />
  );

  return (
    <nav className='w-full sm:w-48 sm:h-screen bg-h-tone/5 relative flex-shrink-0'>
      <div className='sm:hidden flex flex-row px-3 py-2'>
        <button onClick={() => setIsMobileNavOpen(!isMobileNavOpen)} className='mr-4'>
          =
        </button>

        <div className='flex-1'>
          yuno
        </div>

        <ThemeSwitch />

        {isMobileNavOpen && (
          <div className='fixed inset-0 bg-h-background flex flex-col'>
            <button onClick={() => setIsMobileNavOpen(false)}>
              X
            </button>
            {
              pages.map(({ title, path }) => (
                <Link key={title} className='text-sm text-h-text/80' href={path} >
                  {'/'}{title}
                </Link>
              ))
            }
          </div>
        )}
      </div>

      <div className='hidden sm:flex flex-col h-full px-1 py-3'>
        <div className='h-11'>
          <div className='px-2'>
            yuno<span className='text-h-blue'>@chan</span>
          </div>
        </div>

        <div className='flex flex-col'>
          {
            pages.map(({ title, path }) => (
              <Link key={title} className={classNames('px-2 py-1 align-baseline text-sm hover:bg-h-text/20', {
                'font-bold text-h-text/100': title === page?.title,
                'text-h-text/60': title !== page?.title,
              })} href={path}>
                {title}
              </Link>
            ))
          }
        </div>

        {divider}

        <div className='flex flex-col'>
          {
            subMenus.map(({ title }) => {
              const href = `${page?.path}/${title}`;
              return (
                <Link key={title} className={classNames('px-2 py-1 align-baseline text-sm hover:bg-h-text/20', {
                  'font-bold text-h-text/100': title === subMenu?.title,
                  'text-h-text/60': title !== subMenu?.title,
                })} href={href}>
                  {title}
                </Link>
              )
            })
          }
        </div>

        <div className='flex-1 flex-grow' />

        <ThemeSwitch />
      </div>

    </nav>
  );
};