import React from 'react';
import { Input } from '../../../components/common/Input';

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** Pemilih warna (color picker + input hex) yang dipakai di halaman Site Configuration. */
export const ColorField: React.FC<ColorFieldProps> = ({ label, value, onChange, placeholder }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
    <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>{label}</label>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ width: '42px', height: '42px', border: 'none', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
      />
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  </div>
);
