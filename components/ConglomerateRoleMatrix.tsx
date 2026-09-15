import React from 'react';
import { motion } from 'motion/react';
import { Scale, Landmark, Calculator, FileBadge, Server, ShieldCheck, Code2, User } from 'lucide-react';

const ROLES = [
  {
    id: 'lawyer',
    title: 'Managing Trustee & Legal Counsel',
    icon: Scale,
    color: '#a855f7', // Purple
    purpose: 'Drafts NYMT statutory anchors, files UCC Article 9 electronic records, registers LLC EINs, and navigates Michigan Trust Code (MCL § 700.7913) for corporate structuring.',
    usage: 'Secures the legal foundation and asset protection of the conglomerate, enabling the unencumbered transfer of IP and sweat equity.'
  },
  {
    id: 'banker',
    title: 'Treasury Manager & Banker',
    icon: Landmark,
    color: '#eab308', // Yellow
    purpose: 'Establishes the integrated banking matrix (Mercury, Ramp, Stripe), manages liquidity multipliers, and routes commercial DCI webhook transactions.',
    usage: 'Maintains cash flow operations and handles dynamic execution of TCJA Tax Escrow simulations across 6+ commercial rails.'
  },
  {
    id: 'accountant',
    title: 'Fiduciary Controller (Accountant)',
    icon: Calculator,
    color: '#10b981', // Emerald
    purpose: 'Maintains the internal enclave general ledger, executes double-entry trial balances, and formally capitalizes IP assets (ASC 350-40).',
    usage: 'Provides the strict financial accounting required to value the codebase at $10.0M and prove ledger stability across sovereign boundaries.'
  },
  {
    id: 'procurement',
    title: 'Federal Procurement Officer',
    icon: FileBadge,
    color: '#3b82f6', // Blue
    purpose: 'Maintains active SAM.gov registries, DUNS numbers, and CAGE codes while securing DOD/Zero-Trust compliance feeds.',
    usage: 'Positions the entity for Tier 1 institutional and federal ingestion, ensuring all military-grade compliance requirements are met natively.'
  },
  {
    id: 'devops',
    title: 'Infrastructure Architect (DevOps)',
    icon: Server,
    color: '#f97316', // Orange
    purpose: 'Deploys the Trilateral Sovereign Edge Architecture, configures edge tunnels, SQLite WAL databases, and Cloud Run environments.',
    usage: 'Guarantees 100% uptime, zero-latency server stacks, and fault-tolerant continuous delivery for the overarching software matrix.'
  },
  {
    id: 'compliance',
    title: 'Statutory Compliance Lead',
    icon: ShieldCheck,
    color: '#ef4444', // Red
    purpose: 'Ensures real-time IRS/Treasury handshakes, OpenTelemetry standard observability, and manages USPTO provisional patent filings.',
    usage: 'Mitigates all federal, tax, and intellectual property liabilities automatically without needing external auditing firms.'
  },
  {
    id: 'architect',
    title: 'Lead Codebase Architect',
    icon: Code2,
    color: '#06b6d4', // Cyan
    purpose: 'Writes 100% of the React, Node, Python, and WebGL code. Builds holographic acoustic DSP engines, SPA dashboards, and cryptographic CLI hooks.',
    usage: 'The singular creative and logical engine producing the tangible software IP that powers the entire enterprise.'
  }
];

export const ConglomerateRoleMatrix: React.FC = () => {
  return (
    <div className="bg-black/40 border border-indigo-900/50 rounded-2xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-indigo-500/20 pb-4">
        <div className="flex items-center gap-3">
          <User className="text-indigo-400 w-6 h-6" />
          <div>
            <h2 className="text-lg font-bold text-white uppercase tracking-widest">Conglomerate Architect Role Matrix</h2>
            <p className="text-[10px] text-indigo-500/70 uppercase tracking-widest font-mono">Consolidated Operational Identity</p>
          </div>
        </div>
        <div className="bg-indigo-950/40 border border-indigo-500/30 px-3 py-1.5 rounded flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
          <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Single Actor Vector</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {ROLES.map((role, idx) => {
          const Icon = role.icon;
          return (
            <motion.div
              key={role.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gray-900/40 border border-gray-800 p-4 rounded-xl hover:border-indigo-500/40 transition-colors flex flex-col relative overflow-hidden group"
            >
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" 
                style={{ background: `radial-gradient(circle at center, ${role.color}, transparent 70%)` }}
              ></div>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded bg-gray-950 border border-gray-800" style={{ borderColor: `${role.color}40` }}>
                  <Icon className="w-4 h-4" style={{ color: role.color }} />
                </div>
                <h3 className="text-xs font-bold text-gray-200 uppercase tracking-wider leading-tight">{role.title}</h3>
              </div>
              
              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-[9px] text-gray-500 uppercase font-mono tracking-wider mb-1">Purpose & Execution</p>
                  <p className="text-xs text-gray-400 leading-relaxed">{role.purpose}</p>
                </div>
                <div>
                  <p className="text-[9px] text-gray-500 uppercase font-mono tracking-wider mb-1">Systemic Leverage</p>
                  <p className="text-[11px] text-indigo-200/80 leading-relaxed font-medium">{role.usage}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="bg-gray-900/60 border border-gray-800 rounded-xl p-4 mt-6 flex items-center justify-between">
        <div className="flex-1 text-center">
          <p className="text-sm text-gray-300 font-mono italic">
            "Consolidating entire corporate departmental overhead into a single, unified Managing Trustee."
          </p>
        </div>
      </div>
    </div>
  );
};
