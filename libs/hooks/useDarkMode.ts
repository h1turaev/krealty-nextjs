import { useEffect, useState } from 'react';

export const useDarkMode = () => {
  // Always start with false to match SSR and prevent hydration mismatch
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    // Set mounted flag
    setIsMounted(true);

    // Check localStorage for saved preference after mount
    const savedTheme = localStorage.getItem('darkMode');
    if (savedTheme !== null) {
      setIsDarkMode(savedTheme === 'true');
    } else {
      // Check system preference if no saved preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }
  }, []);

  useEffect(() => {
    // Apply dark mode class when isDarkMode changes (only after mount)
    if (isMounted && typeof window !== 'undefined') {
      if (isDarkMode) {
        document.documentElement.classList.add('dark-mode');
        document.body.classList.add('dark-mode');
      } else {
        document.documentElement.classList.remove('dark-mode');
        document.body.classList.remove('dark-mode');
      }
    }
  }, [isDarkMode, isMounted]);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  return { isDarkMode, toggleDarkMode };
};
