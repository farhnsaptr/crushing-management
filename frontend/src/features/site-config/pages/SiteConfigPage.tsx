import React from 'react';
import { useSiteConfigForm } from '../hooks/useSiteConfigForm';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { Save, RotateCcw, Sun, Moon } from 'lucide-react';

export const SiteConfigPage: React.FC = () => {
  const {
    formColors,
    isSubmitting,
    toast,
    setToast,
    handleColorChange,
    handleResetDefaults,
    handleSubmit,
  } = useSiteConfigForm();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '900px' }}>
      <Card
        title="Kustomisasi Warna Tema Sistem"
        subtitle="Atur identitas warna PT Sugity Creatives untuk mode Terang (Light Mode) dan mode Gelap (Dark Mode)"
        action={
          <Button variant="outline" size="sm" onClick={handleResetDefaults} leftIcon={<RotateCcw size={16} />}>
            Reset Default Sugity
          </Button>
        }
      >
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Light Mode Color Settings */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <Sun size={20} color="#f59e0b" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Warna Tema - Light Mode (Mode Terang)
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {/* Light Primary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Primary Color (Utama)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="color"
                    value={formColors.theme_light_primary}
                    onChange={(e) => handleColorChange('theme_light_primary', e.target.value)}
                    style={{ width: '48px', height: '42px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={formColors.theme_light_primary}
                    onChange={(e) => handleColorChange('theme_light_primary', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>
              </div>

              {/* Light Secondary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Secondary Color (Sekunder)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="color"
                    value={formColors.theme_light_secondary}
                    onChange={(e) => handleColorChange('theme_light_secondary', e.target.value)}
                    style={{ width: '48px', height: '42px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={formColors.theme_light_secondary}
                    onChange={(e) => handleColorChange('theme_light_secondary', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>
              </div>

              {/* Light Accent */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Accent Color (Aksen)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="color"
                    value={formColors.theme_light_accent}
                    onChange={(e) => handleColorChange('theme_light_accent', e.target.value)}
                    style={{ width: '48px', height: '42px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={formColors.theme_light_accent}
                    onChange={(e) => handleColorChange('theme_light_accent', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Dark Mode Color Settings */}
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                marginBottom: '1rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid var(--border-color)',
              }}
            >
              <Moon size={20} color="#3b82f6" />
              <h4 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-main)' }}>
                Warna Tema - Dark Mode (Mode Gelap)
              </h4>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
              {/* Dark Primary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Primary Color (Utama Dark)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="color"
                    value={formColors.theme_dark_primary}
                    onChange={(e) => handleColorChange('theme_dark_primary', e.target.value)}
                    style={{ width: '48px', height: '42px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={formColors.theme_dark_primary}
                    onChange={(e) => handleColorChange('theme_dark_primary', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>
              </div>

              {/* Dark Secondary */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Secondary Color (Sekunder Dark)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="color"
                    value={formColors.theme_dark_secondary}
                    onChange={(e) => handleColorChange('theme_dark_secondary', e.target.value)}
                    style={{ width: '48px', height: '42px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={formColors.theme_dark_secondary}
                    onChange={(e) => handleColorChange('theme_dark_secondary', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>
              </div>

              {/* Dark Accent */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  Accent Color (Aksen Dark)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="color"
                    value={formColors.theme_dark_accent}
                    onChange={(e) => handleColorChange('theme_dark_accent', e.target.value)}
                    style={{ width: '48px', height: '42px', border: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}
                  />
                  <input
                    type="text"
                    value={formColors.theme_dark_accent}
                    onChange={(e) => handleColorChange('theme_dark_accent', e.target.value)}
                    style={{
                      flex: 1,
                      padding: '0.5rem 0.75rem',
                      fontFamily: 'monospace',
                      fontSize: '0.9rem',
                      backgroundColor: 'var(--bg-main)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-main)',
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <Button type="submit" variant="primary" size="lg" isLoading={isSubmitting} leftIcon={<Save size={18} />}>
              Simpan Konfigurasi Tema
            </Button>
          </div>
        </form>
      </Card>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
