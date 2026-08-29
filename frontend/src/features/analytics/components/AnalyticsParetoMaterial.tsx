import React, { useState } from 'react';
import { Card } from '../../../components/common/Card';
import { Badge } from '../../../components/common/Badge';
import { Layers, Box, TrendingUp, Info } from 'lucide-react';
import type { ParetoMaterialsResponse } from '../types/analytics.types';

interface AnalyticsParetoMaterialProps {
  data: ParetoMaterialsResponse | null;
  year: number;
  isLoading?: boolean;
}

export const AnalyticsParetoMaterial: React.FC<AnalyticsParetoMaterialProps> = ({
  data,
  year,
  isLoading,
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const items = data?.items || [];
  const topItems = items.slice(0, 15); // Top 15 materials for chart

  const maxWeight = Math.max(...topItems.map((i) => i.total_weight_kg), 10);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Overview & Pareto Chart Card */}
      <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Layers size={20} color="#008d51" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                Analisis Pareto Material Resin (Tahun {year})
              </h2>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Distribusi akumulasi volume material resin (Part NG + Runner) diurutkan dari bobot tertinggi (Prinsip Pareto 80/20).
            </p>
          </div>

          {/* Metric Summary Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <div style={{ padding: '0.45rem 0.85rem', borderRadius: '10px', backgroundColor: 'rgba(0, 141, 81, 0.08)', border: '1px solid rgba(0, 141, 81, 0.2)' }}>
              <span style={{ fontSize: '0.75rem', color: '#008d51', fontWeight: 700 }}>Total Berat: </span>
              <strong style={{ fontSize: '0.9rem', color: '#008d51', fontWeight: 900 }}>
                {data?.grand_total_kg?.toFixed(2) || 0} kg
              </strong>
            </div>
            <div style={{ padding: '0.45rem 0.85rem', borderRadius: '10px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 700 }}>Total Material: </span>
              <strong style={{ fontSize: '0.9rem', color: '#1e293b', fontWeight: 900 }}>
                {data?.total_materials_count || 0} Jenis
              </strong>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
            <div style={{ width: '14px', height: '14px', borderRadius: '4px', backgroundColor: '#008d51' }} />
            <span>Total Berat Material (kg) [Sumbu Kiri]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: '#475569' }}>
            <div style={{ width: '18px', height: '3px', backgroundColor: '#e76114', borderRadius: '2px' }} />
            <span>Persentase Kumulatif (%) [Sumbu Kanan]</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.8rem', fontWeight: 700, color: '#dc2626' }}>
            <div style={{ width: '18px', height: '2px', borderTop: '2px dashed #dc2626' }} />
            <span>Garis Batas 80% (Pareto Cut-off)</span>
          </div>
        </div>

        {/* Pareto Chart Visual */}
        {isLoading ? (
          <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}>
            Memuat grafik Pareto material...
          </div>
        ) : topItems.length === 0 ? (
          <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
            Belum ada data transaksi material pada tahun {year}.
          </div>
        ) : (
          <div style={{ position: 'relative', height: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', paddingTop: '1.5rem' }}>
            {/* 80% Dashed Reference Line */}
            <div
              style={{
                position: 'absolute',
                top: `${100 - 80}%`,
                left: 0,
                right: 0,
                borderTop: '2px dashed rgba(220, 38, 38, 0.6)',
                zIndex: 5,
                pointerEvents: 'none',
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  right: '0.5rem',
                  bottom: '3px',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  color: '#dc2626',
                  backgroundColor: '#ffffff',
                  padding: '1px 5px',
                  borderRadius: '4px',
                }}
              >
                80% Cut-off
              </span>
            </div>

            {/* Grid Area */}
            <div
              style={{
                height: '260px',
                display: 'grid',
                gridTemplateColumns: `repeat(${topItems.length}, 1fr)`,
                gap: '0.65rem',
                alignItems: 'flex-end',
                borderBottom: '2px solid #e2e8f0',
                position: 'relative',
                zIndex: 10,
              }}
            >
              {topItems.map((item, idx) => {
                const heightPct = maxWeight > 0 ? (item.total_weight_kg / maxWeight) * 100 : 0;
                const isHovered = hoveredIdx === idx;
                const isVital80 = item.cumulative_percentage <= 80 || (idx > 0 && topItems[idx - 1].cumulative_percentage < 80);

                return (
                  <div
                    key={idx}
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      height: '100%',
                      position: 'relative',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      padding: '0.15rem',
                      backgroundColor: isHovered ? 'rgba(0, 141, 81, 0.05)' : 'transparent',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {/* Tooltip on Hover */}
                    {isHovered && (
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '105%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          backgroundColor: '#0f172a',
                          color: '#ffffff',
                          padding: '0.75rem 0.95rem',
                          borderRadius: '10px',
                          fontSize: '0.75rem',
                          whiteSpace: 'nowrap',
                          zIndex: 40,
                          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                          pointerEvents: 'none',
                        }}
                      >
                        <div style={{ fontWeight: 800, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '0.35rem', marginBottom: '0.35rem' }}>
                          #{item.rank} {item.material_name}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                          <div>Total Berat: <strong>{item.total_weight_kg.toFixed(2)} kg</strong></div>
                          <div style={{ color: '#93c5fd' }}>Part NG: {item.ng_weight_kg.toFixed(2)} kg</div>
                          <div style={{ color: '#c084fc' }}>Runner: {item.runner_weight_kg.toFixed(2)} kg</div>
                          <div style={{ color: '#86efac' }}>Kontribusi: <strong>{item.percentage}%</strong></div>
                          <div style={{ color: '#fdba74', fontWeight: 800, borderTop: '1px dashed rgba(255,255,255,0.2)', paddingTop: '0.25rem', marginTop: '0.15rem' }}>
                            Kumulatif: {item.cumulative_percentage}%
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bar Component */}
                    <div
                      style={{
                        width: '80%',
                        height: `${Math.max(heightPct, 4)}%`,
                        backgroundColor: isVital80 ? '#008d51' : '#64748b',
                        borderRadius: '5px 5px 0 0',
                        transition: 'height 0.3s ease',
                        boxShadow: isHovered ? '0 0 8px rgba(0, 141, 81, 0.5)' : 'none',
                        position: 'relative',
                      }}
                    >
                      {/* Cumulative Line Dot Position */}
                      <div
                        style={{
                          position: 'absolute',
                          top: `${100 - item.cumulative_percentage}%`,
                          left: '50%',
                          transform: 'translate(-50%, -50%)',
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          backgroundColor: '#e76114',
                          border: '2px solid #ffffff',
                          boxShadow: '0 0 4px rgba(0,0,0,0.3)',
                          zIndex: 15,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Labels Under Bars */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${topItems.length}, 1fr)`,
                gap: '0.65rem',
                textAlign: 'center',
                paddingTop: '0.5rem',
              }}
            >
              {topItems.map((item, idx) => (
                <div
                  key={idx}
                  title={item.material_name}
                  style={{
                    fontSize: '0.725rem',
                    fontWeight: hoveredIdx === idx ? 900 : 700,
                    color: hoveredIdx === idx ? '#008d51' : '#475569',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {item.material_name}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Pareto Materials Ranking Table */}
      <Card style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <TrendingUp size={18} color="#008d51" /> Tabel Ranking Pareto Material Resin
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.2rem 0 0 0' }}>
              Daftar urutan material dari kontribusi berat terbesar beserta persentase kumulatifnya.
            </p>
          </div>
        </div>

        <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#1e293b', width: '70px', textAlign: 'center' }}>Rank</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#1e293b' }}>Nama Material Resin</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#1e293b', textAlign: 'right' }}>Part NG (kg)</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#1e293b', textAlign: 'right' }}>Runner (kg)</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#1e293b', textAlign: 'right' }}>Total Berat (kg)</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#1e293b', textAlign: 'right' }}>Kontribusi</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#1e293b', textAlign: 'right' }}>Kumulatif (%)</th>
                <th style={{ padding: '0.85rem 1rem', fontWeight: 800, color: '#1e293b', textAlign: 'center' }}>Klasifikasi</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '2.5rem', textAlign: 'center', color: '#94a3b8' }}>
                    Belum ada data material untuk ditampilkan.
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isVital80 = item.cumulative_percentage <= 80 || (item.rank > 1 && items[item.rank - 2].cumulative_percentage < 80);

                  return (
                    <tr
                      key={item.rank}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        backgroundColor: isVital80 ? 'rgba(0, 141, 81, 0.02)' : 'transparent',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', fontWeight: 900, color: item.rank <= 3 ? '#008d51' : '#64748b' }}>
                        #{item.rank}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 800, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Box size={16} color="#008d51" />
                          <span>{item.material_name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#475569' }}>
                        {item.ng_weight_kg.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', color: '#475569' }}>
                        {item.runner_weight_kg.toFixed(2)}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 900, color: '#0f172a' }}>
                        {item.total_weight_kg.toFixed(2)} kg
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#008d51' }}>
                        {item.percentage}%
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 800, color: '#e76114' }}>
                        {item.cumulative_percentage}%
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                        <Badge variant={isVital80 ? 'success' : 'neutral'} size="sm">
                          {isVital80 ? 'Top 80% (Vital)' : '20% (Trivial)'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
