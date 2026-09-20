import LZString from 'lz-string';
import type { Course, ClassItem } from '../types';

/**
 * Comprime el curso para compartirlo a través de la URL o código QR.
 * Limpia las inasistencias acumuladas para que el destinatario comience en 0.
 */
export const encodeCourseToURL = (course: Course): string => {
  const cleanCourse: Course = {
    ...course,
    classes: (course.classes || []).map((cls) => ({
      ...cls,
      absences: 0,
    })),
  };

  const jsonString = JSON.stringify(cleanCourse);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);

  if (typeof window === 'undefined') {
    return `?share=${compressed}`;
  }

  return `${window.location.origin}${window.location.pathname}?share=${compressed}`;
};

/**
 * Comprime una única asignatura para compartirla a través de la URL o código QR.
 * Limpia las inasistencias acumuladas para que el destinatario comience en 0.
 */
export const encodeClassToURL = (classItem: ClassItem): string => {
  const cleanClass: Omit<ClassItem, 'id' | 'createdAt'> = {
    name: classItem.name,
    maxAbsences: classItem.maxAbsences,
    absences: 0,
    schedule: classItem.schedule || [],
    room: classItem.room,
    professor: classItem.professor,
    color: classItem.color,
    notes: classItem.notes
  };

  const jsonString = JSON.stringify(cleanClass);
  const compressed = LZString.compressToEncodedURIComponent(jsonString);

  if (typeof window === 'undefined') {
    return `?shareClass=${compressed}`;
  }

  return `${window.location.origin}${window.location.pathname}?shareClass=${compressed}`;
};

/**
 * Descomprime y valida el string recibido en la URL al escanear o abrir el enlace de un curso.
 * Genera IDs únicos nuevos para el curso y sus clases para evitar cualquier colisión.
 */
export const decodeCourseFromURL = (hash: string): Course | null => {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(hash);
    if (!decompressed) return null;

    const course: Course = JSON.parse(decompressed);

    if (!course.name || !Array.isArray(course.classes)) {
      return null;
    }

    const uniqueCourseId = `course-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    return {
      ...course,
      id: uniqueCourseId,
      classes: course.classes.map((cls, idx) => ({
        ...cls,
        id: `cls-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        absences: 0,
        createdAt: Date.now()
      }))
    };
  } catch (error) {
    console.error('Error decodificando el curso compartido:', error);
    return null;
  }
};

/**
 * Descomprime y valida una asignatura compartida recibida en ?shareClass=...
 */
export const decodeClassFromURL = (hash: string): Omit<ClassItem, 'id' | 'createdAt'> | null => {
  try {
    const decompressed = LZString.decompressFromEncodedURIComponent(hash);
    if (!decompressed) return null;

    const classData = JSON.parse(decompressed);

    if (
      !classData.name ||
      typeof classData.maxAbsences !== 'number' ||
      !Array.isArray(classData.schedule)
    ) {
      return null;
    }

    return {
      name: classData.name,
      maxAbsences: classData.maxAbsences,
      absences: 0,
      schedule: classData.schedule,
      room: classData.room,
      professor: classData.professor,
      color: classData.color,
      notes: classData.notes
    };
  } catch (error) {
    console.error('Error decodificando la asignatura compartida:', error);
    return null;
  }
};
