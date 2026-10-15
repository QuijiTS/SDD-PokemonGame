# SPEC 02 — Menú de ataques con PP

> **Estado:** Implementado
> **Depende de:** SPEC 01
> **Fecha:** 2026-10-15
> **Objetivo:** Permitir que el Jugador dañe al Rival eligiendo con las teclas 1–4 entre cuatro ataques con daño fijo y PP limitados.

## Por qué existe este spec

El SPEC 01 dejó la vida y la derrota funcionando, pero el daño solo se provoca con las teclas de prueba `A` y `L`, siempre de 10. Este spec agrega la primera mecánica real de combate: elegir un ataque, gastar sus PP y bajar la vida del Rival con la lógica que ya existe (`applyDamage` en `src/battle.js`).

## Alcance

**Entra:**

- Cuatro ataques para el Jugador, con daño fijo y PP máximos:
  - Arañazo: 10 de daño, 15 PP.
  - Ascuas: 15 de daño, 10 PP.
  - Garra Dragón: 20 de daño, 8 PP.
  - Lanzallamas: 30 de daño, 3 PP.
- Selección con las teclas de la fila superior `1`, `2`, `3` y `4` (`event.code` `Digit1`…`Digit4`).
- Cada uso gasta 1 PP al pulsar la tecla.
- Un ataque con 0 PP se dibuja en gris y pulsarlo no hace nada.
- Animación del Jugador por ataque: Arañazo → `jab`, Ascuas → `charge`, Garra Dragón → `swing`, Lanzallamas → `shoot`.
- El daño se aplica al Rival al empezar el cuadro `events.hit` de esa animación, y el Rival reproduce `hurt` con la lógica del SPEC 01.
- No se puede iniciar otro ataque hasta que termine la animación del ataque en curso.
- Menú 2×2 dibujado en el canvas, abajo al centro y encima de la leyenda, con nombres completos y el formato `1 Arañazo  PP 15/15`.
- Las teclas de prueba `A` y `L` y su leyenda `A: dañar al Jugador · L: dañar al Rival` se mantienen sin cambios.

**Fuera de alcance (para specs futuros):**

- Que el Rival ataque o responda.
- Recuperar PP.
- Pantallas de inicio o de final.
- Reiniciar la partida.
- Guardar el progreso.
- Sonido.
- Experiencia o niveles.
- Movimiento de los Charizard por la pantalla.
- Proyectiles (por ejemplo, llamas que salen de `frame.head`).
- Elegir ataques con el mouse, con flechas + Enter o con el teclado numérico.

## Modelo de datos

```js
// src/battle.js — catálogo de ataques
export const MOVES = [
  { name: 'Arañazo',      damage: 10, maxPp: 15, anim: 'jab' },
  { name: 'Ascuas',       damage: 15, maxPp: 10, anim: 'charge' },
  { name: 'Garra Dragón', damage: 20, maxPp: 8,  anim: 'swing' },
  { name: 'Lanzallamas',  damage: 30, maxPp: 3,  anim: 'shoot' },
];
```

```js
// src/battle.js — campos nuevos del combatiente
{
  // ...campos del SPEC 01 (id, dir, feet, maxHp, hp, defeated, hurtStartMs)
  moves: [{ name, damage, maxPp, pp, anim }],  // solo el player; el rival recibe []
  attack: null,  // o { anim, startMs, target, damage, hitDone } mientras dura un ataque
}
```

Convenciones:

- `pp` arranca en `maxPp` y nunca baja de 0.
- `hitMs` de un ataque = suma de `CHARIZARD[anim].durationsMs[0]` hasta `durationsMs[hit - 1]`, con `hit = CHARIZARD[anim].events.hit`.
- El ataque dura `CHARIZARD[anim].totalMs` desde `startMs`; después `attack` vuelve a `null`.
- Animación vigente: `sleep` si `defeated`; la del ataque si hay `attack`; `hurt` mientras dure; si no, `idle`.
- La animación del ataque no se repite en bucle.
- Ids de código en inglés (`moves`, `attack`). Texto visible en español.

## Plan de implementación

1. **Lógica de ataques en `src/battle.js`.** Agregar `MOVES`. `createCombatant` acepta `moves` opcional (por defecto `[]`), copia cada uno con `pp: maxPp` y agrega `attack: null`. Agregar `canUseMove(attacker, target, i)`: el ataque existe, tiene PP, ninguno de los dos está derrotado y no hay ataque en curso (estar en `hurt` no lo impide). Agregar `useMove(attacker, target, i, nowMs)`: si puede, resta 1 PP y guarda `attack`. Agregar `updateAttack(c, nowMs)`: al alcanzar `hitMs` aplica el daño una sola vez (marca `hitDone`) y solo si el objetivo no está derrotado; al alcanzar `totalMs` deja `attack = null`. `currentAnim` devuelve la animación del ataque cuando hay `attack`, con prioridad sobre `hurt` y debajo de `sleep`. Prueba manual: el juego carga igual que antes, sin errores en la consola, y `A` y `L` siguen funcionando.
2. **Teclas y animación del ataque.** En `src/main.js`, cargar las hojas `CHARIZARD.jab|charge|swing|shoot.src.anim` en `images`, crear al player con `moves: MOVES` y, en el `keydown` existente, mapear `Digit1`…`Digit4` a `useMove(player, rival, n, performance.now())`, manteniendo `KeyA`, `KeyL` y el filtro de `event.repeat`. Llamar `updateAttack(player, nowMs)` en cada `frame`. En `src/render.js`, `drawCharizard` calcula el tiempo transcurrido de la animación de ataque desde `c.attack.startMs` y no la repite en bucle. Prueba manual: pulsar `1` hace que el Jugador reproduzca `jab` y el Rival baje a `PS 90/100` en el impacto.
3. **Menú de ataques.** Agregar `drawMoveMenu(ctx, c)` en `src/render.js`: panel 2×2 abajo al centro, encima de la leyenda, con el estilo de los paneles existentes. Cada celda muestra `N Nombre  PP pp/maxPp` con el nombre completo. Los ataques con 0 PP se dibujan en gris. Llamarlo desde `frame` en `src/main.js`. `drawLegend` no cambia. Prueba manual: el menú muestra los cuatro ataques y el PP baja al usarlos.

## Criterios de aceptación

- [ ] La página carga desde `http://localhost:8000` sin errores en la consola.
- [ ] Al cargar, el menú muestra `1 Arañazo  PP 15/15`, `2 Ascuas  PP 10/10`, `3 Garra Dragón  PP 8/8` y `4 Lanzallamas  PP 3/3`.
- [ ] Pulsar `1` hace que el Jugador reproduzca `jab`, deja al Rival en `PS 90/100` con `hurt` y deja Arañazo en `PP 14/15`.
- [ ] El daño al Rival aparece en el momento del impacto de la animación y no al pulsar la tecla.
- [ ] Usar un ataque no cambia la vida del Jugador.
- [ ] Pulsar `2`, `3` y `4` reproduce `charge`, `swing` y `shoot`, y resta 15, 20 y 30 PS respectivamente.
- [ ] Pulsar cualquier tecla `1`–`4` durante la animación de un ataque no gasta PP ni hace daño extra.
- [ ] Mantener `1` presionada un segundo gasta solo 1 PP.
- [ ] Al llegar a `PP 0/3`, Lanzallamas se ve en gris y pulsar `4` no cambia nada.
- [ ] Con el Rival derrotado, pulsar `1`–`4` no gasta PP.
- [ ] Pulsar `1` y derrotar al Rival con `L` antes del impacto: la animación termina, no hay daño extra y Arañazo queda en `PP 14/15`.
- [ ] Con el Jugador derrotado (por `A`), pulsar `1`–`4` no hace nada.
- [ ] Pulsar `A` y enseguida `1`: el Jugador ataca aunque esté en `hurt`.
- [ ] Pulsar `4` y enseguida `A`: el ataque no se interrumpe y el Rival recibe 30 de daño.
- [ ] Las teclas `1`–`4` del teclado numérico no atacan.
- [ ] Con Bloq Mayús activado, `1`–`4`, `A` y `L` funcionan igual.
- [ ] `A` y `L` siguen funcionando como en el SPEC 01.
- [ ] La leyenda sigue siendo exactamente `A: dañar al Jugador · L: dañar al Rival`.
- [ ] Nunca aparecen PS negativos ni PP negativos.
- [ ] `spritesheet.js` no fue modificado.

## Decisiones

- **Sí:** teclas `1`–`4` de la fila superior (`Digit1`…`Digit4`). Mismo estilo que `A`/`L`, simple y verificable.
- **No:** flechas + Enter ni mouse. Más estado y más código para el mismo resultado.
- **No:** teclado numérico. Se mantiene un único juego de teclas para atacar.
- **Sí:** cuatro ataques con daño fijo (10/15/20/30) y PP inversos al daño (15/10/8/3). Determinista y fácil de verificar.
- **Sí:** Lanzallamas con 3 PP en lugar de 5. Con 5 PP y 30 de daño, el Rival (100 PS) cae antes de agotar Lanzallamas, así que el criterio del ataque en gris no se podía comprobar.
- **No:** daño aleatorio. Hace la prueba impredecible.
- **Sí:** el PP se gasta al pulsar, no al impactar. Un ataque iniciado ya consumió su uso.
- **Sí:** si el Rival queda derrotado antes del impacto, el ataque termina sin daño y el PP no se devuelve. Evita lógica de reembolso.
- **Sí:** daño al empezar el cuadro `events.hit`. Usa el dato que ya trae `spritesheet.js` y sincroniza el golpe con la animación.
- **No:** daño instantáneo al pulsar. El Rival reaccionaría antes de recibir el golpe.
- **Sí:** animaciones `jab`, `charge`, `swing` y `shoot` según la guía de `spritesheet.js`.
- **No:** proyectiles. Quedan para otro spec.
- **Sí:** bloquear nuevos ataques mientras dura uno. Una animación a la vez.
- **Sí:** se puede atacar estando en `hurt`, y recibir daño con `A` no interrumpe el ataque en curso. La animación del ataque tiene prioridad sobre `hurt`.
- **Sí:** mantener `A` y `L` y su leyenda sin cambios. Siguen siendo útiles para probar la vida del Jugador mientras el Rival no ataca.
- **Sí:** nombres completos en el menú, sin abreviar.
- **Sí:** los ataques viven en `src/battle.js` como lógica pura y el menú en `src/render.js`. Respeta la separación del SPEC 01.
- **Nota:** las preguntas de definición se resolvieron en la sesión de planificación previa a este spec.

## Riesgos

| Riesgo | Mitigación |
| --- | --- |
| El frame de `hit` cae entre dos `requestAnimationFrame` y el daño se aplica dos veces o ninguna | `updateAttack` compara con `>= hitMs` y marca `hitDone`. |
| Las animaciones de ataque tienen frames de distinto tamaño y el Charizard "salta" | Se dibuja anclado por `frame.shadow`, igual que en el SPEC 01. |
| El menú tapa a los Charizard | Panel abajo al centro, entre los pies del Jugador (`x 240`) y del Rival (`x 1200`). |

## Qué **no** entra en este spec

- Ataque o respuesta del Rival.
- Recuperar PP.
- Pantallas de inicio o final.
- Reinicio.
- Guardado.
- Sonido.
- Experiencia o niveles.
- Movimiento por pantalla.
- Proyectiles.
- Mouse, flechas o teclado numérico para elegir ataques.

Cada uno, si llega, va en su propio spec.
