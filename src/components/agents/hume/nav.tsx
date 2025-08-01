'use client';

import { useLayoutEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

import Github from './logos/github';
import HumeLogo from './logos/hume';
import { Button } from './ui/button';

export const Nav = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useLayoutEffect(() => {
    const el = document.documentElement;

    if (el.classList.contains('dark')) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  const toggleDark = () => {
    const el = document.documentElement;
    el.classList.toggle('dark');
    setIsDarkMode((prev) => !prev);
  };

  return (
    <div
      className={
        'z-50 flex h-14 items-center border-b border-border bg-card px-4 py-2'
      }
    >
      <div>
        <HumeLogo className={'h-5 w-auto'} />
      </div>
      <div className={'ml-auto flex items-center gap-1'}>
        <Button
          onClick={() => {
            window.open(
              'https://github.com/linkgua/linkgua-flex',
              '_blank',
              'noopener noreferrer'
            );
          }}
          variant={'ghost'}
          className={'ml-auto flex items-center gap-1.5'}
        >
          <span>
            <Github className={'size-4'} />
          </span>
          <span>Star on GitHub</span>
        </Button>
        <Button
          onClick={toggleDark}
          variant={'ghost'}
          className={'ml-auto flex items-center gap-1.5'}
        >
          <span>
            {isDarkMode ? (
              <Sun className={'size-4'} />
            ) : (
              <Moon className={'size-4'} />
            )}
          </span>
          <span>{isDarkMode ? 'Light' : 'Dark'} Mode</span>
        </Button>
      </div>
    </div>
  );
};
