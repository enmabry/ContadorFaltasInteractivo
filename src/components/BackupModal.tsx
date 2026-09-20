import React, { useRef, useState } from 'react';
import type { Course, AttendanceRecord } from '../types';
import { X, Download, Upload, RotateCcw, Trash2, Check, AlertCircle, HardDrive } from 'lucide-react';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  courses: Course[];
  records: AttendanceRecord[];
  onImport: (courses: Course[], records?: AttendanceRecord[]) => boolean;
  onResetDemo: () => void;
  onClearAll: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  courses,
  records,
  onImport,
  onResetDemo,
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
    // Reset file input
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 text-slate-100">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Copias y Datos</h2>
              <p className="text-xs text-slate-400">
                Gestiona tus datos guardados en el almacenamiento local
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

        {message && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-950/50 border-emerald-800/50 text-emerald-300'
                : 'bg-rose-950/50 border-rose-800/50 text-rose-300'
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

        <div className="mt-5 space-y-3">
          {/* Export button */}
          <button
            type="button"
            onClick={handleExport}
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 group-hover:bg-indigo-500/20">
                <Download className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Exportar Copia de Seguridad</h4>
                <p className="text-[11px] text-slate-400">Guarda un archivo JSON con tus asignaturas y faltas</p>
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
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                <Upload className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Importar Copia de Seguridad</h4>
                <p className="text-[11px] text-slate-400">Restaura tus datos desde un archivo JSON</p>
              </div>
            </div>
          </button>

          {/* Demo button */}
          <button
            type="button"
            onClick={() => {
              onResetDemo();
              setMessage({ type: 'success', text: 'Datos de prueba cargados exitosamente.' });
            }}
            className="w-full p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/50 text-left flex items-center justify-between group transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20">
                <RotateCcw className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Cargar Datos de Prueba (Demo)</h4>
                <p className="text-[11px] text-slate-400">Prueba la aplicación con materias y horarios de ejemplo</p>
              </div>
            </div>
          </button>

          {/* Clear All */}
          <div className="pt-2">
            {confirmClear ? (
              <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-900/60 space-y-2">
                <p className="text-xs text-rose-300 font-medium">
                  ¿Estás completamente seguro de borrar todos tus cursos y faltas?
                </p>
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmClear(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
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
                    className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg"
                  >
                    Sí, borrar todo
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmClear(true)}
                className="w-full py-2 text-center text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Borrar todos los datos locales</span>
              </button>
            )}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
