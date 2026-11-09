import React, { useRef, useEffect, useState } from 'react';
import { Mic, Mic2, Radio, Waves, Navigation, User, Crosshair } from 'lucide-react';

interface Particle {
  x: number;
  y: number;
  z: number;
  baseRadius: number;
  phaseOffset: number;
}

export const AcousticWaveVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isTethered, setIsTethered] = useState(false);
  const [showMovingTarget, setShowMovingTarget] = useState(true);
  
  // Simulated microphone positioning
  const [mobileMicPos, setMobileMicPos] = useState({ x: 0, z: 0 });

  // Simulated moving field entity (4D moving target)
  const [fieldTargetPos, setFieldTargetPos] = useState({ x: -80, z: 40, vx: 1.2, vz: 0.8, doppler: 4.8 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const resize = () => {
      if (containerRef.current) {
        width = containerRef.current.clientWidth;
        height = containerRef.current.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    // Initialize 3D particle grid for "Gaussian splatting" resonance field
    const particles: Particle[] = [];
    const gridSize = 28;
    const spacing = 16;
    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
      for (let z = -gridSize / 2; z < gridSize / 2; z++) {
        const dist = Math.sqrt(x * x + z * z);
        if (dist < gridSize / 2) {
          particles.push({
            x: x * spacing,
            y: 0,
            z: z * spacing,
            baseRadius: Math.random() * 1.5 + 1.2,
            phaseOffset: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    let time = 0;

    const drawGaussianSplat = (x: number, y: number, radius: number, alpha: number, color: string) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, Math.max(1, radius));
      
      let r, g, b;
      if (color === 'cyan') { r = 6; g = 182; b = 212; }
      else if (color === 'indigo') { r = 99; g = 102; b = 241; }
      else if (color === 'emerald') { r = 16; g = 185; b = 129; }
      else if (color === 'amber') { r = 245; g = 158; b = 11; }
      else { r = 255; g = 255; b = 255; }

      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      gradient.addColorStop(0.35, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(1, radius), 0, Math.PI * 2);
      ctx.fill();
    };

    const render = () => {
      time += 0.02;
      
      // Persistence trail
      ctx.fillStyle = 'rgba(3, 7, 18, 0.35)';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      
      // Isometric projection angles
      const pitch = Math.PI / 5.5;
      const yaw = time * 0.06;

      const primaryFreq = 3.69;
      
      particles.forEach(p => {
        // 4D SPATIAL RESONANCE FIELD:
        // Signal intensity mapped directly to depth (Z-attenuation) and movement density (kinetic flux)
        // No wave-like vertical displacement: p.y remains 0 or slight elevation stratum
        const distFromCenter = Math.sqrt(p.x * p.x + p.z * p.z);
        
        // Depth attenuation along the Z-axis and radial distance
        const depthFactor = Math.exp(-0.005 * (p.z + 150));
        const baseIntensity = Math.max(0.1, (1.0 - distFromCenter / 280) * depthFactor);
        
        // Movement Density flux around moving target
        let localMovementDensity = 0;
        if (showMovingTarget) {
          const distFromTarget = Math.sqrt(
            Math.pow(p.x - fieldTargetPos.x, 2) + Math.pow(p.z - fieldTargetPos.z, 2)
          );
          // Inverse-square kinetic flux mapping
          localMovementDensity = 150 / (distFromTarget + 25);
        }

        // Secondary tether flux
        let tetherDensity = 0;
        if (isTethered) {
          const distFromMobile = Math.sqrt(
            Math.pow(p.x - mobileMicPos.x, 2) + Math.pow(p.z - mobileMicPos.z, 2)
          );
          tetherDensity = 120 / (distFromMobile + 30);
        }

        // Total signal intensity = Depth base + Movement Density
        const totalIntensity = Math.min(1.0, baseIntensity * 0.5 + localMovementDensity * 0.7 + tetherDensity * 0.4);

        // 3D to 2D Isometric Projection (No vertical wave undulation)
        const rotatedX = p.x * Math.cos(yaw) - p.z * Math.sin(yaw);
        const rotatedZ = p.x * Math.sin(yaw) + p.z * Math.cos(yaw);

        const projectedY = p.y * Math.cos(pitch) - rotatedZ * Math.sin(pitch);
        const depthZ = p.y * Math.sin(pitch) + rotatedZ * Math.cos(pitch);

        const scale = 500 / (500 + depthZ);
        const screenX = centerX + rotatedX * scale;
        const screenY = centerY + projectedY * scale;

        // Splat color and size mapped to movement density and depth intensity
        let splatColor = 'cyan';
        if (localMovementDensity > 0.45) {
          splatColor = 'amber'; // High movement density flare
        } else if (isTethered && tetherDensity > 0.4) {
          splatColor = 'indigo';
        } else if (depthFactor < 0.45) {
          splatColor = 'emerald'; // Deep penetration stratum
        }

        const alpha = Math.min(0.9, Math.max(0.15, totalIntensity)) * scale;
        const splatRadius = p.baseRadius * (3.0 + totalIntensity * 2.5) * scale;

        drawGaussianSplat(screenX, screenY, splatRadius, alpha, splatColor);
      });

      // Draw Center Primary Acoustic Transceiver
      drawGaussianSplat(centerX, centerY + 30, 22, 0.6, 'cyan');
      
      // Draw Tethered Mobile Mic Indicator if Active
      if (isTethered) {
        const mX = mobileMicPos.x * Math.cos(yaw) - mobileMicPos.z * Math.sin(yaw);
        const mZ = mobileMicPos.x * Math.sin(yaw) + mobileMicPos.z * Math.cos(yaw);
        const sX = centerX + mX * (500 / (500 + mZ));
        const sY = centerY + (-mZ * Math.sin(pitch)) * (500 / (500 + mZ));
        drawGaussianSplat(sX, sY, 16, 0.8, 'indigo');

        // Draw tether ray
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.35)';
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 30);
        ctx.lineTo(sX, sY);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Moving Field Entity (Operative / Target) & Echo Ray
      if (showMovingTarget) {
        const tX = fieldTargetPos.x * Math.cos(yaw) - fieldTargetPos.z * Math.sin(yaw);
        const tZ = fieldTargetPos.x * Math.sin(yaw) + fieldTargetPos.z * Math.cos(yaw);
        const targetScreenX = centerX + tX * (500 / (500 + tZ));
        const targetScreenY = centerY + (-tZ * Math.sin(pitch)) * (500 / (500 + tZ));

        // Moving object glow
        drawGaussianSplat(targetScreenX, targetScreenY, 18, 0.9, 'amber');

        // Echo Ray from Center Transducer to Target
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY + 30);
        ctx.lineTo(targetScreenX, targetScreenY);
        ctx.stroke();

        // Target Label
        ctx.fillStyle = '#f59e0b';
        ctx.font = '10px monospace';
        ctx.fillText(`TARGET [${fieldTargetPos.doppler > 0 ? '+' : ''}${fieldTargetPos.doppler}Hz]`, targetScreenX + 10, targetScreenY - 10);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isTethered, mobileMicPos, fieldTargetPos, showMovingTarget]);

  // Handle simulating mobile phone and moving target movement
  useEffect(() => {
    let moveInterval = setInterval(() => {
      const t = Date.now() * 0.001;
      if (isTethered) {
        setMobileMicPos({
          x: Math.sin(t * 0.45) * 140,
          z: Math.cos(t * 0.35) * 90
        });
      }

      if (showMovingTarget) {
        const targetAngle = t * 0.6;
        const targetX = Math.cos(targetAngle) * 110;
        const targetZ = Math.sin(targetAngle) * 85;
        const dist = Math.sqrt(targetX * targetX + targetZ * targetZ);
        const dopplerShift = Math.round((Math.sin(targetAngle) * 8.5) * 10) / 10;

        setFieldTargetPos({
          x: targetX,
          z: targetZ,
          vx: -Math.sin(targetAngle) * 110 * 0.6,
          vz: Math.cos(targetAngle) * 85 * 0.6,
          doppler: dopplerShift
        });
      }
    }, 45);

    return () => clearInterval(moveInterval);
  }, [isTethered, showMovingTarget]);

  return (
    <div className="bg-gray-900/60 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-cyan-500/20 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-950 border border-cyan-500/50 rounded-xl text-cyan-400">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-white font-mono font-bold uppercase tracking-wider">
              Acoustic Standing Wave &amp; Echo Resonance Field
            </h3>
            <p className="text-xs text-cyan-400/80 font-mono">
              4D Echolocation Sonar LiDAR // Real-Time Target Echo Tracking
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 bg-black/60 p-2 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 px-3 py-1">
            <Mic className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400">Master Transceiver</span>
          </div>
          
          <div className="w-px h-6 bg-gray-800" />
          
          <button
            onClick={() => setIsTethered(!isTethered)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-mono text-xs ${
              isTethered 
                ? 'bg-indigo-950/70 text-indigo-400 border border-indigo-500/50' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Mic2 className="w-4 h-4" />
            {isTethered ? 'Tethered Mobile Active' : 'Tether Mobile Node'}
          </button>

          <div className="w-px h-6 bg-gray-800" />

          <button
            onClick={() => setShowMovingTarget(!showMovingTarget)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-mono text-xs ${
              showMovingTarget 
                ? 'bg-amber-950/70 text-amber-400 border border-amber-500/50' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Crosshair className="w-4 h-4" />
            {showMovingTarget ? 'Field Target: TRACKING' : 'Field Target: OFF'}
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full h-[360px] bg-black/85 rounded-xl border border-gray-800 overflow-hidden"
      >
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Overlay HUD */}
        <div className="absolute top-4 left-4 font-mono text-[10px] text-cyan-400/80 space-y-1 bg-black/60 p-2 rounded border border-cyan-500/20 backdrop-blur-sm">
          <div>Z₀ IMPEDANCE: 376.5 Ω</div>
          <div>RESONANCE CADENCE: 3.69 Hz</div>
          <div>MODE: 4D_RESONANCE_ECHO_PICTURE</div>
          <div className="text-emerald-400">WAVE STATUS: TONED DOWN (PHYSICAL FIELD)</div>
        </div>
        
        <div className="absolute bottom-4 right-4 flex flex-col gap-1 items-end">
          {showMovingTarget && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-amber-400 bg-amber-950/50 px-2.5 py-1 rounded border border-amber-500/40">
              <Navigation className="w-3 h-3 animate-pulse" />
              Target Telemetry: [X: {fieldTargetPos.x.toFixed(0)}, Z: {fieldTargetPos.z.toFixed(0)}] · Doppler: {fieldTargetPos.doppler > 0 ? `+${fieldTargetPos.doppler}` : fieldTargetPos.doppler} Hz
            </div>
          )}

          {isTethered && (
            <div className="flex items-center gap-2 text-[10px] font-mono text-indigo-400 bg-indigo-950/40 px-2 py-1 rounded border border-indigo-500/30">
              <Radio className="w-3 h-3 animate-pulse" />
              Tether Telemetry: [X: {mobileMicPos.x.toFixed(1)}, Z: {mobileMicPos.z.toFixed(1)}]
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcousticWaveVisualizer;
