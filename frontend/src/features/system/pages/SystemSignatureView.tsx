import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft, Code } from 'lucide-react';

export const SystemSignatureView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#090f1d',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* CSS Keyframe Animation */}
      <style>{`
        @keyframes redPulse {
          0% { transform: scale(1); }
          14% { transform: scale(1.32); }
          28% { transform: scale(1); }
          42% { transform: scale(1.32); }
          70% { transform: scale(1); }
        }
        .red-accent-icon {
          display: inline-block;
          animation: redPulse 1.4s infinite ease-in-out;
          color: #ef4444;
          filter: drop-shadow(0 0 12px rgba(239, 68, 68, 0.6));
        }
      `}</style>

      {/* Decorative Background Glow Spheres */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: '300px',
          height: '300px',
          backgroundColor: 'rgba(231, 97, 20, 0.18)',
          filter: 'blur(100px)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '15%',
          width: '350px',
          height: '350px',
          backgroundColor: 'rgba(0, 141, 81, 0.18)',
          filter: 'blur(110px)',
          borderRadius: '50%',
          pointerEvents: 'none',
        }}
      />

      {/* Signature Card */}
      <div
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(16px)',
          borderRadius: '28px',
          border: '1.5px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          padding: '2.75rem 2.5rem',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Top System Badge */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.4rem 0.95rem',
            borderRadius: '9999px',
            backgroundColor: 'rgba(231, 97, 20, 0.15)',
            border: '1px solid rgba(231, 97, 20, 0.35)',
            color: '#E76114',
            fontSize: '0.775rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1.75rem',
          }}
        >
          <Code size={14} />
          <span>System Signature & Developer Credits</span>
        </div>

        {/* Animation & Made with Love */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem', lineHeight: 1 }}>
            <span className="red-accent-icon">❤️</span>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
            Made with Love
          </h2>
        </div>

        {/* Developer Info Box */}
        <div
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '20px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.75rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.65rem',
          }}
        >
          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '-0.01em' }}>
            Muhammad Farhan Saputra
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              color: '#94a3b8',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            <Mail size={15} color="var(--secondary-color, #E76114)" />
            <a
              href="mailto:mhmmdfarhann05@gmail.com"
              style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#ffffff')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#cbd5e1')}
            >
              mhmmdfarhann05@gmail.com
            </a>
          </div>

          <div
            style={{
              fontSize: '0.75rem',
              color: '#64748b',
              fontWeight: 700,
              marginTop: '0.2rem',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              paddingTop: '0.65rem',
            }}
          >
            Recycle Material Management System — PT Sugity Creatives
          </div>
        </div>

        {/* Back Button */}
        <button
          onClick={() => navigate('/login')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.55rem',
            width: '100%',
            padding: '0.75rem 1.5rem',
            borderRadius: '16px',
            border: 'none',
            backgroundColor: 'var(--secondary-color, #E76114)',
            color: '#ffffff',
            fontSize: '0.9rem',
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(231, 97, 20, 0.35)',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
          }}
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Login</span>
        </button>
      </div>
    </div>
  );
};
