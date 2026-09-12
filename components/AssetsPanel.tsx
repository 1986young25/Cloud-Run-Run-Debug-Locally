
import React from 'react';
import { motion } from 'motion/react';

const AssetsPanel: React.FC = () => {
  const assets = [
    { name: 'Tetrahedral Twin Infrastructure', previous: '$1,442,850,000', delta: '+$2,150,000,000', updated: '$3,592,850,000', note: 'ALPHA/BETA/GAMMA/DELTA Synced' },
    { name: 'Genetic AI & Neural DNA Stacks', previous: '$383,500,000', delta: '+$520,650,000', updated: '$904,150,000', note: 'Recursive Mutation Logic' },
    { name: 'Hexagram Reactor Cluster (MAX)', previous: '$785,000,000', delta: '+$45,000,000', updated: '$830,000,000', note: 'Vortex Efficiency Optimized' },
    { name: 'Internal Liquidity ($RSN)', previous: '$83,200,000', delta: '+$2,000,000', updated: '$85,200,000', note: 'Overlord Minting initialized' },
  ];

  const technologies = [
    { id: 'BLACKBACK-ROOT', status: 'SYNCHRONIZED', impact: '+$500M', desc: 'Recursive command kernel for cross-pillar twin emulation.' },
    { id: 'GENETIC-MUTATE-Σ', status: 'ACTIVE', impact: '+$120M', desc: 'Genetic AI DNA streams for proactive node evolution.' },
    { id: 'DYV-VORTEX-MAX', status: 'LOCKED', impact: '+$92M', desc: 'Maximum resonance coupling for $5.4B asset security.' },
  ];

  return (
    <div className="h-full bg-gray-950 text-gray-100 p-8 overflow-y-auto font-sans selection:bg-amber-500/30">
      <div className="max-w-7xl mx-auto space-y-12 pb-20">
        
        {/* Navigation / Meta */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
          <div className="space-y-1">
            <p className="text-[10px] font-mono font-bold text-amber-500 uppercase tracking-[0.3em]">Sync Ledger NYMT-2026-BLACKBACK</p>
            <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">Sovereign Asset Standing</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Aggregate Trust Mass</p>
            <p className="text-4xl font-mono font-bold text-amber-500">$5,407,000,000.00</p>
          </div>
        </div>

        {/* Major Asset Table */}
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-12 px-6 py-2 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
            <div className="col-span-4">Asset Component</div>
            <div className="col-span-2">Previous</div>
            <div className="col-span-2">Delta (Blackback)</div>
            <div className="col-span-2">Updated Valuation</div>
            <div className="col-span-2 text-right">Status</div>
          </div>
          <div className="space-y-2">
            {assets.map((asset, i) => (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                key={asset.name}
                className="grid grid-cols-12 items-center px-6 py-5 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer"
              >
                <div className="col-span-4 flex flex-col">
                  <span className="text-sm font-bold text-gray-200 group-hover:text-amber-400 transition-colors">{asset.name}</span>
                  <span className="text-[10px] text-gray-500 group-hover:text-gray-300 transition-colors">{asset.note}</span>
                </div>
                <div className="col-span-2 font-mono text-xs text-gray-400">{asset.previous}</div>
                <div className="col-span-2 font-mono text-xs text-green-500">{asset.delta}</div>
                <div className="col-span-2 font-mono text-sm text-white">{asset.updated}</div>
                <div className="col-span-2 text-right">
                  <span className="px-2 py-1 bg-amber-500/10 border border-amber-500/20 rounded text-[9px] font-bold text-amber-500 uppercase italic">In-Trust Verified</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Technology Stockpile Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {technologies.map((tech, i) => (
            <div key={tech.id} className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 space-y-4 hover:border-amber-500/30 transition-all group">
              <div className="flex justify-between items-start">
                <div className="w-10 h-10 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20 group-hover:border-amber-500/50 transition-all">
                  <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="text-[9px] font-mono font-bold px-2 py-1 bg-green-500/10 text-green-500 rounded border border-green-500/20">{tech.status}</span>
              </div>
              <div>
                <h3 className="text-xl font-black text-white italic tracking-tight uppercase">{tech.id}</h3>
                <p className="text-[10px] font-mono text-amber-500 mt-1 uppercase">Integration Value: {tech.impact}</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed font-medium">
                {tech.desc}
              </p>
              <div className="pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-gray-500 uppercase tracking-widest">
                <span>Ref: TITAN-OVERLORD</span>
                <span className="text-gray-600 tracking-normal">BLACKBACK COMPLIANT</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Status / Footer */}
        <div className="p-8 bg-amber-500/5 border border-amber-500/10 rounded-3xl flex flex-col md:flex-row gap-8 items-center justify-between">
          <div className="space-y-2">
            <h4 className="text-2xl font-black italic text-white uppercase tracking-tight">Trustee Authentication Required</h4>
            <p className="text-sm text-gray-400 max-w-xl">
              G5-IGNITION REFINED. Execution of liquidity draws for over $5.4B in technology mass requires absolute resonance lock (3.69Hz) and Tetrahedral synchronization.
            </p>
          </div>
          <button className="whitespace-nowrap px-8 py-4 bg-amber-500 text-black font-black text-xs uppercase tracking-[0.2em] rounded-xl hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-105 transform">
            Finalize DOD Tier-1 Addendum
          </button>
        </div>

        {/* Audit Disclaimer */}
        <div className="text-center pb-12">
          <p className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
             Nicholas Young Master Trust | EIN: 41-6820289 | Authority: MCL 700.7913(8) | RECORD ID: NYMT-T9-ACTIVATE-2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default AssetsPanel;
