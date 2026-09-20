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
        return <XCircle className="w-3.5 h-3.5 text-semantic-error shrink-0" />;
      case 'danger':
        return <AlertTriangle className="w-3.5 h-3.5 text-brand-orange-deep shrink-0 animate-bounce" />;
      case 'warning':
        return <ShieldAlert className="w-3.5 h-3.5 text-brand-orange shrink-0" />;
      case 'safe':
      default:
        return <CheckCircle2 className="w-3.5 h-3.5 text-brand-green shrink-0" />;
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
          <div className="font-semibold text-charcoal">
            {absences} / {maxAbsences} <span className="text-steel font-normal">faltas</span>
            <span className="ml-1 text-steel text-[11px]">({info.percentage}%)</span>
          </div>
        </div>
      )}

      {/* Progress Track - Clean Notion Style */}
      <div className={`w-full bg-hairline-soft rounded-sm overflow-hidden p-0.5 border border-hairline ${
        size === 'sm' ? 'h-1.5' : size === 'lg' ? 'h-3' : 'h-2'
      }`}>
        <div
          className={`h-full rounded-sm transition-all duration-300 ease-out ${info.progressBarColor}`}
          style={{ width: `${Math.min(100, Math.max(0, info.percentage))}%` }}
        />
      </div>

      {showLabel && (
        <div className="flex items-center justify-between text-[11px] text-steel pt-0.5">
          <span>
            {info.level === 'failed' ? (
              <span className="text-semantic-error font-medium">Excediste el límite por {absences - maxAbsences}</span>
            ) : info.remaining === 0 ? (
              <span className="text-brand-orange-deep font-medium">Última falta consumida</span>
            ) : (
              <>
                Te quedan <strong className="text-ink font-semibold">{info.remaining}</strong> {info.remaining === 1 ? 'falta disponible' : 'faltas disponibles'}
              </>
            )}
          </span>
          <span className="text-stone">
            Límite: {maxAbsences}
          </span>
        </div>
      )}
    </div>
  );
};
