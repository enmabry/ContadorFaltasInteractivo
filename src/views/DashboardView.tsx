import React, { useState } from 'react';
import type { ClassItem } from '../types';
import { calculateDangerInfo } from '../utils/status';
import { ClassCard } from '../components/ClassCard';
import { CalendarImportBtn } from '../components/CalendarImportBtn';
import {
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  XCircle,
  TrendingDown,
  QrCode,
  ScanLine
} from 'lucide-react';

interface DashboardViewProps {
  courseName: string;
  courseId: string;
  classes: ClassItem[];
  onIncrement: (courseId: string, classId: string) => void;
  onDecrement: (courseId: string, classId: string) => void;
  onEditClass: (classItem: ClassItem) => void;
  onDeleteClass: (classId: string) => void;
  onViewClassDetails: (classItem: ClassItem) => void;
  onNewClass: () => void;
  onOpenScanQR?: () => void;
  onShareCourse?: () => void;
  onShareClass?: (classItem: ClassItem) => void;
}

type FilterType = 'all' | 'danger' | 'safe' | 'failed';

export const DashboardView: React.FC<DashboardViewProps> = ({
  courseName,
  courseId,
  classes,
  onIncrement,
  onDecrement,
  onEditClass,
  onDeleteClass,
  onViewClassDetails,
  onNewClass,
  onOpenScanQR,
  onShareCourse,
  onShareClass
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // KPI Calculations
  const totalClasses = classes.length;
  const totalAbsences = classes.reduce((sum, c) => sum + c.absences, 0);

  const dangerClasses = classes.filter((c) => {
    const info = calculateDangerInfo(c.absences, c.maxAbsences);
    return info.level === 'danger';
  });

  const failedClasses = classes.filter((c) => {
    const info = calculateDangerInfo(c.absences, c.maxAbsences);
    return info.level === 'failed';
  });

  const safeClasses = classes.filter((c) => {
    const info = calculateDangerInfo(c.absences, c.maxAbsences);
    return info.level === 'safe' || info.level === 'warning';
  });

  // Filtered List
  const filteredClasses = classes.filter((cls) => {
    const matchesSearch =
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.room && cls.room.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (cls.professor && cls.professor.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    const info = calculateDangerInfo(cls.absences, cls.maxAbsences);
    if (activeFilter === 'danger') return info.level === 'danger';
    if (activeFilter === 'failed') return info.level === 'failed';
    if (activeFilter === 'safe') return info.level === 'safe' || info.level === 'warning';
    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Signature Notion Deep Navy Hero Band */}
      <div className="relative overflow-hidden rounded-lg bg-brand-navy text-on-dark p-6 sm:p-8 shadow-[0px_4px_12px_rgba(15,15,15,0.08)]">
        {/* Decorative sticky-note dots from Notion brand spectrum */}
        <div className="absolute top-4 right-12 w-3 h-3 rounded-full bg-brand-pink opacity-80" />
        <div className="absolute top-10 right-28 w-2 h-2 rounded-full bg-brand-yellow opacity-70" />
        <div className="absolute bottom-6 right-16 w-3.5 h-3.5 rounded-full bg-brand-teal opacity-75" />
        <div className="absolute top-6 right-48 w-2.5 h-2.5 rounded-full bg-brand-purple-300 opacity-60" />
        <div className="absolute bottom-10 right-36 w-2 h-2 rounded-full bg-brand-orange opacity-70" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-brand-navy-mid text-on-dark-muted text-[11px] font-medium border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-purple-300" />
              <span>WEBER • {courseName}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-on-dark">
              Racionaliza tu tiempo universitario
            </h1>
            <p className="text-xs sm:text-sm text-on-dark-muted leading-relaxed">
              Domina la jaula de tus horarios. Métricas en tiempo real, límites de inasistencia y cálculo de márgenes para que tú controles al sistema, no el sistema a ti.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto shrink-0 mt-2 lg:mt-0">
            {onShareCourse && (
              <button
                type="button"
                onClick={onShareCourse}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 sm:py-1.5 text-xs font-medium text-charcoal bg-canvas hover:bg-surface border border-hairline-strong rounded-md transition-colors shadow-xs"
                title="Compartir este periodo vía QR o enlace"
              >
                <QrCode className="w-3.5 h-3.5 text-steel" />
                <span>Compartir Semestre</span>
              </button>
            )}

            {onOpenScanQR && (
              <button
                type="button"
                onClick={onOpenScanQR}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-3.5 py-2 sm:py-1.5 text-xs font-medium text-charcoal bg-canvas hover:bg-surface border border-hairline-strong rounded-md transition-colors shadow-xs"
                title="Escanear código QR de clase o semestre"
              >
                <ScanLine className="w-3.5 h-3.5 text-steel" />
                <span>Escanear QR</span>
              </button>
            )}

            <CalendarImportBtn courseId={courseId} />

            {/* Signature Purple Rectangular Button */}
            <button
              type="button"
              onClick={onNewClass}
              className="w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-md bg-primary hover:bg-primary-pressed text-on-primary text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Añadir Asignatura</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Notion Pastel Database Properties Palette */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Total Classes */}
        <div className="p-4 rounded-lg bg-canvas border border-hairline shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xs bg-surface text-charcoal shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-steel uppercase tracking-wider block truncate">
              Asignaturas
            </span>
            <span className="text-xl font-bold text-ink">
              {totalClasses}
            </span>
          </div>
        </div>

        {/* In Danger - Card Tint Peach */}
        <div
          onClick={() => setActiveFilter(dangerClasses.length > 0 ? 'danger' : 'all')}
          className={`p-4 rounded-lg border shadow-xs flex items-center gap-3 cursor-pointer transition-colors ${
            dangerClasses.length > 0
              ? 'bg-card-tint-peach border-brand-orange/30 hover:border-brand-orange/50'
              : 'bg-canvas border-hairline'
          }`}
        >
          <div className="p-2 rounded-xs bg-brand-orange/10 text-brand-orange-deep shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-brand-orange-deep uppercase tracking-wider block truncate">
              En Peligro
            </span>
            <span className="text-xl font-bold text-brand-orange-deep">
              {dangerClasses.length}
            </span>
          </div>
        </div>

        {/* Failed - Card Tint Rose */}
        <div
          onClick={() => setActiveFilter(failedClasses.length > 0 ? 'failed' : 'all')}
          className={`p-4 rounded-lg border shadow-xs flex items-center gap-3 cursor-pointer transition-colors ${
            failedClasses.length > 0
              ? 'bg-card-tint-rose border-semantic-error/30 hover:border-semantic-error/50'
              : 'bg-canvas border-hairline'
          }`}
        >
          <div className="p-2 rounded-xs bg-semantic-error/10 text-semantic-error shrink-0">
            <XCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-semantic-error uppercase tracking-wider block truncate">
              Límite Superado
            </span>
            <span className="text-xl font-bold text-semantic-error">
              {failedClasses.length}
            </span>
          </div>
        </div>

        {/* Total Absences - Card Tint Lavender */}
        <div className="p-4 rounded-lg bg-card-tint-lavender/40 border border-brand-purple-300/40 shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xs bg-brand-purple/10 text-brand-purple-800 shrink-0">
            <TrendingDown className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-semibold text-brand-purple-800 uppercase tracking-wider block truncate">
              Total Faltas
            </span>
            <span className="text-xl font-bold text-brand-purple-800">
              {totalAbsences}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar - Notion search-pill & pill-tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
        {/* Search Pill */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-steel absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por materia, aula o docente..."
            className="w-full pl-9 pr-4 h-10 rounded-md bg-canvas border border-hairline-strong text-ink placeholder-muted text-xs focus:outline-none focus:border-2 focus:border-primary transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-steel hover:text-ink absolute right-3 top-1/2 -translate-y-1/2"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filter Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 ${
              activeFilter === 'all'
                ? 'bg-ink-deep text-on-dark'
                : 'bg-canvas text-steel hover:text-ink border border-hairline hover:bg-surface'
            }`}
          >
            Todas ({totalClasses})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('danger')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 flex items-center gap-1 ${
              activeFilter === 'danger'
                ? 'bg-ink-deep text-on-dark'
                : 'bg-canvas text-brand-orange-deep hover:bg-card-tint-peach/40 border border-brand-orange/30'
            }`}
          >
            <AlertTriangle className="w-3 h-3 text-brand-orange" />
            <span>En Peligro ({dangerClasses.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('failed')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 flex items-center gap-1 ${
              activeFilter === 'failed'
                ? 'bg-ink-deep text-on-dark'
                : 'bg-canvas text-semantic-error hover:bg-card-tint-rose/40 border border-semantic-error/30'
            }`}
          >
            <XCircle className="w-3 h-3 text-semantic-error" />
            <span>Reprobadas ({failedClasses.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('safe')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors shrink-0 flex items-center gap-1 ${
              activeFilter === 'safe'
                ? 'bg-ink-deep text-on-dark'
                : 'bg-canvas text-brand-green hover:bg-card-tint-mint/40 border border-brand-green/30'
            }`}
          >
            <CheckCircle2 className="w-3 h-3 text-brand-green" />
            <span>Seguras ({safeClasses.length})</span>
          </button>
        </div>
      </div>

      {/* Class Cards Grid */}
      {filteredClasses.length === 0 ? (
        <div className="p-10 text-center rounded-lg bg-canvas border border-dashed border-hairline space-y-3">
          <div className="w-12 h-12 rounded-md bg-card-tint-lavender text-brand-purple-800 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          {totalClasses === 0 ? (
            <>
              <h3 className="text-base font-semibold text-ink">No tienes asignaturas creadas</h3>
              <p className="text-xs text-steel max-w-md mx-auto">
                Comienza creando tus materias con su límite de faltas permitido y horario semanal, o carga un semestre de ejemplo.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-2.5 pt-2 w-full max-w-lg mx-auto">
                <button
                  type="button"
                  onClick={onNewClass}
                  className="w-full sm:w-auto px-4 py-2 rounded-md bg-primary hover:bg-primary-pressed text-on-primary text-xs font-medium flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Crear Asignatura</span>
                </button>
                <CalendarImportBtn courseId={courseId} />
                {onShareCourse && (
                  <button
                    type="button"
                    onClick={onShareCourse}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-md bg-canvas hover:bg-surface text-charcoal border border-hairline-strong text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <QrCode className="w-3.5 h-3.5 text-steel" />
                    <span>Compartir QR</span>
                  </button>
                )}
                {onOpenScanQR && (
                  <button
                    type="button"
                    onClick={onOpenScanQR}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-md bg-canvas hover:bg-surface text-charcoal border border-hairline-strong text-xs font-medium flex items-center justify-center gap-1.5"
                  >
                    <ScanLine className="w-3.5 h-3.5 text-steel" />
                    <span>Escanear QR</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-ink">No se encontraron asignaturas</h3>
              <p className="text-xs text-steel">
                Ninguna asignatura coincide con los filtros o búsqueda actuales.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="px-3 py-1.5 rounded-md bg-surface text-charcoal border border-hairline text-xs font-medium"
              >
                Restablecer filtros
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredClasses.map((cls) => (
            <ClassCard
              key={cls.id}
              classItem={cls}
              courseId={courseId}
              onIncrement={onIncrement}
              onDecrement={onDecrement}
              onEdit={onEditClass}
              onDelete={onDeleteClass}
              onViewDetails={onViewClassDetails}
              onShareClass={onShareClass}
            />
          ))}
        </div>
      )}
    </div>
  );
};
