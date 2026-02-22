# Configuración de Variables de Entorno - ADI Estilos

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
| `DATABASE_URL` | ✅ | Conexión PostgreSQL | `postgresql://user:pass@localhost:5432/adiweb` | (Render provides) |
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
