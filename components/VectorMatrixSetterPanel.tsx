import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { BinaryFrameData, MatrixSetterState } from '../types';

interface VectorMatrixSetterPanelProps {
  onMatrixUpdate?: (data: BinaryFrameData) => void;
}

export const VectorMatrixSetterPanel: React.FC<VectorMatrixSetterPanelProps> = ({ onMatrixUpdate }) => {
  const [setterState, setSetterState] = useState<MatrixSetterState>({
    sequence: 1042,
    x: 3.690,
    y: 7.380,
    z: 14.760,
    streamRateHz: 3.69,
    activePreset: 'Tetrahedral Resonance',
    autoIncrement: true
  });

  const [hexView, setHexView] = useState<string>('');
  const [lastDispatchedTime, setLastDispatchedTime] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [orbitAngle, setOrbitAngle] = useState<number>(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compute 16-byte binary packet hex representation (4B Int32 LE + 3x 4B Float32 LE)
  const computeBinaryBuffer = useCallback((seq: number, vx: number, vy: number, vz: number) => {
    const buffer = new ArrayBuffer(16);
    const view = new DataView(buffer);
    view.setInt32(0, seq, true);      // Int32 LE
    view.setFloat32(4, vx, true);     // Float32 LE
    view.setFloat32(8, vy, true);     // Float32 LE
    view.setFloat32(12, vz, true);    // Float32 LE
    
    const uint8Array = new Uint8Array(buffer);
    const hexArray = Array.from(uint8Array).map(b => b.toString(16).padStart(2, '0').toUpperCase());
    return {
      hex: hexArray.join(' '),
      rawHex: hexArray.join(''),
      bytes: uint8Array
    };
  }, []);

  // Dispatch vector update to server /api/telemetry/setter
  const dispatchSetter = useCallback(async (stateToDispatch: MatrixSetterState) => {
    setIsSyncing(true);
    try {
      const { hex } = computeBinaryBuffer(stateToDispatch.sequence, stateToDispatch.x, stateToDispatch.y, stateToDispatch.z);
      setHexView(hex);

      const res = await fetch('/api/telemetry/setter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sequence: stateToDispatch.sequence,
          x: stateToDispatch.x,
          y: stateToDispatch.y,
          z: stateToDispatch.z,
          streamRateHz: stateToDispatch.streamRateHz,
          status: 'STREAMING'
        })
      });

      if (res.ok) {
        setLastDispatchedTime(new Date().toLocaleTimeString());
        if (onMatrixUpdate) {
          onMatrixUpdate({
            sequence: stateToDispatch.sequence,
            variableX: stateToDispatch.x,
            variableY: stateToDispatch.y,
            variableZ: stateToDispatch.z,
            packetSizeBytes: 16,
            rawHex: hex,
            timestamp: new Date().toISOString()
          });
        }
      }
    } catch (err) {
      console.error('Failed to dispatch setter update:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [computeBinaryBuffer, onMatrixUpdate]);

  // Handle Preset Selection
  const applyPreset = (name: string, x: number, y: number, z: number, hz: number) => {
    const nextState: MatrixSetterState = {
      ...setterState,
      x,
      y,
      z,
      streamRateHz: hz,
      activePreset: name
    };
    setSetterState(nextState);
    dispatchSetter(nextState);
  };

  // Auto-streaming loop based on streamRateHz
  useEffect(() => {
    if (!setterState.autoIncrement) return;
    
    const intervalMs = Math.max(16, Math.floor(1000 / setterState.streamRateHz));
    const timer = setInterval(() => {
      setSetterState(prev => {
        const nextSeq = prev.sequence + 1;
        // Subtle orbital oscillation for dynamic live visualization if orbit is active
        let nextX = prev.x;
        let nextY = prev.y;
        let nextZ = prev.z;

        if (prev.activePreset === 'Hyper-Dimensional Spin') {
          const t = nextSeq * 0.05;
          nextX = parseFloat((Math.sin(t) * 20).toFixed(3));
          nextY = parseFloat((Math.cos(t) * 20).toFixed(3));
          nextZ = parseFloat((Math.sin(t * 0.5) * 15).toFixed(3));
        }

        const updated: MatrixSetterState = {
          ...prev,
          sequence: nextSeq,
          x: nextX,
          y: nextY,
          z: nextZ
        };
        
        const { hex } = computeBinaryBuffer(nextSeq, nextX, nextY, nextZ);
        setHexView(hex);
        return updated;
      });

      setOrbitAngle(prev => (prev + 0.02) % (Math.PI * 2));
    }, intervalMs);

    return () => clearInterval(timer);
  }, [setterState.autoIncrement, setterState.streamRateHz, setterState.activePreset, computeBinaryBuffer]);

  // Initial Hex Calculation on load
  useEffect(() => {
    const { hex } = computeBinaryBuffer(setterState.sequence, setterState.x, setterState.y, setterState.z);
    setHexView(hex);
  }, [computeBinaryBuffer, setterState.sequence, setterState.x, setterState.y, setterState.z]);

  // 3D Matrix Vector Spatial Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrame: number;
    const renderCanvas = () => {
      const width = canvas.width = canvas.offsetWidth;
      const height = canvas.height = canvas.offsetHeight;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Background grid & radial resonance circles
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.12)';
      ctx.lineWidth = 1;
      
      for (let r = 20; r <= 100; r += 25) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Draw 3D Isometric Axes with orbit rotation
      const angle = orbitAngle;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Project 3D vector (X, Y, Z) to 2D
      const scale = 3.2;
      const projX = (setterState.x * cosA - setterState.y * sinA) * scale;
      const projY = ((setterState.x * sinA + setterState.y * cosA) * 0.5 - setterState.z) * scale;

      const targetX = centerX + projX;
      const targetY = centerY + projY;

      // Axis lines
      // X-Axis (Cyan)
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.5)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX + (35 * cosA * scale), centerY + (35 * sinA * 0.5 * scale));
      ctx.stroke();

      // Y-Axis (Indigo)
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.5)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX - (35 * sinA * scale), centerY + (35 * cosA * 0.5 * scale));
      ctx.stroke();

      // Z-Axis (Amber)
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(centerX, centerY - (25 * scale));
      ctx.stroke();

      // Vector ray from origin to projected point
      ctx.strokeStyle = '#06B6D4';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 2]);
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Target node pulse
      const pulse = (Math.sin(Date.now() * 0.005) + 1) * 3 + 4;
      ctx.fillStyle = '#22D3EE';
      ctx.shadowColor = '#06B6D4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(targetX, targetY, pulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Origin dot
      ctx.fillStyle = '#94A3B8';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Matrix vector label
      ctx.fillStyle = '#E0F2FE';
      ctx.font = '9px monospace';
      ctx.fillText(`V(${setterState.x.toFixed(1)}, ${setterState.y.toFixed(1)}, ${setterState.z.toFixed(1)})`, targetX + 8, targetY - 6);

      animFrame = requestAnimationFrame(renderCanvas);
    };

    renderCanvas();
    return () => cancelAnimationFrame(animFrame);
  }, [setterState.x, setterState.y, setterState.z, orbitAngle]);

  return (
    <div className="bg-gray-900/60 border border-cyan-500/30 rounded-2xl p-6 space-y-6">
      
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping"></div>
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em]">Binary Stream Listener [Port 1212]</span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-white uppercase mt-0.5">
            Vector Matrix <span className="text-cyan-400">Setters</span>
          </h2>
          <p className="text-[10px] text-gray-400">
            High-frequency zero-allocation binary pipeline (16-Byte Frames: 4B Int32 LE Seq + 3x 4B Float32 LE)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSetterState(prev => ({ ...prev, autoIncrement: !prev.autoIncrement }))}
            className={`px-3 py-1 text-xs font-bold uppercase rounded border transition-colors ${
              setterState.autoIncrement 
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.3)]' 
                : 'bg-gray-800 border-gray-700 text-gray-400 hover:text-white'
            }`}
          >
            {setterState.autoIncrement ? 'STREAM ACTIVE' : 'STREAM PAUSED'}
          </button>
          
          <button
            onClick={() => dispatchSetter(setterState)}
            disabled={isSyncing}
            className="px-3 py-1 bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-black uppercase rounded shadow transition-colors"
          >
            {isSyncing ? 'SYNCING...' : 'COMMIT SETTER'}
          </button>
        </div>
      </div>

      {/* Preset Setters Grid */}
      <div>
        <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest block mb-2">
          Preset Vector Alignments ("To All New Setters")
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { name: 'Tetrahedral Resonance', x: 3.690, y: 7.380, z: 14.760, hz: 3.69 },
            { name: 'Titan 07 Harmonic Lock', x: 12.000, y: 24.000, z: 48.000, hz: 7.38 },
            { name: 'Hexagram Reactor', x: 6.000, y: 12.000, z: 18.000, hz: 14.76 },
            { name: 'Hyper-Dimensional Spin', x: 20.000, y: 20.000, z: 15.000, hz: 60.0 }
          ].map(preset => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset.name, preset.x, preset.y, preset.z, preset.hz)}
              className={`p-2.5 rounded-xl border text-left transition-all ${
                setterState.activePreset === preset.name
                  ? 'bg-cyan-950/60 border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-gray-950/40 border-gray-800 hover:border-cyan-500/40 text-gray-400'
              }`}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-white uppercase">{preset.name}</span>
                <span className="text-[9px] text-cyan-400 font-mono">{preset.hz} Hz</span>
              </div>
              <p className="text-[9px] font-mono text-gray-400">
                X:{preset.x} Y:{preset.y} Z:{preset.z}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Setter Controls & 3D Vector Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Sliders & Numerical Setters (2 Cols) */}
        <div className="lg:col-span-2 space-y-4 bg-gray-950/50 border border-gray-800 rounded-xl p-5">
          
          {/* Sequence Controller */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-800">
            <div>
              <span className="text-xs font-bold text-gray-300 uppercase">Frame Sequence ID [Int32]</span>
              <p className="text-[10px] text-gray-500 font-mono">Offset: 0x00 | Size: 4 Bytes LE</p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={setterState.sequence}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 0;
                  setSetterState(prev => ({ ...prev, sequence: val }));
                }}
                className="w-24 bg-black/60 border border-cyan-900 rounded px-2 py-1 text-right text-xs font-mono font-bold text-cyan-400 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => setSetterState(prev => ({ ...prev, sequence: prev.sequence + 1 }))}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-[10px] font-mono font-bold rounded text-gray-300"
              >
                +1
              </button>
              <button
                onClick={() => setSetterState(prev => ({ ...prev, sequence: prev.sequence + 10 }))}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-[10px] font-mono font-bold rounded text-gray-300"
              >
                +10
              </button>
              <button
                onClick={() => setSetterState(prev => ({ ...prev, sequence: prev.sequence + 100 }))}
                className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-[10px] font-mono font-bold rounded text-gray-300"
              >
                +100
              </button>
            </div>
          </div>

          {/* Variable X Setter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
                Variable X [Float32 LE]
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-mono">Offset: 0x04</span>
                <input
                  type="number"
                  step="0.001"
                  value={setterState.x}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setSetterState(prev => ({ ...prev, x: val, activePreset: 'Custom' }));
                  }}
                  className="w-20 bg-black/60 border border-cyan-900 rounded px-2 py-0.5 text-right font-mono text-cyan-300 text-xs focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="0.05"
              value={setterState.x}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSetterState(prev => ({ ...prev, x: val, activePreset: 'Custom' }));
              }}
              className="w-full accent-cyan-400 bg-gray-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Variable Y Setter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-indigo-400 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
                Variable Y [Float32 LE]
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-mono">Offset: 0x08</span>
                <input
                  type="number"
                  step="0.001"
                  value={setterState.y}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setSetterState(prev => ({ ...prev, y: val, activePreset: 'Custom' }));
                  }}
                  className="w-20 bg-black/60 border border-indigo-900 rounded px-2 py-0.5 text-right font-mono text-indigo-300 text-xs focus:outline-none focus:border-indigo-400"
                />
              </div>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="0.05"
              value={setterState.y}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSetterState(prev => ({ ...prev, y: val, activePreset: 'Custom' }));
              }}
              className="w-full accent-indigo-400 bg-gray-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Variable Z Setter */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-amber-400 uppercase flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                Variable Z [Float32 LE]
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 font-mono">Offset: 0x0C</span>
                <input
                  type="number"
                  step="0.001"
                  value={setterState.z}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0;
                    setSetterState(prev => ({ ...prev, z: val, activePreset: 'Custom' }));
                  }}
                  className="w-20 bg-black/60 border border-amber-900 rounded px-2 py-0.5 text-right font-mono text-amber-300 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
            <input
              type="range"
              min="-50"
              max="50"
              step="0.05"
              value={setterState.z}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                setSetterState(prev => ({ ...prev, z: val, activePreset: 'Custom' }));
              }}
              className="w-full accent-amber-400 bg-gray-800 h-1.5 rounded-lg cursor-pointer"
            />
          </div>

          {/* Stream Rate Selector */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-800 text-xs">
            <span className="text-gray-400 uppercase font-bold text-[10px]">Sampling Rate (Resonance Target)</span>
            <div className="flex gap-1">
              {[1.0, 3.69, 7.38, 14.76, 60.0].map(rate => (
                <button
                  key={rate}
                  onClick={() => setSetterState(prev => ({ ...prev, streamRateHz: rate }))}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition-colors ${
                    setterState.streamRateHz === rate
                      ? 'bg-cyan-500 text-black'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {rate} Hz
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3D Spatial Vector Radar Canvas (1 Col) */}
        <div className="bg-gray-950/70 border border-gray-800 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">3D Vector Projection</span>
              <span className="text-[9px] font-mono text-cyan-400">ISOMETRIC ORBIT</span>
            </div>
            <div className="relative h-44 w-full bg-black/50 border border-cyan-950 rounded-lg overflow-hidden flex items-center justify-center">
              <canvas ref={canvasRef} className="w-full h-full" />
            </div>
          </div>

          {/* Coordinate Readout */}
          <div className="grid grid-cols-3 gap-1 pt-3 text-center font-mono">
            <div className="bg-black/40 border border-cyan-950 p-1.5 rounded">
              <p className="text-[8px] text-cyan-400 font-bold">X</p>
              <p className="text-[10px] text-white font-bold">{setterState.x.toFixed(3)}</p>
            </div>
            <div className="bg-black/40 border border-indigo-950 p-1.5 rounded">
              <p className="text-[8px] text-indigo-400 font-bold">Y</p>
              <p className="text-[10px] text-white font-bold">{setterState.y.toFixed(3)}</p>
            </div>
            <div className="bg-black/40 border border-amber-950 p-1.5 rounded">
              <p className="text-[8px] text-amber-400 font-bold">Z</p>
              <p className="text-[10px] text-white font-bold">{setterState.z.toFixed(3)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 16-Byte Low-Overhead MemoryPool Binary Frame Output */}
      <div className="bg-black/80 border border-cyan-900/50 rounded-xl p-4 space-y-3 font-mono">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-900 pb-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400"></span>
            <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">
              Low-Overhead MemoryPool Buffer [16 Bytes Fixed]
            </span>
          </div>
          <div className="text-[9px] text-gray-500">
            Listener Port: <span className="text-amber-400 font-bold">1212</span> | Protocol: <span className="text-cyan-400 font-bold">TCP/RAW</span>
          </div>
        </div>

        {/* Byte Stream Representation */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-gray-950 border border-gray-900 p-2 rounded">
            <p className="text-[8px] text-gray-500 uppercase">Bytes 0..3 (Int32 LE)</p>
            <p className="text-cyan-300 font-bold font-mono">Seq: {setterState.sequence}</p>
          </div>
          <div className="bg-gray-950 border border-gray-900 p-2 rounded">
            <p className="text-[8px] text-gray-500 uppercase">Bytes 4..7 (Float32 LE)</p>
            <p className="text-cyan-400 font-bold font-mono">X: {setterState.x.toFixed(3)}</p>
          </div>
          <div className="bg-gray-950 border border-gray-900 p-2 rounded">
            <p className="text-[8px] text-gray-500 uppercase">Bytes 8..11 (Float32 LE)</p>
            <p className="text-indigo-400 font-bold font-mono">Y: {setterState.y.toFixed(3)}</p>
          </div>
          <div className="bg-gray-950 border border-gray-900 p-2 rounded">
            <p className="text-[8px] text-gray-500 uppercase">Bytes 12..15 (Float32 LE)</p>
            <p className="text-amber-400 font-bold font-mono">Z: {setterState.z.toFixed(3)}</p>
          </div>
        </div>

        {/* Raw Hex Stream Output */}
        <div className="bg-gray-950 border border-gray-900 p-3 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <span className="text-[9px] text-gray-500 uppercase block">Raw Byte Stream (Hex):</span>
            <span className="text-xs text-green-400 font-mono tracking-widest select-all">{hexView}</span>
          </div>
          <div className="text-[9px] text-gray-500 text-right">
            <span>Last Sync: {lastDispatchedTime || 'Active Stream'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VectorMatrixSetterPanel;
