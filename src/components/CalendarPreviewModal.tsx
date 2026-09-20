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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-2xl bg-canvas border border-hairline rounded-lg shadow-xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* 1. Header (Fijo): shrink-0 evita que se aplaste */}
        <div className="shrink-0 flex items-center justify-between px-4 py-3 border-b border-hairline bg-surface">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-brand-green" />
            <h3 className="text-sm font-semibold text-charcoal">Vista Previa de Clases</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-steel hover:text-ink rounded-md hover:bg-hairline transition-colors"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 2. Cuerpo (Scrolleable): flex-1 hace que ocupe el espacio restante y overflow-y-auto activa el scroll interno */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
          {/* Barra azul de "Detectadas" */}
          <div className="p-3 rounded-md bg-card-tint-sky/40 border border-link-blue/20 text-xs text-charcoal flex items-center justify-between">
            <span className="text-xs">
              Detectadas: <strong>{classes.length}</strong> materias en tu calendario
            </span>
            <span className="text-[11px] font-semibold text-link-blue">
              {selectedCount} seleccionadas
            </span>
          </div>

          {/* Lista de tarjetas */}
          <div className="space-y-2.5">
            {classes.map((cls, idx) => (
              <div
                key={idx}
                onClick={() => toggleSelect(idx)}
                className={`p-3 rounded-md border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-start justify-between gap-2.5 sm:gap-3 ${
                  cls.selected
                    ? 'bg-canvas border-primary shadow-xs'
                    : 'bg-surface/50 border-hairline opacity-60'
                }`}
              >
                <div className="flex items-start gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSelect(idx);
                    }}
                    className="mt-0.5 text-primary shrink-0"
                  >
                    {cls.selected ? (
                      <CheckSquare className="w-4 h-4 text-primary" />
                    ) : (
                      <Square className="w-4 h-4 text-steel" />
                    )}
                  </button>

                  <div className="min-w-0 space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cls.color }}
                      />
                      <h4 className="text-xs sm:text-sm font-bold text-ink truncate">
                        {cls.name}
                      </h4>
                    </div>

                    {/* Room */}
                    {cls.room && (
                      <div className="text-[11px] text-steel flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone shrink-0" />
                        <span className="truncate">{cls.room}</span>
                      </div>
                    )}

                    {/* Schedules badges */}
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {cls.schedule.map((sch, sIdx) => (
                        <span
                          key={sIdx}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-surface border border-hairline text-[10px] sm:text-[11px] text-charcoal font-medium"
                        >
                          <Clock className="w-2.5 h-2.5 text-steel shrink-0" />
                          <span>{DAYS_MAP[sch.dayOfWeek]?.short}: {sch.startTime} - {sch.endTime}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Max Absences Input */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-between sm:flex-col sm:items-end gap-2 sm:gap-0.5 pt-2 sm:pt-0 border-t sm:border-t-0 border-hairline/60 shrink-0"
                >
                  <label className="text-[10px] font-semibold text-steel uppercase tracking-wider">
                    Límite Faltas:
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
        </div>

        {/* 3. Footer (Fijo): Contenedor de los botones de acción */}
        <div className="shrink-0 p-4 border-t border-hairline bg-canvas space-y-2 sm:space-y-0 sm:flex sm:flex-row-reverse sm:items-center sm:justify-between sm:gap-3">
          <button
            type="button"
            disabled={selectedCount === 0}
            onClick={handleConfirm}
            className="w-full sm:w-auto px-5 py-2.5 sm:py-2 text-xs font-semibold text-on-primary bg-primary hover:bg-primary-pressed disabled:opacity-30 disabled:pointer-events-none rounded-md shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Confirmar e Importar ({selectedCount})</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium text-charcoal hover:bg-surface border border-hairline-strong rounded-md transition-colors text-center"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
