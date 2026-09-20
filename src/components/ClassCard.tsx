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
    setTimeout(() => setIsPressing(false), 200);

    onIncrement(courseId, classItem.id);

    // If reaching failed limit, trigger warning vibration if supported
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
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
        particleCount: 40,
        spread: 60,
        origin: { y: 0.8 }
      });
    }
  };

  return (
    <div
      onClick={() => onViewDetails(classItem)}
      className={`relative group bg-slate-900/90 border rounded-2xl p-5 shadow-lg transition-all duration-200 hover:shadow-indigo-500/10 hover:border-slate-700 cursor-pointer ${
        dangerInfo.level === 'failed'
          ? 'border-rose-900/60 bg-gradient-to-b from-slate-900 via-slate-900 to-rose-950/20'
          : dangerInfo.level === 'danger'
          ? 'border-amber-900/60 bg-gradient-to-b from-slate-900 via-slate-900 to-amber-950/20'
          : 'border-slate-800'
      }`}
    >
      {/* Ongoing class pulse badge */}
      {isOngoing && (
        <div className="absolute -top-2.5 right-4 z-10 flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[11px] font-bold shadow-md shadow-emerald-500/30 animate-pulse">
          <Radio className="w-3 h-3 animate-ping" />
          <span>EN CLASE AHORA</span>
        </div>
      )}

      {/* Header info */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className="w-3 h-3 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: classItem.color || '#6366f1' }}
            />
            <h3 className="text-lg font-bold text-white tracking-tight truncate group-hover:text-indigo-300 transition-colors">
              {classItem.name}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            {classItem.room && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[140px]">{classItem.room}</span>
              </span>
            )}
            {classItem.professor && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3 text-slate-400" />
                <span className="truncate max-w-[140px]">{classItem.professor}</span>
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
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
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
              <div className="absolute right-0 mt-1 w-36 bg-slate-800 border border-slate-700 rounded-xl shadow-xl z-30 py-1 text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onViewDetails(classItem);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-700/70 flex items-center gap-2"
                >
                  <Info className="w-3.5 h-3.5 text-indigo-400" />
                  Ver Historial
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit(classItem);
                  }}
                  className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-700/70 flex items-center gap-2"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  Editar Clase
                </button>
                <div className="h-px bg-slate-700/60 my-1" />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onDelete(classItem.id);
                  }}
                  className="w-full px-3 py-2 text-left text-rose-400 hover:bg-rose-950/40 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Schedule tags */}
      {classItem.schedule && classItem.schedule.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {classItem.schedule.map((sch, idx) => (
            <span
              key={idx}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300 font-medium"
            >
              <Clock className="w-2.5 h-2.5 text-indigo-400" />
              <span>{DAYS_MAP[sch.dayOfWeek]?.short || 'Día'}: {sch.startTime} - {sch.endTime}</span>
            </span>
          ))}
        </div>
      )}

      {/* Danger Gauge Visualizer */}
      <div className="mb-4 bg-slate-950/50 p-3 rounded-xl border border-slate-800/70">
        <DangerGauge
          absences={classItem.absences}
          maxAbsences={classItem.maxAbsences}
          size="md"
        />
      </div>

      {/* Interactive Absences Counter & Quick Action */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <div
          onClick={handleTriggerSafeCheer}
          className="flex flex-col"
        >
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            Inasistencias
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-extrabold tracking-tight ${dangerInfo.textColor}`}>
              {classItem.absences}
            </span>
            <span className="text-xs text-slate-400 font-medium">
              / {classItem.maxAbsences} máx
            </span>
          </div>
        </div>

        {/* Counter Buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={classItem.absences === 0}
            onClick={handleRemoveAbsence}
            title="Deshacer 1 falta"
            className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 border border-slate-700/70"
          >
            <Minus className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleAddAbsence}
            className={`px-4 h-9 rounded-xl flex items-center gap-1.5 font-bold text-xs shadow-md transition-all active:scale-95 ${
              isPressing ? 'scale-95' : ''
            } ${
              dangerInfo.level === 'failed'
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                : dangerInfo.level === 'danger'
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/20'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Falta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
