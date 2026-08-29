import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Badge } from '../../../components/common/Badge';
import { Button } from '../../../components/common/Button';
import type { RunnerMaterialAnalyticsDetailResponse } from '../types/runnerMaterial.types';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LabelList,
} from 'recharts';
import { Layers, Scale, History, BarChart2, Calendar, Edit2, Trash2 } from 'lucide-react';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

interface RunnerMaterialDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialDetail: RunnerMaterialAnalyticsDetailResponse | null;
  isLoading: boolean;
  onSelectMonth?: (month: number) => void;
  onEditRecord?: (rec: any) => void;
  onDeleteRecord?: (id: string) => void;
  isAdminOrSuperAdmin?: boolean;
}

export const RunnerMaterialDetailModal: React.FC<RunnerMaterialDetailModalProps> = ({
  isOpen,
  onClose,
  materialDetail,
  isLoading,
  onSelectMonth,
  onEditRecord,
  onDeleteRecord,
  isAdminOrSuperAdmin = false,
}) => {
  if (!isOpen) return null;

  const currentMonth = materialDetail?.month || (new Date().getMonth() + 1);
  const currentMonthLabel = MONTH_NAMES[currentMonth - 1] || 'Bulan';

  const dailyData = materialDetail?.dailyTrend || [];
  const transactions = materialDetail?.transactions || [];

  // Calculate maximum total_kg for YAxis domain scaling
  const maxKg = dailyData.length > 0 ? Math.max(...dailyData.map((d) => d.total_kg || 0)) : 10;
  const yDomainMax = Math.ceil((maxKg > 0 ? maxKg : 10) * 1.35 + 2);

  // Custom Bar Label Renderer to display total_kg above bar
  const renderCustomBarLabel = (props: any) => {
    const { x, y, value } = props;
    if (value === undefined || value === null || Number(value) === 0) return null;
    return (
      <text
        x={x}
        y={y - 5}
        fill="#0f172a"
        textAnchor="middle"
        fontSize={10}
        fontWeight={900}
      >
        {value}
      </text>
    );
  };

  // Custom Tooltip with solid white background
  const CustomDetailTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]?.payload || {};
      const pagiKg = Number(data.pagi_kg || 0);
      const malamKg = Number(data.malam_kg || 0);
      const totalKg = Number(data.total_kg || (pagiKg + malamKg));

      return (
        <div
          style={{
            backgroundColor: '#ffffff',
            background: '#ffffff',
            opacity: 1,
            borderRadius: '10px',
            padding: '0.65rem 0.85rem',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.22)',
            border: '1px solid #cbd5e1',
            color: '#0f172a',
            fontSize: '0.775rem',
            minWidth: '190px',
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: '0.35rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.2rem', color: '#0f172a' }}>
            Tanggal {label} {currentMonthLabel} {materialDetail?.year}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#008d51', fontWeight: 800, marginBottom: '0.15rem' }}>
            <span>• Shift Pagi:</span>
            <span>{pagiKg.toFixed(2)} kg</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#e76114', fontWeight: 800, marginBottom: '0.25rem' }}>
            <span>• Shift Malam:</span>
            <span>{malamKg.toFixed(2)} kg</span>
          </div>
          <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.25rem', fontWeight: 900, display: 'flex', justifyContent: 'space-between', color: '#0f172a' }}>
            <span>Total Harian:</span>
            <span>{totalKg.toFixed(2)} kg</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail & Analisis Harian Runner Material: ${materialDetail?.materialName || 'Material'}`}
      size="lg"
    >
      {isLoading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Memuat grafik tren harian per shift & riwayat transaksi material...
        </div>
      ) : !materialDetail ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted, #64748b)' }}>
          Data analitik material tidak ditemukan.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Top KPI Cards Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--bg-main, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'rgba(0, 141, 81, 0.1)',
                  color: 'var(--primary-color, #008d51)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Layers size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                  Nama Material
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main, #0f172a)' }}>
                  {materialDetail.materialName}
                </h4>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--bg-main, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'var(--secondary-color, #e76114)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Scale size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                  Total Runner ({currentMonthLabel} {materialDetail.year})
                </span>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, margin: 0, color: 'var(--secondary-color, #e76114)' }}>
                  {materialDetail.totalWeightKg.toFixed(2)} kg
                </h4>
              </div>
            </div>

            <div
              style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md, 8px)',
                backgroundColor: 'var(--bg-main, #f8fafc)',
                border: '1px solid var(--border-color, #e2e8f0)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: 'var(--radius-md, 8px)',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <History size={20} />
              </div>
              <div>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                  Total Transaksi Input
                </span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: 0, color: 'var(--text-main, #0f172a)' }}>
                  {materialDetail.totalTransactions} Transaksi
                </h4>
              </div>
            </div>
          </div>

          {/* Daily Trend Recharts Stacked Bar Chart with Month Selector */}
          <div
            style={{
              padding: '1.25rem',
              borderRadius: 'var(--radius-md, 8px)',
              backgroundColor: 'var(--bg-card, #ffffff)',
              border: '1px solid var(--border-color, #e2e8f0)',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <BarChart2 size={18} color="var(--primary-color, #008d51)" />
                <h3 style={{ fontSize: '0.975rem', fontWeight: 800, color: 'var(--text-main, #0f172a)', margin: 0 }}>
                  Grafik Akumulasi Harian ({currentMonthLabel} {materialDetail.year})
                </h3>
              </div>

              {/* Month Selector Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Calendar size={16} color="var(--text-muted, #64748b)" />
                <label style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted, #64748b)' }}>
                  Pilih Bulan:
                </label>
                <select
                  value={currentMonth}
                  onChange={(e) => onSelectMonth && onSelectMonth(parseInt(e.target.value, 10))}
                  style={{
                    padding: '0.35rem 0.65rem',
                    borderRadius: 'var(--radius-md, 6px)',
                    border: '1.5px solid var(--border-color, #cbd5e1)',
                    backgroundColor: '#ffffff',
                    color: 'var(--text-main, #0f172a)',
                    fontSize: '0.825rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Recharts Daily Bar Chart (Shift Pagi & Shift Malam) */}
            <div style={{ width: '100%', height: '230px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={dailyData} margin={{ top: 16, right: 10, left: -20, bottom: 0 }} barCategoryGap="14%">
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="day_num"
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, yDomainMax]}
                    tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomDetailTooltip />}
                    wrapperStyle={{ zIndex: 1000, opacity: 1, outline: 'none' }}
                    contentStyle={{ backgroundColor: '#ffffff', background: '#ffffff', opacity: 1, border: 'none' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    align="center"
                    iconType="square"
                    iconSize={10}
                    wrapperStyle={{ paddingTop: '2px', fontSize: '0.725rem', fontWeight: 800 }}
                  />

                  {/* 1. Shift Pagi (Dark Green) */}
                  <Bar
                    dataKey="pagi_kg"
                    name="Shift Pagi"
                    stackId="a"
                    fill="#008d51"
                  />

                  {/* 2. Shift Malam (Dark Orange) */}
                  <Bar
                    dataKey="malam_kg"
                    name="Shift Malam"
                    stackId="a"
                    fill="#e76114"
                    radius={[3, 3, 0, 0]}
                  />

                  {/* Total Value Overlay */}
                  <Line
                    type="monotone"
                    dataKey="total_kg"
                    stroke="none"
                    legendType="none"
                    dot={false}
                    activeDot={false}
                    isAnimationActive={false}
                  >
                    <LabelList dataKey="total_kg" content={renderCustomBarLabel} />
                  </Line>
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transactions History Table for Selected Material & Month */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '0.975rem', fontWeight: 800, color: 'var(--text-main, #0f172a)' }}>
                Riwayat Transaksi Input Runner ({currentMonthLabel} {materialDetail.year}) — {transactions.length} Entry
              </h3>
            </div>

            {transactions.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted, #64748b)', backgroundColor: 'var(--bg-main, #f8fafc)', borderRadius: 'var(--radius-md, 8px)' }}>
                Belum ada transaksi runner untuk material "{materialDetail.materialName}" pada bulan {currentMonthLabel} {materialDetail.year}.
              </div>
            ) : (
              <div style={{ overflowX: 'auto', maxHeight: '250px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: 'var(--bg-main, #f1f5f9)', textAlign: 'left', color: 'var(--text-muted, #475569)' }}>
                      <th style={{ padding: '0.55rem 0.75rem' }}>No</th>
                      <th style={{ padding: '0.55rem 0.75rem' }}>Tanggal</th>
                      <th style={{ padding: '0.55rem 0.75rem' }}>Shift</th>
                      <th style={{ padding: '0.55rem 0.75rem', textAlign: 'right' }}>Runner (kg)</th>
                      <th style={{ padding: '0.55rem 0.75rem' }}>Batch Ref</th>
                      {isAdminOrSuperAdmin && (
                        <th style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>Aksi</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((rec, idx) => (
                      <tr key={rec.id || idx} style={{ borderBottom: '1px solid var(--border-color, #e2e8f0)' }}>
                        <td style={{ padding: '0.55rem 0.75rem', color: 'var(--text-muted, #64748b)' }}>
                          {idx + 1}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', fontWeight: 700, color: 'var(--text-main, #0f172a)' }}>
                          {rec.transaction_date}
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem' }}>
                          <Badge variant={rec.shift === 'Malam' ? 'warning' : 'success'} size="sm">
                            {rec.shift === 'Malam' ? 'Shift Malam' : 'Shift Pagi'}
                          </Badge>
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', textAlign: 'right', fontWeight: 900, color: 'var(--secondary-color, #e76114)' }}>
                          {Number(rec.total_runner_weight_kg || 0).toFixed(2)} kg
                        </td>
                        <td style={{ padding: '0.55rem 0.75rem', fontSize: '0.775rem', color: 'var(--text-muted, #64748b)' }}>
                          <code>{rec.import_batch_ref || '-'}</code>
                        </td>
                        {isAdminOrSuperAdmin && (
                          <td style={{ padding: '0.55rem 0.75rem', textAlign: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                              {onEditRecord && (
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => onEditRecord(rec)}
                                  title="Edit"
                                  leftIcon={<Edit2 size={12} />}
                                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.725rem' }}
                                >
                                  Edit
                                </Button>
                              )}
                              {onDeleteRecord && (
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => onDeleteRecord(rec.id)}
                                  title="Hapus"
                                  leftIcon={<Trash2 size={12} />}
                                  style={{ padding: '0.2rem 0.4rem', fontSize: '0.725rem' }}
                                >
                                  Hapus
                                </Button>
                              )}
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </Modal>
  );
};
