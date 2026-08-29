import { useState, useEffect } from 'react';
import { SiteConfigService } from '../services/siteConfig.service';
import { useTheme } from '../../../context/ThemeContext';
import type { ToastMessage } from '../../../components/common/Toast';
import type { StorageImpactResult } from '../types/siteConfig.types';

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
    minioBaseUrl: 'http://172.19.85.141:9000',
    minioFolderMasterParts: 'master-parts',
  });

  // Current Form State
  const [siteTitle, setSiteTitle] = useState<string>('Material Management - PT Sugity Creatives');
  const [siteLogo, setSiteLogo] = useState<string>('/logo.png');
  const [siteBackground, setSiteBackground] = useState<string>('/background.jpg');

  const [lightPrimary, setLightPrimary] = useState<string>('#008d51');
  const [lightSecondary, setLightSecondary] = useState<string>('#E76114');
  const [lightAccent, setLightAccent] = useState<string>('#037233');

  // MinIO Storage State (Hanya Base URL & Prefix Folder yang dikonfigurasi)
  const [minioBaseUrl, setMinioBaseUrl] = useState<string>('http://172.19.85.141:9000');
  const [minioFolderMasterParts, setMinioFolderMasterParts] = useState<string>('master-parts');

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
      const loadedMinioBase = config.minio_base_url || 'http://172.19.85.141:9000';
      const loadedMinioFolder = config.minio_folder_master_parts || 'master-parts';

      setInitialState({
        siteTitle: loadedTitle,
        siteLogo: loadedLogo,
        siteBackground: loadedBg,
        lightPrimary: loadedPrimary,
        lightSecondary: loadedSecondary,
        lightAccent: loadedAccent,
        minioBaseUrl: loadedMinioBase,
        minioFolderMasterParts: loadedMinioFolder,
      });

      setSiteTitle(loadedTitle);
      setSiteLogo(loadedLogo);
      setSiteBackground(loadedBg);
      setLightPrimary(loadedPrimary);
      setLightSecondary(loadedSecondary);
      setLightAccent(loadedAccent);
      setMinioBaseUrl(loadedMinioBase);
      setMinioFolderMasterParts(loadedMinioFolder);

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

  // Storage Migration Modal State
  const [impactData, setImpactData] = useState<StorageImpactResult | null>(null);
  const [isImpactModalOpen, setIsImpactModalOpen] = useState<boolean>(false);

  const executeSaveConfig = async (migrationAction?: 'migrate_all' | 'config_only') => {
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
        { key: 'minio_base_url', value: minioBaseUrl.trim() },
        { key: 'minio_folder_master_parts', value: minioFolderMasterParts.trim() },
      ];

      await SiteConfigService.updateConfig(items, migrationAction);

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
        minioBaseUrl,
        minioFolderMasterParts,
      });

      setLogoFile(null);
      setLogoPreview('');
      setBackgroundFile(null);
      setBackgroundPreview('');
      setIsImpactModalOpen(false);
      setImpactData(null);

      const successMsg =
        migrationAction === 'migrate_all'
          ? `Konfigurasi berhasil disimpan dan ${impactData?.affectedCount || 0} master part berhasil dimigrasikan ke lokasi baru!`
          : 'Konfigurasi situs & MinIO Storage berhasil diperbarui.';

      setToast({
        id: Date.now().toString(),
        type: 'success',
        message: successMsg,
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

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();

    // Cek apakah prefix folder MinIO diubah
    const isFolderChanged =
      minioFolderMasterParts.trim() !== initialState.minioFolderMasterParts.trim();

    if (isFolderChanged) {
      setIsSubmitting(true);
      try {
        const impact = await SiteConfigService.checkStorageImpact(
          undefined,
          minioFolderMasterParts.trim()
        );

        if (impact && impact.affectedCount > 0) {
          setImpactData(impact);
          setIsImpactModalOpen(true);
          setIsSubmitting(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to check storage impact:', err);
      } finally {
        setIsSubmitting(false);
      }
    }

    // Jika tidak ada data yang terpengaruh atau hanya Base URL yang berubah, simpan langsung
    await executeSaveConfig();
  };

  const handleConfirmMigration = async (action: 'migrate_all' | 'config_only') => {
    await executeSaveConfig(action);
  };

  const handleResetDefault = () => {
    setSiteTitle('Material Management - PT Sugity Creatives');
    setSiteLogo('/logo.png');
    setSiteBackground('/background.jpg');
    setLightPrimary('#008d51');
    setLightSecondary('#E76114');
    setLightAccent('#037233');
    setMinioBaseUrl('http://172.19.85.141:9000');
    setMinioFolderMasterParts('master-parts');

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

  const isStorageDirty =
    minioBaseUrl !== initialState.minioBaseUrl ||
    minioFolderMasterParts !== initialState.minioFolderMasterParts;

  const isFormDirty = isBrandingDirty || isThemeDirty || isStorageDirty;

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
    minioBaseUrl,
    setMinioBaseUrl,
    minioFolderMasterParts,
    setMinioFolderMasterParts,
    logoPreview,
    backgroundPreview,
    handleLogoFileChange,
    handleBackgroundFileChange,
    isLoading,
    isSubmitting,
    isBrandingDirty,
    isThemeDirty,
    isStorageDirty,
    isFormDirty,
    impactData,
    isImpactModalOpen,
    setIsImpactModalOpen,
    handleConfirmMigration,
    toast,
    setToast,
    handleSaveConfig,
    handleResetDefault,
  };
};

