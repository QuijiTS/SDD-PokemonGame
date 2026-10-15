import { BACKGROUNDS, CHARIZARD } from '../spritesheet.js';
import { drawBackground, drawCharizard, drawHpBar, drawLegend } from './render.js';
import { createCombatant, applyDamage } from './battle.js';

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
const [bgImage, idle, hurt, sleep] = await Promise.all([
  loadImage(bg.src),
  loadImage(CHARIZARD.idle.src.anim),
  loadImage(CHARIZARD.hurt.src.anim),
  loadImage(CHARIZARD.sleep.src.anim),
]);
const images = { idle, hurt, sleep };

const player = createCombatant({ id: 'player', dir: 'right', feet: PLAYER_FEET, maxHp: MAX_HP });
const rival = createCombatant({ id: 'rival', dir: 'left', feet: RIVAL_FEET, maxHp: MAX_HP });

// Controles de prueba temporales: el spec 02 los reemplaza por el menú de ataques.
// Tecla física (event.code) para que funcionen con Bloq Mayús; una pulsación = un golpe.
const TEST_KEYS = { KeyA: player, KeyL: rival };
window.addEventListener('keydown', (event) => {
  if (event.repeat) return;
  const target = TEST_KEYS[event.code];
  if (target) applyDamage(target, DAMAGE, performance.now());
});

function frame(nowMs) {
  drawBackground(ctx, bgImage, bg);
  drawCharizard(ctx, images, player, nowMs, SCALE);
  drawCharizard(ctx, images, rival, nowMs, SCALE);
  drawHpBar(ctx, player);
  drawHpBar(ctx, rival);
  drawLegend(ctx);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
