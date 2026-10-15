import React from 'react';
import { VerificationFormCard } from '../components/VerificationFormCard';
import { useVerification } from '../hooks/useVerification';
import { Toast } from '../../../components/common/Toast';
import { CheckSquare } from 'lucide-react';

import { useIsNarrow } from '../../../hooks';

export const VerificationPage: React.FC = () => {
  const [containerRef, isNarrow] = useIsNarrow<HTMLDivElement>(768);
  const {
    date,
    setDate,
    shift,
    setShift,
    locations,
    location,
    setLocation,
    notes,
    setNotes,
    data,
    items,
    isLoading,
    isSaving,
    toast,
    setToast,
    handleUpdateItem,
    handleSaveVerification,
    totals,
  } = useVerification();

  return (
    <div ref={containerRef} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', paddingBottom: '2rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: isNarrow ? '38px' : '44px',
              height: isNarrow ? '38px' : '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(0, 141, 81, 0.12)',
              color: '#008d51',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckSquare size={isNarrow ? 20 : 24} />
          </div>
          <div>
            <h1 style={{ fontSize: isNarrow ? '1.15rem' : '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Verifikasi Output Crushing
            </h1>
            <p style={{ fontSize: isNarrow ? '0.75rem' : '0.825rem', color: '#64748b', margin: '0.15rem 0 0 0' }}>
              Validasi hasil timbang fisik crushing reuse shift ini.
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Main Verification Form Card */}
      <VerificationFormCard
        date={date}
        setDate={setDate}
        shift={shift}
        setShift={setShift}
        locations={locations}
        location={location}
        setLocation={setLocation}
        notes={notes}
        setNotes={setNotes}
        data={data}
        items={items}
        isLoading={isLoading}
        isSaving={isSaving}
        onUpdateItem={handleUpdateItem}
        onSave={handleSaveVerification}
        totals={totals}
      />
    </div>
  );
};

export default VerificationPage;
