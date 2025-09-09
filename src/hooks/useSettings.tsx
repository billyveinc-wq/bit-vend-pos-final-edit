import { useState, useEffect } from 'react';

export interface AppSettings {
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  lastVisitedPage: string;
  autoSave: boolean;
  language: string;
  currency: string;
  dateFormat: string;
  timeFormat: '12' | '24';
  receiptTemplate: string;
}

const defaultSettings: AppSettings = {
  theme: 'light',
  sidebarCollapsed: false,
  lastVisitedPage: '/dashboard',
  autoSave: true,
  language: 'en',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12',
  receiptTemplate: 'classic-receipt'
};

export const useSettings = () => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('pos-app-settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('pos-app-settings', JSON.stringify(settings));
    }
  }, [settings, isLoading]);

  const updateSetting = <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('pos-app-settings');
  };

  return {
    settings,
    updateSetting,
    resetSettings,
    isLoading
  };
};