import React from 'react';
import { Calendar, MapPin, RefreshCw } from 'lucide-react';

interface DashboardToolbarProps {
  locations: string[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  monthOptions: Array<{ value: number; label: string }>;
  selectedMonth: number;
  onMonthChange: (month: number) => void;
  selectedYear: number;
  onYearChange: (year: number) => void;
  onRefresh: () => void;
  dateText: string;
  userText: string;
}

const pillField: React.CSSProperties = {
  padding: '0.3rem 0.75rem',
  borderRadius: '14px',
  border: '1.5px solid var(--secondary-color, #e76114)',
  backgroundColor: 'var(--secondary-color, #e76114)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '0.78rem',
  outline: 'none',
};

/** Satu baris toolbar: judul, filter (lokasi/bulan/tahun), info user. */
export const DashboardToolbar: React.FC<DashboardToolbarProps> = ({
  locations,
  selectedLocation,
  onLocationChange,
  monthOptions,
  selectedMonth,
  onMonthChange,
  selectedYear,
  onYearChange,
  onRefresh,
  dateText,
  userText,
}) => {
  return (
    <div className="dash-bar">
      <div className="dash-bar-title">
        <h1>MATERIAL MANAGEMENT</h1>
        <p>Executive Overview & Data Analytics Daur Ulang Plastik — PT Sugity Creatives</p>
      </div>

      <div className="dash-bar-filters">
        {/* Plant Location Pill Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#f1f5f9',
            padding: '2px',
            borderRadius: '16px',
            border: '1px solid #cbd5e1',
          }}
        >
          {locations.map((loc) => {
            const isSelected = selectedLocation === loc;
            return (
              <button
                key={loc}
                type="button"
                onClick={() => onLocationChange(loc)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  flex: 1,
                  padding: '0.3rem 0.75rem',
                  borderRadius: '14px',
                  border: 'none',
                  backgroundColor: isSelected ? 'var(--secondary-color, #e76114)' : 'transparent',
                  color: isSelected ? '#ffffff' : '#64748b',
                  fontWeight: isSelected ? 800 : 600,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <MapPin size={13} />
                <span>{loc}</span>
              </button>
            );
          })}
        </div>

        {/* Month & Year */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Calendar size={15} color="var(--secondary-color, #e76114)" />
          <select value={selectedMonth} onChange={(e) => onMonthChange(Number(e.target.value))} style={{ ...pillField, cursor: 'pointer' }}>
            {monthOptions.map((m) => (
              <option key={m.value} value={m.value} style={{ backgroundColor: '#ffffff', color: '#0f172a' }}>
                {m.label}
              </option>
            ))}
          </select>
          <input
            type="number"
            className="no-spinner"
            value={selectedYear}
            onChange={(e) => onYearChange(Number(e.target.value))}
            min={2020}
            max={2035}
            style={{ ...pillField, width: '62px', textAlign: 'center', fontWeight: 800, MozAppearance: 'textfield' }}
          />
        </div>

        <button
          type="button"
          onClick={onRefresh}
          title="Refresh Data"
          style={{
            padding: '0.35rem',
            borderRadius: '50%',
            border: '1px solid #cbd5e1',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RefreshCw size={15} color="#64748b" />
        </button>
      </div>

      <div className="dash-bar-right">
        <div className="dash-bar-info">
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>{dateText}</div>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--secondary-color, #e76114)' }}>{userText}</div>
        </div>
      </div>
    </div>
  );
};
