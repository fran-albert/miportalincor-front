# Implementación de Búsqueda Global

## Descripción

Se ha implementado una búsqueda global con Command Palette (similar a VSCode) que permite buscar pacientes y médicos desde el header de la aplicación. La implementación es flexible y permite cambiar entre dos APIs backend diferentes sin modificar el código.

## Arquitectura

### Componentes Frontend

```
src/
├── api/Search/
│   ├── search-service.interface.ts          # Interfaz de servicio
│   ├── incor-hc-search.service.ts          # Implementación para incor-historia-clinica.api
│   ├── healthcare-api-search.service.ts    # Implementación para Healthcare.Api (legacy)
│   └── search-service.factory.ts            # Factory pattern para seleccionar implementación
├── hooks/Search/
│   └── useGlobalSearch.ts                   # Hook con debounce y React Query
└── components/Search/
    └── GlobalSearchCommand.tsx              # Componente Command Palette
```

### Componentes Backend

#### incor-historia-clinica.api (NestJS)

```
src/modules/
├── doctor/
│   ├── application/dto/
│   │   ├── search-doctor.dto.ts            # DTO para query params
│   │   └── paginated-doctor-response.dto.ts # DTO para respuesta paginada
│   ├── application/repository/
│   │   └── doctor-repository.interface.ts  # Interfaz actualizada con búsqueda
│   ├── infrastructure/typeorm/
│   │   └── doctor.mysql.repository.ts      # Implementación con QueryBuilder
│   ├── application/service/
│   │   └── doctor-CRUD.service.ts          # Servicio con método searchDoctors
│   └── interface/
│       └── doctor.controller.ts            # Endpoint GET /doctor/search
└── patient/
    ├── application/dto/
    │   ├── search-patient.dto.ts           # DTO para query params
    │   └── paginated-patient-response.dto.ts # DTO para respuesta paginada
    ├── application/repository/
    │   └── patient-repository.interface.ts # Interfaz actualizada con búsqueda
    ├── infrastructure/typeorm/
    │   └── patient.mysql.repository.ts     # Implementación con QueryBuilder
    ├── application/service/
    │   └── patient-CRUD.service.ts         # Servicio con método searchPatients
    └── interface/
        └── patient.controller.ts           # Endpoint GET /patient/search
```

## Endpoints Backend

### incor-historia-clinica.api

#### Doctor Search
```
GET /api/doctor/search?search=Juan&page=1&limit=10
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "userId",
      "firstName": "Juan",
      "lastName": "Pérez",
      "userName": "12345678",
      "email": "juan@example.com",
      "matricula": "12345",
      "specialities": [
        {
          "specialityId": "id",
          "specialityName": "Cardiología"
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

#### Patient Search
```
GET /api/patient/search?search=Juan&page=1&limit=10
```

**Respuesta:**
```json
{
  "data": [
    {
      "id": "uuid",
      "userId": "userId",
      "firstName": "Juan",
      "lastName": "Pérez",
      "userName": "12345678",
      "email": "juan@example.com",
      "cuil": "20123456789",
      "healthPlans": [
        {
          "id": "id",
          "name": "OSDE"
        }
      ]
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 10,
  "totalPages": 1,
  "hasNextPage": false,
  "hasPreviousPage": false
}
```

## Feature Flags

### Variable de Entorno

```env
# Establece en 'true' para usar incor-historia-clinica.api
# Establece en 'false' (o deja vacío) para usar Healthcare.Api (legacy)
VITE_USE_INCOR_HC_API=false
```

### Cómo Cambiar Entre APIs

1. **Para usar incor-historia-clinica.api:**
   ```bash
   VITE_USE_INCOR_HC_API=true npm run dev
   ```

2. **Para usar Healthcare.Api (legacy):**
   ```bash
   VITE_USE_INCOR_HC_API=false npm run dev
   ```

3. **En archivo .env:**
   ```env
   VITE_USE_INCOR_HC_API=true
   ```

## Cómo Funciona

### 1. User Experience

1. El usuario hace click en el botón "Buscar pacientes, médicos..." en el header
2. Se abre un Command Palette (modal)
3. Empieza a escribir el término de búsqueda (nombre, apellido, DNI, email)
4. Los resultados aparecen en tiempo real (con debounce de 300ms)
5. Los resultados se dividen en dos categorías: "Médicos" y "Pacientes"
6. El usuario puede seleccionar un resultado con Enter o click
7. Se navega automáticamente al perfil del médico o paciente
8. Alternativamente, puede presionar Ctrl+K (Cmd+K en Mac) para abrir la búsqueda

### 2. Flow Técnico

```
Usuario escribe en input
    ↓
debounce 300ms (useGlobalSearch)
    ↓
React Query ejecuta query key ['global-search', debouncedSearch]
    ↓
searchService.searchAll(debouncedSearch, page, limit)
    ↓
Selecciona implementación según VITE_USE_INCOR_HC_API
    ├─ true → IncorHCSearchService
    └─ false → HealthcareApiSearchService
    ↓
Llama a /doctor/search y /patient/search en paralelo
    ↓
Combina resultados (doctores + pacientes)
    ↓
Renderiza resultados en Command Palette
    ↓
Usuario selecciona resultado
    ↓
Navega a /doctor/:userId o /paciente/:userId
```

## Criterios de Búsqueda

### Doctores
- firstName (nombre)
- lastName (apellido)
- userName (DNI)
- email
- matricula (matrícula médica)

### Pacientes
- firstName (nombre)
- lastName (apellido)
- userName (DNI)
- email
- cuil (CUIL)

## Características

- ✅ Búsqueda en tiempo real con debounce
- ✅ Command Palette moderna con UI similar a VSCode
- ✅ Soporte para Ctrl+K / Cmd+K
- ✅ Resaltado de términos de búsqueda
- ✅ Paginación (aunque mostrada de forma limitada en UI)
- ✅ Estados de carga
- ✅ Manejo de errores
- ✅ Caché de React Query (5 minutos)
- ✅ Capa de abstracción para cambiar entre APIs
- ✅ Feature flag para migración gradual
- ✅ Iconos para diferenciar médicos y pacientes
- ✅ Información adicional (especialidades, obras sociales, etc.)

## Testing

### Pruebas Manuales

#### 1. Con Healthcare.Api (legacy)

```bash
VITE_USE_INCOR_HC_API=false npm run dev
```

1. Abre `http://localhost:5173`
2. Haz login como médico/secretaria/admin
3. Presiona Ctrl+K (o Cmd+K)
4. Busca un paciente que existe en Healthcare.Api
5. Verifica que aparezca en los resultados
6. Click en el resultado
7. Verifica que navegue a `/paciente/:userId`

#### 2. Con incor-historia-clinica.api

```bash
VITE_USE_INCOR_HC_API=true npm run dev
```

1. Abre `http://localhost:5173`
2. Haz login como médico/secretaria/admin
3. Presiona Ctrl+K (o Cmd+K)
4. Busca un médico que existe en incor-historia-clinica.api
5. Verifica que aparezca en los resultados
6. Click en el resultado
7. Verifica que navegue a `/doctor/:userId`

#### 3. Pruebas de UI

- [ ] El input del header muestra ícono de búsqueda
- [ ] Al click abre el Command Palette
- [ ] Ctrl+K abre/cierra el Command Palette
- [ ] Los resultados se muestran categorizados
- [ ] Términos de búsqueda están resaltados
- [ ] Aparece loader mientras busca
- [ ] Navega correctamente al hacer click en resultado
- [ ] Se cierra el Command Palette después de seleccionar
- [ ] Funciona la búsqueda en mobile

#### 4. Pruebas de Búsqueda

- [ ] Búsqueda por nombre
- [ ] Búsqueda por apellido
- [ ] Búsqueda por DNI/userName
- [ ] Búsqueda por email
- [ ] Búsqueda con múltiples términos ("Juan Pérez")
- [ ] Búsqueda sin resultados muestra mensaje
- [ ] Búsqueda vacía muestra instrucciones

### Pruebas Automatizadas (Futuros)

```typescript
// useGlobalSearch.test.ts
describe('useGlobalSearch', () => {
  it('should debounce search term', async () => {
    // ...
  });

  it('should combine doctor and patient results', () => {
    // ...
  });

  it('should handle errors gracefully', () => {
    // ...
  });
});
```

## Notas de Migración

### Paso a Paso para Implementar incor-historia-clinica.api

1. **Backend (incor-historia-clinica.api)**
   - ✅ DTOs creados
   - ✅ Repositorio actualizado con `findAllWithPagination`
   - ✅ Servicio actualizado con `searchDoctors` y `searchPatients`
   - ✅ Controladores actualizados con endpoints `/doctor/search` y `/patient/search`

2. **Frontend (miportalincor-front)**
   - ✅ Interfaz de servicio creada
   - ✅ Implementación para Healthcare.Api creada
   - ✅ Implementación para incor-historia-clinica.api creada
   - ✅ Factory pattern implementado
   - ✅ Hook useGlobalSearch creado
   - ✅ Command Palette creado
   - ✅ Integrado en DashboardLayout
   - ✅ Variable de entorno agregada

3. **Para cambiar a la nueva API:**
   ```bash
   # En .env o .env.local
   VITE_USE_INCOR_HC_API=true
   ```

4. **Verificar en los logs:**
   ```
   Using IncorHCSearchService
   ```

## Debugging

### Logs Disponibles

```typescript
// En browser console, deberías ver:
console.log('Using IncorHCSearchService'); // o HealthcareApiSearchService
```

### Verificar Peticiones

1. Abre DevTools (F12)
2. Ir a Network tab
3. Buscar un término
4. Deberías ver peticiones a:
   - `/api/doctor/search?search=...`
   - `/api/patient/search?search=...`

## Rendimiento

- Debounce: 300ms
- Cache: 5 minutos
- GC Time: 10 minutos
- Límite de resultados por página: 10 (configurable)

## Problemas Conocidos

- En Healthcare.Api, la búsqueda de doctores se hace en cliente (no hay endpoint paginado)
- El resaltado de términos es simple (no soporta regex complexos)

## Mejoras Futuras

- [ ] Agregar búsqueda avanzada con filtros
- [ ] Agregar historial de búsquedas recientes
- [ ] Agregar atajos de teclado para Favoritos
- [ ] Integrar con Elasticsearch para búsqueda full-text
- [ ] Agregar estadísticas de búsqueda
- [ ] Implementar búsqueda por specialities/obras sociales
- [ ] Agregar modo dark para Command Palette
