import React from 'react';
import { Card } from '../../../components/common/Card';
import { Input } from '../../../components/common/Input';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import type { RunnerMaterialSummaryItem, RunnerMaterialAnalyticsSummaryResponse } from '../types/runnerMaterial.types';
import { Search, Layers, Scale, Calendar, BarChart3, ChevronRight, Award, Trophy } from 'lucide-react';

interface RunnerMaterialSortedListProps {
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  selectedMonth: number;
  setSelectedMonth: (month: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'weight_desc' | 'weight_asc' | 'name_asc' | 'transactions_desc';
  setSortBy: (sort: 'weight_desc' | 'weight_asc' | 'name_asc' | 'transactions_desc') => void;
  summaryData: RunnerMaterialAnalyticsSummaryResponse | null;
  isLoading: boolean;
  sortedMaterials: RunnerMaterialSummaryItem[];
  onSelectMaterial: (materialName: string) => void;
}

export const RunnerMaterialSortedList: React.FC<RunnerMaterialSortedListProps> = ({
  selectedYear,
  setSelectedYear,
  selectedMonth,
  setSelectedMonth,
  searchQuery,
  setSearchQuery,
  sortBy,
  setSortBy,
  summaryData,
  isLoading,
  sortedMaterials,
  onSelectMaterial,
}) => {
  const months = [
    { value: 0, label: 'Semua Bulan' },
    { value: 1, label: 'Januari' },
    { value: 2, label: 'Februari' },
    { value: 3, label: 'Maret' },
    { value: 4, label: 'April' },
    { value: 5, label: 'Mei' },
    { value: 6, label: 'Juni' },
    { value: 7, label: 'Juli' },
    { value: 8, label: 'Agustus' },
    { value: 9, label: 'September' },
    { value: 10, label: 'Oktober' },
    { value: 11, label: 'November' },
    { value: 12, label: 'Desember' },
  ];

  const years = [2026, 2025, 2024];

  const grandTotal = summaryData?.grandTotalKg || 0;

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return { bg: '#fef3c7', border: '#f59e0b', color: '#b45309' }; // Gold
    if (rank === 2) return { bg: '#f1f5f9', border: '#94a3b8', color: '#475569' }; // Silver
    if (rank === 3) return { bg: '#ffedd5', border: '#f97316', color: '#c2410c' }; // Bronze
    return { bg: 'var(--bg-main, #f8fafc)', border: 'var(--border-color, #e2e8f0)', color: 'var(--text-muted, #64748b)' };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Filter & Search Bar */}
      <Card style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
              Detail & Agregasi Material Runner
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)', marginTop: '0.2rem' }}>
              Urutan akumulasi berat runner per jenis material dan grafik tren bulanan.
            </p>
          </div>

          <Badge variant="info">
            Total {summaryData?.totalMaterialsCount || 0} Jenis Material ({grandTotal.toFixed(3)} kg)
          </Badge>
        </div>

        {/* Filter Controls Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
          {/* Year Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)' }}>Tahun</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                color: 'var(--text-main, #0f172a)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          {/* Month Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)' }}>Bulan</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                color: 'var(--text-main, #0f172a)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
          </div>

          {/* Sort By Select */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)' }}>Urutkan Berdasarkan</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                padding: '0.55rem 0.75rem',
                borderRadius: 'var(--radius-md, 8px)',
                border: '1px solid var(--border-color, #cbd5e1)',
                backgroundColor: 'var(--bg-card, #ffffff)',
                color: 'var(--text-main, #0f172a)',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <option value="weight_desc">Berat Runner (Tertinggi → Terendah)</option>
              <option value="weight_asc">Berat Runner (Terendah → Tertinggi)</option>
              <option value="transactions_desc">Jumlah Transaksi Terbanyak</option>
              <option value="name_asc">Nama Material (A - Z)</option>
            </select>
          </div>

          {/* Search Query Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            <label style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)' }}>Cari Material</label>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama material..."
              leftIcon={<Search size={15} />}
            />
          </div>
        </div>
      </Card>

      {/* Sorted Material List Grid / Cards */}
      {isLoading ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Memuat rincian agregasi material runner...
        </Card>
      ) : sortedMaterials.length === 0 ? (
        <Card style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Tidak ada data runner material untuk periode / pencarian yang dipilih.
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {sortedMaterials.map((mat) => {
            const rankStyle = getRankBadgeColor(mat.rank);
            const percentage = grandTotal > 0 ? (mat.total_runner_weight_kg / grandTotal) * 100 : 0;

            return (
              <Card
                key={mat.material_name}
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                  cursor: 'pointer',
                }}
                onClick={() => onSelectMaterial(mat.material_name)}
              >
                {/* Material Title & Rank */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', minWidth: '240px' }}>
                  <div
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: 'var(--radius-md, 8px)',
                      backgroundColor: rankStyle.bg,
                      border: `1px solid ${rankStyle.border}`,
                      color: rankStyle.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 900,
                      fontSize: '1rem',
                      flexShrink: 0,
                    }}
                  >
                    #{mat.rank}
                  </div>

                  <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Layers size={17} color="var(--primary-color, #008d51)" />
                      <span>{mat.material_name}</span>
                    </h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted, #64748b)', marginTop: '0.2rem', display: 'block' }}>
                      {mat.total_transactions} kali transaksi recorded
                    </span>
                  </div>
                </div>

                {/* Runner Weight Metric & Progress Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                  <div style={{ minWidth: '160px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                      <span>Kontribusi Material</span>
                      <span>{percentage.toFixed(1)}%</span>
                    </div>
                    <div style={{ height: '8px', width: '100%', backgroundColor: 'var(--bg-main, #e2e8f0)', borderRadius: '9999px', marginTop: '0.35rem', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(percentage, 100)}%`,
                          backgroundColor: 'var(--secondary-color, #e76114)',
                          borderRadius: '9999px',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                      Total Berat Runner
                    </span>
                    <h4 style={{ fontSize: '1.25rem', fontWeight: 900, color: 'var(--secondary-color, #e76114)', margin: 0 }}>
                      {mat.total_runner_weight_kg.toFixed(3)} <span style={{ fontSize: '0.85rem' }}>kg</span>
                    </h4>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectMaterial(mat.material_name);
                    }}
                    rightIcon={<ChevronRight size={16} />}
                    style={{ fontWeight: 700, padding: '0.5rem 0.85rem' }}
                  >
                    Detail & Grafik
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
