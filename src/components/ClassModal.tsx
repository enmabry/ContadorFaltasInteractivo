import React, { useState } from 'react';
import type { ClassItem, Schedule } from '../types';
import { DAYS_MAP } from '../utils/schedule';
import { X, Plus, Trash2, Calendar, Clock, BookOpen, AlertCircle } from 'lucide-react';

interface ClassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ClassItem, 'id' | 'createdAt'>) => void;
  initialData?: ClassItem | null;
}

const COLOR_PRESETS = [
  { name: 'Índigo', value: '#6366f1' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Esmeralda', value: '#10b981' },
  { name: 'Ámbar', value: '#f59e0b' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Púrpura', value: '#8b5cf6' },
  { name: 'Cian', value: '#06b6d4' },
  { name: 'Rojo', value: '#ef4444' },
];

export const ClassModal: React.FC<ClassModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState(() => initialData?.name || '');
  const [maxAbsences, setMaxAbsences] = useState(() => initialData?.maxAbsences || 5);
  const [absences, setAbsences] = useState(() => initialData?.absences || 0);
  const [room, setRoom] = useState(() => initialData?.room || '');
  const [professor, setProfessor] = useState(() => initialData?.professor || '');
  const [color, setColor] = useState(() => initialData?.color || COLOR_PRESETS[0].value);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {initialData ? 'Editar Asignatura' : 'Nueva Asignatura'}
              </h2>
              <p className="text-xs text-slate-400">
                Configura los límites de faltas y el horario semanal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Class Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Nombre de la Asignatura *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Cálculo II, Álgebra Lineal..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              required
            />
          </div>

          {/* Limits & Absences */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Límite de Faltas (Máx) *
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={maxAbsences}
                onChange={(e) => setMaxAbsences(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm"
                required
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Faltas para reprobar</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Faltas Actuales
              </label>
              <input
                type="number"
                min="0"
                value={absences}
                onChange={(e) => setAbsences(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500 text-sm"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">Inicia en 0 por defecto</span>
            </div>
          </div>

          {/* Room & Professor */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Aula / Salón
              </label>
              <input
                type="text"
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                placeholder="Ej: Aula 302, Lab 1"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Profesor(a)
              </label>
              <input
                type="text"
                value={professor}
                onChange={(e) => setProfessor(e.target.value)}
                placeholder="Ej: Dr. García"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          {/* Color tag */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Color Distintivo
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setColor(p.value)}
                  className={`w-7 h-7 rounded-full transition-all flex items-center justify-center ${
                    color === p.value ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-110' : 'opacity-80 hover:opacity-100'
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
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Horarios Semanales ({schedules.length})
              </label>
              <button
                type="button"
                onClick={handleAddSchedule}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir día
              </button>
            </div>

            {schedules.length === 0 ? (
              <div className="p-3 text-center rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-xs text-slate-500">
                Sin horarios asignados. Pulsa en "Añadir día" para programar clases.
              </div>
            ) : (
              <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
                {schedules.map((sch, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2"
                  >
                    {/* Day selector */}
                    <select
                      value={sch.dayOfWeek}
                      onChange={(e) =>
                        handleScheduleChange(idx, 'dayOfWeek', Number(e.target.value))
                      }
                      className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs font-medium focus:outline-none focus:border-indigo-500"
                    >
                      {Object.entries(DAYS_MAP).map(([dayNum, info]) => (
                        <option key={dayNum} value={dayNum}>
                          {info.name}
                        </option>
                      ))}
                    </select>

                    {/* Time range */}
                    <div className="flex items-center gap-1 text-xs text-slate-300 flex-1">
                      <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                      <input
                        type="time"
                        value={sch.startTime}
                        onChange={(e) =>
                          handleScheduleChange(idx, 'startTime', e.target.value)
                        }
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                      />
                      <span className="text-slate-500">-</span>
                      <input
                        type="time"
                        value={sch.endTime}
                        onChange={(e) =>
                          handleScheduleChange(idx, 'endTime', e.target.value)
                        }
                        className="bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => handleRemoveSchedule(idx)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors"
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
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Notas o Políticas de Asistencia
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Tolerancia de 10 min, justificante requiere constancia médica..."
              className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 text-xs resize-none"
            />
          </div>

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
            >
              {initialData ? 'Guardar Cambios' : 'Crear Asignatura'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
