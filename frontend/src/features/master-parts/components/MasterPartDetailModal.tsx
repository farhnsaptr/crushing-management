import React from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import type { MasterPart } from '../types/masterParts.types';
import { Tag, Cpu, UserCheck, Layers, Scale, Code, Building2, Package } from 'lucide-react';

interface MasterPartDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  part: MasterPart | null;
  onEdit: (part: MasterPart) => void;
}

export const MasterPartDetailModal: React.FC<MasterPartDetailModalProps> = ({
  isOpen,
  onClose,
  part,
  onEdit,
}) => {
  if (!part) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detail Spesifikasi Master Part - ${part.part_number}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onClose();
              onEdit(part);
            }}
          >
            Edit Part Ini
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Header Badge Overview */}
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(59, 130, 246, 0.08)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
              Sebango / Mold Code
            </span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text-main)', marginTop: '0.15rem' }}>
              {part.sebango_code}
            </h3>
          </div>
          <Badge variant="primary" size="md">
            {part.jenis_part || 'PART INJECTION'}
          </Badge>
        </div>

        {/* Technical Attributes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
              <Package size={15} />
              <span>PART NAME</span>
            </div>
            <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {part.part_name}
            </p>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
              <Code size={15} />
              <span>PART NUMBER</span>
            </div>
            <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {part.part_number}
            </p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
              <UserCheck size={15} />
              <span>CUSTOMER</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {part.customer || '-'}
            </p>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
              <Tag size={15} />
              <span>MODEL KENDARAAN</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {part.model_code || '-'}
            </p>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
              <Cpu size={15} />
              <span>MESIN INJECTION</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {part.machine_code ? `${part.machine_code}` : '-'}
            </p>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
              <Building2 size={15} />
              <span>LOKASI / PABRIK</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {part.factory_name || part.factory_code || '-'}
            </p>
          </div>
        </div>

        {/* Resin Material & Cavity */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
              <Layers size={15} />
              <span>MATERIAL RESIN</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {part.material || '-'}
            </p>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700 }}>
              <Scale size={15} />
              <span>SHIKAKE</span>
            </div>
            <p style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', marginTop: '0.25rem' }}>
              {Number(part.shikake || 1)} Run
            </p>
          </div>
        </div>

        {/* Weight & Computed Formulas */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>BERAT PART (GR)</span>
            <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', marginTop: '0.15rem' }}>
              {Number(part.berat_part_gr)} gr
            </p>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>BERAT RUNNER (GR)</span>
            <p style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-main)', marginTop: '0.15rem' }}>
              {Number(part.berat_runner_gr || 0)} gr
            </p>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>STD QTY NG</span>
            <p style={{ fontWeight: 900, fontSize: '1.1rem', color: '#2563eb', marginTop: '0.15rem' }}>
              {Number(part.std_qty_ng ?? (part.shikake || 1) * 2)}
            </p>
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563eb' }}>ALLOWANCE (KG)</span>
            <p style={{ fontWeight: 900, fontSize: '1.1rem', color: '#2563eb', marginTop: '0.15rem' }}>
              {Number(part.allowance_kg ?? (((part.shikake || 1) * 2 * part.berat_part_gr) / 1000)).toFixed(2)} kg
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
