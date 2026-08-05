import React from 'react';
import { useAuthForm } from '../hooks/useAuthForm';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { User, Lock, AlertCircle } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    error,
    isLoading,
    handleSubmit,
  } = useAuthForm();

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.875rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: 'var(--radius-md)',
            color: '#ef4444',
            fontSize: '0.875rem',
            fontWeight: 500,
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <Input
        label="Username"
        type="text"
        placeholder="Masukkan username anda"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        leftIcon={<User size={18} />}
        required
      />

      <Input
        label="Password"
        type="password"
        placeholder="Masukkan password anda"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        leftIcon={<Lock size={18} />}
        required
      />

      <div style={{ marginTop: '0.5rem' }}>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={isLoading}
          style={{ width: '100%' }}
        >
          Masuk
        </Button>
      </div>
    </form>
  );
};
