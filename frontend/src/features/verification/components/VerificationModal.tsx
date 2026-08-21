import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { VerificationFormCard } from './VerificationFormCard';
import { useVerification } from '../hooks/useVerification';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: string;
  initialShift?: 'Pagi' | 'Malam';
  onSuccessSave?: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  isOpen,
  onClose,
  initialDate,
  initialShift,
  onSuccessSave,
}) => {
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
    handleUpdateItem,
    handleSaveVerification,
    totals,
  } = useVerification(initialDate, initialShift);

  if (!isOpen) return null;

  const onSaveAndClose = async () => {
    await handleSaveVerification();
    if (onSuccessSave) onSuccessSave();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Verifikasi Input & Output Crushing (End-of-Shift)"
      size="xl"
    >
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
        onSave={onSaveAndClose}
        totals={totals}
      />
    </Modal>
  );
};
