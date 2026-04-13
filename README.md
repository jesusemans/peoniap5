# Peonía 3D

Una peonía generativa en 3D hecha con p5.js. Un solo archivo HTML, sin dependencias.

**[Demo en vivo](https://jesusemans.github.io/peoniap5/)**

---

La flor se arma pieza por pieza en un buffer 3D (pétalos, sépalos, tallo, hojas, estambres) y se proyecta al canvas con perspectiva y z-sorting. Va rotando sola y sigue el mouse.

Tiene un ciclo de vida: arranca como capullo, florece, se queda un rato en la fase interactiva, se marchita, y arranca de nuevo con otra variante de color. Son tres variantes (rosa clásico, rosa pálido, fucsia) con distinta cantidad de pétalos.

El render va alternando entre ASCII, puntos y píxeles con transiciones dithered. De vez en cuando salta un glitch con desplazamiento y aberración cromática.

## Controles

- **F** — fullscreen
- **G** — forzar glitch
- **Click** — forzar glitch

## Stack

p5.js 1.9.0 (CDN) + Canvas 2D API nativo para el texto ASCII. Nada más.

## Uso

Abrir `index.html` en el browser. No necesita servidor.

---

## English

A generative 3D peony made with p5.js. Single HTML file, no dependencies.

**[Live demo](https://jesusemans.github.io/peoniap5/)**

The flower is built piece by piece in a 3D buffer (petals, sepals, stem, leaves, stamens) and projected onto the canvas with perspective and z-sorting. It rotates on its own and follows the mouse.

It has a lifecycle: starts as a bud, blooms, stays in an interactive phase for a bit, wilts, and starts over with a different color variant. There are three variants (classic pink, pale rose, fuchsia) each with different petal counts.

The render alternates between ASCII, dots and pixels with dithered transitions. Every now and then a glitch kicks in with displacement and chromatic aberration.

## Controls

- **F** — fullscreen
- **G** — trigger glitch
- **Click** — trigger glitch

## Stack

p5.js 1.9.0 (CDN) + native Canvas 2D API for ASCII text. That's it.

## Usage

Open `index.html` in the browser. No server needed.
