import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  mode: ThemeMode;
  isDarkMode: boolean;
  setThemeMode: (mode: ThemeMode) => void;
}

function systemIsDarkMode() {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return true;
  } else {
    return false;
  }
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
}
export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(
    (localStorage.getItem('themeMode') as ThemeMode) || 'dark',
  );
  const [isDarkMode, setIsDarkMode] = useState(mode === 'dark');

  useEffect(() => {
    const handleColorSchemeChange = (event: MediaQueryListEvent) => {
      if (event.matches && mode === 'system') {
        document.documentElement.classList.add('dark');
        setIsDarkMode(true);
      } else {
        document.documentElement.classList.remove('dark');
        setIsDarkMode(false);
      }
    };

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addListener(handleColorSchemeChange);

    return () => {
      mediaQuery.removeListener(handleColorSchemeChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setThemeMode = (mode: ThemeMode) => {
    setMode(mode);
    localStorage.setItem('themeMode', mode);
  };

  useEffect(() => {
    if ((mode === 'system' && systemIsDarkMode()) || mode === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, [mode]);

  return (
    <ThemeContext.Provider value={{ mode, isDarkMode, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
