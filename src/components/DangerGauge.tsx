import React from 'react';
import { calculateDangerInfo } from '../utils/status';
import { AlertTriangle, CheckCircle2, ShieldAlert, XCircle } from 'lucide-react';

interface DangerGaugeProps {
  absences: number;
  maxAbsences: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const DangerGauge: React.FC<DangerGaugeProps> = ({
  absences,
  maxAbsences,
  size = 'md',
  showLabel = true
}) => {
  const info = calculateDangerInfo(absences, maxAbsences);

  const renderIcon = () => {
    switch (info.level) {
      case 'failed':
        return <XCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      case 'danger':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />;
      case 'warning':
        return <ShieldAlert className="w-4 h-4 text-yellow-400 shrink-0" />;
      case 'safe':
      default:
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
  };

  return (
    <div className="w-full space-y-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 font-medium">
            {renderIcon()}
            <span className={info.textColor}>{info.label}</span>
          </div>
          <div className="font-semibold text-slate-300">
            {absences} / {maxAbsences} <span className="text-slate-400 font-normal">faltas</span>
            <span className="ml-1.5 text-slate-400 text-[11px]">({info.percentage}%)</span>
          </div>
        </div>
      )}

      {/* Progress Track */}
      <div className={`w-full bg-slate-800/80 rounded-full overflow-hidden border border-slate-700/50 p-0.5 ${
        size === 'sm' ? 'h-2' : size === 'lg' ? 'h-3.5' : 'h-2.5'
      }`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${info.progressBarColor}`}
          style={{ width: `${Math.min(100, Math.max(0, info.percentage))}%` }}
        />
      </div>

      {showLabel && (
        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
          <span>
            {info.level === 'failed' ? (
              <span className="text-rose-400 font-semibold">Excediste el límite por {absences - maxAbsences}</span>
            ) : info.remaining === 0 ? (
              <span className="text-amber-400 font-semibold">Última falta permitida consumida</span>
            ) : (
              <>
                Te quedan <strong className="text-slate-200">{info.remaining}</strong> {info.remaining === 1 ? 'falta disponible' : 'faltas disponibles'}
              </>
            )}
          </span>
          <span className="text-slate-400">
            Límite: {maxAbsences}
          </span>
        </div>
      )}
    </div>
  );
};
