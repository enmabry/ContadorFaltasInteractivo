import type { DangerInfo, DangerLevel } from '../types';

export function calculateDangerInfo(absences: number, maxAbsences: number): DangerInfo {
  const safeMax = Math.max(1, maxAbsences);
  const rawRatio = absences / safeMax;
  const percentage = Math.min(100, Math.round(rawRatio * 100));
  const remaining = Math.max(0, safeMax - absences);

  let level: DangerLevel;
  let label: string;
  let bgColor: string;
  let textColor: string;
  let borderColor: string;
  let badgeBg: string;
  let progressBarColor: string;

  if (absences >= safeMax) {
    level = 'failed';
    label = 'Límite superado (Reprobado)';
    bgColor = 'bg-rose-950/40';
    textColor = 'text-rose-400';
    borderColor = 'border-rose-500/40';
    badgeBg = 'bg-rose-500/20 text-rose-300 border-rose-500/30';
    progressBarColor = 'bg-gradient-to-r from-rose-600 to-red-500';
  } else if (remaining === 1 || rawRatio >= 0.75) {
    level = 'danger';
    label = remaining === 1 ? '¡Peligro! A 1 falta del límite' : 'Zona de Peligro';
    bgColor = 'bg-amber-950/40';
    textColor = 'text-amber-400';
    borderColor = 'border-amber-500/40';
    badgeBg = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    progressBarColor = 'bg-gradient-to-r from-amber-500 to-orange-500';
  } else if (rawRatio >= 0.35) {
    level = 'warning';
    label = 'Atención requerida';
    bgColor = 'bg-yellow-950/30';
    textColor = 'text-yellow-400';
    borderColor = 'border-yellow-500/30';
    badgeBg = 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
    progressBarColor = 'bg-gradient-to-r from-yellow-400 to-amber-500';
  } else {
    level = 'safe';
    label = 'Bajo control';
    bgColor = 'bg-emerald-950/30';
    textColor = 'text-emerald-400';
    borderColor = 'border-emerald-500/30';
    badgeBg = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    progressBarColor = 'bg-gradient-to-r from-emerald-500 to-teal-400';
  }

  return {
    level,
    percentage,
    remaining,
    label,
    bgColor,
    textColor,
    borderColor,
    badgeBg,
    progressBarColor
  };
}
