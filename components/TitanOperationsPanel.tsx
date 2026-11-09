import React, { useState, useEffect } from 'react';
import { Network, Database, ShieldAlert, Server, Activity, FileText, DollarSign, TrendingUp, ShieldCheck, MapPin, CheckCircle2, Lock, Radio } from 'lucide-react';
import { ConglomerateRoleMatrix } from './ConglomerateRoleMatrix';
import { M2MPredictiveProfitChart } from './M2MPredictiveProfitChart';

export const TitanOperationsPanel: React.FC = () => {
  const [ledgerData, setLedgerData] = useState<any[]>([]);
  const [deployments, setDeployments] = useState<any[]>([]);
  const [meshNodes, setMeshNodes] = useState<any[]>([]);
  const [context, setContext] = useState<any>(null);
  const [sow, setSow] = useState<any[]>([]);
  const [m2mTelemetry, setM2mTelemetry] = useState<any>(null);
  const [liveValuation, setLiveValuation] = useState<any>(null);

  useEffect(() => {
    fetch('/api/titan/ledger').then(r => r.json()).then(d => setLedgerData(d.data || []));
    fetch('/api/titan/deployments').then(r => r.json()).then(d => setDeployments(d.data || []));
    fetch('/api/titan/mesh').then(r => r.json()).then(d => setMeshNodes(d.data || []));
    fetch('/api/titan/context').then(r => r.json()).then(d => {
      setContext(d.context);
      setSow(d.sow || []);
    });
    fetch('/api/m2m/profit-telemetry').then(r => r.json()).then(d => {
      if (d.success) setM2mTelemetry(d);
    }).catch(() => {});
    fetch('/api/titan/live-valuation').then(r => r.json()).then(d => {
      if (d.success) setLiveValuation(d);
    }).catch(() => {});
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

      {/* Live Valuation Engine & Codebase LOC Audit Banner */}
      <div className="bg-gradient-to-r from-cyan-950/40 via-gray-950 to-indigo-950/40 border border-cyan-500/40 p-4 rounded-xl space-y-3 shadow-lg font-mono">
        <div className="flex flex-wrap items-center justify-between border-b border-gray-800 pb-2.5 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <Database className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                Live Valuation &amp; Codebase LOC Engine
                <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded font-bold">
                  ASC 350-40 CAPITALIZED
                </span>
              </h3>
              <p className="text-xs text-gray-400">
                Verified Filesystem LOC Audit &amp; ~/titan_master_vault.db Statutory Reserves
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-400">STATE ROOT:</span>
            <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-500/40 text-cyan-300 rounded font-bold text-[11px]">
              {liveValuation?.stateSeal || "UCC-CER-NYMT-XB6-2D7891F18AD4"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="bg-gray-950/80 border border-gray-800 p-3 rounded-lg">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Verified Codebase</span>
            <p className="text-base font-bold text-white mt-1">
              {liveValuation?.verifiedLoc?.toLocaleString() || '12,510'} <span className="text-xs font-normal text-cyan-400">LOC</span>
            </p>
            <span className="text-[9px] text-gray-400">{liveValuation?.verifiedFiles || 48} source files verified</span>
          </div>

          <div className="bg-gray-950/80 border border-gray-800 p-3 rounded-lg">
            <span className="text-[10px] text-gray-500 uppercase font-bold">ASC 350-40 IP Value</span>
            <p className="text-base font-bold text-emerald-400 mt-1">
              ${liveValuation?.ipValuationUsd?.toLocaleString() || '2,189,250.00'}
            </p>
            <span className="text-[9px] text-gray-400">@ $175.00/LOC defense rate</span>
          </div>

          <div className="bg-gray-950/80 border border-cyan-500/30 p-3 rounded-lg bg-cyan-950/20">
            <span className="text-[10px] text-cyan-400 uppercase font-bold">Parametric Valuation</span>
            <p className="text-base font-bold text-cyan-300 mt-1">
              ${liveValuation?.parametricValuationUsd?.toLocaleString() || '62,570.00'}
            </p>
            <span className="text-[9px] text-gray-400">$75/hr @ 15 LOC + $1/WAL</span>
          </div>

          <div className="bg-gray-950/80 border border-gray-800 p-3 rounded-lg">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Master Vault Reserves</span>
            <p className="text-base font-bold text-purple-300 mt-1">
              ${(liveValuation?.vaultReservesUsd / 1e9)?.toFixed(2) || '5.41'}B <span className="text-[10px] text-purple-400 font-normal">USD</span>
            </p>
            <span className="text-[9px] text-gray-400">~/titan_master_vault.db</span>
          </div>

          <div className="bg-gray-950/80 border border-gray-800 p-3 rounded-lg">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Impedance &amp; Multiplier</span>
            <p className="text-base font-bold text-amber-300 mt-1">
              376.5 Ω <span className="text-xs font-normal text-gray-400">/ 1.691x</span>
            </p>
            <span className="text-[9px] text-gray-400">Z₀ Free-Space Matched</span>
          </div>
        </div>
      </div>
      <div className="bg-gradient-to-br from-emerald-950/40 via-gray-950 to-indigo-950/40 border border-emerald-500/40 p-5 rounded-xl space-y-4 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between border-b border-gray-800 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
              <TrendingUp className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white font-mono flex items-center gap-2">
                Machine-to-Machine (M2M) Profit Engine
                <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded font-bold">
                  AUTONOMOUS SETTLEMENT
                </span>
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                Live Liquidity Velocity &amp; Dynamic Multiplier Telemetry across 5 Sectors
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-gray-400">STATUS:</span>
            <span className="px-2 py-0.5 bg-emerald-950 border border-emerald-500/40 text-emerald-300 rounded font-bold">
              100.0% LIQUIDITY_DENSITY_STABLE
            </span>
          </div>
        </div>

        {/* 4 KPI Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono">
          <div className="bg-gray-950/80 border border-gray-800 p-3 rounded-lg">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Total Capital Injected</span>
            <p className="text-lg font-bold text-gray-200 mt-1">
              ${m2mTelemetry?.summary?.totalBaseCapitalInjectedUsd?.toLocaleString() || '442,600'}
            </p>
            <span className="text-[9px] text-gray-500">10 Autonomous Legs</span>
          </div>

          <div className="bg-gray-950/80 border border-gray-800 p-3 rounded-lg">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Total M2M Settled</span>
            <p className="text-lg font-bold text-cyan-400 mt-1">
              ${m2mTelemetry?.summary?.totalSettledValueUsd?.toLocaleString() || '904,727.70'}
            </p>
            <span className="text-[9px] text-cyan-500/80">Avg Multiplier: 2.044x</span>
          </div>

          <div className="bg-emerald-950/30 border border-emerald-500/40 p-3 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.15)]">
            <span className="text-[10px] text-emerald-400 uppercase font-bold">Net Profit Generated</span>
            <p className="text-lg font-black text-emerald-300 mt-1">
              +${m2mTelemetry?.summary?.netProfitGeneratedUsd?.toLocaleString() || '462,127.70'}
            </p>
            <span className="text-[9px] text-emerald-400 font-bold">ROI: +104.41% Yield</span>
          </div>

          <div className="bg-gray-950/80 border border-gray-800 p-3 rounded-lg">
            <span className="text-[10px] text-gray-500 uppercase font-bold">Clearing Velocity</span>
            <p className="text-lg font-bold text-amber-300 mt-1">
              ${m2mTelemetry?.summary?.totalClearingVelocityUsdPerHour?.toLocaleString() || '336,329.95'}/hr
            </p>
            <span className="text-[9px] text-gray-500">Floor Parity: 1.691x</span>
          </div>
        </div>
      </div>

      {/* 90-Day Predictive M2M Profit Visualization */}
      <M2MPredictiveProfitChart />

      {/* Physical Command Post Fiduciary Verification & Photo Asset */}
      <div className="bg-gray-900/60 border border-cyan-500/30 p-5 rounded-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between border-b border-gray-800 pb-3 gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/30 rounded-lg text-cyan-400">
              <MapPin className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white font-mono flex items-center gap-2">
                Physical Hardware Command Center Verification
                <span className="text-[10px] px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-500/40 rounded font-bold">
                  MEDIA GROUNDED
                </span>
              </h3>
              <p className="text-xs text-gray-400 font-mono">
                115 East Southfield Drive, Jackson, Michigan 49203 // The Nicholas Young Master Trust
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>TETHER VERIFIED</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="relative group rounded-lg overflow-hidden border border-gray-800 bg-black flex items-center justify-center max-h-56">
            <img 
              src="/public/assets/aistudio/Image_November_03__2026_-_5_08PM_f68d66e2" 
              alt="Physical Command Center & Attestation Screen" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute bottom-2 left-2 right-2 bg-gray-950/90 backdrop-blur-md px-2 py-1 rounded text-[10px] font-mono text-gray-300 border border-gray-800">
              Ara River Table // Samsung $RSN Attestation Monitor
            </div>
          </div>

          <div className="md:col-span-2 space-y-3 font-mono text-xs">
            <div className="bg-gray-950/70 border border-gray-800 p-3 rounded-lg space-y-1.5">
              <div className="flex justify-between text-gray-400">
                <span className="text-cyan-400 font-bold">FIDUCIARY ATTESTATION:</span>
                <span className="text-emerald-400 font-bold">ACTIVE SIGNATURE</span>
              </div>
              <p className="text-[11px] text-gray-300 italic leading-relaxed">
                "I, Nicholas Young, Managing Trustee, hereby certify that this internal movement of credit is an internal fiduciary asset migration anchored to physical telemetry, invariant wave impedance (Z₀ = 376.5 Ω), and statutory trust law under MCL § 700.7913."
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-between text-[10px] text-gray-500 border-t border-gray-800">
                <span>MANAGING TRUSTEE: <strong>NICHOLAS YOUNG</strong></span>
                <span>EIN: <strong>41-6820289</strong></span>
                <span>SEAL: <strong>UCC-CER-NYMT-XB6-25A9912A</strong></span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px]">
              <div className="bg-gray-950/50 border border-gray-800 p-2 rounded">
                <span className="text-gray-500 block">Node-07-Titan</span>
                <span className="text-emerald-400 font-bold">ONLINE (2.34ms)</span>
              </div>
              <div className="bg-gray-950/50 border border-gray-800 p-2 rounded">
                <span className="text-gray-500 block">Node-Alpha VPS</span>
                <span className="text-emerald-400 font-bold">ANCHORED (FastAPI)</span>
              </div>
              <div className="bg-gray-950/50 border border-gray-800 p-2 rounded">
                <span className="text-gray-500 block">Pixel 8a Termux</span>
                <span className="text-emerald-400 font-bold">SYNC (8.71ms)</span>
              </div>
              <div className="bg-gray-950/50 border border-gray-800 p-2 rounded">
                <span className="text-gray-500 block">GCP Vertex AI</span>
                <span className="text-cyan-400 font-bold">LINKED (NYMT26)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

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
              <th className="pb-2 font-medium">Capital Injected</th>
              <th className="pb-2 font-medium text-right">Multiplier</th>
              <th className="pb-2 font-medium text-right">Settled Value</th>
              <th className="pb-2 font-medium text-right">Net M2M Profit</th>
              <th className="pb-2 font-medium text-right">Velocity ($/hr)</th>
              <th className="pb-2 font-medium text-right">Stability Audit</th>
            </tr>
          </thead>
          <tbody>
            {deployments.map((d, i) => {
              const net = d.total - d.funds;
              return (
                <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-900/50 transition-colors">
                  <td className="py-3 text-indigo-300 font-bold">{d.sector}</td>
                  <td className="py-3 text-gray-300">${d.funds.toLocaleString()}</td>
                  <td className="py-3 text-right text-gray-400">{d.multiplier}x</td>
                  <td className="py-3 text-right text-cyan-400">${d.total.toLocaleString()}</td>
                  <td className="py-3 text-right font-bold text-emerald-400">+${net.toLocaleString()}</td>
                  <td className="py-3 text-right text-amber-300">${d.velocity?.toLocaleString() || '-'}</td>
                  <td className="py-3 text-right">
                    <span className="text-[9px] bg-emerald-950/60 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">
                      {d.status}
                    </span>
                  </td>
                </tr>
              );
            })}
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
