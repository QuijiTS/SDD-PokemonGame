import { CHARIZARD } from '../spritesheet.js';

export const MOVES = [
  { name: 'Arañazo',      damage: 10, maxPp: 15, anim: 'jab' },
  { name: 'Ascuas',       damage: 15, maxPp: 10, anim: 'charge' },
  { name: 'Garra Dragón', damage: 20, maxPp: 8,  anim: 'swing' },
  { name: 'Lanzallamas',  damage: 30, maxPp: 5,  anim: 'shoot' },
];

export function createCombatant({ id, dir, feet, maxHp, moves = [] }) {
  return {
    id, dir, feet, maxHp, hp: maxHp, defeated: false, hurtStartMs: -Infinity,
    moves: moves.map((m) => ({ ...m, pp: m.maxPp })),
    attack: null,
  };
}

// Estar en hurt no impide atacar; sí un ataque en curso o que alguno esté derrotado.
export function canUseMove(attacker, target, i) {
  const move = attacker.moves[i];
  return Boolean(move) && move.pp > 0 && !attacker.defeated && !target.defeated && !attacker.attack;
}

// El PP se gasta al pulsar; el daño llega en updateAttack al empezar el cuadro events.hit.
export function useMove(attacker, target, i, nowMs) {
  if (!canUseMove(attacker, target, i)) return;
  const move = attacker.moves[i];
  move.pp -= 1;
  attacker.attack = { anim: move.anim, startMs: nowMs, target, damage: move.damage, hitDone: false };
}

// Suma de las duraciones de los cuadros 0 a hit-1.
function hitMs(anim) {
  const a = CHARIZARD[anim];
  return a.durationsMs.slice(0, a.events.hit).reduce((sum, ms) => sum + ms, 0);
}

export function updateAttack(c, nowMs) {
  const atk = c.attack;
  if (!atk) return;
  const elapsed = nowMs - atk.startMs;
  if (!atk.hitDone && elapsed >= hitMs(atk.anim)) {
    atk.hitDone = true;
    // Si el objetivo ya cayó (p. ej. con L), el ataque termina sin daño y el PP no se devuelve.
    if (!atk.target.defeated) applyDamage(atk.target, atk.damage, nowMs);
  }
  if (elapsed >= CHARIZARD[atk.anim].totalMs) c.attack = null;
}

export function applyDamage(c, amount, nowMs) {
  if (c.defeated) return;
  c.hp = Math.max(0, c.hp - amount);
  c.hurtStartMs = nowMs;
  if (c.hp === 0) c.defeated = true;
}

export function currentAnim(c, nowMs) {
  if (c.defeated) return 'sleep';
  if (c.attack) return c.attack.anim;
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
