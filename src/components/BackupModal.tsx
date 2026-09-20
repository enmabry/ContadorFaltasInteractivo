import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import type { AttendanceRecord, Course } from '../types';
import { Download, Upload, Trash2, X, Check, AlertCircle, HardDrive } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  records: AttendanceRecord[];
  onImport: (courses: Course[], records: AttendanceRecord[]) => boolean;
  onClearAll: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  courses,
  records,
  onImport,
  onClearAll
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const data = {
        version: 1,
        exportedAt: new Date().toISOString(),
        courses,
        attendanceRecords: records
      };

      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `contador-faltas-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Copia de seguridad descargada exitosamente.' });
    } catch {
      setMessage({ type: 'error', text: 'Error al exportar los datos.' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);

        let coursesToImport: Course[] = [];
        let recordsToImport: AttendanceRecord[] = [];

        if (Array.isArray(parsed)) {
          coursesToImport = parsed;
        } else if (parsed && Array.isArray(parsed.courses)) {
          coursesToImport = parsed.courses;
          recordsToImport = Array.isArray(parsed.attendanceRecords) ? parsed.attendanceRecords : [];
        } else {
          throw new Error('Formato JSON no válido.');
        }

        const success = onImport(coursesToImport, recordsToImport);
        if (success) {
          setMessage({ type: 'success', text: 'Datos importados correctamente.' });
        } else {
          setMessage({ type: 'error', text: 'Error al procesar la lista de cursos.' });
        }
      } catch (err: unknown) {
        setMessage({
          type: 'error',
          text: err instanceof Error ? err.message : 'Archivo no válido.'
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-canvas border border-hairline rounded-lg shadow-xl p-4 sm:p-6 text-charcoal my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-hairline shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 rounded-md bg-card-tint-lavender text-brand-purple-800 shrink-0">
              <HardDrive className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-ink truncate">Copias y Datos</h2>
              <p className="text-[11px] sm:text-xs text-steel truncate">
                Gestiona tus datos en el almacenamiento local
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-steel hover:text-ink rounded-md hover:bg-surface transition-colors shrink-0 ml-2"
            title="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {message && (
          <div
            className={`mt-3 p-3 rounded-md border text-xs flex items-center gap-2 shrink-0 ${
              message.type === 'success'
                ? 'bg-card-tint-mint border-brand-green/30 text-brand-green'
                : 'bg-card-tint-rose border-semantic-error/30 text-semantic-error'
            }`}
          >
            {message.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="mt-4 space-y-2.5 flex-1 overflow-y-auto pr-0.5 min-h-0">
          {/* Export button */}
          <button
            type="button"
            onClick={handleExport}
            className="w-full p-3 rounded-md bg-surface border border-hairline hover:bg-hairline-soft text-left flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 rounded-xs bg-card-tint-lavender text-brand-purple-800 shrink-0">
                <Download className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-ink truncate">Exportar Copia de Seguridad</h4>
                <p className="text-[11px] text-steel truncate">Descarga un archivo JSON con tus asignaturas y faltas</p>
              </div>
            </div>
          </button>

          {/* Import button */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-3 rounded-md bg-surface border border-hairline hover:bg-hairline-soft text-left flex items-center justify-between group transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="p-1.5 rounded-xs bg-card-tint-sky text-link-blue shrink-0">
                <Upload className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold text-ink truncate">Importar Copia de Seguridad</h4>
                <p className="text-[11px] text-steel truncate">Restaura tus datos desde un archivo JSON</p>
              </div>
            </div>
          </button>

          {/* Clear All */}
          <div className="pt-2">
            {confirmClear ? (
              <div className="p-3 rounded-md bg-card-tint-rose/40 border border-semantic-error/30 space-y-2">
                <p className="text-xs text-semantic-error font-medium">
                  ¿Estás seguro de borrar todos tus cursos y faltas guardados?
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1 text-xs text-steel hover:text-ink"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAll();
                      setConfirmClear(false);
                      setMessage({ type: 'success', text: 'Todos los datos han sido borrados.' });
                    }}
                    className="px-3 py-1 text-xs font-medium bg-semantic-error hover:bg-semantic-error/90 text-on-primary rounded-md shadow-xs"
                  >
                    Sí, borrar todo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="w-full py-2 text-center text-xs font-medium text-semantic-error hover:text-brand-pink-deep transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar todos los datos locales</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-hairline flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 text-xs font-medium text-charcoal hover:bg-surface border border-hairline-strong rounded-md transition-colors text-center"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
