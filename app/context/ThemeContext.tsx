import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeType = 'light' | 'dark' | 'amoled';

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  colors: typeof themes.dark;
}

const themes = {
  dark: {
    background: ['#101013', '#1a1a1a'],
    text: '#FFFFFF',
    subText: '#888888',
    primary: '#7B4DFF',
    secondary: '#1E1E1E',
    success: '#4CAF50',
    border: '#1a1a1a',
    switchTrack: '#333333',
    switchThumb: '#f4f3f4',
    cardBackground: '#1E1E1E',
  },
  amoled: {
    background: ['#000000', '#000000'],
    text: '#FFFFFF',
    subText: '#888888',
    primary: '#7B4DFF',
    secondary: '#000000',
    success: '#4CAF50',
    border: '#222222',
    switchTrack: '#333333',
    switchThumb: '#f4f3f4',
    cardBackground: '#111111',
  },
  light: {
    background: ['#F8F9FA', '#FFFFFF'],
    text: '#000000',
    subText: '#666666',
    primary: '#7B4DFF',
    secondary: '#FFFFFF',
    success: '#4CAF50',
    border: '#E0E0E0',
    switchTrack: '#D0D0D0',
    switchThumb: '#FFFFFF',
    cardBackground: '#FFFFFF',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeType>('dark');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'amoled')) {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const setTheme = async (newTheme: ThemeType) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors: themes[theme] }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 