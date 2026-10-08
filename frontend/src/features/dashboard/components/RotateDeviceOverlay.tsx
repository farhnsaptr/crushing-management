import React from 'react';
import { Smartphone } from 'lucide-react';

/**
 * Pesan "putar ke landscape" untuk HP posisi vertikal. Selalu dirender; CSS (dashboard.css)
 * hanya menampilkannya saat lebar layar <= 767px dan orientasi portrait, sambil mem-blur dashboard.
 */
export const RotateDeviceOverlay: React.FC = () => (
  <div className="dash-rotate-overlay" role="alert">
    <Smartphone size={44} className="dash-rotate-icon" />
    <strong>Putar perangkat Anda</strong>
    <span>Posisikan HP secara horizontal (landscape) untuk melihat dashboard.</span>
  </div>
);
