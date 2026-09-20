import React, { useState } from 'react';
import type { ClassItem, Schedule } from '../types';
import { DAYS_MAP } from '../utils/schedule';
import { X, Plus, Trash2, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { CalendarImportBtn } from './CalendarImportBtn';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ClassItem, 'id' | 'createdAt'>) => void;
  initialData?: ClassItem | null;
  courseId?: string;
}

const NOTION_COLOR_PRESETS = [
  { name: 'Púrpura', value: '#7b3ff2', tint: '#e6e0f5' },
  { name: 'Azul', value: '#0075de', tint: '#dcecfa' },
  { name: 'Verde', value: '#1aae39', tint: '#d9f3e1' },
  { name: 'Naranja', value: '#dd5b00', tint: '#ffe8d4' },
  { name: 'Rosa', value: '#ff64c8', tint: '#fde0ec' },
  { name: 'Teal', value: '#2a9d99', tint: '#d9f3e1' },
  { name: 'Marrón', value: '#523410', tint: '#f8f5e8' },
  { name: 'Rojo', value: '#e03131', tint: '#fde0ec' },
];

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  courseId
}) => {
  const [name, setName] = useState(() => initialData?.name || '');
  const [maxAbsences, setMaxAbsences] = useState(() => initialData?.maxAbsences || 5);
  const [absences, setAbsences] = useState(() => initialData?.absences || 0);
  const [room, setRoom] = useState(() => initialData?.room || '');
  const [professor, setProfessor] = useState(() => initialData?.professor || '');
  const [color, setColor] = useState(() => initialData?.color || NOTION_COLOR_PRESETS[0].value);
  const [notes, setNotes] = useState(() => initialData?.notes || '');
  const [schedules, setSchedules] = useState<Schedule[]>(() =>
    initialData?.schedule || [{ dayOfWeek: 1, startTime: '10:00', endTime: '12:00' }]
  );
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddSchedule = () => {
    setSchedules([
      ...schedules,
      { dayOfWeek: 1, startTime: '10:00', endTime: '12:00' }
    ]);
  };

  const handleRemoveSchedule = (index: number) => {
    setSchedules(schedules.filter((_, idx) => idx !== index));
  };

  const handleScheduleChange = (
    index: number,
    field: keyof Schedule,
    value: string | number
  ) => {
    const updated = [...schedules];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setSchedules(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa el nombre de la asignatura.');
      return;
    }
    if (maxAbsences < 1) {
      setError('El límite de inasistencias debe ser al menos 1.');
      return;
    }

    onSave({
      name: name.trim(),
      maxAbsences: Number(maxAbsences),
      absences: Math.max(0, Number(absences)),
      room: room.trim() || undefined,
      professor: professor.trim() || undefined,
      color,
      notes: notes.trim() || undefined,
      schedule: schedules
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-canvas border border-hairline rounded-lg shadow-[0px_16px_48px_-8px_rgba(15,15,15,0.16)] p-6 text-charcoal my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-card-tint-lavender text-brand-purple-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-ink">
                {initialData ? 'Editar Asignatura' : 'Nueva Asignatura'}
              </h2>
              <p className="text-xs text-steel">
                Configura los límites de faltas y el horario semanal
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

        {error && (
          <div className="mt-3 p-3 rounded-md bg-card-tint-rose border border-semantic-error/30 text-semantic-error text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!initialData && courseId && (
          <div className="mt-4 p-3.5 bg-surface border border-hairline rounded-md">
            <div className="mb-2">
              <p className="text-xs font-semibold text-ink">¿Prefieres importar tu horario?</p>
              <p className="text-[11px] text-steel">Carga tus asignaturas y horas automáticamente desde tu cuenta</p>
            </div>
            <CalendarImportBtn
              courseId={courseId}
              variant="full"
              label="Sincronizar horario con Google Calendar"
              onSuccess={onClose}
            />
            <div className="relative mt-3 mb-1 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-hairline" />
              </div>
              <span className="relative px-2 bg-surface text-[10px] font-semibold text-steel uppercase tracking-wider">
                o ingresa los datos manualmente
              </span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Class Name */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Nombre de la Asignatura *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cálculo II, Álgebra Lineal..."
              className="w-full h-11 px-3 rounded-md bg-canvas border border-hairline-strong text-ink placeholder-muted focus:outline-none focus:border-2 focus:border-primary text-sm transition-colors"
              required
            />
          </div>

          {/* Limits & Absences */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Límite de Faltas (Máx) *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxAbsences}
                onChange={(e) => setMaxAbsences(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-md bg-canvas border border-hairline-strong text-ink focus:outline-none focus:border-2 focus:border-primary text-sm transition-colors"
                required
              />
              <span className="text-[10px] text-steel mt-0.5 block">Faltas para reprobar</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Faltas Actuales
              </label>
              <input
                type="number"
                min="0"
                value={absences}
                onChange={(e) => setAbsences(Number(e.target.value))}
                className="w-full h-11 px-3 rounded-md bg-canvas border border-hairline-strong text-ink focus:outline-none focus:border-2 focus:border-primary text-sm transition-colors"
              />
              <span className="text-[10px] text-steel mt-0.5 block">Inicia en 0 por defecto</span>
            </div>
          </div>

          {/* Room & Professor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Aula / Salón
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Ej: Aula 302, Lab 1"
                className="w-full h-11 px-3 rounded-md bg-canvas border border-hairline-strong text-ink placeholder-muted focus:outline-none focus:border-2 focus:border-primary text-sm transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1">
                Profesor(a)
              </label>
              <input
                type="text"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                placeholder="Ej: Dr. García"
                className="w-full h-11 px-3 rounded-md bg-canvas border border-hairline-strong text-ink placeholder-muted focus:outline-none focus:border-2 focus:border-primary text-sm transition-colors"
              />
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Color de Propiedad (Notion Palette)
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {NOTION_COLOR_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setColor(p.value)}
                  className={`w-6 h-6 rounded-xs transition-all flex items-center justify-center ${
                    color === p.value ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: p.value }}
                  title={p.name}
                />
              ))}
            </div>
          </div>

          {/* Schedule list */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-ink flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                Horarios Semanales ({schedules.length})
              </label>
              <button
                type="button"
                onClick={handleAddSchedule}
                className="text-xs font-medium text-primary hover:text-primary-pressed flex items-center gap-1 px-2.5 py-1 rounded-md border border-hairline bg-surface hover:bg-hairline-soft"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir día
              </button>
            </div>

            {schedules.length === 0 ? (
              <div className="p-3 text-center rounded-md bg-surface border border-dashed border-hairline text-xs text-steel">
                Sin horarios asignados. Pulsa en "Añadir día" para programar clases.
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {schedules.map((sch, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-md bg-surface border border-hairline flex items-center gap-2"
                  >
                    <select
                      value={sch.dayOfWeek}
                      onChange={(e) =>
                        handleScheduleChange(idx, 'dayOfWeek', Number(e.target.value))
                      }
                      className="bg-canvas border border-hairline-strong text-ink rounded-md px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-primary"
                    >
                      {Object.entries(DAYS_MAP).map(([dayNum, info]) => (
                        <option key={dayNum} value={dayNum}>
                          {info.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 text-xs text-charcoal flex-1">
                      <Clock className="w-3 h-3 text-steel shrink-0" />
                      <input
                        type="time"
                        value={sch.startTime}
                        onChange={(e) =>
                          handleScheduleChange(idx, 'startTime', e.target.value)
                        }
                        className="bg-canvas border border-hairline-strong text-ink rounded-md px-2 py-1 text-xs focus:outline-none focus:border-primary"
                      />
                      <span className="text-steel">-</span>
                      <input
                        type="time"
                        value={sch.endTime}
                        onChange={(e) =>
                          handleScheduleChange(idx, 'endTime', e.target.value)
                        }
                        className="bg-canvas border border-hairline-strong text-ink rounded-md px-2 py-1 text-xs focus:outline-none focus:border-primary"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveSchedule(idx)}
                      className="p-1.5 text-steel hover:text-semantic-error hover:bg-card-tint-rose rounded-xs transition-colors"
                      title="Eliminar este horario"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Notas o Políticas de Asistencia
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Tolerancia de 10 min, justificante requiere constancia médica..."
              className="w-full p-2.5 rounded-md bg-canvas border border-hairline-strong text-ink placeholder-muted focus:outline-none focus:border-2 focus:border-primary text-xs resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-hairline">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-charcoal hover:bg-surface border border-hairline-strong rounded-md transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-medium text-on-primary bg-primary hover:bg-primary-pressed rounded-md shadow-sm transition-all active:scale-[0.98]"
            >
              {initialData ? 'Guardar Cambios' : 'Crear Asignatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
