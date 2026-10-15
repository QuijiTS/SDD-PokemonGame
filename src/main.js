import { BACKGROUNDS, CHARIZARD } from '../spritesheet.js';
import { drawBackground, drawCharizard, drawDefeatedLabel, drawHpBar, drawLegend, drawMoveMenu } from './render.js';
import { createCombatant, applyDamage, MOVES, useMove, updateAttack } from './battle.js';

const SCALE = 4;
const DAMAGE = 10;
const MAX_HP = 100;
const PLAYER_FEET = { x: 240, y: 620 };  // claro de pasto a la izquierda
const RIVAL_FEET = { x: 1200, y: 645 };  // camino a la derecha del puente

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`No se pudo cargar ${src}`));
    img.src = src;
  });
}

const bg = BACKGROUNDS.fondo1;
const [bgImage, idle, hurt, sleep, jab, charge, swing, shoot] = await Promise.all([
  loadImage(bg.src),
  loadImage(CHARIZARD.idle.src.anim),
  loadImage(CHARIZARD.hurt.src.anim),
  loadImage(CHARIZARD.sleep.src.anim),
  loadImage(CHARIZARD.jab.src.anim),
  loadImage(CHARIZARD.charge.src.anim),
  loadImage(CHARIZARD.swing.src.anim),
  loadImage(CHARIZARD.shoot.src.anim),
]);
const images = { idle, hurt, sleep, jab, charge, swing, shoot };

const player = createCombatant({ id: 'player', dir: 'right', feet: PLAYER_FEET, maxHp: MAX_HP, moves: MOVES });
const rival = createCombatant({ id: 'rival', dir: 'left', feet: RIVAL_FEET, maxHp: MAX_HP });

// Controles de prueba: A daña al Jugador y L al Rival; se mantienen junto al menú de ataques.
// Ataques: solo la fila superior (Digit1..Digit4); el teclado numérico no ataca.
// Tecla física (event.code) para que funcionen con Bloq Mayús; una pulsación = una acción.
const TEST_KEYS = { KeyA: player, KeyL: rival };
const MOVE_KEYS = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 };
window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const target = TEST_KEYS[event.code];
  if (target) applyDamage(target, DAMAGE, performance.now());
  const move = MOVE_KEYS[event.code];
  if (move !== undefined) useMove(player, rival, move, performance.now());
});

function frame(nowMs) {
  updateAttack(player, nowMs);
  drawBackground(ctx, bgImage, bg);
  drawCharizard(ctx, images, player, nowMs, SCALE);
  drawCharizard(ctx, images, rival, nowMs, SCALE);
  drawDefeatedLabel(ctx, player, SCALE);
  drawDefeatedLabel(ctx, rival, SCALE);
  drawHpBar(ctx, player);
  drawHpBar(ctx, rival);
  drawMoveMenu(ctx, player);
  drawLegend(ctx);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
