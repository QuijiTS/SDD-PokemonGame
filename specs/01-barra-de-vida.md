# SPEC 01 — Barra de vida en la escena de batalla

> **Estado:** Aprobado
> **Depende de:** ninguna
> **Fecha:** 2026-10-15
> **Objetivo:** Mostrar dos Charizard enfrentados sobre el bosque, cada uno con una barra de vida que baja al recibir daño y un estado de derrota visible al llegar a cero.

## Por qué existe este spec

El repo solo tiene assets, `spritesheet.js` con las coordenadas ya calculadas y el flujo spec-driven. No hay juego. Este spec crea la primera escena y el concepto de vida, que los specs siguientes (menú de ataques) van a usar.

## Alcance

**Entra:**

- Escena estática con el fondo del bosque (`BACKGROUNDS.fondo1`).
- Dos Charizard enfrentados: `player` a la izquierda mirando a `right` y `rival` a la derecha mirando a `left`.
- Barra de vida por Charizard, siempre visible: nombre, barra de color y texto `PS 70/100`.
- 100 PS iniciales y 10 de daño fijo por golpe.
- Animación `hurt` al recibir daño.
- Estado derrotado al llegar a 0 PS: animación `sleep`, semitransparente y texto `DERROTADO` encima.
- Controles de prueba temporales: `A` daña al Jugador y `L` daña al Rival.
- Leyenda en pantalla: `A: dañar al Jugador · L: dañar al Rival`.

**Fuera de alcance (para specs futuros):**

- Menú para elegir ataques (spec 02, reemplaza las teclas `A` y `L`).
- Movimiento de los Charizard por la pantalla.
- Que el rival decida o responda por su cuenta.
- Pantallas de inicio o de final.
- Ganador o mensaje de fin de partida.
- Reiniciar la partida.
- Guardar el progreso.
- Sonido.
- Experiencia o niveles.

## Modelo de datos

```js
// src/battle.js — un combatiente
{
  id: 'player',              // 'player' | 'rival'
  dir: 'right',              // dirección de DIRECTIONS: 'right' (player) | 'left' (rival)
  feet: { x: 240, y: 620 },  // punto de apoyo en el canvas
  maxHp: 100,
  hp: 100,
  defeated: false,
  hurtStartMs: -Infinity,    // performance.now() del último golpe
}
```

Constantes en `src/main.js`:

```js
const SCALE = 4;
const DAMAGE = 10;
const MAX_HP = 100;
const PLAYER_FEET = { x: 240, y: 620 };  // claro de pasto a la izquierda
const RIVAL_FEET = { x: 1200, y: 645 };  // camino a la derecha del puente
```

Convenciones:

- Canvas de 1376×768 (mitad de 2752×1536, misma proporción que el fondo).
- Origen arriba a la izquierda.
- Charizard se dibuja anclado por `frame.shadow`: `dx = feet.x - f.shadow.x * SCALE`, `dy = feet.y - f.shadow.y * SCALE`.
- Animación vigente: `sleep` si `defeated`; `hurt` mientras `now - hurtStartMs < CHARIZARD.hurt.totalMs`; si no, `idle`.
- Color de la barra: verde si vida > 50 %; amarillo si está entre 21 % y 50 %; rojo si es 20 % o menos.
- Ids de código en inglés (`player`, `rival`). Texto visible en español (`Jugador`, `Rival`, `PS`, `DERROTADO`).

## Plan de implementación

1. Crear `index.html` con el canvas de 1376×768 e `image-rendering: pixelated`, que carga `src/main.js` como `type="module"`. En `src/main.js`, cargar `BACKGROUNDS.fondo1.src` y dibujarlo escalado al canvas. Prueba manual: `python -m http.server 8000` y abrir `http://localhost:8000`; se ve el bosque.
2. Crear `src/render.js` con `drawBackground` y `drawCharizard(ctx, images, c, nowMs)`. Usa `getFrame` y `frameIndexAt` de `spritesheet.js` y ancla por `shadow`. En `src/main.js`, cargar las hojas `CHARIZARD.idle|hurt|sleep.src.anim` y arrancar un loop con `requestAnimationFrame`. Prueba manual: dos Charizard en `idle` mirándose en `PLAYER_FEET` y `RIVAL_FEET`.
3. Crear `src/battle.js` con `createCombatant`, `currentAnim` y `hpColor`. Agregar `drawHpBar` en `src/render.js`: Jugador arriba a la izquierda, Rival arriba a la derecha. Prueba manual: ambas barras verdes con `PS 100/100`.
4. Agregar `applyDamage(c, amount, nowMs)` en `src/battle.js`: resta, recorta a 0, guarda `hurtStartMs` y no hace nada si ya está derrotado. En `src/main.js`, escuchar `keydown` por `event.code` (`KeyA` → player, `KeyL` → rival) e ignorar `event.repeat`. Comentar en el código que son controles de prueba temporales que reemplaza el spec 02. Agregar `drawLegend`. Prueba manual: `A` baja al Jugador a `PS 90/100` y reproduce `hurt`.
5. Marcar `defeated` al llegar a 0 PS. En `src/render.js`, dibujar `sleep` con `globalAlpha` 0.5 y agregar `drawDefeatedLabel` con `DERROTADO` sobre el Charizard. Prueba manual: 10 pulsaciones de `A` dejan al Jugador derrotado.

## Criterios de aceptación

- [ ] La página carga desde `http://localhost:8000` sin errores en la consola.
- [ ] Se ve el fondo del bosque ocupando todo el canvas.
- [ ] El Jugador está a la izquierda mirando a la derecha y el Rival a la derecha mirando a la izquierda.
- [ ] Al cambiar entre `idle`, `hurt` y `sleep`, los pies de cada Charizard se mantienen en el mismo punto.
- [ ] Al cargar, ambas barras muestran `PS 100/100` en verde.
- [ ] Pulsar `A` una vez deja al Jugador en `PS 90/100`, acorta su barra y reproduce `hurt`.
- [ ] Pulsar `A` no cambia la vida del Rival.
- [ ] Con 5 pulsaciones de `A` la barra del Jugador muestra `PS 50/100` en amarillo.
- [ ] Con 8 pulsaciones de `A` la barra del Jugador muestra `PS 20/100` en rojo.
- [ ] Con 10 pulsaciones de `A` el Jugador muestra `PS 0/100`, está tumbado (`sleep`), semitransparente y con `DERROTADO` encima.
- [ ] Pulsar `A` con el Jugador derrotado no cambia nada y nunca aparecen PS negativos.
- [ ] Mantener `A` presionada un segundo resta solo 10 PS.
- [ ] Con Bloq Mayús activado, `A` y `L` funcionan igual.
- [ ] Todo lo anterior se cumple también con `L` para el Rival.
- [ ] Con el Jugador derrotado, `L` sigue dañando al Rival normalmente.
- [ ] Ambos Charizard pueden quedar derrotados a la vez y no aparece ningún mensaje de ganador.
- [ ] La leyenda `A: dañar al Jugador · L: dañar al Rival` es visible en pantalla.
- [ ] `spritesheet.js` no fue modificado.

## Decisiones

- **Sí:** coordenadas tomadas siempre de `spritesheet.js` con `getFrame` y `frameIndexAt`. Lo exigen las reglas del README.
- **No:** editar o leer completo `spritesheet.js`. Pesa ~200 KB y se regenera con `tools/gen_spritesheet.py`.
- **Sí:** anclar el dibujo por `frame.shadow`. Evita que Charizard "salte" al cambiar de animación.
- **Sí:** separar `src/battle.js` (lógica pura, sin canvas) de `src/render.js` (dibujo). La lógica de vida queda lista para el menú de ataques del spec 02.
- **Sí:** 100 PS y 10 de daño fijo. Determinista y fácil de verificar.
- **No:** daño aleatorio. Hace la prueba impredecible.
- **Sí:** teclas `A` y `L` como controles de prueba temporales. El spec 02 las reemplaza por el menú de ataques.
- **No:** click sobre el Charizard ni botones HTML. Las teclas son lo más simple para probar.
- **Sí:** detectar la tecla física con `event.code`. Funciona igual con Bloq Mayús.
- **Sí:** ignorar `event.repeat`. Una pulsación equivale a un golpe.
- **Sí:** `hurt` al recibir daño y `sleep` + transparencia + `DERROTADO` al llegar a 0. La derrota se nota claramente sin pantallas extra.
- **Sí:** colores por umbral fijo (verde > 50 %, amarillo 21–50 %, rojo ≤ 20 %). Estilo Pokémon y fácil de verificar.
- **Sí:** posiciones de los pies como constantes fijas en el código. Evita ajustes improvisados durante la implementación.
- **Sí:** la partida no termina cuando alguien es derrotado. Ganador, fin de partida y reinicio pertenecen a otra feature.
- **Sí:** ids de código en inglés y texto visible en español.
- **No:** bundler ni dependencias. Módulos ES nativos servidos con `python -m http.server`.
- **Nota:** las preguntas de definición se resolvieron en la sesión de planificación previa a este spec.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| Los módulos ES no cargan abriendo `index.html` con `file://` | Servir siempre con `python -m http.server 8000`. |
| `sleep` solo tiene una fila en la hoja y mira hacia abajo | `getFrame` resuelve cualquier dirección a esa fila. Se acepta que el Charizard derrotado no mire al rival. |
| Las hojas de sprites se ven borrosas al escalar ×4 | `image-rendering: pixelated` en el canvas e `imageSmoothingEnabled = false` en el contexto. |

## Qué **no** entra en este spec

- Menú de ataques (spec 02).
- Movimiento por pantalla.
- IA o respuesta del rival.
- Pantallas de inicio o final.
- Ganador o mensaje de fin de partida.
- Reinicio.
- Guardado.
- Sonido.
- Experiencia o niveles.

Cada uno, si llega, va en su propio spec.
