import { useState, useEffect } from 'react';
import { SiteConfigService } from '../services/siteConfig.service';
import { useTheme } from '../../../context/ThemeContext';
import type { ToastMessage } from '../../../components/common/Toast';

export const useSiteConfigForm = () => {
  const { updateThemeColors, fetchThemeConfig } = useTheme();

  // Initial loaded config state
  const [initialState, setInitialState] = useState({
    siteTitle: 'Material Management - PT Sugity Creatives',
    siteLogo: '/logo.png',
    siteBackground: '/background.jpg',
    lightPrimary: '#008d51',
    lightSecondary: '#E76114',
    lightAccent: '#037233',
  });

  // Current Form State
  const [siteTitle, setSiteTitle] = useState<string>('Material Management - PT Sugity Creatives');
  const [siteLogo, setSiteLogo] = useState<string>('/logo.png');
  const [siteBackground, setSiteBackground] = useState<string>('/background.jpg');

  const [lightPrimary, setLightPrimary] = useState<string>('#008d51');
  const [lightSecondary, setLightSecondary] = useState<string>('#E76114');
  const [lightAccent, setLightAccent] = useState<string>('#037233');

  // File objects & Instant Live Preview URLs
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>('');

  const [backgroundFile, setBackgroundFile] = useState<File | null>(null);
  const [backgroundPreview, setBackgroundPreview] = useState<string>('');

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const config = await SiteConfigService.getConfig();
      const loadedTitle = config.site_title || 'Material Management - PT Sugity Creatives';
      const loadedLogo = config.site_logo || '/logo.png';
      const loadedBg = config.site_background || '/background.jpg';
      const loadedPrimary = config.theme_light_primary || '#008d51';
      const loadedSecondary = config.theme_light_secondary || '#E76114';
      const loadedAccent = config.theme_light_accent || '#037233';

      setInitialState({
        siteTitle: loadedTitle,
        siteLogo: loadedLogo,
        siteBackground: loadedBg,
        lightPrimary: loadedPrimary,
        lightSecondary: loadedSecondary,
        lightAccent: loadedAccent,
      });

      setSiteTitle(loadedTitle);
      setSiteLogo(loadedLogo);
      setSiteBackground(loadedBg);
      setLightPrimary(loadedPrimary);
      setLightSecondary(loadedSecondary);
      setLightAccent(loadedAccent);

      setLogoFile(null);
      setLogoPreview('');
      setBackgroundFile(null);
      setBackgroundPreview('');
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: 'Gagal memuat konfigurasi situs.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConfig();
  }, []);

  const handleLogoFileChange = (file: File | null) => {
    if (!file) return;
    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
  };

  const handleBackgroundFileChange = (file: File | null) => {
    if (!file) return;
    setBackgroundFile(file);
    const objectUrl = URL.createObjectURL(file);
    setBackgroundPreview(objectUrl);
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let finalLogoUrl = siteLogo;
      let finalBgUrl = siteBackground;

      // Upload pending logo file if selected
      if (logoFile) {
        const uploadRes = await SiteConfigService.uploadFile(logoFile);
        finalLogoUrl = uploadRes.url;
        setSiteLogo(finalLogoUrl);
      }

      // Upload pending background file if selected
      if (backgroundFile) {
        const uploadRes = await SiteConfigService.uploadFile(backgroundFile);
        finalBgUrl = uploadRes.url;
        setSiteBackground(finalBgUrl);
      }

      const items = [
        { key: 'site_title', value: siteTitle },
        { key: 'site_logo', value: finalLogoUrl },
        { key: 'site_background', value: finalBgUrl },
        { key: 'theme_light_primary', value: lightPrimary },
        { key: 'theme_light_secondary', value: lightSecondary },
        { key: 'theme_light_accent', value: lightAccent },
        { key: 'theme_dark_primary', value: lightPrimary },
        { key: 'theme_dark_secondary', value: lightSecondary },
        { key: 'theme_dark_accent', value: lightAccent },
      ];

      await SiteConfigService.updateConfig(items);

      updateThemeColors({
        site_title: siteTitle,
        site_logo: finalLogoUrl,
        site_background: finalBgUrl,
        theme_light_primary: lightPrimary,
        theme_light_secondary: lightSecondary,
        theme_light_accent: lightAccent,
        theme_dark_primary: lightPrimary,
        theme_dark_secondary: lightSecondary,
        theme_dark_accent: lightAccent,
      });

      await fetchThemeConfig();

      setInitialState({
        siteTitle,
        siteLogo: finalLogoUrl,
        siteBackground: finalBgUrl,
        lightPrimary,
        lightSecondary,
        lightAccent,
      });

      setLogoFile(null);
      setLogoPreview('');
      setBackgroundFile(null);
      setBackgroundPreview('');

      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: 'Konfigurasi situs berhasil diperbarui.',
      });
    } catch (err: any) {
      setToast({
        id: Date.now().toString(),
        type: 'error',
        message: err.response?.data?.message || 'Gagal menyimpan konfigurasi situs.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetDefault = () => {
    setSiteTitle('Material Management - PT Sugity Creatives');
    setSiteLogo('/logo.png');
    setSiteBackground('/background.jpg');
    setLightPrimary('#008d51');
    setLightSecondary('#E76114');
    setLightAccent('#037233');

    setLogoFile(null);
    setLogoPreview('');
    setBackgroundFile(null);
    setBackgroundPreview('');
  };

  // Compute Unsaved / Dirty Status for Cards
  const isBrandingDirty =
    siteTitle !== initialState.siteTitle ||
    siteLogo !== initialState.siteLogo ||
    siteBackground !== initialState.siteBackground ||
    !!logoFile ||
    !!backgroundFile;

  const isThemeDirty =
    lightPrimary !== initialState.lightPrimary ||
    lightSecondary !== initialState.lightSecondary ||
    lightAccent !== initialState.lightAccent;

  const isFormDirty = isBrandingDirty || isThemeDirty;

  return {
    siteTitle,
    setSiteTitle,
    siteLogo,
    setSiteLogo,
    siteBackground,
    setSiteBackground,
    lightPrimary,
    setLightPrimary,
    lightSecondary,
    setLightSecondary,
    lightAccent,
    setLightAccent,
    logoPreview,
    backgroundPreview,
    handleLogoFileChange,
    handleBackgroundFileChange,
    isLoading,
    isSubmitting,
    isBrandingDirty,
    isThemeDirty,
    isFormDirty,
    toast,
    setToast,
    handleSaveConfig,
    handleResetDefault,
  };
};
