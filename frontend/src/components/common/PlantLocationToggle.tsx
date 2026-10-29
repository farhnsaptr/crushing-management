import React from 'react';
import { MapPin } from 'lucide-react';

interface PlantLocationToggleProps {
 locations: string[];
 value: string;
 onChange: (location: string) => void;
}

export const PlantLocationToggle: React.FC<PlantLocationToggleProps> = ({ locations, value, onChange }) => {
 if (locations.length === 0) return null;

 return (
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
 const isSelected = value === loc;
 return (
 <button
 key={loc}
 type="button"
 onClick={() => onChange(loc)}
 style={{
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 gap: '0.3rem',
 padding: '0.3rem 0.75rem',
 borderRadius: '14px',
 border: 'none',
 backgroundColor: isSelected ? 'var(--secondary-color, #e76114)' : 'transparent',
 color: isSelected ? '#ffffff' : '#64748b',
 fontWeight: isSelected ? 800 : 600,
 fontSize: '0.78rem',
 cursor: 'pointer',
 }}
 >
 <MapPin size={13} />
 <span>{loc}</span>
 </button>
 );
 })}
 </div>
 );
};
