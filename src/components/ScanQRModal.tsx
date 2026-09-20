import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Scanner, type IDetectedBarcode } from '@yudiel/react-qr-scanner';
import { X, ScanLine, AlertCircle } from 'lucide-react';
import { decodeClassFromURL, decodeCourseFromURL } from '../utils/share';
import { useAttendanceStore } from '../store/useAttendanceStore';
import confetti from 'canvas-confetti';

interface ScanQRModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScanQRModal: React.FC<ScanQRModalProps> = ({ isOpen, onClose }) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const courses = useAttendanceStore((state) => state.courses);
  const activeCourseId = useAttendanceStore((state) => state.activeCourseId);
  const addClass = useAttendanceStore((state) => state.addClass);
  const importCourse = useAttendanceStore((state) => state.importCourse);
  const addCourse = useAttendanceStore((state) => state.addCourse);

  if (!isOpen) return null;

  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (!detectedCodes || detectedCodes.length === 0 || isProcessing) return;

    const rawText = detectedCodes[0].rawValue?.trim();
    if (!rawText) return;

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let shareClassHash: string | null = null;
      let shareCourseHash: string | null = null;

      try {
        const url = new URL(rawText);
        shareClassHash = url.searchParams.get('shareClass');
        shareCourseHash = url.searchParams.get('share') || url.searchParams.get('shareCourse');
      } catch {
        // Handle relative URL or query string directly
        if (rawText.includes('shareClass=')) {
          const match = rawText.match(/shareClass=([^&]+)/);
          if (match) shareClassHash = decodeURIComponent(match[1]);
        } else if (rawText.includes('share=')) {
          const match = rawText.match(/share=([^&]+)/);
          if (match) shareCourseHash = decodeURIComponent(match[1]);
        }
      }

      // Case 1: Single Class QR
      if (shareClassHash) {
        const importedClass = decodeClassFromURL(shareClassHash);
        if (!importedClass) {
          throw new Error('No se pudo decodificar la asignatura del código QR.');
        }

        let targetCourseId = activeCourseId;
        if (!targetCourseId && courses.length > 0) {
          targetCourseId = courses[0].id;
        } else if (!targetCourseId) {
          targetCourseId = addCourse('Mi Semestre');
        }

        const targetCourse = courses.find((c) => c.id === targetCourseId) || { name: 'tu periodo actual' };
        const confirmed = window.confirm(
          `¿Deseas añadir la asignatura "${importedClass.name}" a tu periodo "${targetCourse.name}"? (Las faltas iniciarán en 0)`
        );

        if (confirmed && targetCourseId) {
          addClass(targetCourseId, importedClass);
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 }
          });
          alert(`¡Asignatura "${importedClass.name}" añadida con éxito! 🎉`);
          onClose();
        } else {
          setIsProcessing(false);
        }
        return;
      }

      // Case 2: Full Course / Semester QR
      if (shareCourseHash) {
        const importedCourse = decodeCourseFromURL(shareCourseHash);
        if (!importedCourse) {
          throw new Error('No se pudo decodificar el periodo del código QR.');
        }

        const classesCount = importedCourse.classes?.length || 0;
        const confirmed = window.confirm(
          `¿Deseas importar el periodo completo "${importedCourse.name}" con ${classesCount} ${
            classesCount === 1 ? 'asignatura' : 'asignaturas'
          }? (Las faltas iniciarán en 0)`
        );

        if (confirmed) {
          importCourse(importedCourse);
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 }
          });
          alert(`¡Periodo "${importedCourse.name}" importado con éxito! 🎉`);
          onClose();
        } else {
          setIsProcessing(false);
        }
        return;
      }

      // Neither found
      setErrorMessage('El código QR no pertenece a WEBER o no contiene un enlace válido.');
      setIsProcessing(false);
    } catch (err: unknown) {
      console.error('Error procesando código QR:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Error al procesar el código QR.');
      setIsProcessing(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-canvas border border-hairline rounded-lg shadow-2xl flex flex-col overflow-hidden text-charcoal animate-in fade-in duration-150">
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-hairline bg-surface">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-md bg-card-tint-lavender text-brand-purple shrink-0">
              <ScanLine className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-ink truncate">Escanear Código QR</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-steel hover:text-ink rounded-md hover:bg-hairline transition-colors shrink-0 ml-1"
            title="Cerrar escáner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="relative bg-ink-deep w-full aspect-square overflow-hidden flex items-center justify-center">
          <Scanner
            onScan={handleScan}
            onError={(error) => {
              console.warn('Scanner camera status:', error);
            }}
            scanDelay={600}
            allowMultiple={false}
            styles={{
              container: { width: '100%', height: '100%' },
              video: { width: '100%', height: '100%', objectFit: 'cover' }
            }}
          />

          {/* Viewfinder Target Overlay */}
          <div className="absolute inset-8 pointer-events-none border-2 border-white/40 rounded-lg flex items-center justify-center">
            <div className="w-full h-0.5 bg-primary/90 animate-pulse shadow-[0_0_12px_rgba(76,61,110,0.9)]" />
          </div>
        </div>

        {/* Status / Error / Guide */}
        <div className="p-3.5 bg-surface text-center border-t border-hairline space-y-1 shrink-0">
          {errorMessage ? (
            <div className="flex items-center justify-center gap-1.5 text-xs text-semantic-error font-medium">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-ink">
                Apunta al código QR en la pantalla de tu compañero
              </p>
              <p className="text-[11px] text-steel">
                Detecta asignaturas individuales o semestres de WEBER
              </p>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};
