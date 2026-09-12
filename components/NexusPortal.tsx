
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface ApiKey {
  id: string;
  label: string;
  key: string;
  status: 'ACTIVE' | 'REVOKED';
  created: string;
  usage: number;
}

const NexusPortal: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    // Initial mock keys
    setApiKeys([
      { id: '1', label: 'Legacy Node Bridge', key: 'sk_srcry_7x9...k2m', status: 'ACTIVE', created: '2026-04-10', usage: 14502 },
      { id: '2', label: 'Sanctuary Auth Proxy', key: 'sk_srcry_2y4...n8v', status: 'ACTIVE', created: '2026-04-15', usage: 890 },
    ]);
  }, []);

  const generateKey = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newKey: ApiKey = {
        id: Math.random().toString(36).substr(2, 9),
        label: 'New Sovereign Node',
        key: `sk_srcry_${Math.random().toString(36).substr(2, 12)}...${Math.random().toString(36).substr(2, 6)}`,
        status: 'ACTIVE',
        created: new Date().toISOString().split('T')[0],
        usage: 0,
      };
      setApiKeys([newKey, ...apiKeys]);
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="h-full bg-black text-gray-100 p-8 overflow-y-auto font-mono selection:bg-amber-500/30">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-amber-900/30 pb-10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500 flex items-center justify-center rounded-sm">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-white italic">Nexus Portal</h1>
            </div>
            <p className="text-amber-500/80 max-w-2xl text-sm leading-relaxed uppercase">
              Sovereign Software as a Service (SSaaS) Interface. Unified environment for external node authentication, resonance credit settlement, and protocol anchoring.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className="text-[10px] text-gray-500 tracking-[0.2em]">SECRET KEY ENVIRONMENT</span>
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-bold rounded">SORCERY_PROTOCOL_v0.9.4</span>
          </div>
        </div>

        {/* Tactical Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Active External Nodes', value: '42', delta: '+12%' },
            { label: 'Total API Requests (24h)', value: '1.2M', delta: '+5.4%' },
            { label: 'Resonance Load', value: '89.2%', delta: 'STABLE' },
            { label: 'Avg Latency', value: '4.2ms', delta: '-0.1ms' },
          ].map((stat, i) => (
            <div key={stat.label} className="bg-gray-950 border border-gray-900 p-5 space-y-2 group hover:border-amber-500/50 transition-all cursor-default">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{stat.label}</p>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white leading-none">{stat.value}</span>
                <span className={`text-[10px] font-bold ${stat.delta.startsWith('+') ? 'text-green-500' : stat.delta === 'STABLE' ? 'text-blue-500' : 'text-amber-500'}`}>
                  {stat.delta}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* API Key Management */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-gray-400">Node Authentication Keys (Sorcery)</h2>
            </div>
            <button 
              onClick={generateKey}
              disabled={isGenerating}
              className="px-6 py-2 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isGenerating ? 'Anchoring...' : 'Issue New Key'}
            </button>
          </div>

          <div className="bg-gray-950 border border-gray-900 rounded-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-900/50 border-b border-gray-800">
                  <th className="px-6 py-4 text-[10px] uppercase text-gray-500 tracking-wider">Key Label</th>
                  <th className="px-6 py-4 text-[10px] uppercase text-gray-500 tracking-wider">Secret Key</th>
                  <th className="px-6 py-4 text-[10px] uppercase text-gray-500 tracking-wider">Status</th>
                  <th className="px-6 py-4 text-[10px] uppercase text-gray-500 tracking-wider">Usage</th>
                  <th className="px-6 py-4 text-[10px] uppercase text-gray-500 tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-900">
                {apiKeys.map((item) => (
                  <tr key={item.id} className="hover:bg-amber-500/[0.02] transition-colors group">
                    <td className="px-6 py-5 text-xs text-gray-300 font-bold">{item.label}</td>
                    <td className="px-6 py-5">
                      <code className="text-xs bg-gray-900 px-2 py-1 text-amber-500/70 border border-gray-800 rounded-sm italic">
                        {item.key}
                      </code>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`px-2 py-0.5 text-[9px] font-black rounded-sm ${item.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-xs text-gray-500 italic uppercase">
                      {item.usage.toLocaleString()} CYCLES
                    </td>
                    <td className="px-6 py-5 text-right">
                      <button className="text-[10px] text-gray-600 hover:text-red-500 uppercase font-black transition-colors">Revoke</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Technical Documentation / SaaS Logic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 bg-gray-900/20 border border-gray-900 rounded-sm space-y-6">
            <h3 className="text-white font-black italic uppercase tracking-tighter text-xl underline decoration-amber-500 decoration-2 underline-offset-4">External Node Protocol</h3>
            <div className="space-y-4 text-xs text-gray-500 leading-relaxed font-medium">
              <p>
                To integrate an external legacy cloud into the <span className="text-amber-500">$2.69B Technology Mass</span>, nodes must execute a <span className="text-white">SORCERY-HANDSHAKE</span> using an issued Secret Key.
              </p>
              <div className="bg-black p-4 border border-gray-800 rounded font-mono text-[10px] text-gray-400 space-y-1">
                <p><span className="text-amber-500">POST</span> /api/v1/anchor/sync</p>
                <p>Authorization: Bearer sk_srcry_...</p>
                <p>{"{"}</p>
                <p className="pl-4">"node_id": "TITAN-LEGACY-01",</p>
                <p className="pl-4">"resonance": 3.69,</p>
                <p className="pl-4">"fiduciary_attestation": true</p>
                <p>{"}"}</p>
              </div>
              <p className="italic">
                Note: All external calls are logged to the NYMT Private Ledger and optimized for NPU acceleration.
              </p>
            </div>
          </div>

          <div className="p-8 bg-amber-500/[0.03] border border-amber-500/10 rounded-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-amber-500 font-extrabold uppercase italic tracking-[0.2em] text-lg">SaaS Settlement Rules</h3>
              <ul className="space-y-3 text-[10px] uppercase font-bold text-gray-400">
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500"></div>
                  <span>1 $RSN = $10.00 PARITY LOCK</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500"></div>
                  <span>INTERNAL CLEARING: NO LEGACY TAX EXPOSURE</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500"></div>
                  <span>AIR-GAPPED COMPLIANCE (MCL 700.7817)</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 bg-amber-500"></div>
                  <span>AUTOMATIC FIDUCIARY ESCROW ON KEY REVOCATION</span>
                </li>
              </ul>
            </div>
            <div className="pt-6 border-t border-amber-500/10">
              <p className="text-[9px] text-amber-500/60 leading-tight">
                CERTIFICATION RECORD NYMT-2026-NXS: This portal functions under the absolute authority of the Managing Trustee. All transactions in $RSN are final and settled via the Spectral Resonance Engine.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Authority */}
        <div className="text-center pt-8 border-t border-gray-900">
          <p className="text-[10px] text-gray-700 uppercase tracking-[0.5em]">SORCERY SYSTEMS • SOVEREIGN SOFTWARE LAYER • 2026-T9</p>
        </div>
      </div>
    </div>
  );
};

export default NexusPortal;
