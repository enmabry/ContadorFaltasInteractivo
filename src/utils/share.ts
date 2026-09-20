import LZString from 'lz-string';
import type { Course } from '../types';

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
 * Descomprime y valida el string recibido en la URL al escanear o abrir el enlace.
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
