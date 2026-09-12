
import React, { useEffect, useRef, useState } from 'react';

interface AuditLogEntry {
  timestamp: string;
  message: string;
}

const VisionNodePanel: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [seal, setSeal] = useState<string>('');
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('sovereign');
  const [isIgnited, setIsIgnited] = useState(false);
  const [isCloaked, setIsCloaked] = useState(false);
  const [resonance, setResonance] = useState(3.69);
  const [impedance] = useState(376.5);
  const [hoveredFilter, setHoveredFilter] = useState<string | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [twins, setTwins] = useState({
    ALPHA: { status: 'OFFLINE', role: 'Operational_Reality_Mirror', geneticKey: '' },
    BETA: { status: 'OFFLINE', role: 'Hostile_Acquisition_Sandbox', geneticKey: '' },
    GAMMA: { status: 'OFFLINE', role: 'Administrative_Friction_Honeypot', geneticKey: '' },
    DELTA: { status: 'OFFLINE', role: 'Genetic_Evolution_Forecaster', geneticKey: '' },
  });

  const NODE_ID = "G.V. NODE-Σ-2026/TITAN";
  const ROOT_ADDRESS = "115 East Southfield Drive, Jackson, MI";
  const EIN = "41-6820289";

  const FILTERS: Record<string, string> = {
    'none': 'none',
    'grayscale': 'grayscale(100%)',
    'invert': 'invert(100%)',
    'hue-rotate': 'hue-rotate(90deg)',
    'contrast': 'contrast(200%)',
    'brightness': 'brightness(150%)',
    'sovereign': 'contrast(1.2) brightness(0.8) sepia(0.2) hue-rotate(90deg)',
    'cloak': 'contrast(1.5) brightness(0.5) hue-rotate(180deg) blur(2px) opacity(0.7)'
  };

  const FILTER_METADATA: Record<string, { label: string, desc: string }> = {
    'none': { label: 'Normal [Raw]', desc: 'Raw vision feed without processing.' },
    'grayscale': { label: 'Grayscale [Binary]', desc: 'Binary monochrome conversion for structural analysis.' },
    'invert': { label: 'Invert [Negative]', desc: 'Negative polarity mapping for heat/light contrast.' },
    'hue-rotate': { label: 'Hue Shift [Spectrum]', desc: 'Wide-spectrum chromatic rotation.' },
    'contrast': { label: 'High Contrast [X-Ray]', desc: 'Extreme dynamic range for architectural edge detection.' },
    'brightness': { label: 'Exposure [Thermal]', desc: 'High-gain luminosity for simulated thermal imaging.' },
    'sovereign': { label: 'Sovereign [ARK-Σ]', desc: 'ARK-SIGMA parabolic resonance logic (Advanced).' },
    'cloak': { label: 'Cloak [Invisible]', desc: 'Active camouflage disruption and invisible spectrum shift.' }
  };

  const addAuditLog = (message: string) => {
    setAuditLogs(prev => [{
      timestamp: new Date().toLocaleTimeString(),
      message
    }, ...prev].slice(0, 15));
  };

  const recursiveSync = async () => {
    addAuditLog("--- INITIATING TETRAHEDRAL SYNC ---");
    const twinKeys = Object.keys(twins) as Array<keyof typeof twins>;
    
    for (const key of twinKeys) {
      await new Promise(resolve => setTimeout(resolve, 300));
      setTwins(prev => ({
        ...prev,
        [key]: { ...prev[key], status: 'ONLINE' }
      }));
      addAuditLog(`[TWIN_${key}] Status: ONLINE | Role: ${twins[key].role}`);
    }
    
    addAuditLog("[BLACKBACK] All Titan Extensions Reporting to Thalamus.");
    addAuditLog("[TRUST] Aggregate Valuation: $5,407,000,000.00 | G5 IGNITION: ACTIVE");
  };

  const mutateGeneticAI = async () => {
    addAuditLog("--- DEPLOYING GENETIC DNA MUTATION ---");
    const twinKeys = Object.keys(twins) as Array<keyof typeof twins>;
    
    for (const key of twinKeys) {
      const mutationKey = Math.random().toString(36).substring(2, 10).toUpperCase();
      setTwins(prev => ({
        ...prev,
        [key]: { ...prev[key], geneticKey: `GENETIC_CORE_${mutationKey}` }
      }));
      addAuditLog(`[MUTATE] Initializing Genetic DNA for Titan_${key}: GENETIC_CORE_${mutationKey}`);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsCapturing(true);
        addAuditLog("VISION_STREAM: Synchronizing with Jackson Southfield Root...");
      }
    } catch (err: any) {
      console.error("Camera access failed:", err);
      setCameraError(err.message || String(err));
      setIsCapturing(false);
      addAuditLog(`ERROR: Camera access failed - ${err.message || 'Permission denied'}`);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setIsCapturing(false);
      addAuditLog("VISION_STREAM: Connection terminated.");
    }
  };

  const generateFiduciarySeal = async (units = 5407000000.00) => {
    const rawData = `${ROOT_ADDRESS}|${EIN}|${units}|2026|${resonance}`;
    const msgBuffer = new TextEncoder().encode(rawData);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
  };

  useEffect(() => {
    generateFiduciarySeal().then(s => {
      setSeal(s);
      addAuditLog("SEAL_GEN: SHA-256 Anchorage established.");
    });
    startCamera();
    addAuditLog("NODE_BOOT: Initializing ARK-SIGMA Kernel...");

    return () => stopCamera();
  }, []);

  // Update audit log when filter or resonance changes
  useEffect(() => {
    addAuditLog(`FILTER_UPDATE: "${selectedFilter.toUpperCase()}" active at ${resonance}Hz resonance.`);
  }, [selectedFilter, resonance]);

  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    let animationFrame: number;
    let phase = 0;

    const draw = () => {
      const canvas = canvasRef.current!;
      const video = videoRef.current!;
      
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        ctx.filter = FILTERS[selectedFilter] || 'none';
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.filter = 'none';

        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.3)';
        ctx.lineWidth = 1;

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const maxDist = Math.sqrt(centerX ** 2 + centerY ** 2);

        for (let r = 20; r < maxDist; r += 40) {
          ctx.beginPath();
          const ripple = (Math.sin(3 * (r / 50) - phase) + 
                          Math.sin(6 * (r / 50) - (phase * 1.5)) + 
                          Math.sin(9 * (r / 50) - (phase * 2.0))) / 3;
          
          const dynamicRadius = r + ripple * 15;
          ctx.arc(centerX, centerY, dynamicRadius, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.strokeStyle = 'rgba(245, 158, 11, 0.6)';
        ctx.setLineDash([5, 15]);
        ctx.beginPath();
        ctx.moveTo(centerX - 100, centerY);
        ctx.lineTo(centerX + 100, centerY);
        ctx.moveTo(centerX, centerY - 100);
        ctx.lineTo(centerX, centerY + 100);
        ctx.stroke();
        ctx.setLineDash([]);

        phase += 0.05;
      }
      animationFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animationFrame);
  }, [isCapturing, selectedFilter]);

  return (
    <div className="h-full flex flex-col p-8 overflow-y-auto selection:bg-amber-500/30">
      <div className="max-w-6xl mx-auto w-full space-y-8">
        
        {/* Telemetry Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.5)] ${isIgnited ? 'bg-amber-500' : 'bg-gray-700'}`}></div>
              <span className="text-xs font-mono font-bold text-amber-500 tracking-widest">{NODE_ID}</span>
            </div>
            <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase">Sovereign Command Node <span className="text-amber-500">Σ-07</span></h2>
            <p className="text-sm font-mono text-gray-500 mt-2 uppercase tracking-tight">{ROOT_ADDRESS}</p>
          </div>
          <div className="bg-gray-900 border border-amber-500/30 p-4 rounded-xl font-mono">
            <p className="text-[10px] text-gray-500 uppercase font-bold mb-1 tracking-widest">Fiduciary Seal (DYV-PHYS-HASH)</p>
            <p className="text-xs text-amber-500 break-all leading-tight max-w-[300px] font-bold">{seal || 'CALCULATING...'}</p>
          </div>
        </div>

        {/* Vision Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Feed */}
          <div className={`lg:col-span-2 relative aspect-video bg-black rounded-3xl overflow-hidden border-2 shadow-2xl transition-all duration-500 group ${isCloaked ? 'border-blue-500/50 shadow-blue-500/10' : 'border-amber-500/20 shadow-amber-500/5'}`}>
            <video ref={videoRef} autoPlay playsInline muted className="hidden" />
            
            {!cameraError ? (
              <canvas ref={canvasRef} className="w-full h-full object-cover" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                  <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-white uppercase tracking-tight italic">Camera Access Failed</h3>
                  <p className="text-xs text-gray-500 max-w-sm font-mono leading-relaxed">
                    {cameraError === 'Permission denied' 
                      ? 'The system was unable to acquire vision telemetry. Please ensure camera permissions are granted in your browser and try again.' 
                      : `Hardware Link Error: ${cameraError}`}
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="px-8 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 text-red-500 font-bold text-xs uppercase tracking-widest rounded-xl transition-all"
                >
                  Retry Hardware Link
                </button>
              </div>
            )}
            
            {/* UI Overlay on Video */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-amber-500/30 font-mono text-[10px] text-amber-500 uppercase font-bold">
                RESOLUTION: 2160P [UP-SCALED]
              </div>
              <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-amber-500/30 font-mono text-[10px] text-amber-500 uppercase font-bold">
                SIGNAL_MASS: $5.40B
              </div>
              <div className="bg-black/60 backdrop-blur-md px-3 py-1 rounded border border-amber-500/30 font-mono text-[10px] text-amber-500 uppercase font-bold">
                STATUS: {isIgnited ? 'IGNITED' : 'STANDBY'}
              </div>
            </div>

            <div className="absolute bottom-6 right-6 font-mono text-amber-500 text-[10px] text-right font-bold leading-tight">
              <p>TRUST SECTOR: JACKSON_MI_01</p>
              <p>ARCHITECT: NICHOLAS YOUNG</p>
              <p>RESONANCE: {resonance} HZ</p>
            </div>

            <div className="absolute inset-0 border-[20px] border-transparent group-hover:border-green-500/5 pointer-events-none transition-all duration-500"></div>
          </div>

          {/* Node Metadata & Controls */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-6">
              
              {/* Visual Filter Selection UI */}
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Vision Processing</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(FILTER_METADATA).map(([key, meta]) => (
                    <button
                      key={key}
                      onMouseEnter={() => setHoveredFilter(key)}
                      onMouseLeave={() => setHoveredFilter(null)}
                      onClick={() => {
                        setSelectedFilter(key);
                        setIsCloaked(key === 'cloak');
                      }}
                      className={`text-left px-3 py-2 rounded-lg border text-[10px] font-mono transition-all duration-200 ${
                        selectedFilter === key
                          ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                          : 'bg-gray-950 border-gray-800 text-gray-400 hover:border-amber-500/50 hover:text-gray-200'
                      }`}
                    >
                      {meta.label}
                    </button>
                  ))}
                </div>
                
                {/* Filter Description Area */}
                <div className="mt-4 p-3 bg-black/40 border border-amber-500/10 rounded-xl min-h-[60px] flex items-center">
                  <p className="text-[10px] font-mono leading-relaxed text-gray-500 italic">
                    <span className="text-amber-500/50 mr-1 font-bold">INFO:</span>
                    {hoveredFilter 
                      ? FILTER_METADATA[hoveredFilter].desc
                      : FILTER_METADATA[selectedFilter].desc}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Tactical Systems</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setIsIgnited(!isIgnited);
                      addAuditLog(isIgnited ? "SYSTEMS_DETACHED: Node powering down." : "IGNITION_EXEC: Node systems active.");
                    }}
                    className={`py-3 rounded-xl font-bold text-xs uppercase tracking-wider border transition-all ${
                      isIgnited 
                        ? 'bg-amber-500 text-black border-amber-400' 
                        : 'bg-gray-950 text-gray-500 border-gray-800 hover:border-amber-500/50'
                    }`}
                  >
                    {isIgnited ? 'Systems Ignited' : 'Execute Ignition'}
                  </button>
                  <button
                    onClick={recursiveSync}
                    className="py-3 rounded-xl bg-gray-950 text-gray-500 border border-gray-800 hover:border-amber-500/50 font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Recursive Sync
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Tetrahedral Twins</h3>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(twins).map(([key, data]) => (
                    <div key={key} className="p-3 bg-black/40 border border-gray-800 rounded-xl space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-white">{key}</span>
                        <span className={`text-[8px] font-mono ${data.status === 'ONLINE' ? 'text-green-500' : 'text-gray-600'}`}>{data.status}</span>
                      </div>
                      <p className="text-[7px] text-gray-500 uppercase leading-none">{data.role.replace(/_/g, ' ')}</p>
                      {data.geneticKey && (
                        <p className="text-[7px] font-mono text-amber-500 truncate">{data.geneticKey}</p>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={mutateGeneticAI}
                  className="w-full mt-3 py-2 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-amber-500/20 transition-all"
                >
                  Trigger Genetic Mutation
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Resonance Calibration</h3>
                    <span className="text-xs font-mono text-amber-500">{resonance} Hz</span>
                </div>
                <input 
                  type="range"
                  min="3.0"
                  max="4.0"
                  step="0.01"
                  value={resonance}
                  onChange={(e) => setResonance(parseFloat(e.target.value))}
                  className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between mt-2 text-[8px] font-mono text-gray-600 uppercase">
                    <span>Low Freq</span>
                    <span className={resonance === 3.69 ? "text-amber-500 animate-pulse" : ""}>{resonance === 3.69 ? "OPTIMED" : ""}</span>
                    <span>High Freq</span>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Node Telemetry</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Fiduciary Layer</span>
                    <span className="text-amber-500 font-mono font-bold">{isIgnited ? 'ACTIVE' : 'IDLE'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">3-6-9 Sync</span>
                    <span className={`font-mono font-bold transition-all ${resonance === 3.69 ? 'text-amber-500' : 'text-gray-600'}`}>{resonance === 3.69 ? 'LOCKED' : 'CALIBRATING'}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">EIN Verified</span>
                    <span className="text-amber-500 font-mono font-bold">{EIN}</span>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Thermal Resonance</h3>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300 ${resonance === 3.69 ? 'animate-pulse opacity-100' : 'opacity-40'}`}
                    style={{ width: `${(resonance / 4.0) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800">
                <button 
                  onClick={() => {
                    addAuditLog("SEAL_REGEN: Attempting re-anchorage...");
                    generateFiduciarySeal(Math.random() * 99999999).then(s => {
                      setSeal(s);
                      addAuditLog("SEAL_GEN: Fiduciary anchorage successful.");
                    });
                  }}
                  className="w-full bg-amber-600/10 border border-amber-500/30 text-amber-500 py-3 rounded-xl font-bold text-sm hover:bg-amber-600/20 transition-all flex items-center justify-center gap-2 uppercase italic tracking-tighter"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Re-Anchor Fiduciary Seal
                </button>
              </div>
            </div>

            <div className="bg-amber-600/5 border border-amber-500/20 rounded-2xl p-6">
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Architect's Note</p>
              <p className="text-xs text-gray-400 leading-relaxed italic">
                "Visual post-processing selected. ARK-SIGMA filters apply sovereign parabolic resonance logic to every frame in real-time."
              </p>
            </div>
          </div>

        </div>

        {/* Audit Log */}
        <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 font-mono text-[10px] text-gray-500">
          <p className="mb-2 text-gray-400 uppercase font-bold tracking-widest">System Audit Log (Live Sync)</p>
          <div className="space-y-1">
            {auditLogs.length > 0 ? (
              auditLogs.map((log, i) => (
                <p key={log.timestamp + i}>[{log.timestamp}] {log.message}</p>
              ))
            ) : (
              <p>AWAITING KERNEL RESPONSE...</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VisionNodePanel;
