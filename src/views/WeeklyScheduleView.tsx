import React, { useState } from 'react';
import type { ClassItem } from '../types';
import { DAYS_MAP, getCurrentDayOfWeek, timeToMinutes } from '../utils/schedule';
import { calculateDangerInfo } from '../utils/status';
import { Calendar, Clock, MapPin, Plus } from 'lucide-react';

interface WeeklyScheduleViewProps {
  classes: ClassItem[];
  onViewClass: (classItem: ClassItem) => void;
  onNewClass: () => void;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  classes,
  onViewClass,
  onNewClass
}) => {
  const currentDay = getCurrentDayOfWeek();
  const [selectedDayFilter, setSelectedDayFilter] = useState<number | 'all'>('all');

  // Days to show (1 to 6 or 7 if Sunday exists)
  const hasSundayClass = classes.some((c) => c.schedule?.some((s) => s.dayOfWeek === 7));
  const activeDays = [1, 2, 3, 4, 5, 6, ...(hasSundayClass ? [7] : [])];

  // Helper to get items for a day
  const getDaySchedule = (dayNum: number) => {
    const items: Array<{ classItem: ClassItem; schedule: ClassItem['schedule'][0] }> = [];
    classes.forEach((cls) => {
      cls.schedule?.forEach((sch) => {
        if (sch.dayOfWeek === dayNum) {
          items.push({ classItem: cls, schedule: sch });
        }
      });
    });
    return items.sort(
      (a, b) => timeToMinutes(a.schedule.startTime) - timeToMinutes(b.schedule.startTime)
    );
  };

  const daysToRender = selectedDayFilter === 'all' ? activeDays : [selectedDayFilter];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Calendar className="w-7 h-7 text-indigo-400" />
            <span>Horario Semanal</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Organización completa de tus clases de la semana
          </p>
        </div>

        {/* Day Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setSelectedDayFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              selectedDayFilter === 'all'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
            }`}
          >
            Toda la semana
          </button>
          {activeDays.map((dayNum) => (
            <button
              key={dayNum}
              type="button"
              onClick={() => setSelectedDayFilter(dayNum)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
                selectedDayFilter === dayNum
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : dayNum === currentDay
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{DAYS_MAP[dayNum]?.short}</span>
              {dayNum === currentDay && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Days */}
      <div className={`grid gap-4 ${
        selectedDayFilter === 'all'
          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5'
          : 'grid-cols-1 max-w-2xl mx-auto'
      }`}>
        {daysToRender.map((dayNum) => {
          const dayItems = getDaySchedule(dayNum);
          const isToday = dayNum === currentDay;
          const dayName = DAYS_MAP[dayNum]?.name || 'Día';

          return (
            <div
              key={dayNum}
              className={`rounded-2xl border p-4 flex flex-col transition-all ${
                isToday
                  ? 'bg-slate-900/90 border-indigo-500/50 shadow-lg shadow-indigo-950/30 ring-1 ring-indigo-500/20'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white">{dayName}</span>
                  {isToday && (
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Hoy
                    </span>
                  )}
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {dayItems.length} {dayItems.length === 1 ? 'clase' : 'clases'}
                </span>
              </div>

              {/* Day Classes */}
              {dayItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-slate-500 text-xs italic">
                  <span>Sin clases programadas</span>
                </div>
              ) : (
                <div className="space-y-2.5 flex-1">
                  {dayItems.map(({ classItem, schedule }, idx) => {
                    const danger = calculateDangerInfo(classItem.absences, classItem.maxAbsences);

                    return (
                      <div
                        key={idx}
                        onClick={() => onViewClass(classItem)}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-950 cursor-pointer transition-all space-y-1.5 group"
                      >
                        {/* Time & Color */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-indigo-400 font-semibold">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: classItem.color || '#6366f1' }}
                          />
                        </div>

                        {/* Class Name */}
                        <h4 className="text-xs font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                          {classItem.name}
                        </h4>

                        {/* Room & Absences */}
                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                          {classItem.room ? (
                            <span className="flex items-center gap-1 truncate max-w-[100px]">
                              <MapPin className="w-2.5 h-2.5 text-slate-500" />
                              <span className="truncate">{classItem.room}</span>
                            </span>
                          ) : (
                            <span />
                          )}

                          <span className={`font-semibold ${danger.textColor}`}>
                            {classItem.absences}/{classItem.maxAbsences} faltas
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quick bottom action */}
      {classes.length === 0 && (
        <div className="text-center py-8">
          <button
            type="button"
            onClick={onNewClass}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg shadow-indigo-600/30"
          >
            <Plus className="w-4 h-4" />
            <span>Crear tu primera clase con horarios</span>
          </button>
        </div>
      )}
    </div>
  );
};
