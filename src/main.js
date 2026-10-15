import { BACKGROUNDS } from '../spritesheet.js';

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
const bgImage = await loadImage(bg.src);
ctx.drawImage(bgImage, bg.sx, bg.sy, bg.sw, bg.sh, 0, 0, canvas.width, canvas.height);
