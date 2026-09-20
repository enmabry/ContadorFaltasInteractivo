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
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-canvas border border-hairline-strong hover:bg-surface text-charcoal transition-all text-xs font-medium shadow-xs"
      >
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ backgroundColor: activeCourse?.color || '#5645d4' }}
        />
        <span className="truncate max-w-[100px] sm:max-w-[180px] font-semibold text-ink">
          {activeCourse ? activeCourse.name : 'Sin Periodo'}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-steel shrink-0" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-1 w-72 bg-canvas border border-hairline rounded-md shadow-[0px_16px_48px_-8px_rgba(15,15,15,0.16)] z-40 py-2 text-xs divide-y divide-hairline-soft animate-in fade-in zoom-in-95 duration-100">
            {/* List of courses */}
            <div className="py-1 max-h-60 overflow-y-auto">
              <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-stone">
                Periodos / Semestres
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
                        ? 'bg-card-tint-lavender/50 text-brand-purple-800 font-semibold'
                        : 'hover:bg-surface text-charcoal'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate min-w-0">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: course.color || '#5645d4' }}
                      />
                      <span className="truncate">{course.name}</span>
                      <span className="text-[11px] text-steel font-normal">
                        ({course.classes?.length || 0})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {isCurrent && <Check className="w-3.5 h-3.5 text-primary" />}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                          onEditCourse(course);
                        }}
                        className="p-1 text-steel hover:text-ink rounded-xs hover:bg-surface"
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
                          className="p-1 text-steel hover:text-semantic-error rounded-xs hover:bg-card-tint-rose"
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
            <div className="pt-2 px-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onNewCourse();
                }}
                className="w-full py-1.5 px-3 rounded-md bg-surface hover:bg-hairline text-charcoal border border-hairline font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-primary" />
                <span>Crear Nuevo Periodo</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
