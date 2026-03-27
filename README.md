# EBAU Tracker

Una aplicación web para preparar los exámenes EBAU mediante el seguimiento de ejercicios y simulacros con análisis automático de patrones.

## Características

- 📊 Seguimiento de ejercicios por bloques oficiales EBAU
- 🎯 Análisis de precisión y patrones de error
- 📈 Priorización adaptativa basada en confianza estadística
- 💾 Persistencia automática con localStorage
- 🌙 Diseño oscuro optimizado para concentración
- 🤖 Exportación de datos para coaching IA
- 🔄 Integración automática entre exámenes y plan diario

## Despliegue en GitHub Pages

### 1. Crear repositorio en GitHub
- Ve a [github.com/new](https://github.com/new)
- Nombre: `EBAU-Tracker` (o el que prefieras)
- Descripción: "Tracker de ejercicios para EBAU"
- Público (para acceso desde GitHub Pages)
- **No inicialices con README** (lo tenemos aquí)

### 2. Pushear el código

```bash
cd ~/Desktop/EBAU\ Tracker
git init
git add .
git commit -m "Initial commit: EBAU Tracker app"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/EBAU-Tracker.git
git push -u origin main
```

Reemplaza `TU_USUARIO` con tu usuario de GitHub.

### 3. Habilitar GitHub Pages

- Ve al repositorio en GitHub
- Settings → Pages
- Source: Deploy from a branch
- Branch: `main` / `/ (root)`
- Save

**Tu app estará disponible en:** `https://TU_USUARIO.github.io/EBAU-Tracker/`

## Desarrollo local

Abre `index.html` directamente en tu navegador. Todos los datos se guardan en localStorage del navegador.

## Estructura

- `index.html` - Interfaz principal
- `styles.css` - Estilos (tema oscuro)
- `app.js` - Lógica de la aplicación
- `README.md` - Este archivo

## Datos

Los datos se guardan automáticamente en el navegador:
- `EBAU_EXERCISES` - Ejercicios registrados
- `EBAU_EXAMS` - Simulacros realizados
- `EBAU_TARGETS` - Objetivos de nota por asignatura

Los datos persisten entre sesiones, pero son locales del navegador.
