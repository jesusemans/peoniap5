# 🌸 Peonía 3D — Generative ASCII Floral Art

**[Ver en vivo / Live Demo](https://jesusemans.github.io/peoniap5/)**

---

## Español

Animación generativa de una peonía en 3D construida con **p5.js**. La flor se renderiza en tiempo real sobre un buffer off-screen y se proyecta al canvas mediante tres modos visuales que transicionan automáticamente.

### Características

- **Flor 3D real** — Pétalos, sépalos, tallo, hojas y estambres posicionados en espacio 3D con rotación en tres ejes (Y, X, Z), perspectiva y z-sorting (algoritmo del pintor)
- **Ciclo de vida completo** — Capullo → florecimiento → fase interactiva → marchitamiento → siguiente variante
- **3 modos de renderizado** — ASCII, puntos y píxeles con transiciones fluidas entre ellos
- **Rotación automática + seguimiento del mouse** — La flor gira suavemente y reacciona al movimiento del cursor
- **Efectos glitch** — Desplazamiento horizontal y aberración cromática aplicados solo sobre la flor
- **3 variantes de color** — Rosa clásico, rosa pálido y fucsia profundo, cada una con distinta cantidad de pétalos y capas
- **Pantalla de carga** — Barra de progreso mientras se precalientan los primeros frames
- **Sin dependencias extras** — Solo p5.js 1.9.0 vía CDN, un único archivo HTML

### Controles

| Tecla | Acción |
|-------|--------|
| `F` | Pantalla completa |
| `G` | Disparar glitch manual |
| Click | Disparar glitch |

### Cómo usar

Abre `index.html` en cualquier navegador moderno. No necesita servidor ni instalación.

---

## English

Generative 3D peony animation built with **p5.js**. The flower is rendered in real-time onto an off-screen buffer and projected to the canvas through three visual modes that transition automatically.

### Features

- **Real 3D flower** — Petals, sepals, stem, leaves and stamens positioned in 3D space with three-axis rotation (Y, X, Z), perspective projection and z-sorted painter's algorithm
- **Full lifecycle** — Bud → bloom → interactive phase → wilting → next variant
- **3 render modes** — ASCII, dots and pixels with smooth transitions between them
- **Auto-rotation + mouse tracking** — The flower rotates gently and reacts to cursor movement
- **Glitch effects** — Horizontal displacement and chromatic aberration applied only on the flower area
- **3 color variants** — Classic pink, pale rose and deep fuchsia, each with different petal counts and layer configurations
- **Loading screen** — Progress bar while pre-warming the first frames
- **Zero extra dependencies** — Just p5.js 1.9.0 via CDN, a single HTML file

### Controls

| Key | Action |
|-----|--------|
| `F` | Toggle fullscreen |
| `G` | Trigger manual glitch |
| Click | Trigger glitch |

### How to use

Open `index.html` in any modern browser. No server or installation required.

---

### Tech Stack

- **p5.js 1.9.0** — Creative coding framework
- **Canvas 2D API** — Native `drawingContext` for fast ASCII text rendering
- **Vanilla JS** — No build tools, no frameworks

### Estructura / Structure

```
peoniap5/
└── index.html    ← Todo el proyecto en un solo archivo / Entire project in one file
```

---

*Hecho con código y flores / Made with code and flowers* 🌺
