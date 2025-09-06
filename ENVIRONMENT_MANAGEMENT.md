# Gestión de Entornos - Mi Portal Incor

## Resumen

Este proyecto maneja múltiples entornos de forma automatizada y tipada, permitiendo configuraciones específicas para desarrollo local, staging/QA y producción.

## Entornos Disponibles

### 🔧 Development (Local)
- **Archivo:** `.env.development`
- **APIs:** Localhost (puertos locales)
- **Comando:** `npm run dev`
- **URL:** http://localhost:5173
- **Debug:** Habilitado

### 🧪 Staging/QA
- **Archivo:** `.env.staging`
- **APIs:** Staging servers
- **Comando:** `npm run dev:staging` (local) o `npm run build:staging` (build)
- **URL:** https://staging.miportal.incorcentromedico.com.ar
- **Debug:** Habilitado

### 🚀 Production
- **Archivo:** `.env.production`
- **APIs:** Production servers
- **Comando:** `npm run build`
- **URL:** https://www.miportal.incorcentromedico.com.ar
- **Debug:** Deshabilitado

## Estructura de Archivos

```
├── .env.development     # Variables para desarrollo local
├── .env.staging         # Variables para staging/QA
├── .env.production      # Variables para producción
├── .env.example         # Ejemplo y plantilla
├── .env.local           # Overrides locales (gitignored)
└── src/
    └── config/
        └── environment.ts   # Configuración centralizada y tipada
```

## Variables de Entorno

### Variables Requeridas
```bash
VITE_NODE_ENV=development|staging|production
VITE_BACKEND_API=URL_DEL_API_PRINCIPAL
VITE_BACKEND_API_INCOR_HC=URL_DEL_API_HISTORIA_CLINICA
VITE_BACKEND_INCOR_LABORAL_API=URL_DEL_API_LABORAL
VITE_BASE_URL=URL_BASE_DEL_FRONTEND
VITE_DEBUG_MODE=true|false
VITE_SHOW_DEV_TOOLS=true|false
```

## Comandos Disponibles

### Desarrollo Local
```bash
npm run dev                  # Inicia desarrollo con .env.development
npm run dev:staging          # Inicia desarrollo con .env.staging
```

### Build
```bash
npm run build               # Build para producción
npm run build:staging       # Build para staging
npm run build:development   # Build para desarrollo
```

### Utilidades
```bash
npm run preview             # Preview del build de producción
npm run preview:staging     # Preview del build de staging
npm run type-check          # Verificar tipos TypeScript
npm run clean               # Limpiar directorio dist
npm run lint                # Verificar código con ESLint
```

## Uso de la Configuración en el Código

### Importar configuración
```typescript
import { environment, isDevelopment, isProduction, currentConfig } from '@/config/environment';

// Usar URLs de API
const response = await fetch(environment.API_BASE_URL + '/endpoint');

// Verificar entorno
if (isDevelopment()) {
  console.log('Modo desarrollo');
}

// Usar configuración específica del entorno
const timeout = currentConfig.apiTimeout;
```

### Ejemplo de uso condicional
```typescript
import { environment, isDevelopment } from '@/config/environment';

// Mostrar información de debug solo en desarrollo
if (isDevelopment() && environment.DEBUG_MODE) {
  console.log('Debug info:', data);
}

// Configurar herramientas específicas del entorno
if (environment.SHOW_DEV_TOOLS) {
  // Mostrar Redux DevTools, React Query Devtools, etc.
}
```

## Configuración de Axios

El archivo `src/services/axiosConfig.ts` ya está configurado para usar las variables de entorno automáticamente:

```typescript
import { environment, currentConfig } from '@/config/environment';

const apiIncor = axios.create({
  baseURL: environment.API_BASE_URL,
  timeout: currentConfig.apiTimeout,
  headers: {
    "Content-Type": "application/json",
  },
});
```

## Despliegue

### Vercel
Ver `vercel-deployment-config.md` para instrucciones detalladas de configuración en Vercel.

### Otros proveedores
1. Configurar variables de entorno en la plataforma
2. Usar el comando de build apropiado:
   - Producción: `npm run build`
   - Staging: `npm run build:staging`

## Configuraciones por Entorno

### Development
- Source maps habilitados
- Hot reload
- DevTools habilitados
- Logging detallado
- Timeout de API: 30 segundos

### Staging
- Source maps habilitados
- DevTools habilitados
- Logging moderado
- Timeout de API: 15 segundos

### Production
- Source maps deshabilitados
- DevTools deshabilitados
- Logging mínimo (solo errores)
- Código minificado
- Chunking optimizado
- Timeout de API: 10 segundos

## Troubleshooting

### Variables de entorno no cargan
1. Verificar que el archivo `.env.{mode}` existe
2. Verificar que las variables empiecen con `VITE_`
3. Reiniciar el servidor de desarrollo

### Error de configuración
1. Verificar que todas las variables requeridas estén definidas
2. Revisar la consola para mensajes de error del archivo `environment.ts`
3. Verificar que los tipos coincidan con lo esperado

### Build falla
1. Ejecutar `npm run type-check` para verificar tipos
2. Ejecutar `npm run lint` para verificar código
3. Verificar que las variables de entorno del modo target estén definidas

## Mejores Prácticas

1. **Nunca hardcodear URLs o configuraciones** - usar siempre `environment.*`
2. **Usar verificaciones de entorno** - `isDevelopment()`, `isProduction()`, etc.
3. **Validar variables críticas** - el archivo `environment.ts` valida automáticamente
4. **Mantener archivos .env sincronizados** con las necesidades del proyecto
5. **Documentar nuevas variables** en este archivo cuando se agreguen