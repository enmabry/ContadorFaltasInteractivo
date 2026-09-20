import { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { useAttendanceStore } from './store/useAttendanceStore';
import type { ClassItem, Course } from './types';
import { detectPendingCatchUp } from './utils/schedule';
import { decodeCourseFromURL, decodeClassFromURL } from './utils/share';
import { Navbar } from './components/Navbar';
import { DashboardView } from './views/DashboardView';
import { TodayScheduleView } from './views/TodayScheduleView';
import { WeeklyScheduleView } from './views/WeeklyScheduleView';
import { ClassModal } from './components/ClassModal';
import { CourseModal } from './components/CourseModal';
import { ClassDetailModal } from './components/ClassDetailModal';
import { CatchUpModal } from './components/CatchUpModal';
import { BackupModal } from './components/BackupModal';
import { InstallGuideModal } from './components/InstallGuideModal';
import { ShareCourseModal } from './components/ShareCourseModal';
import { ShareClassModal } from './components/ShareClassModal';

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
  const [isInstallGuideOpen, setIsInstallGuideOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [sharingClass, setSharingClass] = useState<ClassItem | null>(null);
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

  // Intercept shared course or single class from URL on mount (?share=... or ?shareClass=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shareHash = params.get('share');
    const shareClassHash = params.get('shareClass');

    if (shareHash) {
      const importedCourse = decodeCourseFromURL(shareHash);

      if (importedCourse) {
        const classesCount = importedCourse.classes?.length || 0;
        const confirmImport = window.confirm(
          `¿Quieres importar el periodo "${importedCourse.name}" con ${classesCount} ${
            classesCount === 1 ? 'asignatura' : 'asignaturas'
          }? (Las faltas iniciarán en 0)`
        );

        if (confirmImport) {
          useAttendanceStore.getState().importCourse(importedCourse);
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 }
          });
          alert(`¡Periodo "${importedCourse.name}" importado con éxito! 🎉`);
        }
      }

      // Limpiamos el token de la URL para que no quede saturada
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (shareClassHash) {
      const importedClass = decodeClassFromURL(shareClassHash);

      if (importedClass) {
        const store = useAttendanceStore.getState();
        let targetCourseId = store.activeCourseId;
        if (!targetCourseId && store.courses.length > 0) {
          targetCourseId = store.courses[0].id;
        } else if (!targetCourseId) {
          targetCourseId = store.addCourse('Mi Semestre');
        }

        const targetCourse = store.courses.find((c) => c.id === targetCourseId) || { name: 'tu periodo actual' };
        const confirmClass = window.confirm(
          `¿Quieres importar la asignatura "${importedClass.name}" en el periodo "${targetCourse.name}"? (Las inasistencias iniciarán en 0)`
        );

        if (confirmClass && targetCourseId) {
          store.addClass(targetCourseId, importedClass);
          confetti({
            particleCount: 70,
            spread: 80,
            origin: { y: 0.6 }
          });
          alert(`¡Asignatura "${importedClass.name}" agregada con éxito! 🎉`);
        }
      }

      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

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
    <div className="min-h-screen bg-surface-soft text-charcoal flex flex-col antialiased">
      {/* Notion Top Navigation */}
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
        onOpenInstallGuide={() => setIsInstallGuideOpen(true)}
        onOpenShareCourse={() => setIsShareModalOpen(true)}
        onNewClass={handleOpenNewClass}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {!activeCourse ? (
          <div className="p-10 text-center rounded-lg bg-canvas border border-hairline space-y-3.5 max-w-md mx-auto my-12 shadow-xs">
            <h2 className="text-lg font-bold text-ink">No tienes periodos creados</h2>
            <p className="text-xs text-steel">
              Crea tu primer periodo académico o carga los datos de ejemplo para empezar a llevar el control de tus faltas.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleOpenNewCourse}
                className="w-full sm:w-auto px-4 py-2 rounded-md bg-primary hover:bg-primary-pressed text-on-primary text-xs font-medium shadow-xs"
              >
                Crear Periodo
              </button>
              <button
                type="button"
                onClick={resetToDemo}
                className="w-full sm:w-auto px-4 py-2 rounded-md bg-canvas hover:bg-surface text-charcoal text-xs font-medium border border-hairline-strong"
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
                onShareCourse={() => setIsShareModalOpen(true)}
                onShareClass={(cls) => setSharingClass(cls)}
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

      {/* Footer - Notion footer-region */}
      <footer className="py-6 border-t border-hairline bg-canvas text-center text-xs text-steel">
        <p>
          Contador de Faltas Interactivo • Notion Design System • PWA Offline-First
        </p>
      </footer>

      {/* Modals */}
      <ClassModal
        key={editingClass ? `class-edit-${editingClass.id}` : `class-new-${isClassModalOpen ? 'open' : 'closed'}`}
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        onSave={handleSaveClass}
        initialData={editingClass}
        courseId={activeCourse?.id}
      />

      <CourseModal
        key={editingCourse ? `course-edit-${editingCourse.id}` : `course-new-${isCourseModalOpen ? 'open' : 'closed'}`}
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
        onShareClass={(cls) => setSharingClass(cls)}
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

      <InstallGuideModal
        isOpen={isInstallGuideOpen}
        onClose={() => setIsInstallGuideOpen(false)}
      />

      <ShareCourseModal
        course={activeCourse}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />

      <ShareClassModal
        classItem={sharingClass}
        isOpen={Boolean(sharingClass)}
        onClose={() => setSharingClass(null)}
      />
    </div>
  );
}

export default App;
