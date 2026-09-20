import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, X, QrCode, Share2, BookOpen } from 'lucide-react';
import { encodeCourseToURL } from '../utils/share';
import type { Course } from '../types';

interface ShareCourseModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareCourseModal: React.FC<ShareCourseModalProps> = ({
  course,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !course) return null;

  const shareUrl = encodeCourseToURL(course);
  const classesCount = course.classes?.length || 0;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error al copiar enlace:', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Horario de ${course.name} - Contador de Faltas`,
          text: `¡Hola! Aquí tienes el horario y asignaturas de ${course.name} para importarlo en tu app de faltas:`,
          url: shareUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-sm bg-canvas border border-hairline rounded-lg shadow-xl text-charcoal my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-hairline bg-surface shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="p-1.5 rounded-md bg-card-tint-lavender text-brand-purple-800 shrink-0">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ink truncate">Compartir Periodo</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-steel hover:text-ink hover:bg-hairline rounded-md transition-colors shrink-0 ml-1"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 sm:p-5 flex-1 overflow-y-auto flex flex-col items-center gap-4 min-h-0">
          {/* Course summary badge */}
          <div className="text-center space-y-1 w-full">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-hairline text-xs font-semibold text-ink max-w-full">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: course.color || '#5645d4' }}
              />
              <span className="truncate">{course.name}</span>
            </div>
            <p className="text-xs text-steel max-w-[260px] mx-auto">
              Tus compañeros pueden escanear este QR o abrir el enlace para clonar {classesCount} {classesCount === 1 ? 'asignatura' : 'asignaturas'} al instante.
            </p>
            <p className="text-[11px] text-brand-purple-800 font-medium bg-card-tint-lavender/60 px-2 py-0.5 rounded-md inline-block">
              ✨ Sus inasistencias iniciarán en 0
            </p>
          </div>

          {/* QR Code Container */}
          <div className="p-3 bg-canvas border border-hairline-strong rounded-lg shadow-xs flex items-center justify-center max-w-[200px] w-full">
            <QRCodeSVG
              value={shareUrl}
              size={160}
              level="M"
              fgColor="#1a1a1a"
              includeMargin={false}
              className="w-full h-auto max-w-[160px]"
            />
          </div>

          {/* Asignaturas preview pills */}
          {classesCount > 0 && (
            <div className="w-full">
              <div className="flex items-center gap-1 text-[11px] font-medium text-steel mb-1.5">
                <BookOpen className="w-3 h-3 shrink-0" />
                <span>Asignaturas incluidas ({classesCount}):</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 bg-surface rounded-md border border-hairline">
                {course.classes.map((cls) => (
                  <span
                    key={cls.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] font-medium bg-canvas border border-hairline text-charcoal max-w-full"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: cls.color || '#5645d4' }}
                    />
                    <span className="truncate max-w-[110px]">{cls.name}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Enlace para copiar */}
          <div className="w-full space-y-2">
            <label className="text-xs font-semibold text-ink block">
              Enlace directo para compartir:
            </label>
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="w-full px-2.5 py-2 text-xs font-mono text-steel bg-surface border border-hairline rounded-md focus:outline-none select-all truncate min-w-0 flex-1"
              />
              <button
                type="button"
                onClick={handleCopy}
                className={`px-3 py-2 rounded-md text-xs font-medium flex items-center gap-1.5 shrink-0 transition-colors shadow-xs ${
                  copied
                    ? 'bg-brand-green text-on-dark'
                    : 'bg-primary hover:bg-primary-pressed text-on-primary'
                }`}
                title="Copiar enlace al portapapeles"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copiado</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Copiar</span>
                  </>
                )}
              </button>
            </div>

            {/* Native share button if supported */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full mt-2 py-2 px-3 rounded-md bg-canvas hover:bg-surface border border-hairline-strong text-xs font-medium text-charcoal flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <Share2 className="w-3.5 h-3.5 text-primary" />
                <span>Enviar por WhatsApp / Compartir</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-3 bg-surface border-t border-hairline flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 text-xs font-medium text-charcoal hover:bg-hairline rounded-md transition-colors text-center"
          >
            Listo
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
