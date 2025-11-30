# Configuración de Despliegue en Vercel

## Variables de Entorno por Proyecto

### Proyecto de Producción
**Nombre del proyecto:** `miportalincor-prod`

Variables de entorno necesarias:
```
VITE_NODE_ENV=production
VITE_BACKEND_API=https://api.incorcentromedico.com.ar/api/
VITE_BACKEND_API_INCOR_HC=https://hc.incorcentromedico.com.ar/
VITE_BACKEND_INCOR_LABORAL_API=https://incorlaboral.api.incorcentromedico.com.ar/api/v1/
VITE_BASE_URL=https://www.miportal.incorcentromedico.com.ar/
VITE_DEBUG_MODE=false
VITE_SHOW_DEV_TOOLS=false
```

### Proyecto de Staging
**Nombre del proyecto:** `miportalincor-staging`

Variables de entorno necesarias:
```
VITE_NODE_ENV=staging
VITE_BACKEND_API=https://staging-portal.incorcentromedico.com.ar/api/
VITE_BACKEND_API_INCOR_HC=https://staging-hc.incorcentromedico.com.ar/
VITE_BACKEND_INCOR_LABORAL_API=https://incorlaboral.api.incorcentromedico.com.ar/api/v1/
VITE_BASE_URL=https://staging.miportal.incorcentromedico.com.ar/
VITE_DEBUG_MODE=true
VITE_SHOW_DEV_TOOLS=true
```

## Comandos de Build por Entorno

### Para Producción:
```bash
npm run build
```

### Para Staging:
```bash
npm run build:staging
```

## Configuración de Git Branches

### Branch `main` → Producción
- Auto-deploy a producción
- Usar variables de entorno de producción

### Branch `develop` o `staging` → Staging
- Auto-deploy a staging
- Usar variables de entorno de staging

## Pasos para Configurar en Vercel:

1. **Crear Proyectos Separados:**
   - Un proyecto para producción (main branch)
   - Un proyecto para staging (develop/staging branch)

2. **Configurar Variables de Entorno:**
   - En cada proyecto de Vercel, ir a Settings > Environment Variables
   - Agregar todas las variables listadas arriba

3. **Configurar Build Command:**
   - Producción: `npm run build`
   - Staging: `npm run build:staging`

4. **Configurar Output Directory:**
   - `dist` para ambos entornos