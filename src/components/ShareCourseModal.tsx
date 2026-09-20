import React, { useState } from 'react';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-sm bg-canvas border border-hairline rounded-lg shadow-[0px_16px_48px_-8px_rgba(15,15,15,0.16)] text-charcoal my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Notion Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-hairline bg-surface">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-card-tint-lavender text-brand-purple-800">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-ink">Compartir Periodo</h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-steel hover:text-ink hover:bg-hairline rounded-md transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 flex flex-col items-center gap-5">
          {/* Course summary badge */}
          <div className="text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-hairline text-xs font-semibold text-ink">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: course.color || '#5645d4' }}
              />
              <span>{course.name}</span>
            </div>
            <p className="text-xs text-steel max-w-[260px] mx-auto">
              Tus compañeros pueden escanear este QR o abrir el enlace para clonar {classesCount} {classesCount === 1 ? 'asignatura' : 'asignaturas'} al instante.
            </p>
            <p className="text-[11px] text-brand-purple-800 font-medium bg-card-tint-lavender/60 px-2 py-0.5 rounded-md inline-block">
              ✨ Sus inasistencias iniciarán en 0
            </p>
          </div>

          {/* QR Code Container */}
          <div className="p-3.5 bg-canvas border border-hairline-strong rounded-lg shadow-xs flex items-center justify-center">
            <QRCodeSVG
              value={shareUrl}
              size={180}
              level="M"
              fgColor="#1a1a1a"
              includeMargin={false}
            />
          </div>

          {/* Asignaturas preview pills */}
          {classesCount > 0 && (
            <div className="w-full">
              <div className="flex items-center gap-1 text-[11px] font-medium text-steel mb-1.5">
                <BookOpen className="w-3 h-3" />
                <span>Asignaturas incluidas ({classesCount}):</span>
              </div>
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1.5 bg-surface rounded-md border border-hairline">
                {course.classes.map((cls) => (
                  <span
                    key={cls.id}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-canvas border border-hairline text-charcoal"
                  >
                    <span
                      className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ backgroundColor: cls.color || '#5645d4' }}
                    />
                    <span className="truncate max-w-[130px]">{cls.name}</span>
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
                className="w-full px-2.5 py-2 text-xs font-mono text-steel bg-surface border border-hairline rounded-md focus:outline-none select-all truncate"
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
        <div className="px-4 py-3 bg-surface border-t border-hairline flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-charcoal hover:bg-hairline rounded-md transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
