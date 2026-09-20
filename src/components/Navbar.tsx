import React, { useState, useEffect } from 'react';
import type { Course } from '../types';
import { CourseSelector } from './CourseSelector';
import {
  Calendar,
  Clock,
  LayoutGrid,
  HardDrive,
  Bell,
  Download,
  Plus,
  Smartphone,
  QrCode,
  ScanLine
} from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface NavbarProps {
  courses: Course[];
  activeCourseId: string | null;
  activeTab: 'dashboard' | 'today' | 'weekly';
  pendingPromptsCount: number;
  onSelectCourse: (courseId: string) => void;
  onNewCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onTabChange: (tab: 'dashboard' | 'today' | 'weekly') => void;
  onOpenCatchUp: () => void;
  onOpenBackup: () => void;
  onOpenInstallGuide: () => void;
  onOpenShareCourse: () => void;
  onOpenScanQR?: () => void;
  onNewClass: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  courses,
  activeCourseId,
  activeTab,
  pendingPromptsCount,
  onSelectCourse,
  onNewCourse,
  onEditCourse,
  onDeleteCourse,
  onTabChange,
  onOpenCatchUp,
  onOpenBackup,
  onOpenInstallGuide,
  onOpenShareCourse,
  onOpenScanQR,
  onNewClass
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      onOpenInstallGuide();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-hairline transition-all w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-1.5 sm:gap-3 w-full min-w-0">
          {/* Logo & Course Selector */}
          <div className="flex items-center gap-1.5 sm:gap-4 min-w-0 flex-1 sm:flex-initial">
            <div
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2 cursor-pointer group select-none shrink-0"
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-brand-navy border border-hairline-strong text-on-dark flex items-center justify-center font-bold text-sm shadow-xs transition-transform group-hover:scale-105 relative overflow-hidden shrink-0">
                {/* WEBER Architectural Iron Cage / W Monogram */}
                <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none">
                  <line x1="5" y1="2" x2="5" y2="22" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                  <line x1="12" y1="2" x2="12" y2="22" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                  <line x1="19" y1="2" x2="19" y2="22" stroke="rgba(255,255,255,0.14)" strokeWidth="1" />
                  <path
                    d="M5 6.5L8.5 17.5L12 10.5L15.5 17.5L19 6.5"
                    stroke="#ffffff"
                    strokeWidth="2.2"
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                  />
                  <circle cx="12" cy="6.5" r="1.5" fill="#7b61ff" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold tracking-wider text-ink font-mono uppercase">
                    WEBER
                  </span>
                  <span className="px-1.5 py-0.2 rounded-xs text-[9px] font-semibold bg-surface border border-hairline text-steel uppercase tracking-wider">
                    v1.0
                  </span>
                </div>
                <span className="block text-[10px] text-steel font-medium tracking-wide">
                  Racionaliza tu tiempo
                </span>
              </div>
            </div>

            <div className="h-5 w-px bg-hairline hidden sm:block shrink-0" />

            {/* Course Selector */}
            <CourseSelector
              courses={courses}
              activeCourseId={activeCourseId}
              onSelectCourse={onSelectCourse}
              onNewCourse={onNewCourse}
              onEditCourse={onEditCourse}
              onDeleteCourse={onDeleteCourse}
            />
          </div>

          {/* Desktop Navigation - Notion pill-tabs */}
          <nav className="hidden md:flex items-center gap-1.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-ink-deep text-on-dark shadow-sm'
                  : 'text-steel hover:text-ink border border-hairline bg-transparent hover:bg-surface'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Asignaturas</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('today')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'today'
                  ? 'bg-ink-deep text-on-dark shadow-sm'
                  : 'text-steel hover:text-ink border border-hairline bg-transparent hover:bg-surface'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Hoy</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('weekly')}
              className={`px-3.5 py-1.5 rounded-full transition-all flex items-center gap-1.5 ${
                activeTab === 'weekly'
                  ? 'bg-ink-deep text-on-dark shadow-sm'
                  : 'text-steel hover:text-ink border border-hairline bg-transparent hover:bg-surface'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Horario Semanal</span>
            </button>
          </nav>

          {/* Right Action Icons & Primary CTA */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Catch-up Notification trigger */}
            {pendingPromptsCount > 0 && (
              <button
                type="button"
                onClick={onOpenCatchUp}
                className="relative flex items-center justify-center p-1.5 sm:px-3 sm:py-1.5 rounded-md bg-card-tint-peach border border-brand-orange/40 text-brand-orange-deep hover:bg-card-tint-peach/80 text-xs font-semibold transition-all animate-bounce shrink-0"
                title={`${pendingPromptsCount} clases pendientes de confirmar`}
              >
                <Bell className="w-3.5 h-3.5 text-brand-orange" />
                <span className="hidden sm:inline sm:ml-1.5">Ponerse al día</span>
                <span className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-brand-orange text-on-dark flex items-center justify-center text-[9px] sm:text-[10px] font-bold absolute -top-1 -right-1 sm:static sm:ml-1.5">
                  {pendingPromptsCount}
                </span>
              </button>
            )}

            {/* PWA Install Button (Always helpful on desktop/tablets) */}
            <button
              type="button"
              onClick={handleInstallClick}
              className="hidden sm:inline-flex px-2.5 sm:px-3 py-1.5 rounded-md border border-hairline-strong text-charcoal hover:bg-surface text-xs font-medium items-center gap-1.5 transition-colors shrink-0"
              title="Instalar como App en tu móvil (iOS / Android)"
            >
              {deferredPrompt ? <Download className="w-3.5 h-3.5 text-primary" /> : <Smartphone className="w-3.5 h-3.5 text-steel" />}
              <span>Instalar App</span>
            </button>

            {/* Share Course / QR button (hidden on mobile, already prominent in dashboard hero) */}
            <button
              type="button"
              onClick={onOpenShareCourse}
              disabled={!activeCourseId}
              className="hidden sm:inline-flex p-2 rounded-md border border-hairline-strong text-charcoal hover:bg-surface hover:text-ink transition-colors disabled:opacity-40 shrink-0"
              title="Compartir periodo (Código QR / Enlace)"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Scan QR button */}
            {onOpenScanQR && (
              <button
                type="button"
                onClick={onOpenScanQR}
                className="p-1.5 sm:p-2 rounded-md border border-hairline-strong text-charcoal hover:bg-surface hover:text-ink transition-colors shrink-0"
                title="Escanear código QR (cámara)"
              >
                <ScanLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-steel hover:text-ink" />
              </button>
            )}

            {/* Backup / Data button */}
            <button
              type="button"
              onClick={onOpenBackup}
              className="p-1.5 sm:p-2 rounded-md border border-hairline-strong text-charcoal hover:bg-surface hover:text-ink transition-colors shrink-0"
              title="Copias de Seguridad y Datos"
            >
              <HardDrive className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-steel hover:text-ink" />
            </button>

            {/* Primary Action Button: Signature Notion Purple, rectangular rounded-md (8px) */}
            <button
              type="button"
              onClick={onNewClass}
              className="p-1.5 sm:px-3.5 sm:py-1.5 rounded-md bg-primary hover:bg-primary-pressed text-on-primary text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm transition-all active:scale-[0.98] shrink-0"
              title="Nueva Clase"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Nueva Clase</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around py-1.5 border-t border-hairline text-xs font-medium w-full">
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md transition-colors ${
              activeTab === 'dashboard' ? 'text-primary font-semibold' : 'text-steel'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="text-[11px]">Asignaturas</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('today')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md transition-colors ${
              activeTab === 'today' ? 'text-primary font-semibold' : 'text-steel'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span className="text-[11px]">Hoy</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('weekly')}
            className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-md transition-colors ${
              activeTab === 'weekly' ? 'text-primary font-semibold' : 'text-steel'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span className="text-[11px]">Semana</span>
          </button>
        </div>
      </div>
    </header>
  );
};
