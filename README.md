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

*English: Generative 3D peony — bud → bloom → wilt loop, three render modes (ASCII/dots/pixels), glitch fx, mouse tracking. Single HTML file, p5.js only.*
