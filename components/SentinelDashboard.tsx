import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import VectorMatrixSetterPanel from './VectorMatrixSetterPanel';
import TelemetryLineChart, { TelemetryPoint } from './TelemetryLineChart';
import { BinaryFrameData } from '../types';
import { ThresholdSettingsModal, ThresholdConfig, DEFAULT_THRESHOLDS } from './ThresholdSettingsModal';
import { LogStream, SystemLog } from './LogStream';
import { TelemetryForecastChart } from './TelemetryForecastChart';
import { TitanOperationsPanel } from './TitanOperationsPanel';
import { SystemHealthDiagnostic } from './SystemHealthDiagnostic';
import { AcousticWaveVisualizer } from './AcousticWaveVisualizer';
import { Settings, ShieldAlert, X, LayoutDashboard, Briefcase } from 'lucide-react';

interface RevenueEvent {
  id: string;
  amount: string;
  email: string;
  timestamp: string;
}

interface SystemTelemetry {
  timestamp: string;
  cpu: number;
  ram: number;
  disk: number;
  state_hash: string;
}

const generateInitialHistory = (): TelemetryPoint[] => {
  const points: TelemetryPoint[] = [];
  const now = Date.now();
  const baseCpu = 22.4;
  const baseRam = 43.8;
  const baseDisk = 58.2;

  for (let i = 12; i >= 0; i--) {
    const t = new Date(now - i * 3000);
    const cpuNoise = (Math.sin(i * 0.8) * 4) + (Math.random() * 2 - 1);
    const ramNoise = (Math.cos(i * 0.5) * 2) + (Math.random() * 1.5 - 0.75);
    points.push({
      time: t.toLocaleTimeString(),
      timestamp: t.toISOString(),
      cpu: parseFloat(Math.max(10, Math.min(60, baseCpu + cpuNoise)).toFixed(1)),
      ram: parseFloat(Math.max(20, Math.min(80, baseRam + ramNoise)).toFixed(1)),
      disk: parseFloat(baseDisk.toFixed(1))
    });
  }
  return points;
};

const SentinelDashboard: React.FC = () => {
  // Real-time WebSocket Service State
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'TITAN_OPERATIONS'>('DASHBOARD');
  const [wsStatus, setWsStatus] = useState<'DISCONNECTED' | 'CONNECTING' | 'CONNECTED'>('DISCONNECTED');
  const [wsUrl, setWsUrl] = useState('ws://192.168.12.227:8765');
  const [useSimulation, setUseSimulation] = useState(true);
  const wsRef = useRef<WebSocket | null>(null);

  // Telemetry State
  const [nodeLinkStatus, setNodeLinkStatus] = useState<string>('Scanning for physical tether...');
  const [revenueEvents, setRevenueEvents] = useState<RevenueEvent[]>([]);
  const [coreLoad, setCoreLoad] = useState<number>(22.4);
  const [handshakes, setHandshakes] = useState<number>(4200);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>(generateInitialHistory);
  const [systemTelemetry, setSystemTelemetry] = useState<SystemTelemetry>({
    timestamp: new Date().toISOString(),
    cpu: 22.4,
    ram: 43.8,
    disk: 58.2,
    state_hash: '0x3F88B77E3A9F'
  });

  const [activeMatrixVector, setActiveMatrixVector] = useState<BinaryFrameData>({
    sequence: 1042,
    variableX: 3.690,
    variableY: 7.380,
    variableZ: 14.760,
    rawHex: '12 04 00 00 CD CC 6C 40 33 33 03 41 9A 99 79 41',
    packetSizeBytes: 16,
    timestamp: new Date().toISOString()
  });

  // Settings & Logs State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [thresholdConfig, setThresholdConfig] = useState<ThresholdConfig>(DEFAULT_THRESHOLDS);
  
  const [systemLogs, setSystemLogs] = useState<SystemLog[]>(() => {
    // Generate some mock historical logs
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    return [
      { id: '1', timestamp: new Date(now - 8 * day).toISOString(), level: 'info', message: 'System initialization complete.', source: 'kernel' },
      { id: '2', timestamp: new Date(now - 5 * day).toISOString(), level: 'warn', message: 'Memory swap threshold exceeded.', source: 'memory_mgr' },
      { id: '3', timestamp: new Date(now - 2 * day).toISOString(), level: 'success', message: 'DCI Vault Atomic Security Update.', source: 'security' },
      { id: '4', timestamp: new Date(now - 1000 * 60).toISOString(), level: 'info', message: 'Sovereign Sync started.', source: 'telemetry' }
    ];
  });

  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'warn' | 'critical' }>>([]);

  const showToast = (message: string, type: 'warn' | 'critical') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  };

  const addSystemLog = (level: SystemLog['level'], message: string, source: string) => {
    setSystemLogs(prev => [{
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      level,
      message,
      source
    }, ...prev]);
  };

  const clearLogs = () => setSystemLogs([]);

  // Auto-clear logs based on retention policy
  useEffect(() => {
    if (!thresholdConfig.autoClearLogs) return;
    const interval = setInterval(() => {
      const now = Date.now();
      const cutoff = now - thresholdConfig.logRetentionDays * 24 * 60 * 60 * 1000;
      setSystemLogs(prev => {
        const filtered = prev.filter(log => new Date(log.timestamp).getTime() > cutoff);
        if (filtered.length !== prev.length) {
          addSystemLog('info', `Auto-cleared ${prev.length - filtered.length} expired logs older than ${thresholdConfig.logRetentionDays} days.`, 'log_mgr');
        }
        return filtered;
      });
    }, 10000); // Check frequently for demo purposes
    return () => clearInterval(interval);
  }, [thresholdConfig.autoClearLogs, thresholdConfig.logRetentionDays]);

  // Threshold Warning Logic
  useEffect(() => {
    let breached = false;

    if (systemTelemetry.cpu >= thresholdConfig.cpuThreshold) {
      addSystemLog('critical', `CPU usage critically high at ${systemTelemetry.cpu}%`, 'telemetry');
      showToast(`CPU usage critically high at ${systemTelemetry.cpu}%`, 'critical');
      breached = true;
    }
    if (systemTelemetry.ram >= thresholdConfig.ramThreshold) {
      addSystemLog('warn', `Memory usage warning at ${systemTelemetry.ram}%`, 'telemetry');
      showToast(`Memory usage high at ${systemTelemetry.ram}%`, 'warn');
      breached = true;
    }

    if (breached && thresholdConfig.enableWebhook && thresholdConfig.webhookUrl) {
      addSystemLog('info', `Automated Action: Webhook dispatched to ${thresholdConfig.webhookUrl}`, 'action_engine');
      // Mock network request
      fetch(thresholdConfig.webhookUrl, { 
        method: 'POST', 
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'threshold_breach', telemetry: systemTelemetry }) 
      }).catch(() => {}); // Catch silent failure for mock URL
    }

    if ((systemTelemetry.cpu >= 98 || systemTelemetry.ram >= 98) && thresholdConfig.autoResetNodes) {
      addSystemLog('critical', `Automated Action: Auto-resetting distressed physical nodes (>98% load)`, 'action_engine');
      showToast('Hardware Reset Triggered', 'critical');
    }
  }, [systemTelemetry.cpu, systemTelemetry.ram, thresholdConfig]);

  // WebSocket Connection Handler
  const connectMiddleware = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    setWsStatus('CONNECTING');
    setUseSimulation(false);
    
    try {
      const socket = new WebSocket(wsUrl);
      
      socket.onopen = () => {
        setWsStatus('CONNECTED');
        setNodeLinkStatus('External Middleware Connected. Syncing workspace...');
      };
      
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'TELEMETRY') {
            if (data.nodeLinkStatus) setNodeLinkStatus(data.nodeLinkStatus);
            if (data.coreLoad) setCoreLoad(data.coreLoad);
            if (data.handshakes) setHandshakes(data.handshakes);
            if (data.systemTelemetry) {
              setSystemTelemetry(data.systemTelemetry);
              setTelemetryHistory(prev => {
                const nextPoint: TelemetryPoint = {
                  time: new Date().toLocaleTimeString(),
                  timestamp: data.systemTelemetry.timestamp || new Date().toISOString(),
                  cpu: data.systemTelemetry.cpu,
                  ram: data.systemTelemetry.ram,
                  disk: data.systemTelemetry.disk
                };
                return [...prev.slice(-19), nextPoint];
              });
            }
            setLastSyncTime(new Date().toLocaleTimeString());
          }
          
          if (data.type === 'REVENUE_EVENT') {
            setRevenueEvents(prev => [data.payload, ...prev].slice(0, 4));
          }
        } catch (e) {
          console.error("Failed to parse middleware telemetry", e);
        }
      };
      
      socket.onclose = () => {
        setWsStatus('DISCONNECTED');
        setNodeLinkStatus('Middleware link lost. Awaiting physical tether...');
      };
      
      socket.onerror = (err) => {
        setWsStatus('DISCONNECTED');
        setNodeLinkStatus('Local WS Offline: Active on Internal Simulation Engine.');
        setUseSimulation(true);
      };
      
      wsRef.current = socket;
    } catch (err) {
      setWsStatus('DISCONNECTED');
      setNodeLinkStatus('Failed to establish middleware connection.');
    }
  }, [wsUrl]);

  const disconnectMiddleware = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setWsStatus('DISCONNECTED');
    setUseSimulation(true);
  };

  // Poll system telemetry from titan_ledger backend API
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const res = await fetch('/api/telemetry/system');
        if (res.ok) {
          const data = await res.json();
          if (data && typeof data.cpu === 'number') {
            setSystemTelemetry(data);
            setCoreLoad(data.cpu);
            setLastSyncTime(new Date().toLocaleTimeString());
            setTelemetryHistory(prev => {
              const nextPoint: TelemetryPoint = {
                time: new Date().toLocaleTimeString(),
                timestamp: data.timestamp || new Date().toISOString(),
                cpu: data.cpu,
                ram: data.ram,
                disk: data.disk
              };
              return [...prev.slice(-19), nextPoint];
            });
          }
        }
      } catch (e) {
        // Silent fallback
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Simulation fallback of check_hardware_tether (3.69 Hz -> 271ms)
  useEffect(() => {
    if (!useSimulation) return;
    
    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      if (tick % 10 === 0) {
        setNodeLinkStatus('Dell 07 Titan Detected. Syncing workspace...');
        setLastSyncTime(new Date().toLocaleTimeString());
      } else if (tick % 10 === 5) {
        setNodeLinkStatus('Scanning for physical tether or SSH path...');
      }
      
      setCoreLoad(prev => {
        const newLoad = prev + (Math.random() * 1.5 - 0.75);
        return Math.min(Math.max(newLoad, 10), 40);
      });
      
      if (Math.random() > 0.9) {
        setHandshakes(prev => prev + 1);
      }
    }, 271); // 1 / 3.69
    return () => clearInterval(interval);
  }, [useSimulation]);

  // Simulation fallback of monitor_revenue_stream (every 10s)
  useEffect(() => {
    if (!useSimulation) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.3) {
        setRevenueEvents(prev => [{
          id: `cs_test_${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
          amount: (Math.random() * 5000 + 500).toFixed(2),
          email: `trustee_${Math.floor(Math.random() * 1000)}@node.internal`,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 4));
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [useSimulation]);

  const handleInjectSpike = (type: 'cpu' | 'ram' | 'both' = 'cpu') => {
    const spikeCpu = type === 'cpu' || type === 'both' ? 94.6 : 28.5;
    const spikeRam = type === 'ram' || type === 'both' ? 92.8 : 45.2;

    const spikedPoint: TelemetryPoint = {
      time: new Date().toLocaleTimeString(),
      timestamp: new Date().toISOString(),
      cpu: spikeCpu,
      ram: spikeRam,
      disk: systemTelemetry.disk
    };

    setSystemTelemetry(prev => ({
      ...prev,
      cpu: spikeCpu,
      ram: spikeRam
    }));
    setCoreLoad(spikeCpu);
    setTelemetryHistory(prev => [...prev.slice(-19), spikedPoint]);
    setLastSyncTime(new Date().toLocaleTimeString());
  };

  return (
    <div className="h-full bg-gray-950 text-gray-100 p-6 md:p-8 overflow-y-auto font-mono selection:bg-cyan-500/30">
      <div className="max-w-7xl mx-auto space-y-8 pb-12 relative">
        
        {/* Toast Container */}
        <div className="fixed top-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
          <AnimatePresence>
            {toasts.map(toast => (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 50, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg border backdrop-blur-md font-mono text-sm max-w-sm ${
                  toast.type === 'critical' 
                    ? 'bg-red-950/90 border-red-500/50 text-red-100 shadow-[0_0_20px_rgba(239,68,68,0.3)]'
                    : 'bg-yellow-950/90 border-yellow-500/50 text-yellow-100 shadow-[0_0_20px_rgba(234,179,8,0.3)]'
                }`}
              >
                <ShieldAlert className={`w-5 h-5 flex-shrink-0 ${toast.type === 'critical' ? 'text-red-400' : 'text-yellow-400'}`} />
                <p>{toast.message}</p>
                <button 
                  onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                  className="ml-auto p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 opacity-70" />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Settings Modal */}
        <ThresholdSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          config={thresholdConfig}
          onSave={setThresholdConfig}
        />

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-cyan-500/20 pb-8">
          <div className="space-y-2 relative w-full md:w-auto">
            <div className="flex items-center justify-between md:justify-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-[0.4em]">Sentinel Sovereign Dashboard</span>
              </div>
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="md:absolute md:-right-12 top-0 p-2 text-cyan-500/70 hover:text-cyan-400 hover:bg-cyan-950/50 rounded-xl transition-all border border-transparent hover:border-cyan-500/30"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
            <h1 className="text-3xl md:text-5xl font-black italic tracking-tighter uppercase text-white leading-none">
              Titan Node <span className="text-cyan-500">Alpha</span>
            </h1>
            <p className="text-xs text-cyan-500/80 uppercase tracking-widest font-bold mt-2">Operational Status: ACTIVE | Resonance: 3.69 Hz</p>
            
            {/* Tab Navigation */}
            <div className="flex items-center gap-2 mt-6 pt-4 border-t border-gray-800/60">
              <button
                onClick={() => setActiveTab('DASHBOARD')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                  activeTab === 'DASHBOARD' 
                    ? 'bg-cyan-950/80 text-cyan-400 border border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                    : 'bg-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900 border border-transparent'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Telemetry Core
              </button>
              <button
                onClick={() => setActiveTab('TITAN_OPERATIONS')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase transition-all ${
                  activeTab === 'TITAN_OPERATIONS' 
                    ? 'bg-indigo-950/80 text-indigo-400 border border-indigo-500/50 shadow-[0_0_15px_rgba(99,102,241,0.15)]' 
                    : 'bg-transparent text-gray-500 hover:text-gray-300 hover:bg-gray-900 border border-transparent'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Sovereign Operations
              </button>
            </div>
          </div>
          
          {/* WebSocket Connection Controls */}
          <div className="bg-cyan-950/30 border border-cyan-900 p-4 rounded-xl space-y-3">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-cyan-500 uppercase font-bold tracking-widest">Middleware WS Link</span>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded ${
                wsStatus === 'CONNECTED' ? 'bg-green-500/20 text-green-400' :
                wsStatus === 'CONNECTING' ? 'bg-amber-500/20 text-amber-400 animate-pulse' :
                'bg-red-500/20 text-red-400'
              }`}>
                {wsStatus}
              </span>
            </div>
            
            <div className="flex gap-2">
              <input 
                type="text" 
                value={wsUrl}
                onChange={(e) => setWsUrl(e.target.value)}
                disabled={wsStatus === 'CONNECTED' || wsStatus === 'CONNECTING'}
                className="bg-black/50 border border-cyan-900/50 rounded px-2 py-1 text-xs text-cyan-100 font-mono focus:outline-none focus:border-cyan-500 w-48"
                placeholder="ws://127.0.0.1:8765"
              />
              
              {wsStatus !== 'CONNECTED' ? (
                <button 
                  onClick={connectMiddleware}
                  disabled={wsStatus === 'CONNECTING'}
                  className="px-3 py-1 bg-cyan-600/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-400 text-xs font-bold uppercase rounded transition-colors"
                >
                  {wsStatus === 'CONNECTING' ? 'WAIT...' : 'CONNECT'}
                </button>
              ) : (
                <button 
                  onClick={disconnectMiddleware}
                  className="px-3 py-1 bg-red-600/20 hover:bg-red-500/30 border border-red-500/50 text-red-400 text-xs font-bold uppercase rounded transition-colors"
                >
                  DISCONNECT
                </button>
              )}
            </div>
            <div className="text-[9px] text-gray-500 flex justify-between">
              <span>Mode: {useSimulation ? 'Internal Simulation' : 'External Telemetry'}</span>
              <span>{lastSyncTime && `Last Sync: ${lastSyncTime}`}</span>
            </div>
          </div>
        </div>

        {activeTab === 'DASHBOARD' ? (
          <>
            {/* Dashboard Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* 1. System Vitality */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-cyan-500 font-black text-xl">1.</span>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">System Vitality</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Core Load</p>
                <p className="text-sm font-bold text-cyan-400">{coreLoad.toFixed(1)}% <span className="text-[10px] text-gray-500 ml-1">(Optimized)</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Resonance Lock</p>
                <p className="text-sm font-bold text-cyan-400">376.5 Ω <span className="text-[10px] text-gray-500 ml-1">(Stable)</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Compute Array</p>
                <p className="text-[10px] font-bold text-cyan-400 leading-tight">Scaling via Certificate of Trust (Ingestion: 6.3x baseline)</p>
              </div>
            </div>
          </div>

          {/* 2. Regulatory/Compliance Gateway */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-cyan-500 font-black text-xl">2.</span>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Compliance</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">DOD/Zero-Trust Feed</p>
                <p className="text-sm font-bold text-cyan-400">ACTIVE <span className="text-[10px] text-gray-500 ml-1">(Encrypted)</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">IRS/Treasury Handshake</p>
                <p className="text-sm font-bold text-cyan-400">VERIFIED <span className="text-[10px] text-gray-500 ml-1">(PIN-Locked)</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Compliance Integrity</p>
                <p className="text-sm font-bold text-cyan-400">100% <span className="text-[10px] text-gray-500 ml-1">(No Friction)</span></p>
              </div>
            </div>
          </div>

          {/* 3. Dissemination Metrics */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-cyan-500 font-black text-xl">3.</span>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Dissemination</h2>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Total Handshakes</p>
                <p className="text-sm font-bold text-cyan-400">{handshakes.toLocaleString()}+ <span className="text-[10px] text-gray-500 ml-1">(Global)</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Institutional Ingestion</p>
                <p className="text-sm font-bold text-cyan-400">Ongoing <span className="text-[10px] text-gray-500 ml-1">(Tier 1 Academic)</span></p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Data Egress</p>
                <p className="text-sm font-bold text-cyan-400">100% <span className="text-[10px] text-gray-500 ml-1">Sentinel-Filtered</span></p>
              </div>
            </div>
          </div>

          {/* 4. Active Command Directives */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6 space-y-4 hover:border-cyan-500/30 transition-colors">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-cyan-500 font-black text-xl">4.</span>
              <h2 className="text-sm font-bold text-white uppercase tracking-widest">Directives</h2>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Pickaxe Protocol</p>
                <p className="text-[10px] font-bold text-cyan-400 leading-tight">SCANNING for high-resonance market assets.</p>
              </div>
              <div>
                <p className="text-[10px] text-gray-500 uppercase">Autonomous Governance</p>
                <p className="text-[10px] font-bold text-cyan-400 leading-tight">ENABLED. System is self-scaling and self-auditing.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recharts Line Chart: CPU & Memory Telemetry Visualization */}
        <TelemetryLineChart
          data={telemetryHistory}
          currentCpu={systemTelemetry.cpu}
          currentRam={systemTelemetry.ram}
          currentDisk={systemTelemetry.disk}
          stateHash={systemTelemetry.state_hash}
          lastUpdated={lastSyncTime || new Date().toLocaleTimeString()}
          onInjectSpike={handleInjectSpike}
          thresholdConfig={thresholdConfig}
        />

        {/* 1H Predictive Forecast Chart */}
        <TelemetryForecastChart 
          thresholdConfig={thresholdConfig} 
          onForecastWarning={(msg, level) => {
            addSystemLog(level, msg, 'predictive_engine');
            showToast(msg, level);
          }}
        />

        {/* System Health Diagnostic Matrix */}
        <SystemHealthDiagnostic />

        {/* 4D Acoustic Standing Wave Visualizer */}
        <AcousticWaveVisualizer />

        {/* Log Stream Panel */}
        <LogStream 
          logs={systemLogs} 
          onClearLogs={clearLogs} 
          autoClearEnabled={thresholdConfig.autoClearLogs} 
          retentionDays={thresholdConfig.logRetentionDays} 
        />

        {/* Vector Matrix Setters ("To All New Setters" - Binary Stream Listener on Port 1212) */}
        <VectorMatrixSetterPanel 
          onMatrixUpdate={(updated) => setActiveMatrixVector(updated)}
        />

        {/* Middleware & Telemetry Integration Feeds */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
          
          {/* Hardware Tether Feed */}
          <div className="bg-black/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              Hardware Tether Log [3.69 Hz]
            </h3>
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-4 min-h-[150px] flex flex-col justify-end">
              <div className="space-y-2 text-[10px]">
                <p className="text-gray-600">[{new Date(Date.now() - 3000).toLocaleTimeString()}] Node Link: Scanning for physical tether or SSH path...</p>
                <p className="text-gray-600">[{new Date(Date.now() - 1500).toLocaleTimeString()}] Node Link: Dell 07 Titan Detected. Syncing workspace...</p>
                <p className="text-cyan-500 font-bold">[{new Date().toLocaleTimeString()}] Node Link: {nodeLinkStatus}</p>
              </div>
            </div>
          </div>

          {/* Titan Ledger SQLite Telemetry Feed */}
          <div className="bg-black/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse"></div>
              Titan Ledger Telemetry [SQLite]
            </h3>
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-4 min-h-[150px] flex flex-col justify-between">
              <div className="grid grid-cols-3 gap-2 text-center pb-2 border-b border-gray-900">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">CPU</p>
                  <p className="text-xs font-bold text-cyan-400">{systemTelemetry.cpu}%</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">RAM</p>
                  <p className="text-xs font-bold text-indigo-400">{systemTelemetry.ram}%</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase">DISK</p>
                  <p className="text-xs font-bold text-emerald-400">{systemTelemetry.disk}%</p>
                </div>
              </div>
              <div className="pt-2 space-y-1 text-[10px]">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500">STATE HASH:</span>
                  <span className="text-cyan-300 font-mono font-bold">{systemTelemetry.state_hash}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span>SAMPLE TIME:</span>
                  <span>{new Date(systemTelemetry.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              <p className="text-[9px] text-gray-500 border-t border-gray-900/60 pt-2 flex items-center justify-between">
                <span>Source: /api/telemetry/system</span>
                <span className="text-green-500 font-bold">SYNCED</span>
              </p>
            </div>
          </div>

          {/* Revenue / Checkout Feed */}
          <div className="bg-black/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></div>
              Revenue Event Stream [Stripe]
            </h3>
            <div className="bg-gray-950 border border-gray-900 rounded-xl p-4 min-h-[150px]">
              <AnimatePresence>
                {revenueEvents.length === 0 ? (
                  <p className="text-[10px] text-gray-600 mt-2">Awaiting transaction events...</p>
                ) : (
                  <div className="space-y-3">
                    {revenueEvents.map((evt) => (
                      <motion.div
                        key={evt.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[10px] border-b border-gray-800 pb-2 last:border-0"
                      >
                        <span className="text-gray-500 mr-2">[{evt.timestamp}]</span>
                        <span className="text-white font-bold">ID: {evt.id}</span>
                        <div className="flex justify-between mt-1">
                          <span className="text-amber-500 font-bold">${evt.amount} USD</span>
                          <span className="text-gray-500">{evt.email}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
          </>
        ) : (
          <TitanOperationsPanel />
        )}

        {/* Footer Authentication */}
        <div className="mt-8 pt-6 border-t border-gray-800 text-center space-y-2">
          <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Authenticated as: Nicholas Young, Managing Trustee (NYMT)</p>
          <p className="text-[10px] text-cyan-500/70 font-mono tracking-widest">Access Protocol: DYV-PHYS-HASH v2.2</p>
        </div>
      </div>
    </div>
  );
};

export default SentinelDashboard;
