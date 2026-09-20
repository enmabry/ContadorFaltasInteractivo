import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AttendanceRecord, AttendanceStatus, ClassItem, Course } from '../types';
import { INITIAL_DEMO_COURSES } from './demoData';
import { getTodayDateString } from '../utils/schedule';

interface AttendanceStoreState {
  courses: Course[];
  activeCourseId: string | null;
  attendanceRecords: AttendanceRecord[];
  dismissedCatchUpIds: string[];
  activeTab: 'dashboard' | 'today' | 'weekly';

  // Navigation
  setActiveTab: (tab: 'dashboard' | 'today' | 'weekly') => void;

  // Course Actions
  setActiveCourse: (courseId: string) => void;
  addCourse: (name: string, color?: string) => string;
  updateCourse: (id: string, name: string, color?: string) => void;
  deleteCourse: (id: string) => void;

  // Class Actions
  addClass: (courseId: string, classData: Omit<ClassItem, 'id' | 'createdAt'>) => string;
  updateClass: (courseId: string, classId: string, classData: Partial<ClassItem>) => void;
  deleteClass: (courseId: string, classId: string) => void;
  incrementAbsence: (courseId: string, classId: string, note?: string) => void;
  decrementAbsence: (courseId: string, classId: string) => void;

  // Attendance & Catch-up
  recordAttendance: (
    courseId: string,
    classId: string,
    status: AttendanceStatus,
    date?: string,
    note?: string
  ) => void;
  deleteAttendanceRecord: (recordId: string) => void;
  dismissCatchUp: (promptId: string) => void;

  // Backup & Presets
  resetToDemo: () => void;
  clearAllData: () => void;
  importData: (courses: Course[], records?: AttendanceRecord[]) => boolean;
}

export const useAttendanceStore = create<AttendanceStoreState>()(
  persist(
    (set) => ({
      courses: INITIAL_DEMO_COURSES,
      activeCourseId: INITIAL_DEMO_COURSES[0]?.id || null,
      attendanceRecords: [],
      dismissedCatchUpIds: [],
      activeTab: 'dashboard',

      setActiveTab: (tab) => set({ activeTab: tab }),

      setActiveCourse: (courseId) => set({ activeCourseId: courseId }),

      addCourse: (name, color = '#6366f1') => {
        const newCourse: Course = {
          id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
          name: name.trim() || 'Nuevo Periodo',
          color,
          createdAt: Date.now(),
          classes: []
        };
        set((state) => ({
          courses: [...state.courses, newCourse],
          activeCourseId: newCourse.id
        }));
        return newCourse.id;
      },

      updateCourse: (id, name, color) => {
        set((state) => ({
          courses: state.courses.map((c) =>
            c.id === id
              ? { ...c, name: name.trim() || c.name, color: color || c.color }
              : c
          )
        }));
      },

      deleteCourse: (id) => {
        set((state) => {
          const remainingCourses = state.courses.filter((c) => c.id !== id);
          const nextActiveId =
            state.activeCourseId === id
              ? remainingCourses[0]?.id || null
              : state.activeCourseId;
          return {
            courses: remainingCourses,
            activeCourseId: nextActiveId,
            attendanceRecords: state.attendanceRecords.filter((r) => r.courseId !== id)
          };
        });
      },

      addClass: (courseId, classData) => {
        const newClassId = `cls-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const newClass: ClassItem = {
          ...classData,
          id: newClassId,
          absences: Math.max(0, classData.absences || 0),
          maxAbsences: Math.max(1, classData.maxAbsences || 5),
          schedule: classData.schedule || [],
          createdAt: Date.now()
        };

        set((state) => ({
          courses: state.courses.map((course) => {
            if (course.id !== courseId) return course;
            return {
              ...course,
              classes: [...course.classes, newClass]
            };
          })
        }));

        return newClassId;
      },

      updateClass: (courseId, classId, classData) => {
        set((state) => ({
          courses: state.courses.map((course) => {
            if (course.id !== courseId) return course;
            return {
              ...course,
              classes: course.classes.map((cls) => {
                if (cls.id !== classId) return cls;
                return {
                  ...cls,
                  ...classData,
                  absences:
                    classData.absences !== undefined
                      ? Math.max(0, classData.absences)
                      : cls.absences,
                  maxAbsences:
                    classData.maxAbsences !== undefined
                      ? Math.max(1, classData.maxAbsences)
                      : cls.maxAbsences
                };
              })
            };
          })
        }));
      },

      deleteClass: (courseId, classId) => {
        set((state) => ({
          courses: state.courses.map((course) => {
            if (course.id !== courseId) return course;
            return {
              ...course,
              classes: course.classes.filter((c) => c.id !== classId)
            };
          }),
          attendanceRecords: state.attendanceRecords.filter((r) => r.classId !== classId)
        }));
      },

      incrementAbsence: (courseId, classId, note) => {
        const todayStr = getTodayDateString();
        const recordId = `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        const newRecord: AttendanceRecord = {
          id: recordId,
          classId,
          courseId,
          date: todayStr,
          status: 'absent',
          note: note || 'Falta registrada manualmente',
          timestamp: Date.now()
        };

        set((state) => ({
          courses: state.courses.map((course) => {
            if (course.id !== courseId) return course;
            return {
              ...course,
              classes: course.classes.map((cls) => {
                if (cls.id !== classId) return cls;
                return { ...cls, absences: cls.absences + 1 };
              })
            };
          }),
          attendanceRecords: [newRecord, ...state.attendanceRecords]
        }));
      },

      decrementAbsence: (courseId, classId) => {
        set((state) => {
          const indexToRemove = state.attendanceRecords.findIndex(
            (r) => r.classId === classId && r.status === 'absent'
          );

          const updatedRecords =
            indexToRemove !== -1
              ? state.attendanceRecords.filter((_, idx) => idx !== indexToRemove)
              : state.attendanceRecords;

          return {
            courses: state.courses.map((course) => {
              if (course.id !== courseId) return course;
              return {
                ...course,
                classes: course.classes.map((cls) => {
                  if (cls.id !== classId) return cls;
                  return { ...cls, absences: Math.max(0, cls.absences - 1) };
                })
              };
            }),
            attendanceRecords: updatedRecords
          };
        });
      },

      recordAttendance: (courseId, classId, status, date, note) => {
        const targetDate = date || getTodayDateString();
        const recordId = `att-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        const newRecord: AttendanceRecord = {
          id: recordId,
          classId,
          courseId,
          date: targetDate,
          status,
          note,
          timestamp: Date.now()
        };

        set((state) => {
          let updatedCourses = state.courses;
          if (status === 'absent') {
            updatedCourses = state.courses.map((course) => {
              if (course.id !== courseId) return course;
              return {
                ...course,
                classes: course.classes.map((cls) => {
                  if (cls.id !== classId) return cls;
                  return { ...cls, absences: cls.absences + 1 };
                })
              };
            });
          }

          return {
            courses: updatedCourses,
            attendanceRecords: [newRecord, ...state.attendanceRecords]
          };
        });
      },

      deleteAttendanceRecord: (recordId) => {
        set((state) => {
          const record = state.attendanceRecords.find((r) => r.id === recordId);
          if (!record) return state;

          let updatedCourses = state.courses;
          if (record.status === 'absent') {
            updatedCourses = state.courses.map((course) => {
              if (course.id !== record.courseId) return course;
              return {
                ...course,
                classes: course.classes.map((cls) => {
                  if (cls.id !== record.classId) return cls;
                  return { ...cls, absences: Math.max(0, cls.absences - 1) };
                })
              };
            });
          }

          return {
            courses: updatedCourses,
            attendanceRecords: state.attendanceRecords.filter((r) => r.id !== recordId)
          };
        });
      },

      dismissCatchUp: (promptId) => {
        set((state) => ({
          dismissedCatchUpIds: [...state.dismissedCatchUpIds, promptId]
        }));
      },

      resetToDemo: () => {
        set({
          courses: INITIAL_DEMO_COURSES,
          activeCourseId: INITIAL_DEMO_COURSES[0].id,
          attendanceRecords: [],
          dismissedCatchUpIds: []
        });
      },

      clearAllData: () => {
        set({
          courses: [],
          activeCourseId: null,
          attendanceRecords: [],
          dismissedCatchUpIds: []
        });
      },

      importData: (courses, records = []) => {
        if (!Array.isArray(courses)) return false;
        set({
          courses,
          activeCourseId: courses[0]?.id || null,
          attendanceRecords: records,
          dismissedCatchUpIds: []
        });
        return true;
      }
    }),
    {
      name: 'contador-faltas-storage',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
