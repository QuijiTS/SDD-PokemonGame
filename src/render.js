import { getFrame, frameIndexAt } from '../spritesheet.js';

export function drawBackground(ctx, image, bg) {
  ctx.drawImage(image, bg.sx, bg.sy, bg.sw, bg.sh, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

// Dibuja a Charizard con los pies en c.feet, anclado por frame.shadow.
// Por ahora siempre 'idle'; el paso 3 elige la animación con currentAnim.
export function drawCharizard(ctx, images, c, nowMs, scale) {
  const anim = 'idle';
  const f = getFrame(anim, c.dir, frameIndexAt(anim, nowMs));
  const dx = c.feet.x - f.shadow.x * scale;
  const dy = c.feet.y - f.shadow.y * scale;
  ctx.drawImage(images[anim], f.sx, f.sy, f.sw, f.sh, dx, dy, f.sw * scale, f.sh * scale);
}
