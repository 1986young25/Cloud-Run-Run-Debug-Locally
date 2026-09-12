import React, { useState, useEffect } from 'react';
import { Activity, Server, ShieldCheck, Cpu, HardDrive, RefreshCw } from 'lucide-react';

interface DiagnosticNode {
  id: string;
  name: string;
  status: 'ONLINE' | 'SYNCING' | 'OFFLINE' | 'DIAGNOSTIC';
  latency: number;
  integrity: string;
  load: number;
}

const INITIAL_NODES: DiagnosticNode[] = [
  { id: 'TTE-ALPHA', name: 'Tetrahedral Apex', status: 'ONLINE', latency: 12, integrity: '0x8F3A...11B', load: 45 },
  { id: 'TTE-BETA', name: 'Tetrahedral Base-X', status: 'ONLINE', latency: 18, integrity: '0x3C91...99A', load: 62 },
  { id: 'TTE-GAMMA', name: 'Tetrahedral Base-Y', status: 'SYNCING', latency: 45, integrity: '0x7B22...44C', load: 88 },
  { id: 'TTE-DELTA', name: 'Tetrahedral Base-Z', status: 'ONLINE', latency: 15, integrity: '0x1A44...88D', load: 39 },
];

export const SystemHealthDiagnostic: React.FC = () => {
  const [nodes, setNodes] = useState<DiagnosticNode[]>(INITIAL_NODES);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnostics = () => {
    setIsRunning(true);
    
    // Simulate nodes entering diagnostic mode
    setNodes(prev => prev.map(n => ({ ...n, status: 'DIAGNOSTIC' })));

    // Simulate diagnostic completion sequence
    setTimeout(() => {
      setNodes(prev => prev.map((n, i) => i === 0 ? { ...n, status: 'ONLINE', latency: 10, load: 40 } : n));
    }, 1200);

    setTimeout(() => {
      setNodes(prev => prev.map((n, i) => i === 1 ? { ...n, status: 'ONLINE', latency: 14, load: 58 } : n));
    }, 1800);

    setTimeout(() => {
      setNodes(prev => prev.map((n, i) => i === 2 ? { ...n, status: 'ONLINE', latency: 22, load: 72 } : n));
    }, 2500);

    setTimeout(() => {
      setNodes(prev => prev.map((n, i) => i === 3 ? { ...n, status: 'ONLINE', latency: 11, load: 35 } : n));
      setIsRunning(false);
    }, 3100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'text-cyan-400 bg-cyan-950/30 border-cyan-500/50';
      case 'SYNCING': return 'text-yellow-400 bg-yellow-950/30 border-yellow-500/50';
      case 'OFFLINE': return 'text-red-400 bg-red-950/30 border-red-500/50';
      case 'DIAGNOSTIC': return 'text-purple-400 bg-purple-950/30 border-purple-500/50';
      default: return 'text-gray-400 bg-gray-900 border-gray-700';
    }
  };

  return (
    <div className="bg-gray-900/60 border border-cyan-500/30 rounded-2xl p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-950 border border-cyan-500/50 rounded-xl">
            <Activity className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-white font-mono font-bold uppercase tracking-wider">Tetrahedral Twin Emulation</h3>
            <p className="text-xs text-cyan-500/70 font-mono">System Health & Node Diagnostic</p>
          </div>
        </div>
        <button
          onClick={runDiagnostics}
          disabled={isRunning}
          className={`flex items-center gap-2 px-4 py-2 font-mono text-xs font-bold uppercase rounded-lg transition-all ${
            isRunning 
              ? 'bg-gray-800 text-gray-500 border border-gray-700 cursor-not-allowed'
              : 'bg-cyan-950/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-900 hover:text-white'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Running...' : 'Run Diagnostics'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {nodes.map(node => (
          <div key={node.id} className="bg-black/40 border border-gray-800 rounded-xl p-4 font-mono relative overflow-hidden group">
            {/* Background Glow */}
            <div className={`absolute -inset-10 opacity-0 group-hover:opacity-10 transition-opacity blur-2xl ${
              node.status === 'ONLINE' ? 'bg-cyan-500' : node.status === 'DIAGNOSTIC' ? 'bg-purple-500' : 'bg-yellow-500'
            }`} />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <div className="text-xs text-gray-500 mb-1">{node.id}</div>
                <div className="text-sm text-gray-200 font-bold">{node.name}</div>
              </div>
              <Server className="w-4 h-4 text-gray-600" />
            </div>

            <div className="space-y-3 relative z-10">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">State</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border ${getStatusColor(node.status)}`}>
                  {node.status}
                </span>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Latency</span>
                <span className="text-gray-300 font-bold">{node.status === 'DIAGNOSTIC' ? '--' : `${node.latency}ms`}</span>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Load</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1.5 bg-gray-900 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-cyan-500 transition-all duration-500" 
                      style={{ width: node.status === 'DIAGNOSTIC' ? '0%' : `${node.load}%` }} 
                    />
                  </div>
                  <span className="text-gray-300 text-right w-8">{node.status === 'DIAGNOSTIC' ? '--' : `${node.load}%`}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs pt-2 border-t border-gray-800/50">
                <span className="text-gray-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Root
                </span>
                <span className="text-gray-400">{node.integrity}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
