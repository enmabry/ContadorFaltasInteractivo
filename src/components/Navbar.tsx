import React, { useState, useEffect } from 'react';
import type { Course } from '../types';
import { CourseSelector } from './CourseSelector';
import {
  ShieldCheck,
  Calendar,
  Clock,
  LayoutGrid,
  HardDrive,
  Bell,
  Download,
  Plus
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

  const handleInstallPWA = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Logo & Course Selector */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div
              onClick={() => onTabChange('dashboard')}
              className="flex items-center gap-2.5 cursor-pointer group select-none"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                  Faltas<span className="text-indigo-400">App</span>
                </span>
                <span className="block text-[10px] text-slate-400 font-semibold tracking-wider uppercase -mt-0.5">
                  Control de Inasistencias
                </span>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-800 hidden sm:block" />

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

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onTabChange('dashboard')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Asignaturas</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('today')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'today'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Hoy</span>
            </button>
            <button
              type="button"
              onClick={() => onTabChange('weekly')}
              className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'weekly'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Horario Semanal</span>
            </button>
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {/* Catch-up Notification trigger */}
            {pendingPromptsCount > 0 && (
              <button
                type="button"
                onClick={onOpenCatchUp}
                className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500/20 text-xs font-bold transition-all animate-bounce"
                title={`${pendingPromptsCount} clases pendientes de confirmar`}
              >
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Ponerse al día</span>
                <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-extrabold">
                  {pendingPromptsCount}
                </span>
              </button>
            )}

            {/* PWA Install Button */}
            {deferredPrompt && (
              <button
                type="button"
                onClick={handleInstallPWA}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                title="Instalar como App en tu móvil o PC"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Instalar App</span>
              </button>
            )}

            {/* Backup / Data button */}
            <button
              type="button"
              onClick={onOpenBackup}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              title="Copias de Seguridad y Datos"
            >
              <HardDrive className="w-4 h-4" />
            </button>

            {/* Quick Add Class button */}
            <button
              type="button"
              onClick={onNewClass}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Nueva Clase</span>
            </button>
          </div>
        </div>

        {/* Mobile Bottom-bar Navigation (shown on small screens) */}
        <div className="md:hidden flex items-center justify-around py-2 border-t border-slate-900 text-xs font-medium">
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl ${
              activeTab === 'dashboard' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Asignaturas</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('today')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl ${
              activeTab === 'today' ? 'text-indigo-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Hoy</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange('weekly')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl ${
              activeTab === 'weekly' ? 'text-indigo-400 font-bold' : 'text-slate-400'
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
