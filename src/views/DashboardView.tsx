import React, { useState } from 'react';
import type { ClassItem } from '../types';
import { calculateDangerInfo } from '../utils/status';
import { ClassCard } from '../components/ClassCard';
import {
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  XCircle,
  TrendingDown,
  Sparkles
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
  onLoadDemo: () => void;
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
  onLoadDemo
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
      {/* Top Banner & KPI Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <span>{courseName}</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Control de inasistencias y marcador de límites por asignatura
          </p>
        </div>

        <button
          type="button"
          onClick={onNewClass}
          className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Añadir Asignatura</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Classes */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Asignaturas
            </span>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              {totalClasses}
            </span>
          </div>
        </div>

        {/* In Danger */}
        <div
          onClick={() => setActiveFilter(dangerClasses.length > 0 ? 'danger' : 'all')}
          className={`p-4 rounded-2xl border shadow-sm flex items-center gap-3 cursor-pointer transition-all ${
            dangerClasses.length > 0
              ? 'bg-amber-950/25 border-amber-500/40 hover:border-amber-500/60'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block truncate">
              En Peligro
            </span>
            <span className="text-2xl font-extrabold text-amber-300 tracking-tight">
              {dangerClasses.length}
            </span>
          </div>
        </div>

        {/* Failed / Exceeded */}
        <div
          onClick={() => setActiveFilter(failedClasses.length > 0 ? 'failed' : 'all')}
          className={`p-4 rounded-2xl border shadow-sm flex items-center gap-3 cursor-pointer transition-all ${
            failedClasses.length > 0
              ? 'bg-rose-950/25 border-rose-500/40 hover:border-rose-500/60'
              : 'bg-slate-900/80 border-slate-800'
          }`}
        >
          <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 shrink-0">
            <XCircle className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block truncate">
              Límite Superado
            </span>
            <span className="text-2xl font-extrabold text-rose-300 tracking-tight">
              {failedClasses.length}
            </span>
          </div>
        </div>

        {/* Total Absences */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-sm flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800 text-slate-300 border border-slate-700 shrink-0">
            <TrendingDown className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block truncate">
              Total Faltas
            </span>
            <span className="text-2xl font-extrabold text-white tracking-tight">
              {totalAbsences}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por materia, aula o profesor..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-slate-500 hover:text-white absolute right-3 top-1/2 -translate-y-1/2"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeFilter === 'all'
                ? 'bg-indigo-600 text-white shadow'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Todas ({totalClasses})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('danger')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
              activeFilter === 'danger'
                ? 'bg-amber-600 text-white shadow'
                : 'bg-slate-900 text-amber-400/80 hover:text-amber-300 border border-slate-800'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            <span>En Peligro ({dangerClasses.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('failed')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
              activeFilter === 'failed'
                ? 'bg-rose-600 text-white shadow'
                : 'bg-slate-900 text-rose-400/80 hover:text-rose-300 border border-slate-800'
            }`}
          >
            <XCircle className="w-3 h-3" />
            <span>Reprobadas ({failedClasses.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('safe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
              activeFilter === 'safe'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-slate-900 text-emerald-400/80 hover:text-emerald-300 border border-slate-800'
            }`}
          >
            <CheckCircle2 className="w-3 h-3" />
            <span>Seguras ({safeClasses.length})</span>
          </button>
        </div>
      </div>

      {/* Class Cards Grid */}
      {filteredClasses.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <BookOpen className="w-7 h-7" />
          </div>
          {totalClasses === 0 ? (
            <>
              <h3 className="text-lg font-bold text-white">No tienes asignaturas creadas</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Comienza creando tus materias con su límite de faltas permitido y horario semanal, o carga un semestre de ejemplo.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onNewClass}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Asignatura</span>
                </button>
                <button
                  type="button"
                  onClick={onLoadDemo}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 border border-slate-700"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>Cargar Datos de Ejemplo</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 className="text-base font-bold text-white">No se encontraron asignaturas</h3>
              <p className="text-xs text-slate-400">
                Ninguna asignatura coincide con los filtros o búsqueda actuales.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Restablecer filtros
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            />
          ))}
        </div>
      )}
    </div>
  );
};
