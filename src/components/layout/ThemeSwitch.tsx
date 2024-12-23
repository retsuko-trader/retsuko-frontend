'use client';

import { useEffect, useState } from 'react';

export const ThemeSwitch = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const theme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const currentDark = theme === 'dark' || (theme == null && prefersDark);

    setTheme(currentDark, false);
  }, []);

  const setTheme = (dark: boolean, save: boolean) => {
    if (save) {
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    }
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    setIsDark(dark);
  };

  return (
    <button onClick={() => setTheme(!isDark, true)}>
      {isDark ? '🌞' : '🌚'}
    </button>
  );
};