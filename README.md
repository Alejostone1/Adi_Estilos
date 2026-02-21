# 🏪 Adi Estilos - Sistema de Gestión de Tienda de Ropa

Un sistema completo de gestión para tienda de ropa que incluye inventario, ventas, compras, créditos, reportes y más.

## 📁 Estructura del Proyecto

```
AppVite_2026/
├── backend/                    # API REST con Node.js + Express + Prisma
├── frontend/                   # Aplicación React con Vite + Tailwind CSS
├── database/                   # Scripts y backups de base de datos
├── nginx/                      # Configuración del servidor web
├── .gitignore                  # Archivos ignorados por Git
└── README.md                   # Este archivo
```

## 🚀 Tecnologías Utilizadas

### Backend
- **Node.js** con **Express.js**
- **Prisma ORM** para base de datos
- **PostgreSQL** como base de datos
- **JWT** para autenticación
- **bcrypt** para encriptación de contraseñas
- **multer** para manejo de archivos
- **PM2** para gestión de procesos

### Frontend
- **React 18** con **Vite**
- **React Router** para navegación
- **Tailwind CSS** para estilos
- **Axios** para llamadas HTTP
- **React Icons** para iconografía
- **Context API** para estado global

### Infraestructura
- **Nginx** como proxy reverso
- **PM2** para gestión de procesos en producción

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- PostgreSQL 14+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd AppVite_2026
```

### 2. Configurar Backend
```bash
cd backend
npm install
cp .env.example .env  # Configurar variables de entorno
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### 3. Configurar Frontend
```bash
cd ../frontend
npm install
cp .env.example .env  # Configurar variables de entorno
npm run dev
```

### 4. Configurar Nginx (Producción)
```bash
# Copiar configuración
sudo cp nginx/adi-estilos.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/adi-estilos.conf /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🏗️ Arquitectura del Backend

```
backend/
├── src/
│   ├── config/                 # Configuraciones de BD y servidor
│   ├── middleware/             # Middlewares personalizados
│   ├── modules/                # Módulos de negocio
│   │   ├── auth/              # Autenticación y autorización
│   │   ├── usuarios/          # Gestión de usuarios
│   │   ├── productos/         # Catálogo de productos
│   │   ├── categorias/        # Categorías de productos
│   │   ├── colores/           # Colores disponibles
│   │   ├── tallas/            # Tallas disponibles
│   │   ├── variantes/         # Variantes de productos
│   │   ├── proveedores/       # Gestión de proveedores
│   │   ├── compras/           # Órdenes de compra
│   │   ├── ventas/            # Órdenes de venta
│   │   ├── inventario/        # Control de inventario
│   │   ├── creditos/          # Sistema de créditos
│   │   ├── pagos/             # Gestión de pagos
│   │   ├── descuentos/        # Sistema de descuentos
│   │   ├── devoluciones/      # Gestión de devoluciones
│   │   ├── reportes/          # Reportes y analytics
│   │   └── ...                # Otros módulos
│   ├── utils/                 # Utilidades compartidas
│   ├── app.js                 # Configuración de Express
│   ├── server.js              # Punto de entrada del servidor
│   └── allRoutes.js           # Registro de todas las rutas
├── prisma/                    # Esquemas y migraciones de BD
├── uploads/                   # Archivos subidos (imágenes)
└── ecosystem.config.js        # Configuración PM2
```

## 🎨 Arquitectura del Frontend

```
frontend/
├── public/                     # Archivos estáticos
├── src/
│   ├── api/                   # Servicios API (axios)
│   ├── components/            # Componentes reutilizables
│   │   ├── common/           # Componentes genéricos
│   │   ├── layout/           # Layouts y navegación
│   │   ├── admin/            # Componentes específicos de admin
│   │   ├── catalogo/         # Componentes del catálogo
│   │   └── producto/         # Componentes de productos
│   ├── context/              # Context API para estado global
│   ├── pages/                # Páginas de la aplicación
│   │   ├── admin/           # Páginas de administración
│   │   ├── cliente/         # Páginas de cliente
│   │   └── public/          # Páginas públicas
│   ├── routes/               # Configuración de rutas
│   ├── utils/                # Utilidades del frontend
│   ├── App.jsx               # Componente raíz
│   └── main.jsx              # Punto de entrada
├── index.html                # HTML base
└── vite.config.js            # Configuración de Vite
```

## 🔐 Autenticación y Autorización

### Roles del Sistema
- **Administrador**: Acceso completo a todas las funcionalidades
- **Bodeguero**: Gestión de inventario, productos y compras
- **Cliente**: Acceso limitado a compras y perfil

### Endpoints Protegidos
La mayoría de los endpoints requieren autenticación JWT y verificación de roles específicos.

## 📊 Funcionalidades Principales

### Gestión de Productos
- Catálogo de productos con variantes (color, talla)
- Gestión de categorías, colores y tallas
- Control de inventario por variante
- Galería de imágenes por producto

### Sistema de Ventas
- Carrito de compras
- Múltiples métodos de pago
- Sistema de créditos para clientes
- Historial de ventas y reportes

### Gestión de Compras
- Órdenes de compra a proveedores
- Recepción de mercancía
- Actualización automática de inventario

### Reportes y Analytics
- Dashboard con métricas clave
- Reportes de ventas por período
- Reportes de inventario
- Reportes de créditos

## 🗄️ Base de Datos

### Principales Entidades
- **Usuarios**: Sistema de usuarios con roles
- **Productos**: Catálogo con variantes
- **Ventas**: Órdenes de venta y detalles
- **Compras**: Órdenes de compra y recepción
- **Inventario**: Movimientos y stock actual
- **Créditos**: Sistema de cuentas por cobrar
- **Proveedores**: Gestión de proveedores

### Relaciones
- Un producto puede tener múltiples variantes (color + talla)
- Una venta puede tener múltiples productos
- Un cliente puede tener múltiples créditos activos

## 🚀 Despliegue en Producción

### Variables de Entorno
```env
# Backend
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
PORT=3000

# Frontend
VITE_API_URL="https://api.tu-dominio.com"
VITE_APP_NAME="Adi Estilos"
```

### Comandos de Producción
```bash
# Backend
cd backend
npm run build
npm run start:prod

# Frontend
cd frontend
npm run build
npm run preview
```

## 📝 Scripts Disponibles

### Backend
```bash
npm run dev          # Desarrollo con nodemon
npm run start        # Producción con PM2
npm run test         # Ejecutar tests
npm run prisma:studio # Abrir Prisma Studio
```

### Frontend
```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run preview      # Vista previa del build
npm run lint         # Ejecutar ESLint
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para soporte técnico o preguntas, por favor contactar al equipo de desarrollo.

---

**Desarrollado con ❤️ para Adi Estilos**
