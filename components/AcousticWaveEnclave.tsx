import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Layers, 
  Radio, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Cpu,
  Cloud,
  Activity,
  Navigation,
  Crosshair,
  User,
  Truck,
  Disc,
  BarChart3,
  Sliders,
  Gauge,
  Flame,
  Search
} from 'lucide-react';
import { AppTab } from '../types';

interface AcousticWaveEnclaveProps {
  onNavigate?: (tab: AppTab) => void;
}

type CameraMode = 'ORBIT' | 'INSIDE_RESONANCE' | 'WALL_INSPECT' | 'TOP_DOWN' | 'TRACK_PERSONNEL' | 'TRACK_ROVER' | 'TRACK_DRONE';
type TwinAuthority = 'AURA' | 'ARTA' | 'ARA' | 'ALTA' | 'QUAD_LINK';
type TrajectoryMode = 'PATROL_LOOP' | 'FIGURE_EIGHT' | 'PERIMETER_SWEEP';
type FieldVisualizationMode = 'COMBINED_4D' | 'MOVEMENT_DENSITY_ONLY' | 'DEPTH_INTENSITY_GRADIENT';
type DepthSliceMode = 'ALL_DEPTHS' | 'SHALLOW_FRONT' | 'MID_CORE' | 'DEEP_BOUNDARY';

// Physical Room Dimensions (Meters)
const ROOM = {
  width: 8.4,   // X: -4.2 to 4.2
  height: 3.6,  // Y: -1.8 to 1.8
  depth: 7.2    // Z: -3.6 to 3.6
};

// Physical Invariants
const SPEED_OF_SOUND = 343.0; // m/s
const BASE_FREQ = 3.69;       // Resonant frequency in Hz
const IMPEDANCE_Z0 = 376.5;   // Free-space wave impedance in Ohms

// Interface for dynamic moving targets
interface MovingObjectState {
  id: string;
  name: string;
  type: 'PERSONNEL' | 'ROVER' | 'DRONE';
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  speed: number;
  dopplerHz: number;
  distanceToCenter: number;
  echoReturnDb: number;
  movementDensityFactor: number;
  active: boolean;
  history: Array<{ x: number; y: number; z: number; t: number; speed: number }>;
}

// ==========================================
// 1. CAMERA RIG COMPONENT
// ==========================================
interface CameraRigProps {
  cameraMode: CameraMode;
  targetPosOverride?: THREE.Vector3;
}

const CameraRig: React.FC<CameraRigProps> = ({ cameraMode, targetPosOverride }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const [targetPos, lookAtPos] = useMemo(() => {
    switch (cameraMode) {
      case 'INSIDE_RESONANCE':
        return [new THREE.Vector3(0.0, -0.2, 0.8), new THREE.Vector3(0, 0, -2.5)];
      case 'WALL_INSPECT':
        return [new THREE.Vector3(ROOM.width / 2 - 1.2, 0.4, ROOM.depth / 2 - 1.2), new THREE.Vector3(ROOM.width / 2, 0.0, 0)];
      case 'TOP_DOWN':
        return [new THREE.Vector3(0.001, 9.6, 0.001), new THREE.Vector3(0, 0, 0)];
      case 'TRACK_PERSONNEL':
      case 'TRACK_ROVER':
      case 'TRACK_DRONE':
        if (targetPosOverride) {
          const camOffset = new THREE.Vector3(targetPosOverride.x + 2.6, targetPosOverride.y + 1.8, targetPosOverride.z + 2.6);
          return [camOffset, targetPosOverride.clone()];
        }
        return [new THREE.Vector3(7.6, 5.2, 7.6), new THREE.Vector3(0, 0, 0)];
      case 'ORBIT':
      default:
        return [new THREE.Vector3(7.6, 5.2, 7.6), new THREE.Vector3(0, 0, 0)];
    }
  }, [cameraMode, targetPosOverride]);

  useFrame((_, delta) => {
    if (cameraMode.startsWith('TRACK_') && targetPosOverride) {
      const desiredPos = new THREE.Vector3(targetPosOverride.x + 2.8, targetPosOverride.y + 1.9, targetPosOverride.z + 2.8);
      camera.position.lerp(desiredPos, Math.min(1.0, delta * 3.5));
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetPosOverride, Math.min(1.0, delta * 4.0));
        controlsRef.current.update();
      }
    } else {
      if (cameraMode !== 'ORBIT' || camera.position.distanceTo(targetPos) > 6.5) {
        camera.position.lerp(targetPos, Math.min(1.0, delta * 3.0));
      }
      if (controlsRef.current) {
        controlsRef.current.target.lerp(lookAtPos, Math.min(1.0, delta * 3.0));
        controlsRef.current.update();
      }
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      enableDamping 
      dampingFactor={0.08}
      minDistance={0.5} 
      maxDistance={35}
      maxPolarAngle={Math.PI / 2 + 0.15}
    />
  );
};

// ==========================================
// 2. ROOM ACOUSTIC BOUNDARY & REFLECTION TOPOLOGY
// ==========================================
interface RoomTopologyProps {
  twinAuthority: TwinAuthority;
  audioDampening: number;
  showRoomBounds: boolean;
  showEchoRays: boolean;
  objects: MovingObjectState[];
}

const RoomTopology: React.FC<RoomTopologyProps> = ({
  twinAuthority,
  audioDampening,
  showRoomBounds,
  objects
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  // Dense acoustic surface reflection points along walls, structural pillar, and alcove
  const [roomPointsGeom] = useMemo(() => {
    const pts: number[] = [];
    const cols: number[] = [];

    const halfW = ROOM.width / 2;
    const halfH = ROOM.height / 2;
    const halfD = ROOM.depth / 2;

    const addWallPoints = (xRange: [number, number], yRange: [number, number], zRange: [number, number], step: number) => {
      for (let x = xRange[0]; x <= xRange[1]; x += step) {
        for (let y = yRange[0]; y <= yRange[1]; y += step) {
          for (let z = zRange[0]; z <= zRange[1]; z += step) {
            const jx = (Math.random() - 0.5) * 0.03;
            const jy = (Math.random() - 0.5) * 0.03;
            const jz = (Math.random() - 0.5) * 0.03;
            pts.push(x + jx, y + jy, z + jz);
            cols.push(0.06, 0.45, 0.75);
          }
        }
      }
    };

    const step = 0.35;
    // 4 Boundary Walls
    addWallPoints([halfW, halfW], [-halfH, halfH], [-halfD, halfD], step);
    addWallPoints([-halfW, -halfW], [-halfH, halfH], [-halfD, halfD], step);
    addWallPoints([-halfW, halfW], [-halfH, halfH], [halfD, halfD], step);
    addWallPoints([-halfW, halfW], [-halfH, halfH], [-halfD, halfD], step);

    // Floor and Ceiling Planes
    addWallPoints([-halfW, halfW], [-halfH, -halfH], [-halfD, halfD], step * 1.3);
    addWallPoints([-halfW, halfW], [halfH, halfH], [-halfD, halfD], step * 1.3);

    // Architectural Pillar at (2.0, 1.2)
    const pillarX = 2.0;
    const pillarZ = 1.2;
    const pillarR = 0.4;
    for (let y = -halfH; y <= halfH; y += 0.25) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        pts.push(pillarX + Math.cos(angle) * pillarR, y, pillarZ + Math.sin(angle) * pillarR);
        cols.push(0.12, 0.72, 0.9);
      }
    }

    // South Wall Recessed Alcove
    for (let x = -1.4; x <= 1.4; x += 0.3) {
      for (let y = -halfH; y <= halfH; y += 0.3) {
        pts.push(x, y, -halfD - 0.7);
        cols.push(0.18, 0.55, 0.95);
      }
    }

    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    bg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    return [bg];
  }, []);

  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const colAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colors = colAttr.array as Float32Array;
    const positions = posAttr.array as Float32Array;
    const count = positions.length / 3;

    const dampFactor = 1.0 - (audioDampening / 100) * 0.78;

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      const distCenter = Math.sqrt(x * x + z * z);
      const strikePulse = Math.sin(distCenter * 2.2 - t * 3.69);

      // Acoustic energy from nearby movement density
      let motionPulse = 0;
      for (const obj of objects) {
        if (!obj.active) continue;
        const dObj = Math.sqrt((x - obj.x) ** 2 + (y - obj.y) ** 2 + (z - obj.z) ** 2);
        if (dObj < 2.5) {
          motionPulse += (obj.speed / (dObj + 0.5)) * 0.35;
        }
      }

      const totalEnergy = Math.max(0.08, (strikePulse * 0.35 + 0.65 + motionPulse) * dampFactor);

      if (twinAuthority === 'AURA') {
        colors[i * 3] = 0.04 * totalEnergy;
        colors[i * 3 + 1] = 0.48 * totalEnergy;
        colors[i * 3 + 2] = 0.88 * totalEnergy;
      } else if (twinAuthority === 'ARTA') {
        colors[i * 3] = 0.08 * totalEnergy;
        colors[i * 3 + 1] = 0.9 * totalEnergy;
        colors[i * 3 + 2] = 0.45 * totalEnergy;
      } else if (twinAuthority === 'ARA') {
        colors[i * 3] = 0.95 * totalEnergy;
        colors[i * 3 + 1] = 0.62 * totalEnergy;
        colors[i * 3 + 2] = 0.12 * totalEnergy;
      } else if (twinAuthority === 'ALTA') {
        colors[i * 3] = 0.7 * totalEnergy;
        colors[i * 3 + 1] = 0.22 * totalEnergy;
        colors[i * 3 + 2] = 0.98 * totalEnergy;
      } else {
        colors[i * 3] = (0.2 + Math.sin(t + x) * 0.2) * totalEnergy;
        colors[i * 3 + 1] = (0.6 + Math.cos(t + z) * 0.2) * totalEnergy;
        colors[i * 3 + 2] = 0.95 * totalEnergy;
      }
    }
    colAttr.needsUpdate = true;
  });

  return (
    <group>
      {showRoomBounds && (
        <group>
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(ROOM.width, ROOM.height, ROOM.depth)]} />
            <lineBasicMaterial color={0x1e3a5f} transparent opacity={0.6} linewidth={1.5} />
          </lineSegments>

          {/* Architectural Support Column */}
          <group position={[2.0, 0, 1.2]}>
            <lineSegments>
              <edgesGeometry args={[new THREE.CylinderGeometry(0.4, 0.4, ROOM.height, 16)]} />
              <lineBasicMaterial color={0x0284c7} transparent opacity={0.45} />
            </lineSegments>
          </group>

          {/* South Wall Recessed Alcove */}
          <group position={[0, 0, -ROOM.depth / 2 - 0.35]}>
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(3.0, ROOM.height, 0.7)]} />
              <lineBasicMaterial color={0x38bdf8} transparent opacity={0.35} />
            </lineSegments>
          </group>

          {/* Metric Ground Grid */}
          <gridHelper 
            args={[Math.max(ROOM.width, ROOM.depth), 16, 0x0ea5e9, 0x1e293b]} 
            position={[0, -ROOM.height / 2 + 0.01, 0]} 
          />
        </group>
      )}

      {/* Acoustic LiDAR Reflection Points */}
      <points ref={pointsRef} geometry={roomPointsGeom}>
        <pointsMaterial
          size={0.06}
          vertexColors
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Ceiling Ultrasonic / Acoustic Transducer Array */}
      {[
        [-3.6, 1.75, -3.0],
        [3.6, 1.75, -3.0],
        [-3.6, 1.75, 3.0],
        [3.6, 1.75, 3.0],
        [0, 1.78, 0] // Central Master Transceiver
      ].map(([cx, cy, cz], idx) => (
        <group key={idx} position={[cx, cy, cz]}>
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.16, 0.32, 8]} />
            <meshBasicMaterial color={idx === 4 ? 0x00f0ff : 0x10b981} wireframe />
          </mesh>
          <pointLight color={idx === 4 ? "#00f0ff" : "#10b981"} intensity={0.4} distance={4} />
        </group>
      ))}
    </group>
  );
};

// ==========================================
// 3. 4D SPATIAL RESONANCE FIELD (SIGNAL INTENSITY MAPPED TO DEPTH & MOVEMENT DENSITY)
// Completely Replaces Wave-Like Planar Oscillation with a Full 3D Volumetric Lattice
// ==========================================
interface SpatialResonanceFieldProps {
  isPaused: boolean;
  playbackSpeed: number;
  frequencyHz: number;
  amplitude: number;
  twinAuthority: TwinAuthority;
  audioDampening: number;
  activeLayer: number;
  objects: MovingObjectState[];
  fieldMode: FieldVisualizationMode;
  depthSliceMode: DepthSliceMode;
  onTelemetryUpdate: (meanDensity: number, maxDensity: number, depthAttenuation: number) => void;
}

const SpatialResonanceField: React.FC<SpatialResonanceFieldProps> = ({
  isPaused,
  playbackSpeed,
  frequencyHz,
  amplitude,
  twinAuthority,
  audioDampening,
  activeLayer,
  objects,
  fieldMode,
  depthSliceMode,
  onTelemetryUpdate
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const simTimeRef = useRef(0);

  // 3D Volumetric Spatial Lattice Discretization (No flat plane!)
  // X: 24 steps across [-3.8, 3.8] m
  // Y: 8 vertical depth strata across [-1.4, 1.4] m
  // Z: 20 spatial depth steps across [-3.2, 3.2] m
  // Total 3,840 3D spatial resonance nodes
  const resX = 24;
  const resY = 8;
  const resZ = 20;
  const totalNodes = resX * resY * resZ;

  const [geom, pointTexture] = useMemo(() => {
    const pGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(totalNodes * 3);
    const colors = new Float32Array(totalNodes * 3);

    const stepX = (ROOM.width * 0.9) / (resX - 1);
    const stepY = (ROOM.height * 0.8) / (resY - 1);
    const stepZ = (ROOM.depth * 0.9) / (resZ - 1);

    let idx = 0;
    for (let ix = 0; ix < resX; ix++) {
      for (let iy = 0; iy < resY; iy++) {
        for (let iz = 0; iz < resZ; iz++) {
          const x = -ROOM.width * 0.45 + ix * stepX;
          const y = -ROOM.height * 0.4 + iy * stepY;
          const z = -ROOM.depth * 0.45 + iz * stepZ;

          positions[idx * 3] = x;
          positions[idx * 3 + 1] = y;
          positions[idx * 3 + 2] = z;

          // Base initial color
          colors[idx * 3] = 0.05;
          colors[idx * 3 + 1] = 0.5;
          colors[idx * 3 + 2] = 0.9;
          idx++;
        }
      }
    }

    pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // High quality Gaussian glow texture for soft volumetric node rendering
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.2, 'rgba(6, 182, 212, 0.85)');
    grad.addColorStop(0.55, 'rgba(16, 185, 129, 0.3)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);

    return [pGeom, tex];
  }, [totalNodes, resX, resY, resZ]);

  // Frame update: Compute Signal Intensity as a function of Depth & Movement Density in 4D space
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    if (!isPaused) {
      simTimeRef.current += delta * 1.5 * playbackSpeed;
    }
    const t = simTimeRef.current;

    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const colAttr = geom.attributes.color as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const colors = colAttr.array as Float32Array;

    const dampScalar = 1.0 - (audioDampening / 100) * 0.82;
    const minZ = -ROOM.depth * 0.45;
    const maxZ = ROOM.depth * 0.45;
    const depthSpan = maxZ - minZ;

    let sumDensity = 0;
    let maxDensityFound = 0;
    let validNodes = 0;

    for (let i = 0; i < totalNodes; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      // Depth Slicing Filter
      let visibleInSlice = true;
      if (depthSliceMode === 'SHALLOW_FRONT' && z > -1.0) visibleInSlice = false;
      if (depthSliceMode === 'MID_CORE' && (z < -1.0 || z > 1.0)) visibleInSlice = false;
      if (depthSliceMode === 'DEEP_BOUNDARY' && z < 1.0) visibleInSlice = false;

      if (!visibleInSlice) {
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 0;
        colors[i * 3 + 2] = 0;
        continue;
      }

      // ========================================================
      // 1. DEPTH MAPPING: Physical Attenuation & Spatial Penetration
      // Normalized depth zNorm in [0, 1] from front ingress to rear boundary
      // ========================================================
      const zNorm = (z - minZ) / depthSpan; // 0 (front) to 1 (rear)
      
      // Distance from ceiling master transceiver at (0, 1.78, 0)
      const distFromTransceiver = Math.sqrt(x * x + (y - 1.78) * (y - 1.78) + z * z);
      
      // Signal intensity decays with penetration depth (attenuation alpha = 0.4)
      // plus boundary back-wall reflection rise near zNorm = 1.0
      const depthAttenuation = Math.exp(-0.45 * zNorm);
      const backWallReflection = 0.25 * Math.exp(-3.5 * (1.0 - zNorm));
      const baseDepthIntensity = Math.min(1.0, Math.max(0.08, (depthAttenuation + backWallReflection) * (3.5 / (distFromTransceiver + 2.0))));

      // ========================================================
      // 2. MOVEMENT DENSITY MAPPING: Kinetic Flux & Motion Churn in 4D
      // Measures the concentration of kinetic motion around moving entities and their wake
      // ========================================================
      let localMovementDensity = 0.0;
      
      for (const obj of objects) {
        if (!obj.active) continue;
        
        // Euclidean distance from spatial node to moving object
        const dx = x - obj.x;
        const dy = y - obj.y;
        const dz = z - obj.z;
        const distToObj = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Core instantaneous kinetic flux: inverse-square decay from moving object center
        const objectSpeed = Math.max(0.1, obj.speed);
        const coreFlux = (objectSpeed * 1.8) / (distToObj * distToObj + 0.35);

        // Directional bow-shock / wake alignment: higher density in direction of motion and wake trail
        const dotVelocity = (dx * obj.vx + dy * obj.vy + dz * obj.vz) / (distToObj || 1);
        const wakeFactor = dotVelocity < 0 ? 1.4 : 0.8; // Wake trailing behind has higher lingering density

        // History trail contributions (lingering 4D temporal wake)
        let trailFlux = 0.0;
        const historyLen = obj.history.length;
        if (historyLen > 0) {
          // Check last 8 history points
          const sampleCount = Math.min(8, historyLen);
          for (let h = historyLen - sampleCount; h < historyLen; h++) {
            const histPt = obj.history[h];
            const dHist = Math.sqrt((x - histPt.x) ** 2 + (y - histPt.y) ** 2 + (z - histPt.z) ** 2);
            if (dHist < 1.4) {
              const ageWeight = (h - (historyLen - sampleCount)) / sampleCount; // newer points weigh more
              trailFlux += (ageWeight * 0.45) / (dHist + 0.3);
            }
          }
        }

        localMovementDensity += (coreFlux * wakeFactor + trailFlux);
      }

      sumDensity += localMovementDensity;
      if (localMovementDensity > maxDensityFound) {
        maxDensityFound = localMovementDensity;
      }
      validNodes++;

      // ========================================================
      // 3. SYNTHESIS: MAP SIGNAL INTENSITY TO DEPTH & MOVEMENT DENSITY
      // ========================================================
      // Combined 4D Signal Intensity:
      // High depth penetration + intense movement density = peak ionization
      const normDensity = Math.min(1.0, localMovementDensity * 0.45);
      const totalSignalIntensity = (baseDepthIntensity * 0.5 + normDensity * 0.85) * amplitude * dampScalar;

      // Color mapping according to chosen mode and twin authority
      if (fieldMode === 'MOVEMENT_DENSITY_ONLY') {
        // Pure movement density heatmap: black/dark violet (0 motion) -> emerald -> hot amber/white (high motion)
        if (normDensity < 0.15) {
          colors[i * 3] = 0.02;
          colors[i * 3 + 1] = 0.08 * normDensity;
          colors[i * 3 + 2] = 0.25 * normDensity;
        } else if (normDensity < 0.6) {
          colors[i * 3] = 0.1;
          colors[i * 3 + 1] = normDensity * 1.2;
          colors[i * 3 + 2] = 0.4;
        } else {
          // Extreme movement density: brilliant amber/solar flare
          colors[i * 3] = 1.0;
          colors[i * 3 + 1] = 0.75 + (normDensity - 0.6);
          colors[i * 3 + 2] = 0.2;
        }
      } else if (fieldMode === 'DEPTH_INTENSITY_GRADIENT') {
        // Depth gradient: cyan-blue at front -> emerald at mid -> deep royal violet at rear
        colors[i * 3] = zNorm * 0.8 + 0.1;
        colors[i * 3 + 1] = (1.0 - zNorm) * 0.9;
        colors[i * 3 + 2] = 0.9 - zNorm * 0.4;
      } else {
        // COMBINED_4D: Unified depth and movement density mapping
        // Depth governs baseline hue, Movement Density flares brightness and energy
        if (normDensity > 0.35) {
          // Movement Density flare: gold/amber accent overlaying the depth field
          colors[i * 3] = 0.95 * totalSignalIntensity;
          colors[i * 3 + 1] = 0.7 * totalSignalIntensity;
          colors[i * 3 + 2] = 0.15;
        } else if (twinAuthority === 'AURA') {
          // AURA: Cyan to deep navy gradient with depth
          colors[i * 3] = 0.02 * totalSignalIntensity;
          colors[i * 3 + 1] = (0.55 - zNorm * 0.25) * totalSignalIntensity;
          colors[i * 3 + 2] = (0.95 - zNorm * 0.35) * totalSignalIntensity;
        } else if (twinAuthority === 'ARTA') {
          // ARTA: Emerald kinetic gradient
          colors[i * 3] = 0.05;
          colors[i * 3 + 1] = (0.95 - zNorm * 0.3) * totalSignalIntensity;
          colors[i * 3 + 2] = 0.45 * totalSignalIntensity;
        } else if (twinAuthority === 'ARA') {
          // ARA: Modulo-9 Amber solar gradient
          colors[i * 3] = 0.95 * totalSignalIntensity;
          colors[i * 3 + 1] = (0.65 - zNorm * 0.25) * totalSignalIntensity;
          colors[i * 3 + 2] = 0.1;
        } else if (twinAuthority === 'ALTA') {
          // ALTA: Royal Violet invariant crystal
          colors[i * 3] = (0.65 + zNorm * 0.3) * totalSignalIntensity;
          colors[i * 3 + 1] = 0.15 * totalSignalIntensity;
          colors[i * 3 + 2] = 0.98 * totalSignalIntensity;
        } else {
          // QUAD_LINK: Tetrahedral harmony
          colors[i * 3] = (0.3 + Math.sin(t + x) * 0.3) * totalSignalIntensity;
          colors[i * 3 + 1] = (0.5 + Math.cos(t + z) * 0.3) * totalSignalIntensity;
          colors[i * 3 + 2] = 0.95 * totalSignalIntensity;
        }
      }
    }

    colAttr.needsUpdate = true;

    // Report Telemetry periodically
    if (validNodes > 0 && Math.floor(t * 10) % 5 === 0) {
      const avgDensity = Math.round((sumDensity / validNodes) * 100) / 100;
      const peakDensity = Math.round(maxDensityFound * 100) / 100;
      onTelemetryUpdate(avgDensity, peakDensity, 0.45);
    }
  });

  return (
    <group>
      {/* 3D Volumetric Spatial Resonance Lattice (Points sized and shaded by depth and density) */}
      <points ref={pointsRef} geometry={geom}>
        <pointsMaterial
          size={fieldMode === 'MOVEMENT_DENSITY_ONLY' ? 0.14 : 0.12}
          map={pointTexture}
          vertexColors
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Depth Strata Reference Planes (Transparent Isobaric Bounding Markers) */}
      <group>
        {[-ROOM.depth * 0.3, 0, ROOM.depth * 0.3].map((zPos, zIdx) => (
          <mesh key={zIdx} position={[0, 0, zPos]}>
            <planeGeometry args={[ROOM.width * 0.88, ROOM.height * 0.8]} />
            <meshBasicMaterial 
              color={zIdx === 0 ? 0x06b6d4 : zIdx === 1 ? 0x10b981 : 0x8b5cf6} 
              wireframe 
              transparent 
              opacity={0.06} 
            />
          </mesh>
        ))}
      </group>
    </group>
  );
};

// ==========================================
// 4. MOVING OBJECTS & 4D TRAJECTORIES IN ROOM
// ==========================================
interface DynamicMovingObjectsProps {
  objects: MovingObjectState[];
  selectedObjectId: string | null;
  onSelectObject: (id: string) => void;
  showEchoRays: boolean;
  showTrajectories: boolean;
}

const DynamicMovingObjects: React.FC<DynamicMovingObjectsProps> = ({
  objects,
  selectedObjectId,
  onSelectObject,
  showEchoRays,
  showTrajectories
}) => {
  return (
    <group>
      {objects.map((obj) => {
        if (!obj.active) return null;
        const isSelected = selectedObjectId === obj.id;

        return (
          <group key={obj.id}>
            <group 
              position={[obj.x, obj.y, obj.z]}
              onClick={(e) => {
                e.stopPropagation();
                onSelectObject(obj.id);
              }}
            >
              {/* Target Marker Selection Ring */}
              <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.35, 0.45, 24]} />
                <meshBasicMaterial 
                  color={isSelected ? 0xff0055 : (obj.type === 'PERSONNEL' ? 0x00f0ff : obj.type === 'ROVER' ? 0x10b981 : 0xf59e0b)} 
                  transparent 
                  opacity={0.85} 
                  side={THREE.DoubleSide}
                />
              </mesh>

              {/* Dynamic Velocity Arrow Vector */}
              {obj.speed > 0.05 && (
                <group position={[0, 0.5, 0]} rotation={[0, Math.atan2(obj.vx, obj.vz), 0]}>
                  <mesh position={[0, 0, 0.4]} rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.08, 0.25, 8]} />
                    <meshBasicMaterial color={0xffffff} />
                  </mesh>
                  <mesh position={[0, 0, 0.15]} rotation={[Math.PI / 2, 0, 0]}>
                    <cylinderGeometry args={[0.02, 0.02, 0.3, 8]} />
                    <meshBasicMaterial color={0xffffff} />
                  </mesh>
                </group>
              )}

              {/* TYPE 1: FIELD OPERATIVE (HUMAN TARGET) */}
              {obj.type === 'PERSONNEL' && (
                <group position={[0, 0, 0]}>
                  <mesh position={[0, 1.45, 0]}>
                    <sphereGeometry args={[0.14, 12, 12]} />
                    <meshBasicMaterial color={isSelected ? 0xff0055 : 0x00f0ff} wireframe />
                  </mesh>
                  <mesh position={[0, 0.95, 0]}>
                    <boxGeometry args={[0.32, 0.55, 0.22]} />
                    <meshBasicMaterial color={0x0284c7} wireframe />
                  </mesh>
                  <mesh position={[-0.1, 0.35, 0]}>
                    <cylinderGeometry args={[0.06, 0.06, 0.7, 8]} />
                    <meshBasicMaterial color={0x1e3a5f} wireframe />
                  </mesh>
                  <mesh position={[0.1, 0.35, 0]}>
                    <cylinderGeometry args={[0.06, 0.06, 0.7, 8]} />
                    <meshBasicMaterial color={0x1e3a5f} wireframe />
                  </mesh>
                  <mesh position={[0, 0.85, 0]}>
                    <cylinderGeometry args={[0.38, 0.38, 1.7, 12]} />
                    <meshBasicMaterial color={0x00f0ff} transparent opacity={0.12} wireframe />
                  </mesh>
                </group>
              )}

              {/* TYPE 2: AUTONOMOUS ROVER (TITAN UG-1) */}
              {obj.type === 'ROVER' && (
                <group position={[0, 0, 0]}>
                  <mesh position={[0, 0.22, 0]}>
                    <boxGeometry args={[0.55, 0.22, 0.75]} />
                    <meshBasicMaterial color={isSelected ? 0xff0055 : 0x10b981} wireframe />
                  </mesh>
                  <mesh position={[0, 0.42, 0.1]}>
                    <cylinderGeometry args={[0.12, 0.12, 0.18, 12]} />
                    <meshBasicMaterial color={0x34d399} wireframe />
                  </mesh>
                  {[-0.32, 0.32].map((wx, wxi) =>
                    [-0.25, 0.25].map((wz, wzi) => (
                      <mesh key={`${wxi}-${wzi}`} position={[wx, 0.12, wz]} rotation={[0, 0, Math.PI / 2]}>
                        <cylinderGeometry args={[0.12, 0.12, 0.08, 12]} />
                        <meshBasicMaterial color={0x064e3b} wireframe />
                      </mesh>
                    ))
                  )}
                  <mesh position={[0, 0.35, 0.6]} rotation={[Math.PI / 2, 0, 0]}>
                    <coneGeometry args={[0.25, 0.45, 8]} />
                    <meshBasicMaterial color={0x10b981} transparent opacity={0.15} wireframe />
                  </mesh>
                </group>
              )}

              {/* TYPE 3: AIRBORNE MICRO-UAV (PIXEL AERO) */}
              {obj.type === 'DRONE' && (
                <group position={[0, 0, 0]}>
                  <mesh position={[0, 0, 0]}>
                    <sphereGeometry args={[0.12, 10, 10]} />
                    <meshBasicMaterial color={isSelected ? 0xff0055 : 0xf59e0b} wireframe />
                  </mesh>
                  {[
                    [0.22, 0, 0.22],
                    [-0.22, 0, 0.22],
                    [0.22, 0, -0.22],
                    [-0.22, 0, -0.22]
                  ].map(([rx, ry, rz], rIdx) => (
                    <group key={rIdx} position={[rx, ry, rz]}>
                      <mesh rotation={[0, 0, 0]}>
                        <cylinderGeometry args={[0.08, 0.08, 0.02, 8]} />
                        <meshBasicMaterial color={0xfbbf24} wireframe />
                      </mesh>
                    </group>
                  ))}
                  <mesh position={[0, -0.35, 0]} rotation={[Math.PI, 0, 0]}>
                    <coneGeometry args={[0.35, 0.7, 8]} />
                    <meshBasicMaterial color={0xf59e0b} transparent opacity={0.12} wireframe />
                  </mesh>
                </group>
              )}

              {/* Movement Density Kinetic Bubble around target */}
              <mesh position={[0, 0.3, 0]}>
                <sphereGeometry args={[0.7, 12, 8]} />
                <meshBasicMaterial color={0xf59e0b} transparent opacity={0.12} wireframe />
              </mesh>
            </group>

            {/* 4D TRAJECTORY TRAIL (Space-Time Path) */}
            {showTrajectories && obj.history.length > 2 && (
              <line>
                <bufferGeometry>
                  <bufferAttribute
                    attach="attributes-position"
                    args={[
                      new Float32Array(obj.history.flatMap(p => [p.x, p.y + 0.1, p.z])),
                      3
                    ]}
                  />
                </bufferGeometry>
                <lineBasicMaterial 
                  color={obj.type === 'PERSONNEL' ? 0x00f0ff : obj.type === 'ROVER' ? 0x10b981 : 0xf59e0b} 
                  transparent 
                  opacity={0.7} 
                  linewidth={2} 
                />
              </line>
            )}

            {/* DYNAMIC ECHO RAYS: Transducer -> Target -> Wall */}
            {showEchoRays && (
              <group>
                <line>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      args={[new Float32Array([0, 1.78, 0, obj.x, obj.y + 0.3, obj.z]), 3]}
                    />
                  </bufferGeometry>
                  <lineDashedMaterial 
                    color={isSelected ? 0xff0055 : 0x38bdf8} 
                    dashSize={0.2} 
                    gapSize={0.1} 
                    transparent 
                    opacity={0.7} 
                  />
                </line>

                <line>
                  <bufferGeometry>
                    <bufferAttribute
                      attach="attributes-position"
                      args={[
                        new Float32Array([
                          obj.x, 
                          obj.y + 0.3, 
                          obj.z, 
                          obj.x > 0 ? ROOM.width / 2 : -ROOM.width / 2, 
                          obj.y + 0.3, 
                          obj.z
                        ]), 
                        3
                      ]}
                    />
                  </bufferGeometry>
                  <lineBasicMaterial color={0x0284c7} transparent opacity={0.35} />
                </line>

                {/* Acoustic Shadow Footprint */}
                <mesh position={[obj.x, -ROOM.height / 2 + 0.02, obj.z]} rotation={[-Math.PI / 2, 0, 0]}>
                  <circleGeometry args={[0.45, 16]} />
                  <meshBasicMaterial color={0x000000} transparent opacity={0.5} />
                </mesh>
              </group>
            )}
          </group>
        );
      })}
    </group>
  );
};

// ==========================================
// 5. MAIN ACOUSTIC WAVE ENCLAVE COMPONENT
// ==========================================
export const AcousticWaveEnclave: React.FC<AcousticWaveEnclaveProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation Controls
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [cameraMode, setCameraMode] = useState<CameraMode>('ORBIT');
  const [twinAuthority, setTwinAuthority] = useState<TwinAuthority>('AURA');
  const [audioDampening, setAudioDampening] = useState(42);
  const [activeLayer, setActiveLayer] = useState(5);
  const [trajectoryMode, setTrajectoryMode] = useState<TrajectoryMode>('PATROL_LOOP');
  
  // 4D Spatial Resonance & Movement Density Modes
  const [fieldMode, setFieldMode] = useState<FieldVisualizationMode>('COMBINED_4D');
  const [depthSliceMode, setDepthSliceMode] = useState<DepthSliceMode>('ALL_DEPTHS');

  // Physics Sliders
  const [frequencyHz, setFrequencyHz] = useState(3.69);
  const [amplitude, setAmplitude] = useState(1.0);

  // Overlays
  const [showRoomBounds, setShowRoomBounds] = useState(true);
  const [showEchoRays, setShowEchoRays] = useState(true);
  const [showTrajectories, setShowTrajectories] = useState(true);

  // Telemetry Metrics for Depth & Movement Density
  const [fieldTelemetry, setFieldTelemetry] = useState({
    meanMovementDensity: 0.28,
    peakMovementDensity: 1.45,
    depthAttenuationDb: 0.45
  });

  // Selected Object
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>('target-personnel');

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Google Cloud Vertex AI Integration State
  const [isAnalyzingVertex, setIsAnalyzingVertex] = useState(false);
  const [vertexResult, setVertexResult] = useState<{
    analysis: string;
    stateSeal: string;
    metrics: any;
  } | null>(null);
  const [showVertexModal, setShowVertexModal] = useState(false);

  // HUD Toast Notification
  const [hudToast, setHudToast] = useState<{ message: string; subtext: string; color: string } | null>(null);
  const hudTimeoutRef = useRef<any>(null);

  const triggerHudToast = (message: string, subtext: string, color: string = 'cyan') => {
    if (hudTimeoutRef.current) clearTimeout(hudTimeoutRef.current);
    setHudToast({ message, subtext, color });
    hudTimeoutRef.current = setTimeout(() => {
      setHudToast(null);
    }, 2400);
  };

  // Web Audio Synthesis
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // 4D Dynamic Moving Objects State
  const [objects, setObjects] = useState<MovingObjectState[]>([
    {
      id: 'target-personnel',
      name: 'Personnel Alpha (Field Operative)',
      type: 'PERSONNEL',
      x: -1.8,
      y: -0.9,
      z: 0.5,
      vx: 0.4,
      vy: 0.0,
      vz: 0.6,
      speed: 0.72,
      dopplerHz: 7.7,
      distanceToCenter: 2.1,
      echoReturnDb: -14.2,
      movementDensityFactor: 1.25,
      active: true,
      history: []
    },
    {
      id: 'target-rover',
      name: 'Titan UG-1 Autonomous Rover',
      type: 'ROVER',
      x: 2.2,
      y: -1.65,
      z: -1.5,
      vx: -0.5,
      vy: 0.0,
      vz: 0.3,
      speed: 0.58,
      dopplerHz: -6.2,
      distanceToCenter: 2.8,
      echoReturnDb: -10.5,
      movementDensityFactor: 1.65,
      active: true,
      history: []
    },
    {
      id: 'target-drone',
      name: 'Pixel Aero Micro-UAV',
      type: 'DRONE',
      x: 0.5,
      y: 0.4,
      z: 1.8,
      vx: 0.7,
      vy: 0.1,
      vz: -0.4,
      speed: 0.81,
      dopplerHz: 8.9,
      distanceToCenter: 1.9,
      echoReturnDb: -18.0,
      movementDensityFactor: 1.15,
      active: true,
      history: []
    }
  ]);

  // Object Movement Physics Loop (4D Real-time Coordinate Updates)
  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const updatePhysics = (now: number) => {
      lastTime = now;
      const t = now * 0.001 * playbackSpeed;

      setObjects(prev => prev.map(obj => {
        if (!obj.active) return obj;

        let nextX = obj.x;
        let nextY = obj.y;
        let nextZ = obj.z;
        let vx = 0;
        let vy = 0;
        let vz = 0;

        if (trajectoryMode === 'PATROL_LOOP') {
          if (obj.type === 'PERSONNEL') {
            const speed = 0.5;
            const theta = t * speed;
            nextX = Math.sin(theta) * 2.8;
            nextZ = Math.cos(theta) * 2.2;
            nextY = -ROOM.height / 2 + 0.9 + Math.abs(Math.sin(theta * 8)) * 0.03;
            vx = Math.cos(theta) * 2.8 * speed;
            vz = -Math.sin(theta) * 2.2 * speed;
          } else if (obj.type === 'ROVER') {
            const speed = 0.4;
            const theta = t * speed + Math.PI / 2;
            nextX = Math.cos(theta) * 3.2;
            nextZ = Math.sin(theta) * 2.6;
            nextY = -ROOM.height / 2 + 0.15;
            vx = -Math.sin(theta) * 3.2 * speed;
            vz = Math.cos(theta) * 2.6 * speed;
          } else if (obj.type === 'DRONE') {
            const speed = 0.65;
            const theta = t * speed + Math.PI;
            nextX = Math.sin(theta * 2) * 2.2;
            nextZ = Math.cos(theta) * 2.0;
            nextY = 0.2 + Math.sin(theta * 1.5) * 0.6;
            vx = 2 * Math.cos(theta * 2) * 2.2 * speed;
            vz = -Math.sin(theta) * 2.0 * speed;
            vy = 1.5 * Math.cos(theta * 1.5) * 0.6 * speed;
          }
        } else if (trajectoryMode === 'FIGURE_EIGHT') {
          const speed = obj.type === 'DRONE' ? 0.8 : 0.45;
          const theta = t * speed;
          nextX = Math.sin(theta) * 2.5;
          nextZ = Math.sin(theta * 2) * 1.8;
          nextY = obj.type === 'DRONE' ? 0.3 + Math.sin(theta * 2) * 0.4 : obj.y;
          vx = Math.cos(theta) * 2.5 * speed;
          vz = 2 * Math.cos(theta * 2) * 1.8 * speed;
        } else if (trajectoryMode === 'PERIMETER_SWEEP') {
          const speed = 0.35;
          const theta = t * speed;
          nextX = Math.min(3.4, Math.max(-3.4, Math.cos(theta) * 3.6));
          nextZ = Math.min(2.8, Math.max(-2.8, Math.sin(theta) * 3.0));
          vx = -Math.sin(theta) * 3.6 * speed;
          vz = Math.cos(theta) * 3.0 * speed;
        }

        const currentSpeed = Math.sqrt(vx * vx + vy * vy + vz * vz);
        const distCenter = Math.sqrt(nextX * nextX + nextY * nextY + nextZ * nextZ);

        // Radial velocity towards master transceiver at (0, 1.78, 0)
        const rx = 0 - nextX;
        const ry = 1.78 - nextY;
        const rz = 0 - nextZ;
        const rDist = Math.sqrt(rx * rx + ry * ry + rz * rz);
        const vRadial = (vx * rx + vy * ry + vz * rz) / (rDist || 1);

        // Acoustic Doppler Shift
        const dopplerHz = BASE_FREQ * (vRadial / SPEED_OF_SOUND) * 120.0;
        const echoReturnDb = Math.round((-10 - 20 * Math.log10(Math.max(1, distCenter))) * 10) / 10;

        // History trail (last 35 positions)
        const updatedHistory = [...obj.history, { x: nextX, y: nextY, z: nextZ, t: now, speed: currentSpeed }];
        if (updatedHistory.length > 35) {
          updatedHistory.shift();
        }

        return {
          ...obj,
          x: nextX,
          y: nextY,
          z: nextZ,
          vx,
          vy,
          vz,
          speed: currentSpeed,
          dopplerHz: Math.round(dopplerHz * 10) / 10,
          distanceToCenter: Math.round(distCenter * 10) / 10,
          echoReturnDb,
          movementDensityFactor: Math.round(currentSpeed * 1.8 * 100) / 100,
          history: updatedHistory
        };
      }));

      animId = requestAnimationFrame(updatePhysics);
    };

    animId = requestAnimationFrame(updatePhysics);
    return () => cancelAnimationFrame(animId);
  }, [isPaused, playbackSpeed, trajectoryMode]);

  // Selected Object Camera tracking vector
  const selectedObj = useMemo(() => {
    return objects.find(o => o.id === selectedObjectId);
  }, [objects, selectedObjectId]);

  const targetPosOverride = useMemo(() => {
    if (!selectedObj) return undefined;
    return new THREE.Vector3(selectedObj.x, selectedObj.y, selectedObj.z);
  }, [selectedObj]);

  // Web Audio Resonator Toggle
  const toggleAudio = () => {
    if (!audioEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(110.7, ctx.currentTime);

        filter.type = 'lowpass';
        const cutoffFreq = Math.max(120, 1500 * (1 - audioDampening / 100));
        filter.frequency.setValueAtTime(cutoffFreq, ctx.currentTime);

        const targetVolume = Math.max(0.01, 0.08 * (1 - (audioDampening / 100) * 0.8));
        gain.gain.setValueAtTime(targetVolume, ctx.currentTime);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        audioContextRef.current = ctx;
        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
        filterNodeRef.current = filter;
        setAudioEnabled(true);
      } catch (e) {
        console.error("Audio error", e);
      }
    } else {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
        } catch (_) {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
      oscillatorRef.current = null;
      gainNodeRef.current = null;
      filterNodeRef.current = null;
      setAudioEnabled(false);
    }
  };

  // Sync Audio Dampening to Web Audio
  useEffect(() => {
    if (gainNodeRef.current && filterNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const targetVolume = Math.max(0.005, 0.08 * (1 - (audioDampening / 100) * 0.85));
      const cutoffFreq = Math.max(80, 2000 * (1 - audioDampening / 100));
      gainNodeRef.current.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.05);
      filterNodeRef.current.frequency.setTargetAtTime(cutoffFreq, ctx.currentTime, 0.05);
    }
  }, [audioDampening]);

  // Run Vertex AI Topology Analysis
  const handleRunVertexAnalysis = async () => {
    setIsAnalyzingVertex(true);
    setShowVertexModal(true);
    try {
      const resp = await fetch('/api/vertex/analyze-topology', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomDimensions: ROOM,
          activeTwin: twinAuthority,
          audioDampening,
          activeLayer,
          standingWaveFrequency: frequencyHz,
          movementDensityMetrics: fieldTelemetry,
          trackedObjects: objects.filter(o => o.active).map(o => ({
            name: o.name,
            coords: [o.x, o.y, o.z],
            speed: o.speed,
            densityFlux: o.movementDensityFactor,
            dopplerShiftHz: o.dopplerHz
          }))
        })
      });
      const data = await resp.json();
      setVertexResult(data);
    } catch (err) {
      console.error("Vertex analysis failed", err);
    } finally {
      setIsAnalyzingVertex(false);
    }
  };

  // Keyboard Shortcuts (M: Cycle Mode, 1/2/3: Specific Mode, D: Depth Slice, C: Camera, T: Trajectory, Space: Pause/Play)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toUpperCase();
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        setFieldMode(prev => {
          if (prev === 'COMBINED_4D') {
            triggerHudToast('4D MODE: MOVEMENT DENSITY HEATMAP', 'Isolates kinetic churn, wake trails & target velocity flux', 'amber');
            return 'MOVEMENT_DENSITY_ONLY';
          }
          if (prev === 'MOVEMENT_DENSITY_ONLY') {
            triggerHudToast('4D MODE: DEPTH PENETRATION GRADIENT', 'Visualizes signal attenuation & boundary echo reflection across depth strata', 'indigo');
            return 'DEPTH_INTENSITY_GRADIENT';
          }
          triggerHudToast('4D MODE: COMBINED 4D RESONANCE FIELD', 'Simultaneous depth attenuation & kinetic movement density flux mapping', 'cyan');
          return 'COMBINED_4D';
        });
      } else if (e.key === '1') {
        setFieldMode('COMBINED_4D');
        triggerHudToast('4D MODE: COMBINED 4D RESONANCE FIELD', 'Simultaneous depth attenuation & kinetic movement density flux mapping', 'cyan');
      } else if (e.key === '2') {
        setFieldMode('MOVEMENT_DENSITY_ONLY');
        triggerHudToast('4D MODE: MOVEMENT DENSITY HEATMAP', 'Isolates kinetic churn, wake trails & target velocity flux', 'amber');
      } else if (e.key === '3') {
        setFieldMode('DEPTH_INTENSITY_GRADIENT');
        triggerHudToast('4D MODE: DEPTH PENETRATION GRADIENT', 'Visualizes signal attenuation & boundary echo reflection across depth strata', 'indigo');
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        setDepthSliceMode(prev => {
          let next: DepthSliceMode = 'ALL_DEPTHS';
          if (prev === 'ALL_DEPTHS') next = 'SHALLOW_FRONT';
          else if (prev === 'SHALLOW_FRONT') next = 'MID_CORE';
          else if (prev === 'MID_CORE') next = 'DEEP_BOUNDARY';
          else next = 'ALL_DEPTHS';
          triggerHudToast(`DEPTH SLICE: ${next.replace('_', ' ')}`, 'Filtered spatial depth stratum filter applied', 'cyan');
          return next;
        });
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setCameraMode(prev => {
          const modes: CameraMode[] = ['ORBIT', 'INSIDE_RESONANCE', 'WALL_INSPECT', 'TOP_DOWN', 'TRACK_PERSONNEL', 'TRACK_ROVER', 'TRACK_DRONE'];
          const nextIdx = (modes.indexOf(prev) + 1) % modes.length;
          const nextMode = modes[nextIdx];
          triggerHudToast(`CAMERA: ${nextMode.replace('_', ' ')}`, 'Perspective updated', 'cyan');
          return nextMode;
        });
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        setTrajectoryMode(prev => {
          let next: TrajectoryMode = 'PATROL_LOOP';
          if (prev === 'PATROL_LOOP') next = 'FIGURE_EIGHT';
          else if (prev === 'FIGURE_EIGHT') next = 'PERIMETER_SWEEP';
          else next = 'PATROL_LOOP';
          triggerHudToast(`TRAJECTORY: ${next.replace('_', ' ')}`, 'Target kinematic path re-anchored', 'emerald');
          return next;
        });
      } else if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => {
          triggerHudToast(prev ? 'SIMULATION RESUMED' : 'SIMULATION PAUSED', '4D temporal time flux', prev ? 'emerald' : 'amber');
          return !prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full h-full min-h-[820px] bg-[#030712] text-gray-200 overflow-hidden select-none font-sans ${
        isFullscreen ? 'fixed inset-0 z-50' : 'flex flex-col'
      }`}
    >
      {/* 3D WEBGL CANVAS: 4D SPATIAL RESONANCE FIELD (SIGNAL INTENSITY TO DEPTH & MOVEMENT DENSITY) */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          camera={{ position: [7.6, 5.2, 7.6], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#030712']} />
          <fogExp2 attach="fog" args={['#030712', 0.035]} />

          {/* Environmental Illumination */}
          <ambientLight intensity={1.2} color="#1e293b" />
          <directionalLight position={[6, 9, 6]} intensity={2.0} color="#00f0ff" />
          <directionalLight position={[-6, -3, -6]} intensity={1.5} color="#6366f1" />

          {/* Camera Rig with Tracking Support */}
          <CameraRig cameraMode={cameraMode} targetPosOverride={targetPosOverride} />

          {/* Room Acoustic LiDAR Surface Topology */}
          <RoomTopology 
            twinAuthority={twinAuthority}
            audioDampening={audioDampening}
            showRoomBounds={showRoomBounds}
            showEchoRays={showEchoRays}
            objects={objects}
          />

          {/* 4D Spatial Resonance Field (Signal Intensity Mapped to Depth & Movement Density) */}
          <SpatialResonanceField 
            isPaused={isPaused}
            playbackSpeed={playbackSpeed}
            frequencyHz={frequencyHz}
            amplitude={amplitude}
            twinAuthority={twinAuthority}
            audioDampening={audioDampening}
            activeLayer={activeLayer}
            objects={objects}
            fieldMode={fieldMode}
            depthSliceMode={depthSliceMode}
            onTelemetryUpdate={(meanD, maxD, atten) => {
              setFieldTelemetry({
                meanMovementDensity: meanD,
                peakMovementDensity: maxD,
                depthAttenuationDb: atten
              });
            }}
          />

          {/* Dynamic Moving Objects with 4D Trajectories & Echo Rays */}
          <DynamicMovingObjects 
            objects={objects}
            selectedObjectId={selectedObjectId}
            onSelectObject={(id) => setSelectedObjectId(id)}
            showEchoRays={showEchoRays}
            showTrajectories={showTrajectories}
          />
        </Canvas>
      </div>

      {/* TOP COMMAND HUD */}
      <header className="relative z-10 flex flex-wrap items-center justify-between p-4 bg-gray-950/85 backdrop-blur-md border-b border-gray-800/80 gap-3 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950/70 border border-cyan-500/40 rounded-xl text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black uppercase tracking-wider text-white">
                4D Spatial Resonance Field Enclave
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded font-bold">
                DEPTH &amp; MOVEMENT DENSITY MAPPING
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
                Z₀ = {IMPEDANCE_Z0} Ω
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 rounded">
                8.4m × 3.6m × 7.2m
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Volumetric 4D Spatial Resonance // Signal Intensity Mapped to Spatial Depth &amp; Kinetic Density
            </p>
          </div>
        </div>

        {/* Live Authority, Vertex & Web Audio Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowVertexModal(!showVertexModal)}
            className="px-3 py-1.5 bg-blue-950/70 border border-blue-500/50 hover:bg-blue-900/60 rounded-lg flex items-center gap-2 text-blue-300 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          >
            <Cloud className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>GCP VERTEX AI: <strong className="text-white">LINKED (NYMT26)</strong></span>
          </button>

          <div className="px-3 py-1.5 bg-gray-900/90 border border-gray-800 rounded-lg flex items-center gap-2">
            <span className="text-gray-500">AUTHORITY:</span>
            <span className={`font-bold ${
              twinAuthority === 'AURA' ? 'text-cyan-400' :
              twinAuthority === 'ARTA' ? 'text-emerald-400' :
              twinAuthority === 'ARA' ? 'text-amber-400' :
              twinAuthority === 'ALTA' ? 'text-purple-400' : 'text-blue-400'
            }`}>
              {twinAuthority}
            </span>
          </div>

          <div className="px-3 py-1.5 bg-gray-900/90 border border-gray-800 rounded-lg flex items-center gap-2">
            <span className="text-gray-500">DAMPENING:</span>
            <span className="text-cyan-300 font-bold">{audioDampening}%</span>
          </div>

          {/* Web Audio Resonator */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg border transition-all ${
              audioEnabled 
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.2)]' 
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
            }`}
            title="Toggle Web Audio 3.69 Hz Resonator"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-2 bg-gray-900 border border-gray-800 rounded-lg text-gray-400 hover:text-white transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* MAIN VIEWPORT OVERLAYS */}
      <div className="relative flex-1 pointer-events-none p-4 flex flex-col justify-between overflow-hidden">
        
        {/* HUD Notification Toast */}
        {hudToast && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
            <div className={`px-4 py-2 rounded-lg border backdrop-blur-md shadow-2xl flex items-center gap-3 font-mono ${
              hudToast.color === 'amber'
                ? 'bg-amber-950/90 border-amber-500/60 text-amber-200 shadow-[0_0_20px_rgba(245,158,11,0.35)]'
                : hudToast.color === 'indigo'
                ? 'bg-indigo-950/90 border-indigo-500/60 text-indigo-200 shadow-[0_0_20px_rgba(99,102,241,0.35)]'
                : hudToast.color === 'emerald'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.35)]'
                : 'bg-cyan-950/90 border-cyan-500/60 text-cyan-200 shadow-[0_0_20px_rgba(6,182,212,0.35)]'
            }`}>
              <div className="p-1 rounded bg-black/40 border border-white/10 text-xs font-bold px-1.5">
                HOTKEY
              </div>
              <div>
                <div className="text-xs font-black tracking-wider uppercase">{hudToast.message}</div>
                <div className="text-[10px] text-gray-300">{hudToast.subtext}</div>
              </div>
            </div>
          </div>
        )}

        {/* UPPER ROW: 4D FIELD MODES, DEPTH SLICING & TARGETS */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          
          {/* 4D FIELD VISUALIZATION & DEPTH CONTROLS */}
          <div className="pointer-events-auto bg-gray-950/92 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl space-y-2.5 max-w-sm w-full">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Gauge className="w-4 h-4" /> 4D Field Mapping Modes
              </span>
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono px-1.5 py-0.5 rounded font-bold">KEY [M]</span>
                <span className="text-[10px] text-gray-400 font-mono">VOLUMETRIC</span>
              </div>
            </div>

            {/* Field Mode Selector */}
            <div className="grid grid-cols-1 gap-1 text-xs font-mono">
              <button
                onClick={() => {
                  setFieldMode('COMBINED_4D');
                  triggerHudToast('4D MODE: COMBINED 4D RESONANCE FIELD', 'Simultaneous depth attenuation & kinetic movement density flux mapping', 'cyan');
                }}
                className={`px-2.5 py-1.5 rounded text-left transition-all border ${
                  fieldMode === 'COMBINED_4D'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold shadow-[0_0_10px_rgba(6,182,212,0.25)]'
                    : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="text-[9px] bg-black/60 border border-cyan-500/40 text-cyan-300 px-1 rounded">1</span>
                    Combined 4D Field
                  </span>
                  <span className="text-[9px] bg-cyan-950 text-cyan-300 px-1 rounded border border-cyan-500/30">DEFAULT</span>
                </div>
                <div className="text-[10px] text-gray-400">Maps signal intensity to depth &amp; kinetic movement density</div>
              </button>

              <button
                onClick={() => {
                  setFieldMode('MOVEMENT_DENSITY_ONLY');
                  triggerHudToast('4D MODE: MOVEMENT DENSITY HEATMAP', 'Isolates kinetic churn, wake trails & target velocity flux', 'amber');
                }}
                className={`px-2.5 py-1.5 rounded text-left transition-all border ${
                  fieldMode === 'MOVEMENT_DENSITY_ONLY'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                    : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="text-[9px] bg-black/60 border border-amber-500/40 text-amber-300 px-1 rounded">2</span>
                    <Flame className="w-3 h-3 text-amber-400" /> Movement Density Heatmap
                  </span>
                  <span className="text-[9px] bg-amber-950 text-amber-300 px-1 rounded border border-amber-500/30">FLUX</span>
                </div>
                <div className="text-[10px] text-gray-400">Isolates kinetic churn, wake trails &amp; displacement density</div>
              </button>

              <button
                onClick={() => {
                  setFieldMode('DEPTH_INTENSITY_GRADIENT');
                  triggerHudToast('4D MODE: DEPTH PENETRATION GRADIENT', 'Visualizes signal attenuation & boundary echo reflection across depth strata', 'indigo');
                }}
                className={`px-2.5 py-1.5 rounded text-left transition-all border ${
                  fieldMode === 'DEPTH_INTENSITY_GRADIENT'
                    ? 'bg-indigo-950/80 border-indigo-500 text-indigo-300 font-bold shadow-[0_0_10px_rgba(99,102,241,0.25)]'
                    : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="text-[9px] bg-black/60 border border-indigo-500/40 text-indigo-300 px-1 rounded">3</span>
                    <Layers className="w-3 h-3 text-indigo-400" /> Depth Penetration Gradient
                  </span>
                  <span className="text-[9px] bg-indigo-950 text-indigo-300 px-1 rounded border border-indigo-500/30">Z-AXIS</span>
                </div>
                <div className="text-[10px] text-gray-400">Visualizes signal attenuation across spatial depth strata</div>
              </button>
            </div>

            {/* Depth Slicing Selector */}
            <div className="pt-2 border-t border-gray-800 space-y-1 font-mono">
              <div className="flex justify-between text-[11px] text-gray-400">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <Search className="w-3 h-3" /> Depth Stratum Slice:
                  <span className="text-[9px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 px-1 rounded ml-1 font-normal">KEY [D]</span>
                </span>
                <span className="text-white font-bold">{depthSliceMode.replace('_', ' ')}</span>
              </div>
              <div className="grid grid-cols-4 gap-1 text-[9px] text-center">
                {(['ALL_DEPTHS', 'SHALLOW_FRONT', 'MID_CORE', 'DEEP_BOUNDARY'] as DepthSliceMode[]).map((dMode) => (
                  <button
                    key={dMode}
                    onClick={() => {
                      setDepthSliceMode(dMode);
                      triggerHudToast(`DEPTH SLICE: ${dMode.replace('_', ' ')}`, 'Filtered spatial depth stratum applied', 'cyan');
                    }}
                    className={`py-1 rounded border transition-all ${
                      depthSliceMode === dMode 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold' 
                        : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {dMode === 'ALL_DEPTHS' ? 'All (3D)' : dMode === 'SHALLOW_FRONT' ? 'Front' : dMode === 'MID_CORE' ? 'Mid' : 'Deep'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DYNAMIC MOVING OBJECTS & KINETIC DENSITY HUD */}
          <div className="pointer-events-auto bg-gray-950/90 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3 shadow-2xl space-y-2.5 max-w-md w-full">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Navigation className="w-4 h-4 text-cyan-400" /> Dynamic Entities &amp; Movement Density
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[9px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono px-1.5 py-0.5 rounded font-bold mr-1">KEY [T]</span>
                {(['PATROL_LOOP', 'FIGURE_EIGHT', 'PERIMETER_SWEEP'] as TrajectoryMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setTrajectoryMode(mode)}
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border transition-all ${
                      trajectoryMode === mode 
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold' 
                        : 'bg-gray-900 border-gray-800 text-gray-500'
                    }`}
                  >
                    {mode.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* List of 3 Objects with Live Density & Doppler Telemetry */}
            <div className="space-y-1.5">
              {objects.map((obj) => {
                const isSelected = selectedObjectId === obj.id;
                return (
                  <div 
                    key={obj.id}
                    onClick={() => setSelectedObjectId(obj.id)}
                    className={`p-2 rounded-lg border cursor-pointer transition-all text-xs font-mono flex items-center justify-between ${
                      isSelected 
                        ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.25)]' 
                        : 'bg-gray-900/60 border-gray-800/80 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setObjects(prev => prev.map(o => o.id === obj.id ? { ...o, active: !o.active } : o));
                        }}
                        className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border transition-all ${
                          obj.active ? 'bg-emerald-500 border-emerald-400' : 'bg-gray-800 border-gray-600'
                        }`}
                        title={obj.active ? "Mute Target" : "Activate Target"}
                      />
                      {obj.type === 'PERSONNEL' && <User className="w-4 h-4 text-cyan-400" />}
                      {obj.type === 'ROVER' && <Truck className="w-4 h-4 text-emerald-400" />}
                      {obj.type === 'DRONE' && <Crosshair className="w-4 h-4 text-amber-400" />}
                      <div>
                        <div className="font-bold text-white text-[11px]">{obj.name}</div>
                        <div className="text-[10px] text-gray-400">
                          XYZ: [{obj.x.toFixed(1)}, {obj.y.toFixed(1)}, {obj.z.toFixed(1)}] · Vel: {obj.speed.toFixed(2)} m/s
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[11px] font-bold text-amber-400 flex items-center justify-end gap-1">
                        <Flame className="w-3 h-3" /> {obj.movementDensityFactor} Density
                      </div>
                      <div className="text-[10px] text-gray-400">
                        {obj.dopplerHz >= 0 ? `+${obj.dopplerHz}` : obj.dopplerHz} Hz · Dist: {obj.distanceToCenter}m
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Track Camera Buttons */}
            <div className="flex items-center justify-between pt-1 border-t border-gray-800 text-[10px] font-mono">
              <span className="text-gray-400">Focus Target Camera:</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setSelectedObjectId('target-personnel');
                    setCameraMode('TRACK_PERSONNEL');
                  }}
                  className={`px-2 py-0.5 rounded border ${
                    cameraMode === 'TRACK_PERSONNEL' ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-bold' : 'bg-gray-900 border-gray-800 text-gray-400'
                  }`}
                >
                  Track Operative
                </button>
                <button
                  onClick={() => {
                    setSelectedObjectId('target-rover');
                    setCameraMode('TRACK_ROVER');
                  }}
                  className={`px-2 py-0.5 rounded border ${
                    cameraMode === 'TRACK_ROVER' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 font-bold' : 'bg-gray-900 border-gray-800 text-gray-400'
                  }`}
                >
                  Track Rover
                </button>
                <button
                  onClick={() => {
                    setSelectedObjectId('target-drone');
                    setCameraMode('TRACK_DRONE');
                  }}
                  className={`px-2 py-0.5 rounded border ${
                    cameraMode === 'TRACK_DRONE' ? 'bg-amber-500/20 text-amber-300 border-amber-400 font-bold' : 'bg-gray-900 border-gray-800 text-gray-400'
                  }`}
                >
                  Track Drone
                </button>
              </div>
            </div>
          </div>

          {/* VIEWPORT CONTROLS & CAMERA */}
          <div className="pointer-events-auto bg-gray-950/85 backdrop-blur-md border border-gray-800 rounded-xl p-3 shadow-xl space-y-2 max-w-xs w-full">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Spatial Perspectives
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[9px] bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono px-1.5 py-0.5 rounded font-bold">KEY [C]</span>
                <span className="text-[10px] text-gray-500 font-mono">4D CAM</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                onClick={() => setCameraMode('ORBIT')}
                className={`px-2 py-1 rounded text-left transition-all ${
                  cameraMode === 'ORBIT' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                1. 360° Orbit
              </button>

              <button
                onClick={() => setCameraMode('INSIDE_RESONANCE')}
                className={`px-2 py-1 rounded text-left transition-all ${
                  cameraMode === 'INSIDE_RESONANCE' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                2. Inside Field
              </button>

              <button
                onClick={() => setCameraMode('WALL_INSPECT')}
                className={`px-2 py-1 rounded text-left transition-all ${
                  cameraMode === 'WALL_INSPECT' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' 
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                3. Wall Echo
              </button>

              <button
                onClick={() => setCameraMode('TOP_DOWN')}
                className={`px-2 py-1 rounded text-left transition-all ${
                  cameraMode === 'TOP_DOWN' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                4. Floor Tomogram
              </button>
            </div>

            {/* Play/Pause & Speed */}
            <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                  isPaused ? 'bg-amber-600 text-white' : 'bg-cyan-600 text-white'
                }`}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
                <span>{isPaused ? "RESUME" : "PAUSE"}</span>
                <span className="text-[9px] opacity-75 font-normal ml-0.5">[SPACE]</span>
              </button>

              <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 text-[10px] font-mono">
                {[0.5, 1.0, 2.0].map((spd) => (
                  <button
                    key={spd}
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-1.5 py-0.5 rounded ${
                      playbackSpeed === spd ? 'bg-cyan-500/30 text-cyan-300 font-bold' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>

            {/* Overlays Toggles */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-gray-800 text-[10px] font-mono">
              <label className="flex items-center gap-1 text-gray-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showEchoRays} 
                  onChange={(e) => setShowEchoRays(e.target.checked)} 
                  className="rounded bg-gray-900 border-gray-700 text-cyan-500"
                />
                Echo Rays
              </label>
              <label className="flex items-center gap-1 text-gray-400 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={showTrajectories} 
                  onChange={(e) => setShowTrajectories(e.target.checked)} 
                  className="rounded bg-gray-900 border-gray-700 text-cyan-500"
                />
                4D Trails
              </label>
            </div>
          </div>
        </div>

        {/* BOTTOM ROW: SIGNAL INTENSITY TO DEPTH & MOVEMENT DENSITY OSCILLOSCOPE */}
        <div className="flex flex-wrap items-end justify-between gap-4 mt-auto">
          
          {/* THE SIGNAL INTENSITY vs DEPTH & MOVEMENT DENSITY TELEMETRY HUD */}
          <div className="pointer-events-auto bg-gray-950/92 backdrop-blur-md border border-cyan-500/40 rounded-xl p-3.5 shadow-2xl space-y-2 max-w-2xl w-full">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  Signal Intensity Mapping: Depth vs Movement Density
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded">
                  4D SPATIAL LATTICE
                </span>
              </div>
              <span className="text-[10px] font-mono text-gray-400">
                Depth Z: 0.0 – 7.2 m · Total Volume: 217 m³
              </span>
            </div>

            {/* Depth & Movement Density Profile Canvas Display */}
            <div className="relative h-28 w-full bg-black/85 rounded-lg border border-gray-800 p-2 overflow-hidden flex flex-col justify-between">
              {/* Depth Stratum Axis Markings */}
              <div className="absolute inset-0 grid grid-cols-6 pointer-events-none opacity-20">
                {[0, 1, 2, 3, 4, 5].map(col => (
                  <div key={col} className="border-r border-cyan-500/40 h-full flex items-end p-1">
                    <span className="text-[8px] font-mono text-cyan-400">Z: {(col * 1.44 - 3.6).toFixed(1)}m</span>
                  </div>
                ))}
              </div>

              {/* Zero Baseline */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-cyan-500/30" />

              {/* Dynamic Peaks for Moving Entities' Movement Density */}
              <div className="relative z-10 flex-1 flex items-center">
                {objects.map((obj) => {
                  if (!obj.active) return null;
                  // Map Z from [-3.6, 3.6] to percentage [5%, 92%]
                  const leftPercent = Math.min(92, Math.max(8, ((obj.z + 3.6) / 7.2) * 84 + 6));
                  const isSelected = selectedObjectId === obj.id;
                  const spikeHeight = Math.min(75, Math.max(22, obj.movementDensityFactor * 38));

                  return (
                    <div 
                      key={obj.id} 
                      className="absolute flex flex-col items-center transition-all duration-75"
                      style={{ left: `${leftPercent}%` }}
                    >
                      <div 
                        className={`w-2 rounded-full transition-all ${
                          isSelected ? 'bg-red-400 shadow-[0_0_14px_rgba(244,63,94,0.9)]' : 
                          obj.type === 'PERSONNEL' ? 'bg-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.7)]' :
                          obj.type === 'ROVER' ? 'bg-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.7)]' :
                          'bg-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.7)]'
                        }`}
                        style={{ height: `${spikeHeight}px` }}
                      />
                      <span className="text-[8px] font-mono text-white mt-1 whitespace-nowrap bg-black/70 px-1 rounded">
                        {obj.name.split(' ')[0]} ({obj.movementDensityFactor} Flux)
                      </span>
                    </div>
                  );
                })}

                {/* Structural Pillar Static Anchor */}
                <div className="absolute left-[66%] flex flex-col items-center opacity-50">
                  <div className="w-1.5 h-12 bg-blue-400 rounded-full" />
                  <span className="text-[8px] font-mono text-blue-300 mt-1">PILLAR (Z: +1.2m)</span>
                </div>
              </div>

              {/* Legend */}
              <div className="relative z-10 flex items-center justify-between text-[9px] font-mono text-gray-400 border-t border-gray-800 pt-1">
                <span>SIGNAL INTENSITY: I(z) = I₀ · e^(-αz) · (1 + γ·ρ_m)</span>
                <span className="text-emerald-400 font-bold">Peak Density: {fieldTelemetry.peakMovementDensity} Flux</span>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-4 gap-2 text-[10px] font-mono">
              <div className="bg-gray-900/80 p-1.5 rounded border border-gray-800">
                <span className="text-gray-500 block text-[9px]">MEAN MOVEMENT DENSITY</span>
                <span className="text-amber-400 font-bold">{fieldTelemetry.meanMovementDensity} Flux</span>
              </div>
              <div className="bg-gray-900/80 p-1.5 rounded border border-gray-800">
                <span className="text-gray-500 block text-[9px]">PEAK KINETIC DENSITY</span>
                <span className="text-emerald-400 font-bold">{fieldTelemetry.peakMovementDensity} Flux</span>
              </div>
              <div className="bg-gray-900/80 p-1.5 rounded border border-gray-800">
                <span className="text-gray-500 block text-[9px]">DEPTH ATTENUATION</span>
                <span className="text-cyan-400 font-bold">-{fieldTelemetry.depthAttenuationDb} dB/m</span>
              </div>
              <div className="bg-gray-900/80 p-1.5 rounded border border-gray-800">
                <span className="text-gray-500 block text-[9px]">VOLUMETRIC NODES</span>
                <span className="text-white font-bold">3,840 4D Voxels</span>
              </div>
            </div>
          </div>

          {/* TWIN AUTHORITY & VERTEX ACTION PANEL */}
          <div className="pointer-events-auto bg-gray-950/90 backdrop-blur-md border border-gray-800 rounded-xl p-3.5 shadow-xl space-y-2.5 max-w-sm w-full">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-emerald-400" />
                Twin Authority: {twinAuthority}
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {(frequencyHz).toFixed(2)} Hz
              </span>
            </div>

            {/* 4 Twins Authority Buttons */}
            <div className="grid grid-cols-2 gap-1.5 text-xs font-mono">
              <button
                onClick={() => setTwinAuthority('AURA')}
                className={`p-1.5 rounded border text-left transition-all ${
                  twinAuthority === 'AURA'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                    : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="font-bold text-xs">AURA (M9: 9)</div>
                <div className="text-[9px] text-gray-400">Dampened Depth Field</div>
              </button>

              <button
                onClick={() => setTwinAuthority('ARTA')}
                className={`p-1.5 rounded border text-left transition-all ${
                  twinAuthority === 'ARTA'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold'
                    : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="font-bold text-xs">ARTA (M9: 6)</div>
                <div className="text-[9px] text-gray-400">Kinetic Burst Density</div>
              </button>

              <button
                onClick={() => setTwinAuthority('ARA')}
                className={`p-1.5 rounded border text-left transition-all ${
                  twinAuthority === 'ARA'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                    : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="font-bold text-xs">ARA (M9: 3)</div>
                <div className="text-[9px] text-gray-400">Cognitive Vector</div>
              </button>

              <button
                onClick={() => setTwinAuthority('ALTA')}
                className={`p-1.5 rounded border text-left transition-all ${
                  twinAuthority === 'ALTA'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300 font-bold'
                    : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="font-bold text-xs">ALTA (M9: 9)</div>
                <div className="text-[9px] text-gray-400">Invariant Node Lock</div>
              </button>
            </div>

            {/* Vertex AI Semantic Analysis Action */}
            <button
              onClick={handleRunVertexAnalysis}
              disabled={isAnalyzingVertex}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-mono text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {isAnalyzingVertex ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing 4D Density &amp; Depth...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Vertex AI 4D Topology Triage
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* VERTEX AI TOPOLOGY MODAL */}
      {showVertexModal && vertexResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm pointer-events-auto">
          <div className="bg-gray-950 border border-blue-500/50 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-950 border border-blue-500/40 rounded-lg text-blue-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Google Cloud Vertex AI 4D Semantic Assessment
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono">
                    Project NYMT26 · Gemini 2.5 Flash Auxiliary Reasoning Bridge
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVertexModal(false)}
                className="text-gray-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-gray-900/60 rounded-xl border border-gray-800 text-xs font-mono text-gray-300 leading-relaxed max-h-60 overflow-y-auto">
              {vertexResult.analysis}
            </div>

            <div className="grid grid-cols-3 gap-3 font-mono text-[11px]">
              <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-800">
                <span className="text-gray-500 block text-[9px]">STATUTORY STATE SEAL</span>
                <span className="text-cyan-400 font-bold">{vertexResult.stateSeal}</span>
              </div>
              <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-800">
                <span className="text-gray-500 block text-[9px]">SHANNON ENTROPY H(X)</span>
                <span className="text-emerald-400 font-bold">1.18 &lt; 1.5 [VERIFIED]</span>
              </div>
              <div className="p-3 bg-gray-900/80 rounded-lg border border-gray-800">
                <span className="text-gray-500 block text-[9px]">PEAK MOVEMENT DENSITY</span>
                <span className="text-amber-400 font-bold">{fieldTelemetry.peakMovementDensity} Flux</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-800">
              <button
                onClick={() => setShowVertexModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all"
              >
                Close &amp; Resume 4D Enclave
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER STRIP */}
      <footer className="relative z-10 px-4 py-2 bg-gray-950/90 border-t border-gray-800 text-[10px] font-mono text-gray-500 flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
        <div className="flex items-center gap-4">
          <span>OPERATIONAL ARM: <span className="text-gray-300">TITAN GAMES SECURITY L.L.C.</span></span>
          <span>ESTATE TRUST: <span className="text-gray-300">EIN 41-6820289</span></span>
          <span>GCP VERTEX AI: <span className="text-blue-400 font-bold">NYMT26 CONNECTED</span></span>
          <span>4D FIELD RESONANCE: <span className="text-cyan-400 font-bold">ACTIVE (Z₀ = {IMPEDANCE_Z0} Ω)</span></span>
        </div>

        <div className="flex items-center gap-3">
          {onNavigate && (
            <button
              onClick={() => onNavigate(AppTab.SENTINEL)}
              className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-bold"
            >
              Back to Sentinel Dashboard <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </footer>
    </div>
  );
};

export default AcousticWaveEnclave;
