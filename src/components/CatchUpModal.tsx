import React, { useState, useEffect } from 'react';
import type { PendingAttendancePrompt } from '../types';
import { calculateDangerInfo } from '../utils/status';
import { Check, X, Bell, Calendar, Clock, AlertTriangle, ChevronRight, Slash } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CatchUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompts: PendingAttendancePrompt[];
  onConfirmAttendance: (
    classId: string,
    status: 'present' | 'absent' | 'cancelled',
    date: string
  ) => void;
  onDismissPrompt: (promptId: string) => void;
}

export const CatchUpModal: React.FC<CatchUpModalProps> = ({
  isOpen,
  onClose,
  prompts,
  onConfirmAttendance,
  onDismissPrompt
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (isOpen && prompts.length > 0 && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([100, 50, 100]);
      } catch {
        // Vibration ignored if unavailable
      }
    }
  }, [isOpen, prompts.length]);

  if (!isOpen || prompts.length === 0) return null;

  const safeIndex = Math.min(currentIndex, prompts.length - 1);
  const currentPrompt = prompts[safeIndex];

  if (!currentPrompt) return null;

  const { classItem, schedule, date, dayName, timeRange } = currentPrompt;
  const dangerInfo = calculateDangerInfo(classItem.absences, classItem.maxAbsences);
  const promptId = `${classItem.id}-${date}-${schedule.startTime}`;

  const advanceNext = () => {
    if (safeIndex >= prompts.length - 1) {
      onClose();
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) => prev);
    }
  };

  const handlePresent = () => {
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 }
    });

    onConfirmAttendance(classItem.id, 'present', date);
    onDismissPrompt(promptId);
    advanceNext();
  };

  const handleAbsent = () => {
    onConfirmAttendance(classItem.id, 'absent', date);
    onDismissPrompt(promptId);
    advanceNext();
  };

  const handleCancelled = () => {
    onConfirmAttendance(classItem.id, 'cancelled', date);
    onDismissPrompt(promptId);
    advanceNext();
  };

  const handleSkip = () => {
    onDismissPrompt(promptId);
    advanceNext();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-canvas border border-hairline rounded-lg shadow-[0px_24px_48px_-8px_rgba(15,15,15,0.20)] p-6 text-charcoal">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-card-tint-peach text-brand-orange-deep">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-brand-orange-deep">
                Ponerse al día (Catch-up)
              </span>
              <h3 className="text-xs font-semibold text-ink">
                Verificación de Asistencia
              </h3>
            </div>
          </div>

          {prompts.length > 1 && (
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-surface text-steel border border-hairline">
              {safeIndex + 1} de {prompts.length}
            </span>
          )}
        </div>

        {/* Highlight Card - Notion Yellow Bold Feature Banner */}
        <div className="my-4 p-4 rounded-lg bg-card-tint-yellow-bold/40 border border-card-tint-yellow-bold text-charcoal space-y-2.5 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-canvas/80 border border-hairline text-[11px] text-charcoal font-medium">
            <Calendar className="w-3 h-3 text-steel" />
            <span>{dayName}, {date}</span>
            <span className="text-stone">•</span>
            <Clock className="w-3 h-3 text-steel" />
            <span className="font-mono">{timeRange}</span>
          </div>

          <h2 className="text-xl font-bold text-ink tracking-tight">
            Tuviste <span className="text-primary">{classItem.name}</span>
          </h2>
          <p className="text-xs text-charcoal font-normal">
            ¿Asististe hoy a esta clase programada?
          </p>

          <div className="pt-1 flex items-center justify-center gap-2 text-xs">
            <span className="text-steel">Faltas:</span>
            <span className={`font-semibold ${dangerInfo.textColor}`}>
              {classItem.absences} de {classItem.maxAbsences} permitidas
            </span>
            {dangerInfo.remaining <= 1 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-brand-orange-deep font-semibold">
                <AlertTriangle className="w-3 h-3" /> ¡Peligro!
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons - Strict Rectangular rounded-md 8px */}
        <div className="space-y-2">
          {/* Primary CTA: Notion Purple */}
          <button
            type="button"
            onClick={handlePresent}
            className="w-full py-2.5 px-4 rounded-md bg-primary hover:bg-primary-pressed text-on-primary font-medium text-xs shadow-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            <span>Sí, asistí a la clase</span>
          </button>

          {/* Absent button */}
          <button
            type="button"
            onClick={handleAbsent}
            className="w-full py-2 px-4 rounded-md bg-canvas hover:bg-card-tint-rose/40 border border-hairline-strong text-semantic-error font-medium text-xs flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
          >
            <X className="w-4 h-4 text-semantic-error" />
            <span>No asistí (+1 Falta)</span>
          </button>

          {/* Cancelled / Holiday */}
          <button
            type="button"
            onClick={handleCancelled}
            className="w-full py-2 px-4 rounded-md bg-surface hover:bg-hairline-soft border border-hairline text-steel hover:text-charcoal font-normal text-xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <Slash className="w-3.5 h-3.5 text-stone" />
            <span>No hubo clase / Feriado</span>
          </button>
        </div>

        {/* Skip / Dismiss */}
        <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs text-steel">
          <button
            type="button"
            onClick={handleSkip}
            className="hover:text-ink transition-colors flex items-center gap-0.5"
          >
            <span>Omitir por ahora</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="hover:text-ink transition-colors"
          >
            Cerrar todo
          </button>
        </div>
      </div>
    </div>
  );
};
