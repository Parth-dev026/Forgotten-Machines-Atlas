import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import {
  Box,
  Compass,
  Crosshair,
  Eye,
  EyeOff,
  Info,
  Maximize2,
  Minimize2,
  RotateCcw,
  RotateCw,
  X,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { EquipmentItem, SubsystemHotspot } from '../types/equipment';
import { EQUIPMENT_3D_SPECS } from '../data/equipment3dSpecs';
import { PlanetaryEnvironment } from './three/PlanetaryEnvironment';
import { SpacecraftModel } from './three/SpacecraftModels';
import { ResilientImage } from './ResilientImage';
import { useMuseumTheme } from '../context/MuseumThemeContext';

interface Equipment3DExplorerProps {
  items: EquipmentItem[];
  initialEquipmentId?: string;
  allowEquipmentSwitch?: boolean;
  onOpenDetail?: (id: string) => void;
}

interface FittedCameraPose {
  position: [number, number, number];
  target: [number, number, number];
  minDistance: number;
  maxDistance: number;
}

function detectWebGLCapabilities(): {
  supported: boolean;
  isSoftwareGl: boolean;
} {
  if (typeof window === 'undefined') {
    return { supported: true, isSoftwareGl: false };
  }
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ||
      canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl');
    if (!gl) {
      return { supported: false, isSoftwareGl: false };
    }
    const webgl = gl as WebGLRenderingContext;
    const ext = webgl.getExtension('WEBGL_debug_renderer_info');
    if (ext) {
      const renderer = String(
        webgl.getParameter(ext.UNMASKED_RENDERER_WEBGL) || ''
      ).toLowerCase();
      const isSoftwareGl =
        /swiftshader|llvmpipe|software|mesa|microsoft basic render/.test(
          renderer
        );
      return { supported: true, isSoftwareGl };
    }
    return { supported: true, isSoftwareGl: false };
  } catch {
    return { supported: false, isSoftwareGl: false };
  }
}

interface FittedModelStageProps {
  equipmentId: string;
  selectedHotspotId: string | null;
  hoveredHotspotId: string | null;
  onSelectHotspot: (id: string) => void;
  onHoverHotspot: (id: string | null) => void;
  isSoftwareGl: boolean;
  onComputedPose: (pose: FittedCameraPose) => void;
}

function FittedModelStage({
  equipmentId,
  selectedHotspotId,
  hoveredHotspotId,
  onSelectHotspot,
  onHoverHotspot,
  isSoftwareGl,
  onComputedPose
}: FittedModelStageProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { size, camera } = useThree();

  useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) return;

    // Measure actual 3D geometry bounds (excluding HTML overlay markers)
    const box = new THREE.Box3().setFromObject(group);
    if (box.isEmpty()) return;

    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);

    const center = new THREE.Vector3();
    box.getCenter(center);

    const persp = camera as THREE.PerspectiveCamera;
    const fovDeg = persp.fov || 40;
    const fovRad = THREE.MathUtils.degToRad(fovDeg);
    const aspect = Math.max(0.55, size.width / Math.max(1, size.height));
    const halfV = fovRad / 2;
    const halfH = Math.atan(Math.tan(halfV) * aspect);

    const radius = Math.max(0.75, sphere.radius);
    const distV = radius / Math.sin(halfV);
    const distH = radius / Math.sin(halfH);
    // 1.38 breathing room ensures all extremities and bottom controls never crowd the craft
    const fitDistance = Math.max(distV, distH) * 1.38;

    // Clean three-quarter perspective
    const threeQuarterDir = new THREE.Vector3(1.0, 0.52, 1.08).normalize();
    const targetVec = new THREE.Vector3(
      center.x,
      Math.max(0.35, center.y * 0.94),
      center.z
    );
    const camPos = targetVec.clone().addScaledVector(threeQuarterDir, fitDistance);

    const nextPose: FittedCameraPose = {
      position: [camPos.x, camPos.y, camPos.z],
      target: [targetVec.x, targetVec.y, targetVec.z],
      minDistance: Math.max(1.2, radius * 0.85),
      maxDistance: Math.max(11, fitDistance * 2.4)
    };

    let active = true;
    queueMicrotask(() => {
      if (active) {
        onComputedPose(nextPose);
      }
    });

    return () => {
      active = false;
    };
  }, [equipmentId, size.width, size.height, camera, onComputedPose]);

  return (
    <group ref={groupRef}>
      <SpacecraftModel
        equipmentId={equipmentId}
        selectedHotspotId={selectedHotspotId}
        hoveredHotspotId={hoveredHotspotId}
        onSelectHotspot={onSelectHotspot}
        onHoverHotspot={onHoverHotspot}
        isSoftwareGl={isSoftwareGl}
      />
    </group>
  );
}

interface CameraRigProps {
  desiredPosition: [number, number, number];
  desiredTarget: [number, number, number];
  minDistance: number;
  maxDistance: number;
  focusTrigger: number;
  instantSnap: boolean;
  autoRotate: boolean;
  isSoftwareGl: boolean;
  zoomStepRef: React.MutableRefObject<number>;
}

function CameraRig({
  desiredPosition,
  desiredTarget,
  minDistance,
  maxDistance,
  focusTrigger,
  instantSnap,
  autoRotate,
  isSoftwareGl,
  zoomStepRef
}: CameraRigProps) {
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const { camera } = useThree();
  const animatingRef = useRef(false);
  const targetPosVec = useRef(new THREE.Vector3(...desiredPosition));
  const targetLookVec = useRef(new THREE.Vector3(...desiredTarget));

  useEffect(() => {
    targetPosVec.current.set(...desiredPosition);
    targetLookVec.current.set(...desiredTarget);

    if (instantSnap) {
      camera.position.copy(targetPosVec.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLookVec.current);
        controlsRef.current.update();
      }
      animatingRef.current = false;
    } else {
      animatingRef.current = true;
    }
  }, [desiredPosition, desiredTarget, focusTrigger, instantSnap, camera]);

  useFrame((_state, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    if (zoomStepRef.current !== 0) {
      const offset = camera.position.clone().sub(controls.target);
      const scale = zoomStepRef.current > 0 ? 0.84 : 1.18;
      const nextDist = THREE.MathUtils.clamp(
        offset.length() * scale,
        minDistance,
        maxDistance
      );
      offset.setLength(nextDist);
      camera.position.copy(controls.target).add(offset);
      zoomStepRef.current = 0;
      animatingRef.current = false;
      controls.update();
      return;
    }

    if (animatingRef.current) {
      const step = isSoftwareGl ? 1 : Math.min(1, delta * 5.2);
      camera.position.lerp(targetPosVec.current, step);
      controls.target.lerp(targetLookVec.current, step);
      controls.update();

      if (
        camera.position.distanceTo(targetPosVec.current) < 0.04 &&
        controls.target.distanceTo(targetLookVec.current) < 0.04
      ) {
        camera.position.copy(targetPosVec.current);
        controls.target.copy(targetLookVec.current);
        animatingRef.current = false;
        controls.update();
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableRotate
      enableZoom
      enablePan
      screenSpacePanning
      enableDamping={!isSoftwareGl}
      dampingFactor={0.07}
      autoRotate={autoRotate}
      autoRotateSpeed={0.85}
      minDistance={minDistance}
      maxDistance={maxDistance}
      maxPolarAngle={Math.PI / 2 - 0.04}
      onStart={() => {
        animatingRef.current = false;
      }}
    />
  );
}

interface HotspotProjectorProps {
  hotspots: SubsystemHotspot[];
  markerRefs: React.MutableRefObject<Record<string, HTMLDivElement | null>>;
  visible: boolean;
}

function HotspotProjector({
  hotspots,
  markerRefs,
  visible
}: HotspotProjectorProps) {
  const { camera, size } = useThree();
  const tempVec = useMemo(() => new THREE.Vector3(), []);
  const camPos = useMemo(() => new THREE.Vector3(), []);
  const camDir = useMemo(() => new THREE.Vector3(), []);
  const deltaVec = useMemo(() => new THREE.Vector3(), []);

  const updatePositions = useCallback(() => {
    if (!visible) return;
    camera.updateMatrixWorld();
    camera.getWorldPosition(camPos);
    camera.getWorldDirection(camDir);

    for (const hotspot of hotspots) {
      const el = markerRefs.current[hotspot.id];
      if (!el) continue;

      tempVec.set(
        hotspot.position[0],
        hotspot.position[1],
        hotspot.position[2]
      );
      deltaVec.copy(tempVec).sub(camPos);
      if (deltaVec.dot(camDir) <= 0) {
        if (el.style.display !== 'none') {
          el.style.display = 'none';
        }
        continue;
      }

      tempVec.project(camera);
      if (tempVec.z > 1) {
        if (el.style.display !== 'none') {
          el.style.display = 'none';
        }
        continue;
      }

      const x = (tempVec.x * 0.5 + 0.5) * size.width;
      const y = (-tempVec.y * 0.5 + 0.5) * size.height;

      if (el.style.display !== 'flex') {
        el.style.display = 'flex';
      }
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
    }
  }, [
    hotspots,
    markerRefs,
    visible,
    camera,
    size.width,
    size.height,
    tempVec,
    camPos,
    camDir,
    deltaVec
  ]);

  useEffect(() => {
    updatePositions();
  }, [updatePositions]);

  useFrame(() => {
    updatePositions();
  });

  return null;
}

export function Equipment3DExplorer({
  items,
  initialEquipmentId = 'apollo-lm-descent-stages',
  allowEquipmentSwitch = true,
  onOpenDetail
}: Equipment3DExplorerProps) {
  const { backdropMode, prefersReducedMotion } = useMuseumTheme();
  const isStaticView = backdropMode === 'static' || prefersReducedMotion;
  const containerRef = useRef<HTMLElement | null>(null);
  const [selectedId, setSelectedId] = useState(initialEquipmentId);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);
  const [hoveredHotspotId, setHoveredHotspotId] = useState<string | null>(null);
  const [showHotspots, setShowHotspots] = useState(true);
  const [autoRotate, setAutoRotate] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cameraFocusMode, setCameraFocusMode] = useState<'overview' | 'hotspot'>(
    'overview'
  );
  const [focusTrigger, setFocusTrigger] = useState(0);
  const [instantSnap, setInstantSnap] = useState(true);
  const [contextLost, setContextLost] = useState(false);
  const zoomStepRef = useRef(0);
  const hotspotElRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'default';
    };
  }, []);

  const webglCaps = useMemo(() => detectWebGLCapabilities(), []);

  const activeItem =
    items.find((entry) => entry.id === selectedId) || items[0];
  const spec =
    EQUIPMENT_3D_SPECS[activeItem?.id || 'apollo-lm-descent-stages'] ||
    EQUIPMENT_3D_SPECS['apollo-lm-descent-stages'];

  const [fittedPose, setFittedPose] = useState<FittedCameraPose>({
    position: spec.defaultCameraPosition,
    target: spec.defaultTarget,
    minDistance: 1.5,
    maxDistance: 14
  });

  useEffect(() => {
    setSelectedId(initialEquipmentId);
    setSelectedHotspotId(null);
    setHoveredHotspotId(null);
    setCameraFocusMode('overview');
    setInstantSnap(true);
    setFocusTrigger((prev) => prev + 1);
  }, [initialEquipmentId]);

  useEffect(() => {
    const handleFsChange = () => {
      if (document.fullscreenElement === containerRef.current) {
        setIsFullscreen(true);
      } else if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen && !document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('fullscreenchange', handleFsChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  const handleComputedPose = useCallback((pose: FittedCameraPose) => {
    setFittedPose((prev) => {
      const same =
        Math.abs(prev.position[0] - pose.position[0]) < 0.001 &&
        Math.abs(prev.position[1] - pose.position[1]) < 0.001 &&
        Math.abs(prev.position[2] - pose.position[2]) < 0.001 &&
        Math.abs(prev.target[0] - pose.target[0]) < 0.001 &&
        Math.abs(prev.target[1] - pose.target[1]) < 0.001 &&
        Math.abs(prev.target[2] - pose.target[2]) < 0.001 &&
        Math.abs(prev.minDistance - pose.minDistance) < 0.001 &&
        Math.abs(prev.maxDistance - pose.maxDistance) < 0.001;
      return same ? prev : pose;
    });
  }, []);

  const selectedHotspotIndex = spec.hotspots.findIndex(
    (h) => h.id === selectedHotspotId
  );
  const selectedHotspot =
    selectedHotspotIndex >= 0 ? spec.hotspots[selectedHotspotIndex] : null;

  const desiredPosition: [number, number, number] =
    cameraFocusMode === 'hotspot' && selectedHotspot
      ? selectedHotspot.cameraOffset
      : fittedPose.position;

  const desiredTarget: [number, number, number] =
    cameraFocusMode === 'hotspot' && selectedHotspot
      ? selectedHotspot.position
      : fittedPose.target;

  const handleSelectEquipment = (id: string) => {
    setSelectedId(id);
    setSelectedHotspotId(null);
    setHoveredHotspotId(null);
    setCameraFocusMode('overview');
    setInstantSnap(true);
    setFocusTrigger((prev) => prev + 1);
  };

  // Selecting a subsystem highlights it on the 3D model and shows details in the side panel
  // without losing the overall 3D view of the complete spacecraft.
  const handleSelectHotspot = (hotspotId: string) => {
    setSelectedHotspotId((prev) => (prev === hotspotId ? null : hotspotId));
    setCameraFocusMode('overview');
  };

  const handleFocusSelectedComponent = () => {
    if (!selectedHotspot) return;
    setAutoRotate(false);
    setCameraFocusMode('hotspot');
    setInstantSnap(false);
    setFocusTrigger((prev) => prev + 1);
  };

  const handleResetSelection = () => {
    setSelectedHotspotId(null);
    setHoveredHotspotId(null);
    if (cameraFocusMode === 'hotspot') {
      setCameraFocusMode('overview');
      setInstantSnap(false);
      setFocusTrigger((prev) => prev + 1);
    }
  };

  const handleResetCamera = () => {
    setCameraFocusMode('overview');
    setInstantSnap(false);
    setFocusTrigger((prev) => prev + 1);
  };

  const toggleFullscreen = async () => {
    const el = containerRef.current;
    if (!el) return;

    if (!isFullscreen) {
      if (el.requestFullscreen) {
        try {
          await el.requestFullscreen();
          setIsFullscreen(true);
          return;
        } catch {
          // Fallback to fixed viewport fullscreen when iframe blocks native Fullscreen API
        }
      }
      setIsFullscreen(true);
    } else {
      if (document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch {
          // ignore
        }
      }
      setIsFullscreen(false);
    }
  };

  if (!activeItem) return null;

  return (
    <section
      ref={containerRef}
      aria-label="Interactive 3D Equipment Explorer"
      className={
        isFullscreen
          ? 'fixed inset-0 z-50 flex flex-col bg-[#080D1C] overflow-y-auto'
          : 'rounded-2xl border border-[#1E3666] bg-[#0D152B] overflow-hidden'
      }
    >
      {/* Top Bar: Title + Illustrative Disclosure */}
      <div className="flex flex-col justify-between gap-4 border-b border-[#1E3666] bg-[#080D1C] px-5 py-4 sm:flex-row sm:items-center sm:px-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#20B9C9]">
            <Box className="h-4 w-4" aria-hidden="true" />
            <span>Interactive 3D Equipment Explorer · {spec.environment} Surface</span>
          </div>
          <h2 className="mt-1 font-display text-xl font-semibold text-[#E6EDF7] sm:text-2xl">
            {activeItem.name}
          </h2>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-[#F5B041]/40 bg-[#14264A]/60 px-3 py-2 text-xs text-[#E6EDF7] max-w-md">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#F5B041]" aria-hidden="true" />
          <span>
            <strong>Illustrative Procedural 3D Model:</strong> Built to demonstrate
            spacecraft geometry and subsystems; not an exact NASA CAD mesh.
          </span>
        </div>
      </div>

      {/* Optional Equipment Switcher Strip */}
      {allowEquipmentSwitch && (
        <div className="border-b border-[#1E3666] bg-[#0D152B] px-5 py-3 sm:px-6">
          <div className="flex flex-wrap items-center gap-2">
            {items.map((entry) => {
              const active = entry.id === activeItem.id;
              return (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => handleSelectEquipment(entry.id)}
                  className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                    active
                      ? 'border-[#20B9C9] bg-[#20B9C9] text-[#080D1C]'
                      : 'border-[#1E3666] bg-[#14264A]/45 text-[#C5D2E8] hover:border-[#2463C5] hover:text-[#E6EDF7]'
                  }`}
                >
                  {entry.name
                    .replace(' (MER-A)', '')
                    .replace(' (MER-B)', '')
                    .replace(' (LRV-1, LRV-2, LRV-3)', '')}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main 3D Stage (Left/Top) + Dedicated Subsystem Info Panel (Right/Bottom) */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 ${
          isFullscreen ? 'flex-1' : ''
        }`}
      >
        {/* WebGL Canvas Viewport or Static View Presentation */}
        <div
          className={`relative bg-[#050811] lg:col-span-8 ${
            isFullscreen
              ? 'min-h-[420px] lg:min-h-0'
              : 'h-[430px] sm:h-[520px] lg:h-[580px]'
          }`}
        >
          {isStaticView ? (
            <div className="relative flex h-full flex-col justify-between overflow-hidden bg-[#080D1C]">
              <div className="relative flex-1 overflow-hidden">
                <ResilientImage
                  src={activeItem.imageUrl}
                  alt={`${activeItem.name} (${activeItem.missionName})`}
                  fallbackTitle={activeItem.name}
                  loading="eager"
                  className="h-full w-full object-cover"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#080D1C]/85 via-transparent to-[#080D1C]/35"
                />
                <div className="absolute top-3 left-3 rounded-md border border-[#1E3666] bg-[#0D152B]/95 px-3 py-1.5 text-xs font-medium text-[#E6EDF7] shadow-md">
                  Static View · Archival Mission Photography ({activeItem.missionName})
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#1E3666] bg-[#0D152B] px-4 py-3 text-xs text-[#C5D2E8]">
                <span className="max-w-xl truncate">{activeItem.imageCaption}</span>
                <span className="font-mono text-[11px] text-[#20B9C9]">
                  Select “3D View” in top navigation for interactive WebGL model
                </span>
              </div>
            </div>
          ) : !webglCaps.supported || contextLost ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <p className="font-display text-lg font-semibold text-[#E6EDF7]">
                3D WebGL Viewport Unavailable
              </p>
              <p className="mt-2 max-w-md text-sm text-[#9FB2D1]">
                Your browser or hardware environment paused WebGL rendering. You can
                still inspect every subsystem breakdown in the adjacent panel.
              </p>
              {contextLost && (
                <button
                  type="button"
                  onClick={() => setContextLost(false)}
                  className="mt-4 cursor-pointer rounded-lg bg-[#2463C5] px-4 py-2 text-xs font-semibold text-[#E6EDF7] hover:bg-[#20B9C9] hover:text-[#080D1C]"
                >
                  Retry 3D Viewport
                </button>
              )}
            </div>
          ) : (
            <Canvas
              shadows={!webglCaps.isSoftwareGl}
              dpr={webglCaps.isSoftwareGl ? 1 : [1, 2]}
              camera={{
                position: fittedPose.position,
                fov: 40,
                near: 0.1,
                far: 120
              }}
              gl={{
                antialias: !webglCaps.isSoftwareGl,
                toneMapping: THREE.ACESFilmicToneMapping,
                toneMappingExposure: 1.05,
                powerPreference: 'high-performance'
              }}
              onPointerMissed={() => {
                setSelectedHotspotId(null);
              }}
              onCreated={({ gl }) => {
                const el = gl.domElement;
                el.addEventListener(
                  'webglcontextlost',
                  (e) => {
                    e.preventDefault();
                    setContextLost(true);
                  },
                  false
                );
                el.addEventListener(
                  'webglcontextrestored',
                  () => {
                    setContextLost(false);
                  },
                  false
                );
              }}
            >
              <PlanetaryEnvironment
                environment={spec.environment}
                equipmentId={activeItem.id}
                isSoftwareGl={webglCaps.isSoftwareGl}
              />

              <FittedModelStage
                equipmentId={activeItem.id}
                selectedHotspotId={selectedHotspotId}
                hoveredHotspotId={hoveredHotspotId}
                onSelectHotspot={handleSelectHotspot}
                onHoverHotspot={setHoveredHotspotId}
                isSoftwareGl={webglCaps.isSoftwareGl}
                onComputedPose={handleComputedPose}
              />

              <HotspotProjector
                hotspots={spec.hotspots}
                markerRefs={hotspotElRefs}
                visible={showHotspots}
              />

              <CameraRig
                desiredPosition={desiredPosition}
                desiredTarget={desiredTarget}
                minDistance={fittedPose.minDistance}
                maxDistance={fittedPose.maxDistance}
                focusTrigger={focusTrigger}
                instantSnap={instantSnap}
                autoRotate={autoRotate}
                isSoftwareGl={webglCaps.isSoftwareGl}
                zoomStepRef={zoomStepRef}
              />
            </Canvas>
          )}

          {/* Screen-Space Projected Numbered Hotspot Markers (single React tree, zero nested roots) */}
          {!isStaticView && webglCaps.supported && !contextLost && showHotspots && (
            <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
              {spec.hotspots.map((hotspot, index) => {
                const isSelected = hotspot.id === selectedHotspotId;
                const isHovered = hotspot.id === hoveredHotspotId;
                const showTooltip = isSelected || isHovered;

                return (
                  <div
                    key={hotspot.id}
                    ref={(el) => {
                      if (el) {
                        hotspotElRefs.current[hotspot.id] = el;
                      } else {
                        delete hotspotElRefs.current[hotspot.id];
                      }
                    }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      display: 'none',
                      zIndex: showTooltip ? 30 : 10
                    }}
                    className="items-center justify-center"
                  >
                    <div className="relative flex items-center justify-center">
                      <button
                        type="button"
                        aria-label={`Subsystem ${index + 1}: ${hotspot.name}`}
                        aria-pressed={isSelected}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectHotspot(hotspot.id);
                        }}
                        onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                        onMouseLeave={() => setHoveredHotspotId(null)}
                        onFocus={() => setHoveredHotspotId(hotspot.id)}
                        onBlur={() => setHoveredHotspotId(null)}
                        className={`pointer-events-auto flex h-6 w-6 cursor-pointer items-center justify-center rounded-full border font-mono text-[11px] font-bold shadow-md transition-transform duration-150 ${
                          isSelected
                            ? 'scale-110 border-[#E6EDF7] bg-[#20B9C9] text-[#080D1C]'
                            : isHovered
                            ? 'scale-110 border-[#20B9C9] bg-[#2463C5] text-[#E6EDF7]'
                            : 'border-[#20B9C9]/85 bg-[#080D1C] text-[#E6EDF7] hover:border-[#20B9C9]'
                        }`}
                      >
                        {index + 1}
                      </button>

                      {showTooltip && (
                        <div
                          role="tooltip"
                          className="pointer-events-none absolute bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-[#20B9C9]/70 bg-[#080D1C] px-2.5 py-1 text-[11px] font-medium text-[#E6EDF7] shadow-lg"
                        >
                          {hotspot.name}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Compact Solid Bottom Viewing Controls (no backdrop-blur over WebGL) */}
          {!isStaticView && (
          <div className="pointer-events-none absolute right-3 bottom-3 left-3 z-20 flex flex-wrap items-center justify-between gap-2">
            <span className="pointer-events-auto rounded-md border border-[#1E3666] bg-[#0D152B] px-2.5 py-1 text-[11px] text-[#9FB2D1]">
              Drag to orbit · Right-drag to pan · Scroll to zoom
            </span>

            <div className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-lg border border-[#1E3666] bg-[#0D152B] p-1">
              <button
                type="button"
                onClick={() => {
                  zoomStepRef.current = 1;
                }}
                aria-label="Zoom in"
                title="Zoom in"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded text-[#C5D2E8] hover:bg-[#14264A] hover:text-[#20B9C9]"
              >
                <ZoomIn className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => {
                  zoomStepRef.current = -1;
                }}
                aria-label="Zoom out"
                title="Zoom out"
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded text-[#C5D2E8] hover:bg-[#14264A] hover:text-[#20B9C9]"
              >
                <ZoomOut className="h-4 w-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setAutoRotate((prev) => !prev)}
                aria-pressed={autoRotate}
                className={`inline-flex h-8 cursor-pointer items-center gap-1 rounded px-2.5 text-xs font-medium transition-colors ${
                  autoRotate
                    ? 'bg-[#20B9C9] text-[#080D1C]'
                    : 'text-[#C5D2E8] hover:bg-[#14264A]'
                }`}
              >
                <RotateCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Rotate</span>
              </button>
              <button
                type="button"
                onClick={() => setShowHotspots((prev) => !prev)}
                aria-pressed={showHotspots}
                className={`inline-flex h-8 cursor-pointer items-center gap-1 rounded px-2.5 text-xs font-medium transition-colors ${
                  showHotspots
                    ? 'bg-[#2463C5] text-[#E6EDF7]'
                    : 'text-[#C5D2E8] hover:bg-[#14264A]'
                }`}
              >
                {showHotspots ? (
                  <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
                )}
                <span className="hidden sm:inline">
                  {showHotspots ? 'Hide Hotspots' : 'Show Hotspots'}
                </span>
              </button>
              {selectedHotspotId && (
                <button
                  type="button"
                  onClick={handleResetSelection}
                  className="inline-flex h-8 cursor-pointer items-center gap-1 rounded px-2.5 text-xs font-medium text-[#F5B041] hover:bg-[#14264A]"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                  <span className="hidden sm:inline">Clear Part</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleResetCamera}
                className="inline-flex h-8 cursor-pointer items-center gap-1 rounded px-2.5 text-xs font-medium text-[#C5D2E8] hover:bg-[#14264A] hover:text-[#20B9C9]"
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="hidden sm:inline">Reset Camera</span>
              </button>
              <button
                type="button"
                onClick={() => void toggleFullscreen()}
                aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                title={isFullscreen ? 'Exit fullscreen' : 'Fullscreen view'}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded text-[#C5D2E8] hover:bg-[#14264A] hover:text-[#20B9C9]"
              >
                {isFullscreen ? (
                  <Minimize2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Maximize2 className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>
          )}
        </div>

        {/* Dedicated Subsystem Information Panel */}
        <aside className="flex flex-col justify-between border-t border-[#1E3666] bg-[#0D152B] p-5 lg:col-span-4 lg:border-t-0 lg:border-l">
          <div>
            <div className="flex items-center justify-between gap-2">
              <p className="font-mono text-xs uppercase tracking-wider text-[#20B9C9]">
                Subsystem Directory ({spec.hotspots.length})
              </p>
              {selectedHotspotId && (
                <button
                  type="button"
                  onClick={handleResetSelection}
                  className="cursor-pointer text-xs font-medium text-[#9FB2D1] hover:text-[#20B9C9]"
                >
                  Reset selection
                </button>
              )}
            </div>

            <p className="mt-2 text-xs leading-relaxed text-[#9FB2D1]">
              {spec.modelSummary}
            </p>

            {/* Numbered Component Selector List */}
            <div className="mt-4 space-y-2">
              {spec.hotspots.map((hotspot, idx) => {
                const isSelected = selectedHotspotId === hotspot.id;
                const isHovered = hoveredHotspotId === hotspot.id;
                return (
                  <button
                    key={hotspot.id}
                    type="button"
                    onClick={() => handleSelectHotspot(hotspot.id)}
                    onMouseEnter={() => setHoveredHotspotId(hotspot.id)}
                    onMouseLeave={() => setHoveredHotspotId(null)}
                    className={`w-full cursor-pointer rounded-lg border px-3.5 py-2.5 text-left transition-colors ${
                      isSelected
                        ? 'border-[#20B9C9] bg-[#14264A]'
                        : isHovered
                        ? 'border-[#2463C5] bg-[#14264A]/65'
                        : 'border-[#1E3666] bg-[#080D1C]/65 hover:border-[#2463C5]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold ${
                          isSelected
                            ? 'bg-[#20B9C9] text-[#080D1C]'
                            : 'border border-[#20B9C9]/70 bg-[#0D152B] text-[#20B9C9]'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-[#E6EDF7]">
                        {hotspot.name}
                      </span>
                    </div>
                    <p className="mt-1 pl-7 text-[11px] text-[#9FB2D1]">
                      {hotspot.role}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Selected Subsystem Scientific Details */}
            {selectedHotspot ? (
              <div className="mt-4 rounded-xl border border-[#20B9C9]/55 bg-[#14264A]/50 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-[#20B9C9]">
                    Subsystem 0{selectedHotspotIndex + 1}
                  </span>
                  <button
                    type="button"
                    onClick={handleFocusSelectedComponent}
                    className="inline-flex cursor-pointer items-center gap-1 rounded border border-[#2463C5] bg-[#080D1C] px-2 py-0.5 text-[11px] font-medium text-[#C5D2E8] hover:border-[#20B9C9] hover:text-[#20B9C9]"
                  >
                    <Crosshair className="h-3 w-3" aria-hidden="true" />
                    <span>Zoom to Part</span>
                  </button>
                </div>
                <h3 className="mt-1.5 font-display text-base font-semibold text-[#E6EDF7]">
                  {selectedHotspot.name}
                </h3>
                <p className="mt-0.5 text-xs font-medium text-[#7AA7F7]">
                  Function: {selectedHotspot.role}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#C5D2E8]">
                  {selectedHotspot.details}
                </p>
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-[#1E3666] bg-[#080D1C]/65 p-4 text-xs leading-relaxed text-[#9FB2D1]">
                Select any numbered marker on the 3D spacecraft or choose a
                subsystem above to highlight that component and read its
                engineering function.
              </div>
            )}
          </div>

          {onOpenDetail && (
            <button
              type="button"
              onClick={() => onOpenDetail(activeItem.id)}
              className="mt-5 inline-flex min-h-[42px] w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#2463C5] bg-[#14264A]/60 px-4 py-2 text-xs font-semibold text-[#E6EDF7] transition-colors hover:bg-[#20B9C9] hover:text-[#080D1C]"
            >
              <Compass className="h-4 w-4" aria-hidden="true" />
              <span>Open Full Archive Profile &amp; 5-Chapter Story</span>
            </button>
          )}
        </aside>
      </div>
    </section>
  );
}
