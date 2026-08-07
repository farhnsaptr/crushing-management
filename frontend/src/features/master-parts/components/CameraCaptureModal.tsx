import React, { useRef, useState, useEffect } from 'react';
import { Modal } from '../../../components/common/Modal';
import { Button } from '../../../components/common/Button';
import { Camera, RefreshCw, AlertCircle } from 'lucide-react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);

  const startCamera = async () => {
    setError(null);
    setIsCameraReady(false);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Browser Anda tidak mendukung akses kamera WebRTC.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment',
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraReady(true);
    } catch (err: any) {
      console.error('[Camera Access Error]', err);
      setError(
        err.message ||
          'Gagal mengaktifkan kamera. Harap beri izin akses kamera di pengaturan browser Anda.'
      );
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraReady(false);
  };

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const handleTakeSnapshot = () => {
    if (!videoRef.current || !isCameraReady) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

    stopCamera();
    onCapture(dataUrl);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCamera();
        onClose();
      }}
      title="Ambil Foto Produk via Kamera Device (Live WebRTC)"
      size="lg"
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => {
              stopCamera();
              onClose();
            }}
          >
            Batal
          </Button>
          <Button
            variant="primary"
            onClick={handleTakeSnapshot}
            disabled={!isCameraReady}
            leftIcon={<Camera size={18} />}
          >
            Tangkap Foto (Capture)
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
        {error ? (
          <div
            style={{
              padding: '1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              width: '100%',
            }}
          >
            <AlertCircle size={20} style={{ flexShrink: 0 }} />
            <div>{error}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={startCamera}
              style={{ marginLeft: 'auto' }}
              leftIcon={<RefreshCw size={14} />}
            >
              Coba Lagi
            </Button>
          </div>
        ) : (
          <div
            style={{
              position: 'relative',
              width: '100%',
              aspectRatio: '16/9',
              backgroundColor: '#000',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />

            {!isCameraReady && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  backgroundColor: 'rgba(0,0,0,0.7)',
                  gap: '0.5rem',
                }}
              >
                <RefreshCw size={28} className="animate-spin" />
                <span style={{ fontSize: '0.875rem' }}>Mengaktifkan stream kamera...</span>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
