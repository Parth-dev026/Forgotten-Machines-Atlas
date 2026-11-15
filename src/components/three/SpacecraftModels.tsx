import { useEffect, useMemo, useState } from 'react';
import * as THREE from 'three';
import { ThreeEvent } from '@react-three/fiber';
import {
  createKaptonFoilTexture,
  createSolarPanelTexture
} from './proceduralTextures';

interface SpacecraftModelProps {
  equipmentId: string;
  selectedHotspotId: string | null;
  hoveredHotspotId?: string | null;
  onSelectHotspot: (hotspotId: string) => void;
  onHoverHotspot?: (hotspotId: string | null) => void;
  isSoftwareGl: boolean;
}

function usePartInteraction(
  selectedHotspotId: string | null,
  hoveredId: string | null,
  setHoveredId: (id: string | null) => void,
  onSelectHotspot: (id: string) => void
) {
  return (hotspotId: string) => ({
    onClick: (e: ThreeEvent<MouseEvent>) => {
      e.stopPropagation();
      onSelectHotspot(hotspotId);
    },
    onPointerOver: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHoveredId(hotspotId);
      document.body.style.cursor = 'pointer';
    },
    onPointerOut: (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      setHoveredId(null);
      document.body.style.cursor = 'default';
    },
    emissive:
      selectedHotspotId === hotspotId || hoveredId === hotspotId
        ? '#20B9C9'
        : '#000000',
    emissiveIntensity:
      selectedHotspotId === hotspotId
        ? 0.48
        : hoveredId === hotspotId
        ? 0.24
        : 0
  });
}

function ApolloLMDescentModel({
  selectedHotspotId,
  hoveredHotspotId,
  onSelectHotspot,
  onHoverHotspot,
  isSoftwareGl
}: Omit<SpacecraftModelProps, 'equipmentId'>) {
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const hoveredId = hoveredHotspotId !== undefined ? hoveredHotspotId : localHoveredId;
  const setHoveredId = onHoverHotspot || setLocalHoveredId;
  const kapton = useMemo(() => createKaptonFoilTexture(), []);
  const cast = !isSoftwareGl;

  useEffect(() => {
    return () => {
      kapton.map.dispose();
      kapton.bumpMap.dispose();
    };
  }, [kapton]);

  const bellGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0.14, 0.45),
      new THREE.Vector2(0.19, 0.32),
      new THREE.Vector2(0.32, 0.14),
      new THREE.Vector2(0.42, 0)
    ];
    return new THREE.LatheGeometry(pts, 28);
  }, []);

  useEffect(() => () => bellGeo.dispose(), [bellGeo]);

  const getPart = usePartInteraction(
    selectedHotspotId,
    hoveredId,
    setHoveredId,
    onSelectHotspot
  );

  const legAngles = [
    Math.PI * 0.25,
    Math.PI * 0.75,
    Math.PI * 1.25,
    Math.PI * 1.75
  ];

  const hullPart = getPart('kapton-hull');
  const gearPart = getPart('landing-gear');
  const enginePart = getPart('descent-engine');
  const ladderPart = getPart('egress-ladder');
  const deckPart = getPart('ascent-interface');

  return (
    <group>
      {/* Primary Octagonal Kapton Descent Body */}
      <mesh
        position={[0, 1.18, 0]}
        rotation={[0, Math.PI / 8, 0]}
        castShadow={cast}
        receiveShadow={cast}
        onClick={hullPart.onClick}
        onPointerOver={hullPart.onPointerOver}
        onPointerOut={hullPart.onPointerOut}
      >
        <cylinderGeometry args={[1.38, 1.38, 1.08, 8]} />
        <meshStandardMaterial
          map={kapton.map}
          bumpMap={kapton.bumpMap}
          bumpScale={0.03}
          metalness={0.82}
          roughness={0.3}
          emissive={hullPart.emissive}
          emissiveIntensity={hullPart.emissiveIntensity}
        />
      </mesh>

      {/* Upper Ascent-Interface Blast Deck & Propellant Tanks */}
      <group
        onClick={deckPart.onClick}
        onPointerOver={deckPart.onPointerOver}
        onPointerOut={deckPart.onPointerOut}
      >
        <mesh position={[0, 1.75, 0]} rotation={[0, Math.PI / 8, 0]} castShadow={cast}>
          <cylinderGeometry args={[1.18, 1.32, 0.1, 8]} />
          <meshStandardMaterial
            color="#98a2b3"
            metalness={0.72}
            roughness={0.38}
            emissive={deckPart.emissive}
            emissiveIntensity={deckPart.emissiveIntensity}
          />
        </mesh>
        <mesh position={[0, 1.83, 0]} castShadow={cast}>
          <torusGeometry args={[0.76, 0.05, 12, 32]} />
          <meshStandardMaterial
            color="#c69830"
            metalness={0.8}
            roughness={0.28}
            emissive={deckPart.emissive}
            emissiveIntensity={deckPart.emissiveIntensity}
          />
        </mesh>
        {[
          [0.52, 0],
          [-0.52, 0],
          [0, 0.52],
          [0, -0.52]
        ].map(([x, z], idx) => (
          <mesh key={idx} position={[x, 1.78, z]} castShadow={cast}>
            <sphereGeometry args={[0.24, 18, 18]} />
            <meshStandardMaterial
              color="#bcc5d4"
              metalness={0.65}
              roughness={0.35}
              emissive={deckPart.emissive}
              emissiveIntensity={deckPart.emissiveIntensity}
            />
          </mesh>
        ))}
      </group>

      {/* Descent Propulsion System Nozzle */}
      <mesh
        geometry={bellGeo}
        position={[0, 0.25, 0]}
        castShadow={cast}
        onClick={enginePart.onClick}
        onPointerOver={enginePart.onPointerOver}
        onPointerOut={enginePart.onPointerOut}
      >
        <meshStandardMaterial
          color="#373c46"
          metalness={0.78}
          roughness={0.36}
          side={THREE.DoubleSide}
          emissive={enginePart.emissive}
          emissiveIntensity={enginePart.emissiveIntensity}
        />
      </mesh>

      {/* 4 Splayed Landing Gear Struts & Circular Footpads flush at y=0 */}
      <group
        onClick={gearPart.onClick}
        onPointerOver={gearPart.onPointerOver}
        onPointerOut={gearPart.onPointerOut}
      >
        {legAngles.map((angle, idx) => {
          const padR = 2.08;
          const px = Math.cos(angle) * padR;
          const pz = Math.sin(angle) * padR;
          const topR = 1.28;
          const tx = Math.cos(angle) * topR;
          const tz = Math.sin(angle) * topR;

          return (
            <group key={idx}>
              {/* Dish Footpad resting flush at y=0 */}
              <mesh position={[px, 0.04, pz]} castShadow={cast} receiveShadow={cast}>
                <cylinderGeometry args={[0.32, 0.38, 0.08, 24]} />
                <meshStandardMaterial
                  map={kapton.map}
                  metalness={0.8}
                  roughness={0.34}
                  emissive={gearPart.emissive}
                  emissiveIntensity={gearPart.emissiveIntensity}
                />
              </mesh>
              {/* Primary Vertical/Angled Shock Strut */}
              <mesh
                position={[(px + tx) / 2, 0.72, (pz + tz) / 2]}
                rotation={[0, -angle, 0.44]}
                castShadow={cast}
              >
                <cylinderGeometry args={[0.055, 0.048, 1.56, 12]} />
                <meshStandardMaterial
                  map={kapton.map}
                  metalness={0.78}
                  roughness={0.32}
                  emissive={gearPart.emissive}
                  emissiveIntensity={gearPart.emissiveIntensity}
                />
              </mesh>
              {/* Lower Drag Bracing Strut */}
              <mesh
                position={[(px + tx * 0.78) / 2, 0.46, (pz + tz * 0.78) / 2]}
                rotation={[0, -angle, 0.94]}
                castShadow={cast}
              >
                <cylinderGeometry args={[0.032, 0.032, 1.24, 10]} />
                <meshStandardMaterial
                  color="#aeb7c4"
                  metalness={0.7}
                  roughness={0.4}
                  emissive={gearPart.emissive}
                  emissiveIntensity={gearPart.emissiveIntensity}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Forward Crew Egress Porch & 9-Rung Ladder */}
      <group
        position={[0, 0, 1.46]}
        onClick={ladderPart.onClick}
        onPointerOver={ladderPart.onPointerOver}
        onPointerOut={ladderPart.onPointerOut}
      >
        {/* Porch platform */}
        <mesh position={[0, 1.62, -0.05]} castShadow={cast}>
          <boxGeometry args={[0.72, 0.06, 0.42]} />
          <meshStandardMaterial
            color="#c3ccd8"
            metalness={0.68}
            roughness={0.42}
            emissive={ladderPart.emissive}
            emissiveIntensity={ladderPart.emissiveIntensity}
          />
        </mesh>
        {/* Ladder Rails */}
        {[-0.18, 0.18].map((rx, idx) => (
          <mesh key={idx} position={[rx, 0.96, 0.2]} rotation={[-0.22, 0, 0]} castShadow={cast}>
            <cylinderGeometry args={[0.022, 0.022, 1.38, 8]} />
            <meshStandardMaterial
              color="#d8dee9"
              metalness={0.72}
              roughness={0.35}
              emissive={ladderPart.emissive}
              emissiveIntensity={ladderPart.emissiveIntensity}
            />
          </mesh>
        ))}
        {/* Ladder Rungs */}
        {Array.from({ length: 7 }).map((_, rIdx) => {
          const ry = 0.42 + rIdx * 0.18;
          const rz = 0.32 - rIdx * 0.04;
          return (
            <mesh key={rIdx} position={[0, ry, rz]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.015, 0.015, 0.36, 8]} />
              <meshStandardMaterial color="#e5e9f0" metalness={0.7} roughness={0.35} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
}

function LunarRovingVehicleModel({
  selectedHotspotId,
  hoveredHotspotId,
  onSelectHotspot,
  onHoverHotspot,
  isSoftwareGl
}: Omit<SpacecraftModelProps, 'equipmentId'>) {
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const hoveredId = hoveredHotspotId !== undefined ? hoveredHotspotId : localHoveredId;
  const setHoveredId = onHoverHotspot || setLocalHoveredId;
  const kapton = useMemo(() => createKaptonFoilTexture(), []);
  const cast = !isSoftwareGl;

  useEffect(() => {
    return () => {
      kapton.map.dispose();
      kapton.bumpMap.dispose();
    };
  }, [kapton]);

  const dishGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.18, 0.04),
      new THREE.Vector2(0.36, 0.12),
      new THREE.Vector2(0.48, 0.24)
    ];
    return new THREE.LatheGeometry(pts, 24);
  }, []);

  useEffect(() => () => dishGeo.dispose(), [dishGeo]);

  const getPart = usePartInteraction(
    selectedHotspotId,
    hoveredId,
    setHoveredId,
    onSelectHotspot
  );

  const wheelPart = getPart('mesh-wheels');
  const dishPart = getPart('high-gain-dish');
  const navPart = getPart('nav-console');
  const seatPart = getPart('crew-seats');
  const batPart = getPart('battery-bay');

  const wheelPositions: [number, number, number][] = [
    [-0.95, 0.36, 1.12],
    [0.95, 0.36, 1.12],
    [-0.95, 0.36, -1.12],
    [0.95, 0.36, -1.12]
  ];

  return (
    <group>
      {/* Main Aluminum Spaceframe Chassis */}
      <mesh position={[0, 0.44, 0]} castShadow={cast} receiveShadow={cast}>
        <boxGeometry args={[1.38, 0.1, 2.55]} />
        <meshStandardMaterial color="#c8cfd8" metalness={0.76} roughness={0.36} />
      </mesh>

      {/* 4 Wire-Mesh Wheels & Fenders */}
      <group
        onClick={wheelPart.onClick}
        onPointerOver={wheelPart.onPointerOver}
        onPointerOut={wheelPart.onPointerOut}
      >
        {wheelPositions.map(([wx, wy, wz], idx) => (
          <group key={idx} position={[wx, wy, wz]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow={cast} receiveShadow={cast}>
              <cylinderGeometry args={[0.36, 0.36, 0.22, 24]} />
              <meshStandardMaterial
                color="#7c8491"
                metalness={0.62}
                roughness={0.68}
                emissive={wheelPart.emissive}
                emissiveIntensity={wheelPart.emissiveIntensity}
              />
            </mesh>
            {/* Gold/Titanium Hub Cap */}
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.14, 0.14, 0.25, 16]} />
              <meshStandardMaterial
                color="#c89a38"
                metalness={0.8}
                roughness={0.32}
                emissive={wheelPart.emissive}
                emissiveIntensity={wheelPart.emissiveIntensity}
              />
            </mesh>
            {/* Curved Dust Fender */}
            <mesh position={[0, 0.36, 0]} rotation={[0, Math.PI / 2, 0]} castShadow={cast}>
              <cylinderGeometry args={[0.42, 0.42, 0.26, 16, 1, true, -0.8, 1.6]} />
              <meshStandardMaterial
                color="#dbe1ea"
                metalness={0.3}
                roughness={0.55}
                side={THREE.DoubleSide}
                emissive={wheelPart.emissive}
                emissiveIntensity={wheelPart.emissiveIntensity}
              />
            </mesh>
          </group>
        ))}
      </group>

      {/* Dual 36V Silver-Zinc Battery & Electronics Bay */}
      <mesh
        position={[0, 0.58, 0.96]}
        castShadow={cast}
        onClick={batPart.onClick}
        onPointerOver={batPart.onPointerOver}
        onPointerOut={batPart.onPointerOut}
      >
        <boxGeometry args={[1.05, 0.24, 0.56]} />
        <meshStandardMaterial
          map={kapton.map}
          bumpMap={kapton.bumpMap}
          bumpScale={0.02}
          metalness={0.78}
          roughness={0.32}
          emissive={batPart.emissive}
          emissiveIntensity={batPart.emissiveIntensity}
        />
      </mesh>

      {/* Twin Tubular Crew Seats & Rear Equipment Rack */}
      <group
        onClick={seatPart.onClick}
        onPointerOver={seatPart.onPointerOver}
        onPointerOut={seatPart.onPointerOut}
      >
        {[-0.38, 0.38].map((sx, idx) => (
          <group key={idx} position={[sx, 0.56, -0.25]}>
            {/* Seat Pan */}
            <mesh castShadow={cast}>
              <boxGeometry args={[0.46, 0.06, 0.48]} />
              <meshStandardMaterial
                color="#b8c1cf"
                metalness={0.65}
                roughness={0.48}
                emissive={seatPart.emissive}
                emissiveIntensity={seatPart.emissiveIntensity}
              />
            </mesh>
            {/* Seat Backrest */}
            <mesh position={[0, 0.28, -0.22]} rotation={[-0.18, 0, 0]} castShadow={cast}>
              <boxGeometry args={[0.44, 0.52, 0.06]} />
              <meshStandardMaterial
                color="#a5b0c0"
                metalness={0.65}
                roughness={0.48}
                emissive={seatPart.emissive}
                emissiveIntensity={seatPart.emissiveIntensity}
              />
            </mesh>
          </group>
        ))}
        {/* Aft Lunar Tools Rack */}
        <mesh position={[0, 0.64, -1.05]} castShadow={cast}>
          <boxGeometry args={[1.15, 0.28, 0.42]} />
          <meshStandardMaterial
            color="#5a6372"
            metalness={0.55}
            roughness={0.5}
            emissive={seatPart.emissive}
            emissiveIntensity={seatPart.emissiveIntensity}
          />
        </mesh>
      </group>

      {/* Dead-Reckoning Navigation Console & T-Handle */}
      <group
        position={[0, 0.85, 0.42]}
        onClick={navPart.onClick}
        onPointerOver={navPart.onPointerOver}
        onPointerOut={navPart.onPointerOut}
      >
        <mesh rotation={[-0.4, 0, 0]} castShadow={cast}>
          <cylinderGeometry args={[0.025, 0.025, 0.72, 10]} />
          <meshStandardMaterial
            color="#d0d7e2"
            metalness={0.7}
            roughness={0.35}
            emissive={navPart.emissive}
            emissiveIntensity={navPart.emissiveIntensity}
          />
        </mesh>
        <mesh position={[0, 0.24, 0.08]} rotation={[-0.35, 0, 0]} castShadow={cast}>
          <boxGeometry args={[0.3, 0.2, 0.1]} />
          <meshStandardMaterial
            color="#262c36"
            metalness={0.4}
            roughness={0.55}
            emissive={navPart.emissive}
            emissiveIntensity={navPart.emissiveIntensity}
          />
        </mesh>
      </group>

      {/* Forward High-Gain Umbrella Dish & LCRU Mast */}
      <group
        position={[0.34, 0.72, 1.18]}
        onClick={dishPart.onClick}
        onPointerOver={dishPart.onPointerOver}
        onPointerOut={dishPart.onPointerOut}
      >
        <mesh position={[0, 0.36, 0]} castShadow={cast}>
          <cylinderGeometry args={[0.022, 0.026, 0.78, 10]} />
          <meshStandardMaterial
            color="#d8dee9"
            metalness={0.75}
            roughness={0.32}
            emissive={dishPart.emissive}
            emissiveIntensity={dishPart.emissiveIntensity}
          />
        </mesh>
        <mesh
          geometry={dishGeo}
          position={[0, 0.78, 0.06]}
          rotation={[0.72, 0, 0]}
          castShadow={cast}
        >
          <meshStandardMaterial
            color="#d4a748"
            metalness={0.85}
            roughness={0.3}
            side={THREE.DoubleSide}
            emissive={dishPart.emissive}
            emissiveIntensity={dishPart.emissiveIntensity}
          />
        </mesh>
      </group>

      {/* Forward Color TV Camera Turret */}
      <mesh position={[-0.36, 0.92, 1.14]} castShadow={cast}>
        <boxGeometry args={[0.16, 0.16, 0.28]} />
        <meshStandardMaterial color="#e5e9f0" metalness={0.45} roughness={0.4} />
      </mesh>
    </group>
  );
}

function AlsepModel({
  selectedHotspotId,
  hoveredHotspotId,
  onSelectHotspot,
  onHoverHotspot,
  isSoftwareGl
}: Omit<SpacecraftModelProps, 'equipmentId'>) {
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const hoveredId = hoveredHotspotId !== undefined ? hoveredHotspotId : localHoveredId;
  const setHoveredId = onHoverHotspot || setLocalHoveredId;
  const cast = !isSoftwareGl;
  const getPart = usePartInteraction(
    selectedHotspotId,
    hoveredId,
    setHoveredId,
    onSelectHotspot
  );

  const cableGeo1 = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.22, 0.04, 0.12),
      new THREE.Vector3(-0.65, 0.025, 0.34),
      new THREE.Vector3(-1.05, 0.04, 0.5)
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.025, 6, false);
  }, []);

  const cableGeo2 = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.24, 0.04, 0.12),
      new THREE.Vector3(0.75, 0.025, 0.42),
      new THREE.Vector3(1.18, 0.04, 0.6)
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.025, 6, false);
  }, []);

  const cableGeo3 = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0.1, 0.04, -0.22),
      new THREE.Vector3(0.28, 0.025, -0.7),
      new THREE.Vector3(0.45, 0.04, -1.12)
    ]);
    return new THREE.TubeGeometry(curve, 20, 0.022, 6, false);
  }, []);

  useEffect(() => {
    return () => {
      cableGeo1.dispose();
      cableGeo2.dispose();
      cableGeo3.dispose();
    };
  }, [cableGeo1, cableGeo2, cableGeo3]);

  const rtgPart = getPart('snap27-rtg');
  const centralPart = getPart('central-station');
  const seismPart = getPart('seismometer');
  const magPart = getPart('magnetometer');

  return (
    <group>
      {/* Central Station Electronics & Mast */}
      <group
        onClick={centralPart.onClick}
        onPointerOver={centralPart.onPointerOver}
        onPointerOut={centralPart.onPointerOut}
      >
        <mesh position={[0, 0.24, 0]} castShadow={cast} receiveShadow={cast}>
          <boxGeometry args={[0.68, 0.48, 0.58]} />
          <meshStandardMaterial
            color="#d8dee8"
            metalness={0.55}
            roughness={0.42}
            emissive={centralPart.emissive}
            emissiveIntensity={centralPart.emissiveIntensity}
          />
        </mesh>
        <mesh position={[0, 0.92, 0]} castShadow={cast}>
          <cylinderGeometry args={[0.028, 0.032, 0.96, 12]} />
          <meshStandardMaterial
            color="#aeb7c4"
            metalness={0.75}
            roughness={0.32}
            emissive={centralPart.emissive}
            emissiveIntensity={centralPart.emissiveIntensity}
          />
        </mesh>
        <mesh position={[0, 1.42, 0]} castShadow={cast}>
          <cylinderGeometry args={[0.09, 0.09, 0.22, 16]} />
          <meshStandardMaterial color="#c99c38" metalness={0.82} roughness={0.28} />
        </mesh>
      </group>

      {/* SNAP-27 Finned RTG Cylinder */}
      <group
        position={[-1.15, 0, 0.55]}
        onClick={rtgPart.onClick}
        onPointerOver={rtgPart.onPointerOver}
        onPointerOut={rtgPart.onPointerOut}
      >
        <mesh position={[0, 0.26, 0]} castShadow={cast} receiveShadow={cast}>
          <cylinderGeometry args={[0.16, 0.16, 0.52, 20]} />
          <meshStandardMaterial
            color="#353b45"
            metalness={0.7}
            roughness={0.42}
            emissive={rtgPart.emissive}
            emissiveIntensity={rtgPart.emissiveIntensity}
          />
        </mesh>
        {/* Radiator Fins */}
        {[0, 1, 2, 3].map((idx) => (
          <mesh key={idx} position={[0, 0.26, 0]} rotation={[0, (idx * Math.PI) / 4, 0]} castShadow={cast}>
            <boxGeometry args={[0.52, 0.44, 0.025]} />
            <meshStandardMaterial
              color="#4f5764"
              metalness={0.78}
              roughness={0.36}
              emissive={rtgPart.emissive}
              emissiveIntensity={rtgPart.emissiveIntensity}
            />
          </mesh>
        ))}
      </group>

      {/* Passive Seismic Experiment & Mylar Shroud */}
      <group
        position={[1.25, 0, 0.65]}
        onClick={seismPart.onClick}
        onPointerOver={seismPart.onPointerOver}
        onPointerOut={seismPart.onPointerOut}
      >
        <mesh position={[0, 0.04, 0]} receiveShadow={cast}>
          <cylinderGeometry args={[0.52, 0.58, 0.06, 24]} />
          <meshStandardMaterial
            color="#c69732"
            metalness={0.86}
            roughness={0.26}
            emissive={seismPart.emissive}
            emissiveIntensity={seismPart.emissiveIntensity}
          />
        </mesh>
        <mesh position={[0, 0.22, 0]} castShadow={cast}>
          <cylinderGeometry args={[0.2, 0.22, 0.34, 20]} />
          <meshStandardMaterial
            color="#dfe6f0"
            metalness={0.78}
            roughness={0.26}
            emissive={seismPart.emissive}
            emissiveIntensity={seismPart.emissiveIntensity}
          />
        </mesh>
      </group>

      {/* Lunar Surface Magnetometer 3-Axis Boom */}
      <group
        position={[0.45, 0, -1.2]}
        onClick={magPart.onClick}
        onPointerOver={magPart.onPointerOver}
        onPointerOut={magPart.onPointerOut}
      >
        <mesh position={[0, 0.12, 0]} castShadow={cast}>
          <boxGeometry args={[0.28, 0.24, 0.28]} />
          <meshStandardMaterial
            color="#cbd4e0"
            metalness={0.62}
            roughness={0.44}
            emissive={magPart.emissive}
            emissiveIntensity={magPart.emissiveIntensity}
          />
        </mesh>
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((ang, idx) => (
          <group key={idx} rotation={[0, ang, 0]}>
            <mesh position={[0.24, 0.26, 0]} rotation={[0, 0, -0.78]} castShadow={cast}>
              <cylinderGeometry args={[0.018, 0.018, 0.44, 8]} />
              <meshStandardMaterial
                color="#a8b2c0"
                metalness={0.75}
                roughness={0.35}
                emissive={magPart.emissive}
                emissiveIntensity={magPart.emissiveIntensity}
              />
            </mesh>
            <mesh position={[0.4, 0.42, 0]} castShadow={cast}>
              <sphereGeometry args={[0.055, 12, 12]} />
              <meshStandardMaterial color="#d2a33c" metalness={0.82} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Ribbon Cables */}
      {[cableGeo1, cableGeo2, cableGeo3].map((geo, idx) => (
        <mesh key={idx} geometry={geo}>
          <meshStandardMaterial color="#4a5362" metalness={0.2} roughness={0.82} />
        </mesh>
      ))}
    </group>
  );
}

function SurveyorModel({
  withScoop,
  selectedHotspotId,
  hoveredHotspotId,
  onSelectHotspot,
  onHoverHotspot,
  isSoftwareGl
}: Omit<SpacecraftModelProps, 'equipmentId'> & { withScoop: boolean }) {
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const hoveredId = hoveredHotspotId !== undefined ? hoveredHotspotId : localHoveredId;
  const setHoveredId = onHoverHotspot || setLocalHoveredId;
  const solarTex = useMemo(() => createSolarPanelTexture(false), []);
  const cast = !isSoftwareGl;

  useEffect(() => () => solarTex.dispose(), [solarTex]);

  const getPart = usePartInteraction(
    selectedHotspotId,
    hoveredId,
    setHoveredId,
    onSelectHotspot
  );

  const tripodId = withScoop ? 'tilted-tripod' : 'tripod-frame';
  const cameraId = withScoop ? 'tv-camera' : 'tv-turret';
  const tripodPart = getPart(tripodId);
  const mastPart = getPart('solar-mast');
  const camPart = getPart(cameraId);
  const scoopPart = getPart('soil-scoop');

  const legAngles = [0, (Math.PI * 2) / 3, (Math.PI * 4) / 3];

  return (
    <group rotation={withScoop ? [0.1, 0.25, -0.18] : [0, 0, 0]} position={withScoop ? [0, 0.16, 0] : [0, 0, 0]}>
      {/* Central Triangular Spaceframe */}
      <group
        onClick={tripodPart.onClick}
        onPointerOver={tripodPart.onPointerOver}
        onPointerOut={tripodPart.onPointerOut}
      >
        <mesh position={[0, 0.78, 0]} castShadow={cast}>
          <cylinderGeometry args={[0.68, 0.78, 0.18, 3]} />
          <meshStandardMaterial
            color="#d4dce7"
            metalness={0.78}
            roughness={0.34}
            emissive={tripodPart.emissive}
            emissiveIntensity={tripodPart.emissiveIntensity}
          />
        </mesh>

        {/* 3 Splayed Landing Legs & Circular Footpads */}
        {legAngles.map((ang, idx) => {
          const px = Math.cos(ang) * 1.38;
          const pz = Math.sin(ang) * 1.38;
          return (
            <group key={idx}>
              <mesh position={[px, 0.04, pz]} castShadow={cast} receiveShadow={cast}>
                <cylinderGeometry args={[0.24, 0.28, 0.08, 20]} />
                <meshStandardMaterial
                  color="#b2bac6"
                  metalness={0.72}
                  roughness={0.42}
                  emissive={tripodPart.emissive}
                  emissiveIntensity={tripodPart.emissiveIntensity}
                />
              </mesh>
              <mesh
                position={[px * 0.64, 0.44, pz * 0.64]}
                rotation={[0, -ang, 0.72]}
                castShadow={cast}
              >
                <cylinderGeometry args={[0.04, 0.04, 1.18, 10]} />
                <meshStandardMaterial
                  color="#cfd6e2"
                  metalness={0.75}
                  roughness={0.36}
                  emissive={tripodPart.emissive}
                  emissiveIntensity={tripodPart.emissiveIntensity}
                />
              </mesh>
            </group>
          );
        })}
      </group>

      {/* Thermal Electronics Compartments */}
      <mesh position={[-0.36, 0.96, 0.22]} castShadow={cast}>
        <boxGeometry args={[0.38, 0.34, 0.42]} />
        <meshStandardMaterial color="#e6ebf2" metalness={0.22} roughness={0.62} />
      </mesh>
      <mesh position={[0.36, 0.96, -0.2]} castShadow={cast}>
        <boxGeometry args={[0.36, 0.32, 0.38]} />
        <meshStandardMaterial color="#c89a35" metalness={0.8} roughness={0.28} />
      </mesh>

      {/* Vertical Mast, Solar Wing & Planar Antenna */}
      <group
        onClick={mastPart.onClick}
        onPointerOver={mastPart.onPointerOver}
        onPointerOut={mastPart.onPointerOut}
      >
        <mesh position={[0, 1.56, 0]} castShadow={cast}>
          <cylinderGeometry args={[0.042, 0.05, 1.55, 12]} />
          <meshStandardMaterial
            color="#d2d9e4"
            metalness={0.76}
            roughness={0.34}
            emissive={mastPart.emissive}
            emissiveIntensity={mastPart.emissiveIntensity}
          />
        </mesh>
        {/* Solar Panel */}
        <mesh position={[0.42, 2.24, 0]} rotation={[0.35, 0, -0.2]} castShadow={cast}>
          <boxGeometry args={[0.92, 0.04, 0.62]} />
          <meshStandardMaterial
            map={solarTex}
            metalness={0.45}
            roughness={0.22}
            emissive={mastPart.emissive}
            emissiveIntensity={mastPart.emissiveIntensity}
          />
        </mesh>
        {/* Planar High-Gain Antenna */}
        <mesh position={[-0.36, 2.1, 0.1]} rotation={[0.4, 0, 0.3]} castShadow={cast}>
          <boxGeometry args={[0.65, 0.04, 0.65]} />
          <meshStandardMaterial
            color="#e2e7ef"
            metalness={0.65}
            roughness={0.35}
            emissive={mastPart.emissive}
            emissiveIntensity={mastPart.emissiveIntensity}
          />
        </mesh>
      </group>

      {/* Survey TV Camera Turret */}
      <group
        position={[0.26, 1.24, 0.38]}
        onClick={camPart.onClick}
        onPointerOver={camPart.onPointerOver}
        onPointerOut={camPart.onPointerOut}
      >
        <mesh castShadow={cast}>
          <cylinderGeometry args={[0.09, 0.11, 0.56, 16]} />
          <meshStandardMaterial
            color="#e8edf5"
            metalness={0.32}
            roughness={0.5}
            emissive={camPart.emissive}
            emissiveIntensity={camPart.emissiveIntensity}
          />
        </mesh>
        <mesh position={[0, 0.32, 0.02]} rotation={[0.35, 0, 0]} castShadow={cast}>
          <boxGeometry args={[0.16, 0.18, 0.18]} />
          <meshStandardMaterial color="#3c4452" metalness={0.72} roughness={0.3} />
        </mesh>
      </group>

      {/* Surveyor 3 Pantograph Surface Sampler Scoop */}
      {withScoop && (
        <group
          position={[0.18, 0.85, 0.52]}
          onClick={scoopPart.onClick}
          onPointerOver={scoopPart.onPointerOver}
          onPointerOut={scoopPart.onPointerOut}
        >
          <mesh position={[0.18, -0.08, 0.35]} rotation={[0.35, -0.35, 0]} castShadow={cast}>
            <boxGeometry args={[0.06, 0.08, 0.72]} />
            <meshStandardMaterial
              color="#c8d0dc"
              metalness={0.78}
              roughness={0.32}
              emissive={scoopPart.emissive}
              emissiveIntensity={scoopPart.emissiveIntensity}
            />
          </mesh>
          <mesh position={[0.42, -0.25, 0.76]} rotation={[0.45, -0.35, 0]} castShadow={cast}>
            <boxGeometry args={[0.12, 0.1, 0.18]} />
            <meshStandardMaterial
              color="#7a8494"
              metalness={0.78}
              roughness={0.38}
              emissive={scoopPart.emissive}
              emissiveIntensity={scoopPart.emissiveIntensity}
            />
          </mesh>
        </group>
      )}
    </group>
  );
}

function VikingLanderModel({
  isViking2,
  selectedHotspotId,
  hoveredHotspotId,
  onSelectHotspot,
  onHoverHotspot,
  isSoftwareGl
}: Omit<SpacecraftModelProps, 'equipmentId'> & { isViking2: boolean }) {
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const hoveredId = hoveredHotspotId !== undefined ? hoveredHotspotId : localHoveredId;
  const setHoveredId = onHoverHotspot || setLocalHoveredId;
  const cast = !isSoftwareGl;
  const getPart = usePartInteraction(
    selectedHotspotId,
    hoveredId,
    setHoveredId,
    onSelectHotspot
  );

  const dishGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.18, 0.04),
      new THREE.Vector2(0.36, 0.12),
      new THREE.Vector2(0.46, 0.22)
    ];
    return new THREE.LatheGeometry(pts, 24);
  }, []);

  useEffect(() => () => dishGeo.dispose(), [dishGeo]);

  const dishPart = getPart('sband-dish');
  const rtgPart = getPart('rtg-units');
  const bodyPart = getPart(isViking2 ? 'seismometer' : 'biology-lab');
  const armPart = getPart(isViking2 ? 'frost-cameras' : 'sample-arm');
  const legPart = getPart('boulder-tilt');

  const legAngles = [0.2, 2.3, 4.4];

  return (
    <group>
      {/* Boulder under Viking 2 footpad */}
      {isViking2 && (
        <mesh position={[1.22, 0.14, 0.85]} castShadow={cast} receiveShadow={cast}>
          <dodecahedronGeometry args={[0.3, 0]} />
          <meshStandardMaterial color="#4e2a1e" roughness={0.92} flatShading />
        </mesh>
      )}

      <group rotation={isViking2 ? [0.06, 0, 0.13] : [0, 0, 0]} position={isViking2 ? [0, 0.12, 0] : [0, 0, 0]}>
        {/* Hexagonal Titanium Lander Body */}
        <mesh
          position={[0, 0.86, 0]}
          castShadow={cast}
          receiveShadow={cast}
          onClick={bodyPart.onClick}
          onPointerOver={bodyPart.onPointerOver}
          onPointerOut={bodyPart.onPointerOut}
        >
          <cylinderGeometry args={[1.05, 1.05, 0.42, 6]} />
          <meshStandardMaterial
            color="#d8dee8"
            metalness={0.58}
            roughness={0.45}
            emissive={bodyPart.emissive}
            emissiveIntensity={bodyPart.emissiveIntensity}
          />
        </mesh>

        {/* 3 Landing Legs & Footpads */}
        <group
          onClick={legPart.onClick}
          onPointerOver={legPart.onPointerOver}
          onPointerOut={legPart.onPointerOut}
        >
          {legAngles.map((ang, idx) => {
            const px = Math.cos(ang) * 1.38;
            const pz = Math.sin(ang) * 1.38;
            return (
              <group key={idx}>
                <mesh position={[px, 0.04, pz]} castShadow={cast} receiveShadow={cast}>
                  <cylinderGeometry args={[0.24, 0.28, 0.08, 18]} />
                  <meshStandardMaterial
                    color="#b6beca"
                    metalness={0.72}
                    roughness={0.44}
                    emissive={legPart.emissive}
                    emissiveIntensity={legPart.emissiveIntensity}
                  />
                </mesh>
                <mesh
                  position={[px * 0.72, 0.44, pz * 0.72]}
                  rotation={[0, -ang, 0.56]}
                  castShadow={cast}
                >
                  <cylinderGeometry args={[0.045, 0.045, 0.96, 10]} />
                  <meshStandardMaterial
                    color="#c5cdd8"
                    metalness={0.75}
                    roughness={0.38}
                    emissive={legPart.emissive}
                    emissiveIntensity={legPart.emissiveIntensity}
                  />
                </mesh>
              </group>
            );
          })}
        </group>

        {/* Twin RTG Thermal Covers */}
        <group
          onClick={rtgPart.onClick}
          onPointerOver={rtgPart.onPointerOver}
          onPointerOut={rtgPart.onPointerOut}
        >
          {[-1.12, 1.12].map((rx, idx) => (
            <mesh key={idx} position={[rx, 0.88, 0]} castShadow={cast}>
              <boxGeometry args={[0.38, 0.34, 0.62]} />
              <meshStandardMaterial
                color="#e2e6ed"
                metalness={0.32}
                roughness={0.58}
                emissive={rtgPart.emissive}
                emissiveIntensity={rtgPart.emissiveIntensity}
              />
            </mesh>
          ))}
        </group>

        {/* S-Band High-Gain Dish */}
        <group
          position={[-0.45, 1.48, -0.55]}
          onClick={dishPart.onClick}
          onPointerOver={dishPart.onPointerOver}
          onPointerOut={dishPart.onPointerOut}
        >
          <mesh position={[0, -0.22, 0]} castShadow={cast}>
            <cylinderGeometry args={[0.035, 0.042, 0.46, 10]} />
            <meshStandardMaterial color="#adb7c6" metalness={0.7} roughness={0.36} />
          </mesh>
          <mesh geometry={dishGeo} rotation={[0.68, 0, 0.25]} castShadow={cast}>
            <meshStandardMaterial
              color="#eff2f7"
              metalness={0.45}
              roughness={0.38}
              side={THREE.DoubleSide}
              emissive={dishPart.emissive}
              emissiveIntensity={dishPart.emissiveIntensity}
            />
          </mesh>
        </group>

        {/* Dual Facsimile Cameras & Meteorology Boom */}
        <group
          onClick={armPart.onClick}
          onPointerOver={armPart.onPointerOver}
          onPointerOut={armPart.onPointerOut}
        >
          {[-0.36, 0.36].map((cx, idx) => (
            <mesh key={idx} position={[cx, 1.24, 0.56]} castShadow={cast}>
              <cylinderGeometry args={[0.09, 0.09, 0.34, 14]} />
              <meshStandardMaterial
                color="#e5eaf2"
                metalness={0.45}
                roughness={0.45}
                emissive={armPart.emissive}
                emissiveIntensity={armPart.emissiveIntensity}
              />
            </mesh>
          ))}
          {/* Soil Sampler Arm */}
          <mesh position={[0.25, 0.86, 1.05]} rotation={[0.18, 0.2, 0]} castShadow={cast}>
            <cylinderGeometry args={[0.032, 0.036, 0.95, 10]} />
            <meshStandardMaterial
              color="#aeb7c4"
              metalness={0.78}
              roughness={0.32}
              emissive={armPart.emissive}
              emissiveIntensity={armPart.emissiveIntensity}
            />
          </mesh>
          {/* Meteorology Boom */}
          <mesh position={[0.72, 1.48, 0.32]} rotation={[0, 0, -0.24]} castShadow={cast}>
            <cylinderGeometry args={[0.018, 0.022, 0.86, 8]} />
            <meshStandardMaterial color="#cbd3df" metalness={0.75} roughness={0.35} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function SojournerRoverModel({
  selectedHotspotId,
  hoveredHotspotId,
  onSelectHotspot,
  onHoverHotspot,
  isSoftwareGl
}: Omit<SpacecraftModelProps, 'equipmentId'>) {
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const hoveredId = hoveredHotspotId !== undefined ? hoveredHotspotId : localHoveredId;
  const setHoveredId = onHoverHotspot || setLocalHoveredId;
  const solarTex = useMemo(() => createSolarPanelTexture(false), []);
  const kapton = useMemo(() => createKaptonFoilTexture(), []);
  const cast = !isSoftwareGl;

  useEffect(() => {
    return () => {
      solarTex.dispose();
      kapton.map.dispose();
      kapton.bumpMap.dispose();
    };
  }, [solarTex, kapton]);

  const getPart = usePartInteraction(
    selectedHotspotId,
    hoveredId,
    setHoveredId,
    onSelectHotspot
  );

  const bogiePart = getPart('rocker-bogie');
  const solarPart = getPart('solar-deck');
  const apxsPart = getPart('apxs-sensor');

  const wheelCoords: [number, number, number][] = [
    [-0.64, 0.19, 0.64],
    [0.64, 0.19, 0.64],
    [-0.64, 0.19, 0],
    [0.64, 0.19, 0],
    [-0.64, 0.19, -0.64],
    [0.64, 0.19, -0.64]
  ];

  return (
    <group>
      {/* Warm Electronics Box */}
      <mesh position={[0, 0.42, 0]} castShadow={cast}>
        <boxGeometry args={[0.88, 0.28, 1.18]} />
        <meshStandardMaterial
          map={kapton.map}
          bumpMap={kapton.bumpMap}
          bumpScale={0.02}
          metalness={0.78}
          roughness={0.32}
        />
      </mesh>

      {/* Top Photovoltaic Solar Panel */}
      <mesh
        position={[0, 0.58, 0]}
        castShadow={cast}
        onClick={solarPart.onClick}
        onPointerOver={solarPart.onPointerOver}
        onPointerOut={solarPart.onPointerOut}
      >
        <boxGeometry args={[1.04, 0.04, 1.32]} />
        <meshStandardMaterial
          map={solarTex}
          metalness={0.42}
          roughness={0.2}
          emissive={solarPart.emissive}
          emissiveIntensity={solarPart.emissiveIntensity}
        />
      </mesh>

      {/* 6-Wheel Rocker-Bogie Suspension */}
      <group
        onClick={bogiePart.onClick}
        onPointerOver={bogiePart.onPointerOver}
        onPointerOut={bogiePart.onPointerOut}
      >
        {wheelCoords.map(([wx, wy, wz], idx) => (
          <mesh key={idx} position={[wx, wy, wz]} rotation={[0, 0, Math.PI / 2]} castShadow={cast}>
            <cylinderGeometry args={[0.19, 0.19, 0.14, 18]} />
            <meshStandardMaterial
              color="#9ca5b4"
              metalness={0.75}
              roughness={0.48}
              emissive={bogiePart.emissive}
              emissiveIntensity={bogiePart.emissiveIntensity}
            />
          </mesh>
        ))}
        {[-0.52, 0.52].map((sx, idx) => (
          <mesh key={idx} position={[sx, 0.34, 0]} castShadow={cast}>
            <boxGeometry args={[0.05, 0.05, 1.28]} />
            <meshStandardMaterial
              color="#d4dce8"
              metalness={0.78}
              roughness={0.34}
              emissive={bogiePart.emissive}
              emissiveIntensity={bogiePart.emissiveIntensity}
            />
          </mesh>
        ))}
      </group>

      {/* Rear APXS Sensor Head */}
      <mesh
        position={[0, 0.34, -0.82]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow={cast}
        onClick={apxsPart.onClick}
        onPointerOver={apxsPart.onPointerOver}
        onPointerOut={apxsPart.onPointerOut}
      >
        <cylinderGeometry args={[0.11, 0.13, 0.34, 16]} />
        <meshStandardMaterial
          color="#d29c3a"
          metalness={0.82}
          roughness={0.28}
          emissive={apxsPart.emissive}
          emissiveIntensity={apxsPart.emissiveIntensity}
        />
      </mesh>

      {/* Front Stereo Hazard Cameras & Whip Antenna */}
      {[-0.18, 0.18].map((cx, idx) => (
        <mesh key={idx} position={[cx, 0.44, 0.62]} castShadow={cast}>
          <boxGeometry args={[0.09, 0.07, 0.09]} />
          <meshStandardMaterial color="#303642" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
      <mesh position={[0.38, 0.86, -0.45]} castShadow={cast}>
        <cylinderGeometry args={[0.012, 0.016, 0.56, 8]} />
        <meshStandardMaterial color="#e2e8f0" metalness={0.7} roughness={0.35} />
      </mesh>
    </group>
  );
}

function MarsExplorationRoverModel({
  isOpportunity,
  selectedHotspotId,
  hoveredHotspotId,
  onSelectHotspot,
  onHoverHotspot,
  isSoftwareGl
}: Omit<SpacecraftModelProps, 'equipmentId'> & { isOpportunity: boolean }) {
  const [localHoveredId, setLocalHoveredId] = useState<string | null>(null);
  const hoveredId = hoveredHotspotId !== undefined ? hoveredHotspotId : localHoveredId;
  const setHoveredId = onHoverHotspot || setLocalHoveredId;
  const solarTex = useMemo(
    () => createSolarPanelTexture(isOpportunity),
    [isOpportunity]
  );
  const kapton = useMemo(() => createKaptonFoilTexture(), []);
  const cast = !isSoftwareGl;

  useEffect(() => {
    return () => {
      solarTex.dispose();
      kapton.map.dispose();
      kapton.bumpMap.dispose();
    };
  }, [solarTex, kapton]);

  const solarWingGeo = useMemo(() => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.15, -0.55);
    shape.lineTo(1.15, -0.55);
    shape.lineTo(0.85, 0.45);
    shape.lineTo(0, 0.92);
    shape.lineTo(-0.85, 0.45);
    shape.closePath();

    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: 0.04,
      bevelEnabled: true,
      bevelThickness: 0.01,
      bevelSize: 0.01,
      bevelSegments: 2
    });
    geo.rotateX(-Math.PI / 2);
    return geo;
  }, []);

  const dishGeo = useMemo(() => {
    const pts = [
      new THREE.Vector2(0, 0),
      new THREE.Vector2(0.14, 0.03),
      new THREE.Vector2(0.28, 0.1)
    ];
    return new THREE.LatheGeometry(pts, 20);
  }, []);

  useEffect(() => {
    return () => {
      solarWingGeo.dispose();
      dishGeo.dispose();
    };
  }, [solarWingGeo, dishGeo]);

  const getPart = usePartInteraction(
    selectedHotspotId,
    hoveredId,
    setHoveredId,
    onSelectHotspot
  );

  const mastPart = getPart(isOpportunity ? 'pancam-eyes' : 'pancam-mast');
  const wingPart = getPart(isOpportunity ? 'dust-wings' : 'solar-wings');
  const wheelPart = getPart(isOpportunity ? 'mer-wheels' : 'troy-wheel');
  const armOrDishPart = getPart(isOpportunity ? 'hga-dish' : 'rat-arm');

  const wheels: [number, number, number][] = [
    [-0.86, 0.25, 0.86],
    [0.86, 0.25, 0.86],
    [-0.9, 0.25, 0],
    [0.9, 0.25, 0],
    [-0.84, 0.25, -0.82],
    [0.84, isOpportunity ? 0.25 : 0.16, -0.82]
  ];

  return (
    <group rotation={!isOpportunity ? [0.06, 0, -0.1] : [0, 0, 0]}>
      {/* Warm Electronics Box */}
      <mesh position={[0, 0.68, 0]} castShadow={cast}>
        <boxGeometry args={[0.92, 0.36, 0.96]} />
        <meshStandardMaterial
          map={kapton.map}
          bumpMap={kapton.bumpMap}
          bumpScale={0.02}
          metalness={0.78}
          roughness={0.32}
        />
      </mesh>

      {/* Triangular Arrowhead Solar Wing Deck */}
      <mesh
        geometry={solarWingGeo}
        position={[0, 0.89, 0.08]}
        castShadow={cast}
        receiveShadow={cast}
        onClick={wingPart.onClick}
        onPointerOver={wingPart.onPointerOver}
        onPointerOut={wingPart.onPointerOut}
      >
        <meshStandardMaterial
          map={solarTex}
          metalness={0.4}
          roughness={isOpportunity ? 0.42 : 0.22}
          emissive={wingPart.emissive}
          emissiveIntensity={wingPart.emissiveIntensity}
        />
      </mesh>

      {/* 6-Wheel Rocker-Bogie Drive */}
      <group
        onClick={wheelPart.onClick}
        onPointerOver={wheelPart.onPointerOver}
        onPointerOut={wheelPart.onPointerOut}
      >
        {wheels.map(([wx, wy, wz], idx) => (
          <group key={idx} position={[wx, wy, wz]}>
            <mesh rotation={[0, 0, Math.PI / 2]} castShadow={cast}>
              <cylinderGeometry args={[0.25, 0.25, 0.16, 20]} />
              <meshStandardMaterial
                color="#7c8594"
                metalness={0.72}
                roughness={0.5}
                emissive={wheelPart.emissive}
                emissiveIntensity={wheelPart.emissiveIntensity}
              />
            </mesh>
            <mesh rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.09, 0.18, 12]} />
              <meshStandardMaterial color="#d2a43c" metalness={0.82} roughness={0.3} />
            </mesh>
          </group>
        ))}
        {/* Suspension Struts */}
        {[-0.72, 0.72].map((sx, idx) => (
          <mesh key={idx} position={[sx, 0.45, 0]} castShadow={cast}>
            <boxGeometry args={[0.06, 0.06, 1.72]} />
            <meshStandardMaterial
              color="#d5dce7"
              metalness={0.78}
              roughness={0.34}
              emissive={wheelPart.emissive}
              emissiveIntensity={wheelPart.emissiveIntensity}
            />
          </mesh>
        ))}
      </group>

      {/* Pancam Stereo Camera Mast */}
      <group
        position={[0.18, 0.92, 0.5]}
        onClick={mastPart.onClick}
        onPointerOver={mastPart.onPointerOver}
        onPointerOut={mastPart.onPointerOut}
      >
        <mesh position={[0, 0.38, 0]} castShadow={cast}>
          <cylinderGeometry args={[0.042, 0.048, 0.78, 12]} />
          <meshStandardMaterial
            color="#e5eaf2"
            metalness={0.48}
            roughness={0.4}
            emissive={mastPart.emissive}
            emissiveIntensity={mastPart.emissiveIntensity}
          />
        </mesh>
        <mesh position={[0, 0.78, 0.04]} castShadow={cast}>
          <boxGeometry args={[0.42, 0.12, 0.14]} />
          <meshStandardMaterial
            color="#eef2f7"
            metalness={0.36}
            roughness={0.45}
            emissive={mastPart.emissive}
            emissiveIntensity={mastPart.emissiveIntensity}
          />
        </mesh>
        {[-0.14, 0.14].map((lx, idx) => (
          <mesh key={idx} position={[lx, 0.78, 0.12]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.04, 12]} />
            <meshStandardMaterial color="#1d2738" metalness={0.8} roughness={0.15} />
          </mesh>
        ))}
      </group>

      {/* High-Gain Dish Antenna */}
      <group
        position={[-0.46, 1.15, -0.62]}
        onClick={armOrDishPart.onClick}
        onPointerOver={armOrDishPart.onPointerOver}
        onPointerOut={armOrDishPart.onPointerOut}
      >
        <mesh position={[0, -0.14, 0]} castShadow={cast}>
          <cylinderGeometry args={[0.024, 0.028, 0.3, 10]} />
          <meshStandardMaterial color="#cfd7e2" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh geometry={dishGeo} rotation={[0.62, 0, -0.25]} castShadow={cast}>
          <meshStandardMaterial
            color="#eef2f8"
            metalness={0.45}
            roughness={0.38}
            side={THREE.DoubleSide}
            emissive={isOpportunity ? armOrDishPart.emissive : '#000000'}
            emissiveIntensity={isOpportunity ? armOrDishPart.emissiveIntensity : 0}
          />
        </mesh>
      </group>

      {/* Forward Robotic Instrument Deployment Arm + RAT */}
      <group
        position={[0.08, 0.62, 0.82]}
        onClick={armOrDishPart.onClick}
        onPointerOver={armOrDishPart.onPointerOver}
        onPointerOut={armOrDishPart.onPointerOut}
      >
        <mesh position={[0, 0.05, 0.24]} rotation={[0.4, 0, 0]} castShadow={cast}>
          <cylinderGeometry args={[0.032, 0.036, 0.56, 10]} />
          <meshStandardMaterial
            color="#c5cdd8"
            metalness={0.78}
            roughness={0.34}
            emissive={!isOpportunity ? armOrDishPart.emissive : '#000000'}
            emissiveIntensity={!isOpportunity ? armOrDishPart.emissiveIntensity : 0}
          />
        </mesh>
        <mesh position={[0, -0.02, 0.5]} castShadow={cast}>
          <cylinderGeometry args={[0.1, 0.1, 0.14, 12]} />
          <meshStandardMaterial
            color="#cfa03e"
            metalness={0.82}
            roughness={0.3}
            emissive={!isOpportunity ? armOrDishPart.emissive : '#000000'}
            emissiveIntensity={!isOpportunity ? armOrDishPart.emissiveIntensity : 0}
          />
        </mesh>
      </group>
    </group>
  );
}

export function SpacecraftModel(props: SpacecraftModelProps) {
  switch (props.equipmentId) {
    case 'apollo-lm-descent-stages':
      return <ApolloLMDescentModel {...props} />;
    case 'lunar-roving-vehicles':
      return <LunarRovingVehicleModel {...props} />;
    case 'alsep-packages':
      return <AlsepModel {...props} />;
    case 'surveyor-1':
      return <SurveyorModel {...props} withScoop={false} />;
    case 'surveyor-3':
      return <SurveyorModel {...props} withScoop={true} />;
    case 'viking-1-lander':
      return <VikingLanderModel {...props} isViking2={false} />;
    case 'viking-2-lander':
      return <VikingLanderModel {...props} isViking2={true} />;
    case 'sojourner-rover':
      return <SojournerRoverModel {...props} />;
    case 'spirit-rover':
      return <MarsExplorationRoverModel {...props} isOpportunity={false} />;
    case 'opportunity-rover':
      return <MarsExplorationRoverModel {...props} isOpportunity={true} />;
    default:
      return <ApolloLMDescentModel {...props} />;
  }
}
