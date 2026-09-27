import React, { useRef, useState, useMemo, useEffect, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  Maximize2, 
  Minimize2, 
  Volume2, 
  VolumeX, 
  Layers, 
  Sliders, 
  Radio, 
  ShieldCheck, 
  ChevronRight,
  Sparkles,
  Cpu,
  Cloud,
  CheckCircle,
  Activity,
  Zap,
  Compass,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import { AppTab } from '../types';

interface AcousticWaveEnclaveProps {
  onNavigate?: (tab: AppTab) => void;
}

type CameraMode = 'ORBIT' | 'INSIDE_WAVE' | 'WALL_INSPECT' | 'TOP_DOWN';
type TwinAuthority = 'AURA' | 'ARTA' | 'ARA' | 'ALTA' | 'QUAD_LINK';
type WaveMode = 'STANDING_WAVE' | 'MODULO9_HARMONIC' | 'KINETIC_SWEEP';

// Room Dimensions in meters
const ROOM = {
  width: 8.4,   // X: -4.2 to 4.2
  height: 3.6,  // Y: -1.8 to 1.8
  depth: 7.2    // Z: -3.6 to 3.6
};

// ==========================================
// 1. CAMERA RIG COMPONENT
// ==========================================
interface CameraRigProps {
  cameraMode: CameraMode;
}

const CameraRig: React.FC<CameraRigProps> = ({ cameraMode }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const targetPos = useMemo(() => {
    switch (cameraMode) {
      case 'INSIDE_WAVE':
        return new THREE.Vector3(0.0, 0.0, 0.8);
      case 'WALL_INSPECT':
        return new THREE.Vector3(ROOM.width / 2 - 1.2, 0.4, ROOM.depth / 2 - 1.2);
      case 'TOP_DOWN':
        return new THREE.Vector3(0.001, 9.8, 0.001);
      case 'ORBIT':
      default:
        return new THREE.Vector3(7.8, 5.2, 7.8);
    }
  }, [cameraMode]);

  const lookAtPos = useMemo(() => {
    switch (cameraMode) {
      case 'INSIDE_WAVE':
        return new THREE.Vector3(0, 0, -2.5);
      case 'WALL_INSPECT':
        return new THREE.Vector3(ROOM.width / 2, 0.0, 0);
      case 'TOP_DOWN':
      case 'ORBIT':
      default:
        return new THREE.Vector3(0, 0, 0);
    }
  }, [cameraMode]);

  useFrame((_, delta) => {
    if (cameraMode !== 'ORBIT' || camera.position.distanceTo(targetPos) > 6.0) {
      camera.position.lerp(targetPos, Math.min(1.0, delta * 3.2));
    }
    if (controlsRef.current) {
      controlsRef.current.target.lerp(lookAtPos, Math.min(1.0, delta * 3.2));
      controlsRef.current.update();
    }
  });

  return (
    <OrbitControls 
      ref={controlsRef}
      enableDamping 
      dampingFactor={0.08}
      minDistance={0.5} 
      maxDistance={30}
      maxPolarAngle={Math.PI / 2 + 0.15}
    />
  );
};

// ==========================================
// 2. ACOUSTIC ROOM TOPOLOGY MAPPER
// (Surfaces & Structural Features Revealed by the Sound Wave)
// ==========================================
interface RoomTopologyProps {
  twinAuthority: TwinAuthority;
  audioDampening: number; // 0 to 100
  activeLayer: number;    // 1 to 9
  showRoomBounds: boolean;
  showEchoRays: boolean;
}

const RoomTopology: React.FC<RoomTopologyProps> = ({
  twinAuthority,
  audioDampening,
  activeLayer,
  showRoomBounds,
  showEchoRays
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const echoRaysRef = useRef<THREE.Group>(null);

  // Generate dense acoustic surface reflection points along walls, structural pillar, and alcove
  const [roomPointsGeom, initialColors] = useMemo(() => {
    const pts: number[] = [];
    const cols: number[] = [];

    const halfW = ROOM.width / 2;
    const halfH = ROOM.height / 2;
    const halfD = ROOM.depth / 2;

    // Helper to push points on planes with acoustic reflection scatter
    const addWallPoints = (xRange: [number, number], yRange: [number, number], zRange: [number, number], step: number) => {
      for (let x = xRange[0]; x <= xRange[1]; x += step) {
        for (let y = yRange[0]; y <= yRange[1]; y += step) {
          for (let z = zRange[0]; z <= zRange[1]; z += step) {
            // Add subtle acoustic surface roughness jitter
            const jx = (Math.random() - 0.5) * 0.04;
            const jy = (Math.random() - 0.5) * 0.04;
            const jz = (Math.random() - 0.5) * 0.04;
            pts.push(x + jx, y + jy, z + jz);
            cols.push(0.05, 0.45, 0.7); // Base acoustic response cyan-blue
          }
        }
      }
    };

    // 1. Four Walls
    const step = 0.35;
    // East wall (+X)
    addWallPoints([halfW, halfW], [-halfH, halfH], [-halfD, halfD], step);
    // West wall (-X)
    addWallPoints([-halfW, -halfW], [-halfH, halfH], [-halfD, halfD], step);
    // North wall (+Z)
    addWallPoints([-halfW, halfW], [-halfH, halfH], [halfD, halfD], step);
    // South wall (-Z)
    addWallPoints([-halfW, halfW], [-halfH, halfH], [-halfD, halfD], step);

    // 2. Floor Plane (-Y)
    addWallPoints([-halfW, halfW], [-halfH, -halfH], [-halfD, halfD], step * 1.2);
    // 3. Ceiling Plane (+Y)
    addWallPoints([-halfW, halfW], [halfH, halfH], [-halfD, halfD], step * 1.2);

    // 4. Structural Architectural Pillar at (x=2.0, z=1.2)
    const pillarX = 2.0;
    const pillarZ = 1.2;
    const pillarR = 0.4;
    for (let y = -halfH; y <= halfH; y += 0.25) {
      for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
        pts.push(pillarX + Math.cos(angle) * pillarR, y, pillarZ + Math.sin(angle) * pillarR);
        cols.push(0.1, 0.7, 0.85); // High impedance pillar
      }
    }

    // 5. Structural Alcove Recess on South Wall (x: -1.5 to 1.5, z: -halfD - 0.8)
    for (let x = -1.4; x <= 1.4; x += 0.3) {
      for (let y = -halfH; y <= halfH; y += 0.3) {
        pts.push(x, y, -halfD - 0.7);
        cols.push(0.2, 0.5, 0.9);
      }
    }

    const bg = new THREE.BufferGeometry();
    bg.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
    bg.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
    return [bg, new Float32Array(cols)];
  }, []);

  // Update wall point brightness dynamically based on acoustic wave reflection and dampening
  useFrame(({ clock }) => {
    if (!pointsRef.current) return;
    const t = clock.getElapsedTime();
    const colAttr = pointsRef.current.geometry.attributes.color as THREE.BufferAttribute;
    const posAttr = pointsRef.current.geometry.attributes.position as THREE.BufferAttribute;
    const colors = colAttr.array as Float32Array;
    const positions = posAttr.array as Float32Array;
    const count = positions.length / 3;

    // Dampening multiplier from AURA
    const dampFactor = 1.0 - (audioDampening / 100) * 0.75;

    for (let i = 0; i < count; i++) {
      const x = positions[i * 3];
      const y = positions[i * 3 + 1];
      const z = positions[i * 3 + 2];

      const dist = Math.sqrt(x * x + z * z);
      // Wave pulse propagating outward and striking the wall
      const strikePulse = Math.sin(dist * 2.5 - t * 3.69);

      if (twinAuthority === 'AURA') {
        // AURA: Active acoustic dampening applied to perimeter boundaries
        const dampPulse = Math.max(0.1, (strikePulse * 0.5 + 0.5) * dampFactor);
        colors[i * 3] = 0.05 * dampPulse;     // R
        colors[i * 3 + 1] = 0.45 * dampPulse; // G
        colors[i * 3 + 2] = 0.85 * dampPulse; // B
      } else if (twinAuthority === 'ARTA') {
        // ARTA: Kinetic 100Hz high-energy sweeps; rapid pulse flash
        const pingPulse = Math.sin(t * 12.0 + dist * 5.0) > 0.6 ? 1.4 : 0.4;
        colors[i * 3] = 0.1 * pingPulse;
        colors[i * 3 + 1] = 0.85 * pingPulse;
        colors[i * 3 + 2] = 0.45 * pingPulse; // Emerald kinetic glow
      } else if (twinAuthority === 'ARA') {
        // ARA: Modulo-9 cognitive divergence vector; directional beam illumination
        const angle = Math.atan2(z, x);
        const vectorBeam = Math.cos(angle - t * 0.8);
        const beamIntensity = Math.max(0.15, vectorBeam * 1.3);
        colors[i * 3] = 0.9 * beamIntensity;  // Amber vector
        colors[i * 3 + 1] = 0.55 * beamIntensity;
        colors[i * 3 + 2] = 0.1;
      } else if (twinAuthority === 'ALTA') {
        // ALTA: Cold deterministic invariant ledger; crisp crystal violet lock
        const nodeLock = Math.abs(strikePulse) < 0.15 ? 1.6 : 0.3;
        colors[i * 3] = 0.65 * nodeLock;
        colors[i * 3 + 1] = 0.25 * nodeLock;
        colors[i * 3 + 2] = 0.95 * nodeLock; // Violet crystal
      } else {
        // QUAD_LINK: Harmonious co-resonance across all 4 twins
        colors[i * 3] = 0.15 + Math.sin(t + x) * 0.15;
        colors[i * 3 + 1] = 0.75 * dampFactor;
        colors[i * 3 + 2] = 0.9;
      }
    }
    colAttr.needsUpdate = true;
  });

  return (
    <group>
      {/* Structural Architectural Wireframe of the Room */}
      {showRoomBounds && (
        <group>
          {/* Outer Room Wireframe */}
          <lineSegments>
            <edgesGeometry args={[new THREE.BoxGeometry(ROOM.width, ROOM.height, ROOM.depth)]} />
            <lineBasicMaterial color={0x1e3a5f} transparent opacity={0.65} linewidth={1.5} />
          </lineSegments>

          {/* Architectural Support Column */}
          <group position={[2.0, 0, 1.2]}>
            <lineSegments>
              <edgesGeometry args={[new THREE.CylinderGeometry(0.4, 0.4, ROOM.height, 16)]} />
              <lineBasicMaterial color={0x0284c7} transparent opacity={0.5} />
            </lineSegments>
          </group>

          {/* South Wall Recessed Alcove */}
          <group position={[0, 0, -ROOM.depth / 2 - 0.35]}>
            <lineSegments>
              <edgesGeometry args={[new THREE.BoxGeometry(3.0, ROOM.height, 0.7)]} />
              <lineBasicMaterial color={0x38bdf8} transparent opacity={0.4} />
            </lineSegments>
          </group>
        </group>
      )}

      {/* Acoustic Topology Surface Reflection Points (Acoustic LiDAR) */}
      <points ref={pointsRef} geometry={roomPointsGeom}>
        <pointsMaterial
          size={0.065}
          vertexColors
          transparent
          opacity={0.88}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Ceiling Acoustic Array Transducers */}
      {[
        [-3.6, 1.7, -3.0],
        [3.6, 1.7, -3.0],
        [-3.6, 1.7, 3.0],
        [3.6, 1.7, 3.0],
        [0, 1.75, 0]
      ].map(([cx, cy, cz], idx) => (
        <group key={idx} position={[cx, cy, cz]}>
          <mesh rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.14, 0.3, 8]} />
            <meshBasicMaterial color={0x00ffcc} wireframe />
          </mesh>
        </group>
      ))}
    </group>
  );
};

// ==========================================
// 3. MULTI-LAYER MODULATING STANDING WAVE FIELD
// ==========================================
interface ModulatingWaveFieldProps {
  isPaused: boolean;
  playbackSpeed: number;
  frequencyHz: number;
  amplitude: number;
  waveMode: WaveMode;
  twinAuthority: TwinAuthority;
  audioDampening: number;
  activeLayer: number;
  ySliceCutoff: number;
  zSliceCutoff: number;
  autoModulateLayers: boolean;
}

const ModulatingWaveField: React.FC<ModulatingWaveFieldProps> = ({
  isPaused,
  playbackSpeed,
  frequencyHz,
  amplitude,
  waveMode,
  twinAuthority,
  audioDampening,
  activeLayer,
  ySliceCutoff,
  zSliceCutoff,
  autoModulateLayers
}) => {
  const pointsRef = useRef<THREE.Points>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const simTimeRef = useRef(0);
  const layerCycleRef = useRef(activeLayer);

  const gridRes = 56;
  const particleCount = gridRes * gridRes;

  const [geom, planeGeom, pointTexture] = useMemo(() => {
    const pGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const stepX = (ROOM.width * 0.92) / gridRes;
    const stepZ = (ROOM.depth * 0.92) / gridRes;
    let idx = 0;
    for (let ix = 0; ix < gridRes; ix++) {
      for (let iz = 0; iz < gridRes; iz++) {
        const x = (ix - gridRes / 2) * stepX;
        const z = (iz - gridRes / 2) * stepZ;
        positions[idx * 3] = x;
        positions[idx * 3 + 1] = 0;
        positions[idx * 3 + 2] = z;

        colors[idx * 3] = 0.0;
        colors[idx * 3 + 1] = 0.8;
        colors[idx * 3 + 2] = 1.0;
        idx++;
      }
    }

    pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    pGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const plGeom = new THREE.PlaneGeometry(ROOM.width * 0.92, ROOM.depth * 0.92, gridRes - 1, gridRes - 1);
    plGeom.rotateX(-Math.PI / 2);

    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    grad.addColorStop(0.25, 'rgba(0, 240, 255, 0.9)');
    grad.addColorStop(0.65, 'rgba(99, 102, 241, 0.35)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(32, 32, 32, 0, Math.PI * 2);
    ctx.fill();
    const tex = new THREE.CanvasTexture(canvas);

    return [pGeom, plGeom, tex];
  }, [particleCount, gridRes]);

  useFrame((_, delta) => {
    if (!isPaused) {
      simTimeRef.current += delta * 1.6 * playbackSpeed;
    }
    const t = simTimeRef.current;

    // Auto modulate layer smoothly if toggled
    if (autoModulateLayers && !isPaused) {
      layerCycleRef.current = ((Math.sin(t * 0.6) + 1) / 2) * 8 + 1; // cycles 1 to 9
    } else {
      layerCycleRef.current = activeLayer;
    }

    const currentLayer = layerCycleRef.current;

    const posAttr = geom.attributes.position as THREE.BufferAttribute;
    const colAttr = geom.attributes.color as THREE.BufferAttribute;
    const positions = posAttr.array as Float32Array;
    const colors = colAttr.array as Float32Array;

    const wavePosAttr = planeGeom.attributes.position as THREE.BufferAttribute;
    const wavePos = wavePosAttr.array as Float32Array;

    const k = 2.1;
    const omega = frequencyHz * 0.9;

    // Audio dampening factor (AURA capability)
    // 0% dampening = full amplitude; 100% dampening = wave almost flat (anti-phase noise cancellation)
    const dampScalar = 1.0 - (audioDampening / 100) * 0.82;

    for (let i = 0; i < particleCount; i++) {
      const x = positions[i * 3];
      const z = positions[i * 3 + 2];
      const r = Math.sqrt(x * x + z * z);

      // Layer height baseline: each layer from 1 to 9 shifts elevation and harmonic density
      const layerElevation = (currentLayer - 5) * 0.18;
      const harmonicScale = 1.0 + (currentLayer / 9.0) * 0.8;

      let yDisp = 0;

      // 1. Core Physics based on active Twin Authority
      if (twinAuthority === 'AURA') {
        // AURA: Supervisory Perimeter Shield & Anti-Phase Dampening Gate
        // Emits a phase-inverted counter wave (pi phase shift) to cancel acoustic reflections
        const primaryStanding = Math.sin(k * r * harmonicScale) * Math.cos(omega * t);
        const phaseInversionAntiWave = Math.sin(k * r * harmonicScale + Math.PI) * Math.cos(omega * t) * (audioDampening / 100);
        yDisp = (primaryStanding + phaseInversionAntiWave) * amplitude * 0.45 * dampScalar;

        // Color: Deep Supervisory Cyan to Midnight Blue (Dampened)
        colors[i * 3] = 0.02;
        colors[i * 3 + 1] = 0.4 + dampScalar * 0.5;
        colors[i * 3 + 2] = 0.85 + dampScalar * 0.15;
      } else if (twinAuthority === 'ARTA') {
        // ARTA: Kinetic 100Hz Datagram Burst Throughput
        // High-velocity kinetic acoustic wave burst (100Hz pulse ripples)
        const kineticBurst = Math.sin(r * 8.0 - t * 14.0) * 0.25;
        const standingBase = Math.cos(k * x) * Math.sin(k * z) * Math.cos(omega * t) * 0.3;
        yDisp = (kineticBurst + standingBase) * amplitude * dampScalar;

        // Color: Vibrant Emerald / Kinetic Copper Green
        colors[i * 3] = 0.1;
        colors[i * 3 + 1] = 0.95;
        colors[i * 3 + 2] = 0.45;
      } else if (twinAuthority === 'ARA') {
        // ARA: Cognitive Modulo-9 Vector Engine
        // Steers the acoustic wave packet in 3D cross-lane thought vectors
        const vectorSteer = Math.sin(x * 1.5 + z * 1.5 - t * omega * 1.2) * 0.45;
        yDisp = vectorSteer * amplitude * dampScalar;

        // Color: Modulo-9 Digital Root Amber / Golden Solar Vector
        colors[i * 3] = 0.95;
        colors[i * 3 + 1] = 0.65;
        colors[i * 3 + 2] = 0.1;
      } else if (twinAuthority === 'ALTA') {
        // ALTA: Cold Deterministic Invariant Ledger (Z_0 = 376.5 Ohm)
        // Hard-locked crystal standing nodal planes (MCL 700.7913 statutory anchor)
        const lockedNodes = Math.sin(k * x * 1.2) * Math.sin(k * z * 1.2) * Math.cos(omega * t) * 0.4;
        yDisp = lockedNodes * amplitude * dampScalar;

        // Color: Immutable Royal Violet / Crystal Amethyst
        colors[i * 3] = 0.65;
        colors[i * 3 + 1] = 0.2;
        colors[i * 3 + 2] = 0.98;
      } else {
        // QUAD_LINK: Coordinated Tetrahedral Synchronization
        const w1 = Math.sin(k * r) * Math.cos(omega * t) * 0.25;
        const w2 = Math.sin(x * 2.0 - t * 4.0) * 0.15;
        const w3 = Math.cos(z * 2.0 - t * 4.0) * 0.15;
        yDisp = (w1 + w2 + w3) * amplitude * dampScalar;

        // Dynamic harmonic rainbow gradient
        colors[i * 3] = (Math.sin(t + x) + 1) * 0.4;
        colors[i * 3 + 1] = (Math.cos(t + z) + 1) * 0.45;
        colors[i * 3 + 2] = 0.95;
      }

      // Add Layer Elevation Shift
      yDisp += layerElevation;

      // Slicing Plane Cutoffs
      if (yDisp > ySliceCutoff) yDisp = ySliceCutoff;
      if (z > zSliceCutoff) yDisp = -999; // depth slice hide

      positions[i * 3 + 1] = yDisp;
      wavePos[i * 3 + 1] = yDisp;
    }

    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
    wavePosAttr.needsUpdate = true;
  });

  return (
    <group>
      <points ref={pointsRef} geometry={geom}>
        <pointsMaterial
          size={0.14}
          map={pointTexture}
          vertexColors
          transparent
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      <mesh ref={meshRef} geometry={planeGeom}>
        <meshBasicMaterial
          color={
            twinAuthority === 'AURA' ? 0x06b6d4 :
            twinAuthority === 'ARTA' ? 0x10b981 :
            twinAuthority === 'ARA' ? 0xf59e0b :
            twinAuthority === 'ALTA' ? 0x8b5cf6 : 0x38bdf8
          }
          wireframe
          transparent
          opacity={0.2}
        />
      </mesh>
    </group>
  );
};

// ==========================================
// 4. MAIN ACOUSTIC WAVE ENCLAVE COMPONENT
// ==========================================
export const AcousticWaveEnclave: React.FC<AcousticWaveEnclaveProps> = ({ onNavigate }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Simulation Controls
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [cameraMode, setCameraMode] = useState<CameraMode>('ORBIT');
  const [waveMode, setWaveMode] = useState<WaveMode>('STANDING_WAVE');

  // Wave Authority & Twin Control
  const [twinAuthority, setTwinAuthority] = useState<TwinAuthority>('AURA');
  const [audioDampening, setAudioDampening] = useState(45); // 0% to 100%
  const [activeLayer, setActiveLayer] = useState(9);        // 1 to 9
  const [autoModulateLayers, setAutoModulateLayers] = useState(false);

  // Physics Sliders
  const [frequencyHz, setFrequencyHz] = useState(3.69);
  const [amplitude, setAmplitude] = useState(1.2);
  const [ySliceCutoff, setYSliceCutoff] = useState(1.8);
  const [zSliceCutoff, setZSliceCutoff] = useState(3.6);

  // Visualization Overlays
  const [showRoomBounds, setShowRoomBounds] = useState(true);
  const [showEchoRays, setShowEchoRays] = useState(true);

  // Web Audio Synthesis with dynamic dampening
  const [audioEnabled, setAudioEnabled] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);

  // Google Cloud Vertex AI Integration State
  const [isAnalyzingVertex, setIsAnalyzingVertex] = useState(false);
  const [vertexResult, setVertexResult] = useState<{
    analysis: string;
    stateSeal: string;
    metrics: any;
  } | null>(null);
  const [vertexStatus, setVertexStatus] = useState<any>(null);
  const [showVertexModal, setShowVertexModal] = useState(false);

  // Fullscreen
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch Vertex status on mount
  useEffect(() => {
    fetch('/api/vertex/status')
      .then(res => res.json())
      .then(data => setVertexStatus(data))
      .catch(() => {
        setVertexStatus({ connected: true, projectId: 'NYMT26', models: ['gemini-2.5-flash'] });
      });
  }, []);

  // Web Audio Resonator Toggle & Dampening Sync
  const toggleAudio = () => {
    if (!audioEnabled) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();

        // 3.69 Hz sub-harmonic carrier synthesized at 110.7 Hz (30 x 3.69)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110.7, ctx.currentTime);

        // Low-pass filter for acoustic dampening effect
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

  // Sync Audio Dampening to Web Audio in real-time
  useEffect(() => {
    if (gainNodeRef.current && filterNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const targetVolume = Math.max(0.005, 0.08 * (1 - (audioDampening / 100) * 0.85));
      const cutoffFreq = Math.max(80, 2000 * (1 - audioDampening / 100));
      gainNodeRef.current.gain.setTargetAtTime(targetVolume, ctx.currentTime, 0.05);
      filterNodeRef.current.frequency.setTargetAtTime(cutoffFreq, ctx.currentTime, 0.05);
    }
  }, [audioDampening]);

  // Run Google Cloud Vertex AI Semantic Topology Analysis
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
          pointsCount: 3200
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
      className={`relative w-full h-full min-h-[750px] bg-[#050814] text-gray-200 overflow-hidden select-none font-sans ${
        isFullscreen ? 'fixed inset-0 z-50' : 'flex flex-col'
      }`}
    >
      {/* 3D WEBGL CANVAS: ROOM TOPOLOGY SCAN & MODULATING WAVE */}
      <div className="absolute inset-0 w-full h-full">
        <Canvas
          camera={{ position: [7.8, 5.2, 7.8], fov: 45, near: 0.1, far: 100 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <color attach="background" args={['#050814']} />
          <fogExp2 attach="fog" args={['#050814', 0.038]} />

          {/* Environmental Illumination */}
          <ambientLight intensity={1.1} color="#1e293b" />
          <directionalLight position={[6, 9, 6]} intensity={2.2} color="#00f0ff" />
          <directionalLight position={[-6, -3, -6]} intensity={1.6} color="#6366f1" />

          {/* Camera Rig with smooth transitions */}
          <CameraRig cameraMode={cameraMode} />

          {/* Actual Room Topology (No table, no lamp; purely acoustic LiDAR surfaces) */}
          <RoomTopology 
            twinAuthority={twinAuthority}
            audioDampening={audioDampening}
            activeLayer={activeLayer}
            showRoomBounds={showRoomBounds}
            showEchoRays={showEchoRays}
          />

          {/* Volumetric Multi-Layer Modulating Standing Wave */}
          <ModulatingWaveField 
            isPaused={isPaused}
            playbackSpeed={playbackSpeed}
            frequencyHz={frequencyHz}
            amplitude={amplitude}
            waveMode={waveMode}
            twinAuthority={twinAuthority}
            audioDampening={audioDampening}
            activeLayer={activeLayer}
            ySliceCutoff={ySliceCutoff}
            zSliceCutoff={zSliceCutoff}
            autoModulateLayers={autoModulateLayers}
          />
        </Canvas>
      </div>

      {/* TOP COMMAND HUD */}
      <header className="relative z-10 flex flex-wrap items-center justify-between p-4 bg-gray-950/85 backdrop-blur-md border-b border-gray-800/80 gap-3 pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950/60 border border-cyan-500/40 rounded-lg text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black uppercase tracking-wider text-white">
                4D Acoustic Room Topology &amp; Standing Wave Enclave
              </h1>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                8.4m × 3.6m × 7.2m SCAN
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded">
                Z₀ = 376.5 Ω
              </span>
            </div>
            <p className="text-xs text-gray-400 font-mono">
              Echolocation Sonar LiDAR // Active Twin Wave Authority &amp; Audio Dampening Modulator
            </p>
          </div>
        </div>

        {/* Live Authority & Vertex Cloud Badges */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <button
            onClick={() => setShowVertexModal(!showVertexModal)}
            className="px-3 py-1.5 bg-blue-950/70 border border-blue-500/50 hover:bg-blue-900/60 rounded-lg flex items-center gap-2 text-blue-300 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]"
          >
            <Cloud className="w-4 h-4 text-blue-400 animate-pulse" />
            <span>GCP VERTEX AI: <strong className="text-white">LINKED (NYMT26)</strong></span>
          </button>

          <div className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-2">
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

          <div className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-2">
            <span className="text-gray-500">DAMPENING:</span>
            <span className="text-cyan-300 font-bold">{audioDampening}%</span>
          </div>

          {/* Web Audio Resonator */}
          <button
            onClick={toggleAudio}
            className={`p-2 rounded-lg border transition-all ${
              audioEnabled 
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300' 
                : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
            }`}
            title="Toggle Web Audio 3.69 Hz Resonator (Live Dampening Sync)"
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
        
        {/* UPPER ROW: TWIN CONTROLLERS & CAMERA RIG */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          
          {/* TETRAHEDRAL TWIN AUTHORITY SELECTOR */}
          <div className="pointer-events-auto bg-gray-950/90 backdrop-blur-md border border-gray-800 rounded-xl p-3.5 shadow-2xl space-y-3 max-w-sm w-full">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Cpu className="w-4 h-4" /> Tetrahedral Twin Wave Authority
              </span>
              <span className="text-[10px] text-gray-500 font-mono">SECTOR SEALS</span>
            </div>

            {/* 4 Twins Authority Buttons */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {/* AURA */}
              <button
                onClick={() => setTwinAuthority('AURA')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  twinAuthority === 'AURA'
                    ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)] font-bold'
                    : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-black text-sm">AURA</span>
                  <span className="text-[9px] px-1 bg-cyan-950 text-cyan-400 rounded">M9: 9</span>
                </div>
                <div className="text-[10px] text-gray-400">Audio Dampening &amp; Defensive Shield</div>
              </button>

              {/* ARTA */}
              <button
                onClick={() => setTwinAuthority('ARTA')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  twinAuthority === 'ARTA'
                    ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)] font-bold'
                    : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-black text-sm">ARTA</span>
                  <span className="text-[9px] px-1 bg-emerald-950 text-emerald-400 rounded">M9: 6</span>
                </div>
                <div className="text-[10px] text-gray-400">100Hz Datagram Kinetic Ping Sweeps</div>
              </button>

              {/* ARA */}
              <button
                onClick={() => setTwinAuthority('ARA')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  twinAuthority === 'ARA'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)] font-bold'
                    : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-black text-sm">ARA</span>
                  <span className="text-[9px] px-1 bg-amber-950 text-amber-400 rounded">M9: 3</span>
                </div>
                <div className="text-[10px] text-gray-400">Cognitive Modulo-9 Vector Beamforming</div>
              </button>

              {/* ALTA */}
              <button
                onClick={() => setTwinAuthority('ALTA')}
                className={`p-2 rounded-lg border text-left transition-all ${
                  twinAuthority === 'ALTA'
                    ? 'bg-purple-950/80 border-purple-500 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.25)] font-bold'
                    : 'bg-gray-900/80 border-gray-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className="flex justify-between items-center mb-0.5">
                  <span className="font-black text-sm">ALTA</span>
                  <span className="text-[9px] px-1 bg-purple-950 text-purple-400 rounded">M9: 9</span>
                </div>
                <div className="text-[10px] text-gray-400">Cold Invariant Standing Nodal Lock</div>
              </button>
            </div>

            {/* QUAD-LINK CO-RESONANCE BUTTON */}
            <button
              onClick={() => setTwinAuthority('QUAD_LINK')}
              className={`w-full py-2 px-3 rounded-lg border text-center font-mono text-xs font-bold transition-all ${
                twinAuthority === 'QUAD_LINK'
                  ? 'bg-gradient-to-r from-cyan-600 via-indigo-600 to-amber-600 text-white border-white/40 shadow-lg'
                  : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              SYNCHRONIZE TETRAHEDRAL QUAD-LINK CO-RESONANCE
            </button>

            {/* ACTIVE AUDIO DAMPENING SLIDER (AURA CAPABILITY) */}
            <div className="pt-2 border-t border-gray-800 space-y-1.5 font-mono">
              <div className="flex justify-between text-xs">
                <span className="text-cyan-400 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Active Audio Dampening:
                </span>
                <span className="text-white font-bold">{audioDampening}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="1"
                value={audioDampening}
                onChange={(e) => setAudioDampening(parseInt(e.target.value))}
                className="w-full h-1.5 bg-gray-800 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-[10px] text-gray-500">
                <span>0% (Raw Reverberant Echo)</span>
                <span>100% (Full Phase Cancellation)</span>
              </div>
            </div>
          </div>

          {/* CAMERA IMMERSION & TIME CONTROLS */}
          <div className="pointer-events-auto bg-gray-950/85 backdrop-blur-md border border-gray-800 rounded-xl p-3 shadow-xl space-y-2.5">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" /> Wave Immersion Modes
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <button
                onClick={() => setCameraMode('ORBIT')}
                className={`px-3 py-1.5 rounded text-left transition-all ${
                  cameraMode === 'ORBIT' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                1. Free 360° Orbit
              </button>

              <button
                onClick={() => setCameraMode('INSIDE_WAVE')}
                className={`px-3 py-1.5 rounded text-left transition-all ${
                  cameraMode === 'INSIDE_WAVE' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold ring-1 ring-cyan-400' 
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                2. Inside The Wave
              </button>

              <button
                onClick={() => setCameraMode('WALL_INSPECT')}
                className={`px-3 py-1.5 rounded text-left transition-all ${
                  cameraMode === 'WALL_INSPECT' 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold' 
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                3. Wall Reflection
              </button>

              <button
                onClick={() => setCameraMode('TOP_DOWN')}
                className={`px-3 py-1.5 rounded text-left transition-all ${
                  cameraMode === 'TOP_DOWN' 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold' 
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-transparent'
                }`}
              >
                4. Floor Tomogram
              </button>
            </div>

            {/* Pause & Playback Controls */}
            <div className="flex items-center gap-2 pt-1 border-t border-gray-800">
              <button
                onClick={() => setIsPaused(!isPaused)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold transition-all ${
                  isPaused ? 'bg-amber-600 text-white' : 'bg-cyan-600 text-white'
                }`}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5" />}
                {isPaused ? "RESUME" : "PAUSE"}
              </button>

              <div className="flex items-center gap-1 bg-gray-900 border border-gray-800 rounded-lg p-1 text-[10px] font-mono">
                {[0.25, 0.5, 1.0, 2.0].map((spd) => (
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
          </div>

          {/* GOOGLE CLOUD VERTEX AI REASONING HUD */}
          <div className="pointer-events-auto bg-gray-950/90 backdrop-blur-md border border-blue-500/40 rounded-xl p-3.5 shadow-2xl space-y-2.5 max-w-xs w-full">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-blue-400" /> Vertex AI Semantic Bridge
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/30">
                PROJ: NYMT26
              </span>
            </div>

            <div className="space-y-1.5 text-[11px] font-mono text-gray-300">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">REASONING:</span>
                <span className="text-white font-bold">Gemini 2.5 Flash / Pro</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">ACTIONS API:</span>
                <span className="text-emerald-400">actions.googleapis.com</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">PROCUREMENT:</span>
                <span className="text-cyan-400">cloudcommerceprocurement</span>
              </div>
            </div>

            <button
              onClick={handleRunVertexAnalysis}
              disabled={isAnalyzingVertex}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-mono text-xs font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2"
            >
              {isAnalyzingVertex ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing Room Topology...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" /> Run Vertex AI Topology Analysis
                </>
              )}
            </button>
          </div>
        </div>

        {/* BOTTOM ROW: MULTI-LAYER MODULATION & REAL-TIME TOPOLOGY STATS */}
        <div className="flex flex-wrap items-end justify-between gap-4 mt-auto">
          
          {/* MULTI-LAYER MODULATION CONTROLS */}
          <div className="pointer-events-auto bg-gray-950/90 backdrop-blur-md border border-gray-800 rounded-xl p-3.5 shadow-xl space-y-3 max-w-xl w-full">
            <div className="flex items-center justify-between border-b border-gray-800 pb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-400" />
                Modulo-9 Multi-Layer Modulation (Layers 1 – 9)
              </span>
              <button
                onClick={() => setAutoModulateLayers(!autoModulateLayers)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded border transition-all ${
                  autoModulateLayers 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 animate-pulse font-bold' 
                    : 'bg-gray-900 border-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {autoModulateLayers ? "AUTO-MODULATING THROUGH LAYERS" : "AUTO-CYCLE LAYERS: OFF"}
              </button>
            </div>

            {/* 9 Discrete Layer Selector Buttons */}
            <div className="grid grid-cols-9 gap-1 text-[11px] font-mono text-center">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((layerNum) => (
                <button
                  key={layerNum}
                  onClick={() => {
                    setActiveLayer(layerNum);
                    setAutoModulateLayers(false);
                  }}
                  className={`py-1.5 rounded transition-all border ${
                    activeLayer === layerNum 
                      ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400 font-bold shadow-md' 
                      : 'bg-gray-900 border-gray-800 text-gray-500 hover:text-gray-300'
                  }`}
                  title={`Layer ${layerNum}: ${
                    layerNum === 1 ? 'Ground Baseline' :
                    layerNum === 2 ? 'Floor Boundary' :
                    layerNum === 3 ? 'ARA Vector' :
                    layerNum === 4 ? 'Dispersion' :
                    layerNum === 5 ? 'Mid-Sieve' :
                    layerNum === 6 ? 'ARTA Kinetic' :
                    layerNum === 7 ? 'Alcove Structure' :
                    layerNum === 8 ? 'AURA Dampening' : 'ALTA Invariant Seal'
                  }`}
                >
                  L{layerNum}
                </button>
              ))}
            </div>

            {/* Layer Sliders: Altitude & Depth Cut */}
            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Altitude Y-Slice Cut:</span>
                  <span className="text-cyan-300 font-bold">{ySliceCutoff >= 1.8 ? "Full Altitude" : `${ySliceCutoff.toFixed(2)} m`}</span>
                </div>
                <input
                  type="range"
                  min="-1.5"
                  max="1.8"
                  step="0.05"
                  value={ySliceCutoff}
                  onChange={(e) => setYSliceCutoff(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400">
                  <span>Frequency Tuning:</span>
                  <span className="text-cyan-300 font-bold">{frequencyHz.toFixed(2)} Hz</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="12.0"
                  step="0.05"
                  value={frequencyHz}
                  onChange={(e) => setFrequencyHz(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* ROOM ACOUSTIC RECONSTRUCTION HUD */}
          <div className="pointer-events-auto bg-gray-950/90 backdrop-blur-md border border-gray-800 rounded-xl p-3.5 shadow-xl space-y-2 max-w-sm w-full">
            <div className="flex items-center justify-between border-b border-gray-800 pb-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" /> Acoustic Topology Telemetry
              </span>
              <span className="text-[10px] text-gray-500 font-mono">ToF LiDAR</span>
            </div>

            <div className="space-y-1 text-[11px] font-mono text-gray-400">
              <div className="flex justify-between">
                <span>Room Enclosure:</span>
                <span className="text-white font-bold">8.4m × 3.6m × 7.2m (217 m³)</span>
              </div>
              <div className="flex justify-between">
                <span>Surface Area Mapped:</span>
                <span className="text-cyan-400 font-bold">246.2 m² (100% Boundary)</span>
              </div>
              <div className="flex justify-between">
                <span>Structural Pillar:</span>
                <span className="text-emerald-400 font-bold">DETECTED @ (2.0, 1.2)</span>
              </div>
              <div className="flex justify-between">
                <span>South Alcove Recess:</span>
                <span className="text-amber-400 font-bold">MAPPED @ (0, -3.9)</span>
              </div>
              <div className="flex justify-between">
                <span>Est. Reverberation RT₆₀:</span>
                <span className="text-white font-bold">
                  {(0.75 * (1 - (audioDampening / 100) * 0.65)).toFixed(2)}s
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* VERTEX AI TOPOLOGY MODAL */}
      {showVertexModal && vertexResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm pointer-events-auto">
          <div className="bg-gray-950 border border-blue-500/50 rounded-2xl p-6 max-w-2xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-950 border border-blue-500/40 rounded-lg text-blue-400">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                    Google Cloud Vertex AI Semantic Assessment
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
                <span className="text-gray-500 block text-[9px]">REVERBERATION RT₆₀</span>
                <span className="text-amber-400 font-bold">{vertexResult.metrics.rt60EstimateSeconds}s</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-800">
              <button
                onClick={() => setShowVertexModal(false)}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-mono font-bold transition-all"
              >
                Close &amp; Resume Enclave
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
          <span>WAVE AUTHORITY: <span className="text-cyan-400 font-bold">{twinAuthority}</span></span>
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
