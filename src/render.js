import { getFrame, frameIndexAt } from '../spritesheet.js';
import { currentAnim, hpColor } from './battle.js';

const NAMES = { player: 'Jugador', rival: 'Rival' };
const HP_COLORS = { green: '#3ccf4e', yellow: '#f2c230', red: '#e5483b' };

const PANEL_W = 320;
const PANEL_H = 84;
const PANEL_MARGIN = 24;

export function drawBackground(ctx, image, bg) {
  ctx.drawImage(image, bg.sx, bg.sy, bg.sw, bg.sh, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

// Dibuja a Charizard con los pies en c.feet, anclado por frame.shadow.
export function drawCharizard(ctx, images, c, nowMs, scale) {
  const anim = currentAnim(c, nowMs);
  // hurt y la animación de ataque corren desde su inicio y no se repiten en bucle.
  const attacking = c.attack !== null && anim === c.attack.anim;
  let elapsed = nowMs;
  if (attacking) elapsed = nowMs - c.attack.startMs;
  else if (anim === 'hurt') elapsed = nowMs - c.hurtStartMs;
  const loop = !attacking && anim !== 'hurt';
  const f = getFrame(anim, c.dir, frameIndexAt(anim, elapsed, loop));
  const dx = c.feet.x - f.shadow.x * scale;
  const dy = c.feet.y - f.shadow.y * scale;
  ctx.save();
  if (c.defeated) ctx.globalAlpha = 0.5;
  ctx.drawImage(images[anim], f.sx, f.sy, f.sw, f.sh, dx, dy, f.sw * scale, f.sh * scale);
  ctx.restore();
}

// Texto DERROTADO justo encima del Charizard tumbado (borde superior del frame de sleep).
export function drawDefeatedLabel(ctx, c, scale) {
  if (!c.defeated) return;
  const f = getFrame('sleep', c.dir, 0);
  const top = c.feet.y - f.shadow.y * scale;
  ctx.font = 'bold 32px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#000';
  ctx.strokeText('DERROTADO', c.feet.x, top - 8);
  ctx.fillStyle = '#e5483b';
  ctx.fillText('DERROTADO', c.feet.x, top - 8);
}

const MENU_CELL_W = 280;
const MENU_CELL_H = 36;
const MENU_PAD = 12;

// Grilla 2×2 abajo al centro, encima de la leyenda. Ataques sin PP en gris.
export function drawMoveMenu(ctx, c) {
  const w = MENU_CELL_W * 2 + MENU_PAD * 3;
  const h = MENU_CELL_H * 2 + MENU_PAD * 3;
  const x = (ctx.canvas.width - w) / 2;
  const y = ctx.canvas.height - 60 - h;  // la leyenda ocupa los últimos 56 px

  ctx.fillStyle = 'rgba(20, 20, 30, 0.8)';
  ctx.fillRect(x, y, w, h);

  ctx.font = 'bold 20px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  c.moves.forEach((m, i) => {
    const cellX = x + MENU_PAD + (i % 2) * (MENU_CELL_W + MENU_PAD);
    const cellY = y + MENU_PAD + Math.floor(i / 2) * (MENU_CELL_H + MENU_PAD);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.fillRect(cellX, cellY, MENU_CELL_W, MENU_CELL_H);
    ctx.fillStyle = m.pp > 0 ? '#fff' : '#777';
    ctx.fillText(`${i + 1} ${m.name}  PP ${m.pp}/${m.maxPp}`, cellX + 12, cellY + MENU_CELL_H / 2);
  });
}

export function drawLegend(ctx) {
  const text = 'A: dañar al Jugador · L: dañar al Rival';
  ctx.font = '18px sans-serif';
  ctx.textBaseline = 'bottom';
  ctx.textAlign = 'center';
  const x = ctx.canvas.width / 2;
  const y = ctx.canvas.height - 16;
  const w = ctx.measureText(text).width + 32;
  ctx.fillStyle = 'rgba(20, 20, 30, 0.8)';
  ctx.fillRect(x - w / 2, y - 32, w, 40);
  ctx.fillStyle = '#fff';
  ctx.fillText(text, x, y);
}

// Jugador arriba a la izquierda, Rival arriba a la derecha.
export function drawHpBar(ctx, c) {
  const x = c.id === 'player' ? PANEL_MARGIN : ctx.canvas.width - PANEL_MARGIN - PANEL_W;
  const y = PANEL_MARGIN;

  ctx.fillStyle = 'rgba(20, 20, 30, 0.8)';
  ctx.fillRect(x, y, PANEL_W, PANEL_H);

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 22px sans-serif';
  ctx.textBaseline = 'top';
  ctx.textAlign = 'left';
  ctx.fillText(NAMES[c.id], x + 16, y + 10);

  const barX = x + 16;
  const barY = y + 42;
  const barW = PANEL_W - 32;
  const barH = 12;
  ctx.fillStyle = '#444';
  ctx.fillRect(barX, barY, barW, barH);
  ctx.fillStyle = HP_COLORS[hpColor(c.hp, c.maxHp)];
  ctx.fillRect(barX, barY, barW * (c.hp / c.maxHp), barH);

  ctx.fillStyle = '#fff';
  ctx.font = '16px sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(`PS ${c.hp}/${c.maxHp}`, x + PANEL_W - 16, y + 60);
}
