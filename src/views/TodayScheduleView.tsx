import React from 'react';
import type { AttendanceRecord, AttendanceStatus, ClassItem } from '../types';
import {
  DAYS_MAP,
  getCurrentDayOfWeek,
  getTodayDateString,
  isScheduleNow,
  timeToMinutes
} from '../utils/schedule';
import { calculateDangerInfo } from '../utils/status';
import { Clock, MapPin, User, CheckCircle2, XCircle, MinusCircle, Radio, Sparkles, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface TodayScheduleViewProps {
  classes: ClassItem[];
  courseId: string;
  records: AttendanceRecord[];
  onRecordAttendance: (
    courseId: string,
    classId: string,
    status: AttendanceStatus,
    date?: string,
    note?: string
  ) => void;
  onViewClass: (classItem: ClassItem) => void;
}

export const TodayScheduleView: React.FC<TodayScheduleViewProps> = ({
  classes,
  courseId,
  records,
  onRecordAttendance,
  onViewClass
}) => {
  const currentDay = getCurrentDayOfWeek();
  const todayStr = getTodayDateString();
  const dayInfo = DAYS_MAP[currentDay] || { name: 'Hoy', short: 'Hoy' };

  // Find all classes that meet today
  const todayItems: Array<{ classItem: ClassItem; schedule: ClassItem['schedule'][0] }> = [];

  classes.forEach((cls) => {
    cls.schedule?.forEach((sch) => {
      if (sch.dayOfWeek === currentDay) {
        todayItems.push({ classItem: cls, schedule: sch });
      }
    });
  });

  // Sort by startTime
  todayItems.sort((a, b) => timeToMinutes(a.schedule.startTime) - timeToMinutes(b.schedule.startTime));

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const handleMarkPresent = (classId: string) => {
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.7 }
    });
    onRecordAttendance(courseId, classId, 'present', todayStr, 'Asistencia confirmada');
  };

  const handleMarkAbsent = (classId: string) => {
    onRecordAttendance(courseId, classId, 'absent', todayStr, 'Falta registrada hoy');
  };

  const handleMarkCancelled = (classId: string) => {
    onRecordAttendance(courseId, classId, 'cancelled', todayStr, 'Clase cancelada');
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* Header Banner - Notion Card Base */}
      <div className="rounded-lg bg-canvas border border-hairline p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xs bg-card-tint-sky text-link-blue text-xs font-semibold mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{dayInfo.name}, {todayStr}</span>
            </div>
            <h1 className="text-2xl font-bold text-ink tracking-tight">
              Horario de Hoy
            </h1>
            <p className="text-xs text-steel mt-0.5">
              {todayItems.length > 0
                ? `Tienes ${todayItems.length} ${todayItems.length === 1 ? 'clase programada' : 'clases programadas'} para hoy.`
                : 'No tienes clases programadas para hoy. ¡Disfruta tu día!'}
            </p>
          </div>

          {todayItems.length > 0 && (
            <div className="flex items-center gap-3 bg-surface p-2.5 rounded-md border border-hairline shrink-0">
              <div className="text-center px-2">
                <span className="text-[10px] text-steel uppercase tracking-wider block font-semibold">Total</span>
                <span className="text-lg font-bold text-ink">{todayItems.length}</span>
              </div>
              <div className="h-5 w-px bg-hairline" />
              <div className="text-center px-2">
                <span className="text-[10px] text-steel uppercase tracking-wider block font-semibold">Registradas</span>
                <span className="text-lg font-bold text-primary">
                  {todayItems.filter(item => records.some(r => r.classId === item.classItem.id && r.date === todayStr)).length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Classes Timeline */}
      {todayItems.length === 0 ? (
        <div className="p-10 text-center rounded-lg bg-canvas border border-dashed border-hairline space-y-2.5">
          <div className="w-12 h-12 rounded-md bg-card-tint-mint text-brand-green flex items-center justify-center mx-auto">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-ink">¡Día Libre!</h3>
          <p className="text-xs text-steel max-w-sm mx-auto">
            No hay clases programadas para hoy en tu horario. Puedes consultar tu horario semanal completo en la pestaña "Horario Semanal".
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {todayItems.map(({ classItem, schedule }, idx) => {
            const isOngoing = isScheduleNow(schedule, now);
            const startMin = timeToMinutes(schedule.startTime);
            const endMin = timeToMinutes(schedule.endTime);
            const isFinished = currentMinutes > endMin;
            const isUpcoming = currentMinutes < startMin;

            const todayRecord = records.find(
              (r) => r.classId === classItem.id && r.date === todayStr
            );
            const dangerInfo = calculateDangerInfo(classItem.absences, classItem.maxAbsences);

            return (
              <div
                key={`${classItem.id}-${idx}`}
                className={`rounded-lg p-5 border transition-all ${
                  isOngoing
                    ? 'bg-canvas border-brand-green/40 shadow-xs ring-1 ring-brand-green/20'
                    : 'bg-canvas border-hairline hover:border-hairline-strong shadow-xs'
                }`}
              >
                {/* Status indicator pill */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: classItem.color || '#5645d4' }}
                    />
                    <span className="font-mono text-xs font-semibold text-charcoal bg-surface px-2 py-0.5 rounded-xs border border-hairline">
                      {schedule.startTime} - {schedule.endTime}
                    </span>

                    {isOngoing && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-green bg-card-tint-mint px-2 py-0.5 rounded-xs border border-brand-green/30 animate-pulse">
                        <Radio className="w-3 h-3 text-brand-green" />
                        EN CURSO AHORA
                      </span>
                    )}

                    {isUpcoming && (
                      <span className="text-[11px] font-medium text-steel bg-surface px-2 py-0.5 rounded-xs border border-hairline">
                        Próxima
                      </span>
                    )}

                    {isFinished && !isOngoing && (
                      <span className="text-[11px] font-medium text-stone bg-surface px-2 py-0.5 rounded-xs border border-hairline">
                        Finalizada
                      </span>
                    )}
                  </div>

                  {/* Danger badge */}
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-xs border ${dangerInfo.badgeBg}`}>
                    {classItem.absences} / {classItem.maxAbsences} faltas
                  </span>
                </div>

                {/* Class details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3
                      onClick={() => onViewClass(classItem)}
                      className="text-base font-bold text-ink hover:text-primary cursor-pointer transition-colors"
                    >
                      {classItem.name}
                    </h3>
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

                  {/* Attendance check-in buttons - Rectangular rounded-md 8px */}
                  <div className="shrink-0">
                    {todayRecord ? (
                      <div className="flex items-center gap-2">
                        {todayRecord.status === 'present' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-card-tint-mint border border-brand-green/30 text-brand-green text-xs font-semibold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Asististe hoy</span>
                          </div>
                        )}
                        {todayRecord.status === 'absent' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-card-tint-rose border border-semantic-error/30 text-semantic-error text-xs font-semibold">
                            <XCircle className="w-4 h-4" />
                            <span>Faltaste hoy (+1)</span>
                          </div>
                        )}
                        {todayRecord.status === 'cancelled' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-surface border border-hairline text-steel text-xs font-medium">
                            <MinusCircle className="w-4 h-4" />
                            <span>Cancelada / Feriado</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleMarkPresent(classItem.id)}
                          className="px-3 py-1.5 rounded-md bg-card-tint-mint hover:bg-emerald-200 border border-brand-green/30 text-brand-green font-semibold text-xs flex items-center gap-1 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Asistí</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkAbsent(classItem.id)}
                          className="px-3 py-1.5 rounded-md bg-card-tint-rose hover:bg-rose-200 border border-semantic-error/30 text-semantic-error font-semibold text-xs flex items-center gap-1 transition-colors"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Falté</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkCancelled(classItem.id)}
                          className="px-2.5 py-1.5 rounded-md bg-surface hover:bg-hairline-soft border border-hairline text-steel hover:text-charcoal text-xs transition-colors"
                          title="No hubo clase hoy"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {dangerInfo.remaining === 1 && (
                  <div className="mt-3 pt-2 border-t border-hairline flex items-center gap-1.5 text-xs text-brand-orange-deep">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>¡Atención! Estás a 1 sola falta de reprobar esta asignatura por inasistencias.</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
