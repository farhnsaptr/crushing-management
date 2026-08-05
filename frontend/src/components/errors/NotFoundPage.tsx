import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';
import { Button } from '../common/Button';

export const NotFoundPage: React.FC = () => {
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
            backgroundColor: 'rgba(231, 97, 20, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.5rem',
            color: 'var(--secondary-color)',
          }}
        >
          <Compass size={44} />
        </div>

        <h1
          style={{
            fontSize: '3.5rem',
            fontWeight: 800,
            color: 'var(--primary-color)',
            lineHeight: 1,
            marginBottom: '0.5rem',
          }}
        >
          404
        </h1>

        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
          Halaman Tidak Ditemukan
        </h2>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Maaf, halaman yang Anda cari tidak dapat ditemukan atau telah dipindahkan.
        </p>

        <Link to="/">
          <Button variant="primary" leftIcon={<ArrowLeft size={18} />}>
            Kembali ke Beranda
          </Button>
        </Link>
      </div>
    </div>
  );
};
