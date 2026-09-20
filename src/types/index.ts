export interface Schedule {
  id?: string;
  dayOfWeek: number; // 1: Lunes, 2: Martes, 3: Miércoles, 4: Jueves, 5: Viernes, 6: Sábado, 7: Domingo
  startTime: string; // Formato "HH:mm" (ej: "10:00")
  endTime: string;   // Formato "HH:mm" (ej: "12:00")
}

export type AttendanceStatus = 'present' | 'absent' | 'cancelled';

export interface AttendanceRecord {
  id: string;
  classId: string;
  courseId: string;
  date: string; // "YYYY-MM-DD"
  status: AttendanceStatus;
  note?: string;
  timestamp: number;
}

export interface ClassItem {
  id: string;
  name: string; // Ej: "Cálculo II"
  absences: number; // Faltas actuales (ej: 2)
  maxAbsences: number; // Límite para reprobar (ej: 5)
  schedule: Schedule[];
  room?: string; // Ej: "Aula 302"
  professor?: string; // Ej: "Dr. García"
  color?: string; // Color distintivo (indigo, emerald, amber, rose, purple, cyan, etc.)
  notes?: string;
  createdAt: number;
}

export interface Course {
  id: string;
  name: string; // Ej: "Semestre 2026-2"
  classes: ClassItem[];
  color?: string;
  createdAt: number;
}

export type DangerLevel = 'safe' | 'warning' | 'danger' | 'failed';

export interface DangerInfo {
  level: DangerLevel;
  percentage: number;
  remaining: number;
  label: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  badgeBg: string;
  progressBarColor: string;
}

export interface PendingAttendancePrompt {
  classItem: ClassItem;
  schedule: Schedule;
  date: string; // "YYYY-MM-DD"
  dayName: string;
  timeRange: string;
}
