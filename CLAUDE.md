# miportalincor-front

Frontend del portal médico INCOR. Interfaz para pacientes, médicos, secretarias y administradores.

## Stack Técnico
- **Framework**: React 18 + TypeScript
- **Build**: Vite 5
- **Estilos**: Tailwind CSS + shadcn/ui
- **Estado**: Redux Toolkit + React Query (TanStack)
- **Forms**: React Hook Form + Zod
- **HTTP**: Axios
- **Routing**: React Router 6
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint 9

## Reglas de Desarrollo

### TypeScript
- **SIEMPRE definir interfaces/types** para props, estados, respuestas de API
- **NUNCA usar `any`** - usar `unknown` o tipos específicos
- **NUNCA usar `@ts-ignore`** - resolver el error correctamente
- Tipar todos los parámetros y retornos de funciones

```typescript
// MAL
const PatientCard = ({ patient }: any) => { ... }

// BIEN
interface PatientCardProps {
  patient: Patient;
  onSelect?: (id: number) => void;
}

const PatientCard = ({ patient, onSelect }: PatientCardProps) => { ... }
```

### Componentes React
```typescript
// Siempre tipar props con interface
interface ButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

export const Button = ({ label, onClick, variant = 'primary', disabled }: ButtonProps) => {
  return (
    <button
      className={cn('btn', variant === 'primary' ? 'btn-primary' : 'btn-secondary')}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
```

### Estructura de Carpetas
```
src/
├── api/              # Servicios de API (axios)
├── assets/           # Imágenes, iconos
├── common/           # Constantes, enums, helpers
├── components/       # Componentes reutilizables
├── config/           # Configuración (env, etc)
├── contexts/         # React contexts
├── hooks/            # Custom hooks
├── layouts/          # Layouts de página
├── lib/              # Utilidades (shadcn utils)
├── pages/            # Páginas de la app
├── routes/           # Configuración de rutas
├── services/         # Lógica de negocio
├── store/            # Redux slices
├── styles/           # CSS global
├── types/            # TypeScript types/interfaces
├── utils/            # Funciones utilitarias
└── validators/       # Esquemas Zod
```

### Convenciones de Archivos
| Tipo | Ubicación | Nomenclatura |
|------|-----------|--------------|
| Componente | `components/[name]/` | `PatientCard.tsx` |
| Página | `pages/[area]/` | `PatientList.tsx` |
| Hook | `hooks/` | `usePatient.ts` |
| Type | `types/` | `patient.types.ts` |
| Validator | `validators/` | `patient.validator.ts` |
| API service | `api/` | `patient.api.ts` |
| Redux slice | `store/` | `patientSlice.ts` |

### Path Alias
```typescript
import { Button } from '@/components/ui/Button';
import { Patient } from '@/types/patient.types';
import { usePatient } from '@/hooks/usePatient';
```

Único alias: `@/*` → `./src/*`

### Forms con React Hook Form + Zod
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const patientSchema = z.object({
  firstName: z.string().min(1, 'Nombre requerido'),
  lastName: z.string().min(1, 'Apellido requerido'),
  dni: z.string().regex(/^\d{7,8}$/, 'DNI inválido'),
  email: z.string().email('Email inválido').optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

const PatientForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = (data: PatientFormData) => {
    // ...
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('firstName')} />
      {errors.firstName && <span>{errors.firstName.message}</span>}
      {/* ... */}
    </form>
  );
};
```

### API Calls con React Query
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { patientApi } from '@/api/patient.api';

// Query
const { data, isLoading, error } = useQuery({
  queryKey: ['patients', filters],
  queryFn: () => patientApi.getAll(filters),
});

// Mutation
const mutation = useMutation({
  mutationFn: patientApi.create,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['patients'] });
  },
});
```

## Comandos

### Desarrollo
```bash
npm run dev              # Vite dev server
npm run dev:staging      # Con env de staging
```

### Build
```bash
npm run build            # Build producción (tsc + vite)
npm run build:staging    # Build staging
npm run build:development # Build development
npm run preview          # Preview del build
```

### Tests
```bash
npm run test             # Vitest watch mode
npm run test:run         # Ejecutar una vez
npm run test:coverage    # Con coverage
```

### Linting
```bash
npm run lint             # ESLint
npm run type-check       # TypeScript check (sin emitir)
```

## Verificaciones Antes de Commit
```bash
npm run type-check       # Verificar tipos
npm run build            # Verificar build
npm run lint             # Verificar linting
npm run test:run         # Ejecutar tests
```

## Rutas Principales

### Autenticación
- `/login` - Login
- `/forgot-password` - Recuperar contraseña
- `/reset-password` - Resetear contraseña

### Dashboard
- `/dashboard` - Panel principal

### Pacientes
- `/patients` - Lista de pacientes
- `/patients/:id` - Detalle paciente
- `/patients/:id/history` - Historia clínica
- `/patients/:id/evolutions` - Evoluciones
- `/patients/:id/studies` - Estudios

### Turnos
- `/turnos` - Calendario de turnos (BigCalendar)
- `/turnos/disponibilidad` - Configurar disponibilidad horaria
- `/turnos/ausencias` - Gestionar ausencias de medicos
- `/turnos/feriados` - Configurar feriados
- `/queue` - Cola de espera

### Estudios
- `/studies` - Lista de estudios
- `/studies/:id` - Detalle estudio

### Laboral
- `/laboral/companies` - Empresas
- `/laboral/collaborators` - Colaboradores
- `/laboral/evaluations` - Evaluaciones

### Admin
- `/admin/users` - Usuarios
- `/admin/roles` - Roles
- `/admin/audit` - Logs auditoría
- `/admin/statistics` - Estadísticas

## Componentes UI (shadcn/ui)
Componentes en `src/components/ui/`:
- Button, Input, Select, Checkbox
- Dialog, AlertDialog, Popover
- Table, Tabs, Accordion
- Toast (sonner), Tooltip
- Form components
- Collapsible (usado en BigCalendar para leyendas)

## Componentes de Turnos (Appointments)

### BigCalendar (`components/Appointments/Calendar/`)
Calendario principal de turnos basado en `react-big-calendar`. Archivos:
- `BigCalendar.tsx` - Componente principal
- `BigCalendar.css` - Estilos custom del componente
- `big-calendar.css` - Estilos base de react-big-calendar

Funcionalidades:
- **Vistas**: Mes, Semana Laboral (work_week, 5 dias), Dia, Agenda
- **Vista default**: Dia para doctores (`autoFilterForDoctor`), Mes para secretarias
- **Altura dinamica**: `calc(100vh - 260px)` en day/work_week, `850px` en mes
- **Leyendas colapsables**: Colapsadas por default para doctores, expandidas para secretarias
- **Eventos multi-linea**: En vista dia y work_week muestra nombre + DNI + obra social
- **Ausencias en calendario**: Muestra ausencias del medico como eventos (naranja), dias completos con fondo `#fff7ed`
- **Bloqueo de slots**: Dialog para crear turno, bloquear horario, o bloquear dia completo
- **Validacion WAITING**: Boton "Marcar en Espera" deshabilitado si la fecha del turno no es hoy

### Dialogs (`components/Appointments/Dialogs/`)
| Componente | Descripcion |
|-----------|-------------|
| `SlotActionDialog.tsx` | Menu de acciones al clickear slot disponible: crear turno, bloquear horario, bloquear dia completo |
| `CreateAbsenceDialog.tsx` | Dialog para crear ausencia de dia completo con selector de tipo (Vacaciones, Licencia, Otro) |
| `CreateAppointmentDialog.tsx` | Dialog para crear turno nuevo |
| `AppointmentDetailDialog.tsx` | Detalle de un turno existente |

### Hooks usados en Turnos
| Hook | Uso |
|------|-----|
| `useDoctorAbsences(doctorId, startDate, endDate)` | Obtener ausencias de un medico en rango de fechas |
| `useDoctorAbsenceMutations()` | Crear/eliminar ausencias (`createAbsence`, `deleteAbsence`) |
| `useAppointments()` | CRUD de turnos |
| `useDoctorAvailabilities()` | Disponibilidad horaria del medico |
| `useBlockedSlots()` | Slots bloqueados |

### Tipos clave (Appointments)
- `CalendarEvent` - Evento del calendario (turno, sobreturno, disponible, bloqueado, ausencia)
- `AppointmentFullResponseDto` - Turno con paciente y medico
- `DoctorAbsenceResponseDto` - Ausencia con `startDate`, `endDate`, `startTime?`, `endTime?`, `type`
- `Absence` enum / `AbsenceLabels` - Tipos de ausencia en `src/types/Doctor-Absence/`

## Autenticación y Sesiones

### Almacenamiento de tokens
- **Con "Recordarme"**: Token en `localStorage` (persiste entre sesiones de navegador)
- **Sin "Recordarme"**: Token en `sessionStorage` (se pierde al cerrar la tab)
- Utilidad: `src/utils/authStorage.ts`

### Refresh automático de tokens
1. **Proactivo** (`useRoles.ts`): Timer que refresca el token 5 minutos antes de expirar
2. **Reactivo** (`axiosConfig.ts`): Interceptor que detecta 401 y hace refresh automático
3. **Cola de requests**: Si varios requests fallan con 401 mientras se refresca, se encolan y reintentan con el nuevo token

### Sincronización cross-tab (multi-pestaña)
Las secretarias suelen tener muchas pestañas abiertas. Para evitar que un refresh en una tab invalide las demás:

1. **`authStorage.onTokenChange(callback)`**: Escucha el evento `storage` de localStorage que se dispara automáticamente en todas las otras pestañas cuando una tab escribe un nuevo token
2. **En `axiosConfig.ts`**: Al cargar el módulo, se registra un listener que detecta cambios de token desde otra tab y actualiza Redux
3. **Dedup de refresh**: Antes de hacer `POST /auth/refresh`, el interceptor compara el token del request fallido con el token actual en storage. Si son distintos, otra tab ya refrescó → usa el nuevo token directamente sin hacer otro refresh

### Flujo con múltiples pestañas
```
Tab 1: JWT expira → 401 → refresh → nuevo token → escribe en localStorage
Tab 2: Recibe evento 'storage' → actualiza Redux con nuevo token → sigue operando
Tab 3: Si tenía un request en vuelo que falló con 401 → detecta token nuevo en storage → lo usa directamente sin refresh propio
```

### Archivos clave de auth
- `src/utils/authStorage.ts` - Storage abstraction + cross-tab sync (`onTokenChange`)
- `src/services/axiosConfig.ts` - Interceptores, refresh automático, sync cross-tab
- `src/store/authSlice.ts` - Redux state de auth
- `src/hooks/useRoles.ts` - Hook de roles + timer de refresh proactivo
- `src/routes/Private-Routes.tsx` - Guard de rutas protegidas

## APIs Consumidas
| API | Base URL | Uso |
|-----|----------|-----|
| historia-clinica | `VITE_API_URL` | Pacientes, médicos, estudios |
| appointments | `VITE_APPOINTMENTS_API_URL` | Turnos, cola |
| laboral | `VITE_LABORAL_API_URL` | Medicina laboral |

## Archivos Clave
- `src/main.tsx` - Entry point
- `src/routes.tsx` - Definición de rutas
- `src/config/` - Configuración
- `vite.config.ts` - Config de Vite
- `tailwind.config.js` - Config de Tailwind

## Repos Relacionados
| Repo | Función |
|------|---------|
| **incor-historia-clinica.api** | API principal |
| **appointments.api.miportal-incor** | API turnos |
| **miportal-incor-laboral** | API laboral |
