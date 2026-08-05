import { useState, useEffect } from 'react';
import { SiteConfigService } from '../services/siteConfig.service';
import { useTheme, type ThemeColors } from '../../../context/ThemeContext';
import type { ToastMessage } from '../../../components/common/Toast';

export const useSiteConfigForm = () => {
  const { colors, updateThemeColors, fetchThemeConfig } = useTheme();
  const [formColors, setFormColors] = useState<ThemeColors>(colors);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    setFormColors(colors);
  }, [colors]);

  const handleColorChange = (key: keyof ThemeColors, hexValue: string) => {
    const updated = { ...formColors, [key]: hexValue };
    setFormColors(updated);
    // Instant live preview in CSS custom properties
    updateThemeColors({ [key]: hexValue });
  };

  const handleResetDefaults = () => {
    const defaults: ThemeColors = {
      theme_light_primary: '#008d51',
      theme_light_secondary: '#E76114',
      theme_light_accent: '#037233',
      theme_dark_primary: '#008d51',
      theme_dark_secondary: '#E76114',
      theme_dark_accent: '#037233',
    };
    setFormColors(defaults);
    updateThemeColors(defaults);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const settingsPayload = Object.entries(formColors).map(([key, value]) => ({ key, value }));
      await SiteConfigService.updateConfig({ settings: settingsPayload });

      await fetchThemeConfig();
      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Konfigurasi warna tema pabrik berhasil disimpan!',
      });
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan konfigurasi tema.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formColors,
    isSubmitting,
    toast,
    setToast,
    handleColorChange,
    handleResetDefaults,
    handleSubmit,
  };
};
