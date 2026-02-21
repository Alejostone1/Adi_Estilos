# 🚀 Adi Estilos - E-commerce Full Stack

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel)
![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render)

**E-commerce moderno con panel de administración completo**

</div>

---

## 📋 Descripción del Sistema

**Adi Estilos** es un sistema de comercio electrónico completo desarrollado con arquitectura moderna de dos capas:

### 🏪 Tienda Pública (Cliente)
- Catálogo de productos con filtros avanzados
- Carrito de compras interactivo
- Sistema de autenticación de usuarios
- Proceso de compra y pedidos
- Historial de pedidos

### ⚙️ Panel de Administración
- Gestión de productos (CRUD completo)
- Control de inventario y variantes
- Módulo de ventas y compras
- Sistema de clientes con crédito
- Reportes y estadísticas
- Gestión de categorías, colores, talles

### 🔌 API REST Backend
- Endpoints protegidos con JWT
- Upload de imágenes con Multer
- Base de datos MySQL con Prisma ORM
- Validación de datos completa
- Rate limiting y seguridad

---

## ☁️ Arquitectura Cloud

```
┌─────────────────────────────────────────────────────────────────────┐
│                         ARQUITECTURA DEL SISTEMA                     │
└─────────────────────────────────────────────────────────────────────┘

     ┌──────────────┐         ┌──────────────┐         ┌──────────┐
     │   USUARIO    │────────▶│   FRONTEND   │         │  MYSQL   │
     └──────────────┘         │   (Vercel)   │         │ Database │
                              └──────┬───────┘         │(Railway) │
                                     │                 └────┬─────┘
                                     │ 🔗 API              │
                                     ▼                     │
                              ┌──────────────┐             │
                              │   BACKEND    │◀────────────┘
                              │   (Render)   │
                              └──────────────┘

┌─────────────────────────────────────────────────────────────────────┐
│  FRONTEND → Vercel (Gratis)                                         │
│  BACKEND  → Render (Gratis)                                         │
│  DATABASE → Railway MySQL (500MB Gratis)                            │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🧰 Requisitos Previos

| Requisito | Versión Mínima | Descripción |
|-----------|----------------|-------------|
| Node.js | 18+ | Runtime de JavaScript |
| MySQL | 8.0+ | Base de datos (local) |
| Git | 2.0+ | Control de versiones |
| npm | 9.0+ | Gestor de paquetes |

### Instalación de Node.js
```
bash
# Windows
# Descargar desde: https://nodejs.org/

# macOS (con Homebrew)
brew install node

# Linux (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 💻 Instalación Local

### 1️⃣ Clonar el Repositorio

```
bash
git clone https://github.com/tu-usuario/tiendaadi.git
cd tiendaadi
```

### 2️⃣ Estructura del Proyecto

```
tiendaadi/
├── Backend/              # API REST (Node.js + Express)
│   ├── src/
│   │   ├── config/      # Configuraciones
│   │   ├── modules/     # Controladores y rutas
│   │   ├── middleware/  # Middlewares Express
│   │   └── utils/       # Utilidades
│   ├── prisma/          # Schema y migraciones
│   ├── uploads/         # Archivos subidos
│   └── package.json
│
├── Frontend/            # Aplicación React
│   ├── src/
│   │   ├── api/         # Axios configuration
│   │   ├── components/  # Componentes reutilizables
│   │   ├── pages/       # Páginas del sistema
│   │   ├── context/     # React Context
│   │   └── utils/       # Utilidades
│   ├── public/
│   └── package.json
│
├── README.md
└── DEPLOY.md            # Guía de despliegue
```

### 3️⃣ Instalar Dependencias

#### Backend
```
bash
cd Backend
npm install
```

#### Frontend
```
bash
cd Frontend
npm install
```

---

## 🗄️ Configuración de Base de Datos

### Opción A: MySQL Local

1. **Instalar MySQL** (si no lo tienes)
   - Windows: https://dev.mysql.com/downloads/installer/
   - macOS: `brew install mysql`
   - Linux: `sudo apt install mysql-server`

2. **Crear la Base de Datos**
```
sql
CREATE DATABASE adi_estilos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

3. **Configurar Variables de Entorno**
```
bash
# Backend/.env
DATABASE_URL="mysql://root:password@localhost:3306/adi_estilos"
JWT_SECRET="tu-secreto-muy-largo-de-al-menos-32-caracteres"
PORT=3000
NODE_ENV=development
```

### Opción B: MySQL en Railway (Cloud)

1. Ve a [Railway](https://railway.com)
2. Crea un proyecto y agrega **MySQL**
3. Copia la `DATABASE_URL` proporcionada

---

## ⚙️ Variables de Entorno

### Backend (`Backend/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Conexión MySQL | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Clave JWT (mín 32 chars) | `clave-segura-muy-larga-12345678` |
| `PORT` | Puerto del servidor | `3000` |
| `NODE_ENV` | Entorno | `development` o `production` |
| `CORS_ORIGIN` | Origen CORS permitido | `http://localhost:5173` |

### Frontend (`Frontend/.env`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend | `http://localhost:3000/api` |
| `VITE_APP_NAME` | Nombre de la app | `Adi Estilos` |
| `VITE_FILES_URL` | URL de archivos | `http://localhost:3000` |

### Frontend Producción (`Frontend/.env.production`)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `VITE_API_URL` | URL del backend en producción | `https://tu-backend.onrender.com/api` |
| `VITE_APP_NAME` | Nombre de la app | `Adi Estilos` |
| `VITE_FILES_URL` | URL de archivos en producción | `https://tu-backend.onrender.com` |

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

### Credenciales de Prueba (Seed)

El proyecto incluye datos de prueba:
- **Usuario admin**: `admin@adi.com` / `admin123`
- **Usuario cliente**: `cliente@adi.com` / `cliente123`

---

## 🚀 Despliegue en Producción

### Parte 1: Desplegar Backend en Render

#### Paso 1: Preparar el Repositorio
1. Sube tu proyecto a GitHub
2. Asegúrate de tener el archivo `Backend/render.yaml` (incluido)

#### Paso 2: Crear Servicio en Render
1. Ve a [Render Dashboard](https://dashboard.render.com)
2. Inicia sesión con GitHub
3. Click en **"New +"** → **"Web Service"**
4. Conecta tu repositorio `tiendaadi`
5. Configura:
   - **Name**: `adi-estilos-backend`
   - **Root Directory**: `Backend`
   - **Region**: Oregon (o el más cercano)
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npx prisma generate`
   - **Start Command**: `npm start`

#### Paso 3: Configurar Variables de Entorno
En la sección **"Environment"**, agrega:

| Variable | Valor |
|----------|-------|
| `DATABASE_URL` | `mysql://...` (ver más abajo) |
| `JWT_SECRET` | Genera uno seguro: `openssl rand -base64 32` |
| `PORT` | `3000` |
| `NODE_ENV` | `production` |

#### Paso 4: Crear Base de Datos MySQL

**Opción: Railway MySQL (500MB gratis)**
1. Ve a [Railway](https://railway.com)
2. Crea un nuevo proyecto
3. Agrega **MySQL** (plugin gratuito)
4. Copia la `DATABASE_URL`
5. Pégala en las Variables de Entorno de Render

#### Paso 5: Ejecutar Migraciones
1. En Render, ve a **"Shell"**
2. Ejecuta:
```
bash
npx prisma migrate deploy
npx prisma db seed
```

**✅ Backend desplegado:** `https://adi-estilos-backend.onrender.com`

---

### Parte 2: Desplegar Frontend en Vercel

#### Paso 1: Conectar Repositorio
1. Ve a [Vercel Dashboard](https://vercel.com/dashboard)
2. Click en **"Add New..."** → **"Project"**
3. Selecciona tu repositorio `tiendaadi`

#### Paso 2: Configurar Proyecto
4. **Root Directory**: `Frontend`
5. **Framework Preset**: `Vite`
6. **Build Command**: `npm run build`
7. **Output Directory**: `dist`

#### Paso 3: Configurar Variables de Entorno
Agrega estas variables:

| Variable | Valor |
|----------|-------|
| `VITE_API_URL` | `https://tu-backend.onrender.com/api` |
| `VITE_APP_NAME` | `Adi Estilos` |
| `VITE_FILES_URL` | `https://tu-backend.onrender.com` |

**Importante:** Reemplaza `tu-backend` con el nombre de tu servicio en Render.

#### Paso 4: Desplegar
1. Click en **"Deploy"**
2. Espera 2-3 minutos

**✅ Frontend desplegado:** `https://tu-proyecto.vercel.app`

---

### Parte 3: Conectar Frontend con Backend

Una vez desplegado:

1. **En Vercel**, ve a tu proyecto → **Settings** → **Environment Variables**
2. Actualiza `VITE_API_URL` con la URL real de tu backend:

```
   VITE_API_URL=https://adi-estilos-backend.onrender.com/api

```
3. **Redeploy** el frontend para aplicar los cambios

---

## 📖 Manual de Usuario

### 🛒 Comprar como Cliente

1. **Registrarse/Iniciar sesión**
   - Ir a la página de login/registro
   - Ingresar datos o crear cuenta nueva

2. **Explorar Productos**
   - Navegar por el catálogo
   - Filtrar por categoría, color, talla
   - Ver detalles de productos

3. **Agregar al Carrito**
   - Seleccionar variante (color/talla)
   - Elegir cantidad
   - Click en "Agregar al carrito"

4. **Finalizar Compra**
   - Ir al carrito
   - Revisar productos
   - Seleccionar método de pago
   - Confirmar pedido

### ⚙️ Administrar como Admin

1. **Acceder al Panel**
   - Login con credenciales admin
   - URL: `/admin`

2. **Gestión de Productos**
   - **Productos**: CRUD completo, variantes, precios
   - **Categorías**: Crear/editar categorías
   - **Colores/Tallas**: Configurar opciones

3. **Gestión de Inventario**
   - **Movimientos**: Control de entradas/salidas
   - **Ajustes**: Corrección de stock

4. **Gestión de Ventas**
   - **Ventas**: Ver todos los pedidos
   - **Clientes**: Gestión de clientes
   - **Créditos**: Sistema de crédito

5. **Reportes**
   - Estadísticas de ventas
   - Inventario actual
   - Clientes y créditos

---

## 🔧 Manual para Desarrolladores

### Estructura de Módulos (Backend)

```
Backend/src/modules/
├── auth/                      # Autenticación y JWT
├── usuarios/                  # Gestión de usuarios
├── productos/                 # CRUD de productos
├── variantes/                # Variantes de productos
├── categorias/               # Categorías
├── colores/                  # Colores
├── tallas/                   # Tallas
├── ventas/                   # Sistema de ventas
├── compras/                  # Sistema de compras
├── inventario/              # Control de inventario
├── movimientos/              # Movimientos de stock
├── clientesCreditoResumen/  # Créditos
└── ...                       # Otros módulos
```

### Agregar Nuevo Módulo

1. **Crear estructura:**
```
bash
Backend/src/modules/nuevo-modulo/
├── moduloController.js
├── moduloRoutes.js
└── moduloService.js
```

2. **Registrar rutas en `allRoutes.js`**

3. **Crear API en frontend:**
```bash
Frontend/src/api/nuevoModuloApi.js
```

### Personalizar Estilos

**Tailwind config** (`Frontend/tailwind.config.js`):
```
javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#tu-color',
      },
    },
  },
  plugins: [],
}
```

---

## ❗ Problemas Comunes

### 🔴 Error: "Cannot connect to database"
**Solución:**
- Verifica que `DATABASE_URL` sea correcta
- Confirma que MySQL esté activo
- Verifica credenciales (usuario/contraseña)

### 🔴 Error: "Prisma schema not found"
**Solución:**
```
bash
cd Backend
npx prisma generate
```

### 🔴 Error: "CORS policy"
**Solución:**
- Verifica que `CORS_ORIGIN` incluya tu dominio
- En desarrollo: `http://localhost:5173`
- En producción: tu dominio de Vercel

### 🔴 Error: "JWT_SECRET is required"
**Solución:**
- Genera una clave segura:
```
bash
openssl rand -base64 32
```
- Agrégala a tus variables de entorno

### 🔴 Error: "Build failed in Vercel"
**Solución:**
- Verifica que `Root Directory` sea `Frontend`
- Asegúrate de tener `package.json` en esa carpeta

### 🔴 Error: "App goes to sleep" (Render)
**Solución:**
- Es normal en el plan gratuito
- La primera request después de inactividad será lenta
- Considera actualizar a plan paid si necesitas always-on

---

## 📞 API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrarse |
| GET | `/api/auth/me` | Perfil actual |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Listar productos |
| GET | `/api/productos/:id` | Ver producto |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| DELETE | `/api/productos/:id` | Eliminar producto |

### Ventas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ventas` | Listar ventas |
| POST | `/api/ventas` | Crear venta |

### Inventario
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/inventario` | Ver stock |
| POST | `/api/movimientos` | Registrar movimiento |

*Ver archivo `Backend/src/allRoutes.js` para lista completa*

---

## 📄 Licencia

Este proyecto está bajo la licencia ISC. @Alejostone

---

## 👤 Autor

**Adi Estilos**
- GitHub: [@adiestilos](https://github.com/adiestilos)
- Email: contacto@adiestilos.com

---

<div align="center">

**⭐ ¡Dale una estrella al proyecto si te fue útil!**

Hecho por Alejandro Piedrahita Muñoz - @Alejostone

</div>




# 🏪 ADI ESTILOS - Sistema Integral de Gestión Comercial

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-green?style=for-the-badge&logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React">
  <img src="https://img.shields.io/badge/MySQL-8.0-orange?style=for-the-badge&logo=mysql" alt="MySQL">
  <img src="https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwind-css" alt="Tailwind">
</p>

> ✅ **NOTA IMPORTANTE**: Este proyecto usa **MySQL** como base de datos, NO PostgreSQL.

---

## 📋 Tabla de Contenidos

1. [Descripción del Proyecto](#-descripción-del-proyecto)
2. [Tecnologías Utilizadas](#-tecnologías-utilizadas)
3. [Estructura del Proyecto](#-estructura-del-proyecto)
4. [Requisitos Previos](#-requisitos-previos)
5. [Guía de Instalación](#-guía-de-instalación)
6. [Configuración de la Base de Datos](#-configuración-de-la-base-de-datos)
7. [Configuración del Entorno](#-configuración-del-entorno)
8. [Ejecución del Proyecto](#-ejecución-del-proyecto)
9. [Arquitectura del Backend](#-arquitectura-del-backend)
10. [Arquitectura del Frontend](#-arquitectura-del-frontend)
11. [Módulos del Sistema](#-módulos-del-sistema)
12. [API Endpoints](#-api-endpoints)
13. [Despliegue en Producción](#-despliegue-en-producción)
14. [Solución de Problemas](#-solución-de-problemas)
15. [Licencia](#-licencia)

---

## 📖 Descripción del Proyecto

**ADI ESTILOS** es un sistema completo de gestión comercial para tiendas de ropa y accesorios. Desarrollado con arquitectura moderna (REST API + SPA), ofrece una solución integral para la administración de:

- ✅ **Gestión de Productos** - Catálogo con variantes (color, talla), categorías, precios y stock
- ✅ **Sistema de Ventas** - Punto de venta, múltiples métodos de pago, facturación
- ✅ **Sistema de Créditos** - Control de cuentas por cobrar, abonos, historial
- ✅ **Gestión de Inventario** - Control de stock, movimientos, ajustes, alertas
- ✅ **Módulo de Compras** - Órdenes a proveedores, recepción de mercancía
- ✅ **Reportes y Analytics** - Dashboard, reportes de ventas, inventario y créditos
- ✅ **Gestión de Descuentos** - Promociones, códigos, descuentos por cliente
- ✅ **Devoluciones** - Control de devoluciones y reclamos
- ✅ **Multi-usuario** - Roles: Administrador, Bodeguero, Cliente

---

## 🛠️ Tecnologías Utilizadas

### Backend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Node.js** | 18+ | Runtime de JavaScript |
| **Express.js** | ^4.18 | Framework web REST API |
| **Prisma ORM** | ^5.0 | ORM para base de datos MySQL |
| **MySQL** | 8.0+ | Base de datos relacional |
| **JWT** | ^9.0 | Autenticación basada en tokens |
| **bcrypt** | ^5.1 | Encriptación de contraseñas |
| **multer** | ^1.4 | Manejo de uploads de archivos |

### Frontend
| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **React** | ^18.2 | Biblioteca de interfaz de usuario |
| **Vite** | ^5.0 | Build tool y dev server |
| **Tailwind CSS** | ^3.4 | Framework de estilos CSS |
| **React Router** | ^6 | Enrutamiento de páginas |
| **Axios** | ^1.6 | Cliente HTTP |
| **Framer Motion** | ^11 | Animaciones |
| **Ant Design** | ^5 | Componentes UI |
| **Lucide React** | ^0.300 | Iconos |

### Infraestructura
| Tecnología | Descripción |
|------------|-------------|
| **Nginx** | Proxy reverso y servidor estático |
| **PM2** | Gestor de procesos en producción |
| **Docker** | Contenedorización (opcional) |

---

## 📁 Estructura del Proyecto

```
WEB_ADI_v1/
├── 📂 Backend/                      # API REST con Node.js + Express + Prisma
│   ├── 📂 prisma/
│   │   ├── 📂 migrations/         # Migraciones de base de datos
│   │   ├── 📂 seeds/              # Datos iniciales (seeders)
│   │   └── schema.prisma          # Esquema de la base de datos
│   ├── 📂 src/
│   │   ├── 📂 config/             # Configuraciones
│   │   ├── 📂 middleware/         # Middlewares (auth, upload, errores)
│   │   ├── 📂 modules/            # Módulos de negocio
│   │   ├── 📂 utils/              # Utilidades
│   │   ├── app.js                 # Configuración Express
│   │   ├── server.js               # Punto de entrada
│   │   └── allRoutes.js           # Registro de rutas
│   ├── 📂 uploads/                # Archivos subidos (imágenes)
│   ├── 📂 database/               # Scripts SQL y backups
│   ├── package.json
│   └── prisma/schema.prisma
│
├── 📂 Frontend/                   # Aplicación React + Vite + Tailwind
│   ├── 📂 src/
│   │   ├── 📂 api/                # Servicios API (Axios)
│   │   ├── 📂 components/         # Componentes reutilizables
│   │   │   ├── 📂 admin/          # Componentes admin
│   │   │   ├── 📂 catalogo/       # Componentes catálogo
│   │   │   ├── 📂 common/         # Componentes genéricos
│   │   │   ├── 📂 layout/         # Layouts y navegación
│   │   │   └── 📂 producto/       # Componentes productos
│   │   ├── 📂 context/            # Context API (Auth, Carrito)
│   │   ├── 📂 hooks/              # Hooks personalizados
│   │   ├── 📂 pages/              # Páginas de la app
│   │   │   ├── 📂 admin/          # Páginas admin
│   │   │   ├── 📂 cliente/        # Páginas cliente
│   │   │   └── 📂 public/          # Páginas públicas
│   │   ├── 📂 routes/             # Configuración de rutas
│   │   ├── 📂 styles/             # Estilos adicionales
│   │   ├── 📂 utils/              # Utilidades
│   │   ├── App.jsx                # Componente raíz
│   │   └── main.jsx               # Punto de entrada
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── postcss.config.js
│
├── 📂 Backend/database/            # Scripts de base de datos
│   ├── AdiWeb.sql                 # Dump de base de datos
│   ├── AdiWeb.txt                 # Esquema texto
│   └── RecoveryBD.sql             # Script de recuperación
│
├── 📂 Backend/scripts/             # Scripts utilitarios
│   ├── crearImagenesFisicas.js
│   ├── asignarImagenesExistentes.js
│   ├── limpiarImagenesInexistentes.js
│   └── verificarImagenes.js
│
├── 📄 README.md                    # Este archivo
├── 📄 .gitignore
├── 📄 Backend/package.json
└── 📄 Frontend/package.json
```

---

## 📦 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

| Requisito | Versión Mínima | Comando de verificación |
|-----------|----------------|------------------------|
| **Node.js** | 18.x+ | `node --version` |
| **npm** | 9.x+ | `npm --version` |
| **MySQL** | 8.0+ | `mysql --version` |
| **Git** | 2.x+ | `git --version` |

### Recomendaciones
- **VS Code** como editor de código
- **MySQL Workbench** para gestión visual de la base de datos
- **Postman** o **Insomnia** para probar APIs

---

## 🚀 Guía de Instalación

### Paso 1: Clonar el Repositorio

```bash
# Clonar el proyecto
git clone https://github.com/tu-usuario/tu-repositorio.git

# Entrar al directorio
cd WEB_ADI_v1
```

### Paso 2: Instalar Dependencias del Backend

```
bash
# Entrar al directorio del backend
cd Backend

# Instalar dependencias
npm install
```

### Paso 3: Instalar Dependencias del Frontend

```
bash
# Entrar al directorio del frontend
cd ../Frontend

# Instalar dependencias
npm install
```

---

## 🗄️ Configuración de la Base de Datos

### Opción 1: Usar el Dump SQL (Recomendado)

```
bash
# 1. Crear la base de datos en MySQL
mysql -u root -p -e "CREATE DATABASE adi_web CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Importar el dump
mysql -u root -p adi_web < Backend/database/AdiWeb.sql

# 3. Verificar tablas creadas
mysql -u root -p -e "USE adi_web; SHOW TABLES;"
```

### Opción 2: Usar Prisma (Migraciones)

```
bash
cd Backend

# 1. Configurar DATABASE_URL en .env
# (Ver sección siguiente)

# 2. Ejecutar migraciones
npx prisma migrate dev

# 3. Ejecutar seeds (datos iniciales)
npx prisma db seed
```

### Configuración de MySQL

```
sql
-- Crear usuario específico (opcional)
CREATE USER 'adi_user'@'localhost' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON adi_web.* TO 'adi_user'@'localhost';
FLUSH PRIVILEGES;

-- Configuración recomendada para MySQL
-- En my.cnf o my.ini:
[mysqld]
default-authentication-plugin=mysql_native_password
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci
```

---

## ⚙️ Configuración del Entorno

### Backend (.env)

Crea un archivo `.env` en la carpeta `Backend/`:

```
env
# ============================================
# CONFIGURACIÓN DE BASE DE DATOS
# ============================================
DATABASE_URL="mysql://root:tu_password@localhost:3306/adi_web?schema=public&connection_limit=5"

# ============================================
# CONFIGURACIÓN DEL SERVIDOR
# ============================================
PORT=3000
NODE_ENV=development

# ============================================
# CONFIGURACIÓN JWT
# ============================================
JWT_SECRET=tu_secret_key_muy_segura_aqui_minimo_32_caracteres
JWT_EXPIRES_IN=7d

# ============================================
# CONFIGURACIÓN DE UPLOADS
# ============================================
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

### Frontend (.env)

Crea un archivo `.env` en la carpeta `Frontend/`:

```
env
# ============================================
# CONFIGURACIÓN API
# ==========================================
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Adi Estilos

# ============================================
# CONFIGURACIÓN APP
# ==========================================
VITE_ENABLE_MOCKS=false
```

---

## ▶️ Ejecución del Proyecto

### Modo Desarrollo

#### Iniciar Backend

```
bash
cd Backend

# Con nodemon (recarga automática)
npm run dev

# El servidor estará en: http://localhost:3000
# Documentación API: http://localhost:3000/api-docs (si está habilitada)
```

#### Iniciar Frontend

```
bash
cd Frontend

# Iniciar servidor de desarrollo
npm run dev

# La aplicación estará en: http://localhost:5173
```

### Modo Producción

#### Backend con PM2

```
bash
cd Backend

# Instalar PM2 global si no lo tienes
npm install -g pm2

# Iniciar con PM2
pm2 start ecosystem.config.js

# Ver logs
pm2 logs adi-backend

# Detener
pm2 stop adi-backend
```

#### Frontend (Build)

```
bash
cd Frontend

# Crear build de producción
npm run build

# El build estará en la carpeta dist/
# Puedes servirlo con nginx o npm run preview
```

---

## 🏗️ Arquitectura del Backend

### Estructura de Módulos

```
Backend/src/modules/
├── 📂 auth/                    # Autenticación y login
│   ├── authController.js
│   ├── authRoutes.js
│   └── authService.js
│
├── 📂 usuarios/               # Gestión de usuarios
│   ├── usuariosController.js
│   ├── usuariosRoutes.js
│   └── usuariosService.js
│
├── 📂 roles/                  # Roles y permisos
│
├── 📂 productos/             # Catálogo de productos
│   ├── productosController.js
│   ├── productosRoutes.js
│   └── productosService.js
│
├── 📂 categorias/            # Categorías de productos
│
├── 📂 colores/               # Catálogo de colores
│
├── 📂 tallas/                # Catálogo de tallas
│
├── 📂 variantes/            # Variantes (color + talla)
│
├── 📂 proveedores/           # Gestión de proveedores
│
├── 📂 imagenes/             # Gestión de imágenes
│
├── 📂 galeria/               # Galería de productos
│
├── 📂 compras/               # Órdenes de compra
│
├── 📂 detalleCompras/        # Detalle de compras
│
├── 📂 ventas/                # Órdenes de venta
│
├── 📂 detalleVentas/         # Detalle de ventas
│
├── 📂 pagos/                 # Gestión de pagos
│
├── 📂 metodosPago/           # Métodos de pago
│
├── 📂 inventario/            # Control de inventario
│
├── 📂 movimientos/           # Movimientos de stock
│
├── 📂 ajustesInventario/     # Ajustes de inventario
│
├── 📂 creditos/              # Sistema de créditos
│   ├── creditosController.js
│   ├── creditosRoutes.js
│   └── creditosService.js
│
├── 📂 clientesCreditoResumen/ # Resumen de créditos por cliente
│
├── 📂 ventasCredito/         # Ventas a crédito
│
├── 📂 descuentos/            # Sistema de descuentos
│   ├── descuentosController.js
│   ├── descuentosRoutes.js
│   └── descuentosService.js
│
├── 📂 devoluciones/          # Gestión de devoluciones
│
├── 📂 detalleDevoluciones/   # Detalle de devoluciones
│
├── 📂 estadosPedido/         # Estados de pedidos
│
└── 📂 reportes/              # Reportes y analytics
```

### Flujo de Datos

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Express   │────▶│   MySQL     │
│   (React)   │◀────│   (Node.js) │◀────│  (Prisma)   │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   JWT       │
                    │  Auth       │
                    └─────────────┘
```

---

## 🎨 Arquitectura del Frontend

### Estructura de Páginas

```
Frontend/src/pages/
├── 📂 admin/                    # Panel de Administración
│   ├── AdminDashboardPage.jsx
│   ├── inventario/
│   │   ├── InventarioPage.jsx
│   │   ├── MovimientosInventarioPage.jsx
│   │   └── TiposMovimientoPage.jsx    
│   ├── productos/
│   │   ├── ProductosPage.jsx
│   │   ├── CategoriasPage.jsx
│   │   ├── ColoresPage.jsx
│   │   ├── TallasPage.jsx
│   │   ├── ProveedoresPage.jsx
│   │   └── VariantesPage.jsx
│   ├── ventas/
│   │   ├── VentasPage.jsx
│   │   └── DetallesVentasPage.jsx
│   ├── compras/
│   │   └── ComprasPage.jsx
│   ├── creditos/
│   │   ├── CreditosPage.jsx
│   │   ├── AbonosCreditosPage.jsx
│   │   └── HistorialCreditosPage.jsx
│   ├── descuentos/
│   │   └── DescuentosPage.jsx
│   ├── devoluciones/
│   │   └── DevolucionesPage.jsx
│   ├── usuarios/
│   │   ├── UsuariosPage.jsx  
│   │   └── RolesPage.jsx
│   └── reportes/
│
├── 📂 cliente/                  # Panel de Cliente
│
└── 📂 public/                   # Páginas Públicas
```

### Componentes Reutilizables

```
Frontend/src/components/
├── 📂 common/                   # Componentes genéricos
│   ├── PrecioFormateado.jsx
│   └── ...
│
├── 📂 layout/                   # Layouts
│   ├── AdminLayout.jsx
│   ├── ClienteLayout.jsx
│   └── PublicLayout.jsx
│
├── 📂 admin/                    # Componentes admin
│
├── 📂 catalogo/                 # Componentes catálogo
│
└── 📂 producto/                 # Componentes productos
```

### Context API

```
javascript
// AuthContext.jsx - Autenticación global
// CarritoContext.jsx - Carrito de compras
// CartContext.jsx - Carrito (versión alternativa)
// ThemeContext.jsx - Tema claro/oscuro
```

---

## 📊 Módulos del Sistema

### 1. Módulo de Productos
- ✅ Catálogo con variantes (color + talla)
- ✅ Múltiples imágenes por producto
- ✅ Control de precios por variante
- ✅ Categorías y subcategorías
- ✅ Catálogo de colores y tallas

### 2. Módulo de Ventas
- ✅ Punto de venta (POS)
- ✅ Carrito de compras
- ✅ Múltiples métodos de pago
- ✅ Aplicación de descuentos
- ✅ Generación de facturas

### 3. Módulo de Créditos
- ✅ Crédito automático en ventas a crédito
- ✅ Control de abonos
- ✅ Historial de pagos
- ✅ Alertas de mora
- ✅ Resumen por cliente

### 4. Módulo de Inventario
- ✅ Control de stock por variante
- ✅ Movimientos de entrada/salida
- ✅ Tipos de movimiento configurables
- ✅ Ajustes manuales
- ✅ Historial de movimientos

### 5. Módulo de Descuentos
- ✅ Descuentos porcentuales
- ✅ Descuentos de valor fijo
- ✅ Códigos promocionales
- ✅ Descuentos por categoría
- ✅ Descuentos exclusivos por cliente

### 6. Módulo de Devoluciones
- ✅ Devoluciones totales y parciales
- ✅ Control de estado
- ✅ Reintegro a inventario
- ✅ Historial completo

---

## 🔌 API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Iniciar sesión |
| POST | `/api/auth/register` | Registrar usuario |
| POST | `/api/auth/logout` | Cerrar sesión |
| GET | `/api/auth/me` | Datos del usuario actual |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/usuarios` | Listar usuarios |
| GET | `/api/usuarios/:id` | Obtener usuario |
| POST | `/api/usuarios` | Crear usuario |
| PUT | `/api/usuarios/:id` | Actualizar usuario |
| DELETE | `/api/usuarios/:id` | Eliminar usuario |

### Productos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/productos` | Listar productos |
| GET | `/api/productos/:id` | Obtener producto |
| POST | `/api/productos` | Crear producto |
| PUT | `/api/productos/:id` | Actualizar producto |
| DELETE | `/api/productos/:id` | Eliminar producto |

### Ventas
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ventas` | Listar ventas |
| GET | `/api/ventas/:id` | Obtener venta |
| POST | `/api/ventas` | Crear venta |
| PUT | `/api/ventas/:id/estado` | Actualizar estado |

### Inventario
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/inventario` | Ver inventario |
| GET | `/api/movimientos` | Historial de movimientos |
| POST | `/api/ajustes` | Crear ajuste |

### Créditos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/creditos` | Listar créditos |
| GET | `/api/creditos/:id` | Obtener crédito |
| POST | `/api/creditos/:id/abono` | Registrar abono |

> **Nota**: La API completa contiene más endpoints. Consulta `Backend/src/allRoutes.js` para ver todas las rutas disponibles.

---

## 🚀 Despliegue en Producción

### Usando Nginx + PM2

#### 1. Configurar Nginx

```
bash
# Copiar configuración
sudo cp Frontend/nginx.conf /etc/nginx/sites-available/adi-estilos

# Habilitar sitio
sudo ln -s /etc/nginx/sites-available/adi-estilos /etc/nginx/sites-enabled/

# Probar configuración
sudo nginx -t

# Reiniciar nginx
sudo systemctl restart nginx
```

#### 2. Configuración de Producción (.env)

```
env
# Backend
DATABASE_URL="mysql://user:password@localhost:3306/adi_web"
JWT_SECRET=production_secret_min_32_chars
NODE_ENV=production
PORT=3000

# Frontend
VITE_API_URL=https://tu-dominio.com
VITE_APP_NAME=Adi Estilos
```

#### 3. Build y Deploy

```
bash
# Backend
cd Backend
npm run build  # Si hay build step
pm2 restart all

# Frontend
cd Frontend
npm run build
# Copiar dist a nginx root
sudo cp -r dist/* /var/www/adi-estilos/
```

---

## 🔧 Solución de Problemas

### Error: `Cannot connect to database`
```
bash
# Verificar que MySQL esté corriendo
sudo systemctl status mysql

# Verificar credenciales en .env
# Probar conexión
mysql -u root -p -e "SHOW DATABASES;"
```

### Error: `Port already in use`
```
bash
# Encontrar proceso usando el puerto
lsof -i :3000

# Matar proceso
kill -9 <PID>

# O usar otro puerto en .env
PORT=3001
```

### Error: `Prisma migration failed`
```
bash
# Resetear base de datos
npx prisma migrate reset

# O aplicar migraciones directamente
npx prisma db push
```

### Error: CORS en desarrollo
```
bash
# El backend ya tiene CORS configurado
# Verificar que VITE_API_URL sea correcto en Frontend/.env
```

### Error: Imágenes no cargan
```
bash
# Verificar carpeta uploads existe y tiene permisos
ls -la Backend/uploads/

# Crear si no existe
mkdir -p Backend/uploads
chmod 777 Backend/uploads
```

---

## 📝 Scripts Disponibles

### Backend
```
bash
npm run dev              # Desarrollo (nodemon)
npm run start           # Producción (PM2)
npm run prisma:studio   # Abrir Prisma Studio
```

### Frontend
```
bash
npm run dev             # Servidor desarrollo
npm run build           # Build producción
npm run preview         # Preview build
npm run lint            # Verificar código
```

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Add nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

## 👤 Información del Desarrollador

- **Desarrollado por**:JOHN ALEJANDRO PIEDRAHITA "Alejostone"
- **Versión**: 1.0.0
- **Fecha**: 2026

---

<div align="center">

⭐️ **¡Dale una estrella al proyecto si te fue útil!** ⭐️

</div>

---

> **Nota**: Este README fue creado automáticamente basándose en la estructura y configuración del proyecto. Para actualizaciones específicas, consulta la documentación interna o los comentarios en el código.
