import * as THREE from 'three';

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createPlanetaryRegolithTextures(
  environment: 'Moon' | 'Mars',
  maxAnisotropy = 4
): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 512;
  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = size;
  colorCanvas.height = size;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = size;
  bumpCanvas.height = size;
  const bctx = bumpCanvas.getContext('2d')!;

  const rand = createSeededRandom(environment === 'Moon' ? 19690720 : 19760720);

  if (environment === 'Moon') {
    ctx.fillStyle = '#5f6572';
    ctx.fillRect(0, 0, size, size);
  } else {
    ctx.fillStyle = '#9d5336';
    ctx.fillRect(0, 0, size, size);
  }

  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, size, size);

  // Subtle surface tone variation / wind streaks on Mars
  for (let i = 0; i < 240; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const r = 10 + rand() * 48;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    if (environment === 'Moon') {
      const shade = Math.floor(78 + rand() * 42);
      grad.addColorStop(0, `rgba(${shade}, ${shade + 4}, ${shade + 10}, 0.25)`);
      grad.addColorStop(1, 'rgba(95, 101, 114, 0)');
    } else {
      const red = Math.floor(135 + rand() * 65);
      const green = Math.floor(62 + rand() * 40);
      const blue = Math.floor(38 + rand() * 24);
      grad.addColorStop(0, `rgba(${red}, ${green}, ${blue}, 0.28)`);
      grad.addColorStop(1, 'rgba(157, 83, 54, 0)');
    }
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Micro-craters & pits in both albedo and bump maps
  const craterCount = environment === 'Moon' ? 110 : 48;
  for (let i = 0; i < craterCount; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const radius = 3 + rand() * (environment === 'Moon' ? 22 : 14);

    const bumpGrad = bctx.createRadialGradient(x, y, radius * 0.1, x, y, radius);
    bumpGrad.addColorStop(0, 'rgba(30, 30, 30, 0.75)');
    bumpGrad.addColorStop(0.7, 'rgba(110, 110, 110, 0.4)');
    bumpGrad.addColorStop(0.9, 'rgba(205, 205, 205, 0.55)');
    bumpGrad.addColorStop(1, 'rgba(128, 128, 128, 0)');
    bctx.fillStyle = bumpGrad;
    bctx.beginPath();
    bctx.arc(x, y, radius, 0, Math.PI * 2);
    bctx.fill();

    const colorGrad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    if (environment === 'Moon') {
      colorGrad.addColorStop(0, 'rgba(54, 58, 66, 0.45)');
      colorGrad.addColorStop(0.82, 'rgba(130, 136, 148, 0.28)');
      colorGrad.addColorStop(1, 'rgba(95, 101, 114, 0)');
    } else {
      colorGrad.addColorStop(0, 'rgba(96, 46, 30, 0.35)');
      colorGrad.addColorStop(0.85, 'rgba(195, 108, 70, 0.25)');
      colorGrad.addColorStop(1, 'rgba(157, 83, 54, 0)');
    }
    ctx.fillStyle = colorGrad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine mineral grain speckles
  for (let i = 0; i < 3600; i++) {
    const x = rand() * size;
    const y = rand() * size;
    const dot = 0.8 + rand() * 1.8;
    const bright = rand() > 0.5;
    if (environment === 'Moon') {
      ctx.fillStyle = bright ? 'rgba(170,178,192,0.22)' : 'rgba(36,40,48,0.28)';
    } else {
      ctx.fillStyle = bright ? 'rgba(220,136,92,0.22)' : 'rgba(62,28,20,0.3)';
    }
    ctx.fillRect(x, y, dot, dot);

    bctx.fillStyle = bright ? 'rgba(185,185,185,0.28)' : 'rgba(72,72,72,0.28)';
    bctx.fillRect(x, y, dot, dot);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;
  map.repeat.set(6, 6);
  map.anisotropy = Math.min(8, maxAnisotropy);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(6, 6);
  bumpMap.anisotropy = Math.min(8, maxAnisotropy);

  return { map, bumpMap };
}

export function createKaptonFoilTexture(): {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const bump = document.createElement('canvas');
  bump.width = size;
  bump.height = size;
  const bctx = bump.getContext('2d')!;

  ctx.fillStyle = '#c89228';
  ctx.fillRect(0, 0, size, size);
  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, size, size);

  const rand = createSeededRandom(110769);
  for (let i = 0; i < 420; i++) {
    const x1 = rand() * size;
    const y1 = rand() * size;
    const x2 = x1 + (rand() - 0.5) * 44;
    const y2 = y1 + (rand() - 0.5) * 44;
    const x3 = x1 + (rand() - 0.5) * 44;
    const y3 = y1 + (rand() - 0.5) * 44;

    const shade = rand();
    ctx.fillStyle =
      shade > 0.5
        ? `rgba(245, 198, 72, ${0.18 + rand() * 0.25})`
        : `rgba(145, 92, 14, ${0.18 + rand() * 0.25})`;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fill();

    const bVal = Math.floor(60 + shade * 155);
    bctx.fillStyle = `rgba(${bVal}, ${bVal}, ${bVal}, 0.42)`;
    bctx.beginPath();
    bctx.moveTo(x1, y1);
    bctx.lineTo(x2, y2);
    bctx.lineTo(x3, y3);
    bctx.closePath();
    bctx.fill();
  }

  const map = new THREE.CanvasTexture(canvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.RepeatWrapping;

  const bumpMap = new THREE.CanvasTexture(bump);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;

  return { map, bumpMap };
}

export function createSolarPanelTexture(dustTint = false): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0e1d3d';
  ctx.fillRect(0, 0, size, size);

  ctx.strokeStyle = '#335c9c';
  ctx.lineWidth = 2;
  const step = 32;
  for (let i = 0; i <= size; i += step) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i);
    ctx.lineTo(size, i);
    ctx.stroke();
  }

  ctx.strokeStyle = 'rgba(130, 185, 255, 0.25)';
  ctx.lineWidth = 1;
  for (let i = 8; i < size; i += 16) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i, size);
    ctx.stroke();
  }

  if (dustTint) {
    const rand = createSeededRandom(20040125);
    for (let i = 0; i < 65; i++) {
      const x = rand() * size;
      const y = rand() * size;
      const r = 10 + rand() * 30;
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(190, 108, 66, 0.35)');
      g.addColorStop(1, 'rgba(190, 108, 66, 0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function createContactShadowTexture(): THREE.CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(
    size / 2,
    size / 2,
    size * 0.06,
    size / 2,
    size / 2,
    size * 0.5
  );
  grad.addColorStop(0, 'rgba(0, 0, 0, 0.68)');
  grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.28)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}
