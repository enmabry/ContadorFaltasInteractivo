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
            <MinusCircle className="w-3 h-3" /> Sin clase / Cancelada
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-canvas border border-hairline rounded-lg shadow-[0px_16px_48px_-8px_rgba(15,15,15,0.16)] p-6 text-charcoal my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between pb-3 border-b border-hairline shrink-0">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center font-bold text-on-primary shadow-xs text-base"
              style={{ backgroundColor: classItem.color || '#5645d4' }}
            >
              {classItem.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-ink tracking-tight">
                {classItem.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-steel mt-0.5">
                {classItem.room && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone" />
                    {classItem.room}
                  </span>
                )}
                {classItem.professor && (
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-stone" />
                    {classItem.professor}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {onShareClass && (
              <button
                type="button"
                onClick={() => onShareClass(classItem)}
                className="p-1.5 text-steel hover:text-ink rounded-sm hover:bg-surface transition-colors"
                title="Compartir asignatura (QR / Enlace)"
              >
                <QrCode className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onEdit(classItem)}
              className="p-1.5 text-steel hover:text-ink rounded-sm hover:bg-surface transition-colors"
              title="Editar clase"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-steel hover:text-ink rounded-sm hover:bg-surface transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto pr-1 py-4 space-y-4 flex-1">
          {/* Danger status visualizer */}
          <div className="p-4 rounded-md bg-surface border border-hairline space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-steel">
                Estado de Inasistencias
              </span>
              <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-xs border ${dangerInfo.badgeBg}`}>
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
            <div className="pt-2 flex items-center justify-between gap-4 border-t border-hairline-soft">
              <span className="text-xs text-steel">Ajuste rápido:</span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={classItem.absences === 0}
                  onClick={() => onDecrement(courseId, classItem.id)}
                  className="px-3 py-1 rounded-md bg-canvas border border-hairline-strong text-charcoal hover:bg-surface disabled:opacity-30 disabled:pointer-events-none text-xs font-medium flex items-center gap-1.5 transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                  <span>Restar 1</span>
                </button>
                <button
                  type="button"
                  onClick={() => onIncrement(courseId, classItem.id)}
                  className="px-3.5 py-1 rounded-md bg-primary hover:bg-primary-pressed text-on-primary text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
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
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-steel flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-stone" />
                Historial de Registros ({classRecords.length})
              </h4>
              <button
                type="button"
                onClick={() => setShowAddLog(!showAddLog)}
                className="text-xs font-medium text-primary hover:text-primary-pressed flex items-center gap-1 bg-card-tint-lavender/50 px-2.5 py-1 rounded-md border border-hairline"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar evento
              </button>
            </div>

            {/* Add manual log form */}
            {showAddLog && (
              <form
                onSubmit={handleAddManualLog}
                className="p-3 rounded-md bg-surface border border-primary/30 space-y-2.5 animate-in fade-in duration-150"
              >
                <div className="grid grid-cols-2 gap-2">
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
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {classRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded-md bg-canvas border border-hairline flex items-center justify-between gap-3 text-xs hover:bg-surface/50 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="mt-0.5">{getStatusBadge(rec.status)}</div>
                      <div className="min-w-0">
                        <div className="font-semibold text-ink">
                          {rec.date}
                        </div>
                        {rec.note && (
                          <div className="text-[11px] text-steel truncate max-w-xs">
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
        <div className="pt-3 border-t border-hairline flex items-center justify-between shrink-0">
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-semantic-error font-semibold">¿Seguro de borrar?</span>
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
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="px-3 py-1.5 text-xs font-medium text-semantic-error hover:bg-card-tint-rose rounded-md transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminar Asignatura</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-charcoal bg-canvas hover:bg-surface rounded-md border border-hairline-strong transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
