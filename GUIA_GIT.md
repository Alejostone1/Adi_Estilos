# Guía para hacer Commit a GitHub

## Prerrequisitos
- Tener Git instalado
- Tener GitHub CLI instalado (gh)

## Pasos para hacer Commit

### 1. Verificar estado del repositorio
```
bash
git status
```

### 2. Ver qué archivos han cambiado
```
bash
git diff --stat
```

### 3. Agregar todos los cambios al staging
```
bash
git add .
```

### 4. Hacer commit con un mensaje
```
bash
git commit -m "feat: Actualización de configuración Cloudinary y mejoras"
```

### 5. Hacer push a GitHub
```
bash
git push origin main
```

---

## Comandos útiles

### Ver historial de commits
```
bash
git log --oneline -10
```

### Crear una nueva rama
```
bash
git checkout -b nombre-rama
```

### Cambiar de rama
```
bash
git checkout main
```

### Ver diferencias específicas
```
bash
git diff archivo.js
```

### Deshacer cambios locales
```
bash
git checkout -- .
```

---

## Notas Importantes

⚠️ **NO incluir en el commit:**
- Archivos .env (contienen contraseñas)
- node_modules/
- Carpetas de uploads/
- Archivos grandes binarios

✅ **Sí incluir:**
- Código fuente
- Configuración (excepto .env)
- Documentación
- Scripts

---

## Si tienes conflictos de merge

1. Ver los conflictos:
```
bash
git status
```

2. Editar los archivos en conflicto

3. Agregar los archivos resueltos:
```
bash
git add .
```

4. Completar el merge:
```
bash
git commit -m "Merge: Resolución de conflictos"
```

5. Hacer push:
```
bash
git push origin main
