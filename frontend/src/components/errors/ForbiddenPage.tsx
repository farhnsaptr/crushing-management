import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const ForbiddenPage: React.FC = () => {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        backgroundColor: 'var(--bg-main)',
      }}
    >
      <div
        className="glass-card"
        style={{
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          padding: '3rem 2rem',
        }}
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: '#ef4444',
          }}
        >
          <ShieldAlert size={44} />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <Badge variant="danger" size="md">
            HTTP 403 Forbidden
          </Badge>
        </div>

        <h1
          style={{
            fontSize: '1.75rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '0.75rem',
          }}
        >
          Akses Ditolak
        </h1>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Anda tidak memiliki izin (role) yang sesuai untuk mengakses halaman ini. Silakan hubungi Administrator Sistem jika ini sebuah kesalahan.
        </p>

        <Link to="/">
          <Button variant="primary" leftIcon={<ArrowLeft size={18} />}>
            Kembali ke Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};
