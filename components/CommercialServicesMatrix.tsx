import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  Building2, 
  Award, 
  CloudLightning, 
  Layers, 
  FileCheck2, 
  Calculator, 
  HeartHandshake, 
  ChevronDown, 
  ChevronUp, 
  Copy, 
  Check, 
  ExternalLink,
  DollarSign,
  Radio,
  Server,
  Zap,
  Briefcase
} from 'lucide-react';
import { 
  titanCompanyProfile, 
  commercialServicesCatalog, 
  deploymentTiers, 
  professionalServices, 
  commercialTerms 
} from '../utils/titanData';

export const CommercialServicesMatrix: React.FC = () => {
  // State for interactive pricing calculator
  const [selectedTierId, setSelectedTierId] = useState<string>('tier-2');
  const [tier1Nodes, setTier1Nodes] = useState<number>(3);
  const [tier2ExtraNodes, setTier2ExtraNodes] = useState<number>(2);
  const [tier2BillingCycle, setTier2BillingCycle] = useState<'annual' | 'monthly'>('annual');
  const [tier0MonthlyRevenue, setTier0MonthlyRevenue] = useState<number>(8500);

  // Selected professional add-ons for custom SOW builder
  const [selectedAddons, setSelectedAddons] = useState<Record<string, number>>({
    'ps-1': 1,
    'ps-2': 1,
  });

  // State for active catalog pillar accordion
  const [expandedPillar, setExpandedPillar] = useState<number | null>(1);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const toggleAddon = (id: string) => {
    setSelectedAddons(prev => {
      const next = { ...prev };
      if (next[id]) {
        delete next[id];
      } else {
        next[id] = 1;
      }
      return next;
    });
  };

  const updateAddonQty = (id: string, qty: number) => {
    if (qty <= 0) {
      toggleAddon(id);
      return;
    }
    setSelectedAddons(prev => ({ ...prev, [id]: qty }));
  };

  // Calculations
  const calculateTierTotal = () => {
    if (selectedTierId === 'tier-0') {
      const floor = 2000;
      const taxableRev = Math.max(0, tier0MonthlyRevenue - floor);
      const royalty = taxableRev * 0.3;
      const retained = tier0MonthlyRevenue - royalty;
      return {
        upfront: 0,
        recurring: royalty,
        recurringLabel: 'Monthly Royalty (30% > $2k floor)',
        retainedByDev: retained,
        exemption: floor
      };
    }
    if (selectedTierId === 'tier-1') {
      const onboarding = 7500 * tier1Nodes;
      const monthly = 4500 * tier1Nodes;
      const annualDiscounted = 48000 * tier1Nodes;
      return {
        upfront: onboarding,
        recurring: monthly,
        annualCommitted: annualDiscounted,
        recurringLabel: `Monthly Licensing (${tier1Nodes} node${tier1Nodes > 1 ? 's' : ''})`
      };
    }
    if (selectedTierId === 'tier-2') {
      const base = tier2BillingCycle === 'annual' ? 195000 : 18500 * 12;
      const overageAnnual = tier2ExtraNodes * 3200 * 12;
      const totalAnnual = base + overageAnnual;
      return {
        upfront: 0,
        recurring: tier2BillingCycle === 'annual' ? totalAnnual : Math.round(totalAnnual / 12),
        recurringLabel: tier2BillingCycle === 'annual' ? 'Committed Annual (Drawdown)' : 'Monthly Spend',
        totalAnnual,
        baseCluster: base,
        overage: overageAnnual
      };
    }
    if (selectedTierId === 'tier-3') {
      return {
        upfront: 150000,
        recurring: 450000,
        recurringLabel: 'Tailored Firm-Fixed Milestone Baseline'
      };
    }
    return { upfront: 0, recurring: 0, recurringLabel: '' };
  };

  const calculateAddonsTotal = () => {
    let sum = 0;
    Object.entries(selectedAddons).forEach(([id, qty]) => {
      const mod = professionalServices.find(s => s.id === id);
      if (mod) sum += mod.baseCost * Number(qty);
    });
    return sum;
  };

  const tierSummary = calculateTierTotal();
  const addonsTotal = calculateAddonsTotal();

  return (
    <div className="space-y-8 p-4 md:p-6 text-gray-100 font-mono animate-in fade-in duration-500">
      
      {/* 1. Sovereign Authority & Holding Trust Header Box */}
      <div className="bg-[#0b1120] border-2 border-indigo-500/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-indigo-900/60 pb-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest">
                COMMERCIAL SERVICES CATALOG & PRICING MATRIX // LIVE EXECUTION
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter text-white uppercase">
              TITAN GAMES SECURITY <span className="text-indigo-400">L.L.C.</span>
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-3xl font-sans">
              Bridges federal contracting vehicles, enterprise cloud marketplace spend, commercial appliance deployment,
              and sovereign reentry covenants into a unified, cash-flowing operational matrix.
            </p>
          </div>

          <button
            onClick={() => copyToClipboard(
              `TITAN GAMES SECURITY L.L.C. | EIN 42-4264313 | LARA ID 28678008 | CAGE Active | D-U-N-S: 145054895 | DARPAConnect #21270632 | Procurement: cloudcommerceprocurement`,
              'credentials'
            )}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-950/80 hover:bg-indigo-900/90 text-indigo-300 border border-indigo-500/50 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 shrink-0"
          >
            {copiedText === 'credentials' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedText === 'credentials' ? 'COPIED TO CLIPBOARD' : 'COPY PROCUREMENT IDENTIFIERS'}</span>
          </button>
        </div>

        {/* Legal & Clearance Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-xs relative z-10">
          <div className="bg-gray-950/80 border border-gray-800 p-3.5 rounded-xl">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Building2 className="w-4 h-4" />
              <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400">Holding Trust</span>
            </div>
            <p className="text-white font-bold truncate">Nicholas Young Master Trust</p>
            <p className="text-[11px] text-amber-400 font-mono">EIN 41-6820289</p>
          </div>

          <div className="bg-gray-950/80 border border-gray-800 p-3.5 rounded-xl">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400">Operating Arm</span>
            </div>
            <p className="text-white font-bold truncate">Titan Games Security L.L.C.</p>
            <p className="text-[11px] text-cyan-400 font-mono">EIN 42-4264313 | LARA 28678008</p>
          </div>

          <div className="bg-gray-950/80 border border-gray-800 p-3.5 rounded-xl">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <Award className="w-4 h-4" />
              <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400">Federal Clearances</span>
            </div>
            <p className="text-emerald-400 font-bold">CAGE Active | SAM.gov Registered</p>
            <p className="text-[11px] text-gray-300 font-mono">D-U-N-S: 145054895 | ARI #21270632</p>
          </div>

          <div className="bg-gray-950/80 border border-gray-800 p-3.5 rounded-xl">
            <div className="flex items-center gap-2 text-indigo-400 mb-1">
              <CloudLightning className="w-4 h-4" />
              <span className="font-bold text-[10px] uppercase tracking-wider text-gray-400">Procurement Channels</span>
            </div>
            <p className="text-cyan-400 font-bold truncate">Google Cloud Marketplace</p>
            <p className="text-[11px] text-gray-400 truncate">`cloudcommerceprocurement` / ACH</p>
          </div>
        </div>
      </div>

      {/* 2. Deployment Tiers Comparison & Calculator */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 border-b border-gray-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-white uppercase tracking-wider">
                Part 2: Commercial Deployment Tiers
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Select a tier to inspect deliverables, SLA guarantees, and configure live deployment investment.
            </p>
          </div>
        </div>

        {/* 4-Tier Interactive Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {deploymentTiers.map((tier) => {
            const isSelected = selectedTierId === tier.id;
            return (
              <div
                key={tier.id}
                onClick={() => setSelectedTierId(tier.id)}
                className={`flex flex-col justify-between p-5 rounded-xl border cursor-pointer transition-all duration-300 relative ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500 shadow-[0_0_25px_rgba(99,102,241,0.25)] scale-[1.02]'
                    : 'bg-gray-950/60 border-gray-800 hover:border-gray-700 hover:bg-gray-900/50'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2">
                    <span className="px-2 py-0.5 bg-indigo-500 text-white text-[9px] font-black uppercase rounded">
                      ACTIVE SELECTION
                    </span>
                  </div>
                )}

                <div>
                  <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                    TIER {tier.tierNumber}
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 leading-tight">
                    {tier.name.split(':')[1]?.trim() || tier.name}
                  </h3>

                  <div className="space-y-1 my-3 py-2 border-y border-gray-800/80">
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-gray-400">Upfront:</span>
                      <span className="text-white font-bold">{tier.upfrontCost.split(' ')[0]}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-gray-400">Rate:</span>
                      <span className="text-emerald-400 font-bold">{tier.monthlyCost}</span>
                    </div>
                    <div className="flex justify-between items-baseline text-xs">
                      <span className="text-gray-400">SLA:</span>
                      <span className="text-cyan-400 font-medium">{tier.sla}</span>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 mb-4 line-clamp-3 font-sans">
                    {tier.tagline}
                  </p>

                  <div className="space-y-1.5 text-[11px] text-gray-300">
                    {tier.highlights.map((h, i) => (
                      <div key={i} className="flex items-start gap-1.5">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-800/80 text-[10px] text-gray-400 flex justify-between items-center">
                  <span>Method:</span>
                  <span className="text-gray-200 truncate max-w-[150px] font-medium" title={tier.procurementMethod}>
                    {tier.procurementMethod.split('/')[0]}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Tier Deep-Dive Configuration Panel */}
        {selectedTierId && (() => {
          const tier = deploymentTiers.find(t => t.id === selectedTierId)!;
          return (
            <div className="bg-[#0c1322] border border-indigo-500/40 rounded-xl p-6 mt-4 space-y-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-indigo-950 pb-4">
                <div>
                  <span className="text-xs text-indigo-400 font-bold tracking-widest uppercase">
                    Configuring Deployment Parameters
                  </span>
                  <h3 className="text-xl font-bold text-white">{tier.name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{tier.tagline}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest">Clearance / Vehicle</span>
                  <p className="text-xs font-bold text-emerald-400">{tier.clearanceRequired}</p>
                </div>
              </div>

              {/* Dynamic Interactive Controls based on tier */}
              {selectedTierId === 'tier-0' && (
                <div className="bg-gray-950/70 border border-gray-800 p-4 rounded-xl space-y-4">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <HeartHandshake className="w-5 h-5" />
                    <h4>Second Chance Forge Reentry Covenant Model (ISRA)</h4>
                  </div>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    Designed for returning citizens and formerly incarcerated developers with <strong>$0 upfront</strong>.
                    The developer retains 100% of the first <strong>$2,000.00 / month</strong> as a living expense exemption floor.
                    The 30% gross revenue covenant applies strictly to revenues exceeding $2,000/mo, expiring completely at exactly 60 months.
                  </p>
                  
                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Simulate Developer Monthly Gross Revenue:</span>
                      <span className="text-amber-400 font-bold text-sm">${tier0MonthlyRevenue.toLocaleString()} / mo</span>
                    </div>
                    <input 
                      type="range"
                      min={0}
                      max={30000}
                      step={500}
                      value={tier0MonthlyRevenue}
                      onChange={(e) => setTier0MonthlyRevenue(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center text-xs">
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                      <p className="text-gray-400 text-[10px] uppercase">Living Floor Exemption</p>
                      <p className="text-sm font-bold text-emerald-400 mt-1">$2,000.00 / mo</p>
                      <p className="text-[9px] text-gray-500">100% Retained</p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                      <p className="text-gray-400 text-[10px] uppercase">Retained by Developer</p>
                      <p className="text-sm font-bold text-white mt-1">
                        ${((tierSummary as any).retainedByDev || 0).toLocaleString()} / mo
                      </p>
                      <p className="text-[9px] text-emerald-400 font-medium">
                        {tier0MonthlyRevenue > 0 ? `${Math.round(((tierSummary as any).retainedByDev / tier0MonthlyRevenue) * 100)}% of revenue` : '100%'}
                      </p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                      <p className="text-gray-400 text-[10px] uppercase">Titan Covenant Royalty</p>
                      <p className="text-sm font-bold text-amber-400 mt-1">
                        ${(tierSummary.recurring || 0).toLocaleString()} / mo
                      </p>
                      <p className="text-[9px] text-gray-500">Expires at Month 60</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTierId === 'tier-1' && (
                <div className="bg-gray-950/70 border border-gray-800 p-4 rounded-xl space-y-4">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-300 font-bold">Physical Node Allocation:</span>
                    <span className="text-cyan-400 font-bold text-sm">{tier1Nodes} Hardware Nodes</span>
                  </div>
                  <input 
                    type="range"
                    min={1}
                    max={12}
                    value={tier1Nodes}
                    onChange={(e) => setTier1Nodes(Number(e.target.value))}
                    className="w-full accent-cyan-500 cursor-pointer"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                      <p className="text-gray-400 text-[10px] uppercase">One-Time Calibration</p>
                      <p className="text-sm font-bold text-white mt-1">${(7500 * tier1Nodes).toLocaleString()}</p>
                      <p className="text-[9px] text-gray-500">$7,500 / node onboarding</p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                      <p className="text-gray-400 text-[10px] uppercase">Monthly Licensing</p>
                      <p className="text-sm font-bold text-cyan-400 mt-1">${(4500 * tier1Nodes).toLocaleString()} / mo</p>
                      <p className="text-[9px] text-gray-500">Flexible month-to-month</p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                      <p className="text-gray-400 text-[10px] uppercase">Annual Upfront (11% off)</p>
                      <p className="text-sm font-bold text-emerald-400 mt-1">${(48000 * tier1Nodes).toLocaleString()} / yr</p>
                      <p className="text-[9px] text-emerald-400">Save ${(6000 * tier1Nodes).toLocaleString()}/yr</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTierId === 'tier-2' && (
                <div className="bg-gray-950/70 border border-gray-800 p-4 rounded-xl space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h4 className="text-xs font-bold text-white">Google Cloud Marketplace Draw-Down Suite</h4>
                      <p className="text-[11px] text-gray-400">Procured via `cloudcommerceprocurement.googleapis.com`</p>
                    </div>
                    <div className="flex items-center gap-2 bg-gray-900 p-1 rounded-lg border border-gray-800 text-xs">
                      <button
                        onClick={() => setTier2BillingCycle('annual')}
                        className={`px-3 py-1 rounded font-bold transition-all ${
                          tier2BillingCycle === 'annual' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Annual Cluster ($195k)
                      </button>
                      <button
                        onClick={() => setTier2BillingCycle('monthly')}
                        className={`px-3 py-1 rounded font-bold transition-all ${
                          tier2BillingCycle === 'monthly' ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'
                        }`}
                      >
                        Monthly ($18.5k/mo)
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Additional Master Nodes Beyond 5 Core Nodes:</span>
                      <span className="text-indigo-400 font-bold">+{tier2ExtraNodes} Master Nodes (${(tier2ExtraNodes * 3200).toLocaleString()}/mo)</span>
                    </div>
                    <input 
                      type="range"
                      min={0}
                      max={15}
                      value={tier2ExtraNodes}
                      onChange={(e) => setTier2ExtraNodes(Number(e.target.value))}
                      className="w-full accent-indigo-500 cursor-pointer"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs">
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                      <p className="text-gray-400 text-[10px] uppercase">Base Cluster (5 Master + 20 Edge)</p>
                      <p className="text-sm font-bold text-white mt-1">
                        ${tier2BillingCycle === 'annual' ? '195,000' : '222,000'} / yr
                      </p>
                      <p className="text-[9px] text-gray-500">SOC 2 Defensible Enclave</p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                      <p className="text-gray-400 text-[10px] uppercase">Overage Nodes Rate</p>
                      <p className="text-sm font-bold text-indigo-400 mt-1">${(tier2ExtraNodes * 3200).toLocaleString()} / mo</p>
                      <p className="text-[9px] text-gray-500">$3,200/mo per extra master node</p>
                    </div>
                    <div className="bg-gray-900 p-3 rounded-lg border border-gray-800">
                      <p className="text-gray-400 text-[10px] uppercase">Total Cloud Commitment Drawdown</p>
                      <p className="text-sm font-bold text-emerald-400 mt-1">
                        ${((tierSummary as any).totalAnnual || 0).toLocaleString()} / yr
                      </p>
                      <p className="text-[9px] text-emerald-400">Zero cash out-of-pocket on active GCP credits</p>
                    </div>
                  </div>
                </div>
              )}

              {selectedTierId === 'tier-3' && (
                <div className="bg-gray-950/70 border border-gray-800 p-4 rounded-xl space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm">
                    <Terminal className="w-5 h-5" />
                    <h4>Federal Milestone Contracting & Air-Gap Verification</h4>
                  </div>
                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    Operates under fixed-price milestone contracts or cost-plus incentive subcontracts ($150,000 – $750,000+).
                    Requires CAGE code validation, active SAM.gov entity registration, and coordinates synchronization under
                    USPTO Patent Application #64/014,873.
                  </p>
                  <div className="p-3 bg-gray-900 rounded-lg border border-gray-800 flex flex-wrap gap-4 text-xs font-mono">
                    <div>
                      <span className="text-gray-500">CAGE Code:</span> <span className="text-emerald-400 font-bold">Active</span>
                    </div>
                    <div>
                      <span className="text-gray-500">D-U-N-S:</span> <span className="text-white font-bold">145054895</span>
                    </div>
                    <div>
                      <span className="text-gray-500">DARPAConnect / ARI:</span> <span className="text-cyan-400 font-bold">#21270632</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Wave Impedance:</span> <span className="text-amber-400 font-bold">Z₀ = 376.5 Ω</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Deliverables List for Selected Tier */}
              <div>
                <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-2">
                  Official Statement of Work Deliverables:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  {tier.deliverables.map((d, idx) => (
                    <div key={idx} className="bg-gray-950 p-2.5 rounded-lg border border-gray-900 flex items-start gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 shrink-0" />
                      <span className="text-gray-300 font-sans">{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })()}
      </div>

      {/* 3. Comprehensive Catalog of Services (The 5 Pillars) */}
      <div className="space-y-4">
        <div className="border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Part 1: Comprehensive Catalog of Services
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            5 core technological pillars detailing bare-metal hardening, kinetic signal conditioning, fiduciary state-seals, and inverted reasoning.
          </p>
        </div>

        <div className="space-y-3">
          {commercialServicesCatalog.map((pillar) => {
            const isExpanded = expandedPillar === pillar.pillarNumber;
            return (
              <div 
                key={pillar.id}
                className="bg-gray-950/70 border border-gray-800 rounded-xl overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setExpandedPillar(isExpanded ? null : pillar.pillarNumber)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-900/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-indigo-950 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-xs">
                      0{pillar.pillarNumber}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{pillar.category}</h3>
                      <p className="text-xs text-gray-400">{pillar.title}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <span className="text-[10px] hidden sm:inline uppercase tracking-wider font-bold">
                      {isExpanded ? 'Collapse' : 'Expand Specs'}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="p-4 pt-0 border-t border-gray-800/80 bg-gray-900/30 space-y-3">
                    {pillar.deliverables.map((deliv, idx) => (
                      <div key={idx} className="bg-gray-950/80 border border-gray-800/90 p-4 rounded-xl space-y-2">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1">
                          <h4 className="text-xs font-bold text-indigo-300 font-mono flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                            {deliv.name}
                          </h4>
                          <span className="text-[10px] text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2 py-0.5 rounded font-mono">
                            Deterministic Module
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 font-sans leading-relaxed">
                          {deliv.description}
                        </p>
                        <div className="bg-black/60 p-2.5 rounded border border-gray-900 text-[11px] text-gray-400 flex items-start gap-2">
                          <Terminal className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-amber-400 font-bold uppercase text-[9px] tracking-wider block">
                              Technical Specification Invariant:
                            </span>
                            <span className="text-gray-300 font-mono">{deliv.techSpec}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Specialized Professional Services & Custom SOW Generator */}
      <div className="space-y-4">
        <div className="border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Part 3: Specialized Professional Services & Add-Ons
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Select modules to build a custom Statement of Work (SOW) quote with automated price aggregation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professionalServices.map((service) => {
            const isSelected = !!selectedAddons[service.id];
            const qty = selectedAddons[service.id] || 0;
            return (
              <div
                key={service.id}
                className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/30 border-indigo-500 shadow-md'
                    : 'bg-gray-950/60 border-gray-800 hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-900">
                      {service.billingModel}
                    </span>
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {service.ratePricing}
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-white mb-2 leading-tight">
                    {service.name}
                  </h4>
                  <p className="text-[11px] text-gray-400 font-sans mb-4">
                    {service.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between">
                  <button
                    onClick={() => toggleAddon(service.id)}
                    className={`px-3 py-1.5 rounded text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-red-950/80 text-red-400 border border-red-800 hover:bg-red-900'
                        : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                    }`}
                  >
                    {isSelected ? 'Remove' : '+ Add to SOW'}
                  </button>

                  {isSelected && (
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="text-gray-400">Qty:</span>
                      <button
                        onClick={() => updateAddonQty(service.id, qty - 1)}
                        className="w-6 h-6 rounded bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-gray-800"
                      >
                        -
                      </button>
                      <span className="w-5 text-center font-bold text-cyan-400">{qty}</span>
                      <button
                        onClick={() => updateAddonQty(service.id, qty + 1)}
                        className="w-6 h-6 rounded bg-gray-900 border border-gray-800 flex items-center justify-center hover:bg-gray-800"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Real-time SOW Aggregate Drawer */}
        <div className="bg-[#0b101d] border-2 border-emerald-500/40 rounded-xl p-5 shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-gray-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-950 rounded-xl border border-emerald-800 text-emerald-400">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Consolidated Statement of Work (SOW) Valuation
                </h3>
                <p className="text-xs text-gray-400">
                  Total commitment combining selected deployment tier and specialized engineering add-ons.
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase font-mono">Total Estimated SOW Value</span>
              <p className="text-2xl font-black text-emerald-400 font-mono">
                ${(
                  (selectedTierId === 'tier-2'
                    ? (tierSummary as any).totalAnnual || 0
                    : selectedTierId === 'tier-1'
                    ? (tierSummary as any).annualCommitted || 0
                    : tierSummary.recurring || 0) + addonsTotal
                ).toLocaleString()} USD
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs font-mono">
            <div className="bg-gray-950 p-3 rounded-lg border border-gray-900">
              <span className="text-gray-500 block text-[10px] uppercase">Base Deployment Tier</span>
              <span className="text-white font-bold">
                {deploymentTiers.find(t => t.id === selectedTierId)?.name.split(':')[0]}
              </span>
              <span className="text-gray-400 block text-[11px] mt-0.5">
                {tierSummary.recurringLabel}: ${tierSummary.recurring.toLocaleString()}
              </span>
            </div>

            <div className="bg-gray-950 p-3 rounded-lg border border-gray-900">
              <span className="text-gray-500 block text-[10px] uppercase">Professional Add-ons ({Object.keys(selectedAddons).length})</span>
              <span className="text-cyan-400 font-bold">
                ${addonsTotal.toLocaleString()}
              </span>
              <span className="text-gray-400 block text-[11px] mt-0.5">
                {Object.keys(selectedAddons).length > 0 ? 'Engineers Provisioned' : 'None Selected'}
              </span>
            </div>

            <div className="bg-gray-950 p-3 rounded-lg border border-gray-900 flex flex-col justify-between">
              <span className="text-gray-500 block text-[10px] uppercase">Settlement Channel</span>
              <span className="text-emerald-400 font-bold truncate">
                {selectedTierId === 'tier-2' ? 'Google Cloud Marketplace' : selectedTierId === 'tier-3' ? 'Milestone Gov Draw' : 'Corporate Net-30 ACH'}
              </span>
              <button
                onClick={() => copyToClipboard(
                  `SOW INQUIRY // TITAN GAMES SECURITY L.L.C.\nSelected Tier: ${deploymentTiers.find(t => t.id === selectedTierId)?.name}\nBase: $${tierSummary.recurring.toLocaleString()}\nAdd-ons Total: $${addonsTotal.toLocaleString()}\nTotal Value: $${((selectedTierId === 'tier-2' ? (tierSummary as any).totalAnnual || 0 : tierSummary.recurring) + addonsTotal).toLocaleString()} USD\nCAGE: Active | SAM.gov Registered | D-U-N-S: 145054895\nProcurement: Direct PO / Google Cloud Marketplace (cloudcommerceprocurement)`,
                  'sow-draft'
                )}
                className="mt-2 text-[10px] bg-indigo-950 hover:bg-indigo-900 text-indigo-300 py-1 px-2 rounded border border-indigo-800 transition-all font-bold flex items-center justify-center gap-1.5"
              >
                {copiedText === 'sow-draft' ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedText === 'sow-draft' ? 'SOW SPEC COPIED' : 'COPY SOW DRAFT'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Part 4: Commercial Terms & Settlement Channels */}
      <div className="space-y-4">
        <div className="border-b border-gray-800 pb-3">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white uppercase tracking-wider">
              Part 4: Commercial Terms & Settlement Channels
            </h2>
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            Verified corporate payment gateways, cloud spend drawdown mechanisms, and statutory trust accounting routing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="bg-gray-950/80 border border-gray-800 p-5 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 font-bold mb-1">
              <FileCheck2 className="w-4 h-4" />
              <h4 className="uppercase">1. Standard Invoicing</h4>
            </div>
            <p className="text-gray-300 font-sans text-xs leading-relaxed">
              {commercialTerms.standardInvoicing}
            </p>
            <div className="pt-2 text-[10px] text-gray-500">
              Accepted: Wire, Corporate ACH, Mercury IO, Ramp, Stripe Issuing.
            </div>
          </div>

          <div className="bg-gray-950/80 border border-gray-800 p-5 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold mb-1">
              <CloudLightning className="w-4 h-4" />
              <h4 className="uppercase">2. Pre-Committed Cloud Spend</h4>
            </div>
            <p className="text-gray-300 font-sans text-xs leading-relaxed">
              {commercialTerms.cloudProcurement}
            </p>
            <div className="pt-2 text-[10px] text-indigo-400 font-bold">
              Protocol: `cloudcommerceprocurement.googleapis.com`
            </div>
          </div>

          <div className="bg-gray-950/80 border border-gray-800 p-5 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold mb-1">
              <Building2 className="w-4 h-4" />
              <h4 className="uppercase">3. Internal Trust Accounting</h4>
            </div>
            <p className="text-gray-300 font-sans text-xs leading-relaxed">
              {commercialTerms.internalAccounting}
            </p>
            <div className="pt-2 text-[10px] text-amber-400 font-bold">
              Holding Trust EIN: 41-6820289 | MCL § 700.7913
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default CommercialServicesMatrix;
