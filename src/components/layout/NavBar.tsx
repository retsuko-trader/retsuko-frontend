'use client';

import { useState } from 'react';
import { ThemeSwitch } from './ThemeSwitch';
import { pages } from '@/app/pages';
import Link from 'next/link';

export const NavBar = () => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <nav className='w-full sm:w-52 sm:h-screen bg-h-tone/5 relative'>
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
              pages.map(({ title, header }) => (
                <Link key={title} className='text-sm text-h-text/80' href={`/${header}`} >
                  {'/'}{title}
                </Link>
              ))
            }
          </div>
        )}
      </div>

      <div className='hidden sm:flex flex-col h-full px-4 py-3'>
        <div className='h-11'>
          <div className=''>
            yuno
          </div>
        </div>

        <div>
          {
            pages.map(({ title, header }) => (
              <Link key={title} className='text-sm text-h-text/80' href={`/${header}`} >
                {'/'}{title}
              </Link>
            ))
          }
        </div>

        <div className='flex-1 flex-grow' />

        <ThemeSwitch />
      </div>

    </nav>
  );
};