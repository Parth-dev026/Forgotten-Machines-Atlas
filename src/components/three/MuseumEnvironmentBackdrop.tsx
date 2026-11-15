import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { useMuseumTheme } from '../../context/MuseumThemeContext';
import {
  createMarsGlobeTextures,
  createMoonGlobeTextures
} from './planetaryGlobeTextures';
import { MuseumTheme } from '../../types/theme';

const THEME_ORDER: MuseumTheme[] = ['default', 'lunar', 'mars', 'timeline'];

const THEME_ATMOSPHERE_BACKDROPS: Record<MuseumTheme, string> = {
  default:
    'radial-gradient(circle at 80% 20%, rgba(36,99,197,0.18) 0%, rgba(8,13,28,0.88) 62%, rgba(8,13,28,0.96) 100%)',
  lunar:
    'radial-gradient(circle at 82% 24%, rgba(148,163,184,0.24) 0%, rgba(56,101,176,0.12) 28%, rgba(7,11,22,0.96) 65%)',
  mars:
    'radial-gradient(circle at 82% 24%, rgba(235,125,75,0.28) 0%, rgba(140,48,28,0.15) 30%, rgba(18,10,10,0.96) 65%)',
  timeline:
    'radial-gradient(circle at 80% 26%, rgba(245,176,65,0.16) 0%, rgba(32,185,201,0.12) 26%, rgba(6,10,24,0.96) 65%)'
};

const THEME_READABILITY_SCRIMS: Record<MuseumTheme, string> = {
  default:
    'linear-gradient(90deg, rgba(8,13,28,0.88) 0%, rgba(8,13,28,0.62) 55%, rgba(8,13,28,0.3) 100%)',
  lunar:
    'linear-gradient(90deg, rgba(7,11,22,0.9) 0%, rgba(7,11,22,0.66) 52%, rgba(7,11,22,0.22) 100%)',
  mars:
    'linear-gradient(90deg, rgba(18,10,10,0.9) 0%, rgba(18,10,10,0.68) 52%, rgba(18,10,10,0.24) 100%)',
  timeline:
    'linear-gradient(90deg, rgba(6,10,24,0.9) 0%, rgba(6,10,24,0.66) 52%, rgba(6,10,24,0.24) 100%)'
};

const THEME_TRANSITION_VEILS: Record<MuseumTheme, string> = {
  default:
    'radial-gradient(circle at 75% 30%, rgba(16,32,68,0.92) 0%, rgba(8,13,28,0.98) 65%)',
  lunar:
    'radial-gradient(circle at 75% 30%, rgba(24,42,74,0.92) 0%, rgba(7,11,22,0.98) 65%)',
  mars:
    'radial-gradient(circle at 75% 30%, rgba(58,24,18,0.92) 0%, rgba(18,10,10,0.98) 65%)',
  timeline:
    'radial-gradient(circle at 75% 30%, rgba(14,34,66,0.92) 0%, rgba(6,10,24,0.98) 65%)'
};

function detectBackdropWebGL(): { supported: boolean; isSoftwareGl: boolean } {
  if (typeof window === 'undefined') {
    return { supported: true, isSoftwareGl: false };
  }
  try {
    const probeCanvas = document.createElement('canvas');
    const gl =
      (probeCanvas.getContext('webgl2') as WebGL2RenderingContext | null) ||
      (probeCanvas.getContext('webgl') as WebGLRenderingContext | null);
    if (!gl) {
      return { supported: false, isSoftwareGl: false };
    }
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const raw = ext
      ? String(gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || '')
      : String(gl.getParameter(gl.RENDERER) || '');
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const isSoftwareGl =
      /swiftshader|llvmpipe|softpipe|software|mesa|microsoft basic render/i.test(
        raw
      );
    return { supported: true, isSoftwareGl };
  } catch {
    return { supported: false, isSoftwareGl: false };
  }
}

function shouldUseLowPerfStaticFallback(isMobile: boolean): boolean {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
  };
  if (nav.connection?.saveData) return true;
  if (isMobile && typeof navigator.hardwareConcurrency === 'number') {
    return navigator.hardwareConcurrency <= 2;
  }
  return false;
}

function createFresnelAtmosphereMaterial(
  colorHex: string,
  intensity: number,
  power: number
): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(colorHex) },
      uIntensity: { value: intensity },
      uPower: { value: power }
    },
    vertexShader: `
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        vViewPos = -mvPosition.xyz;
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform vec3 uColor;
      uniform float uIntensity;
      uniform float uPower;
      varying vec3 vNormal;
      varying vec3 vViewPos;
      void main() {
        vec3 viewDir = normalize(vViewPos);
        float rim = pow(clamp(1.0 - dot(viewDir, normalize(vNormal)), 0.0, 1.0), uPower);
        gl_FragColor = vec4(uColor * uIntensity, rim * uIntensity);
      }
    `,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false
  });
}

function createStarfieldObject(theme: MuseumTheme): THREE.Points {
  const count = theme === 'timeline' ? 540 : 420;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  let seed =
    theme === 'lunar'
      ? 1969
      : theme === 'mars'
      ? 1976
      : theme === 'timeline'
      ? 1997
      : 2026;
  const next = () => {
    seed = (1664525 * seed + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const tintA = new THREE.Color(
    theme === 'mars'
      ? '#ffd8c2'
      : theme === 'timeline'
      ? '#8fd6ff'
      : '#e6edf7'
  );
  const tintB = new THREE.Color(
    theme === 'mars'
      ? '#f5a97f'
      : theme === 'lunar'
      ? '#9dc8ff'
      : theme === 'timeline'
      ? '#f5b041'
      : '#20b9c9'
  );
  const tmpColor = new THREE.Color();

  for (let i = 0; i < count; i++) {
    const x = (next() - 0.5) * 26;
    const y = (next() - 0.5) * 16;
    const z = -4 - next() * 14;
    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    tmpColor.copy(tintA).lerp(tintB, next() * 0.45);
    colors[i * 3] = tmpColor.r;
    colors[i * 3 + 1] = tmpColor.g;
    colors[i * 3 + 2] = tmpColor.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.055,
    vertexColors: true,
    transparent: true,
    opacity: theme === 'default' ? 0.65 : 0.8,
    sizeAttenuation: true,
    depthWrite: false
  });

  return new THREE.Points(geo, mat);
}

function disposeGroupContents(group: THREE.Group) {
  group.traverse((obj) => {
    const mesh = obj as THREE.Mesh;
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    const mat = mesh.material;
    if (mat) {
      const materials = Array.isArray(mat) ? mat : [mat];
      for (const m of materials) {
        const std = m as THREE.MeshStandardMaterial;
        if (std.map) std.map.dispose();
        if (std.bumpMap) std.bumpMap.dispose();
        if (std.normalMap) std.normalMap.dispose();
        m.dispose();
      }
    }
  });
  group.clear();
}

export function MuseumEnvironmentBackdrop() {
  const {
    activeTheme,
    pagePalette,
    pagePaletteMeta,
    backdropMode,
    prefersReducedMotion,
    isMobileViewport,
    dragImpulseRef,
    setIsDraggingPlanet
  } = useMuseumTheme();

  const mountRef = useRef<HTMLDivElement | null>(null);
  const [contextLost, setContextLost] = useState(false);
  const [exhibitReady, setExhibitReady] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const webglCaps = useMemo(() => detectBackdropWebGL(), []);
  const lowPerfFallback = useMemo(
    () => shouldUseLowPerfStaticFallback(isMobileViewport),
    [isMobileViewport]
  );

  const useStaticFallback =
    backdropMode === 'static' ||
    prefersReducedMotion ||
    !webglCaps.supported ||
    contextLost ||
    lowPerfFallback;

  // Refs read inside stable Three.js animation loop without tearing down renderer
  const activeThemeRef = useRef<MuseumTheme>(activeTheme);
  const renderedThemeRef = useRef<MuseumTheme>(activeTheme);
  const reducedMotionRef = useRef(prefersReducedMotion);
  const isMobileRef = useRef(isMobileViewport);
  const transitionTimerRef = useRef<number | null>(null);

  useEffect(() => {
    activeThemeRef.current = activeTheme;
  }, [activeTheme]);

  useEffect(() => {
    reducedMotionRef.current = prefersReducedMotion;
  }, [prefersReducedMotion]);

  useEffect(() => {
    isMobileRef.current = isMobileViewport;
  }, [isMobileViewport]);

  // Allow mouse/touch dragging on open backdrop whitespace (never intercepts cards, text, or buttons)
  useEffect(() => {
    if (useStaticFallback) return;
    if (activeTheme !== 'lunar' && activeTheme !== 'mars') return;

    let dragging = false;
    let lastX = 0;
    let lastY = 0;

    const isBackdropArea = (target: EventTarget | null): boolean => {
      if (!(target instanceof HTMLElement)) return false;
      if (
        target.closest(
          'button, a, input, select, textarea, label, [role="button"], [role="dialog"], canvas, figure, aside, form, table, dl, ol, ul, h1, h2, h3, h4, p, span'
        )
      ) {
        return false;
      }
      return true;
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;
      if (!isBackdropArea(e.target)) return;
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      setIsDraggingPlanet(true);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      dragImpulseRef.current.vx += dx * 0.0045;
      dragImpulseRef.current.vy += dy * 0.0032;
    };

    const stopDrag = () => {
      if (!dragging) return;
      dragging = false;
      setIsDraggingPlanet(false);
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', stopDrag);
    window.addEventListener('pointercancel', stopDrag);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', stopDrag);
      window.removeEventListener('pointercancel', stopDrag);
      setIsDraggingPlanet(false);
    };
  }, [useStaticFallback, activeTheme, dragImpulseRef, setIsDraggingPlanet]);

  // Core Three.js museum background renderer lifecycle
  const sceneControllerRef = useRef<{
    rebuildExhibit: (theme: MuseumTheme) => void;
  } | null>(null);

  useEffect(() => {
    if (useStaticFallback) {
      sceneControllerRef.current = null;
      return;
    }

    const mount = mountRef.current;
    if (!mount) return;

    const isSoftwareGl = webglCaps.isSoftwareGl;
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.setPixelRatio(
      isSoftwareGl ? 1 : Math.min(window.devicePixelRatio || 1, 1.5)
    );
    renderer.setSize(mount.clientWidth || window.innerWidth, mount.clientHeight || window.innerHeight);
    renderer.domElement.style.display = 'block';
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    mount.appendChild(renderer.domElement);

    const onContextLost = (e: Event) => {
      e.preventDefault();
      setContextLost(true);
    };
    const onContextRestored = () => {
      setContextLost(false);
    };
    renderer.domElement.addEventListener('webglcontextlost', onContextLost, false);
    renderer.domElement.addEventListener('webglcontextrestored', onContextRestored, false);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      40,
      (mount.clientWidth || window.innerWidth) /
        Math.max(1, mount.clientHeight || window.innerHeight),
      0.1,
      60
    );
    camera.position.set(0, 0, 7.5);

    const pmrem = new THREE.PMREMGenerator(renderer);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = 0.28;
    roomEnv.dispose();
    pmrem.dispose();

    // Solar Key Light + Subtle Planetary Rim Fill
    const keyLight = new THREE.DirectionalLight('#fff8ec', 2.45);
    keyLight.position.set(-5.5, 3.2, 4.5);
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight('#5aa9ff', 0.48);
    rimLight.position.set(6.0, -2.5, -4.0);
    scene.add(rimLight);

    const hemiLight = new THREE.HemisphereLight('#90b8f0', '#0a0f1e', 0.22);
    scene.add(hemiLight);

    const exhibitGroup = new THREE.Group();
    scene.add(exhibitGroup);

    let planetMesh: THREE.Mesh | null = null;
    let starPoints: THREE.Points | null = null;
    let timelineMarkers: {
      mesh: THREE.Mesh;
      rx: number;
      rz: number;
      speed: number;
      phase: number;
      tiltX: number;
      tiltZ: number;
    }[] = [];

    let rotVelY = 0;
    let rotVelX = 0;

    const positionExhibitForViewport = () => {
      const mobile = isMobileRef.current;
      const theme = renderedThemeRef.current;
      if (theme === 'lunar' || theme === 'mars') {
        exhibitGroup.position.set(mobile ? 0.65 : 2.35, mobile ? 1.05 : 0.25, -0.8);
        exhibitGroup.scale.setScalar(mobile ? 0.72 : 1.0);
      } else if (theme === 'timeline') {
        exhibitGroup.position.set(mobile ? 0.3 : 1.7, 0.1, -1.6);
        exhibitGroup.scale.setScalar(mobile ? 0.76 : 1.05);
      } else {
        exhibitGroup.position.set(0, 0, 0);
        exhibitGroup.scale.setScalar(1.0);
      }
    };

    const rebuildExhibit = (theme: MuseumTheme) => {
      renderedThemeRef.current = theme;
      setExhibitReady(false);
      disposeGroupContents(exhibitGroup);
      planetMesh = null;
      starPoints = null;
      timelineMarkers = [];
      rotVelY = 0;
      rotVelX = 0;

      // Always add calibrated starfield for the active museum wing
      starPoints = createStarfieldObject(theme);
      exhibitGroup.add(starPoints);

      const maxAniso = isSoftwareGl
        ? 1
        : renderer.capabilities.getMaxAnisotropy();

      if (theme === 'lunar') {
        keyLight.color.set('#fff9f0');
        keyLight.intensity = 2.65;
        rimLight.color.set('#6daeff');
        rimLight.intensity = 0.36;

        const { map, bumpMap } = createMoonGlobeTextures(
          maxAniso,
          isMobileRef.current || isSoftwareGl
        );
        const geo = new THREE.SphereGeometry(1.78, 56, 42);
        const mat = new THREE.MeshStandardMaterial({
          map,
          bumpMap,
          bumpScale: 0.048,
          roughness: 0.92,
          metalness: 0.03
        });
        planetMesh = new THREE.Mesh(geo, mat);
        planetMesh.rotation.set(0.18, -0.45, 0.06);
        exhibitGroup.add(planetMesh);

        // Subtle cool lunar exosphere/limb halo
        const haloGeo = new THREE.SphereGeometry(1.88, 40, 30);
        const haloMat = createFresnelAtmosphereMaterial('#9dc8ff', 0.36, 4.4);
        exhibitGroup.add(new THREE.Mesh(haloGeo, haloMat));
      } else if (theme === 'mars') {
        keyLight.color.set('#ffe7d1');
        keyLight.intensity = 2.55;
        rimLight.color.set('#e86d3b');
        rimLight.intensity = 0.55;

        const { map, bumpMap } = createMarsGlobeTextures(
          maxAniso,
          isMobileRef.current || isSoftwareGl
        );
        const geo = new THREE.SphereGeometry(1.78, 56, 42);
        const mat = new THREE.MeshStandardMaterial({
          map,
          bumpMap,
          bumpScale: 0.042,
          roughness: 0.86,
          metalness: 0.04
        });
        planetMesh = new THREE.Mesh(geo, mat);
        planetMesh.rotation.set(0.24, -0.8, -0.14);
        exhibitGroup.add(planetMesh);

        // Subtle rusty Martian atmospheric glow
        const atmoGeo = new THREE.SphereGeometry(1.9, 40, 30);
        const atmoMat = createFresnelAtmosphereMaterial('#f07c4a', 0.62, 3.6);
        exhibitGroup.add(new THREE.Mesh(atmoGeo, atmoMat));
      } else if (theme === 'timeline') {
        keyLight.color.set('#dceeff');
        keyLight.intensity = 1.6;
        rimLight.color.set('#f5b041');
        rimLight.intensity = 0.5;

        // Subtle astronomical orbital rings & spacecraft transfer arcs
        const orbits = [
          { rx: 2.0, rz: 1.4, color: '#20B9C9', opacity: 0.28, tiltX: 0.52, tiltZ: -0.22, speed: 0.24 },
          { rx: 2.8, rz: 2.1, color: '#7AA7F7', opacity: 0.22, tiltX: 0.44, tiltZ: 0.16, speed: 0.16 },
          { rx: 3.5, rz: 2.55, color: '#F5B041', opacity: 0.22, tiltX: 0.6, tiltZ: -0.08, speed: 0.11 }
        ];

        orbits.forEach((orb, idx) => {
          const pts: THREE.Vector3[] = [];
          const segments = 96;
          for (let s = 0; s < segments; s++) {
            const a = (s / segments) * Math.PI * 2;
            pts.push(new THREE.Vector3(Math.cos(a) * orb.rx, 0, Math.sin(a) * orb.rz));
          }
          const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
          const lineMat = new THREE.LineBasicMaterial({
            color: orb.color,
            transparent: true,
            opacity: orb.opacity
          });
          const loop = new THREE.LineLoop(lineGeo, lineMat);
          loop.rotation.set(orb.tiltX, 0, orb.tiltZ);
          exhibitGroup.add(loop);

          // Spacecraft trajectory marker bead
          const beadGeo = new THREE.SphereGeometry(0.055, 12, 12);
          const beadMat = new THREE.MeshBasicMaterial({ color: orb.color });
          const bead = new THREE.Mesh(beadGeo, beadMat);
          exhibitGroup.add(bead);
          timelineMarkers.push({
            mesh: bead,
            rx: orb.rx,
            rz: orb.rz,
            speed: orb.speed,
            phase: idx * 2.1,
            tiltX: orb.tiltX,
            tiltZ: orb.tiltZ
          });
        });

        // Subtle central celestial coordinate reference sphere
        const coreGeo = new THREE.SphereGeometry(0.16, 20, 20);
        const coreMat = new THREE.MeshStandardMaterial({
          color: '#20B9C9',
          emissive: '#144c7a',
          emissiveIntensity: 0.65,
          roughness: 0.35
        });
        exhibitGroup.add(new THREE.Mesh(coreGeo, coreMat));
      }

      positionExhibitForViewport();
      if (!isSoftwareGl) {
        renderer.compile(scene, camera);
      }
      // Slight defer triggers CSS opacity fade-in cleanly
      requestAnimationFrame(() => {
        setExhibitReady(true);
        setIsTransitioning(false);
      });
    };

    sceneControllerRef.current = { rebuildExhibit };
    rebuildExhibit(activeThemeRef.current);

    const handleResize = () => {
      const w = mount.clientWidth || window.innerWidth;
      const h = Math.max(1, mount.clientHeight || window.innerHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      positionExhibitForViewport();
    };
    window.addEventListener('resize', handleResize);

    // Pre-allocated math helpers outside render loop
    const _euler = new THREE.Euler();
    const _posVec = new THREE.Vector3();

    let frameId = 0;
    let lastTime = performance.now();
    let elapsed = 0;
    let disposed = false;

    const afterDraw = (cb: () => void) => {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      if (typeof gl.fenceSync !== 'function') {
        frameId = window.setTimeout(cb, 80);
        return;
      }
      const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
      gl.flush();
      const poll = () => {
        if (disposed) {
          if (sync) gl.deleteSync(sync);
          return;
        }
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    };

    const tick = () => {
      if (disposed) return;
      const now = performance.now();
      const delta = Math.min(0.1, (now - lastTime) / 1000);
      lastTime = now;
      elapsed += delta;

      positionExhibitForViewport();

      // Transfer drag impulse into smooth rotational velocity
      if (
        dragImpulseRef.current.vx !== 0 ||
        dragImpulseRef.current.vy !== 0
      ) {
        rotVelY += dragImpulseRef.current.vx;
        rotVelX += dragImpulseRef.current.vy;
        dragImpulseRef.current.vx = 0;
        dragImpulseRef.current.vy = 0;
      }

      if (planetMesh) {
        const idleSpin = reducedMotionRef.current ? 0 : 0.032 * delta;
        planetMesh.rotation.y += idleSpin + rotVelY;
        planetMesh.rotation.x = THREE.MathUtils.clamp(
          planetMesh.rotation.x + rotVelX,
          -0.95,
          0.95
        );
        rotVelY = THREE.MathUtils.damp(rotVelY, 0, 6.5, delta);
        rotVelX = THREE.MathUtils.damp(rotVelX, 0, 6.5, delta);
      }

      if (starPoints && !reducedMotionRef.current) {
        starPoints.rotation.y = elapsed * 0.008;
      }

      if (timelineMarkers.length > 0) {
        const t = reducedMotionRef.current ? 0 : elapsed;
        for (const marker of timelineMarkers) {
          const ang = t * marker.speed + marker.phase;
          _posVec.set(
            Math.cos(ang) * marker.rx,
            0,
            Math.sin(ang) * marker.rz
          );
          _euler.set(marker.tiltX, 0, marker.tiltZ);
          _posVec.applyEuler(_euler);
          marker.mesh.position.copy(_posVec);
        }
      }

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    };

    if (isSoftwareGl) {
      renderer.render(scene, camera);
      afterDraw(tick);
    } else {
      frameId = requestAnimationFrame(tick);
    }

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('webglcontextlost', onContextLost);
      renderer.domElement.removeEventListener('webglcontextrestored', onContextRestored);
      disposeGroupContents(exhibitGroup);
      scene.environment = null;
      envTarget.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      sceneControllerRef.current = null;
    };
  }, [useStaticFallback, webglCaps.isSoftwareGl, dragImpulseRef]);

  // Swap exhibited 3D planet / orbital scene behind a smooth CSS transition overlay
  useEffect(() => {
    if (transitionTimerRef.current !== null) {
      window.clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }

    if (useStaticFallback || !sceneControllerRef.current) {
      renderedThemeRef.current = activeTheme;
      setIsTransitioning(false);
      return;
    }

    // Already displaying this theme (e.g. initial mount or rapid bounce back)
    if (renderedThemeRef.current === activeTheme) {
      setIsTransitioning(false);
      setExhibitReady(true);
      return;
    }

    if (prefersReducedMotion) {
      sceneControllerRef.current.rebuildExhibit(activeTheme);
      setIsTransitioning(false);
      return;
    }

    // Phase 1: Fade out current 3D exhibit while fading in the CSS transition overlay
    setIsTransitioning(true);
    setExhibitReady(false);

    // Phase 2: Once faded behind the overlay, dispose old GPU textures and mount new exhibit
    transitionTimerRef.current = window.setTimeout(() => {
      transitionTimerRef.current = null;
      if (sceneControllerRef.current) {
        sceneControllerRef.current.rebuildExhibit(activeTheme);
      } else {
        setIsTransitioning(false);
      }
    }, 280);

    return () => {
      if (transitionTimerRef.current !== null) {
        window.clearTimeout(transitionTimerRef.current);
        transitionTimerRef.current = null;
      }
    };
  }, [activeTheme, useStaticFallback, prefersReducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-colors duration-700 ease-in-out"
      style={{ backgroundColor: 'var(--museum-bg, #080D1C)' }}
    >
      {/* Subtle static starfield base */}
      <div className="space-starfield absolute inset-0 opacity-85" />

      {/* Stacked crossfading radial theme atmosphere layers (prevents gradient snapping) */}
      {THEME_ORDER.map((themeId) => (
        <div
          key={`atmosphere-${themeId}`}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            pagePalette === 'default' && activeTheme === themeId
              ? 'opacity-100'
              : 'opacity-0'
          }`}
          style={{ background: THEME_ATMOSPHERE_BACKDROPS[themeId] }}
        />
      ))}

      {/* User-selected museum page palette atmosphere layer */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          pagePalette !== 'default' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `radial-gradient(circle at 80% 22%, ${pagePaletteMeta.atmosphereRgba} 0%, rgba(${pagePaletteMeta.scrimRgb}, 0.88) 60%, rgba(${pagePaletteMeta.scrimRgb}, 0.96) 100%)`
        }}
      />

      {/* Three.js Interactive Museum Exhibit Layer (only 1 planet/exhibit loaded at a time) */}
      {!useStaticFallback && (
        <div
          ref={mountRef}
          className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
            exhibitReady ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* CSS Transition Overlay: bridges theme & 3D exhibit swaps without visual snapping */}
      <div
        data-testid="museum-theme-transition-overlay"
        className={`pointer-events-none absolute inset-0 transition-opacity ease-in-out ${
          isTransitioning
            ? 'opacity-95 duration-300'
            : 'opacity-0 duration-500'
        }`}
        style={{ background: THEME_TRANSITION_VEILS[activeTheme] }}
      />

      {/* Stacked crossfading directional readability scrims (keeps primary text & cards crisp) */}
      {THEME_ORDER.map((themeId) => (
        <div
          key={`scrim-${themeId}`}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            pagePalette === 'default' && activeTheme === themeId
              ? 'opacity-100'
              : 'opacity-0'
          }`}
          style={{ background: THEME_READABILITY_SCRIMS[themeId] }}
        />
      ))}

      {/* User-selected museum page palette directional readability scrim */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
          pagePalette !== 'default' ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: `linear-gradient(90deg, rgba(${pagePaletteMeta.scrimRgb},0.9) 0%, rgba(${pagePaletteMeta.scrimRgb},0.65) 54%, rgba(${pagePaletteMeta.scrimRgb},0.26) 100%)`
        }}
      />
    </div>
  );
}
