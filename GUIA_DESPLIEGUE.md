# 🚀 GUÍA COMPLETA DE DESPLIEGUE - ADI ESTILOS

## ¿Qué es desplegar?
Desplegar (o "deployar") es publicar tu aplicación en internet para que todos puedan访问la desde cualquier lugar.

---

## 📋 PRE-REQUISITOS

Antes de empezar, necesitas tener:

| Requisito | ¿Qué es? | Link |
|-----------|----------|------|
| GitHub | Para guardar tu código | [github.com](https://github.com) |
| Render | Para el backend (servidor) | [render.com](https://render.com) |
| Vercel | Para el frontend (interfaz) | [vercel.com](https://vercel.com) |
| PostgreSQL | Base de datos en la nube | Se crea en Render |
| Cloudinary | Para guardar imágenes | [cloudinary.com](https://cloudinary.com) |
| Dominio | Tu dominio (adiestilos.top) | Donde compraste el dominio |

---

## 🎯 FASE 1: PREPARAR EL CÓDIGO

### Paso 1: Subir código a GitHub

1. **Crear repositorio nuevo:**
   - Ve a [github.com](https://github.com)
   - Click en **"New repository"** (botón verde)
   - Nombre: `adiestilos`
   - Click en **"Create repository"**

2. **Subir archivos:**

```
bash
   # En tu computadora, abre la terminal
   cd Desktop/WEB_ADI_v1

   git init
   git add .
   git commit -m "Mi primera versión"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/adiestilos.git
   git push -u origin main

```

---

## 🖥️ FASE 2: DESPLEGAR BACKEND (RENDER)

### Paso 2: Crear Base de Datos PostgreSQL

1. **Entrar a Render:**
   - Ve a [dashboard.render.com](https://dashboard.render.com)
   - Inicia sesión con tu cuenta

2. **Crear Base de Datos:**
   - Click en **"New +"** (esquina superior izquierda)
   - Click en **"PostgreSQL"**

3. **Configurar:**
   - **Name:** `adiestilos`
   - **Database:** `adiestilos`
   - **User:** `adiestilos`
   - **Plan:** Free (o el que prefieras)
   - Click en **"Create Database"**

4. **⚠️ IMPORTANTE - Guardar estos datos:**
   - Después de crear, verás una sección **"Internal Database URL"**
   - Click en el botón de copiar al lado
   - **Guarda este enlace** en un bloc de notas (lo necesitarás después)
   -Formato: `postgres://...`

### Paso 3: Crear Servicio Web (Backend)

1. **Crear servicio:**
   - Click en **"New +"**
   - Click en **"Web Service"**
   - Busca tu repositorio `adiestilos` y selecciónalo

2. **Configuración básica:**
   - **Name:** `adiestilos-backend`
   - **Root Directory:** `Backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`

3. **Configuración avanzada:**
   - **Instance Type:** Free (o el que prefieras)

4. **Click en "Create Web Service"**

### Paso 4: Configurar Variables de Entorno (Backend)

1. **Una vez creado el servicio:**
   - Click en tu servicio `adiestilos-backend`
   - Click en la pestaña **"Environment"**

2. **Agregar estas variables (una por una):**

   | Variable | Valor |
   |----------|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `10000` |
   | `DATABASE_URL` | (Pega la URL de tu PostgreSQL) |
   | `CORS_ORIGIN` | `https://tu-dominio.com,https://www.tu-dominio.com` |
   | `JWT_SECRET` | (生成一个密钥,见下文) |
   | `JWT_EXPIRES_IN` | `24h` |
   | `JWT_REFRESH_EXPIRES_IN` | `30d` |
   | `STORAGE_MODE` | `hybrid` |
   | `CLOUDINARY_CLOUD_NAME` | `dm5qezkoc` |
   | `CLOUDINARY_API_KEY` | (Tu API Key de Cloudinary) |
   | `CLOUDINARY_API_SECRET` | (Tu API Secret de Cloudinary) |
   | `USE_CLOUDINARY` | `true` |
   | `MAX_IMAGE_SIZE` | `5242880` |
   | `UPLOAD_PATH` | `/tmp/uploads` |
   | `BASE_URL` | `https://tu-backend.onrender.com` |
   | `RATE_LIMIT_WINDOW_MS` | `900000` |
   | `RATE_LIMIT_MAX_REQUESTS` | `100` |
   | `LOG_LEVEL` | `error` |

3. **Cómo generar JWT_SECRET:**
   - Ve a [generate-random.me/crypto](https://generate-random.org/crypto-random-string)
   - O en tu terminal: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
   - Copia el resultado y pégalo como `JWT_SECRET`

4. **Click en "Save Changes"**

5. **Esperar a que编译 termine:**
   - Verás logs en la pestaña **"Logs"**
   - Cuando diga **"Deployed!"** ya está listo

6. **⚠️ COPIAR LA URL DE TU BACKEND:**
   - En la pestaña **"Settings"**, copia la **"Service URL"**
   - Ejemplo: `https://adiestilos-backend.onrender.com`
   - **Guarda esta URL** - la necesitarás para el frontend

---

## 🌐 FASE 3: DESPLEGAR FRONTEND (VERCEL)

### Paso 5: Configurar Frontend

1. **Editar archivo de producción:**
   - Abre el archivo `Frontend/.env.production`

2. **Cambiar las URLs:**

```
   VITE_API_URL=https://TU-BACKEND.onrender.com/api
   VITE_FILES_URL=https://TU-BACKEND.onrender.com

```

   Reemplaza `TU-BACKEND.onrender.com` con tu URL real de Render

3. **Guardar y hacer commit:**

```
bash
   git add .
   git commit -m "Actualizado para producción"
   git push

```

### Paso 6: Desplegar en Vercel

1. **Entrar a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Inicia sesión con tu cuenta de GitHub

2. **Importar proyecto:**
   - Click en **"Add New..."** → **"Project"**
   - Busca tu repositorio `adiestilos`
   - Click en **"Import"**

3. **Configurar:**
   - **Framework Preset:** Vite
   - **Root Directory:** `Frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`

4. **Variables de entorno:**
   - Click en **"Environment Variables"**
   - Agrega:

```
     VITE_API_URL=https://TU-BACKEND.onrender.com/api
     VITE_FILES_URL=https://TU-BACKEND.onrender.com

```

5. **Click en "Deploy"**

6. **Esperar a que termine:**
   - Verás progreso en pantalla
   - Cuando termine, verás una URL como: `https://adiestilos.vercel.app`

---

## 🔧 FASE 4: CONFIGURAR CLOUDINARY

### Paso 7: Obtener credenciales de Cloudinary

1. **Entrar a Cloudinary:**
   - Ve a [cloudinary.com](https://cloudinary.com)
   - Inicia sesión o regístrate

2. **Copiar credenciales:**
   - En el dashboard, busca **"Cloud Name"**: `dm5qezkoc`
   - Click en **"Settings"** (ícono de engranaje)
   - Click en **"API Keys"**
   - Copia **"API Key"** y **"API Secret"**

3. **Poner en Render:**
   - Ve a tu servicio en Render
   - Environment
   - Actualiza:
     - `CLOUDINARY_API_KEY` = tu API Key
     - `CLOUDINARY_API_SECRET` = tu API Secret

---

## 🔄 FASE 5: CONECTAR DOMINIO (OPCIONAL)

### Paso 8: Usar tu dominio (adiestilos.top)

**Si tienes tu propio dominio:**

**En Vercel:**
1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** → **"Domains"**
3. Escribe tu dominio: `adiestilos.top`
4. Sigue las instrucciones para agregar registros DNS

**En Render:**
1. Ve a tu servicio
2. Click en **"Settings"** → **"Custom Domains"**
3. Agrega tu dominio

---

## ✅ CHECKLIST FINAL

Antes de terminar, verifica:

- [ ] Backend desplegado en Render
- [ ] Base de datos PostgreSQL creada
- [ ] Variables de entorno configuradas en Render
- [ ] JWT_SECRET generado y configurado
- [ ] Cloudinary configurado
- [ ] Frontend desplegado en Vercel
- [ ] URLs actualizadas en .env.production
- [ ] Dominio conectado (si tienes uno)

---

## 🔍 CÓMO VERIFICAR QUE TODO FUNCIONA

### Probar Backend:
1. Copia tu URL de Render: `https://adiestilos-backend.onrender.com`
2. Abre esa URL en tu navegador
3. Deberías ver un mensaje o JSON

### Probar Frontend:
1. Copia tu URL de Vercel
2. Abre en tu navegador
3. La página debe cargar correctamente

### Probar Imágenes:
1. Sube una imagen en el panel de admin
2. Verifica que se guarde en Cloudinary
3. Verifica que también exista respaldo local

---

## 🚨 PROBLEMAS COMUNES Y SOLUCIONES

### Error: "Database connection failed"
- Verifica que `DATABASE_URL` esté bien copiada
- Asegúrate que la base de datos esté creada

### Error: "CORS policy"
- Verifica que `CORS_ORIGIN` tenga tu dominio exacto

### Error: "JWT_SECRET is required"
- Genera un nuevo JWT_SECRET
- Pégalo en las variables de entorno de Render

### Imágenes no se cargan
- Verifica `STORAGE_MODE=hybrid`
- Verifica que Cloudinary esté configurado
- Revisa los logs en Render

### Cambios no se ven
- Haz nuevo commit y push
- En Vercel, los cambios se despliegan automáticamente

---

## 📞 AYUDA EXTRA

### ¿Qué hacer si algo sale mal?

1. **Revisa los logs:**
   - En Render: pestaña **"Logs"**
   - En Vercel: pestaña **"Logs"**

2. **Los errores más comunes están arriba** en esta guía

3. **Verifica las variables de entorno:**
   - ¿Están todas configuradas?
   - ¿Los valores son correctos?

---

## 🎉 ¡FELICIDADES!

Si llegaste hasta aquí, ¡tu aplicación está desplegada!

- **Backend:** `https://adiestilos-backend.onrender.com`
- **Frontend:** `https://adiestilos.vercel.app`
- **Admin:** `https://adiestilos.vercel.app/admin`

---

## 📝 NOTAS IMPORTANTES

1. **Render gratis:** El plan gratuito se "duerme" después de 15 minutos de inactividad. La primera访问puede tardar unos segundos.

2. **Cloudinary gratis:** El plan gratuito tiene límites. Asegúrate de no excederlos.

3. **PostgreSQL gratis:** El plan gratuito también se "duerme". Funciona igual pero puede tardar en despertar.

4. **Imágenes:** El sistema guardará en Cloudinary (principal) y también en el servidor local (respaldo).

5. **Seguridad:** Nunca compartas tu `JWT_SECRET` o claves de API.

---

## 🔄 ACTUALIZAR EN EL FUTURO

Para actualizar tu aplicación:

1. Haz cambios en tu código local
2. Commit y push:

```
bash
   git add .
   git commit -m "Nueva actualización"
   git push

```
3. Vercel y Render se actualizan automáticamente

---

**¿Necesitas ayuda? Revisa los logs en cada plataforma o consulta esta guía novamente.**
