import React from 'react';
import { X, Layers, AlertCircle, Weight } from 'lucide-react';
import type { PartMonthlyDetailResponse, PartSummaryItem } from '../types/ngInput.types';
import { NgDailyChart } from './NgDailyChart';
import { NgTransactionLogTable } from './NgTransactionLogTable';

interface NgPartDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  partSummary: PartSummaryItem | null;
  partDetail: PartMonthlyDetailResponse | null;
  isLoading: boolean;
  monthLabel: string;
  year: number;
}

export const NgPartDetailModal: React.FC<NgPartDetailModalProps> = ({
  isOpen,
  onClose,
  partSummary,
  partDetail,
  isLoading,
  monthLabel,
  year,
}) => {
  if (!isOpen) return null;

  const partName = partDetail?.part.part_name || partSummary?.part_name || 'Part Detail';
  const allowanceKg = partDetail?.part.allowance_kg ?? partSummary?.allowance_kg ?? 0;

  // Calculate summary KPI values
  const totalWeightKg = partSummary?.total_weight_kg ?? (
    partDetail?.transactions.reduce((acc, curr) => acc + Number(curr.weight_kg), 0) || 0
  );
  const totalPcs = partSummary?.total_quantity_pcs ?? (
    partDetail?.transactions.reduce((acc, curr) => acc + Number(curr.quantity_pcs), 0) || 0
  );

  const exceededDaysCount = partDetail?.daily_chart.filter((d) => d.is_exceeded).length || 0;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(6px)',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem',
      }}
      onClick={onClose}
    >
      <style>{`
        .ng-modal-box {
          background-color: #f8fafc;
          border-radius: 24px;
          width: 100%;
          max-width: 920px;
          max-height: 92vh;
          overflow-y: auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          padding: 1.75rem 2rem;
          color: #0f172a;
          position: relative;
          border: 1px solid #e2e8f0;
        }
        .ng-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .ng-modal-kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-bottom: 1.25rem;
        }
        @media (max-width: 640px) {
          .ng-modal-box {
            padding: 1.15rem 1rem !important;
            border-radius: 18px !important;
            max-height: 96vh !important;
          }
          .ng-modal-header {
            gap: 0.75rem !important;
          }
          .ng-modal-title {
            font-size: 1.35rem !important;
          }
          .ng-modal-kpi-grid {
            grid-template-columns: 1fr !important;
            gap: 0.65rem !important;
          }
        }
      `}</style>

      <div className="ng-modal-box" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="ng-modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
              <h2 className="ng-modal-title" style={{ fontSize: '1.6rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.1 }}>
                {partName}
              </h2>
              {partDetail?.part.model && (
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    backgroundColor: 'rgba(231, 97, 20, 0.12)',
                    color: '#e76114',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                  }}
                >
                  {partDetail.part.model}
                </span>
              )}

              {partDetail?.part.plant_location && (
                <span
                  style={{
                    padding: '0.2rem 0.6rem',
                    backgroundColor: 'rgba(15, 23, 42, 0.08)',
                    color: '#0f172a',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                  }}
                >
                  Plant: {partDetail.part.plant_location}
                </span>
              )}
            </div>

            {partDetail?.part.part_number && (
              <p style={{ fontSize: '0.825rem', color: '#64748b', margin: '0.35rem 0 0 0', fontWeight: 600 }}>
                Part No: <strong style={{ color: '#0f172a' }}>{partDetail.part.part_number}</strong> | Material: <strong style={{ color: '#0f172a' }}>{partDetail.part.material}</strong>
              </p>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: 'auto' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0f172a', display: 'block', lineHeight: 1.1 }}>
                {monthLabel} {year}
              </span>
              <span style={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748b' }}>
                Periode Laporan
              </span>
            </div>

            <button
              onClick={onClose}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                cursor: 'pointer',
                color: '#0f172a',
                padding: '0.45rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
              title="Tutup Modal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {isLoading ? (
          <div style={{ padding: '3.5rem 1rem', textAlign: 'center', color: '#64748b', fontWeight: 600, fontSize: '0.9rem' }}>
            Memuat grafik analitik & histori transaksi...
          </div>
        ) : (
          <div>
            {/* KPI Summary Cards */}
            <div className="ng-modal-kpi-grid">
              {/* Card 1: Total NG */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}
              >
                <div style={{ padding: '0.6rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', color: '#059669', flexShrink: 0 }}>
                  <Weight size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Total Berat NG
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#059669', marginTop: '0.1rem' }}>
                    {Number(totalWeightKg).toFixed(2)} Kg <span style={{ fontSize: '0.775rem', color: '#64748b', fontWeight: 600 }}>({totalPcs} pcs)</span>
                  </div>
                </div>
              </div>

              {/* Card 2: Allowance Limit */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}
              >
                <div style={{ padding: '0.6rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px', color: '#ef4444', flexShrink: 0 }}>
                  <Layers size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Batas Allowance Part
                  </span>
                  <div style={{ fontSize: '1.15rem', fontWeight: 900, color: '#ef4444', marginTop: '0.1rem' }}>
                    {allowanceKg > 0 ? `${allowanceKg} Kg / hari` : 'Belum di-set'}
                  </div>
                </div>
              </div>

              {/* Card 3: Allowance Status */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  padding: '0.85rem 1.15rem',
                  borderRadius: '16px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                }}
              >
                <div
                  style={{
                    padding: '0.6rem',
                    backgroundColor: exceededDaysCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                    borderRadius: '12px',
                    color: exceededDaysCount > 0 ? '#ef4444' : '#059669',
                    flexShrink: 0,
                  }}
                >
                  <AlertCircle size={22} />
                </div>
                <div>
                  <span style={{ fontSize: '0.725rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    Status Allowance
                  </span>
                  <div
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      color: exceededDaysCount > 0 ? '#ef4444' : '#059669',
                      marginTop: '0.1rem',
                    }}
                  >
                    {exceededDaysCount > 0
                      ? `${exceededDaysCount} Hari Melebihi Allowance`
                      : 'Dalam Batas Allowance'}
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Stacked Chart */}
            <div style={{ backgroundColor: '#ffffff', padding: '1rem', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Grafik Akumulasi NG Harian per Shift (Pagi vs Malam)
                </h4>
              </div>
              {partDetail?.daily_chart && (
                <NgDailyChart data={partDetail.daily_chart} allowanceKg={allowanceKg} />
              )}
            </div>

            {/* Log Transaction Table */}
            {partDetail?.transactions && (
              <div style={{ marginTop: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.65rem' }}>
                  Log Transaksi Input NG Bulan Ini
                </h4>
                <NgTransactionLogTable transactions={partDetail.transactions} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
