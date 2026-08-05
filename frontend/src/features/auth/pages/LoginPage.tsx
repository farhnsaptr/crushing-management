import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { useAuth } from '../../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin/users' : '/');
    }
  }, [isAuthenticated, user, navigate]);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8fafc',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image Overlay with 20% Opacity */}
      <img
        src="/background.jpg"
        alt="Factory Background"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: 0.2,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Main Light Theme Card */}
      <div
        className="glass-card animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '2.5rem 2rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          zIndex: 10,
          border: '1px solid #e2e8f0',
          backgroundColor: '#ffffff',
          color: '#0f172a',
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ marginBottom: '1rem' }}>
            <img
              src="/logo.png"
              alt="PT Sugity Creatives Logo"
              style={{ height: '56px', objectFit: 'contain' }}
            />
          </div>

          <h2
            style={{
              fontSize: '1.6rem',
              fontWeight: 900,
              color: '#0f172a',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            CRUSHING MANAGEMENT
          </h2>

          <p
            style={{
              fontSize: '0.875rem',
              color: '#008d51',
              fontWeight: 800,
              marginTop: '0.35rem',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            PT Sugity Creatives
          </p>

          <p
            style={{
              fontSize: '0.8rem',
              color: '#64748b',
              marginTop: '0.25rem',
            }}
          >
            Sistem Pencatatan Daur Ulang Material Plastik Injection Molding
          </p>
        </div>

        {/* Form Container */}
        <LoginForm />

        {/* Footer */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center',
            fontSize: '0.75rem',
            color: '#64748b',
            fontWeight: 500,
          }}
        >
          &copy; {new Date().getFullYear()} PT Sugity Creatives. All rights reserved.
        </div>
      </div>
    </div>
  );
};
