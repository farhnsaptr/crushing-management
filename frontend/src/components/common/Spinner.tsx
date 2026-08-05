import React from 'react';
import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  size?: number;
  color?: string;
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 32,
  color = 'var(--primary-color)',
  className = '',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
      }}
      className={className}
    >
      <Loader2
        size={size}
        style={{
          color,
          animation: 'spin 1s linear infinite',
        }}
      />
    </div>
  );
};
