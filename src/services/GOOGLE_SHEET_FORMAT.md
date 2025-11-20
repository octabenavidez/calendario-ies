# Formato del Google Sheet

## Estructura de Columnas

El Google Sheet debe tener las siguientes columnas (los nombres son flexibles y no distinguen mayúsculas/minúsculas):

### Columnas Requeridas:

1. **Fecha** (puede llamarse: `fecha`, `date`, `fecha evento`)
   - Formato aceptado: `YYYY-MM-DD`, `DD/MM/YYYY`, `DD-MM-YYYY`
   - Ejemplo: `2025-01-15` o `15/01/2025`

2. **Título** (puede llamarse: `titulo`, `title`, `título`, `nombre`)
   - Nombre del evento
   - Ejemplo: `Evaluación Matemática I`

3. **Tipo** (puede llamarse: `tipo`, `type`, `tipo evento`)
   - Valores aceptados: `evaluación`, `tp`, `tarea`
   - Se normaliza automáticamente (sin acentos, minúsculas)

### Columnas Opcionales:

4. **Materia** (puede llamarse: `materia`, `subject`, `asignatura`)
   - Nombre de la materia
   - Ejemplo: `Matemática I`

5. **Descripción** (puede llamarse: `descripcion`, `description`, `descripción`, `detalle`)
   - Descripción detallada del evento
   - Ejemplo: `Examen parcial sobre funciones cuadráticas`

## Ejemplo de Hoja

| fecha       | titulo                    | tipo        | materia                    | descripcion                                    |
|-------------|---------------------------|-------------|----------------------------|------------------------------------------------|
| 2025-01-15  | Evaluación Matemática I   | evaluación  | Matemática I               | Examen parcial sobre funciones cuadráticas     |
| 2025-01-20  | TP Algoritmos             | tp          | Algoritmos y Estructuras   | Implementar árboles binarios de búsqueda       |
| 2025-01-25  | Tarea Programación Web    | tarea       | Programación Web           | Realizar función cuadrática de 10 ejercicios   |

## Configuración del Google Sheet

1. El sheet debe estar **publicado públicamente** para que la aplicación pueda leerlo
2. Para publicar:
   - Ve a `Archivo` → `Compartir` → `Publicar en la web`
   - Selecciona la hoja que quieres publicar
   - Elige formato `CSV` o deja el formato por defecto
   - Copia el ID del sheet de la URL

## ID del Sheet Actual

El ID del sheet está configurado en `src/services/googleSheets.js`:
```javascript
const GOOGLE_SHEET_ID = '2PACX-1vTzGJ8fZJ0jl7ivdqAYZk2YmAaOBqmjm7rA932tMkES-xqONk7vqLJXnlDjYIICAbm8A2orUW-zuhGK';
```

Para cambiar el sheet, actualiza este ID con el nuevo ID de tu Google Sheet.

