# 📘 ADI ESTILOS - DOCUMENTACIÓN DE CONFIGURACIÓN

## 1. ESTRUCTURA DE ARCHIVOS

| Archivo | Entorno | Propósito |
|---------|---------|-----------|
| `.env` | Desarrollo | Credenciales locales |
| `.env.production` | Producción (Render) | Configuración producción |
| `.env.example` | Template | Plantilla segura sin secretos |

---

## 2. VARIABLES DEL BACKEND

### 2.1 Servidor

| Variable | Tipo | Requerido | Default | Descripción |
|----------|------|-----------|---------|-------------|
| `NODE_ENV` | string | ✅ | development | Entorno: development/production |
| `PORT` | number | ✅ | 3000 | Puerto del servidor |

### 2.2 Base de Datos

| Variable | Tipo | Requerido | Descripción |
|----------|------|-----------|-------------|
| `DATABASE_URL` | string | ✅ | Connection string PostgreSQL |

**Formato desarrollo:**
```
postgresql://postgres:tu_contraseña@localhost:5432/adiestilos?schema=public
```

**Formato producción (Render):**
```
postgresql://user:password@host.render.internal:5432/database?schema=public
```

### 2.3 Seguridad

| Variable | Tipo | Requerido | Default | Descripción |
|----------|------|-----------|---------|-------------|
| `CORS_ORIGIN` | string | ✅ | * | Dominios permitidos (separados por coma) |
| `JWT_SECRET` | string | ✅ | - | Clave JWT (mínimo 32 caracteres) |
| `JWT_EXPIRES_IN` | string | ✅ | 24h | Expiración access token |
| `JWT_REFRESH_EXPIRES_IN` | string | ✅ | 30d | Expiración refresh token |

### 2.4 Almacenamiento Híbrido

| Variable | Tipo | Requerido | Default | Descripción |
|----------|------|-----------|---------|-------------|
| `STORAGE_MODE` | string | ✅ | hybrid | Modo: local/cloudinary/hybrid |
| `CLOUDINARY_CLOUD_NAME` | string | ✅ | - | Cloud name de Cloudinary |
| `CLOUDINARY_API_KEY` | string | ⚠️ | - | API Key (requerido en producción) |
| `CLOUDINARY_API_SECRET` | string | ⚠️ | - | API Secret (requerido en producción) |
| `USE_CLOUDINARY` | boolean | ✅ | false | Forzar Cloudinary |

**Cloudinary valores:**
- Cloud Name: `dm5qezkoc` (configurado)

### 2.5 Límites y Rutas

| Variable | Tipo | Requerido | Default | Descripción |
|----------|------|-----------|---------|-------------|
| `MAX_IMAGE_SIZE` | number | ✅ | 5242880 | Tamaño máximo en bytes (5MB) |
| `UPLOAD_PATH` | string | ✅ | uploads | Directorio de uploads |
| `BASE_URL` | string | ✅ | - | URL base del servidor |

### 2.6 Rate Limiting

| Variable | Tipo | Requerido | Default | Descripción |
|----------|------|-----------|---------|-------------|
| `RATE_LIMIT_WINDOW_MS` | number | ✅ | 900000 | Ventana de tiempo (ms) |
| `RATE_LIMIT_MAX_REQUESTS` | number | ✅ | 100 | Máximo de requests |

### 2.7 Logging

| Variable | Tipo | Requerido | Default | Descripción |
|----------|------|-----------|---------|-------------|
| `LOG_LEVEL` | string | ✅ | debug | Nivel: error/warn/info/debug |

---

## 3. VARIABLES DEL FRONTEND

**Todas las variables deben tener prefijo `VITE_`**

| Variable | Tipo | Requerido | Desarrollo | Producción |
|----------|------|-----------|------------|------------|
| `VITE_API_URL` | string | ✅ | http://localhost:3000/api | https://adiestilos-backend.onrender.com/api |
| `VITE_FILES_URL` | string | ✅ | http://localhost:3000 | https://adiestilos-backend.onrender.com |
| `VITE_NODE_ENV` | string | ✅ | development | production |

---

## 4. CONFIGURACIÓN POR ENTORNO

### 4.1 Desarrollo Local

- PostgreSQL: `localhost:5432`
- Almacenamiento: `hybrid` (local + Cloudinary)
- CORS: `http://localhost:5173`
- USE_CLOUDINARY: `false`

### 4.2 Producción (Render)

- PostgreSQL: Render PostgreSQL
- Almacenamiento: `hybrid`
- CORS: Dominio Vercel específico
- USE_CLOUDINARY: `true`

---

## 5. CHECKLIST DE SEGURIDAD

- [x] `.env` NO está en repositorio
- [x] `.env.production` NO está en repositorio
- [x] `.env.example` está en repositorio (sin valores reales)
- [x] JWT_SECRET tiene mínimo 32 caracteres en producción
- [x] CORS tiene dominios específicos (no wildcards)
- [x] Credenciales de base de datos no hardcodeadas

---

## 6. GENERAR JWT SEGURO

```bash
# Linux/Mac
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

---

## 7. PRÓXIMOS PASOS DESPUÉS DE CONFIGURAR

1. **Verificar conexión:**

```
bash
   cd Backend && npm run dev

```

2. **Ejecutar migraciones:**

```
bash
   cd Backend && npx prisma migrate dev

```

3. **Seed de datos:**

```
bash
   cd Backend && npx prisma db seed

```

---

## 8. CONFIGURACIÓN DE CLOUDINARY

### Desarrollo:
- Cloud Name: `dm5qezkoc`
- API Key y Secret: Opcionales (usa modo local si no hay)

### Producción:
1. Crear cuenta en cloudinary.com
2. Obtener credenciales del dashboard
3. Configurar en variables de entorno de Render

---

## 9. DOCKERFILE CONFIGURATION

El Dockerfile ya está configurado para:
- Usar variables de entorno desde el sistema
- No hardcodear credenciales
- Soportar múltiples entornos
