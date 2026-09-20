import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { useAttendanceStore } from '../store/useAttendanceStore';
import type { ClassItem, Schedule } from '../types';
import { CalendarPreviewModal, type DiscoveredClass } from './CalendarPreviewModal';
import confetti from 'canvas-confetti';

const NOTION_PALETTE = [
  '#4c3d6e', // Muted purple
  '#0075de', // Link blue
  '#1aae39', // Green
  '#dd5b00', // Orange
  '#ff64c8', // Pink
  '#584779', // Deep heather
  '#2a9d99', // Teal
  '#523410', // Brown
];

interface CalendarImportBtnProps {
  courseId: string;
  label?: string;
  variant?: 'default' | 'hero' | 'full';
  onSuccess?: () => void;
}

const GoogleIcon = () => (
  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const CalendarImportBtn: React.FC<CalendarImportBtnProps> = ({
  courseId,
  label = 'Sincronizar con Google Calendar',
  variant = 'default',
  onSuccess
}) => {
  const [loading, setLoading] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [discoveredClasses, setDiscoveredClasses] = useState<DiscoveredClass[]>([]);

  const addClass = useAttendanceStore((state) => state.addClass);

  const formatTimeString = (date: Date): string => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const importFromCalendar = async (accessToken: string) => {
    setLoading(true);
    try {
      // 1. Calculate Monday 00:00:00 to Sunday 23:59:59 of current week
      const now = new Date();
      const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
      const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;

      const monday = new Date(now);
      monday.setDate(now.getDate() + diffToMonday);
      monday.setHours(0, 0, 0, 0);

      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      sunday.setHours(23, 59, 59, 999);

      // 2. Fetch events from Google Calendar API
      const timeMin = monday.toISOString();
      const timeMax = sunday.toISOString();
      const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
        timeMin
      )}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener eventos de Google Calendar');
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        alert('No se encontraron clases o eventos con horario en esta semana.');
        return;
      }

      // 3. Group events by title to construct ClassItem with schedule
      const grouped: Record<
        string,
        {
          name: string;
          room?: string;
          schedules: Schedule[];
          color: string;
        }
      > = {};

      let colorIndex = 0;

      data.items.forEach((event: any) => {
        if (!event.start?.dateTime || !event.end?.dateTime || !event.summary?.trim()) {
          return;
        }

        const startDate = new Date(event.start.dateTime);
        const endDate = new Date(event.end.dateTime);

        const dayNumber = startDate.getDay();
        const isoDay = dayNumber === 0 ? 7 : dayNumber; // 1 (Mon) - 7 (Sun)

        const scheduleItem: Schedule = {
          dayOfWeek: isoDay,
          startTime: formatTimeString(startDate),
          endTime: formatTimeString(endDate),
        };

        const className = event.summary.trim();

        if (grouped[className]) {
          const exists = grouped[className].schedules.some(
            (s) =>
              s.dayOfWeek === scheduleItem.dayOfWeek &&
              s.startTime === scheduleItem.startTime &&
              s.endTime === scheduleItem.endTime
          );
          if (!exists) {
            grouped[className].schedules.push(scheduleItem);
          }
          if (!grouped[className].room && event.location) {
            grouped[className].room = event.location;
          }
        } else {
          grouped[className] = {
            name: className,
            room: event.location || undefined,
            schedules: [scheduleItem],
            color: NOTION_PALETTE[colorIndex % NOTION_PALETTE.length],
          };
          colorIndex++;
        }
      });

      const discovered: DiscoveredClass[] = Object.values(grouped).map((item) => ({
        name: item.name,
        room: item.room,
        schedule: item.schedules,
        color: item.color,
        maxAbsences: 5,
        selected: true,
      }));

      if (discovered.length === 0) {
        alert('No se detectaron eventos con horario específico en tu calendario para esta semana.');
        return;
      }

      setDiscoveredClasses(discovered);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error importando calendario:', error);
      alert('Hubo un error al conectar con Google Calendar. Verifica que tu Client ID tenga autorizados los orígenes de JavaScript.');
    } finally {
      setLoading(false);
    }
  };

  const login = useGoogleLogin({
    onSuccess: (tokenResponse) => importFromCalendar(tokenResponse.access_token),
    onError: (err) => {
      console.error('Error en autenticación Google:', err);
      setLoading(false);
    },
    scope: 'https://www.googleapis.com/auth/calendar.readonly',
  });

  const handleConfirmImport = (toImport: Omit<ClassItem, 'id' | 'createdAt'>[]) => {
    toImport.forEach((cls) => {
      addClass(courseId, cls);
    });

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
    });

    if (onSuccess) {
      onSuccess();
    }
  };

  const buttonClasses =
    variant === 'hero'
      ? 'w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-medium text-charcoal bg-canvas hover:bg-surface border border-hairline-strong rounded-md transition-all shadow-xs'
      : variant === 'full'
      ? 'w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-medium text-charcoal bg-surface hover:bg-hairline border border-hairline-strong rounded-md transition-colors'
      : 'w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 sm:py-1.5 text-xs font-medium text-charcoal bg-canvas hover:bg-surface border border-hairline-strong rounded-md transition-colors shadow-xs';

  return (
    <>
      <div className={variant === 'full' ? 'w-full' : 'w-full sm:w-auto'}>
        <button
          type="button"
          onClick={() => login()}
          disabled={loading}
          className={buttonClasses}
          title="Importar materias de Google Calendar"
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          ) : (
            <GoogleIcon />
          )}
          <span>{loading ? 'Leyendo calendario...' : label}</span>
        </button>
      </div>

      <CalendarPreviewModal
        key={discoveredClasses.map((c) => c.name).join('-')}
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        discoveredClasses={discoveredClasses}
        onConfirmImport={handleConfirmImport}
      />
    </>
  );
};
