# Guía Completa de Git para ADI Estilos

## 📋 TABLA DE CONTENIDOS
1. [Configuración Inicial](#configuración-inicial)
2. [Comandos Básicos](#comandos-básicos)
3. [Comandos de Ramas](#comandos-de-ramas)
4. [Comandos de Historia](#comandos-de-historia)
5. [Resolver Conflictos](#resolver-conflictos)
6. [Comandos Avanzados](#comandos-avanzados)
7. [Errores Comunes](#errores-comunes)

---

## 1. CONFIGURACIÓN INICIAL

### Verificar instalación de Git
```
bash
git --version
```

### Configurar usuario (importante para commits)
```
bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### Ver configuración actual
```
bash
git config --list
```

### Inicializar un repositorio nuevo
```
bash
git init
```

### Clonar un repositorio existente
```
bash
git clone https://github.com/Alejostone1/Adi_Estilos.git
```

---

## 2. COMANDOS BÁSICOS

### Ver estado del repositorio
```bash
git status
```
Muestra qué archivos han cambiado, cuáles están en staging, etc.

### Ver diferencias de archivos modificados
```
bash
# Ver todos los cambios
git diff

# Ver cambios de un archivo específico
git diff archivo.js

# Ver cambios staged (listos para commit)
git diff --staged
```

### Agregar archivos al staging

```
bash
# Agregar todos los archivos
git add .

# Agregar un archivo específico
git add nombre_del_archivo.js

# Agregar todos los archivos de una carpeta
git add carpeta/

# Agregar archivos por extensión
git add *.js

# Agregar todos los archivos modificados y eliminados
git add -A
```

### Hacer commit

```
bash
# Commit básico
git commit -m "Mensaje del commit"

# Commit con descripción detallada
git commit -m "Título del cambio" -m "Descripción larga del cambio"

# Commit agregando y mensando en un paso
git commit -am "Cambio rápido"  # ⚠️ Solo funciona para archivos ya rastreados
```

### Push a GitHub

```
bash
# Push al branch principal
git push origin main

# Push a otra rama
git push origin nombre-rama

# Push forzoso (usar con precaución)
git push -f origin main
```

### Pull desde GitHub

```
bash
# Pull básico
git pull origin main

# Pull con rebase
git pull --rebase origin main
```

---

## 3. COMANDOS DE RAMAS

### Listar ramas

```
bash
# Ver ramas locales
git branch

# Ver todas las ramas (locales y remotas)
git branch -a

# Ver ramas remotas
git branch -r
```

### Crear rama

```
bash
# Crear rama y cambiarse a ella
git checkout -b nombre-rama

# Crear rama desde otra rama específica
git checkout -b nombre-rama origin/rama-base
```

### Cambiar de rama

```
bash
# Cambiar a una rama existente
git checkout nombre-rama

# Cambiar a la rama principal
git checkout main
```

### Eliminar rama

```
bash
# Eliminar rama local
git branch -d nombre-rama

# Eliminar rama local (forzado)
git branch -D nombre-rama

# Eliminar rama remota
git push origin --delete nombre-rama
```

### Fusionar ramas

```
bash
# Primero cambia a la rama destino
git checkout main

# Fusiona la rama2 en main
git merge rama2

# Fusionar sin fast-forward (mantiene historia)
git merge --no-ff rama2
```

---

## 4. COMANDOS DE HISTORIA

### Ver historial de commits

```
bash
# Ver historial completo
git log

# Ver últimos 5 commits
git log -5

# Ver historial en una línea
git log --oneline

# Ver historial con gráfico
git log --graph --oneline

# Ver cambios de un archivo específico
git log nombre_archivo.js

# Ver diferencia de un commit específico
git show codigo_commit
```

### Deshacer cambios

```
bash
# Deshacer cambios en archivo (antes de hacer commit)
git checkout -- archivo.js

# Deshacer todos los cambios locales
git checkout -- .

# Deshacer el último commit (mantiene cambios en staging)
git reset --soft HEAD~1

# Deshacer el último commit (mantiene cambios locales)
git reset --mixed HEAD~1

# Deshacer todo completamente
git reset --hard HEAD~1

# Deshacer cambios de un archivo específico
git restore archivo.js

# Quitar archivo del staging
git restore --staged archivo.js
```

### Ver quién cambió qué

```
bash
# Ver historial de cambios de un archivo
git blame archivo.js

# Buscar en el historial
git log --all --grep="texto a buscar"
```

---

## 5. RESOLVER CONFLICTOS

### Cuándo ocurren conflictos
Cuando dos personas modifican la misma línea de un archivo y Git no puede fusionar automáticamente.

### Pasos para resolver

#### Paso 1: Ver qué archivos tienen conflicto
```
bash
git status
```

#### Paso 2: Editar el archivo con conflicto
Busca en el archivo los marcadores:
```
<<<<<<< HEAD
Código de tu rama actual
=======
Código de la otra rama
>>>>>>> código_del_commit
```

#### Paso 3: Elegir qué código mantener
- Elimina los marcadores `<<<<<<<`, `=======`, `>>>>>>>`
- Mantén el código correcto o mezcla ambos manualmente

#### Paso 4: Marcar como resuelto
```
bash
git add archivo_resuelto.js
```

#### Paso 5: Completar el merge
```
bash
git commit -m "Merge: Resolución de conflictos"
```

### Opciones rápidas para resolver

```
bash
# Aceptar TU versión (la local)
git checkout --ours archivo.js

# Aceptar la otra versión (la remota)
git checkout --theirs archivo.js
```

---

## 6. COMANDOS AVANZADOS

### Stash (guardar cambios temporalmente)

```
bash
# Guardar cambios temporalmente
git stash

# Guardar con mensaje
git stash save "Trabajo en progreso"

# Ver lista de stashes
git stash list

# Recuperar último stash
git stash pop

# Eliminar stash
git stash drop
```

### Etiquetar versiones

```
bash
# Crear etiqueta
git tag v1.0.0

# Crear etiqueta con anotación
git tag -a v1.0.0 -m "Versión 1.0.0"

# Subir etiquetas a GitHub
git push origin --tags
```

### Trabajar con remotos

```
bash
# Ver remotos configurados
git remote -v

# Agregar remoto
git remote add origin https://github.com/usuario/repo.git

# Eliminar remoto
git remote remove origin

# Cambiar URL del remoto
git remote set-url origin nueva_url.git
```

### Rebase (reescribir historia)

```
bash
# Aplicar commits de otra rama encima de la actual
git checkout rama1
git rebase main

# Rebase interactivo (squash, editar commits)
git rebase -i HEAD~3
```

---

## 7. ERRORES COMUNES

### Error: "Everything up-to-date"
```
bash
# Ya no hay cambios para subir
# Todos los cambios ya están en GitHub
```

### Error: "Permission denied (publickey)"
```
bash
# Configurar clave SSH
# O usar HTTPS en lugar de SSH
git remote set-url origin https://github.com/usuario/repo.git
```

### Error: "Merge conflict"
```
bash
# Seguir pasos de la sección "Resolver Conflictos"
```

### Error: "Failed to push some refs"
```
bash
# Hacer pull primero
git pull origin main --allow-unrelated-histories
git push origin main
```

### Error: "detached HEAD"
```
bash
# Volver a una rama
git checkout main
```

---

## FLUJO DE TRABAJO RECOMENDADO

### Flujo básico para hacer cambios

```
bash
# 1. Actualizar tu repositorio local
git pull origin main

# 2. Crear una rama para tu cambio
git checkout -b mi-nuevo-cambio

# 3. Hacer tus cambios en el código...

# 4. Verificar qué cambió
git status
git diff

# 5. Agregar cambios
git add .

# 6. Hacer commit
git commit -m "feat: Descripción del cambio"

# 7. Subir a GitHub
git push origin mi-nuevo-cambio

# 8. (Opcional) Crear Pull Request desde GitHub
```

### Flujo para actualizar desde GitHub (sin conflictos)

```
bash
# 1. Guardar cambios locales si hay
git add .
git commit -m "Work in progress"

# 2. Traer cambios de GitHub
git pull origin main

# 3. Continuar trabajando...
```

---

## COMANDOS RÁPIDOS (CHEAT SHEET)

| Acción | Comando |
|--------|---------|
| Estado | `git status` |
| Agregar todo | `git add .` |
| Commit | `git commit -m "mensaje"` |
| Push | `git push origin main` |
| Pull | `git pull origin main` |
| Nueva rama | `git checkout -b nombre` |
| Ver ramas | `git branch` |
| Cambiar rama | `git checkout nombre` |
| Historial | `git log --oneline` |
| Diferencias | `git diff` |
| Deshacer | `git checkout -- .` |

---

## NOTAS IMPORTANTES

### ⚠️ NUNCA hacer:
- No hacer `git push -f` en main
- No incluir archivos .env en commits
- No hacer commit de node_modules/
- No hacer commit de contraseñas o API keys

### ✅ SIEMPRE hacer:
- Hacer `git pull` antes de empezar a trabajar
- Escribir mensajes de commit claros
- Revisar con `git status` antes de commit

---

## RECURSOS ADICIONALES

- [Documentación oficial de Git](https://git-scm.com/doc)
- [GitHub Docs](https://docs.github.com/es)
- [Interactive Git Tutorial](https://learngitbranching.js.org/)
