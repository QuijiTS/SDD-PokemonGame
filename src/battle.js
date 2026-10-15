import { CHARIZARD } from '../spritesheet.js';

export function createCombatant({ id, dir, feet, maxHp }) {
  return { id, dir, feet, maxHp, hp: maxHp, defeated: false, hurtStartMs: -Infinity };
}

export function applyDamage(c, amount, nowMs) {
  if (c.defeated) return;
  c.hp = Math.max(0, c.hp - amount);
  c.hurtStartMs = nowMs;
}

export function currentAnim(c, nowMs) {
  if (c.defeated) return 'sleep';
  if (nowMs - c.hurtStartMs < CHARIZARD.hurt.totalMs) return 'hurt';
  return 'idle';
}

// Verde > 50 %, amarillo entre 21 % y 50 %, rojo ≤ 20 %.
export function hpColor(hp, maxHp) {
  const ratio = hp / maxHp;
  if (ratio > 0.5) return 'green';
  if (ratio > 0.2) return 'yellow';
  return 'red';
}
