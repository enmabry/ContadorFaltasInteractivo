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

  const hasSundayClass = classes.some((c) => c.schedule?.some((s) => s.dayOfWeek === 7));
  const activeDays = [1, 2, 3, 4, 5, 6, ...(hasSundayClass ? [7] : [])];

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
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ink tracking-tight flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            <span>Horario Semanal</span>
          </h1>
          <p className="text-xs text-steel mt-0.5">
            Organización completa de tus clases por día de la semana
          </p>
        </div>

        {/* Day Filter Pill-tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setSelectedDayFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              selectedDayFilter === 'all'
                ? 'bg-ink-deep text-on-dark shadow-xs'
                : 'bg-canvas text-steel hover:text-ink border border-hairline hover:bg-surface'
            }`}
          >
            Toda la semana
          </button>
          {activeDays.map((dayNum) => (
            <button
              key={dayNum}
              type="button"
              onClick={() => setSelectedDayFilter(dayNum)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 flex items-center gap-1 ${
                selectedDayFilter === dayNum
                  ? 'bg-ink-deep text-on-dark shadow-xs'
                  : dayNum === currentDay
                  ? 'bg-card-tint-mint text-brand-green border border-brand-green/30'
                  : 'bg-canvas text-steel hover:text-ink border border-hairline hover:bg-surface'
              }`}
            >
              <span>{DAYS_MAP[dayNum]?.short}</span>
              {dayNum === currentDay && <span className="w-1.5 h-1.5 rounded-full bg-brand-green" />}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Days - Notion Database Columns */}
      <div className={`grid gap-3.5 ${
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
              className={`rounded-lg border p-4 flex flex-col transition-all bg-canvas ${
                isToday
                  ? 'border-primary/40 shadow-xs ring-1 ring-primary/20'
                  : 'border-hairline hover:border-hairline-strong shadow-xs'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-hairline mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-sm text-ink">{dayName}</span>
                  {isToday && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-xs bg-card-tint-mint text-brand-green border border-brand-green/30">
                      Hoy
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-medium text-stone">
                  {dayItems.length} {dayItems.length === 1 ? 'clase' : 'clases'}
                </span>
              </div>

              {/* Day Classes */}
              {dayItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 text-center text-stone text-xs italic">
                  <span>Sin clases programadas</span>
                </div>
              ) : (
                <div className="space-y-2 flex-1">
                  {dayItems.map(({ classItem, schedule }, idx) => {
                    const danger = calculateDangerInfo(classItem.absences, classItem.maxAbsences);

                    return (
                      <div
                        key={idx}
                        onClick={() => onViewClass(classItem)}
                        className="p-2.5 rounded-md bg-surface border border-hairline hover:border-primary/30 hover:bg-canvas cursor-pointer transition-all space-y-1 group shadow-xs"
                      >
                        {/* Time & Color */}
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 font-mono text-[11px] text-steel font-medium">
                            <Clock className="w-3 h-3 text-stone" />
                            <span>{schedule.startTime} - {schedule.endTime}</span>
                          </div>
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: classItem.color || '#5645d4' }}
                          />
                        </div>

                        {/* Class Name */}
                        <h4 className="text-xs font-semibold text-ink group-hover:text-primary transition-colors truncate">
                          {classItem.name}
                        </h4>

                        {/* Room & Absences */}
                        <div className="flex items-center justify-between text-[11px] text-steel pt-0.5">
                          {classItem.room ? (
                            <span className="flex items-center gap-1 truncate max-w-[100px]">
                              <MapPin className="w-2.5 h-2.5 text-stone" />
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

      {classes.length === 0 && (
        <div className="text-center py-6">
          <button
            type="button"
            onClick={onNewClass}
            className="px-4 py-2 rounded-md bg-primary hover:bg-primary-pressed text-on-primary text-xs font-medium inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Crear tu primera clase con horarios</span>
          </button>
        </div>
      )}
    </div>
  );
};
