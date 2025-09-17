import type { ReactNode } from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => (
  <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
    {children}
  </NextThemesProvider>
);

export default ThemeProvider;
