# 🚀 Adi Estilos - E-commerce Full Stack

<div align="center">

![React](https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express-4.18-000000?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=for-the-badge&logo=prisma)
![Vite](https://img.shields.io/badge/Vite-5.0-646CFF?style=for-the-badge&logo=vite)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=&badgeWidths=true)

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
| **Reportes** | Dashboard analytics en tiempo real |

---

## 🛠️ Tecnologías Utilizadas

### Backend Stack
-| Tecnología Propósito
|----|------
-| Node.js 18+ Runtime JavaScript
-| Express.js 4.x Framework web REST API
-| Prisma 5.x ORM base datos PostgreSQ-
-| PostgreSQL Base datos relacional
-| JWT + bcrypt Autenticación seguridad-
+| Multer Manejo uploads imágenes-
+| Cloudinary Almacenamiento híbrido imágen-

### Frontend Stack
---| Tecnología Propósito
----|------
-- React 18.x Biblioteca interfaz usuario
-- Vite Build tool dev server
-- Tailwind CSS Framework estilos
-- Ant Design Componentes UI profesionales
-- Framer Motion Animaciones
--- React Router DOM Enrutamiento

---
Axios Cliente HTTP

---

## ☁️ Arquitectura Cloud


```
┌─────────────────────────────────────────────────────────────────┐│ ARQUITECTURA DEL SISTEMA │└─────────────────────────────────────────────────────────────────┘     ┌──────────┐    ┌──────────┐    ┌──────────────────┐     │ USUARIO │───▶│ FRONTEND │───▶│ BACKEND │
     └──────────┘    │(Vercel)   │    │   (Render)       │
                     └────┬─────┘    └────────┬─────────┘                          │                  │
                          ▼                  ▼                   ┌──────────────────┐  ┌────────────┐                   CDN Global      ├───────────────── ────┴───┴───────────────── ────┤ Imágenes        ├───────────────── ────┴───┴───────────────── ---+ Storage          ├───────────────── ────┴───┴---------------------+ Hybrid           ├------------------+-------------------------+
```

### Servicios Producción

Componente|Servicio Plan Estado:
---|---|---|---
Frontend|Vercel|Free:|✅ Listo
Backend|Render|Free:|✅ Listo
Base Datos|PostgreS-QL Neon/Railway|Free:500MB ✅Listo
Imágenes.Cloudinary|Gratis:25GB/mês ✅Listo

---

## 📁 Estructura Proyecto


```adi-estilos/
├── Backend/
│ ├── prisma/
│ ├── src/config/, middleware/, modules/, utils/
│ ├── uploads/
│ └── package.json Frontend/

├── src/api/, components/, pages/, context/, routes/
├── package.json DEPLOY.md CONFIG.md└
```

---

## 🔧 Requisitos Previos


Requisito|Versión|Comando verificación:
---|---|----
Node.js|npm --version: node --version||9.x+|npm --version||Git|--git version|

--

Instalar Node.j-s:

bash# macOSbrew install node# Linuxcurl fsSL https deb.nodesource.com/setup_20 x sudo -E bash -sudo apt-get install -y nodejs```

--

💻 Instalación Local


1.Clonar repositorio:


bashgit clone https //github.com/Alejostone1.Adi_Estilos.gitcd Adi_Estilos```

2.Instalar dependencias:


bashBackend cd npm install npx prisma generateFrontend cd npm install```


--

⚙️ Configuración Variables Entorno


Backend .env:

```envDATABASE_URL postgresql postgres Android13@localhost adi_estilos?schema publicPORT3000NODE_ENV developmentJWT_SECRET tu-secret-key-muy-segura-minimo32charsJWT_EXPIRES_IN24hCORS_ORIGIN http localhost5173STORAGE_MODE hybridCLOUDINARY_CLOUD_NAME dm5qezkocCLOUDINARY_API_KEY your_api_key CLOUDINARY_API_SECRET your_api_secretBASE_URL http localhost3000MAX_FILE_SIZE52428800```

Frontend .env:

```envVITE_API_URL=http//localhost3000/apiVITE_APP_NAMEAdi Estilos VITE_FILES_URLhttp//localhost3000```


--

🏃 Ejecutar Desarrollo


Backend:


bashcd Backendnpm run devdisponible http //localhost3000`

`Front-end:`



`cd Frontend npm run dev disponible http //localhost5173`

Credenciales prueba seed:-Admin admin@adi.com/admin123-Cliente cliente@adi.com/cliente123-

-

📦 Scripts Disponibles



Backend:npm run dev desarrollo nodemon-npm start producción PM-npx prisma studio Studio-Pront-end:npm run dev servidor desarrollon pm build build producciónnpm preview preview build`- -

🚀 Despliegue Producción




Frontend → Vercel1 Conectar repositorio [Vercel] h ttps vercel com2 Root Directory F rontendFramework Preset Vi-teBuild Command npm run buil-dOutput Director-y distAgregar variables entorno-VITE_API_U-RL-VITE_APP_NAM-E-VITE_FILES_-URL-Back end → Render1 Conectar repositorio [Render] ht tps render com2 Root Direct ory Backen-dBuild Command npm install && n px prisma generateStart Comm-and npm startAgregar variables entorno-DATABASE_URL-JWT_SECRET-PORT-NODE_ENV-production ST ORAGE_MODE-hybrid-CLOU DINARY credentials`

-

🛡️ Seguridad Implementada



MedidaDescripción:JWT autenticación tokensbcrypt encrip-tamiento contraseñasHelmet headers seguridadHTTPCORS control orígenes cruzadosRate Limiting protección ataquesValidación express-valida-tor endpointsseguridad completa!

----

📊 Módulos Sistema





Módul-oFuncionalidad:
---|---|---|
Catálogo productos|variantes color+talla|Carro-compras interactivoSistema autenticaci ón JWTSistema créditocobranzaControl inventario,movimientosDashboard anal ytics reportes!Punto venta POSGestión proveedorescom-prasDescuentos promocionesDevoluciones garantíaMulti-usuario rolespermisos!

----

📈 Estado Actual Proyecto




ComponenteEstadoNotas:|Backe nd API Establecido listopara producciónFro ntEnd Establecidobuild exitosoBase Datos Migradoa Post-gre SQLImágenes HíbridoCloudin ary+L ocalStorageSeguridadCompletaautenti caclónJWTCORSRateLimiting!


----

🗺️ Roadmap






Implementarpagos StripeMercad oPagoNotificaciones pushApp móvil ReactNativeDashboard tiempo real WebSocketsMultitienda multiinventario!


----Licencia ISCLicense ©2024 AdiEstilo sAutor Desarrolladopor Alejandro Piedrahita @Ale-jostone ⭐ Daleestrell al proyecto si te fue útil!
