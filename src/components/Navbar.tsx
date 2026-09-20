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
  QrCode
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
    <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-md border-b border-hairline transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Course Selector */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-8 h-8 rounded-md bg-brand-navy border border-hairline-strong text-on-dark flex items-center justify-center font-bold text-sm shadow-xs transition-transform group-hover:scale-105 relative overflow-hidden">
                {/* WEBER Architectural Iron Cage / W Monogram */}
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
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

            <div className="h-5 w-px bg-hairline hidden sm:block" />

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
          <div className="flex items-center gap-2">
            {/* Catch-up Notification trigger */}
            {pendingPromptsCount > 0 && (
              <button
                type="button"
                onClick={onOpenCatchUp}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-card-tint-peach border border-brand-orange/40 text-brand-orange-deep hover:bg-card-tint-peach/80 text-xs font-semibold transition-all animate-bounce"
                title={`${pendingPromptsCount} clases pendientes de confirmar`}
              >
                <Bell className="w-3.5 h-3.5 text-brand-orange" />
                <span className="hidden sm:inline">Ponerse al día</span>
                <span className="w-4 h-4 rounded-full bg-brand-orange text-on-dark flex items-center justify-center text-[10px] font-bold">
                  {pendingPromptsCount}
                </span>
              </button>
            )}

            {/* PWA Install Button (Always helpful for friends on iOS & Android) */}
            <button
              type="button"
              onClick={handleInstallClick}
              className="px-2.5 sm:px-3 py-1.5 rounded-md border border-hairline-strong text-charcoal hover:bg-surface text-xs font-medium flex items-center gap-1.5 transition-colors"
              title="Instalar como App en tu móvil (iOS / Android)"
            >
              {deferredPrompt ? <Download className="w-3.5 h-3.5 text-primary" /> : <Smartphone className="w-3.5 h-3.5 text-steel" />}
              <span className="hidden sm:inline">Instalar App</span>
            </button>

            {/* Share Course / QR button */}
            <button
              type="button"
              onClick={onOpenShareCourse}
              disabled={!activeCourseId}
              className="p-2 rounded-md border border-hairline-strong text-charcoal hover:bg-surface hover:text-ink transition-colors disabled:opacity-40"
              title="Compartir periodo (Código QR / Enlace)"
            >
              <QrCode className="w-4 h-4" />
            </button>

            {/* Backup / Data button */}
            <button
              type="button"
              onClick={onOpenBackup}
              className="p-2 rounded-md border border-hairline-strong text-charcoal hover:bg-surface hover:text-ink transition-colors"
              title="Copias de Seguridad y Datos"
            >
              <HardDrive className="w-4 h-4" />
            </button>

            {/* Primary Action Button: Signature Notion Purple #5645d4, rectangular rounded-md (8px) */}
            <button
              type="button"
              onClick={onNewClass}
              className="px-3.5 py-1.5 rounded-md bg-primary hover:bg-primary-pressed text-on-primary text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="hidden sm:inline">Nueva Clase</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-hairline text-xs font-medium">
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-md ${
              activeTab === 'dashboard' ? 'text-primary font-semibold' : 'text-steel'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Asignaturas</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('today')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-md ${
              activeTab === 'today' ? 'text-primary font-semibold' : 'text-steel'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Hoy</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('weekly')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-md ${
              activeTab === 'weekly' ? 'text-primary font-semibold' : 'text-steel'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Semana</span>
          </button>
        </div>
      </div>
    </header>
  );
};
