import React, { useState } from 'react';
import type { ClassItem, Schedule } from '../types';
import { DAYS_MAP } from '../utils/schedule';
import { X, Calendar, Clock, MapPin, Check, CheckSquare, Square } from 'lucide-react';

export interface DiscoveredClass {
  name: string;
  room?: string;
  schedule: Schedule[];
  maxAbsences: number;
  color: string;
  selected: boolean;
}

interface CalendarPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  discoveredClasses: DiscoveredClass[];
  onConfirmImport: (selectedClasses: Omit<ClassItem, 'id' | 'createdAt'>[]) => void;
}

export const CalendarPreviewModal: React.FC<CalendarPreviewModalProps> = ({
  isOpen,
  onClose,
  discoveredClasses: initialClasses,
  onConfirmImport
}) => {
  const [classes, setClasses] = useState<DiscoveredClass[]>(() => initialClasses);

  if (!isOpen) return null;

  const toggleSelect = (index: number) => {
    setClasses((prev) =>
      prev.map((c, idx) => (idx === index ? { ...c, selected: !c.selected } : c))
    );
  };

  const handleMaxAbsencesChange = (index: number, val: number) => {
    setClasses((prev) =>
      prev.map((c, idx) =>
        idx === index ? { ...c, maxAbsences: Math.max(1, val) } : c
      )
    );
  };

  const selectedCount = classes.filter((c) => c.selected).length;

  const handleConfirm = () => {
    const toImport: Omit<ClassItem, 'id' | 'createdAt'>[] = classes
      .filter((c) => c.selected)
      .map((c) => ({
        name: c.name,
        room: c.room,
        absences: 0,
        maxAbsences: c.maxAbsences,
        schedule: c.schedule,
        color: c.color,
        notes: 'Importado automáticamente desde Google Calendar'
      }));

    onConfirmImport(toImport);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-canvas border border-hairline rounded-lg shadow-[0px_16px_48px_-8px_rgba(15,15,15,0.16)] p-6 text-charcoal my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-card-tint-mint text-brand-green">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">
                Vista Previa de Eventos Detectados
              </h2>
              <p className="text-xs text-steel">
                Revisa y selecciona las asignaturas que deseas añadir a tu curso
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-steel hover:text-ink rounded-sm hover:bg-surface transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info banner */}
        <div className="my-3.5 p-3 rounded-md bg-card-tint-sky/40 border border-link-blue/20 text-xs text-charcoal flex items-center justify-between shrink-0">
          <span>
            Se encontraron <strong>{classes.length}</strong> materias distintas en tu semana de Google Calendar.
          </span>
          <span className="text-[11px] font-semibold text-link-blue">
            {selectedCount} seleccionadas
          </span>
        </div>

        {/* Classes list */}
        <div className="overflow-y-auto pr-1 py-1 space-y-2.5 flex-1 max-h-80">
          {classes.map((cls, idx) => (
            <div
              key={idx}
              onClick={() => toggleSelect(idx)}
              className={`p-3 rounded-md border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                cls.selected
                  ? 'bg-canvas border-primary shadow-xs'
                  : 'bg-surface/50 border-hairline opacity-60'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <button
                  type="button"
                  className="mt-0.5 text-primary shrink-0"
                >
                  {cls.selected ? (
                    <CheckSquare className="w-4 h-4 text-primary" />
                  ) : (
                    <Square className="w-4 h-4 text-steel" />
                  )}
                </button>

                <div className="min-w-0 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cls.color }}
                    />
                    <h4 className="text-xs font-bold text-ink truncate">
                      {cls.name}
                    </h4>
                  </div>

                  {/* Room */}
                  {cls.room && (
                    <div className="text-[11px] text-steel flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone" />
                      <span className="truncate">{cls.room}</span>
                    </div>
                  )}

                  {/* Schedules badges */}
                  <div className="flex flex-wrap gap-1">
                    {cls.schedule.map((sch, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-surface border border-hairline text-[11px] text-charcoal font-medium"
                      >
                        <Clock className="w-2.5 h-2.5 text-steel" />
                        <span>{DAYS_MAP[sch.dayOfWeek]?.short}: {sch.startTime} - {sch.endTime}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Max Absences Input */}
              <div
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-right space-y-0.5"
              >
                <label className="block text-[10px] font-semibold text-steel uppercase">
                  Límite Faltas
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={cls.maxAbsences}
                  onChange={(e) => handleMaxAbsencesChange(idx, Number(e.target.value))}
                  className="w-16 h-8 px-2 rounded-md bg-canvas border border-hairline-strong text-ink text-center text-xs font-bold focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-hairline flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-surface border border-hairline-strong rounded-md transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-medium text-on-primary bg-primary hover:bg-primary-pressed disabled:opacity-30 disabled:pointer-events-none rounded-md shadow-sm transition-all active:scale-[0.98] flex items-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirmar e Importar ({selectedCount})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
