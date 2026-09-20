import React, { useState } from 'react';
import { createPortal } from 'react-dom';
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
  FileText,
  QrCode
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
  onShareClass?: (classItem: ClassItem) => void;
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
  onDeleteClass,
  onShareClass
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-card-tint-mint text-brand-green text-[11px] font-semibold border border-brand-green/30">
            <CheckCircle2 className="w-3 h-3" /> Asistió
          </span>
        );
      case 'absent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-card-tint-rose text-semantic-error text-[11px] font-semibold border border-semantic-error/30">
            <XCircle className="w-3 h-3" /> Falta
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-card-tint-gray text-steel text-[11px] font-semibold border border-hairline">
            <MinusCircle className="w-3 h-3" /> Cancelada
          </span>
        );
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-xl bg-canvas border border-hairline rounded-lg shadow-xl p-4 sm:p-6 text-charcoal my-auto max-h-[92dvh] sm:max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-hairline shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
            <div
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-md flex items-center justify-center font-bold text-on-primary shadow-xs text-sm sm:text-base shrink-0"
              style={{ backgroundColor: classItem.color || '#5645d4' }}
            >
              {classItem.name.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-base sm:text-lg font-bold text-ink tracking-tight truncate">
                {classItem.name}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-steel mt-0.5">
                {classItem.room && (
                  <span className="flex items-center gap-1 min-w-0">
                    <MapPin className="w-3.5 h-3.5 text-stone shrink-0" />
                    <span className="truncate max-w-[120px]">{classItem.room}</span>
                  </span>
                )}
                {classItem.professor && (
                  <span className="flex items-center gap-1 min-w-0">
                    <User className="w-3.5 h-3.5 text-stone shrink-0" />
                    <span className="truncate max-w-[120px]">{classItem.professor}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {onShareClass && (
              <button
                type="button"
                onClick={() => onShareClass(classItem)}
                className="p-1.5 text-steel hover:text-ink rounded-md hover:bg-surface transition-colors"
                title="Compartir asignatura (QR / Enlace)"
              >
                <QrCode className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(classItem)}
              className="p-1.5 text-steel hover:text-ink rounded-md hover:bg-surface transition-colors"
              title="Editar clase"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-steel hover:text-ink rounded-md hover:bg-surface transition-colors"
              title="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-0.5 py-4 space-y-4 flex-1 min-h-0">
          {/* Danger status visualizer */}
          <div className="p-3.5 sm:p-4 rounded-md bg-surface border border-hairline space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-steel">
                Estado de Inasistencias
              </span>
              <span className={`text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-xs border ${dangerInfo.badgeBg}`}>
                {dangerInfo.label}
              </span>
            </div>

            <DangerGauge
              absences={classItem.absences}
              maxAbsences={classItem.maxAbsences}
              size="lg"
              showLabel={true}
            />

            {/* Quick Adjustment Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 border-t border-hairline-soft">
              <span className="text-xs text-steel">Ajuste rápido:</span>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  disabled={classItem.absences === 0}
                  onClick={() => onDecrement(courseId, classItem.id)}
                  className="flex-1 sm:flex-initial px-3 py-1.5 rounded-md bg-canvas border border-hairline-strong text-charcoal hover:bg-surface disabled:opacity-30 disabled:pointer-events-none text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Restar 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => onIncrement(courseId, classItem.id)}
                  className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-md bg-primary hover:bg-primary-pressed text-on-primary text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Sumar 1 Falta</span>
                </button>
              </div>
            </div>
          </div>

          {/* Schedules summary */}
          <div>
            <h4 className="text-[11px] font-semibold uppercase tracking-wider text-steel mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-stone" />
              Horarios Programados
            </h4>
            {classItem.schedule && classItem.schedule.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {classItem.schedule.map((sch, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-md bg-surface border border-hairline flex items-center justify-between text-xs"
                  >
                    <span className="font-semibold text-charcoal">
                      {DAYS_MAP[sch.dayOfWeek]?.name || 'Día'}
                    </span>
                    <span className="text-steel font-mono text-[11px]">
                      {sch.startTime} - {sch.endTime}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-steel italic">No hay horarios configurados.</p>
            )}
          </div>

          {/* Notes */}
          {classItem.notes && (
            <div className="p-3.5 rounded-md bg-surface border border-hairline text-xs">
              <h4 className="font-semibold text-charcoal mb-1 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-stone" />
                Políticas de Asistencia
              </h4>
              <p className="text-steel leading-relaxed whitespace-pre-wrap">
                {classItem.notes}
              </p>
            </div>
          )}

          {/* Attendance History */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-steel flex items-center gap-1.5 truncate">
                <Calendar className="w-3.5 h-3.5 text-stone shrink-0" />
                <span className="truncate">Historial de Registros ({classRecords.length})</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowAddLog(!showAddLog)}
                className="text-xs font-medium text-primary hover:text-primary-pressed flex items-center gap-1 bg-card-tint-lavender/50 px-2.5 py-1 rounded-md border border-hairline shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Registrar evento</span>
              </button>
            </div>

            {/* Add manual log form */}
            {showAddLog && (
              <form
                onSubmit={handleAddManualLog}
                className="p-3 rounded-md bg-surface border border-primary/30 space-y-2.5 animate-in fade-in duration-150"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal mb-1">
                      Tipo de registro
                    </label>
                    <select
                      value={logStatus}
                      onChange={(e) => setLogStatus(e.target.value as AttendanceStatus)}
                      className="w-full bg-canvas border border-hairline-strong text-ink rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                    >
                      <option value="absent">Falta (+1 al contador)</option>
                      <option value="present">Asistió a clase</option>
                      <option value="cancelled">Clase cancelada / Festivo</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-charcoal mb-1">
                      Fecha
                    </label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      className="w-full bg-canvas border border-hairline-strong text-ink rounded-md px-2 py-1.5 text-xs focus:outline-none focus:border-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-charcoal mb-1">
                    Nota o Justificante (opcional)
                  </label>
                  <input
                    type="text"
                    value={logNote}
                    onChange={(e) => setLogNote(e.target.value)}
                    placeholder="Ej: Cita médica, Problema de transporte..."
                    className="w-full bg-canvas border border-hairline-strong text-ink placeholder-muted rounded-md px-2.5 py-1.5 text-xs focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddLog(false)}
                    className="px-3 py-1 text-xs text-steel hover:text-ink"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1 text-xs font-medium text-on-primary bg-primary hover:bg-primary-pressed rounded-md shadow-xs"
                  >
                    Guardar Registro
                  </button>
                </div>
              </form>
            )}

            {/* List of records */}
            {classRecords.length === 0 ? (
              <div className="p-4 text-center rounded-md bg-surface border border-hairline text-xs text-steel">
                Aún no hay registros en el historial para esta asignatura.
              </div>
            ) : (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                {classRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded-md bg-canvas border border-hairline flex items-center justify-between gap-2.5 text-xs hover:bg-surface/50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                      <div className="mt-0.5 shrink-0">{getStatusBadge(rec.status)}</div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-ink">
                          {rec.date}
                        </div>
                        {rec.note && (
                          <div className="text-[11px] text-steel break-words">
                            {rec.note}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onDeleteRecord(rec.id)}
                      className="p-1 text-stone hover:text-semantic-error rounded-xs transition-colors shrink-0"
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
        <div className="pt-3 border-t border-hairline flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <span className="text-xs text-semantic-error font-semibold">¿Seguro de borrar?</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    onDeleteClass(classItem.id);
                    onClose();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold bg-semantic-error hover:bg-semantic-error/90 text-on-primary rounded-md shadow-xs"
                >
                  Sí, eliminar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1.5 text-xs text-steel hover:text-ink"
                >
                  No
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1.5 text-xs font-medium text-semantic-error hover:bg-card-tint-rose rounded-md transition-colors flex items-center justify-center sm:justify-start gap-1.5 w-full sm:w-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Asignatura</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-charcoal bg-canvas hover:bg-surface rounded-md border border-hairline-strong transition-colors text-center w-full sm:w-auto"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
