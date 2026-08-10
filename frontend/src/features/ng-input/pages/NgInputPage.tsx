import React from 'react';
import { useNgInput } from '../hooks/useNgInput';
import { NgFilterCard } from '../components/NgFilterCard';
import { NgPartGridCard } from '../components/NgPartGridCard';
import { NgInputFormCard } from '../components/NgInputFormCard';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Toast } from '../../../components/common/Toast';
import { Search, X } from 'lucide-react';

export const NgInputPage: React.FC = () => {
  const {
    filterMode,
    setFilterMode,
    selectedJenis,
    setSelectedJenis,
    jenisOptions,
    selectedFactoryId,
    setSelectedFactoryId,
    searchQuery,
    setSearchQuery,
    factories,
    filteredParts,
    isLoadingParts,
    selectedPart,
    handleSelectPart,
    quantityPcs,
    setQuantityPcs,
    shift,
    setShift,
    transactionDate,
    setTransactionDate,
    notes,
    setNotes,
    estimatedWeightKg,
    isSubmitting,
    handleSubmit,
    toast,
    setToast,
  } = useNgInput();

  const gridTitle =
    filterMode === 'jenis'
      ? `Daftar Part — ${selectedJenis}`
      : `Daftar Part — ${factories.find((f) => f.id === selectedFactoryId)?.name || 'Factory'}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Split Main Layout: Left (Filter + Grid Cards) vs Right (Input Form Card) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.25rem',
          alignItems: 'start',
        }}
      >
        {/* Left Side: Filter & Grid Selection (~65% width) */}
        <div style={{ flex: '1 1 62%', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <NgFilterCard
            filterMode={filterMode}
            onFilterModeChange={setFilterMode}
            selectedJenis={selectedJenis}
            onSelectJenis={setSelectedJenis}
            jenisOptions={jenisOptions}
            selectedFactoryId={selectedFactoryId}
            onSelectFactoryId={setSelectedFactoryId}
            factories={factories}
          />

          {/* Search Card below Mode Pengelompokan */}
          <Card style={{ padding: '0.85rem 1.15rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ flex: 1 }}>
                <Input
                  placeholder="Cari nama part, part number, model, kode sebango..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  leftIcon={<Search size={18} />}
                />
              </div>
              {searchQuery && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  style={{ fontSize: '0.8rem', padding: '0.5rem 0.75rem', gap: '0.3rem' }}
                >
                  <X size={14} />
                  <span>Reset</span>
                </Button>
              )}
            </div>
          </Card>

          <NgPartGridCard
            parts={filteredParts}
            isLoading={isLoadingParts}
            selectedPartId={selectedPart?.id || null}
            onSelectPart={handleSelectPart}
            title={gridTitle}
          />
        </div>

        {/* Right Side: Quick Form Input Card (~35% width) */}
        <div style={{ flex: '1 1 36%', position: 'sticky', top: '1.5rem' }}>
          <NgInputFormCard
            selectedPart={selectedPart}
            quantityPcs={quantityPcs}
            onQuantityChange={setQuantityPcs}
            shift={shift}
            onShiftChange={setShift}
            transactionDate={transactionDate}
            onTransactionDateChange={setTransactionDate}
            notes={notes}
            onNotesChange={setNotes}
            estimatedWeightKg={estimatedWeightKg}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
