import { createContext, useEffect } from 'react';
import { STORAGE_KEYS, THEME_CONSTANTS } from '../constants/index.js';
import { setItem } from '../utils/storage.js';

export const ThemeContext = createContext({
  theme: THEME_CONSTANTS.DARK,
  toggleTheme: () => {},
  setTheme: () => {},
  setThemeMode: () => {},
});

export const ThemeProvider = ({ children }) => {
  const theme = THEME_CONSTANTS.DARK;

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(THEME_CONSTANTS.LIGHT);
    root.classList.add(THEME_CONSTANTS.DARK);
    setItem(STORAGE_KEYS.THEME, THEME_CONSTANTS.DARK);
  }, []);

  const toggleTheme = () => {};
  const setTheme = () => {};
  const setThemeMode = () => {};

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
