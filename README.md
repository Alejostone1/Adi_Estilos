# 🛍️ Adi Estilos — E-Commerce Full Stack

<div align="center">

![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-5.x-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white)

**Sistema de comercio electrónico moderno con panel de administración completo**

*Desarrollado por Alejandro Piedrahita · [@Alejostone](https://github.com/Alejostone1)*

</div>

---

## 📋 Tabla de Contenidos

- [Descripción](#-descripción)
- [Arquitectura](#️-arquitectura-del-sistema)
- [Módulos del Sistema](#-módulos-del-sistema)
- [Stack Tecnológico](#️-stack-tecnológico)
- [Requisitos Previos](#-requisitos-previos)
- [Instalación Local](#-instalación-local)
- [Variables de Entorno](#️-variables-de-entorno)
- [Scripts Disponibles](#-scripts-disponibles)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Despliegue en Producción](#-despliegue-en-producción)
- [Seguridad](#-seguridad)
- [Estado del Proyecto](#-estado-del-proyecto)
- [Roadmap](#️-roadmap)
- [Solución de Problemas](#-solución-de-problemas)

---

## 📖 Descripción

**Adi Estilos** es un sistema de comercio electrónico completo, moderno y escalable, diseñado específicamente para tiendas de ropa y accesorios. Combina una tienda pública orientada al cliente con un robusto panel de administración para gestionar cada aspecto del negocio en tiempo real.

El proyecto está preparado para despliegue en servicios cloud **100% gratuitos** (Vercel + Render + Neon + Cloudinary).

---

## 🏗️ Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────┐
│                   ARQUITECTURA DE PRODUCCIÓN                  │
└──────────────────────────────────────────────────────────────┘

     ┌──────────┐     ┌──────────────────┐     ┌─────────────┐
     │ USUARIO  │────▶│    FRONTEND      │     │  PostgreSQL │
     └──────────┘     │  Vercel (CDN)    │     │    Neon     │
                      └────────┬─────────┘     └──────┬──────┘
                               │                      │
                               │  REST API            │
                               ▼                      │
                      ┌──────────────────┐            │
                      │    BACKEND       │◀───────────┘
                      │  Render (Node)   │
                      └────────┬─────────┘
                               │
                               ▼
                      ┌──────────────────┐
                      │   Cloudinary     │
                      │   (Imágenes)     │
                      └──────────────────┘
```

| Capa | Servicio | Plan | Costo |
|------|----------|------|-------|
| **Frontend** | Vercel | Free | $0 |
| **Backend** | Render | Free | $0 |
| **Base de Datos** | Neon / Railway | Free (500MB) | $0 |
| **Imágenes** | Cloudinary | Free (25GB/mes) | $0 |

---

## 🧩 Módulos del Sistema

### 🛒 Tienda Pública (Cliente)

| Módulo | Descripción |
|--------|-------------|
| **Catálogo** | Listado con filtros avanzados por categoría, color y talla. Búsqueda en tiempo real. |
| **Carrito** | Carrito interactivo con gestión completa de variantes (color, talla, cantidad). |
| **Autenticación** | Registro e inicio de sesión con JWT. Rutas protegidas para usuarios registrados. |
| **Pedidos** | Proceso de compra completo con seguimiento de estado e historial de órdenes. |
| **Mi Cuenta** | Perfil de usuario, historial de pedidos y estado de créditos. |

### ⚙️ Panel de Administración

| Módulo | Funcionalidades |
|--------|----------------|
| **📦 Productos** | CRUD completo, variantes múltiples (color + talla), precios dinámicos, imágenes con Cloudinary. |
| **📊 Inventario** | Control de stock en tiempo real, movimientos de entrada/salida, ajustes manuales, alertas. |
| **🏪 Ventas (POS)** | Punto de venta integrado, historial detallado, gestión de estados de pedido. |
| **💰 Créditos** | Sistema de cuentas por cobrar, registro de abonos automáticos, alertas de mora. |
| **🚚 Compras** | Órdenes a proveedores, recepción de mercancía, trazabilidad de costos. |
| **📈 Reportes** | Dashboard analytics en tiempo real, gráficas de ventas e inventario. |
| **👥 Usuarios** | Gestión multi-usuario con roles y permisos diferenciados. |

---

## 🛠️ Stack Tecnológico

### Backend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | 18+ | Runtime JavaScript del servidor |
| **Express.js** | 4.18 | Framework REST API — routing y middleware |
| **Prisma ORM** | 5.x | ORM moderno para PostgreSQL con migraciones |
| **PostgreSQL** | 15+ | Base de datos relacional principal |
| **JWT + bcrypt** | — | Autenticación segura y cifrado de contraseñas |
| **Multer** | — | Manejo de subida de archivos e imágenes |
| **Cloudinary SDK** | — | Almacenamiento híbrido de imágenes en la nube |
| **Helmet** | — | Headers de seguridad HTTP |
| **express-validator** | — | Validación estricta de datos de entrada |
| **cors / express-rate-limit** | — | Control de acceso y protección DoS |

### Frontend

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **React** | 18.x | Biblioteca principal de interfaz de usuario |
| **Vite** | 5.0 | Build tool ultrarrápido — dev y producción |
| **Tailwind CSS** | 3.4 | Framework de estilos utilitarios |
| **Ant Design** | — | Componentes UI profesionales y accesibles |
| **React Router DOM** | — | Enrutamiento del lado del cliente (SPA) |
| **Axios** | — | Cliente HTTP para consumo de la API REST |
| **Framer Motion** | — | Animaciones fluidas y transiciones |
| **React Context API** | — | Estado global — carrito, autenticación, usuario |

---

## ✅ Requisitos Previos

Antes de instalar, asegúrate de tener:

| Herramienta | Versión | Verificación |
|-------------|---------|--------------|
| **Node.js** | 18+ | `node --version` |
| **npm** | 9+ | `npm --version` |
| **Git** | cualquiera | `git --version` |
| **PostgreSQL** | 14+ | `psql --version` *(o usar Neon/Railway)* |

---

## 💻 Instalación Local

### 1. Clonar el repositorio

```bash
git clone https://github.com/Alejostone1/Adi_Estilos.git
cd Adi_Estilos
```

### 2. Instalar dependencias del Backend

```bash
cd Backend
npm install
npx prisma generate
```

### 3. Instalar dependencias del Frontend

```bash
cd ../Frontend
npm install
```

### 4. Configurar variables de entorno

```bash
# Backend
cp Backend/.env.example Backend/.env
# Editar Backend/.env con tus valores locales

# Frontend
cp Frontend/.env.example Frontend/.env
```

### 5. Crear la base de datos y ejecutar migraciones

```bash
cd Backend
npx prisma migrate dev
npx prisma db seed   # Carga datos de prueba
```

### 6. Iniciar en modo desarrollo

```bash
# Terminal 1 — Backend
cd Backend && npm run dev
# Disponible en: http://localhost:3000

# Terminal 2 — Frontend
cd Frontend && npm run dev
# Disponible en: http://localhost:5173
```

### Credenciales de prueba (seed)

| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | `admin@adi.com` | `admin123` |
| Cliente | `cliente@adi.com` | `cliente123` |

---

## ⚙️ Variables de Entorno

### Backend — `Backend/.env`

```env
# ── Servidor ─────────────────────────────────────────
NODE_ENV=development
PORT=3000

# ── Base de Datos ─────────────────────────────────────
DATABASE_URL=postgresql://postgres:tu_password@localhost:5432/adiestilos?schema=public

# ── Seguridad ─────────────────────────────────────────
JWT_SECRET=tu-clave-secreta-minimo-32-caracteres
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=30d
CORS_ORIGIN=http://localhost:5173

# ── Almacenamiento ────────────────────────────────────
STORAGE_MODE=hybrid          # local | cloudinary | hybrid
USE_CLOUDINARY=false         # true en producción
CLOUDINARY_CLOUD_NAME=dm5qezkoc
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret

# ── Límites ───────────────────────────────────────────
MAX_IMAGE_SIZE=5242880       # 5MB en bytes
UPLOAD_PATH=uploads
BASE_URL=http://localhost:3000

# ── Rate Limiting ─────────────────────────────────────
RATE_LIMIT_WINDOW_MS=900000  # 15 minutos
RATE_LIMIT_MAX_REQUESTS=100

# ── Logs ──────────────────────────────────────────────
LOG_LEVEL=debug
```

### Frontend — `Frontend/.env`

```env
VITE_API_URL=http://localhost:3000/api
VITE_FILES_URL=http://localhost:3000
VITE_APP_NAME=Adi Estilos
```

> 💡 **Generar un JWT_SECRET seguro:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

---

## 📜 Scripts Disponibles

### Backend

```bash
npm run dev              # Servidor con nodemon (recarga automática)
npm start                # Servidor para producción (Render)

npx prisma studio        # GUI visual para explorar la base de datos
npx prisma migrate dev   # Aplicar migraciones y regenerar cliente
npx prisma migrate deploy # Ejecutar migraciones en producción
npx prisma db seed       # Cargar datos iniciales / de prueba
npx prisma generate      # Regenerar el Prisma Client
```

### Frontend

```bash
npm run dev              # Servidor Vite con HMR
npm run build            # Generar build optimizado en /dist
npm run preview          # Preview del build de producción en local
```

---

## 📁 Estructura del Proyecto

```
Adi_Estilos/
├── Backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Modelo de datos
│   │   ├── migrations/             # Historial de migraciones
│   │   └── seed.js                 # Datos iniciales
│   ├── src/
│   │   ├── config/                 # Cloudinary, DB, env
│   │   ├── middleware/             # Auth, upload, rate-limit
│   │   ├── modules/
│   │   │   ├── productos/          # Controlador + servicio + rutas
│   │   │   ├── ventas/
│   │   │   ├── inventario/
│   │   │   ├── usuarios/
│   │   │   ├── creditos/
│   │   │   ├── compras/
│   │   │   └── public/             # Endpoints públicos (catálogo)
│   │   └── server.js               # Entry point
│   ├── scripts/                    # Utilidades y correcciones BD
│   ├── uploads/                    # Almacenamiento local (fallback)
│   ├── Dockerfile
│   ├── Procfile
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── api/                    # Clientes Axios por módulo
│   │   ├── components/             # Componentes reutilizables
│   │   ├── context/                # CartContext, AuthContext
│   │   ├── pages/
│   │   │   ├── public/             # Home, Catálogo, Producto
│   │   │   └── admin/              # Todos los módulos admin
│   │   ├── routes/                 # Rutas protegidas
│   │   └── main.jsx                # Entry point
│   ├── public/
│   ├── vercel.json
│   └── package.json
│
├── DEPLOY.md
├── CONFIG.md
├── AUDITORIA.md
└── README.md
```

---

## 🚀 Despliegue en Producción

El despliegue se realiza en servicios gratuitos. Sigue las fases en orden.

### Fase 1 — Base de Datos (Neon)

1. Crear cuenta en [neon.tech](https://neon.tech)
2. Crear un proyecto nuevo y copiar la `DATABASE_URL`
3. La URL tendrá el formato:
   ```
   postgresql://user:password@ep-xxx.us-east-1.aws.neon.tech/adi_estilos?sslmode=require
   ```

### Fase 2 — Cloudinary (Imágenes)

1. Crear cuenta gratuita en [cloudinary.com](https://cloudinary.com)
2. En el Dashboard copiar: **Cloud Name**, **API Key** y **API Secret**
3. El Cloud Name ya está configurado en el proyecto: `dm5qezkoc`

### Fase 3 — Backend (Render)

1. En [dashboard.render.com](https://dashboard.render.com) → **New +** → **Web Service**
2. Conectar repositorio GitHub y configurar:

   | Campo | Valor |
   |-------|-------|
   | Root Directory | `Backend` |
   | Build Command | `npm install && npx prisma generate` |
   | Start Command | `npm start` |
   | Instance Type | Free |

3. En la pestaña **Environment**, agregar todas las variables de producción:

   ```env
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://...neon.tech/adi_estilos?sslmode=require
   JWT_SECRET=genera-clave-segura-aqui
   JWT_EXPIRES_IN=24h
   CORS_ORIGIN=https://tu-proyecto.vercel.app
   STORAGE_MODE=hybrid
   USE_CLOUDINARY=true
   CLOUDINARY_CLOUD_NAME=dm5qezkoc
   CLOUDINARY_API_KEY=tu_api_key
   CLOUDINARY_API_SECRET=tu_api_secret
   MAX_IMAGE_SIZE=5242880
   UPLOAD_PATH=/tmp/uploads
   BASE_URL=https://adiestilos-backend.onrender.com
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   LOG_LEVEL=error
   ```

4. Una vez desplegado, ejecutar desde **Render Shell**:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Fase 4 — Frontend (Vercel)

1. En [vercel.com](https://vercel.com) → **Add New** → **Project** → importar repositorio
2. Configurar:

   | Campo | Valor |
   |-------|-------|
   | Root Directory | `Frontend` |
   | Framework Preset | Vite |
   | Build Command | `npm run build` |
   | Output Directory | `dist` |

3. Agregar variables de entorno:
   ```env
   VITE_API_URL=https://adiestilos-backend.onrender.com/api
   VITE_FILES_URL=https://adiestilos-backend.onrender.com
   VITE_APP_NAME=Adi Estilos
   ```

4. Click en **Deploy** — listo en ~2 minutos.

### ✅ Checklist de Despliegue

- [ ] Repositorio subido a GitHub
- [ ] Cuenta creada en Neon / Railway
- [ ] `DATABASE_URL` copiada y guardada
- [ ] Cuenta creada en Cloudinary con credenciales
- [ ] `JWT_SECRET` generado (32+ caracteres)
- [ ] Backend desplegado en Render
- [ ] Variables de entorno configuradas en Render
- [ ] `npx prisma migrate deploy` ejecutado
- [ ] `npx prisma db seed` ejecutado
- [ ] Frontend desplegado en Vercel
- [ ] `VITE_API_URL` apuntando al backend de Render
- [ ] `CORS_ORIGIN` en backend apuntando al frontend de Vercel
- [ ] Login de administrador verificado
- [ ] Subida de imágenes probada en el panel admin
- [ ] Flujo de compra probado end-to-end

### URLs Finales

```
🌐 Frontend:   https://adiestilos.vercel.app
⚙️  Backend:    https://adiestilos-backend.onrender.com
📡 API:         https://adiestilos-backend.onrender.com/api
🖼️  Imágenes:  Cloudinary CDN (automático)
```

---

## 🔒 Seguridad

| Medida | Descripción |
|--------|-------------|
| **JWT Authentication** | Tokens firmados con secret de 32+ caracteres. Expiración configurable. |
| **bcrypt** | Contraseñas nunca en texto plano. Factor de costo ajustable. |
| **Helmet** | Headers HTTP de seguridad: XSS, clickjacking, sniffing. |
| **CORS** | Solo acepta requests desde dominios explícitamente permitidos. |
| **Rate Limiting** | Máximo 100 requests por IP cada 15 minutos. Protección DoS. |
| **express-validator** | Validación estricta de todos los inputs del lado del servidor. |
| **Prisma ORM** | Protección automática contra SQL Injection. |
| **React** | Sanitiza automáticamente el contenido renderizado (XSS). |

---

## 📊 Estado del Proyecto

| Componente | Estado | Notas |
|------------|--------|-------|
| Backend API | ✅ Listo | Requiere configuración de variables de entorno |
| Frontend React | ✅ Listo | Build exitoso, requiere `VITE_API_URL` en Vercel |
| Base de Datos | ⚠️ Parcial | Migraciones y seed deben ejecutarse en producción |
| Imágenes (Cloudinary) | ⚠️ Requiere config | Ya codificado, falta configurar credenciales API |
| Seguridad | ✅ Completo | JWT, CORS, Rate Limit, Helmet y validaciones activos |
| Despliegue Cloud | ⚠️ Pendiente | Infraestructura lista, falta configurar servicios |

> **Veredicto:** El proyecto está muy bien estructurado con código de calidad profesional. Una vez configuradas las variables de entorno y Cloudinary, el despliegue será directo y exitoso.

---

## 🗺️ Roadmap

| Prioridad | Feature | Descripción |
|-----------|---------|-------------|
| 🔴 Alta | Despliegue en Producción | Completar configuración de servicios cloud |
| 🔴 Alta | Migración a Cloudinary | Configurar credenciales y migrar imágenes existentes |
| 🟡 Media | Refresh Tokens JWT | Mejorar UX con renovación automática de sesión |
| 🟡 Media | Code Splitting | Reducir chunk de UI (~1MB) con lazy loading |
| 🟡 Media | Logging Centralizado | Agregar Winston para monitoreo en producción |
| 🟢 Baja | Stripe / MercadoPago | Integración de pasarela de pagos |
| 🟢 Baja | Notificaciones Push | Alertas de pedidos y stock en tiempo real |
| 🟢 Baja | App Móvil React Native | Versión nativa basada en la misma API REST |
| 🟢 Baja | WebSockets | Dashboard en tiempo real con actualizaciones live |
| 🟢 Baja | Multitienda | Soporte para múltiples tiendas e inventarios |

---

## 🚨 Solución de Problemas

| Error | Solución |
|-------|----------|
| `Database connection failed` | Verificar `DATABASE_URL` en Render. Para Neon, confirmar que `?sslmode=require` esté al final. |
| `CORS policy` en el browser | Verificar que `CORS_ORIGIN` coincida exactamente con el dominio de Vercel, sin `/` al final. |
| `Prisma schema not found` | En Render Shell: `cd Backend && npx prisma generate` |
| Imágenes no cargan (404) | Verificar credenciales Cloudinary y que `USE_CLOUDINARY=true` en variables de Render. |
| App tarda en responder | Normal en plan gratuito de Render: se "duerme" tras 15 min de inactividad. Primera petición ~30s. |
| `JWT_SECRET is required` | Agregar `JWT_SECRET` en variables de entorno de Render y hacer redeploy. |
| Build falla en Vercel | Verificar que `Root Directory = Frontend` y que `package.json` esté en esa carpeta. |

---

## 📄 Licencia

Distribuido bajo la **Licencia ISC**.

---

<div align="center">

**Adi Estilos v1.0.0** · Desarrollado con ❤️ por **Alejandro Piedrahita** · [@Alejostone](https://github.com/Alejostone1)

⭐ Dale una estrella al proyecto si te fue útil

</div>
