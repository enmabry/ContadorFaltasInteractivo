import React, { useState } from 'react';
import type { ClassItem } from '../types';
import { calculateDangerInfo } from '../utils/status';
import { DAYS_MAP, isScheduleNow } from '../utils/schedule';
import { DangerGauge } from './DangerGauge';
import { Clock, MapPin, User, Plus, Minus, MoreVertical, Edit3, Trash2, Info, Radio } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ClassCardProps {
  classItem: ClassItem;
  courseId: string;
  onIncrement: (courseId: string, classId: string) => void;
  onDecrement: (courseId: string, classId: string) => void;
  onEdit: (classItem: ClassItem) => void;
  onDelete: (classId: string) => void;
  onViewDetails: (classItem: ClassItem) => void;
}

export const ClassCard: React.FC<ClassCardProps> = ({
  classItem,
  courseId,
  onIncrement,
  onDecrement,
  onEdit,
  onDelete,
  onViewDetails
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isPressing, setIsPressing] = useState(false);
  const dangerInfo = calculateDangerInfo(classItem.absences, classItem.maxAbsences);

  const isOngoing = classItem.schedule.some((sch) => isScheduleNow(sch));

  const handleAddAbsence = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPressing(true);
    setTimeout(() => setIsPressing(false), 150);

    onIncrement(courseId, classItem.id);

    if (navigator.vibrate) {
      navigator.vibrate([80, 40, 80]);
    }
  };

  const handleRemoveAbsence = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (classItem.absences > 0) {
      onDecrement(courseId, classItem.id);
    }
  };

  const handleTriggerSafeCheer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (classItem.absences === 0) {
      confetti({
        particleCount: 35,
        spread: 55,
        origin: { y: 0.8 }
      });
    }
  };

  return (
    <div
      onClick={() => onViewDetails(classItem)}
      className={`relative group bg-canvas border rounded-lg p-5 shadow-[0px_1px_3px_rgba(15,15,15,0.06)] transition-all duration-150 hover:shadow-[0px_4px_12px_rgba(15,15,15,0.08)] cursor-pointer ${
        dangerInfo.level === 'failed'
          ? 'border-semantic-error/40 bg-card-tint-rose/20'
          : dangerInfo.level === 'danger'
          ? 'border-brand-orange/40 bg-card-tint-peach/20'
          : 'border-hairline hover:border-hairline-strong'
      }`}
    >
      {/* Ongoing class badge */}
      {isOngoing && (
        <div className="absolute -top-2.5 right-4 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-card-tint-mint text-brand-green text-[11px] font-semibold border border-brand-green/30 shadow-sm animate-pulse">
          <Radio className="w-3 h-3 text-brand-green" />
          <span>EN CLASE AHORA</span>
        </div>
      )}

      {/* Header info */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: classItem.color || '#5645d4' }}
            />
            <h3 className="text-base font-semibold text-ink tracking-tight truncate group-hover:text-primary transition-colors">
              {classItem.name}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-steel">
            {classItem.room && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone" />
                <span className="truncate max-w-[130px]">{classItem.room}</span>
              </span>
            )}
            {classItem.professor && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-stone" />
                <span className="truncate max-w-[130px]">{classItem.professor}</span>
              </span>
            )}
          </div>
        </div>

        {/* Menu button */}
        <div className="relative">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 rounded-sm text-steel hover:text-ink hover:bg-surface transition-colors"
            title="Opciones"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 mt-1 w-36 bg-canvas border border-hairline rounded-md shadow-[0px_16px_48px_-8px_rgba(15,15,15,0.16)] z-30 py-1 text-xs divide-y divide-hairline-soft">
                <div className="py-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onViewDetails(classItem);
                    }}
                    className="w-full px-3 py-1.5 text-left text-charcoal hover:bg-surface flex items-center gap-2"
                  >
                    <Info className="w-3.5 h-3.5 text-primary" />
                    Ver Historial
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onEdit(classItem);
                    }}
                    className="w-full px-3 py-1.5 text-left text-charcoal hover:bg-surface flex items-center gap-2"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-link-blue" />
                    Editar Clase
                  </button>
                </div>
                <div className="py-0.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowMenu(false);
                      onDelete(classItem.id);
                    }}
                    className="w-full px-3 py-1.5 text-left text-semantic-error hover:bg-card-tint-rose/40 flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-semantic-error" />
                    Eliminar
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Schedule chips - Notion tag style */}
      {classItem.schedule && classItem.schedule.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3.5">
          {classItem.schedule.map((sch, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-surface border border-hairline text-[11px] text-slate font-medium"
            >
              <Clock className="w-2.5 h-2.5 text-steel" />
              <span>{DAYS_MAP[sch.dayOfWeek]?.short || 'Día'}: {sch.startTime} - {sch.endTime}</span>
            </span>
          ))}
        </div>
      )}

      {/* Danger Gauge Container */}
      <div className="mb-3.5 bg-surface/60 p-2.5 rounded-md border border-hairline-soft">
        <DangerGauge
          absences={classItem.absences}
          maxAbsences={classItem.maxAbsences}
          size="md"
        />
      </div>

      {/* Interactive Absences Counter & Rectangular Notion Buttons */}
      <div className="flex items-center justify-between gap-3 pt-1 border-t border-hairline-soft">
        <div
          onClick={handleTriggerSafeCheer}
          className="flex flex-col"
        >
          <span className="text-[10px] font-semibold text-steel uppercase tracking-wider">
            Inasistencias
          </span>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl font-bold tracking-tight ${dangerInfo.textColor}`}>
              {classItem.absences}
            </span>
            <span className="text-xs text-steel font-normal">
              / {classItem.maxAbsences} máx
            </span>
          </div>
        </div>

        {/* Counter Buttons - Strict rounded-md 8px Rectangles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={classItem.absences === 0}
            onClick={handleRemoveAbsence}
            title="Deshacer 1 falta"
            className="w-8 h-8 rounded-md flex items-center justify-center bg-transparent border border-hairline-strong text-charcoal hover:bg-surface disabled:opacity-30 disabled:pointer-events-none transition-colors active:bg-hairline"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          {/* Primary CTA Button: Notion Purple #5645d4, rectangular rounded-md */}
          <button
            type="button"
            onClick={handleAddAbsence}
            className={`px-3.5 h-8 rounded-md flex items-center gap-1.5 font-medium text-xs text-on-primary transition-all active:scale-[0.98] ${
              isPressing ? 'opacity-90' : ''
            } ${
              dangerInfo.level === 'failed'
                ? 'bg-semantic-error hover:bg-semantic-error/90 shadow-sm'
                : dangerInfo.level === 'danger'
                ? 'bg-brand-orange hover:bg-brand-orange-deep shadow-sm'
                : 'bg-primary hover:bg-primary-pressed shadow-sm'
            }`}
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Falta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
