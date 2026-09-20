import { useState, useEffect, useMemo } from 'react';
import { useAttendanceStore } from './store/useAttendanceStore';
import type { ClassItem, Course } from './types';
import { detectPendingCatchUp } from './utils/schedule';
import { Navbar } from './components/Navbar';
import { DashboardView } from './views/DashboardView';
import { TodayScheduleView } from './views/TodayScheduleView';
import { WeeklyScheduleView } from './views/WeeklyScheduleView';
import { ClassModal } from './components/ClassModal';
import { CourseModal } from './components/CourseModal';
import { ClassDetailModal } from './components/ClassDetailModal';
import { CatchUpModal } from './components/CatchUpModal';
import { BackupModal } from './components/BackupModal';

export function App() {
  const {
    courses,
    activeCourseId,
    attendanceRecords,
    dismissedCatchUpIds,
    activeTab,
    setActiveTab,
    setActiveCourse,
    addCourse,
    updateCourse,
    deleteCourse,
    addClass,
    updateClass,
    deleteClass,
    incrementAbsence,
    decrementAbsence,
    recordAttendance,
    deleteAttendanceRecord,
    dismissCatchUp,
    resetToDemo,
    clearAllData,
    importData
  } = useAttendanceStore();

  // Modals state
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);

  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [selectedClassDetail, setSelectedClassDetail] = useState<ClassItem | null>(null);
  const [isClassDetailOpen, setIsClassDetailOpen] = useState(false);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);
  const [isCatchUpModalOpen, setIsCatchUpModalOpen] = useState(false);
  const [hasAutoOpenedCatchUp, setHasAutoOpenedCatchUp] = useState(false);

  // Active course
  const activeCourse = useMemo(() => {
    return courses.find((c) => c.id === activeCourseId) || courses[0] || null;
  }, [courses, activeCourseId]);

  // If no active course is selected but courses exist, auto-select first
  useEffect(() => {
    if (!activeCourseId && courses.length > 0) {
      setActiveCourse(courses[0].id);
    }
  }, [activeCourseId, courses, setActiveCourse]);

  // Detect pending catch-up classes
  const pendingPrompts = useMemo(() => {
    if (!activeCourse?.classes) return [];
    return detectPendingCatchUp(
      activeCourse.classes,
      attendanceRecords,
      dismissedCatchUpIds
    );
  }, [activeCourse, attendanceRecords, dismissedCatchUpIds]);

  // Auto-launch Catch-Up modal on app open if there are past classes today
  useEffect(() => {
    if (!hasAutoOpenedCatchUp && pendingPrompts.length > 0) {
      const timer = setTimeout(() => {
        setIsCatchUpModalOpen(true);
        setHasAutoOpenedCatchUp(true);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pendingPrompts.length, hasAutoOpenedCatchUp]);

  // Handlers for Class Modal
  const handleOpenNewClass = () => {
    setEditingClass(null);
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (classItem: ClassItem) => {
    setEditingClass(classItem);
    setIsClassModalOpen(true);
  };

  const handleSaveClass = (data: Omit<ClassItem, 'id' | 'createdAt'>) => {
    if (!activeCourse) return;

    if (editingClass) {
      updateClass(activeCourse.id, editingClass.id, data);
      // Also update selectedClassDetail if it's currently open
      if (selectedClassDetail?.id === editingClass.id) {
        setSelectedClassDetail({
          ...selectedClassDetail,
          ...data
        });
      }
    } else {
      addClass(activeCourse.id, data);
    }
  };

  // Handlers for Course Modal
  const handleOpenNewCourse = () => {
    setEditingCourse(null);
    setIsCourseModalOpen(true);
  };

  const handleOpenEditCourse = (course: Course) => {
    setEditingCourse(course);
    setIsCourseModalOpen(true);
  };

  const handleSaveCourse = (name: string, color?: string) => {
    if (editingCourse) {
      updateCourse(editingCourse.id, name, color);
    } else {
      addCourse(name, color);
    }
  };

  // Handler for viewing class details
  const handleViewClassDetails = (classItem: ClassItem) => {
    setSelectedClassDetail(classItem);
    setIsClassDetailOpen(true);
  };

  // Keep selectedClassDetail in sync with latest store values
  const currentSelectedClass = useMemo(() => {
    if (!selectedClassDetail || !activeCourse) return null;
    return activeCourse.classes.find((c) => c.id === selectedClassDetail.id) || null;
  }, [selectedClassDetail, activeCourse]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased">
      {/* Navbar Header */}
      <Navbar
        courses={courses}
        activeCourseId={activeCourse?.id || null}
        activeTab={activeTab}
        pendingPromptsCount={pendingPrompts.length}
        onSelectCourse={setActiveCourse}
        onNewCourse={handleOpenNewCourse}
        onEditCourse={handleOpenEditCourse}
        onDeleteCourse={deleteCourse}
        onTabChange={setActiveTab}
        onOpenCatchUp={() => setIsCatchUpModalOpen(true)}
        onOpenBackup={() => setIsBackupModalOpen(true)}
        onNewClass={handleOpenNewClass}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!activeCourse ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/60 border border-dashed border-slate-800 space-y-4 max-w-md mx-auto my-12">
            <h2 className="text-xl font-bold text-white">No tienes periodos creados</h2>
            <p className="text-xs text-slate-400">
              Crea tu primer periodo académico o carga los datos de ejemplo para empezar a llevar el control de tus faltas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleOpenNewCourse}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
              >
                Crear Periodo
              </button>
              <button
                type="button"
                onClick={resetToDemo}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
              >
                Cargar Demo
              </button>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                courseName={activeCourse.name}
                courseId={activeCourse.id}
                classes={activeCourse.classes || []}
                onIncrement={incrementAbsence}
                onDecrement={decrementAbsence}
                onEditClass={handleOpenEditClass}
                onDeleteClass={(classId) => deleteClass(activeCourse.id, classId)}
                onViewClassDetails={handleViewClassDetails}
                onNewClass={handleOpenNewClass}
                onLoadDemo={resetToDemo}
              />
            )}

            {activeTab === 'today' && (
              <TodayScheduleView
                classes={activeCourse.classes || []}
                courseId={activeCourse.id}
                records={attendanceRecords}
                onRecordAttendance={recordAttendance}
                onViewClass={handleViewClassDetails}
              />
            )}

            {activeTab === 'weekly' && (
              <WeeklyScheduleView
                classes={activeCourse.classes || []}
                onViewClass={handleViewClassDetails}
                onNewClass={handleOpenNewClass}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>
          Contador de Faltas Interactivo • PWA Offline First • Datos guardados localmente
        </p>
      </footer>

      {/* Modals */}
      <ClassModal
        key={editingClass ? `edit-${editingClass.id}` : `new-${isClassModalOpen ? 'open' : 'closed'}`}
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveClass}
        initialData={editingClass}
      />

      <CourseModal
        key={editingCourse ? `edit-${editingCourse.id}` : `new-${isCourseModalOpen ? 'open' : 'closed'}`}
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        onSave={handleSaveCourse}
        initialData={editingCourse}
      />

      <ClassDetailModal
        isOpen={isClassDetailOpen}
        onClose={() => setIsClassDetailOpen(false)}
        classItem={currentSelectedClass}
        courseId={activeCourse?.id || ''}
        records={attendanceRecords}
        onIncrement={incrementAbsence}
        onDecrement={decrementAbsence}
        onRecordAttendance={recordAttendance}
        onDeleteRecord={deleteAttendanceRecord}
        onEdit={(cls) => {
          setIsClassDetailOpen(false);
          handleOpenEditClass(cls);
        }}
        onDeleteClass={(classId) => {
          if (activeCourse) {
            deleteClass(activeCourse.id, classId);
          }
          setIsClassDetailOpen(false);
        }}
      />

      <CatchUpModal
        isOpen={isCatchUpModalOpen}
        onClose={() => setIsCatchUpModalOpen(false)}
        prompts={pendingPrompts}
        onConfirmAttendance={(classId, status, date) => {
          if (activeCourse) {
            recordAttendance(activeCourse.id, classId, status, date, 'Confirmado desde Catch-up');
          }
        }}
        onDismissPrompt={dismissCatchUp}
      />

      <BackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        courses={courses}
        records={attendanceRecords}
        onImport={importData}
        onResetDemo={resetToDemo}
        onClearAll={clearAllData}
      />
    </div>
  );
}

export default App;
