import React, { useState, useEffect } from 'react';
import { Network, Database, ShieldAlert, Server, Activity, FileText } from 'lucide-react';
import { ConglomerateRoleMatrix } from './ConglomerateRoleMatrix';

export const TitanOperationsPanel: React.FC = () => {
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [meshNodes, setMeshNodes] = useState<any[]>([]);
  const [context, setContext] = useState<any>(null);
  const [sow, setSow] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/titan/ledger').then(r => r.json()).then(d => setLedgerData(d.data || []));
    fetch('/api/titan/deployments').then(r => r.json()).then(d => setDeployments(d.data || []));
    fetch('/api/titan/mesh').then(r => r.json()).then(d => setMeshNodes(d.data || []));
    fetch('/api/titan/context').then(r => r.json()).then(d => {
      setContext(d.context);
      setSow(d.sow || []);
    });
  }, []);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Top Banner - Entity Context */}
      {context && (
        <div className="bg-gray-900/60 border border-indigo-500/30 p-4 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-8 h-8 text-indigo-400" />
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">{context.name}</h3>
              <p className="text-xs text-gray-400 font-mono">EIN: {context.ein} | {context.jurisdiction} JURISDICTION</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-400 font-mono uppercase mb-1">Internal IP Valuation</p>
            <p className="text-lg font-bold text-green-400 font-mono">
              ${Number(context.ledgerReserves).toLocaleString()} USD
            </p>
          </div>
        </div>
      )}

      {/* Grid for Mesh and SOW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

      {/* Conglomerate Architect Role Matrix */}
      <div className="lg:col-span-2">
        <ConglomerateRoleMatrix />
      </div>
        
        {/* Mesh Fleet Status */}
        <div className="bg-gray-900/40 border border-indigo-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">Autonomous Mesh Audit</h3>
          </div>
          <div className="space-y-3">
            {meshNodes.map((node, idx) => (
              <div key={idx} className="flex justify-between items-center bg-gray-950/60 border border-gray-800 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${node.status === 'ACTIVE' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-200 font-mono">{node.name}</p>
                    <p className="text-[10px] text-gray-500 font-mono">{node.host}:{node.port}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-mono font-bold ${node.status === 'ACTIVE' ? 'text-green-400' : 'text-red-400'}`}>
                    {node.status}
                  </p>
                  {node.status === 'ACTIVE' && (
                    <p className="text-[10px] text-gray-500 font-mono">{node.latency.toFixed(2)} ms ping</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Commercial SOW Deployments */}
        <div className="bg-gray-900/40 border border-indigo-500/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
            <FileText className="w-5 h-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase">SOW Deployments</h3>
          </div>
          <div className="space-y-4">
            {sow.map((item, idx) => (
              <div key={idx} className="bg-gray-950/60 border border-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="text-sm font-bold text-indigo-300 font-mono">{item.tier}</h4>
                  <span className="text-[10px] bg-indigo-950 text-indigo-300 border border-indigo-800 px-2 py-0.5 rounded uppercase font-bold">
                    {item.status}
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-mono mb-3">{item.nodes} Nodes Provisioned</p>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-gray-500">Commitment:</span>
                  <span className="text-gray-200">${item.baseCommitment.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-mono mt-1">
                  <span className="text-gray-500">Add-ons:</span>
                  <span className="text-gray-200">${item.addons.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-mono mt-2 pt-2 border-t border-gray-800 font-bold">
                  <span className="text-gray-400">Total Value:</span>
                  <span className="text-green-400">${item.totalValue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sector Deployment / Liquidity Matrix */}
      <div className="bg-gray-900/40 border border-indigo-500/20 rounded-xl p-5 overflow-x-auto">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
          <Activity className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase">Liquidity Matrix & Sector Deployments</h3>
        </div>
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="pb-2 font-medium">Sector</th>
              <th className="pb-2 font-medium">Source Funds</th>
              <th className="pb-2 font-medium text-right">Multiplier</th>
              <th className="pb-2 font-medium text-right">Total Deployment</th>
              <th className="pb-2 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((d, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                <td className="py-3 text-indigo-300">{d.sector}</td>
                <td className="py-3 text-gray-300">${d.funds.toLocaleString()}</td>
                <td className="py-3 text-right text-gray-400">{d.multiplier}x</td>
                <td className="py-3 text-right font-bold text-green-400">${d.total.toLocaleString()}</td>
                <td className="py-3 text-right">
                  <span className="text-[9px] bg-green-950/50 text-green-400 border border-green-900/50 px-1.5 py-0.5 rounded">
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fiduciary Ledger / UCC Seals */}
      <div className="bg-gray-900/40 border border-indigo-500/20 rounded-xl p-5 overflow-x-auto">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-800 pb-3">
          <Database className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase">UCC Statutory Ledger & State Roots</h3>
        </div>
        <table className="w-full text-left text-[10px] font-mono whitespace-nowrap">
          <thead>
            <tr className="text-gray-500 border-b border-gray-800">
              <th className="pb-2 font-medium">Timestamp</th>
              <th className="pb-2 font-medium">Statutory Seal (SHA-256)</th>
              <th className="pb-2 font-medium">Plane</th>
              <th className="pb-2 font-medium">Payload Summary</th>
            </tr>
          </thead>
          <tbody>
            {ledgerData.map((l, i) => (
              <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                <td className="py-2.5 text-gray-400">{new Date(l.time).toLocaleTimeString()}</td>
                <td className="py-2.5 text-cyan-400 font-bold tracking-wider">{l.seal}</td>
                <td className="py-2.5 text-orange-400">{l.plane}</td>
                <td className="py-2.5 text-gray-300 truncate max-w-[200px]" title={l.payload}>{l.payload}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};
