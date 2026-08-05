import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { ShieldCheck, Clock, Layers, Activity, AlertTriangle } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const formattedLastLogin = user?.last_login_at
    ? new Date(user.last_login_at).toLocaleString('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : 'Baru saja';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner Card */}
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-main)' }}>
                Selamat Datang, {user?.full_name || user?.username}!
              </h2>
              <Badge variant={user?.role === 'admin' ? 'primary' : 'secondary'} size="md">
                {user?.role.toUpperCase()}
              </Badge>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Sistem Manajemen Pencatatan & Daur Ulang Material Plastik — PT Sugity Creatives
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              backgroundColor: 'var(--bg-main)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              color: 'var(--text-muted)',
            }}
          >
            <Clock size={16} color="var(--primary-color)" />
            <span>Login Terakhir: {formattedLastLogin}</span>
          </div>
        </div>
      </Card>

      {/* Quick Summary Metric Cards (Placeholder) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        {/* Metric 1 */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Total Transaksi NG
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary-color)', marginTop: '0.25rem' }}>
                --
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Placeholder Modul</span>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--primary-light)', borderRadius: 'var(--radius-md)', color: 'var(--primary-color)' }}>
              <Layers size={24} />
            </div>
          </div>
        </Card>

        {/* Metric 2 */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Produksi Actual
              </span>
              <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--secondary-color)', marginTop: '0.25rem' }}>
                --
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Placeholder Modul</span>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'var(--secondary-light)', borderRadius: 'var(--radius-md)', color: 'var(--secondary-color)' }}>
              <Activity size={24} />
            </div>
          </div>
        </Card>

        {/* Metric 3 */}
        <Card>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                Status Sistem
              </span>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#10b981', marginTop: '0.5rem' }}>
                ONLINE & OPERATIONAL
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>REST API Server Ready</span>
            </div>
            <div style={{ padding: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.12)', borderRadius: 'var(--radius-md)', color: '#10b981' }}>
              <ShieldCheck size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Development Placeholder Notice */}
      <Card
        title="Pengumuman Pengembangan Dashboard"
        subtitle="Fitur visualisasi grafik dan agregasi statistik daur ulang material sedang dalam tahap penyelesaian"
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'rgba(231, 97, 20, 0.08)',
            border: '1px solid rgba(231, 97, 20, 0.25)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--text-main)',
          }}
        >
          <AlertTriangle size={24} color="var(--secondary-color)" style={{ flexShrink: 0, marginTop: '0.2rem' }} />
          <div>
            <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--secondary-color)' }}>
              Halaman Dashboard Placeholder Active
            </h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Anda berhasil masuk sebagai <strong>{user?.role.toUpperCase()}</strong>. Fitur analitik lengkap (Grafik Tren NG, Efisiensi Crushing per Mesin & Factory) akan segera dihubungkan pada tahap pengembangan berikutnya.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
