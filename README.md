# 🚀 Adi Estilos - E-commerce Full Stack

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=Tailwind-CSS)
![Cloudinary](https://img.shields.io/badge/Cloudinary-Cloud-blue?style=for-the-badge)

**E-commerce moderno con panel de administración completo**

*Desarrollado por Alejandro Piedrahita (@Alejostone)*

</div>

---

## 📋 Descripción del Sistema

**Adi Estilos** es un sistema de comercio electrónico completo desarrollado con arquitectura moderna full stack, diseñado para tiendas de ropa y accesorios.

### 🏪 Tienda Pública (Cliente)

| Módulo | Descripción |
|--------|-------------|
| Catálogo | Productos con filtros avanzados por categoría, color y talla |
| Carrito | Carrito interactivo con gestión de variantes |
| Autenticación | Registro e inicio de sesión JWT |
| Pedidos | Proceso completo de compra y seguimiento |

### ⚙️ Panel de Administración

| Módulo | Funcionalidades |
|--------|----------------|
| **Productos** | CRUD completo, variantes múltiples, precios dinámicos |
| **Inventario** | Control stock, movimientos, entradas/salidas, ajustes manuales |
| **Ventas** | Punto de venta POS, historial detallado, estados de pedido |
| **Créditos** | Sistema cuentas por cobrar, abonos automáticos, alertas de mora |
| **Compras** | Órdenes a proveedores, recepción de mercancía |
| **Reportes** | Dashboard, analytics, estadísticas en tiempo real |

---

## 🛠️ Tecnologías Utilizadas

### Backend Stack

| Tecnología | Propósito |
|------------|-----------|
| Node.js 18+ | Runtime de JavaScript |
| Express.js 4.x | Framework web REST API |
| Prisma 5.x | ORM para base de datos |
| PostgreSQL | Base de datos relacional |
| JWT + bcrypt | Autenticación y seguridad |
| Multer | Manejo de uploads |
| Helmet + CORS | Headers de seguridad |

### Frontend Stack

| Tecnología | Propósito |
|------------|-----------|
| React 18.x | Biblioteca de interfaz de usuario |
| Vite | Build tool y dev server |
| Tailwind CSS | Framework de estilos |
| Ant Design | Componentes UI profesionales |
| Framer Motion | Animaciones |
| React Router DOM | Enrutamiento |
| Axios | Cliente HTTP |
| Lucide React | Iconos |
| Recharts | Gráficos y analytics |

---

## ☁️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARQUITECTURA DEL SISTEMA                    │
└─────────────────────────────────────────────────────────────────┘

     ┌──────────┐    ┌──────────┐    ┌──────────────────┐
     │  USUARIO │───▶│ FRONTEND │───▶│     BACKEND       │
     └──────────┘    │ (Vercel) │    │    (Render)      │
                     └────┬─────┘    └────────┬─────────┘
                          │                  │
                          ▼                  ▼
                   ┌──────────────────┐  ┌────────────┐
                   │   CDN Global     │  │ PostgreSQL │
                   │  (Cloudinary)   │  │ (Railway) │
                   └──────────────────┘  └────────────┘
```

### Servicios en Producción

| Componente | Servicio | Plan | Estado |
|------------|----------|------|--------|
| Frontend | Vercel | Free | ✅ Listo |
| Backend | Render | Free | ✅ Listo |
| Base de Datos | Neon / Railway | 500MB | ✅ Listo |
| Imágenes | Cloudinary | 25GB/mes | ✅ Listo |

---

## 📁 Estructura del Proyecto

```
adi-estilos/
├── 📂 Backend/
│   ├── 📂 prisma/
│   │   ├── migrations/       # Migraciones de BD
│   │   ├── seeds/             # Datos iniciales
│   │   └── schema.prisma      # Schema ORM
│   ├── 📂 src/
│   │   ├── config/            # Configuraciones
│   │   ├── middleware/        # Middlewares Express
│   │   ├── modules/          # Módulos de negocio
│   │   └── utils/             # Utilidades
│   ├── 📂 uploads/           # Archivos locales
│   ├── package.json
│   ├── Procfile
│   └── Dockerfile
│
├── 📂 Frontend/
│   ├── 📂 src/
│   │   ├── api/              # Servicios API
│   │   ├── components/       # Componentes
│   │   ├── pages/            # Páginas
│   │   ├── context/          # Context API
│   │   ├── routes/           # Rutas
│   │   └── utils/            # Utilidades
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json
│
├── README.md
└── DEPLOY.md
```

---

## 🔧 Requisitos Previos

| Requisito | Versión | Comando |
|-----------|---------|---------|
| Node.js | 18.x+ | `node --version` |
| npm | 9.x+ | `npm --version` |
| PostgreSQL | 15+ | `psql --version` |
| Git | 2.x+ | `git --version` |

### Instalación de Node.js

```
bash
# macOS (con Homebrew)
brew install node

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verificar versiones
node -v && npm -v
```

---

## 💻 Instalación Local

### 1. Clonar el Repositorio

```
bash
git clone https://github.com/tu-usuario/adi-estilos.git
cd adi-estilos
```

### 2. Instalar Dependencias

#### Backend

```
bash
cd Backend
npm install
npx prisma generate
```

#### Frontend

```
bash
cd Frontend
npm install
```

---

## ⚙️ Configuración de Variables de Entorno

### Backend (`Backend/.env`)

```
env
# ============================================
# CONFIGURACIÓN DE BASE DE DATOS
# ============================================
DATABASE_URL="postgresql://user:password@localhost:5432/adi_estilos?schema=public"

# ============================================
# CONFIGURACIÓN DEL SERVIDOR
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# CONFIGURACIÓN JWT
# ============================================
JWT_SECRET=tu-secret-key-muy-segura-de-al-menos-32-caracteres
JWT_EXPIRES_IN=24h

# ============================================
# CONFIGURACIÓN CORS
# ============================================
CORS_ORIGIN=http://localhost:5173

# ============================================
# CONFIGURACIÓN CLOUDINARY (Opcional)
# ============================================
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=tu_api_key
CLOUDINARY_API_SECRET=tu_api_secret
```

### Frontend (`Frontend/.env`)

```
env
# ============================================
# CONFIGURACIÓN API
# ============================================
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Adi Estilos
VITE_FILES_URL=http://localhost:3000
```

---

## 🏃 Ejecutar en Desarrollo

### Iniciar Backend

```
bash
cd Backend
npm run dev
```

El backend estará disponible en: `http://localhost:3000`

### Iniciar Frontend

```
bash
cd Frontend
npm run dev
```

La aplicación estará disponible en: `http://localhost:5173`

---

## 🔐 Credenciales de Prueba (Seed)

El proyecto incluye datos de prueba por defecto:

| Rol | Email | Contraseña |
|-----|--------|-------------|
| Administrador | admin@adi.com | admin123 |
| Cliente | cliente@adi.com | cliente123 |

---

## 📦 Scripts Disponibles

### Backend

```
bash
npm run dev              # Desarrollo (nodemon)
npm run start           # Producción (PM2)
npm run prisma:studio   # Prisma Studio
npm run db:reset       # Resetear base de datos
```

### Frontend

```
bash
npm run dev             # Servidor desarrollo
npm run build          # Build producción
npm run preview        # Preview build
```

---

## 🚀 Despliegue en Producción

### Frontend → Vercel

1. Conectar repositorio en [Vercel](https://vercel.com)
2. Configurar **Root Directory**: `Frontend`
3. **Framework Preset**: `Vite`
4. **Build Command**: `npm run build`
5. **Output Directory**: `dist`
6. Agregar variables de entorno:
   - `VITE_API_URL`
   - `VITE_APP_NAME`
   - `VITE_FILES_URL`

### Backend → Render

1. Conectar repositorio en [Render](https://render.com)
2. Configurar **Root Directory**: `Backend`
3. **Build Command**: `npm install && npx prisma generate`
4. **Start Command**: `npm start`
5. Agregar variables de entorno:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT=3000`
   - `NODE_ENV=production`

---

## 📊 Módulos del Sistema

### E-commerce

- ✅ Catálogo de productos con variantes (color + talla)
- ✅ Carrito de compras interactivo
- ✅ Sistema de autenticación JWT
- ✅ Proceso de compra y pedidos
- ✅ Múltiples métodos de pago

### Administración

- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión de productos y variantes
- ✅ Control de inventario y movimientos
- ✅ Sistema de ventas POS
- ✅ Gestión de créditos y cobranza
- ✅ Módulo de compras a proveedores
- ✅ Descuentos y promociones
- ✅ Devoluciones y garantías
- ✅ Reportes y analytics

---

## 🛡️ Seguridad Implementada

| Medida | Descripción |
|--------|-------------|
| JWT | Autenticación basada en tokens |
| bcrypt | Encriptación de contraseñas |
| Helmet | Headers de seguridad HTTP |
| CORS | Control de orígenes cruzados |
| Rate Limiting | Protección contra ataques |
| Validación | express-validator en todos los endpoints |

---

## 📈 Estado Actual del Proyecto

| Componente | Estado | Notas |
|------------|--------|--------|
| Backend API | ✅ Estable | Listo para producción |
| Frontend | ✅ Estable | Build exitoso |
| Base de Datos | ✅ Migrado | PostgreSQL |
| Imágenes | ✅ Híbrido | Cloudinary + Local |

---

## 🗺️ Roadmap

- [ ] Implementar pagos con Stripe/MercadoPago
- [ ] Sistema de notificaciones push
- [ ] App móvil (React Native)
- [ ] Dashboard en tiempo real con WebSockets
- [ ] Multi-tienda / Multi-inventario

---

## 📄 Licencia

ISC License - © 2024 Adi Estilos

---

## 👤 Autor

**Desarrollado por:** Alejandro Piedrahita (@Alejostone)

<div align="center">

⭐️ **¡Dale una estrella al proyecto si te fue útil!** ⭐️

</div>
