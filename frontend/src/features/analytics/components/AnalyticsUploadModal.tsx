import React, { useState, useRef, useMemo } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import { AnalyticsService } from '../services/analytics.service';
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Search,
  RefreshCw,
  Info,
} from 'lucide-react';
import type {
  RawProductionCsvRow,
  ProductionPreviewResponse,
} from '../types/analytics.types';

interface AnalyticsUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (filename: string, records: RawProductionCsvRow[], batchName?: string) => Promise<void>;
  isUploading: boolean;
}

export const AnalyticsUploadModal: React.FC<AnalyticsUploadModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  isUploading,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [batchTitle, setBatchTitle] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<RawProductionCsvRow[]>([]);
  const [previewData, setPreviewData] = useState<ProductionPreviewResponse | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [parseError, setParseError] = useState<string | null>(null);

  // Filter state for preview table
  const [previewTab, setPreviewTab] = useState<'all' | 'matched' | 'unmatched'>('all');
  const [previewSearch, setPreviewSearch] = useState<string>('');
  const [previewPage, setPreviewPage] = useState<number>(1);
  const itemsPerPage = 15;

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simple CSV parser for RFC 4180 / quoted CSV
  const parseCsvText = async (text: string) => {
    try {
      const lines = text.split(/\r\n|\n/).filter((l) => l.trim().length > 0);
      if (lines.length < 2) {
        throw new Error('File CSV kosong atau tidak memiliki baris data.');
      }

      // Helper to parse a single CSV line with quotes
      const parseCsvLine = (line: string): string[] => {
        const result: string[] = [];
        let cur = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(cur.trim());
            cur = '';
          } else {
            cur += char;
          }
        }
        result.push(cur.trim());
        return result.map((c) => c.replace(/^"|"$/g, '').trim());
      };

      const headers = parseCsvLine(lines[0]).map((h) => h.toUpperCase().trim());

      const dateIdx = headers.indexOf('DATE');
      const factoryIdx = headers.indexOf('FACTORY');
      const tonaseIdx = headers.indexOf('TONASE');
      const sebangoIdx = headers.indexOf('SEBANGO');
      const shiftIdx = headers.indexOf('SHIFT');
      const operatorIdx = headers.indexOf('OPERATOR');
      const mesinIdx = headers.indexOf('MESIN');
      const actTotalIdx = headers.findIndex((h) => h.includes('ACT TOTAL') || h === 'ACT_TOTAL');
      const actOkIdx = headers.findIndex((h) => h.includes('ACT OK') || h === 'ACT_OK');
      const ngTotalIdx = headers.findIndex((h) => h.includes('NG TOTAL') || h === 'NG_TOTAL');

      if (dateIdx === -1 || sebangoIdx === -1) {
        throw new Error('Format kolom tidak sesuai: Kolom "DATE" dan "SEBANGO" wajib ada di header CSV.');
      }

      const rows: RawProductionCsvRow[] = [];

      for (let i = 1; i < lines.length; i++) {
        const cols = parseCsvLine(lines[i]);
        if (cols.length <= 1) continue;

        const rowDate = cols[dateIdx] || '';
        const rowSebango = cols[sebangoIdx] || '';

        if (!rowDate || !rowSebango) continue;

        rows.push({
          date: rowDate,
          factory: factoryIdx !== -1 ? cols[factoryIdx] : undefined,
          tonase: tonaseIdx !== -1 ? cols[tonaseIdx] : undefined,
          sebango: rowSebango,
          shift: shiftIdx !== -1 ? cols[shiftIdx] : undefined,
          operator: operatorIdx !== -1 ? cols[operatorIdx] : undefined,
          mesin: mesinIdx !== -1 ? cols[mesinIdx] : undefined,
          act_total: actTotalIdx !== -1 ? parseInt(cols[actTotalIdx], 10) || 0 : 0,
          act_ok: actOkIdx !== -1 ? parseInt(cols[actOkIdx], 10) || 0 : 0,
          ng_total: ngTotalIdx !== -1 ? parseInt(cols[ngTotalIdx], 10) || 0 : 0,
        });
      }

      if (rows.length === 0) {
        throw new Error('Tidak ada baris data yang berhasil diparsing.');
      }

      setParsedRows(rows);
      setParseError(null);

      // Call backend preview API to match with master_parts
      setIsPreviewLoading(true);
      try {
        const previewRes = await AnalyticsService.previewProductionReport(rows);
        setPreviewData(previewRes);
      } catch (previewErr: any) {
        console.error('Preview error:', previewErr);
        setParseError(previewErr?.response?.data?.message || 'Gagal memproses analisis kecocokan Master Part.');
      } finally {
        setIsPreviewLoading(false);
      }
    } catch (err: any) {
      setParseError(err.message || 'Gagal membaca format CSV.');
      setParsedRows([]);
      setPreviewData(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setBatchTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      setPreviewPage(1);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCsvText(text);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setBatchTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      setPreviewPage(1);

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCsvText(text);
      };
      reader.readAsText(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!file || parsedRows.length === 0) return;
    await onUpload(file.name, parsedRows, batchTitle || file.name);
  };

  const resetForm = () => {
    setFile(null);
    setParsedRows([]);
    setPreviewData(null);
    setParseError(null);
    setPreviewTab('all');
    setPreviewSearch('');
    setPreviewPage(1);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Filter and search preview items defensively
  const filteredPreviewItems = useMemo(() => {
    if (!previewData?.items || !Array.isArray(previewData.items)) return [];

    return previewData.items.filter((item) => {
      if (!item) return false;

      // 1. Tab Filter
      if (previewTab === 'matched' && !item.is_matched) return false;
      if (previewTab === 'unmatched' && item.is_matched) return false;

      // 2. Search Query
      if (previewSearch.trim()) {
        const q = previewSearch.toLowerCase().trim();
        const matchesSebango = (item.sebango ? String(item.sebango) : '').toLowerCase().includes(q);
        const matchesPartNo = (item.part_number ? String(item.part_number) : '').toLowerCase().includes(q);
        const matchesPartName = (item.part_name ? String(item.part_name) : '').toLowerCase().includes(q);
        const matchesDate = (item.date ? String(item.date) : '').includes(q);
        if (!matchesSebango && !matchesPartNo && !matchesPartName && !matchesDate) {
          return false;
        }
      }

      return true;
    });
  }, [previewData, previewTab, previewSearch]);

  const totalPages = Math.max(1, Math.ceil(filteredPreviewItems.length / itemsPerPage));
  const paginatedItems = filteredPreviewItems.slice(
    (previewPage - 1) * itemsPerPage,
    previewPage * itemsPerPage
  );

  const matchedCount = previewData?.summary?.matched_rows ?? 0;
  const unmatchedCount = previewData?.summary?.unmatched_rows ?? 0;
  const totalRowsCount = previewData?.summary?.total_rows ?? parsedRows.length;
  const totalAllowanceKg = Number(previewData?.summary?.total_estimated_allowance_kg) || 0;
  const matchRate = Number(previewData?.summary?.match_rate_percentage) || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Upload Laporan Produksi & Preview Kecocokan" size="xl">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '75vh', overflowY: 'auto', paddingRight: '0.25rem' }}>
        {/* Dropzone Area (When no file selected) */}
        {!file ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '2.75rem 1.5rem',
              border: '2px dashed #008d51',
              borderRadius: '16px',
              backgroundColor: 'rgba(0, 141, 81, 0.02)',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.85rem',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(0, 141, 81, 0.1)', color: '#008d51', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UploadCloud size={32} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a', margin: 0 }}>
                Klik untuk memilih file atau seret file CSV ke sini
              </p>
              <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '0.35rem 0 0 0' }}>
                Mendukung file format <code>Report  Production.csv</code> (Kolom: DATE, SEBANGO, ACT TOTAL, NG TOTAL, dll.)
              </p>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,text/csv"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Selected File & Batch Header Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', backgroundColor: 'rgba(0, 141, 81, 0.1)', color: '#008d51', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FileSpreadsheet size={24} />
                </div>
                <div>
                  <div style={{ fontWeight: 900, fontSize: '0.925rem', color: '#0f172a' }}>
                    {file.name}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
                    {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} total baris terdeteksi
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  onClick={resetForm}
                  leftIcon={<Trash2 size={14} />}
                  style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                >
                  Ganti File
                </Button>
              </div>
            </div>

            {/* Batch Title Input */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b' }}>
                Nama Batch / Keterangan Laporan
              </label>
              <input
                type="text"
                value={batchTitle}
                onChange={(e) => setBatchTitle(e.target.value)}
                placeholder="Contoh: Laporan Produksi Agustus 2026 Shift D & N"
                style={{
                  padding: '0.55rem 0.85rem',
                  borderRadius: '10px',
                  border: '1.5px solid #cbd5e1',
                  fontSize: '0.85rem',
                  color: '#0f172a',
                  outline: 'none',
                }}
              />
            </div>

            {/* Loading Indicator while analyzing */}
            {isPreviewLoading && (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#008d51', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={24} className="spin" />
                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>
                  Menganalisis kecocokan Sebango dengan Master Part di database...
                </span>
              </div>
            )}

            {/* Preview Summary Cards Banner */}
            {previewData && !isPreviewLoading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                {/* Total Rows Card */}
                <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 700 }}>Total Baris CSV</span>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a' }}>
                    {totalRowsCount.toLocaleString()} Baris
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
                    {previewData.summary?.min_date || '-'} s/d {previewData.summary?.max_date || '-'}
                  </span>
                </div>

                {/* Matched Rows Card */}
                <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: 'rgba(0, 141, 81, 0.05)', border: '1.5px solid rgba(0, 141, 81, 0.3)', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: '#008d51', fontWeight: 800 }}>✓ Cocok (Diproses)</span>
                    <Badge variant="success" size="sm">{matchRate}%</Badge>
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#008d51' }}>
                    {matchedCount.toLocaleString()} Baris
                  </div>
                  <span style={{ fontSize: '0.725rem', color: '#008d51', fontWeight: 700 }}>
                    Est. Allowance: <strong>{totalAllowanceKg.toFixed(2)} kg</strong>
                  </span>
                </div>

                {/* Unmatched Rows Card */}
                <div style={{ padding: '0.85rem 1rem', borderRadius: '12px', backgroundColor: unmatchedCount > 0 ? 'rgba(239, 68, 68, 0.05)' : '#f8fafc', border: unmatchedCount > 0 ? '1.5px solid rgba(239, 68, 68, 0.3)' : '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.75rem', color: unmatchedCount > 0 ? '#dc2626' : '#64748b', fontWeight: 800 }}>
                      ✕ Tidak Cocok (Di-skip)
                    </span>
                    {unmatchedCount > 0 && (
                      <Badge variant="danger" size="sm">Akan di-skip</Badge>
                    )}
                  </div>
                  <div style={{ fontSize: '1.25rem', fontWeight: 900, color: unmatchedCount > 0 ? '#dc2626' : '#64748b' }}>
                    {unmatchedCount.toLocaleString()} Baris
                  </div>
                  <span style={{ fontSize: '0.725rem', color: unmatchedCount > 0 ? '#dc2626' : '#64748b' }}>
                    {previewData.summary?.unmatched_sebangos_count || 0} Sebango tidak ada di Master Part
                  </span>
                </div>
              </div>
            )}

            {/* Interactive Preview Table Section */}
            {previewData && !isPreviewLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '1rem', backgroundColor: '#ffffff' }}>
                {/* Table Filter Controls */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                  {/* Filter Tabs */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', backgroundColor: '#f1f5f9', padding: '0.25rem', borderRadius: '10px' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewTab('all');
                        setPreviewPage(1);
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: previewTab === 'all' ? '#ffffff' : 'transparent',
                        color: previewTab === 'all' ? '#0f172a' : '#64748b',
                        boxShadow: previewTab === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      Semua ({totalRowsCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewTab('matched');
                        setPreviewPage(1);
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: previewTab === 'matched' ? '#008d51' : 'transparent',
                        color: previewTab === 'matched' ? '#ffffff' : '#008d51',
                        boxShadow: previewTab === 'matched' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      ✓ Cocok ({matchedCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewTab('unmatched');
                        setPreviewPage(1);
                      }}
                      style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: previewTab === 'unmatched' ? '#dc2626' : 'transparent',
                        color: previewTab === 'unmatched' ? '#ffffff' : '#dc2626',
                        boxShadow: previewTab === 'unmatched' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                        cursor: 'pointer',
                      }}
                    >
                      ✕ Di-skip ({unmatchedCount})
                    </button>
                  </div>

                  {/* Search Box */}
                  <div style={{ position: 'relative', width: '220px' }}>
                    <Search size={14} color="#94a3b8" style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <input
                      type="text"
                      placeholder="Cari Sebango / Part..."
                      value={previewSearch}
                      onChange={(e) => {
                        setPreviewSearch(e.target.value);
                        setPreviewPage(1);
                      }}
                      style={{
                        width: '100%',
                        padding: '0.4rem 0.65rem 0.4rem 2rem',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '0.775rem',
                        color: '#0f172a',
                        outline: 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Table Container */}
                <div style={{ overflowX: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', maxHeight: '280px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.775rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left', position: 'sticky', top: 0, zIndex: 10 }}>
                        <th style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: '#475569', width: '45px' }}>No</th>
                        <th style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: '#475569' }}>Tanggal & Shift</th>
                        <th style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: '#475569' }}>Sebango</th>
                        <th style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Status</th>
                        <th style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: '#475569' }}>Part Info (Master Part)</th>
                        <th style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Berat (gr)</th>
                        <th style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: '#475569', textAlign: 'center' }}>Shikake</th>
                        <th style={{ padding: '0.55rem 0.75rem', fontWeight: 800, color: '#475569', textAlign: 'right' }}>Est. Allowance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                            Tidak ada data yang sesuai dengan filter.
                          </td>
                        </tr>
                      ) : (
                        paginatedItems.map((item, idx) => {
                          const weightGr = Number(item.berat_part_gr) || 0;
                          const shikakeVal = Number(item.calculated_shikake) || 1;
                          const allowVal = Number(item.allowance_kg) || 0;
                          const rowNum = item.row_number ?? (previewPage - 1) * itemsPerPage + idx + 1;

                          return (
                            <tr
                              key={`preview-row-${rowNum}-${item.sebango}-${idx}`}
                              style={{
                                borderBottom: '1px solid #f1f5f9',
                                backgroundColor: !item.is_matched ? 'rgba(239, 68, 68, 0.03)' : 'transparent',
                              }}
                            >
                              <td style={{ padding: '0.5rem 0.75rem', color: '#64748b' }}>{rowNum}</td>
                              <td style={{ padding: '0.5rem 0.75rem', color: '#1e293b', fontWeight: 600 }}>
                                {item.date} ({item.shift || 'Pagi'})
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', fontWeight: 900, color: item.is_matched ? '#0f172a' : '#dc2626' }}>
                                {item.sebango}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center' }}>
                                {item.is_matched ? (
                                  <Badge variant="success" size="sm">✓ Cocok</Badge>
                                ) : (
                                  <Badge variant="danger" size="sm">✕ Di-skip</Badge>
                                )}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem' }}>
                                {item.is_matched ? (
                                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: 800, color: '#0f172a' }}>{item.part_name || '-'}</span>
                                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                                      {item.part_number || '-'}
                                    </span>
                                  </div>
                                ) : (
                                  <span style={{ color: '#dc2626', fontStyle: 'italic', fontSize: '0.725rem' }}>
                                    Sebango tidak terdaftar di Master Part
                                  </span>
                                )}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', color: '#334155', fontWeight: 700 }}>
                                {item.is_matched ? `${weightGr} gr` : '-'}
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', textAlign: 'center', fontWeight: 800, color: '#0f172a' }}>
                                {shikakeVal}x
                              </td>
                              <td style={{ padding: '0.5rem 0.75rem', textAlign: 'right', fontWeight: 800, color: item.is_matched ? '#008d51' : '#94a3b8' }}>
                                {item.is_matched ? `${allowVal.toFixed(3)} kg` : '0 kg'}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.35rem', fontSize: '0.75rem', color: '#64748b' }}>
                    <span>
                      Menampilkan baris {(previewPage - 1) * itemsPerPage + 1} - {Math.min(previewPage * itemsPerPage, filteredPreviewItems.length)} dari {filteredPreviewItems.length} baris
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={previewPage <= 1}
                        onClick={() => setPreviewPage((p) => Math.max(1, p - 1))}
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Sebelumnya
                      </Button>
                      <span style={{ fontWeight: 800, color: '#0f172a', padding: '0 0.35rem' }}>
                        {previewPage} / {totalPages}
                      </span>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={previewPage >= totalPages}
                        onClick={() => setPreviewPage((p) => Math.min(totalPages, p + 1))}
                        style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                      >
                        Selanjutnya
                      </Button>
                    </div>
                  </div>
                )}

                {/* Skip Notice Banner */}
                {unmatchedCount > 0 && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', padding: '0.65rem 0.85rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid #fca5a5', fontSize: '0.75rem', color: '#b91c1c' }}>
                    <Info size={15} style={{ flexShrink: 0, marginTop: '1px' }} />
                    <span>
                      <strong>Catatan Skip:</strong> Terdapat <strong>{unmatchedCount} baris</strong> ({previewData.summary?.unmatched_sebangos_count || 0} kode Sebango) yang tidak terdaftar di Master Part. Baris-baris ini akan <strong>otomatis di-skip</strong> saat disimpan.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Parse Error Alert */}
            {parseError && (
              <div style={{ padding: '0.85rem 1rem', borderRadius: '10px', backgroundColor: '#fff1f2', border: '1px solid #f87171', color: '#b91c1c', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
                <AlertCircle size={18} />
                <span>{parseError}</span>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.775rem', color: '#64748b' }}>
            {previewData && (
              <span>
                Siap mengimpor: <strong style={{ color: '#008d51' }}>{matchedCount} baris cocok</strong> (Total Allowance: {totalAllowanceKg.toFixed(2)} kg)
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isUploading}>
              Batal
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={!file || !previewData || matchedCount === 0 || isUploading || isPreviewLoading}
              isLoading={isUploading}
              leftIcon={<CheckCircle2 size={16} />}
              style={{ fontWeight: 800, padding: '0.6rem 1.5rem', backgroundColor: '#008d51' }}
            >
              {previewData
                ? `Proses & Simpan ${matchedCount} Baris Cocok`
                : 'Proses & Simpan Data'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
