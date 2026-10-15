import { BACKGROUNDS, CHARIZARD } from '../spritesheet.js';
import { drawBackground, drawCharizard } from './render.js';

const SCALE = 4;
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

// El paso 3 reemplaza estos objetos por createCombatant.
const player = { id: 'player', dir: 'right', feet: PLAYER_FEET };
const rival = { id: 'rival', dir: 'left', feet: RIVAL_FEET };

function frame(nowMs) {
  drawBackground(ctx, bgImage, bg);
  drawCharizard(ctx, images, player, nowMs, SCALE);
  drawCharizard(ctx, images, rival, nowMs, SCALE);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);
