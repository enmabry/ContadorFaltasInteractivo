import React, { useState } from 'react';
import type { Course } from '../types';
import { ChevronDown, Plus, Edit2, Trash2, Check } from 'lucide-react';

interface CourseSelectorProps {
  courses: Course[];
  activeCourseId: string | null;
  onSelectCourse: (courseId: string) => void;
  onNewCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
}

export const CourseSelector: React.FC<CourseSelectorProps> = ({
  courses,
  activeCourseId,
  onSelectCourse,
  onNewCourse,
  onEditCourse,
  onDeleteCourse
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeCourse = courses.find((c) => c.id === activeCourseId) || courses[0];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 transition-all text-sm font-semibold shadow-sm hover:shadow"
      >
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: activeCourse?.color || '#6366f1' }}
        />
        <span className="truncate max-w-[150px] sm:max-w-[200px]">
          {activeCourse ? activeCourse.name : 'Sin Periodo'}
        </span>
        <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl z-40 py-2 text-xs divide-y divide-slate-800 animate-in fade-in zoom-in-95 duration-150">
            {/* List of courses */}
            <div className="py-1 max-h-60 overflow-y-auto">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tus Periodos / Semestres
              </div>
              {courses.map((course) => {
                const isCurrent = course.id === activeCourseId;
                return (
                  <div
                    key={course.id}
                    onClick={() => {
                      onSelectCourse(course.id);
                      setIsOpen(false);
                    }}
                    className={`px-3 py-2 flex items-center justify-between cursor-pointer transition-colors ${
                      isCurrent
                        ? 'bg-indigo-600/10 text-indigo-300 font-bold'
                        : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: course.color || '#6366f1' }}
                      />
                      <span className="truncate">{course.name}</span>
                      <span className="text-[11px] text-slate-400 font-normal">
                        ({course.classes?.length || 0} {course.classes?.length === 1 ? 'materia' : 'materias'})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isCurrent && <Check className="w-4 h-4 text-indigo-400" />}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                          onEditCourse(course);
                        }}
                        className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-700/60"
                        title="Editar periodo"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      {courses.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Eliminar el periodo "${course.name}" y todas sus asignaturas?`)) {
                              onDeleteCourse(course.id);
                              setIsOpen(false);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-rose-950/30"
                          title="Eliminar periodo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add course button */}
            <div className="pt-1.5 px-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNewCourse();
                }}
                className="w-full py-2 px-3 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Crear Nuevo Periodo</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
