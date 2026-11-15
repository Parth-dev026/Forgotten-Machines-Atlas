import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import {
  createContactShadowTexture,
  createPlanetaryRegolithTextures
} from './proceduralTextures';

interface PlanetaryEnvironmentProps {
  environment: 'Moon' | 'Mars';
  equipmentId: string;
  isSoftwareGl: boolean;
}

const ROCK_LAYOUT: {
  pos: [number, number, number];
  scale: [number, number, number];
  rot: [number, number, number];
}[] = [
  { pos: [-3.4, 0.14, 2.2], scale: [0.38, 0.22, 0.3], rot: [0.2, 0.8, 0.1] },
  { pos: [3.6, 0.12, -1.9], scale: [0.34, 0.18, 0.28], rot: [0.1, 1.4, 0.3] },
  { pos: [-2.8, 0.1, -3.1], scale: [0.26, 0.16, 0.24], rot: [0.4, 0.3, 0.2] },
  { pos: [2.9, 0.18, 3.2], scale: [0.45, 0.26, 0.36], rot: [0.2, 2.1, 0.1] },
  { pos: [-4.6, 0.24, -0.8], scale: [0.58, 0.32, 0.44], rot: [0.1, 0.5, 0.3] },
  { pos: [4.8, 0.2, 1.4], scale: [0.5, 0.25, 0.42], rot: [0.3, 1.1, 0.2] },
  { pos: [0.4, 0.11, -4.1], scale: [0.32, 0.19, 0.28], rot: [0.2, 1.9, 0.1] },
  { pos: [-1.3, 0.08, 3.8], scale: [0.22, 0.14, 0.2], rot: [0.1, 0.7, 0.2] }
];

export function PlanetaryEnvironment({
  environment,
  equipmentId,
  isSoftwareGl
}: PlanetaryEnvironmentProps) {
  const { gl, scene } = useThree();

  // Procedural IBL via RoomEnvironment + PMREMGenerator (zero external HDR files)
  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const roomEnv = new RoomEnvironment();
    const envTarget = pmrem.fromScene(roomEnv, 0.04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = environment === 'Moon' ? 0.42 : 0.58;

    return () => {
      scene.environment = null;
      envTarget.dispose();
      roomEnv.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, environment]);

  const maxAniso = useMemo(
    () => (isSoftwareGl ? 1 : gl.capabilities.getMaxAnisotropy()),
    [gl, isSoftwareGl]
  );

  const regolith = useMemo(
    () => createPlanetaryRegolithTextures(environment, maxAniso),
    [environment, maxAniso]
  );

  const shadowTex = useMemo(() => createContactShadowTexture(), []);

  useEffect(() => {
    return () => {
      regolith.map.dispose();
      regolith.bumpMap.dispose();
    };
  }, [regolith]);

  useEffect(() => {
    return () => {
      shadowTex.dispose();
    };
  }, [shadowTex]);

  // Sculpted outer crater/dune terrain geometry while keeping central landing pad flat at y = 0
  const terrainGeometry = useMemo(() => {
    const geo = new THREE.CircleGeometry(36, 96);
    geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const dist = Math.hypot(x, z);
      if (dist > 2.8) {
        const blend = Math.min(1, (dist - 2.8) / 6.0);
        const wave =
          Math.sin(x * 0.28) * Math.cos(z * 0.24) * 0.42 +
          Math.sin(dist * 0.35) * 0.24;
        const rim = dist > 14 ? (dist - 14) * 0.085 : 0;
        pos.setY(i, (wave + rim) * blend);
      }
    }
    geo.computeVertexNormals();
    return geo;
  }, []);

  useEffect(() => {
    return () => terrainGeometry.dispose();
  }, [terrainGeometry]);

  // Deterministic starfield for Moon & subtle high-altitude Mars twilight
  const starsGeometry = useMemo(() => {
    const count = 420;
    const positions = new Float32Array(count * 3);
    let seed = 1969;
    const next = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < count; i++) {
      const theta = next() * Math.PI * 2;
      const phi = Math.acos(0.12 + next() * 0.88);
      const r = 38 + next() * 14;
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.cos(phi);
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  useEffect(() => {
    return () => starsGeometry.dispose();
  }, [starsGeometry]);

  const bgHex = environment === 'Moon' ? '#050811' : '#28140f';
  const rockColor = environment === 'Moon' ? '#4f5561' : '#5e3224';
  const isViking2 = equipmentId === 'viking-2-lander';
  const isSpirit = equipmentId === 'spirit-rover';

  return (
    <>
      <color attach="background" args={[bgHex]} />
      <fogExp2 attach="fog" args={[bgHex, environment === 'Moon' ? 0.026 : 0.032]} />

      {/* Primary Planetary Sunlight */}
      <directionalLight
        position={environment === 'Moon' ? [9, 11, 6] : [8, 10, 7]}
        intensity={environment === 'Moon' ? 2.4 : 2.15}
        color={environment === 'Moon' ? '#fff8ec' : '#ffdcc2'}
        castShadow={!isSoftwareGl}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={1}
        shadow-camera-far={28}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
        shadow-bias={-0.0005}
      />

      {/* Rim Backlight to Separate Hardware Silhouette */}
      <directionalLight
        position={[-7, 5, -7]}
        intensity={environment === 'Moon' ? 0.75 : 0.65}
        color={environment === 'Moon' ? '#6ca4ff' : '#d68f70'}
      />

      {/* Sky / Ground Bounce Fill */}
      <hemisphereLight
        args={[
          environment === 'Moon' ? '#8fb3e8' : '#e3a688',
          environment === 'Moon' ? '#2c313b' : '#4a2419',
          environment === 'Moon' ? 0.45 : 0.72
        ]}
      />

      {/* Starfield (crisp in lunar vacuum, faint high-altitude glow on Mars) */}
      <points geometry={starsGeometry}>
        <pointsMaterial
          size={environment === 'Moon' ? 0.14 : 0.08}
          color="#e6edf7"
          transparent
          opacity={environment === 'Moon' ? 0.85 : 0.25}
          sizeAttenuation
        />
      </points>

      {/* Planetary Regolith Ground Plane */}
      <mesh geometry={terrainGeometry} receiveShadow={!isSoftwareGl}>
        <meshStandardMaterial
          map={regolith.map}
          bumpMap={regolith.bumpMap}
          bumpScale={environment === 'Moon' ? 0.05 : 0.04}
          roughness={0.94}
          metalness={0.02}
        />
      </mesh>

      {/* Soft Grounded Radial Contact Shadow Beneath Craft */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.006, 0]}>
        <planeGeometry args={[4.4, 4.4]} />
        <meshBasicMaterial
          map={shadowTex}
          transparent
          opacity={0.78}
          depthWrite={false}
        />
      </mesh>

      {/* Spirit "Troy" bright silica/sulfate sand patch */}
      {isSpirit && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.72, 0.008, -0.78]}>
          <circleGeometry args={[0.95, 32]} />
          <meshStandardMaterial
            color="#d8cbb8"
            roughness={0.96}
            metalness={0.0}
          />
        </mesh>
      )}

      {/* Scattered Basalt / Regolith Rocks */}
      {ROCK_LAYOUT.map((rock, idx) => (
        <group key={idx} position={rock.pos} rotation={rock.rot}>
          <mesh scale={rock.scale} castShadow={!isSoftwareGl} receiveShadow={!isSoftwareGl}>
            <dodecahedronGeometry args={[1, 0]} />
            <meshStandardMaterial
              color={rockColor}
              roughness={0.9}
              metalness={0.05}
              flatShading
            />
          </mesh>
          {/* Seasonal water-ice frost patches for Viking 2 Utopia Planitia */}
          {isViking2 && idx % 2 === 0 && (
            <mesh position={[0, rock.scale[1] * 0.55, 0]} scale={[rock.scale[0] * 0.72, 0.04, rock.scale[2] * 0.72]}>
              <dodecahedronGeometry args={[1, 0]} />
              <meshStandardMaterial
                color="#dce8f5"
                roughness={0.55}
                metalness={0.02}
              />
            </mesh>
          )}
        </group>
      ))}
    </>
  );
}
