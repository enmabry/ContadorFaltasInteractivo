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
    bgColor = 'bg-card-tint-rose';
    textColor = 'text-semantic-error';
    borderColor = 'border-semantic-error/30';
    badgeBg = 'bg-card-tint-rose text-semantic-error border-semantic-error/30';
    progressBarColor = 'bg-semantic-error';
  } else if (remaining === 1 || rawRatio >= 0.75) {
    level = 'danger';
    label = remaining === 1 ? '¡Peligro! A 1 falta del límite' : 'Zona de Peligro';
    bgColor = 'bg-card-tint-peach';
    textColor = 'text-brand-orange-deep';
    borderColor = 'border-brand-orange/40';
    badgeBg = 'bg-card-tint-peach text-brand-orange-deep border-brand-orange/40';
    progressBarColor = 'bg-brand-orange';
  } else if (rawRatio >= 0.35) {
    level = 'warning';
    label = 'Atención requerida';
    bgColor = 'bg-card-tint-yellow';
    textColor = 'text-brand-brown';
    borderColor = 'border-hairline-strong';
    badgeBg = 'bg-card-tint-yellow text-brand-brown border-hairline-strong';
    progressBarColor = 'bg-brand-yellow';
  } else {
    level = 'safe';
    label = 'Bajo control';
    bgColor = 'bg-card-tint-mint';
    textColor = 'text-brand-green';
    borderColor = 'border-brand-green/30';
    badgeBg = 'bg-card-tint-mint text-brand-green border-brand-green/30';
    progressBarColor = 'bg-brand-green';
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
