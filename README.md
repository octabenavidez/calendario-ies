# 📅 Calendario Académico

Aplicación React + TailwindCSS para visualizar eventos académicos (evaluaciones, TPs, tareas) en un calendario mensual interactivo.

## 🚀 Características

- ✅ Visualización del mes actual dinámicamente
- ✅ Calendario en formato matriz de 7 columnas
- ✅ Eventos académicos destacados por tipo:
  - 🔴 **Evaluación** (rojo)
  - 🔵 **TP** (azul)
  - 🟢 **Tarea** (verde)
- ✅ Tooltip informativo al hacer hover sobre días con eventos
- ✅ Resaltado del día actual
- ✅ Navegación entre meses
- ✅ Diseño limpio tipo dashboard académico

## 📦 Tecnologías

- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **TailwindCSS** - Framework de estilos
- **date-fns** - Manipulación de fechas

## 🛠️ Instalación

1. Instalar dependencias:

```bash
npm install
```

## ▶️ Ejecución

### Modo desarrollo

```bash
npm run dev
```

La aplicación se abrirá en `http://localhost:5173`

### Build de producción

```bash
npm run build
```

### Preview del build

```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── components/
│   │   └── Calendar/
│   │       ├── Calendar.jsx      # Componente principal
│   │       └── DayCell.jsx       # Celda individual del calendario
│   ├── shared-components/
│   │   └── molecules/
│   │       └── Tooltip.jsx       # Componente tooltip reutilizable
│   ├── data/
│   │   └── events.js             # Datos de eventos académicos
│   ├── styles/
│   │   └── globals.css           # Estilos globales
│   ├── App.jsx                   # Componente raíz
│   └── main.jsx                  # Entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 📝 Estructura de Eventos

Los eventos se definen en `src/data/events.js` con la siguiente estructura:

```javascript
{
  fecha: "2025-01-15",        // Formato: YYYY-MM-DD
  titulo: "Evaluación Matemática I",
  tipo: "evaluación"           // evaluación | tp | tarea
}
```

## 🎨 Personalización

### Agregar más eventos

Edita el archivo `src/data/events.js` y agrega nuevos objetos al array `eventosAcademicos`.

### Cambiar colores de eventos

Modifica la función `getEventColor` en `src/components/Calendar/DayCell.jsx`:

```javascript
const getEventColor = (tipo) => {
  switch (tipo) {
    case "evaluación":
      return "bg-red-500"; // Cambia el color aquí
    case "tp":
      return "bg-blue-500";
    case "tarea":
      return "bg-green-500";
    default:
      return "bg-gray-500";
  }
};
```

## 🌐 Despliegue en GitHub Pages

El proyecto está configurado para desplegarse automáticamente en GitHub Pages.

### Despliegue automático

Cada vez que hagas push a la rama `main`, GitHub Actions construirá y desplegará automáticamente el proyecto.

### Despliegue manual

Si prefieres desplegar manualmente:

```bash
npm run deploy
```

Esto construirá el proyecto y lo subirá a la rama `gh-pages` de GitHub.

### URL del proyecto

Una vez desplegado, el proyecto estará disponible en:
**https://octabenavidez.github.io/calendarioies**

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.
