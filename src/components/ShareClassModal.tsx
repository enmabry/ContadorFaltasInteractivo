import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, X, Share2, MapPin, User, Clock, ShieldAlert } from 'lucide-react';
import { encodeClassToURL } from '../utils/share';
import { DAYS_MAP } from '../utils/schedule';
import type { ClassItem } from '../types';

interface ShareClassModalProps {
  classItem: ClassItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareClassModal: React.FC<ShareClassModalProps> = ({
  classItem,
  isOpen,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !classItem) return null;

  const shareUrl = encodeClassToURL(classItem);

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
          title: `Asignatura: ${classItem.name} - Horario`,
          text: `¡Hola! Aquí tienes el horario y datos de ${classItem.name} para agregarla a tu app de faltas:`,
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
        {/* Header Notion-style */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-hairline bg-surface shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className="w-6 h-6 rounded-md flex items-center justify-center font-bold text-on-primary text-xs shadow-xs shrink-0"
              style={{ backgroundColor: classItem.color || '#5645d4' }}
            >
              {classItem.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ink truncate">Compartir Asignatura</h3>
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
          {/* Class Summary */}
          <div className="text-center space-y-1 w-full">
            <h4 className="text-base font-semibold text-ink tracking-tight break-words">
              {classItem.name}
            </h4>

            <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-steel">
              {classItem.room && (
                <span className="flex items-center gap-1 min-w-0">
                  <MapPin className="w-3 h-3 text-stone shrink-0" />
                  <span className="truncate max-w-[120px]">{classItem.room}</span>
                </span>
              )}
              {classItem.professor && (
                <span className="flex items-center gap-1 min-w-0">
                  <User className="w-3.5 h-3.5 text-stone shrink-0" />
                  <span className="truncate max-w-[120px]">{classItem.professor}</span>
                </span>
              )}
              <span className="flex items-center gap-1 font-medium text-charcoal shrink-0">
                <ShieldAlert className="w-3 h-3 text-brand-orange" />
                Máx: {classItem.maxAbsences} faltas
              </span>
            </div>

            {/* Schedules chips */}
            {classItem.schedule && classItem.schedule.length > 0 && (
              <div className="flex flex-wrap justify-center gap-1 pt-1.5">
                {classItem.schedule.map((sch, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs text-[11px] bg-surface border border-hairline text-steel"
                  >
                    <Clock className="w-2.5 h-2.5 text-stone shrink-0" />
                    <span>
                      {DAYS_MAP[sch.dayOfWeek]?.name || `Día ${sch.dayOfWeek}`} {sch.startTime} - {sch.endTime}
                    </span>
                  </span>
                ))}
              </div>
            )}

            <div className="pt-1">
              <span className="text-[11px] text-brand-purple-800 font-medium bg-card-tint-lavender/70 px-2.5 py-0.5 rounded-md inline-block">
                ✨ Tu compañero la añadirá con 0 faltas
              </span>
            </div>
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

          {/* Copy link section */}
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

            {/* Native share button */}
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
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
