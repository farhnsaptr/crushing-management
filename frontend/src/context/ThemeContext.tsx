import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api.client';

export interface ThemeColors {
  theme_light_primary: string;
  theme_light_secondary: string;
  theme_light_accent: string;
  theme_dark_primary: string;
  theme_dark_secondary: string;
  theme_dark_accent: string;
  site_title?: string;
  site_logo?: string;
  site_background?: string;
}

const DEFAULT_THEME: ThemeColors = {
  theme_light_primary: '#008d51',
  theme_light_secondary: '#E76114',
  theme_light_accent: '#037233',
  theme_dark_primary: '#008d51',
  theme_dark_secondary: '#E76114',
  theme_dark_accent: '#037233',
  site_title: 'Material Management - PT Sugity Creatives',
  site_logo: '/logo.png',
  site_background: '/background.jpg',
};

interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  colors: ThemeColors;
  siteTitle: string;
  siteLogo: string;
  siteBackground: string;
  updateThemeColors: (newColors: Partial<ThemeColors>) => void;
  fetchThemeConfig: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme_mode') === 'dark';
  });
  const [colors, setColors] = useState<ThemeColors>(DEFAULT_THEME);

  const fetchThemeConfig = async () => {
    try {
      const response = await apiClient.get('/api/site-config');
      if (response.data && response.data.data) {
        setColors((prev) => ({ ...prev, ...response.data.data }));
      }
    } catch (err) {
      console.warn('Failed to fetch site theme config, using defaults');
    }
  };

  useEffect(() => {
    fetchThemeConfig();
  }, []);

  const siteTitle = colors.site_title || DEFAULT_THEME.site_title!;
  const siteLogo = colors.site_logo || DEFAULT_THEME.site_logo!;
  const siteBackground = colors.site_background || DEFAULT_THEME.site_background!;

  // Dynamically update document title and favicon
  useEffect(() => {
    if (siteTitle) {
      document.title = siteTitle;
    }

    if (siteLogo) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = siteLogo;
    }
  }, [siteTitle, siteLogo]);

  // Apply CSS color variables to document element
  useEffect(() => {
    const root = document.documentElement;

    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
      root.style.setProperty('--primary-color', colors.theme_dark_primary || DEFAULT_THEME.theme_dark_primary);
      root.style.setProperty('--secondary-color', colors.theme_dark_secondary || DEFAULT_THEME.theme_dark_secondary);
      root.style.setProperty('--accent-color', colors.theme_dark_accent || DEFAULT_THEME.theme_dark_accent);
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
      root.style.setProperty('--primary-color', colors.theme_light_primary || DEFAULT_THEME.theme_light_primary);
      root.style.setProperty('--secondary-color', colors.theme_light_secondary || DEFAULT_THEME.theme_light_secondary);
      root.style.setProperty('--accent-color', colors.theme_light_accent || DEFAULT_THEME.theme_light_accent);
    }
  }, [isDarkMode, colors]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  const updateThemeColors = (newColors: Partial<ThemeColors>) => {
    setColors((prev) => ({ ...prev, ...newColors }));
  };

  return (
    <ThemeContext.Provider
      value={{
        isDarkMode,
        toggleDarkMode,
        colors,
        siteTitle,
        siteLogo,
        siteBackground,
        updateThemeColors,
        fetchThemeConfig,
      }}
    >
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
