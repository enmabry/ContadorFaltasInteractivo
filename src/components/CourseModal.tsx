import React, { useState } from 'react';
import type { Course } from '../types';
import { X, Calendar, AlertCircle } from 'lucide-react';

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, color?: string) => void;
  initialData?: Course | null;
}

const NOTION_COLOR_PRESETS = [
  '#5645d4', // Primary purple
  '#0075de', // Link blue
  '#1aae39', // Green
  '#dd5b00', // Orange
  '#ff64c8', // Pink
  '#7b3ff2', // Purple
  '#2a9d99', // Teal
  '#523410'  // Brown
];

export const CourseModal: React.FC<CourseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData
}) => {
  const [name, setName] = useState(() => initialData?.name || '');
  const [color, setColor] = useState(() => initialData?.color || NOTION_COLOR_PRESETS[0]);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Por favor ingresa un nombre para el periodo o curso.');
      return;
    }

    onSave(name.trim(), color);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-canvas border border-hairline rounded-lg shadow-[0px_16px_48px_-8px_rgba(15,15,15,0.16)] p-6 text-charcoal">
        <div className="flex items-center justify-between pb-3 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-md bg-card-tint-lavender text-brand-purple-800">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-ink">
                {initialData ? 'Editar Periodo / Curso' : 'Nuevo Periodo / Curso'}
              </h2>
              <p className="text-xs text-steel">
                Organiza tus asignaturas por semestre o ciclo
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink mb-1">
              Nombre del Periodo *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Semestre 2026-2, Otoño 2026..."
              className="w-full h-11 px-3 rounded-md bg-canvas border border-hairline-strong text-ink placeholder-muted focus:outline-none focus:border-2 focus:border-primary text-sm transition-colors"
              autoFocus
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Color Tema
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {NOTION_COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-6 h-6 rounded-xs transition-all ${
                    color === c ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-80 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

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
              {initialData ? 'Guardar' : 'Crear Periodo'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
