import React from 'react';
import { useSiteConfigForm } from '../hooks/useSiteConfigForm';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { Image, Type, Save, RotateCcw, Info, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

export const SiteConfigPage: React.FC = () => {
  const {
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
    isSubmitting,
    isBrandingDirty,
    isThemeDirty,
    toast,
    setToast,
    handleSaveConfig,
    handleResetDefault,
  } = useSiteConfigForm();

  const activeLogoSrc = logoPreview || siteLogo;
  const activeBgSrc = backgroundPreview || siteBackground;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px' }}>
      <form onSubmit={handleSaveConfig} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* SECTION 1: SYSTEM BRANDING & IDENTITAS (Shows accent border line if unsaved) */}
        <Card
          title="Branding & Identitas Aplikasi"
          subtitle="Atur Judul Aplikasi, Icon/Logo Web, dan Gambar Latar Belakang Login"
          hasUnsavedChanges={isBrandingDirty}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Title Web Input */}
            <Input
              label="Judul Web / Browser Tab Title"
              placeholder="misal Recycle Material Management - PT Sugity Creatives"
              value={siteTitle}
              onChange={(e) => setSiteTitle(e.target.value)}
              leftIcon={<Type size={18} />}
              required
            />

            {/* Logo / Icon Uploader with Live Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Icon / Logo Web (PNG/SVG/ICO)
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                {/* Instant Live Preview Thumbnail */}
                <div
                  style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem',
                    boxShadow: 'var(--shadow-sm)',
                    flexShrink: 0,
                  }}
                >
                  <img
                    src={activeLogoSrc}
                    alt="Logo Live Preview"
                    style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/x-icon"
                    onChange={(e) => handleLogoFileChange(e.target.files?.[0] || null)}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <Input
                    placeholder="atau masukkan URL logo..."
                    value={siteLogo}
                    onChange={(e) => {
                      setSiteLogo(e.target.value);
                    }}
                    leftIcon={<Image size={16} />}
                  />
                </div>
              </div>
            </div>

            {/* Login Background Uploader with Live Preview */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Gambar Latar Belakang Login
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
                {/* Instant Live Preview Thumbnail */}
                <div
                  style={{
                    width: '120px',
                    height: '70px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#000000',
                    backgroundImage: `url(${activeBgSrc})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    boxShadow: 'var(--shadow-sm)',
                    flexShrink: 0,
                  }}
                />

                <div style={{ flex: 1, minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/jpg"
                    onChange={(e) => handleBackgroundFileChange(e.target.files?.[0] || null)}
                    style={{ fontSize: '0.85rem' }}
                  />
                  <Input
                    placeholder="atau masukkan URL background..."
                    value={siteBackground}
                    onChange={(e) => {
                      setSiteBackground(e.target.value);
                    }}
                    leftIcon={<Image size={16} />}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 2: PALET WARNA TEMA BRAND (Shows accent border line if unsaved) */}
        <Card
          title="Palet Warna Utama Aplikasi"
          subtitle="Atur warna Primary, Secondary, dan Accent (pengaturan Accent mempengaruhi tombol & aksen toast)"
          hasUnsavedChanges={isThemeDirty}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1.25rem',
            }}
          >
            {/* Primary Color */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Warna Primary (Header & Navbar)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="color"
                  value={lightPrimary}
                  onChange={(e) => setLightPrimary(e.target.value)}
                  style={{
                    width: '42px',
                    height: '42px',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                />
                <Input
                  value={lightPrimary}
                  onChange={(e) => setLightPrimary(e.target.value)}
                  placeholder="#008d51"
                />
              </div>
            </div>

            {/* Secondary Color */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Warna Secondary (Sidebar Background)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="color"
                  value={lightSecondary}
                  onChange={(e) => setLightSecondary(e.target.value)}
                  style={{
                    width: '42px',
                    height: '42px',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                />
                <Input
                  value={lightSecondary}
                  onChange={(e) => setLightSecondary(e.target.value)}
                  placeholder="#E76114"
                />
              </div>
            </div>

            {/* Accent Color */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                Warna Accent (Tombol & Toast Accent)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="color"
                  value={lightAccent}
                  onChange={(e) => setLightAccent(e.target.value)}
                  style={{
                    width: '42px',
                    height: '42px',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                />
                <Input
                  value={lightAccent}
                  onChange={(e) => setLightAccent(e.target.value)}
                  placeholder="#037233"
                />
              </div>
            </div>
          </div>
        </Card>

        {/* SECTION 3: SEMANTIC LEGEND STATUS COLORS (FIXED & UNAFFECTED BY ACCENT) */}
        <Card
          title="Warna Legend Indikator Status (Fixed Legend Colors)"
          subtitle="Warna legend berikut bersifat tetap untuk indikator sistem dan TIDAK terpengaruh oleh warna Accent"
        >
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              padding: '0.5rem 0',
            }}
          >
            {/* Legend Info */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <Info size={20} color="#3b82f6" />
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#3b82f6' }}>INFO</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Blue (#3b82f6)</p>
              </div>
            </div>

            {/* Legend Warning */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <AlertTriangle size={20} color="#f59e0b" />
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#f59e0b' }}>WARNING</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Amber (#f59e0b)</p>
              </div>
            </div>

            {/* Legend Danger */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <ShieldAlert size={20} color="#ef4444" />
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#ef4444' }}>DANGER</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Red (#ef4444)</p>
              </div>
            </div>

            {/* Legend Success */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
              }}
            >
              <CheckCircle2 size={20} color="#10b981" />
              <div>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#10b981' }}>SUCCESS</span>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Emerald (#10b981)</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <Button
            type="button"
            variant="outline"
            onClick={handleResetDefault}
            disabled={isSubmitting}
            leftIcon={<RotateCcw size={16} />}
          >
            Reset Default
          </Button>

          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            leftIcon={<Save size={18} />}
          >
            Simpan Konfigurasi
          </Button>
        </div>
      </form>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
