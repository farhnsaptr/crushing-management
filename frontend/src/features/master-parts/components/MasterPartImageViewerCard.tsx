import React, { useRef } from 'react';
import { Card } from '../../../components/common/Card';
import { Button } from '../../../components/common/Button';
import { Badge } from '../../../components/common/Badge';
import type { MasterPart } from '../types/masterParts.types';
import { Camera, Upload, Eye, Info, Check, RotateCcw } from 'lucide-react';

interface MasterPartImageViewerCardProps {
  selectedPart: MasterPart | null;
  draftImagePreview: string | null;
  isSubmittingImage: boolean;
  onSubmitDraftPhoto: () => void;
  onCancelDraftPhoto: () => void;
  onLaunchDesktopCamera: () => void;
  onCaptureImage: (dataUrl: string) => void;
  onSelectImageFile: (file: File) => void;
  onOpenDetailModal: (part: MasterPart) => void;
}

export const MasterPartImageViewerCard: React.FC<MasterPartImageViewerCardProps> = ({
  selectedPart,
  draftImagePreview,
  isSubmittingImage,
  onSubmitDraftPhoto,
  onCancelDraftPhoto,
  onLaunchDesktopCamera,
  onCaptureImage,
  onSelectImageFile,
  onOpenDetailModal,
}) => {
  const mobileCameraInputRef = useRef<HTMLInputElement | null>(null);
  const uploadFileInputRef = useRef<HTMLInputElement | null>(null);

  // Check if device is mobile to trigger native camera direct capture
  const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  };

  const handleCameraClick = () => {
    if (isMobileDevice() && mobileCameraInputRef.current) {
      mobileCameraInputRef.current.click();
    } else {
      onLaunchDesktopCamera();
    }
  };

  const isDraftMode = !!draftImagePreview;
  const displayImageSrc =
    draftImagePreview ||
    selectedPart?.image_url ||
    '/no-images.jpg';

  return (
    <Card
      title={selectedPart ? `Pratinjau Foto (${selectedPart.part_number})` : 'Pratinjau Foto Produk'}
      subtitle={selectedPart ? `Sebango: ${selectedPart.sebango_code}` : 'Pilih part pada tabel untuk melihat foto'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Hidden File Inputs */}
        {/* 1. Direct Native Camera Input for Mobile */}
        <input
          type="file"
          ref={mobileCameraInputRef}
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              const reader = new FileReader();
              reader.onloadend = () => {
                onCaptureImage(reader.result as string);
              };
              reader.readAsDataURL(file);
            }
          }}
        />

        {/* 2. File Picker Input for Upload */}
        <input
          type="file"
          ref={uploadFileInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onSelectImageFile(file);
            }
          }}
        />

        {/* 16:9 Image Preview Box */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            backgroundColor: '#f1f5f9',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: isDraftMode ? '2px solid #f59e0b' : '1px solid var(--border-color)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <img
            src={displayImageSrc}
            alt={selectedPart ? selectedPart.part_name : 'No Image'}
            onError={(e) => {
              // Fallback image if URL fails
              (e.target as HTMLImageElement).src = '/no-images.jpg';
            }}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />

          {/* Overlay Badge for Active Part */}
          {selectedPart && (
            <div
              style={{
                position: 'absolute',
                top: '0.75rem',
                left: '0.75rem',
                zIndex: 2,
              }}
            >
              <Badge variant="primary" size="sm">
                {selectedPart.model_code || 'MODEL'}
              </Badge>
            </div>
          )}

          {/* Overlay Badge for Draft Image Validation */}
          {isDraftMode && (
            <div
              style={{
                position: 'absolute',
                bottom: '0.75rem',
                right: '0.75rem',
                zIndex: 2,
              }}
            >
              <Badge variant="warning" size="sm">
                Draft Foto (Belum Disubmit)
              </Badge>
            </div>
          )}
        </div>

        {/* Selected Part Details Card Header */}
        {selectedPart ? (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {selectedPart.part_name}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Mesin: {selectedPart.machine_code || '-'} | Material: {selectedPart.material || '-'}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenDetailModal(selectedPart)}
              leftIcon={<Eye size={15} />}
            >
              Detail
            </Button>
          </div>
        ) : (
          <div
            style={{
              padding: '0.85rem 1rem',
              backgroundColor: 'rgba(100, 116, 139, 0.06)',
              border: '1px border-dashed var(--border-color)',
              borderRadius: 'var(--radius-md)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
            }}
          >
            Pilih salah satu item part pada tabel di sebelah kiri untuk melihat gambarnya.
          </div>
        )}

        {/* Action Buttons: 2-Step Draft Mode vs Standard Upload */}
        {isDraftMode ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <Button
              variant="primary"
              onClick={onSubmitDraftPhoto}
              isLoading={isSubmittingImage}
              leftIcon={<Check size={18} />}
              style={{
                width: '100%',
                padding: '0.75rem',
                fontWeight: 800,
                fontSize: '0.95rem',
              }}
            >
              Submit Foto (Kompres & Simpan S3)
            </Button>

            <Button
              variant="outline"
              onClick={onCancelDraftPhoto}
              disabled={isSubmittingImage}
              leftIcon={<RotateCcw size={16} />}
              style={{ width: '100%' }}
            >
              Batal / Foto Ulang
            </Button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Button
              variant="outline"
              onClick={handleCameraClick}
              disabled={!selectedPart}
              leftIcon={<Camera size={16} />}
              title="Ambil foto langsung menggunakan kamera HP / Webcam Desktop"
            >
              Ambil Gambar
            </Button>

            <Button
              variant="outline"
              onClick={() => uploadFileInputRef.current?.click()}
              disabled={!selectedPart}
              leftIcon={<Upload size={16} />}
              title="Pilih file gambar dari galeri / komputer Anda"
            >
              Upload Gambar
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};
