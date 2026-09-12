import React, { useRef, useEffect, useState } from 'react';
import { Mic, Mic2, Radio, Waves } from 'lucide-react';

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
  
  // Simulated microphone positioning
  const [mobileMicPos, setMobileMicPos] = useState({ x: 0, z: 0 });

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

    // Initialize 3D particle grid for "Gaussian splatting" visualization
    const particles: Particle[] = [];
    const gridSize = 25;
    const spacing = 18;
    for (let x = -gridSize / 2; x < gridSize / 2; x++) {
      for (let z = -gridSize / 2; z < gridSize / 2; z++) {
        // Distance from center
        const dist = Math.sqrt(x * x + z * z);
        if (dist < gridSize / 2) {
          particles.push({
            x: x * spacing,
            y: 0,
            z: z * spacing,
            baseRadius: Math.random() * 2 + 1,
            phaseOffset: Math.random() * Math.PI * 2,
          });
        }
      }
    }

    let time = 0;

    const drawGaussianSplat = (x: number, y: number, radius: number, alpha: number, color: string) => {
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
      
      // Parse hex to rgba for gradient
      let r, g, b;
      if (color === 'cyan') { r = 6; g = 182; b = 212; }
      else if (color === 'indigo') { r = 99; g = 102; b = 241; }
      else { r = 255; g = 255; b = 255; }

      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha})`);
      gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${alpha * 0.5})`);
      gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    const render = () => {
      time += 0.02;
      
      // Clear canvas with trail effect for persistence
      ctx.fillStyle = 'rgba(3, 7, 18, 0.3)'; // Dark background matching gray-950
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      
      // Rotation angles for isometric view
      const pitch = Math.PI / 6; // 30 degrees down
      const yaw = time * 0.1; // slow rotation

      // Wave simulation parameters
      const primaryFreq = 3.69;
      
      particles.forEach(p => {
        // 1. Calculate wave interference based on microphone inputs
        const distFromCenter = Math.sqrt(p.x * p.x + p.z * p.z);
        
        // Primary wave (Desktop Mic - Center)
        const primaryWave = Math.sin(distFromCenter * 0.05 - time * primaryFreq) * 20;
        
        // Secondary wave (Tethered Mobile Mic)
        let secondaryWave = 0;
        if (isTethered) {
          const distFromMobile = Math.sqrt(
            Math.pow(p.x - mobileMicPos.x, 2) + Math.pow(p.z - mobileMicPos.z, 2)
          );
          secondaryWave = Math.cos(distFromMobile * 0.08 - time * (primaryFreq * 1.5)) * 15;
        }

        // Add acoustic noise / harmonics
        const harmonic = Math.sin(p.phaseOffset + time) * 5;
        
        // Final Y position based on superposition of waves
        p.y = primaryWave + secondaryWave + harmonic;

        // 2. 3D to 2D Projection (Isometric)
        // Rotate around Y axis (Yaw)
        const rotatedX = p.x * Math.cos(yaw) - p.z * Math.sin(yaw);
        const rotatedZ = p.x * Math.sin(yaw) + p.z * Math.cos(yaw);

        // Rotate around X axis (Pitch)
        const projectedY = p.y * Math.cos(pitch) - rotatedZ * Math.sin(pitch);
        // Depth (Z) after pitch
        const depthZ = p.y * Math.sin(pitch) + rotatedZ * Math.cos(pitch);

        // Perspective scaling (simple)
        const scale = 500 / (500 + depthZ);
        
        const screenX = centerX + rotatedX * scale;
        const screenY = centerY + projectedY * scale;

        // 3. Render Splat
        // Color depends on height (Y) and whether it's dominated by mobile or desktop
        const isMobileDominant = isTethered && Math.abs(secondaryWave) > Math.abs(primaryWave);
        const splatColor = isMobileDominant ? 'indigo' : 'cyan';
        
        // Base alpha and radius on depth and height
        const alpha = Math.min(0.8, Math.max(0.1, (p.y + 40) / 80)) * scale;
        const splatRadius = p.baseRadius * 4 * scale;

        drawGaussianSplat(screenX, screenY, splatRadius, alpha, splatColor);
      });

      // Draw Microphone Indicators
      // Desktop Mic (Center)
      drawGaussianSplat(centerX, centerY + 50, 30, 0.5, 'cyan');
      
      if (isTethered) {
        // Project mobile mic pos
        const mX = mobileMicPos.x * Math.cos(yaw) - mobileMicPos.z * Math.sin(yaw);
        const mZ = mobileMicPos.x * Math.sin(yaw) + mobileMicPos.z * Math.cos(yaw);
        const sX = centerX + mX * (500 / (500 + mZ));
        const sY = centerY + (-mZ * Math.sin(pitch)) * (500 / (500 + mZ));
        drawGaussianSplat(sX, sY, 20, 0.8, 'indigo');
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isTethered, mobileMicPos]);

  // Handle simulating mobile phone movement
  useEffect(() => {
    if (!isTethered) return;
    
    let moveInterval = setInterval(() => {
      const t = Date.now() * 0.001;
      setMobileMicPos({
        x: Math.sin(t * 0.5) * 150,
        z: Math.cos(t * 0.3) * 100
      });
    }, 50);

    return () => clearInterval(moveInterval);
  }, [isTethered]);

  return (
    <div className="bg-gray-900/60 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between border-b border-cyan-500/20 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-950 border border-indigo-500/50 rounded-xl">
            <Waves className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-mono font-bold uppercase tracking-wider">Acoustic Standing Wave Acoustics</h3>
            <p className="text-xs text-indigo-500/70 font-mono">4D Gaussian Splatting Visualizer</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 bg-black/50 p-2 rounded-xl border border-gray-800">
          <div className="flex items-center gap-2 px-3">
            <Mic className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-mono text-cyan-400">Desktop Mic (Primary)</span>
          </div>
          
          <div className="w-px h-6 bg-gray-800" />
          
          <button
            onClick={() => setIsTethered(!isTethered)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-colors font-mono text-xs ${
              isTethered 
                ? 'bg-indigo-950/50 text-indigo-400 border border-indigo-500/50' 
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Mic2 className="w-4 h-4" />
            {isTethered ? 'Tethered Mobile Active' : 'Tether Mobile Mic'}
          </button>
        </div>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full h-[350px] bg-black/80 rounded-xl border border-gray-800 overflow-hidden"
      >
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
        
        {/* Overlay HUD */}
        <div className="absolute top-4 left-4 font-mono text-[10px] text-cyan-500/50 space-y-1">
          <div>Z_0 IMPEDANCE: 376.5 Ω</div>
          <div>RESONANCE: 3.69 Hz</div>
          <div>RENDER: GAUSSIAN_SPLAT_4D</div>
        </div>
        
        <div className="absolute bottom-4 right-4 flex items-center gap-2">
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
