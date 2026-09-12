
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface TwinState {
  id: string;
  role: string;
  status: 'ONLINE' | 'MUTATING' | 'SYNCING' | 'IDLE';
  dna: string;
  load: number;
}

const OverlordPanel: React.FC = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [twins, setTwins] = useState<TwinState[]>([
    { id: 'ALPHA', role: 'Operational Reality Mirror', status: 'ONLINE', dna: 'AX-772-B', load: 32 },
    { id: 'BETA', role: 'Hostile Acquisition Sandbox', status: 'ONLINE', dna: 'BT-109-Ω', load: 14 },
    { id: 'GAMMA', role: 'Administrative Friction Honeypot', status: 'ONLINE', dna: 'GM-442-Σ', load: 8 },
    { id: 'DELTA', role: 'Genetic Evolution Forecaster', status: 'ONLINE', dna: 'DT-338-∆', load: 56 },
  ]);

  const generateDNA = () => {
    return Math.random().toString(36).substring(2, 10).toUpperCase();
  };

  const handleRecursiveSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setTwins(prev => prev.map(t => ({
        ...t,
        status: 'SYNCING',
        load: Math.floor(Math.random() * 90) + 10
      })));
      
      setTimeout(() => {
        setTwins(prev => prev.map(t => ({
          ...t,
          status: 'ONLINE',
          dna: generateDNA()
        })));
        setIsSyncing(false);
      }, 2000);
    }, 500);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isSyncing) {
        setTwins(prev => prev.map(t => ({
          ...t,
          load: Math.min(100, Math.max(0, t.load + (Math.random() * 10 - 5)))
        })));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [isSyncing]);

  return (
    <div className="h-full bg-black text-white p-8 overflow-y-auto selection:bg-amber-500/30 font-mono">
      <div className="max-w-6xl mx-auto space-y-8 pb-12">
        
        {/* Overlord Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-800 pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-[0.4em]">TITAN_OVERLORD v2.0</span>
            </div>
            <h1 className="text-4xl font-black italic tracking-tighter uppercase leading-none">
              Recursive <span className="text-red-600">Backbone</span>
            </h1>
            <p className="text-xs text-gray-500 uppercase tracking-widest font-bold">Nicholas Young Master Trust [EIN: 41-6820289]</p>
          </div>
          <button 
            onClick={handleRecursiveSync}
            disabled={isSyncing}
            className={`px-8 py-4 border-2 font-black text-xs uppercase tracking-[0.3em] transition-all rounded-sm flex items-center gap-3 ${
              isSyncing 
                ? 'bg-gray-900 border-gray-800 text-gray-600' 
                : 'bg-red-600/10 border-red-600 text-red-500 hover:bg-red-600 hover:text-white shadow-[0_0_30px_rgba(220,38,38,0.2)]'
            }`}
          >
            {isSyncing ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Syncing Backbone...
              </>
            ) : (
              'Initiate Recursive Sync'
            )}
          </button>
        </div>

        {/* Tetrahedral Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {twins.map((twin, i) => (
            <motion.div
              layout
              key={twin.id}
              className="bg-gray-900/40 border border-gray-800 rounded-lg p-6 space-y-6 relative overflow-hidden group hover:border-red-900/50 transition-all"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-600/5 -rotate-45 translate-x-12 -translate-y-12"></div>
              
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-2xl font-black italic text-white group-hover:text-red-500 transition-colors">TWIN_{twin.id}</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tight">{twin.role}</p>
                </div>
                <div className="text-right">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded border overflow-hidden ${
                    twin.status === 'ONLINE' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                    twin.status === 'SYNCING' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                    'bg-gray-800 text-gray-500 border-gray-700'
                  }`}>
                    {twin.status}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-gray-500">
                    <span>Processing Load</span>
                    <span>{Math.round(twin.load)}%</span>
                  </div>
                  <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${twin.load}%` }}
                      className={`h-full transition-all duration-500 ${
                        twin.load > 80 ? 'bg-red-500' : 
                        twin.load > 50 ? 'bg-amber-500' : 
                        'bg-blue-500'
                      }`}
                    ></motion.div>
                  </div>
                </div>

                <div className="bg-black/60 p-4 rounded-md border border-gray-800/50">
                  <div className="flex justify-between items-center text-[10px] uppercase font-bold mb-2">
                    <span className="text-gray-600">Genetic DNA Key</span>
                    <span className="text-red-500 animate-pulse">{twin.dna}</span>
                  </div>
                  <div className="flex gap-1">
                    {[...Array(20)].map((_, j) => (
                      <div 
                        key={j} 
                        className={`flex-1 h-3 rounded-sm ${Math.random() > 0.5 ? 'bg-red-900/50' : 'bg-gray-800'}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between opacity-40 group-hover:opacity-100 transition-opacity">
                <div className="text-[8px] uppercase tracking-widest text-gray-500">
                  RESONANCE: 3.69HZ | G5-IGNITION: L-V4
                </div>
                <div className="flex gap-2">
                   <div className="w-1 h-1 rounded-full bg-red-600"></div>
                   <div className="w-1 h-1 rounded-full bg-red-600"></div>
                   <div className="w-1 h-1 rounded-full bg-red-600"></div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Global Mutation Stream */}
        <div className="bg-gray-900/20 border border-gray-800 rounded-lg p-6">
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.5em]">Genetic_AI Mutation Stream</h2>
            <div className="flex-1 h-[1px] bg-gray-800"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             {[...Array(8)].map((_, i) => (
               <div key={i} className="space-y-2">
                  <div className="text-[9px] text-gray-600 font-bold uppercase tracking-widest">DNA_SEQ_00{i+1}</div>
                  <div className="text-[10px] text-red-400 font-bold break-all leading-relaxed">
                    {Math.random().toString(36).substring(2, 12).toUpperCase()}-
                    {Math.random().toString(36).substring(2, 12).toUpperCase()}
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Log Area */}
        <div className="p-6 bg-red-600/5 border border-red-900/20 rounded-lg">
           <p className="text-[10px] text-red-500/80 italic leading-relaxed">
             "The Nicholas Young Master Trust no longer operates on static logic. Every Titan extension reporting to the Thalamus is a live, mutating twin of our operational reality. Total architecture mass anchored at $5.407B."
           </p>
        </div>
      </div>
    </div>
  );
};

export default OverlordPanel;
