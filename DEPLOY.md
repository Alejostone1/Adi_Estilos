# 🚀 Guía de Despliegue - Adi Estilos

## 📋 Estado Actual

| Componente | Servicio | Estado | URL |
|------------|----------|--------|-----|
| **Frontend** | Vercel | Por configurar | Pendiente |
| **Backend** | Render | Por configurar | Pendiente |
| **Base de Datos** | Neon/Railway | PostgreSQL | Pendiente |
| **Imágenes** | Cloudinary | Híbrido | Pendiente |

---

## 🏗️ Arquitectura de Producción

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │     │    Backend     │     │   Database     │
│   (Vercel)     │────▶│   (Render)     │────▶│ (PostgreSQL)   │
│   CDN Global    │     │                │     │    Neon/Rail   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │   Cloudinary   │
                        │  (Imágenes)    │
                        └─────────────────┘
```

---

## ⚡ Requisitos Previos

Antes de desplegar, asegúrate de tener:

1. **Cuenta en GitHub** con el repositorio subido
2. **Cuenta en Vercel** (gratis)
3. **Cuenta en Render** (gratis)
4. **Cuenta en Neon** o **Railway** para PostgreSQL
5. **Cuenta en Cloudinary** (gratis) para imágenes

---

## 📦 Parte 1: Base de Datos (PostgreSQL)

### Opción A: Neon (RECOMENDADO)

1. Ve a [Neon](https://neon.tech)
2. Crea un proyecto nuevo
3. Copia la **DATABASE_URL**:

```
env
DATABASE_URL="postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/adi_estilos?sslmode=require"
```

### Opción B: Railway

1. Ve a [Railway](https://railway.com)
2. Crea un proyecto y agrega **PostgreSQL**
3. Copia la **DATABASE_URL**

---

## ☁️ Parte 2: Cloudinary (Imágenes)

### Configuración

1. Ve a [Cloudinary](https://cloudinary.com)
2. Crea una cuenta gratuita
3. En **Dashboard**, copia tus credenciales:

```
env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Estrategia Híbrida

El proyecto usa estrategia híbrida:
- **Cloudinary**: Almacenamiento principal (CDN global)
- **Local**: Fallback si Cloudinary falla

---

## 🚀 Parte 3: Backend (Render)

### Paso 1: Conectar Repositorio

1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu repositorio de GitHub

### Paso 2: Configuración del Servicio

| Campo | Valor |
|-------|-------|
| Name | `adi-estilos-backend` |
| Root Directory | `Backend` |
| Region | Oregon (o más cercano) |
| Runtime | `Node` |
| Build Command | `npm install && npx prisma generate` |
| Start Command | `npm start` |

### Paso 3: Variables de Entorno

Agrega estas variables en **"Environment"**:

```
env
# ============================================
# BASE DE DATOS
# ============================================
DATABASE_URL=postgresql://...@...neon.tech/adi_estilos?sslmode=require

# ============================================
# JWT
# ============================================
JWT_SECRET=genera-una-clave-segura-de-al-menos-32-caracteres
JWT_EXPIRES_IN=24h

# ============================================
# SERVIDOR
# ============================================
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://tu-proyecto.vercel.app

# ============================================
# CLOUDINARY
# ============================================
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Paso 4: Generar JWT_SECRET

```
bash
# En tu terminal local
openssl rand -base64 32
```

### Paso 5: Ejecutar Migraciones

1. Ve a **"Shell"** en Render
2. Ejecuta:

```
bash
npx prisma migrate deploy
npx prisma db seed
```

### Resultado

✅ **Backend URL**: `https://adi-estilos-backend.onrender.com`

---

## 🌐 Parte 4: Frontend (Vercel)

### Paso 1: Conectar Repositorio

1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New..."** → **"Project"**
3. Selecciona tu repositorio

### Paso 2: Configuración

| Campo | Valor |
|-------|-------|
| Root Directory | `Frontend` |
| Framework Preset | `Vite` |
| Build Command | `npm run build` |
| Output Directory | `dist` |

### Paso 3: Variables de Entorno

Agrega estas variables:

```
env
VITE_API_URL=https://adi-estilos-backend.onrender.com/api
VITE_APP_NAME=Adi Estilos
VITE_FILES_URL=https://adi-estilos-backend.onrender.com
```

### Paso 4: Desplegar

1. Click en **"Deploy"**
2. Espera 2-3 minutos

### Resultado

✅ **Frontend URL**: `https://tu-proyecto.vercel.app`

---

## 🔗 Parte 5: Conectar Frontend con Backend

### Actualizar Variables en Vercel

1. Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**
2. Asegúrate de que `VITE_API_URL` apunte a tu backend real:

```
VITE_API_URL=https://adi-estilos-backend.onrender.com/api
```

3. **Redeploy** el frontend si es necesario

---

## ✅ Checklist de Despliegue

- [ ] Crear cuenta en Neon/Railway
- [ ] Crear cuenta en Cloudinary
- [ ] Configurar DATABASE_URL
- [ ] Configurar JWT_SECRET
- [ ] Desplegar Backend en Render
- [ ] Ejecutar migraciones de Prisma
- [ ] Desplegar Frontend en Vercel
- [ ] Conectar frontend con backend
- [ ] Probar funcionamiento completo

---

## 🛠️ Solución de Problemas

### Error: "Prisma schema not found"

```
bash
# En Render Shell
cd Backend
npx prisma generate
```

### Error: "Cannot connect to database"

- Verifica que `DATABASE_URL` sea correcta
- Confirma que PostgreSQL esté activo
- Verifica que la URL tenga `?sslmode=require` para Neon

### Error: CORS en navegador

- El backend ya tiene CORS configurado
- Verifica que `CORS_ORIGIN` coincida con tu dominio de Vercel
- No incluyas `/` al final

### Error: Build falla en Vercel

- Verifica que `Root Directory` sea `Frontend`
- Asegúrate de tener `package.json` en esa carpeta

### Error: Imágenes no cargan

- Verifica credenciales de Cloudinary en `.env`
- Confirma que el bucket existe en Cloudinary

### Error: App se "duerme" en Render

- Es normal en el plan gratuito
- La primera request tardará ~30 segundos
- Considera actualizar a plan paid si necesitas always-on

---

## 📊 URLs Finales

Después del despliegue exitoso:

```
🌐 Frontend:    https://tu-proyecto.vercel.app
🔧 Backend:     https://adi-estilos-backend.onrender.com
📊 API:         https://adi-estilos-backend.onrender.com/api
🖼️ Imágenes:   https://adi-estilos-backend.onrender.com/uploads/
```

---

## 🔒 Buenas Prácticas de Seguridad

1. **JWT_SECRET**: Genera una clave única y guárdala en un gestor de contraseñas
2. **DATABASE_URL**: No la compartas públicamente
3. **CORS_ORIGIN**: Usa solo tu dominio de producción
4. **Cloudinary**: Configura restricciones de dominio en Cloudinary Dashboard
5. **HTTPS**: Automático en Vercel y Render

---

## 📈 Monitoreo en Producción

### Logs

- **Render**: Ve a tu servicio → **Logs**
- **Vercel**: Ve a tu proyecto → **Deployment** → **Function Logs**

### Health Check

El proyecto incluye endpoint de salud:

```
GET https://tu-backend.onrender.com/health
```

---

## 💰 Costo Total: $0 (GRATIS)

| Servicio | Plan | Costo |
|----------|------|-------|
| Vercel | Free | $0 |
| Render | Free | $0 |
| Neon | Free | $0 |
| Cloudinary | Free | $0 |

---

## 📝 Notas Importantes

1. **Render**: La app entra en "sleep" después de 15 min sin uso
2. **Neon**: 0.5GB almacenamiento gratuito
3. **Cloudinary**: 25GB bandwidth/mes gratuito
4. **Imágenes**: La estrategia híbrida garantiza redundancia

---

¡Despliegue completado! 🎉
