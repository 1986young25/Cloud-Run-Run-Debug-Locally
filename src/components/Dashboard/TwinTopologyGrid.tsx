import React, { useEffect, useState } from 'react';

export interface TwinSectorState {
  id: string;
  name: 'AURA' | 'ARTA' | 'ARA' | 'ALTA';
  title: string;
  role: string;
  harmonic_m9: number;
  frequency_hz: number;
  status: 'ONLINE' | 'ACTIVE_RESONANCE' | 'INVARIANT_SEALED';
  pipe_interface: string;
  processing_load: number;
}

export const TwinTopologyGrid: React.FC = () => {
  const [sectors, setSectors] = useState<TwinSectorState[]>([
    {
      id: 'SEC-01',
      name: 'AURA',
      title: 'SUPERVISORY SHIELD & PERIMETER GATE',
      role: 'Non-subservient data broker isolation; defensive filter',
      harmonic_m9: 9,
      frequency_hz: 3.69,
      status: 'ONLINE',
      pipe_interface: 'OR_FILTER_SUPERVISORY',
      processing_load: 33,
    },
    {
      id: 'SEC-02',
      name: 'ARTA',
      title: 'KINETIC HARDLINE THROUGHPUT',
      role: 'Low-jitter copper execution; 100Hz datagram transport',
      harmonic_m9: 6,
      frequency_hz: 3.69,
      status: 'ACTIVE_RESONANCE',
      pipe_interface: 'PHY_ETH0 (192.168.12.163)',
      processing_load: 78,
    },
    {
      id: 'SEC-03',
      name: 'ARA',
      title: 'MODULO-9 COGNITIVE VECTOR ENGINE',
      role: 'Cross-lane divergence & thought vectoring (M9 Digital Root)',
      harmonic_m9: 3,
      frequency_hz: 3.69,
      status: 'ONLINE',
      pipe_interface: 'TWIN_TOPOLOGY_DISPATCH',
      processing_load: 42,
    },
    {
      id: 'SEC-04',
      name: 'ALTA',
      title: 'COLD DETERMINISTIC INVARIANT LEDGER',
      role: 'MCL § 700.7913 statutory state anchor; SQLite master enclave',
      harmonic_m9: 9,
      frequency_hz: 3.69,
      status: 'INVARIANT_SEALED',
      pipe_interface: 'digital_twin_state.db',
      processing_load: 12,
    },
  ]);

  const [activeHarmonicCycle, setActiveHarmonicCycle] = useState(0);

  // Dynamic telemetry fluctuation and harmonic wave resonance pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHarmonicCycle((prev) => (prev + 1) % 9);
      setSectors((prev) =>
        prev.map((s) => {
          const delta = (Math.random() * 6 - 3);
          const newLoad = Math.min(99, Math.max(8, Math.round(s.processing_load + delta)));
          return {
            ...s,
            processing_load: newLoad,
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerHarmonicResonance = (sectorId: string) => {
    setSectors((prev) =>
      prev.map((s) =>
        s.id === sectorId
          ? {
              ...s,
              status: s.status === 'ACTIVE_RESONANCE' ? 'ONLINE' : 'ACTIVE_RESONANCE',
              processing_load: Math.min(95, s.processing_load + 15),
            }
          : s
      )
    );
  };

  return (
    <div className="space-y-4">
      {/* Topology Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 p-4 bg-[#0a0f1d] border border-[#1e293b] rounded-lg font-mono">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00ffcc] animate-pulse" />
            <h3 className="text-sm font-black text-[#00ffcc] tracking-wider uppercase">
              Tetrahedral Twin Topology Matrix
            </h3>
          </div>
          <p className="text-[11px] text-[#94a3b8] mt-0.5">
            Modulo-9 Plane Separation // Free-space Z₀: 376.5 Ω // Cadence: 3.69 Hz // Cycle: {activeHarmonicCycle}/9
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 bg-[#1e293b] text-[#38bdf8] rounded border border-[#38bdf8]/30 font-bold">
            M9 ROOT: {(activeHarmonicCycle % 9) + 1}
          </span>
          <span className="px-2.5 py-1 bg-[#0d1527] text-[#00ffcc] rounded border border-[#00ffcc]/30 font-bold">
            Z₀ = 376.5 Ω
          </span>
        </div>
      </div>

      {/* 2x2 Topology Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[#0a0f1d] text-[#00ffcc] font-mono rounded-lg border border-[#1e293b]">
        {sectors.map((sector) => {
          const isResonant = sector.status === 'ACTIVE_RESONANCE';
          const isSealed = sector.status === 'INVARIANT_SEALED';

          const statusColor = isResonant
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
            : isSealed
            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
            : 'bg-[#1e293b] text-[#38bdf8] border border-[#38bdf8]/30';

          return (
            <div
              key={sector.id}
              className={`p-4 border bg-[#0d1527] rounded-lg shadow-lg transition-all duration-300 relative overflow-hidden group ${
                isResonant
                  ? 'border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                  : isSealed
                  ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.15)]'
                  : 'border-[#1e293b] hover:border-[#00ffcc]/40'
              }`}
            >
              {/* Background Harmonic Pulse */}
              <div
                className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
                  isResonant ? 'bg-amber-500/10' : isSealed ? 'bg-emerald-500/10' : 'bg-cyan-500/5'
                }`}
              />

              <div className="flex justify-between items-center mb-2 relative z-10">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#64748b] bg-[#0a0f1d] px-1.5 py-0.5 rounded border border-[#1e293b]">
                    {sector.id}
                  </span>
                  <h2 className="text-xl font-bold tracking-wider text-white group-hover:text-[#00ffcc] transition-colors">
                    {sector.name}
                  </h2>
                </div>
                <button
                  onClick={() => triggerHarmonicResonance(sector.id)}
                  title="Click to toggle Harmonic Resonance lock"
                  className={`text-xs px-2.5 py-1 rounded font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 ${statusColor}`}
                >
                  {sector.status}
                </button>
              </div>

              <div className="text-xs text-[#94a3b8] mb-3 relative z-10 font-medium">
                {sector.title}
              </div>

              <div className="space-y-1.5 text-xs relative z-10 bg-[#0a0f1d]/60 p-2.5 rounded border border-[#1e293b]/60">
                <p>
                  <span className="text-[#f59e0b] font-bold">MODULO-9 ROOT:</span>{' '}
                  <span className="text-white font-bold">{sector.harmonic_m9}</span>{' '}
                  <span className="text-[#64748b]">//</span>{' '}
                  <span className="text-cyan-400">{sector.frequency_hz} Hz</span>
                </p>
                <p className="truncate">
                  <span className="text-[#64748b]">INTERFACE:</span>{' '}
                  <span className="text-gray-300 font-mono text-[11px]">{sector.pipe_interface}</span>
                </p>
                <p className="line-clamp-2">
                  <span className="text-[#64748b]">FUNCTION:</span>{' '}
                  <span className="text-gray-300">{sector.role}</span>
                </p>
              </div>

              <div className="mt-3 relative z-10">
                <div className="flex justify-between text-xs text-[#64748b] mb-1 font-mono">
                  <span>PROCESSING LOAD</span>
                  <span className={sector.processing_load > 80 ? 'text-amber-400 font-bold' : 'text-[#00ffcc]'}>
                    {sector.processing_load}%
                  </span>
                </div>
                <div className="w-full bg-[#1e293b] h-1.5 rounded overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      sector.processing_load > 80
                        ? 'bg-amber-400'
                        : isSealed
                        ? 'bg-emerald-400'
                        : 'bg-[#00ffcc]'
                    }`}
                    style={{ width: `${sector.processing_load}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
