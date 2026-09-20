import type { Course } from '../types';

export const INITIAL_DEMO_COURSES: Course[] = [
  {
    id: 'demo-course-1',
    name: 'Semestre Actual 2026',
    color: '#5645d4', // Notion primary purple
    createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
    classes: [
      {
        id: 'cls-1',
        name: 'Cálculo II',
        absences: 2,
        maxAbsences: 5,
        room: 'Aula 304 - Edificio B',
        professor: 'Dr. Roberto Mendoza',
        color: '#0075de', // link-blue
        notes: 'Pasan lista estricta a los 10 minutos.',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 25,
        schedule: [
          { id: 'sch-1-1', dayOfWeek: 1, startTime: '10:00', endTime: '12:00' }, // Lun
          { id: 'sch-1-2', dayOfWeek: 3, startTime: '10:00', endTime: '12:00' }, // Mié
        ]
      },
      {
        id: 'cls-2',
        name: 'Estructuras de Datos',
        absences: 3,
        maxAbsences: 4,
        room: 'Laboratorio de Computación 2',
        professor: 'Ing. Sandra López',
        color: '#dd5b00', // brand-orange
        notes: '¡Cuidado! A solo 1 falta de perder derecho a examen final.',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 20,
        schedule: [
          { id: 'sch-2-1', dayOfWeek: 2, startTime: '08:00', endTime: '10:00' }, // Mar
          { id: 'sch-2-2', dayOfWeek: 4, startTime: '08:00', endTime: '10:00' }, // Jue
        ]
      },
      {
        id: 'cls-3',
        name: 'Física y Ondas',
        absences: 1,
        maxAbsences: 6,
        room: 'Aula 102 - Ciencias',
        professor: 'Prof. Carlos Santana',
        color: '#1aae39', // brand-green
        notes: 'Permite entregar justificante médico hasta 3 días hábiles.',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 15,
        schedule: [
          { id: 'sch-3-1', dayOfWeek: 1, startTime: '14:00', endTime: '16:00' }, // Lun
          { id: 'sch-3-2', dayOfWeek: 5, startTime: '10:00', endTime: '12:00' }, // Vie
        ]
      },
      {
        id: 'cls-4',
        name: 'Bases de Datos Relacionales',
        absences: 0,
        maxAbsences: 4,
        room: 'Lab Sistemas 1',
        professor: 'Dra. María Varela',
        color: '#7b3ff2', // brand-purple
        notes: 'Asistencia perfecta hasta ahora.',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
        schedule: [
          { id: 'sch-4-1', dayOfWeek: 3, startTime: '14:00', endTime: '16:00' }, // Mié
          { id: 'sch-4-2', dayOfWeek: 5, startTime: '14:00', endTime: '16:00' }, // Vie
        ]
      },
      {
        id: 'cls-5',
        name: 'Ingeniería de Requisitos',
        absences: 5,
        maxAbsences: 5,
        room: 'Salón 201',
        professor: 'Msc. Fernando Ruiz',
        color: '#e03131', // semantic-error
        notes: 'Límite máximo alcanzado. Hablar con coordinación si hay justificación.',
        createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
        schedule: [
          { id: 'sch-5-1', dayOfWeek: 4, startTime: '16:00', endTime: '18:00' }, // Jue
        ]
      }
    ]
  }
];
