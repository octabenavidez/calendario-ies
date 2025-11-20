# 📅 Calendario Académico

Aplicación React + TailwindCSS para visualizar eventos académicos (evaluaciones, TPs, tareas) en un calendario mensual interactivo. Los eventos se cargan dinámicamente desde Google Sheets con fallback a datos estáticos.

## 🚀 Características

- ✅ Visualización del mes actual dinámicamente
- ✅ Calendario en formato matriz de 7 columnas
- ✅ **Integración con Google Sheets** - Carga eventos desde una hoja de cálculo pública
- ✅ **Sistema de filtros** - Filtra por tipo de evento y materia
- ✅ **URLs compartibles** - Comparte enlaces con filtros y mes específico
- ✅ **Navegación por gestos** - Soporte para swipe en dispositivos móviles
- ✅ **Vista modo lista** - Alternativa al calendario mensual con eventos próximos en formato lista cronológica
- ✅ Eventos académicos destacados por tipo:
  - 🔴 **Evaluación** (rojo)
  - 🔵 **TP** (azul)
  - 🟢 **Tarea** (verde)
- ✅ Tooltip informativo al hacer hover sobre días con eventos
- ✅ Resaltado del día actual
- ✅ Navegación entre meses con botones
- ✅ Diseño responsive y limpio tipo dashboard académico
- ✅ Fallback automático a eventos estáticos si Google Sheets no está disponible

## 📦 Tecnologías

- **React 18** - Biblioteca de UI
- **Vite** - Build tool y dev server
- **TailwindCSS** - Framework de estilos
- **date-fns** - Manipulación de fechas
- **lucide-react** - Iconos SVG optimizados

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
│   │   ├── Calendar/
│   │   │   ├── Calendar/
│   │   │   ├── Calendar.jsx      # Componente principal del calendario
│   │   │   ├── DayCell.jsx       # Celda individual del calendario
│   │   │   ├── FilterBar.jsx     # Barra de filtros por tipo y materia
│   │   │   └── ListView.jsx      # Vista de lista de eventos próximos
│   │   └── GitHubLink.jsx        # Enlace al perfil de GitHub
│   ├── shared-components/
│   │   └── molecules/
│   │       ├── Modal.jsx         # Componente modal reutilizable
│   │       └── Tooltip.jsx       # Componente tooltip reutilizable
│   ├── hooks/
│   │   └── useGoogleSheetEvents.js  # Hook para cargar eventos desde Google Sheets
│   ├── services/
│   │   ├── googleSheets.js       # Servicio para obtener datos de Google Sheets
│   │   └── GOOGLE_SHEET_FORMAT.md  # Documentación del formato del Google Sheet
│   ├── data/
│   │   └── events.js             # Datos de eventos estáticos (fallback)
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

Los eventos pueden venir de Google Sheets o del archivo estático `src/data/events.js`. La estructura es:

```javascript
{
  date: "2025-01-15",              // Formato: YYYY-MM-DD (requerido)
  title: "Evaluación Matemática I", // Título del evento (requerido)
  type: "evaluación",              // Tipo: evaluación | tp | tarea (requerido)
  subject: "Matemática I",         // Materia (opcional)
  description: "Descripción..."    // Descripción detallada (opcional)
}
```

### Campos Requeridos

- `date`: Fecha en formato `YYYY-MM-DD`
- `title`: Título del evento
- `type`: Tipo de evento (`evaluación`, `tp`, o `tarea`)

### Campos Opcionales

- `subject`: Nombre de la materia
- `description`: Descripción detallada del evento

## 🔗 Integración con Google Sheets

El proyecto carga eventos dinámicamente desde un Google Sheet público. Si la carga falla, automáticamente usa los eventos estáticos como respaldo.

### Configurar Google Sheet

1. **Crear el Google Sheet** con las siguientes columnas:

   - `fecha` o `date` (requerido): Fecha en formato `YYYY-MM-DD`, `DD/MM/YYYY` o `DD-MM-YYYY`
   - `titulo` o `title` (requerido): Título del evento
   - `tipo` o `type` (requerido): Tipo de evento (`evaluación`, `tp`, `tarea`)
   - `materia` o `subject` (opcional): Nombre de la materia
   - `descripcion` o `description` (opcional): Descripción del evento

2. **Publicar el Sheet**:

   - Ve a `Archivo` → `Compartir` → `Publicar en la web`
   - Selecciona la hoja que quieres publicar
   - Elige formato `CSV` o deja el formato por defecto

3. **Configurar el ID del Sheet**:
   - Copia el ID del sheet de la URL
   - Actualiza `GOOGLE_SHEET_ID` en `src/services/googleSheets.js`

Para más detalles sobre el formato, consulta `src/services/GOOGLE_SHEET_FORMAT.md`.

## 🎨 Personalización

### Agregar más eventos

**Opción 1: Usar Google Sheets (recomendado)**

- Agrega eventos directamente en tu Google Sheet
- Los cambios se reflejarán automáticamente

**Opción 2: Usar datos estáticos**

- Edita el archivo `src/data/events.js` y agrega nuevos objetos al array `academicEvents`

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

### Compartir URLs con filtros

El calendario soporta URLs con parámetros para compartir vistas específicas:

- `?month=2025-01` - Navega a un mes específico
- `?type=evaluación` - Filtra por tipo de evento
- `?subject=Matemática I` - Filtra por materia
- `?month=2025-01&type=tp&subject=Algoritmos` - Combina múltiples filtros

Usa el botón "Copiar enlace" en el header del calendario para copiar la URL actual con todos los filtros aplicados.

## 🎯 Uso de Filtros

El calendario incluye un sistema de filtros para facilitar la visualización de eventos específicos:

### Filtrar por Tipo de Evento

- Haz clic en los botones de tipo: **Todos**, **Evaluación**, **TP**, o **Tarea**
- El calendario mostrará solo los eventos del tipo seleccionado

### Filtrar por Materia

- Usa el selector desplegable de "Materia" para filtrar por una materia específica
- Las materias disponibles se generan automáticamente desde los eventos cargados

### Combinar Filtros

- Puedes combinar filtros de tipo y materia para una vista más específica
- Usa el botón "Limpiar filtros" para restablecer todos los filtros

### Navegación por Gestos (Móvil)

- Desliza hacia la izquierda para avanzar al mes siguiente
- Desliza hacia la derecha para retroceder al mes anterior
- Los gestos solo funcionan con movimiento horizontal (no interfieren con el scroll vertical)

### Vista Modo Lista

El calendario incluye una vista alternativa en formato lista que muestra todos los eventos próximos de forma cronológica:

**Características:**
- Muestra solo eventos futuros (a partir de hoy)
- Ordenamiento cronológico (más próximos primero o más lejanos primero)
- Indicadores de fecha relativa ("Hoy", "Mañana", "En X días")
- Descripciones expandibles/colapsables
- Respeta los filtros activos (tipo y materia)
- Diseño optimizado para dispositivos móviles con scroll vertical

**Cómo usar:**
- Haz clic en el botón "Lista" en el header del calendario para cambiar a vista lista
- Usa el botón "Calendario" para volver a la vista mensual
- En vista lista, puedes ordenar los eventos usando el botón de ordenamiento
- Haz clic en cualquier evento para expandir/colapsar su descripción

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
**https://octabenavidez.github.io/calendario-ies**

## 📄 Licencia

Este proyecto es de código abierto y está disponible para uso educativo.
