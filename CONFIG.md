# Configuración de Variables de Entorno - ADI Estilos

## Arquitectura del Proyecto

```
Frontend (Vercel)
       ↓
Backend (Render/Railway/VPS)
       ↓
PostgreSQL (Neon.tech) ←✨ Tu base de datos
       ↓
Imágenes (Cloudinary) ←✨ Tus imágenes ya están aquí
```

## Estructura de Archivos

```
Backend/
├── .env              → Desarrollo local (NO subir a Git)
├── .env.example      → Plantilla segura para referencia
├── .env.production   → Reference for production values
└── .gitignore        → Asegura que .env no se suba

Frontend/
├── .env              → Desarrollo local (NO subir a Git)
├── .env.example      → Plantilla segura para referencia
└── .env.production   → Reference for production values
```

## Tabla de Variables - Backend

| Variable | Requerida | Descripción | Ejemplo Desarrollo | Ejemplo Producción |
|----------|-----------|-------------|-------------------|-------------------|
| `NODE_ENV` | ✅ | Entorno de ejecución | `development` | `production` |
| `PORT` | ✅ | Puerto del servidor | `3000` | `3000` |
| `DATABASE_URL` | ✅ | Conexión PostgreSQL (Neon) | `postgresql://user:pass@localhost:5432/adiweb` | (Neon proporciona) |
| `JWT_SECRET` | ✅ | Clave para tokens JWT | `dev-secret-32chars-minimum` | (Generate secure) |
| `JWT_EXPIRES_IN` | ⏲️ | Expiración access token | `24h` | `24h` |
| `JWT_REFRESH_EXPIRES_IN` | ⏲️ | Expiración refresh token | `30d` | `30d` |
| `CORS_ORIGIN` | ✅ | Dominio frontend | `http://localhost:5173` | `https://tu-dominio.vercel.app` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Cloud name (hardcodeado) | `dm5qezkoc` | `dm5qezkoc` |
| `CLOUDINARY_API_KEY` | ⚠️ | API Key Cloudinary | (Tu valor) | (Render Secrets) |
| `CLOUDINARY_API_SECRET` | ⚠️ | API Secret Cloudinary | (Tu valor) | (Render Secrets) |
| `STORAGE_MODE` | ✅ | Modo de almacenamiento | `hybrid` | `hybrid` |
| `USE_CLOUDINARY` | ⏲️ | Usar Cloudinary | `true` | `true` |
| `BASE_URL` | ⏲️ | URL base del backend | `http://localhost:3000` | (Render URL) |

Leyenda:
- ✅ = Requerido
- ⚠️ = Sensible (usar secrets en producción)
- ⏲️ = Opcional con valor por defecto

## Tabla de Variables - Frontend

| Variable | Requerida | Descripción | Ejemplo Desarrollo | Ejemplo Producción |
|----------|-----------|-------------|-------------------|-------------------|
| `VITE_API_URL` | ✅ | URL del API backend | `http://localhost:3000/api` | `https://tu-backend.onrender.com/api` |
| `VITE_FILES_URL` | ✅ | URL de archivos | `http://localhost:3000` | `https://tu-backend.onrender.com` |

## Configuración con Neon.tech (Tu Base de Datos)

### Ya tienes Neon configurado:
https://console.neon.tech/app/projects/soft-heart-33887211

### Para obtener la URL de conexión:

1. Ve al Dashboard de Neon
2. Click en **Connection Details**
3. Copia la URL de "Prisma" o "Direct connection"

Formato típico:
```
postgresql://usuario:password@host.neon.tech/neondb?sslmode=require
```

### Luego agrega la URL en:
- **Render**: Environment Variables → DATABASE_URL
- **Railway**: Variables → DATABASE_URL

---

## Configuración con Cloudinary (Tus Imágenes)

### Tus imágenes ya funcionan en Cloudinary:
- **Cloud Name**: `dm5qezkoc` (ya configurado en el código)

### Para obtener credenciales completas:

1. Ve a https://cloudinary.com/users/sign_in
2. Settings (⚙️) → API Keys
3. Copia **API Key** y **API Secret**

### Agrega en tu servicio:
```
CLOUDINARY_CLOUD_NAME=dm5qezkoc
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

---

## Desplegar Backend en Render

### Paso 1: Crear cuenta en Render

1. Ve a https://render.com
2. Crea una cuenta (puedes usar GitHub)
3. Click en **New** > **Web Service**

### Paso 2: Conectar tu repositorio

1. Autoriza Render a acceder a tu repositorio GitHub
2. Selecciona el repositorio `Adi_Estilos`
3. Branch: `main`

### Paso 3: Configurar el servicio

Configure así:

| Campo | Valor |
|-------|-------|
| Name | `adi-estilos-backend` |
| Root Directory | `Backend` |
| Build Command | `npm install` |
| Start Command | `node src/server.js` |

### Paso 4: Variables de Entorno

En la sección **Environment**, agrega:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://... (de Neon)
JWT_SECRET=<genera-una-clave-segura>
CORS_ORIGIN=https://tu-dominio.vercel.app
CLOUDINARY_CLOUD_NAME=dm5qezkoc
CLOUDINARY_API_KEY=<tu-api-key>
CLOUDINARY_API_SECRET=<tu-api-secret>
STORAGE_MODE=hybrid
USE_CLOUDINARY=true
```

### Paso 5: Desplegar

1. Click en **Create Web Service**
2. Espera a que termine el build (puede tomar 5-10 minutos)
3. Cuando termine, verás una URL como: `https://adi-estilos-backend.onrender.com`

---

## Configuración para Render

### Variables de Entorno en Render Dashboard

1. Ve a tu servicio en Render Dashboard
2. Click en **Environment**
3. Agrega las siguientes variables:

```
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://... (desde Render PostgreSQL)
JWT_SECRET=<genera-una-clave-segura>
CORS_ORIGIN=https://tu-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=dm5qezkoc
CLOUDINARY_API_KEY=<tu-api-key>
CLOUDINARY_API_SECRET=<tu-api-secret>
STORAGE_MODE=hybrid
USE_CLOUDINARY=true
```

### Generar JWT_SECRET seguro

```
bash
# En Linux/Mac
openssl rand -base64 32

# En Windows (PowerShell)
[System.Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

## Configuración para Vercel (Frontend)

1. Ve a tu proyecto en Vercel Dashboard
2. Click en **Settings** > **Environment Variables**
3. Agrega:

```
VITE_API_URL=https://tu-backend.onrender.com/api
VITE_FILES_URL=https://tu-backend.onrender.com
```

## Modo Híbrido de Almacenamiento

El proyecto usa almacenamiento híbrido:
- **Cloudinary** (principal): Imágenes se guardan en la nube
- **Local** (respaldo): Copia local en caso de falla

### Flujo en modo hybrid:
1. Imagen se sube a Cloudinary
2. Si succeede, se guarda URL de Cloudinary
3. Si falla, se guarda localmente como respaldo
4. Al mostrar, prioriza Cloudinary, usa local si no está disponible

## Checklist de Seguridad

- [ ] `.env` NO está en Git (verificar .gitignore)
- [ ] `JWT_SECRET` es diferente en producción
- [ ] Credenciales de Cloudinary en Render Secrets
- [ ] `CORS_ORIGIN` especifica dominio exacto (no `*`)
- [ ] `NODE_ENV=production` en Render
- [ ] No hay valores hardcodeados de producción

## Problemas Comunes y Soluciones

### Error: CORS blocked
→ Verificar que `CORS_ORIGIN` coincide exactamente con el dominio de Vercel

### Error: Database connection failed
→ Verificar que `DATABASE_URL` es correcto (Render proporciona la URL completa)

### Error: Images not loading
→ Verificar `STORAGE_MODE=hybrid` y credenciales de Cloudinary

### Error: JWT invalid
→ Regenerar `JWT_SECRET` en producción (no usar el de desarrollo)
