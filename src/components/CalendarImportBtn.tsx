import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { Calendar, Loader2, Settings } from 'lucide-react';
import { useAttendanceStore } from '../store/useAttendanceStore';
import type { ClassItem, Schedule } from '../types';
import { useGoogleAuth } from '../context/GoogleAuthContext';
import { CalendarConfigModal } from './CalendarConfigModal';
import { CalendarPreviewModal, type DiscoveredClass } from './CalendarPreviewModal';
import confetti from 'canvas-confetti';

const NOTION_PALETTE = [
  '#5645d4', // Primary purple
  '#0075de', // Link blue
  '#1aae39', // Green
  '#dd5b00', // Orange
  '#ff64c8', // Pink
  '#7b3ff2', // Purple
  '#2a9d99', // Teal
  '#523410', // Brown
];

interface CalendarImportBtnProps {
  courseId: string;
}

export const CalendarImportBtn: React.FC<CalendarImportBtnProps> = ({ courseId }) => {
  const [loading, setLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [discoveredClasses, setDiscoveredClasses] = useState<DiscoveredClass[]>([]);

  const { isConfigured } = useGoogleAuth();
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

      const timeMin = monday.toISOString();
      const timeMax = sunday.toISOString();

      // 2. Query Google Calendar API
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
          timeMin
        )}&timeMax=${encodeURIComponent(timeMax)}&singleEvents=true&orderBy=startTime`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (!response.ok) {
        throw new Error(`Google Calendar API respondió con código ${response.status}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        alert('No se encontraron eventos programados para esta semana en tu Google Calendar.');
        return;
      }

      // 3. Group events by title
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
        // Skip all-day events or events without summary
        if (!event.start?.dateTime || !event.end?.dateTime || !event.summary?.trim()) {
          return;
        }

        const startDate = new Date(event.start.dateTime);
        const endDate = new Date(event.end.dateTime);

        const jsDay = startDate.getDay();
        const isoDay = jsDay === 0 ? 7 : jsDay;

        const scheduleItem: Schedule = {
          dayOfWeek: isoDay,
          startTime: formatTimeString(startDate),
          endTime: formatTimeString(endDate),
        };

        const className = event.summary.trim();

        if (grouped[className]) {
          // Avoid duplicate schedule in same day & time
          const exists = grouped[className].schedules.some(
            (s) =>
              s.dayOfWeek === scheduleItem.dayOfWeek &&
              s.startTime === scheduleItem.startTime
          );
          if (!exists) {
            grouped[className].schedules.push(scheduleItem);
          }
          if (!grouped[className].room && event.location) {
            grouped[className].room = event.location.trim();
          }
        } else {
          grouped[className] = {
            name: className,
            room: event.location?.trim() || undefined,
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
        maxAbsences: 5,
        color: item.color,
        selected: true,
      }));

      if (discovered.length === 0) {
        alert('No se encontraron eventos con horario específico en tu calendario para esta semana.');
        return;
      }

      // 4. Open preview modal for user to select & configure
      setDiscoveredClasses(discovered);
      setShowPreviewModal(true);
    } catch (error) {
      console.error('Error importando calendario:', error);
      alert('Hubo un error al conectar con Google Calendar. Verifica que tu Client ID tenga habilitada la API.');
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

  const handleClick = () => {
    if (!isConfigured) {
      setShowConfigModal(true);
      return;
    }
    login();
  };

  const handleConfirmImport = (toImport: Omit<ClassItem, 'id' | 'createdAt'>[]) => {
    toImport.forEach((cls) => {
      addClass(courseId, cls);
    });

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
    });
  };

  return (
    <>
      <div className="inline-flex items-center gap-1">
        <button
          type="button"
          onClick={handleClick}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-charcoal bg-canvas hover:bg-surface border border-hairline-strong rounded-md transition-colors shadow-xs active:bg-hairline"
          title={isConfigured ? 'Importar materias de Google Calendar' : 'Configurar Google Calendar Client ID'}
        >
          {loading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
          ) : (
            <Calendar className="w-3.5 h-3.5 text-primary" />
          )}
          <span>{loading ? 'Leyendo calendario...' : 'Google Calendar'}</span>
        </button>

        <button
          type="button"
          onClick={() => setShowConfigModal(true)}
          className="p-1.5 text-steel hover:text-ink rounded-md hover:bg-surface border border-hairline transition-colors"
          title="Configurar Google Client ID"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      <CalendarConfigModal
        isOpen={showConfigModal}
        onClose={() => setShowConfigModal(false)}
        onConfigured={() => {
          // Immediately trigger login after configuring
          setTimeout(() => login(), 300);
        }}
      />

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
