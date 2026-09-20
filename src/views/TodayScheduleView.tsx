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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/60 border border-indigo-500/20 p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold mb-2">
              <Clock className="w-3.5 h-3.5" />
              <span>{dayInfo.name}, {todayStr}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Horario de Hoy
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              {todayItems.length > 0
                ? `Tienes ${todayItems.length} ${todayItems.length === 1 ? 'clase programada' : 'clases programadas'} para hoy.`
                : 'No tienes clases programadas para hoy. ¡Disfruta tu día!'}
            </p>
          </div>

          {todayItems.length > 0 && (
            <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 shrink-0">
              <div className="text-center px-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Total</span>
                <span className="text-xl font-bold text-white">{todayItems.length}</span>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="text-center px-2">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">Registradas</span>
                <span className="text-xl font-bold text-indigo-400">
                  {todayItems.filter(item => records.some(r => r.classId === item.classItem.id && r.date === todayStr)).length}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Classes Timeline */}
      {todayItems.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 space-y-3">
          <div className="w-14 h-14 rounded-3xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-white">¡Día Libre!</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No hay clases registradas para este día de la semana en el periodo activo. Puedes revisar tu horario semanal completo en la pestaña "Horario Semanal".
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
                className={`relative rounded-2xl p-5 border transition-all ${
                  isOngoing
                    ? 'bg-slate-900/95 border-emerald-500/60 shadow-lg shadow-emerald-950/40 ring-1 ring-emerald-500/30'
                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Status indicator pill */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: classItem.color || '#6366f1' }}
                    />
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-md border border-indigo-500/20">
                      {schedule.startTime} - {schedule.endTime}
                    </span>

                    {isOngoing && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40 animate-pulse">
                        <Radio className="w-3 h-3 animate-ping" />
                        EN CURSO AHORA
                      </span>
                    )}

                    {isUpcoming && (
                      <span className="text-[11px] font-medium text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                        Próxima
                      </span>
                    )}

                    {isFinished && !isOngoing && (
                      <span className="text-[11px] font-medium text-slate-500 bg-slate-950 px-2 py-0.5 rounded-md">
                        Finalizada
                      </span>
                    )}
                  </div>

                  {/* Danger badge */}
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${dangerInfo.badgeBg}`}>
                    {classItem.absences} / {classItem.maxAbsences} faltas
                  </span>
                </div>

                {/* Class details */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3
                      onClick={() => onViewClass(classItem)}
                      className="text-lg font-bold text-white hover:text-indigo-300 cursor-pointer transition-colors"
                    >
                      {classItem.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      {classItem.room && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {classItem.room}
                        </span>
                      )}
                      {classItem.professor && (
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {classItem.professor}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Today attendance action / status */}
                  <div className="shrink-0">
                    {todayRecord ? (
                      <div className="flex items-center gap-2">
                        {todayRecord.status === 'present' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Asististe hoy</span>
                          </div>
                        )}
                        {todayRecord.status === 'absent' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold">
                            <XCircle className="w-4 h-4" />
                            <span>Faltaste hoy (+1)</span>
                          </div>
                        )}
                        {todayRecord.status === 'cancelled' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-500/20 border border-slate-500/30 text-slate-300 text-xs font-bold">
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
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-md shadow-emerald-900/30 transition-all active:scale-95"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Asistí</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkAbsent(classItem.id)}
                          className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1 transition-all active:scale-95"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Falté</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMarkCancelled(classItem.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-300 text-xs font-medium transition-all"
                          title="No hubo clase hoy"
                        >
                          <MinusCircle className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {dangerInfo.remaining === 1 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 text-xs text-amber-400">
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
