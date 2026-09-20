import type { AttendanceRecord, ClassItem, PendingAttendancePrompt, Schedule } from '../types';

export const DAYS_MAP: Record<number, { name: string; short: string }> = {
  1: { name: 'Lunes', short: 'Lun' },
  2: { name: 'Martes', short: 'Mar' },
  3: { name: 'Miércoles', short: 'Mié' },
  4: { name: 'Jueves', short: 'Jue' },
  5: { name: 'Viernes', short: 'Vie' },
  6: { name: 'Sábado', short: 'Sáb' },
  7: { name: 'Domingo', short: 'Dom' },
};

/**
 * Returns current day of week ISO: 1 (Lunes) to 7 (Domingo)
 */
export function getCurrentDayOfWeek(date: Date = new Date()): number {
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  return day === 0 ? 7 : day;
}

/**
 * Returns current date string in YYYY-MM-DD format
 */
export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Converts "HH:mm" to total minutes from midnight
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

/**
 * Checks if current time is within schedule window today
 */
export function isScheduleNow(schedule: Schedule, now: Date = new Date()): boolean {
  const currentDay = getCurrentDayOfWeek(now);
  if (schedule.dayOfWeek !== currentDay) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMin = timeToMinutes(schedule.startTime);
  const endMin = timeToMinutes(schedule.endTime);

  return currentMinutes >= startMin && currentMinutes <= endMin;
}

/**
 * Checks if a class schedule today has already started / passed
 */
export function hasScheduleStartedToday(schedule: Schedule, now: Date = new Date()): boolean {
  const currentDay = getCurrentDayOfWeek(now);
  if (schedule.dayOfWeek !== currentDay) return false;

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const startMin = timeToMinutes(schedule.startTime);

  return currentMinutes >= startMin;
}

/**
 * Finds past scheduled classes for today that don't have an attendance record yet
 */
export function detectPendingCatchUp(
  classes: ClassItem[],
  records: AttendanceRecord[],
  dismissedPromptIds: string[] = [],
  now: Date = new Date()
): PendingAttendancePrompt[] {
  const todayStr = getTodayDateString(now);
  const currentDay = getCurrentDayOfWeek(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const prompts: PendingAttendancePrompt[] = [];

  for (const cls of classes) {
    for (const sch of cls.schedule) {
      if (sch.dayOfWeek !== currentDay) continue;

      const startMin = timeToMinutes(sch.startTime);
      // If the class hasn't started yet today, don't ask
      if (currentMinutes < startMin) continue;

      const promptId = `${cls.id}-${todayStr}-${sch.startTime}`;
      if (dismissedPromptIds.includes(promptId)) continue;

      // Check if user already recorded attendance for this class today
      const alreadyRecorded = records.some(
        (r) => r.classId === cls.id && r.date === todayStr
      );

      if (!alreadyRecorded) {
        prompts.push({
          classItem: cls,
          schedule: sch,
          date: todayStr,
          dayName: DAYS_MAP[sch.dayOfWeek]?.name || 'Hoy',
          timeRange: `${sch.startTime} - ${sch.endTime}`
        });
      }
    }
  }

  return prompts;
}
