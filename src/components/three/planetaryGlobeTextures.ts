import * as THREE from 'three';

function createSeededRandom(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (1664525 * state + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export interface PlanetaryGlobeTextures {
  map: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
}

/**
 * Generates an equirectangular Lunar surface albedo + crater bump map on demand.
 * Includes dark basaltic maria basins, highland regolith, multi-scale craters,
 * and bright radial ejecta rays.
 */
export function createMoonGlobeTextures(
  maxAnisotropy = 4,
  lowMemory = false
): PlanetaryGlobeTextures {
  const width = lowMemory ? 512 : 1024;
  const height = lowMemory ? 256 : 512;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bctx = bumpCanvas.getContext('2d')!;

  const rand = createSeededRandom(19690720);

  // Base highland anorthosite regolith
  ctx.fillStyle = '#9aa1ad';
  ctx.fillRect(0, 0, width, height);

  bctx.fillStyle = '#868686';
  bctx.fillRect(0, 0, width, height);

  // Subtle regional tonal mottling
  for (let i = 0; i < 160; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const r = (18 + rand() * 58) * (width / 1024);
    const bright = rand() > 0.45;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(
      0,
      bright ? 'rgba(182, 189, 200, 0.24)' : 'rgba(112, 118, 129, 0.24)'
    );
    g.addColorStop(1, 'rgba(154, 161, 173, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark basaltic Lunar Maria basins (Imbrium, Serenitatis, Tranquillitatis, Procellarum)
  const mariaRegions = [
    { u: 0.42, v: 0.34, rx: 0.13, ry: 0.14 },
    { u: 0.56, v: 0.36, rx: 0.09, ry: 0.1 },
    { u: 0.64, v: 0.47, rx: 0.09, ry: 0.09 },
    { u: 0.31, v: 0.45, rx: 0.14, ry: 0.18 },
    { u: 0.59, v: 0.58, rx: 0.07, ry: 0.07 },
    { u: 0.72, v: 0.4, rx: 0.06, ry: 0.07 },
    { u: 0.49, v: 0.48, rx: 0.08, ry: 0.08 }
  ];

  for (const mare of mariaRegions) {
    const cx = mare.u * width;
    const cy = mare.v * height;
    const radius = Math.max(mare.rx * width, mare.ry * height);
    const g = ctx.createRadialGradient(cx, cy, radius * 0.12, cx, cy, radius);
    g.addColorStop(0, 'rgba(62, 68, 79, 0.86)');
    g.addColorStop(0.6, 'rgba(78, 84, 96, 0.68)');
    g.addColorStop(1, 'rgba(130, 136, 148, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(
      cx,
      cy,
      mare.rx * width,
      mare.ry * height,
      (rand() - 0.5) * 0.6,
      0,
      Math.PI * 2
    );
    ctx.fill();

    // Maria basins are slightly depressed in elevation
    const bg = bctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
    bg.addColorStop(0, 'rgba(92, 92, 92, 0.48)');
    bg.addColorStop(1, 'rgba(134, 134, 134, 0)');
    bctx.fillStyle = bg;
    bctx.beginPath();
    bctx.ellipse(cx, cy, mare.rx * width, mare.ry * height, 0, 0, Math.PI * 2);
    bctx.fill();
  }

  // Multi-scale impact craters (floor depression + bright raised rim)
  const craterTotal = lowMemory ? 260 : 480;
  for (let i = 0; i < craterTotal; i++) {
    const x = rand() * width;
    const y = (0.06 + rand() * 0.88) * height;
    // Scale horizontal radius gently for equirectangular projection near poles
    const latScale = Math.max(1, 1 / Math.max(0.32, Math.sin((y / height) * Math.PI)));
    const r = (2 + Math.pow(rand(), 2.3) * 28) * (width / 1024);

    // Bump rim & bowl
    const bg = bctx.createRadialGradient(x, y, r * 0.08, x, y, r);
    bg.addColorStop(0, 'rgba(24, 24, 24, 0.82)');
    bg.addColorStop(0.62, 'rgba(78, 78, 78, 0.55)');
    bg.addColorStop(0.84, 'rgba(232, 232, 232, 0.72)');
    bg.addColorStop(1, 'rgba(134, 134, 134, 0)');
    bctx.save();
    bctx.translate(x, y);
    bctx.scale(Math.min(2.2, latScale), 1);
    bctx.fillStyle = bg;
    bctx.beginPath();
    bctx.arc(0, 0, r, 0, Math.PI * 2);
    bctx.fill();
    bctx.restore();

    // Albedo shading
    const cg = ctx.createRadialGradient(x, y, r * 0.1, x, y, r);
    cg.addColorStop(0, 'rgba(72, 77, 86, 0.36)');
    cg.addColorStop(0.74, 'rgba(145, 152, 164, 0.2)');
    cg.addColorStop(0.88, 'rgba(208, 214, 224, 0.42)');
    cg.addColorStop(1, 'rgba(154, 161, 173, 0)');
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(Math.min(2.2, latScale), 1);
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Prominent rayed craters (Tycho & Copernicus analogs)
  const rayCraters = [
    { x: width * 0.44, y: height * 0.73, r: 18 * (width / 1024), rayLen: 140 * (width / 1024) },
    { x: width * 0.38, y: height * 0.43, r: 15 * (width / 1024), rayLen: 110 * (width / 1024) }
  ];
  for (const rc of rayCraters) {
    ctx.save();
    for (let j = 0; j < 18; j++) {
      const ang = (j / 18) * Math.PI * 2 + (rand() - 0.5) * 0.2;
      const len = rc.rayLen * (0.55 + rand() * 0.55);
      const rg = ctx.createLinearGradient(
        rc.x,
        rc.y,
        rc.x + Math.cos(ang) * len,
        rc.y + Math.sin(ang) * len * 0.75
      );
      rg.addColorStop(0, 'rgba(228, 234, 244, 0.55)');
      rg.addColorStop(0.45, 'rgba(215, 222, 232, 0.18)');
      rg.addColorStop(1, 'rgba(215, 222, 232, 0)');
      ctx.strokeStyle = rg;
      ctx.lineWidth = 1.2 + rand() * 2.2;
      ctx.beginPath();
      ctx.moveTo(rc.x, rc.y);
      ctx.lineTo(rc.x + Math.cos(ang) * len, rc.y + Math.sin(ang) * len * 0.75);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Micro regolith speckle
  const speckleCount = lowMemory ? 2200 : 5200;
  for (let i = 0; i < speckleCount; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const d = 0.8 + rand() * 1.4;
    const bright = rand() > 0.5;
    ctx.fillStyle = bright ? 'rgba(220,226,236,0.16)' : 'rgba(54,58,68,0.22)';
    ctx.fillRect(x, y, d, d);
    bctx.fillStyle = bright ? 'rgba(190,190,190,0.22)' : 'rgba(72,72,72,0.22)';
    bctx.fillRect(x, y, d, d);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;
  map.anisotropy = Math.min(8, maxAnisotropy);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.anisotropy = Math.min(8, maxAnisotropy);

  return { map, bumpMap };
}

/**
 * Generates an equirectangular Mars globe albedo + terrain relief bump map on demand.
 * Includes rusty iron-oxide plains, dark basaltic Syrtis/Acidalia regions,
 * canyon rifts, impact craters, and polar ice caps.
 */
export function createMarsGlobeTextures(
  maxAnisotropy = 4,
  lowMemory = false
): PlanetaryGlobeTextures {
  const width = lowMemory ? 512 : 1024;
  const height = lowMemory ? 256 : 512;

  const colorCanvas = document.createElement('canvas');
  colorCanvas.width = width;
  colorCanvas.height = height;
  const ctx = colorCanvas.getContext('2d')!;

  const bumpCanvas = document.createElement('canvas');
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bctx = bumpCanvas.getContext('2d')!;

  const rand = createSeededRandom(19760720);

  // Iron-oxide rusty ochre base
  const baseGrad = ctx.createLinearGradient(0, 0, 0, height);
  baseGrad.addColorStop(0, '#c89b82');
  baseGrad.addColorStop(0.25, '#bc5d36');
  baseGrad.addColorStop(0.55, '#ad4c2a');
  baseGrad.addColorStop(0.8, '#9e472b');
  baseGrad.addColorStop(1, '#bfa08c');
  ctx.fillStyle = baseGrad;
  ctx.fillRect(0, 0, width, height);

  bctx.fillStyle = '#808080';
  bctx.fillRect(0, 0, width, height);

  // Bright dusty highland plateaus (Tharsis / Arabia)
  for (let i = 0; i < 120; i++) {
    const x = rand() * width;
    const y = (0.14 + rand() * 0.72) * height;
    const r = (24 + rand() * 76) * (width / 1024);
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    const dusty = rand() > 0.4;
    g.addColorStop(
      0,
      dusty ? 'rgba(218, 128, 78, 0.3)' : 'rgba(150, 68, 42, 0.28)'
    );
    g.addColorStop(1, 'rgba(173, 76, 42, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark basaltic albedo features (Syrtis Major, Mare Erythraeum, Acidalia)
  const darkBasins = [
    { u: 0.68, v: 0.46, rx: 0.08, ry: 0.14, rot: 0.3 },
    { u: 0.36, v: 0.35, rx: 0.11, ry: 0.1, rot: -0.2 },
    { u: 0.48, v: 0.59, rx: 0.14, ry: 0.09, rot: 0.15 },
    { u: 0.18, v: 0.62, rx: 0.12, ry: 0.08, rot: -0.25 },
    { u: 0.82, v: 0.56, rx: 0.1, ry: 0.09, rot: 0.2 }
  ];

  for (const basin of darkBasins) {
    const cx = basin.u * width;
    const cy = basin.v * height;
    const rad = Math.max(basin.rx * width, basin.ry * height);
    const g = ctx.createRadialGradient(cx, cy, rad * 0.1, cx, cy, rad);
    g.addColorStop(0, 'rgba(72, 34, 26, 0.72)');
    g.addColorStop(0.55, 'rgba(104, 48, 34, 0.45)');
    g.addColorStop(1, 'rgba(155, 72, 42, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(cx, cy, basin.rx * width, basin.ry * height, basin.rot, 0, Math.PI * 2);
    ctx.fill();
  }

  // Valles Marineris equatorial canyon scar
  ctx.save();
  bctx.save();
  ctx.strokeStyle = 'rgba(70, 28, 20, 0.68)';
  ctx.lineWidth = 4.2 * (width / 1024);
  ctx.lineCap = 'round';
  bctx.strokeStyle = 'rgba(20, 20, 20, 0.85)';
  bctx.lineWidth = 5 * (width / 1024);
  bctx.lineCap = 'round';
  ctx.beginPath();
  bctx.beginPath();
  const startX = width * 0.28;
  const startY = height * 0.53;
  ctx.moveTo(startX, startY);
  bctx.moveTo(startX, startY);
  for (let s = 1; s <= 8; s++) {
    const px = startX + s * (width * 0.022);
    const py = startY + Math.sin(s * 0.9) * (height * 0.014);
    ctx.lineTo(px, py);
    bctx.lineTo(px, py);
  }
  ctx.stroke();
  bctx.stroke();
  ctx.restore();
  bctx.restore();

  // Shield volcanoes (Olympus / Tharsis Montes) subtle raised domes
  const volcanoes = [
    { u: 0.16, v: 0.41, r: 22 * (width / 1024) },
    { u: 0.22, v: 0.46, r: 14 * (width / 1024) },
    { u: 0.24, v: 0.5, r: 13 * (width / 1024) }
  ];
  for (const v of volcanoes) {
    const vx = v.u * width;
    const vy = v.v * height;
    const bg = bctx.createRadialGradient(vx, vy, 0, vx, vy, v.r);
    bg.addColorStop(0, 'rgba(245, 245, 245, 0.85)');
    bg.addColorStop(0.5, 'rgba(180, 180, 180, 0.45)');
    bg.addColorStop(1, 'rgba(128, 128, 128, 0)');
    bctx.fillStyle = bg;
    bctx.beginPath();
    bctx.arc(vx, vy, v.r, 0, Math.PI * 2);
    bctx.fill();

    const cg = ctx.createRadialGradient(vx, vy, 0, vx, vy, v.r);
    cg.addColorStop(0, 'rgba(214, 134, 92, 0.45)');
    cg.addColorStop(1, 'rgba(173, 76, 42, 0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(vx, vy, v.r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Martian craters & ridges
  const craterCount = lowMemory ? 140 : 260;
  for (let i = 0; i < craterCount; i++) {
    const x = rand() * width;
    const y = (0.12 + rand() * 0.76) * height;
    const r = (2 + Math.pow(rand(), 2.2) * 18) * (width / 1024);

    const bg = bctx.createRadialGradient(x, y, r * 0.1, x, y, r);
    bg.addColorStop(0, 'rgba(42, 42, 42, 0.65)');
    bg.addColorStop(0.8, 'rgba(195, 195, 195, 0.55)');
    bg.addColorStop(1, 'rgba(128, 128, 128, 0)');
    bctx.fillStyle = bg;
    bctx.beginPath();
    bctx.arc(x, y, r, 0, Math.PI * 2);
    bctx.fill();

    const cg = ctx.createRadialGradient(x, y, 0, x, y, r);
    cg.addColorStop(0, 'rgba(112, 46, 28, 0.3)');
    cg.addColorStop(0.85, 'rgba(218, 132, 86, 0.22)');
    cg.addColorStop(1, 'rgba(173, 76, 42, 0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // North & South Polar CO2 / water-ice caps
  const northCap = ctx.createLinearGradient(0, 0, 0, height * 0.09);
  northCap.addColorStop(0, 'rgba(242, 236, 232, 0.94)');
  northCap.addColorStop(0.65, 'rgba(232, 218, 210, 0.65)');
  northCap.addColorStop(1, 'rgba(214, 155, 126, 0)');
  ctx.fillStyle = northCap;
  ctx.fillRect(0, 0, width, height * 0.09);

  const southCap = ctx.createLinearGradient(0, height * 0.91, 0, height);
  southCap.addColorStop(0, 'rgba(214, 155, 126, 0)');
  southCap.addColorStop(0.45, 'rgba(232, 218, 210, 0.6)');
  southCap.addColorStop(1, 'rgba(242, 236, 232, 0.92)');
  ctx.fillStyle = southCap;
  ctx.fillRect(0, height * 0.91, width, height * 0.09);

  // Fine dust grain
  const grains = lowMemory ? 1800 : 4000;
  for (let i = 0; i < grains; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const d = 0.8 + rand() * 1.4;
    const light = rand() > 0.5;
    ctx.fillStyle = light ? 'rgba(232,148,98,0.16)' : 'rgba(66,28,20,0.22)';
    ctx.fillRect(x, y, d, d);
    bctx.fillStyle = light ? 'rgba(180,180,180,0.2)' : 'rgba(75,75,75,0.2)';
    bctx.fillRect(x, y, d, d);
  }

  const map = new THREE.CanvasTexture(colorCanvas);
  map.colorSpace = THREE.SRGBColorSpace;
  map.wrapS = THREE.RepeatWrapping;
  map.wrapT = THREE.ClampToEdgeWrapping;
  map.anisotropy = Math.min(8, maxAnisotropy);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;
  bumpMap.anisotropy = Math.min(8, maxAnisotropy);

  return { map, bumpMap };
}
