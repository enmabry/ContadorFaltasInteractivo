import React, { useState } from 'react';
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

  if (!isOpen || prompts.length === 0) return null;

  // Ensure index is within range
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
      particleCount: 50,
      spread: 70,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border-2 border-indigo-500/50 rounded-3xl shadow-2xl p-6 text-slate-100 overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 relative z-10">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 animate-pulse">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-indigo-400">
                Ponerse al día (Catch-up)
              </span>
              <h3 className="text-sm font-semibold text-slate-200">
                Verificación de Asistencia
              </h3>
            </div>
          </div>

          {prompts.length > 1 && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {safeIndex + 1} de {prompts.length}
            </span>
          )}
        </div>

        {/* Main Question Card */}
        <div className="my-5 text-center relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs text-slate-300">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span>{dayName}, {date}</span>
            <span className="text-slate-500">•</span>
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span className="font-mono">{timeRange}</span>
          </div>

          <h2 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
            Tuviste <span className="text-indigo-400">{classItem.name}</span>
          </h2>
          <p className="text-sm text-slate-300 font-medium">
            ¿Asististe hoy a esta clase?
          </p>

          {/* Current Absences Status Reminder */}
          <div className="pt-1 flex items-center justify-center gap-2 text-xs">
            <span className="text-slate-400">Faltas acumuladas:</span>
            <span className={`font-bold ${dangerInfo.textColor}`}>
              {classItem.absences} de {classItem.maxAbsences} permitidas
            </span>
            {dangerInfo.remaining <= 1 && (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 font-semibold">
                <AlertTriangle className="w-3 h-3" /> ¡Peligro!
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 relative z-10">
          {/* Yes, Attended */}
          <button
            type="button"
            onClick={handlePresent}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2.5 transition-all active:scale-[0.98]"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>Sí, asistí a la clase</span>
          </button>

          {/* No, Absent */}
          <button
            type="button"
            onClick={handleAbsent}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-rose-950/60 hover:border-rose-700/60 border border-slate-700 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <X className="w-4 h-4 stroke-[2.5] text-rose-400" />
            <span>No asistí (+1 Falta)</span>
          </button>

          {/* Cancelled / Holiday */}
          <button
            type="button"
            onClick={handleCancelled}
            className="w-full py-2.5 px-4 rounded-2xl bg-slate-950/60 hover:bg-slate-800/80 border border-slate-800 text-slate-400 hover:text-slate-300 font-medium text-xs flex items-center justify-center gap-2 transition-all"
          >
            <Slash className="w-3.5 h-3.5 text-slate-500" />
            <span>No hubo clase / Profesor faltó / Feriado</span>
          </button>
        </div>

        {/* Skip / Dismiss */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 relative z-10">
          <button
            type="button"
            onClick={handleSkip}
            className="hover:text-slate-200 transition-colors flex items-center gap-1"
          >
            <span>Omitir por ahora</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="hover:text-slate-200 transition-colors"
          >
            Cerrar todo
          </button>
        </div>
      </div>
    </div>
  );
};
