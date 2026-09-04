# DIAGRAMAXIS

> *Un juego contra el silencio sistémico* — herramienta pedagógica del Sistema Proyectual ARPV (Angel Ramón Peña Villegas)

**DIAGRAMAXIS** es un tablero proyectual interactivo para el diseño arquitectónico: activas conceptos y artefactos desde cuatro mazos, los dispones como fichas en un canvas, tejes relaciones entre ellos y redactas un discurso proyectual — mientras un visor 3D procedural construye la masa arquitectónica de tu propuesta en tiempo real.

Pensada para estudiantes y arquitectos que quieren "jugar" a construir una propuesta proyectual con método, no solo dibujar.

## Cómo funciona

1. **Bandeja de conceptos** (izquierda): cuatro mazos — *Temas Arquitectónicos, Componentes de la Realidad, Relaciones Paralógicas y Artefactos* — con búsqueda. Un clic activa/retira la ficha del tablero.
2. **Tablero** (centro): las fichas activas se ordenan en espiral como nodos arrastrables. Conecta nodos con **hilos** (relaciones semánticas), ajusta el **peso** de cada concepto y ordena el conjunto.
3. **Visor 3D** (derecha): una masa arquitectónica procedural se genera desde los conceptos activos y sus parámetros (dimensiones, orientación, cámara, sombras, figura humana).
4. **Panel derecho**: parámetros de la ficha seleccionada, lista de hilos, **discurso** proyectual (texto ↔ grafo), reporte de **coherencia** y fichas activas.
5. **Casos de estudio**: obras maestras pre-analizadas (Villa Savoye, Termas de Vals, Casa da Música, Pabellón de Barcelona) con su grafo completo para estudiar cómo se construye un discurso proyectual.

### IA opcional

La generación de discurso y referencias puede usar IA (Gemini, OpenAI, Anthropic o Cloudflare Workers AI) con tu propia API key (BYOK) — configurable en *Ajustes*. Sin clave, el sistema funciona con un **fallback heurístico local**, así que toda la herramienta es usable sin depender de ningún servicio externo.

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18 · TypeScript · Vite 6 · Tailwind 3 |
| Diagrama | React Flow 12 (`@xyflow/react`) — nodos y aristas custom |
| 3D | three.js (geometría procedural sincronizada con el grafo) |
| Estado | zustand (store único) |
| Backend IA | Cloudflare Pages Functions (BYOK, multi-proveedor + fallback local) |

## Temas

Interfaz con **modo claro (por defecto)** y **modo oscuro**, conmutable desde el encabezado; la preferencia se guarda en el navegador. El visor 3D se adapta al tema activo.

## Desarrollo

```bash
npm install
npm run dev        # servidor local de desarrollo
npm run build      # build de producción (Vite)
npm run preview    # previsualizar el build
```

## Despliegue (Cloudflare Pages)

El proyecto incluye Pages Functions para la capa de IA (`functions/api/*`). Despliega con Wrangler:

```bash
npx wrangler pages deploy dist
```

Configuración en `wrangler.toml`. Sin las Functions la app igual funciona (modo heurístico local).

## Estructura

```
src/
├── components/
│   ├── 3d/          # Visor three.js y generación de geometría
│   ├── diagram/     # Canvas React Flow, nodos ConceptNode y aristas custom
│   └── modals/      # Relaciones, proyecto, ajustes, casos de estudio
├── store/           # useProjectStore (zustand) — estado global
└── data/            # Mazos de conceptos, casos de estudio
functions/api/       # Cloudflare Pages Functions (IA: references, discourse)
```

## Créditos

Metodología: **Sistema Proyectual ARPV** — Angel Ramón Peña Villegas.
