# 📱 Contador de Faltas Interactivo (PWA)

Una aplicación web progresiva (**PWA**) rápida, intuitiva y *offline-first* para estudiantes, diseñada para llevar un control estricto de asistencias, límites de faltas por asignatura, horarios semanales y alertas visuales antes de reprobar una materia.

---

## 🚀 Tecnologías (Stack)

- **Frontend:** [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/) + [Vite](https://vite.dev/)
- **Estilos:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Estado Global & Persistencia:** [Zustand](https://zustand-demo.pmnd.rs/) con middleware `persist` (`localStorage`)
- **Iconos:** [Lucide React](https://lucide.dev/)
- **PWA & Offline:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/) con Service Worker y Web App Manifest
- **Efectos:** `canvas-confetti`

---

## 📁 Estructura del Proyecto

```plaintext
src/
├── components/          # Componentes visuales y modales
│   ├── BackupModal.tsx       # Exportar/importar datos y demo
│   ├── CatchUpModal.tsx      # Modal "Ponerse al día" (alerta frontend)
│   ├── ClassCard.tsx         # Tarjeta interactiva con botones +falta / -deshacer
│   ├── ClassDetailModal.tsx  # Historial completo, justificaciones y ajustes
│   ├── ClassModal.tsx        # Creación y edición de asignaturas y horarios
│   ├── CourseModal.tsx       # Crear/editar periodos o semestres
│   ├── CourseSelector.tsx    # Menú desplegable para cambiar de periodo
│   ├── DangerGauge.tsx       # Marcador visual de peligro (semáforo)
│   └── Navbar.tsx            # Barra superior con navegación y selector
├── store/               # Base de datos local en Zustand
│   ├── demoData.ts           # Datos de muestra iniciales (Cálculo II, etc.)
│   └── useAttendanceStore.ts # CRUD completo con localStorage
├── types/               # Interfaces y tipos de TypeScript
│   └── index.ts              # Course, ClassItem, Schedule, AttendanceRecord
├── utils/               # Funciones de lógica y cálculo
│   ├── schedule.ts           # Días, horas, clases en curso y detector catch-up
│   └── status.ts             # Algoritmo de cálculo de riesgo y porcentaje
├── views/               # Vistas principales de la aplicación
│   ├── DashboardView.tsx     # Resumen de asignaturas, KPIs y filtros
│   ├── TodayScheduleView.tsx # Horario de hoy con indicador "En curso ahora"
│   └── WeeklyScheduleView.tsx# Parrilla semanal completa por días
├── App.tsx              # Componente principal que orquesta estado y vistas
├── main.tsx             # Punto de entrada de React
└── index.css            # Estilos globales y Tailwind CSS v4
```

---

## ✨ Funcionalidades Principales

### 1. Núcleo (Core CRUD)
- **Gestión de Periodos / Semestres:** Crea múltiples semestres (ej. *"Semestre 2026-2"*, *"Ciclo 1"*), cámbialos al instante y asígnales colores temáticos.
- **Gestión de Asignaturas:** Cada materia cuenta con:
  - Nombre (ej. *Cálculo II*, *Estructuras de Datos*)
  - Límite de inasistencias permitidas (`maxAbsences`)
  - Contador interactivo de faltas actuales (`absences`)
  - Horarios múltiples por día (ej. Lunes 10:00-12:00, Miércoles 10:00-12:00)
  - Aula, nombre del profesor y notas de política de asistencia.
- **Contador Rápido:** Botón grande `+ Falta` y `- Deshacer` directo en cada tarjeta.

### 2. Marcador de Peligro (Semáforo de Asistencia)
Calcula en tiempo real el porcentaje consumido del límite y las faltas restantes:
- 🟢 **Bajo control (0% - 49%):** Todo en orden.
- 🟡 **Atención requerida (50% - 74%):** Has consumido más de la mitad de tus faltas.
- 🟠 **Zona de Peligro (75% - 99% o a 1 falta del límite):** Alerta crítica visible que avisa que no puedes faltar más.
- 🔴 **Límite Superado (100%+):** Reprobado por inasistencias con indicador del número de faltas excedidas.

### 3. Extra 2: Notificación Alternativa "Frontend-Only" (Catch-Up / Ponerse al día)
Dado que es una PWA sin backend ni servidores para tareas programadas (cron):
- Cuando el estudiante abre la aplicación, esta compara la hora actual con los horarios de sus asignaturas de hoy.
- Si detecta que una clase ya ocurrió hoy y no se ha registrado su asistencia:
  - Lanza un modal destacado: **"Tuviste [Álgebra] de 10:00 a 12:00. ¿Asististe hoy a clase?"**
  - Opciones rápidas:
    - `[✅ Sí, asistí a la clase]` *(registra asistencia y festeja)*
    - `[❌ No asistí (+1 falta)]` *(suma 1 inasistencia al contador)*
    - `[⚪ No hubo clase / Festivo]` *(marca como cancelada sin penalizar)*
    - `[⏩ Omitir por ahora]`

### 4. Vistas Integradas
1. **Asignaturas (Dashboard):** Tarjetas de materias, contadores, barras de riesgo y buscador inteligente por nombre, aula o docente.
2. **Hoy:** Línea de tiempo con las clases del día actual, indicador animado *"EN CURSO AHORA"* si estás en horario de clase y botón para confirmar asistencia al instante.
3. **Horario Semanal:** Cuadrícula completa de Lunes a Sábado/Domingo organizada por horas para planificar la semana.

### 5. Historial y Justificantes
- Cada falta o asistencia queda guardada con fecha y notas (ej. *"Cita médica"*, *"Tráfico"*).
- Posibilidad de añadir registros manuales con fechas pasadas o eliminar registros erróneos revirtiendo la falta.

### 6. Copias de Seguridad & Modo Offline
- **Exportar / Importar JSON:** Respalda todos tus cursos y restáuralos en cualquier navegador o dispositivo.
- **Datos de prueba (Demo):** Carga un semestre completo de ejemplo con un solo clic.
- **Instalable como PWA:** Agrega la app a la pantalla de inicio de tu teléfono móvil o escritorio para usarla a pantalla completa sin conexión a internet.

---

## 🛠️ Comandos para Desarrollo y Despliegue

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor local de desarrollo
npm run dev

# 3. Compilar para producción (genera PWA y Service Worker en /dist)
npm run build

# 4. Probar la versión de producción localmente
npm run preview

# 5. Ejecutar linter
npm run lint
```
