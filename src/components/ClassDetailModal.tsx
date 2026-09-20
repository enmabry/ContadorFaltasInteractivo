import React, { useState } from 'react';
import type { AttendanceRecord, AttendanceStatus, ClassItem } from '../types';
import { calculateDangerInfo } from '../utils/status';
import { DAYS_MAP, getTodayDateString } from '../utils/schedule';
import { DangerGauge } from './DangerGauge';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Edit3,
  MapPin,
  User,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  MinusCircle,
  FileText
} from 'lucide-react';

interface ClassDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  classItem: ClassItem | null;
  courseId: string;
  records: AttendanceRecord[];
  onIncrement: (courseId: string, classId: string, note?: string) => void;
  onDecrement: (courseId: string, classId: string) => void;
  onRecordAttendance: (
    courseId: string,
    classId: string,
    status: AttendanceStatus,
    date?: string,
    note?: string
  ) => void;
  onDeleteRecord: (recordId: string) => void;
  onEdit: (classItem: ClassItem) => void;
  onDeleteClass: (classId: string) => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  isOpen,
  onClose,
  classItem,
  courseId,
  records,
  onIncrement,
  onDecrement,
  onRecordAttendance,
  onDeleteRecord,
  onEdit,
  onDeleteClass
}) => {
  const [showAddLog, setShowAddLog] = useState(false);
  const [logStatus, setLogStatus] = useState<AttendanceStatus>('absent');
  const [logDate, setLogDate] = useState(getTodayDateString());
  const [logNote, setLogNote] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !classItem) return null;

  const dangerInfo = calculateDangerInfo(classItem.absences, classItem.maxAbsences);
  const classRecords = records
    .filter((r) => r.classId === classItem.id)
    .sort((a, b) => b.timestamp - a.timestamp);

  const handleAddManualLog = (e: React.FormEvent) => {
    e.preventDefault();
    onRecordAttendance(courseId, classItem.id, logStatus, logDate, logNote.trim() || undefined);
    setLogNote('');
    setShowAddLog(false);
  };

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'present':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Asistió
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 text-[11px] font-semibold border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Falta
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-500/20 text-slate-300 text-[11px] font-semibold border border-slate-500/30">
            <MinusCircle className="w-3 h-3" /> Sin clase / Cancelada
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 text-slate-100 my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-white shadow-md text-lg"
              style={{ backgroundColor: classItem.color || '#6366f1' }}
            >
              {classItem.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-tight">
                {classItem.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-0.5">
                {classItem.room && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    {classItem.room}
                  </span>
                )}
                {classItem.professor && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    {classItem.professor}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onEdit(classItem)}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
              title="Editar clase"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 py-4 space-y-5 flex-1">
          {/* Danger status visualizer */}
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Estado de Faltas
              </span>
              <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${dangerInfo.badgeBg}`}>
                {dangerInfo.label}
              </span>
            </div>

            <DangerGauge
              absences={classItem.absences}
              maxAbsences={classItem.maxAbsences}
              size="lg"
              showLabel={true}
            />

            {/* Big Counter Buttons */}
            <div className="pt-2 flex items-center justify-between gap-4 border-t border-slate-800/80">
              <span className="text-xs text-slate-400">Ajuste rápido:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={classItem.absences === 0}
                  onClick={() => onDecrement(courseId, classItem.id)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-30 disabled:pointer-events-none text-xs font-medium flex items-center gap-1.5 border border-slate-700/60 transition-all"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Restar 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => onIncrement(courseId, classItem.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Sumar 1 Falta</span>
                </button>
              </div>
            </div>
          </div>

          {/* Schedules summary */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              Horarios Programados
            </h4>
            {classItem.schedule && classItem.schedule.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {classItem.schedule.map((sch, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-slate-200">
                      {DAYS_MAP[sch.dayOfWeek]?.name || 'Día'}
                    </span>
                    <span className="text-slate-400 font-mono">
                      {sch.startTime} - {sch.endTime}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">No hay horarios configurados.</p>
            )}
          </div>

          {/* Notes */}
          {classItem.notes && (
            <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 text-xs">
              <h4 className="font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Notas & Reglas
              </h4>
              <p className="text-slate-400 leading-relaxed whitespace-pre-wrap">
                {classItem.notes}
              </p>
            </div>
          )}

          {/* Attendance History */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Historial de Registros ({classRecords.length})
              </h4>
              <button
                type="button"
                onClick={() => setShowAddLog(!showAddLog)}
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar evento
              </button>
            </div>

            {/* Add manual log form */}
            {showAddLog && (
              <form
                onSubmit={handleAddManualLog}
                className="p-3.5 rounded-xl bg-slate-950 border border-indigo-500/30 space-y-3 animate-in fade-in duration-200"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Tipo de registro
                    </label>
                    <select
                      value={logStatus}
                      onChange={(e) => setLogStatus(e.target.value as AttendanceStatus)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="absent">Falta (+1 al contador)</option>
                      <option value="present">Asistió a clase</option>
                      <option value="cancelled">Clase cancelada / Festivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Nota o Justificante (opcional)
                  </label>
                  <input
                    type="text"
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder="Ej: Cita médica, Problema de transporte..."
                    className="w-full bg-slate-900 border border-slate-700 text-white placeholder-slate-500 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddLog(false)}
                    className="px-3 py-1 text-xs text-slate-400 hover:text-white"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow"
                  >
                    Guardar Registro
                  </button>
                </div>
              </form>
            )}

            {/* List of records */}
            {classRecords.length === 0 ? (
              <div className="p-4 text-center rounded-xl bg-slate-950/40 border border-slate-800/80 text-xs text-slate-500">
                Aún no hay registros guardados en el historial para esta asignatura.
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {classRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5">{getStatusBadge(rec.status)}</div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-200">
                          {rec.date}
                        </div>
                        {rec.note && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {rec.note}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteRecord(rec.id)}
                      className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors shrink-0"
                      title="Eliminar este registro"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-400 font-semibold">¿Seguro de borrar?</span>
              <button
                type="button"
                onClick={() => {
                  onDeleteClass(classItem.id);
                  onClose();
                }}
                className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow"
              >
                Sí, eliminar
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1.5 text-xs text-slate-400 hover:text-white"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Asignatura</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
