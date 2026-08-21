import React from 'react';
import { VerificationFormCard } from '../components/VerificationFormCard';
import { useVerification } from '../hooks/useVerification';
import { Toast } from '../../../components/common/Toast';
import { CheckSquare } from 'lucide-react';

export const VerificationPage: React.FC = () => {
  const {
    date,
    setDate,
    shift,
    setShift,
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      {/* Page Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          borderBottom: '2px solid #e2e8f0',
          paddingBottom: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'rgba(0, 141, 81, 0.12)',
              color: '#008d51',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckSquare size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Verifikasi Input & Output Crushing
            </h1>
            <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Validasi hasil akhir shift pekerjaan crushing material reuse dengan pencocokan box di dunia nyata.
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
