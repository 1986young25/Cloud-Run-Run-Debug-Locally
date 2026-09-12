import React, { useState, useEffect, useCallback, useRef } from 'react';
import { toPng } from 'html-to-image';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine
} from 'recharts';
import { AlertTriangle, Flame, ShieldAlert, CheckCircle2, Download, Camera } from 'lucide-react';
import { ThresholdConfig, DEFAULT_THRESHOLDS } from './ThresholdSettingsModal';

export interface TelemetryPoint {
  time: string;
  timestamp: string;
  cpu: number;
  ram: number;
  disk: number;
}

export type TelemetryTimeRange = 'realtime' | '1h' | '24h';

interface TelemetryLineChartProps {
  data: TelemetryPoint[];
  currentCpu: number;
  currentRam: number;
  currentDisk: number;
  stateHash: string;
  lastUpdated: string;
  selectedRange?: TelemetryTimeRange;
  onRangeChange?: (range: TelemetryTimeRange) => void;
  onInjectSpike?: (type: 'cpu' | 'ram' | 'both') => void;
  thresholdConfig?: ThresholdConfig;
}

const CustomTooltip = ({ active, payload, label, thresholdConfig }: any) => {
  if (active && payload && payload.length) {
    const hasCritical = payload.some((p: any) => {
      const val = typeof p.value === 'number' ? p.value : 0;
      if (p.name.includes('CPU')) return val >= thresholdConfig.cpuThreshold;
      if (p.name.includes('Memory')) return val >= thresholdConfig.ramThreshold;
      return false;
    });

    return (
      <div className={`bg-gray-950/95 border rounded-xl p-3 shadow-2xl font-mono text-xs transition-all ${
        hasCritical && thresholdConfig.highlightCriticalPoints ? 'border-red-500/80 shadow-[0_0_25px_rgba(239,68,68,0.4)]' : 'border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]'
      }`}>
        <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-gray-800">
          <p className="text-[10px] text-gray-400 font-bold">SAMPLE: {label}</p>
          {hasCritical && thresholdConfig.highlightCriticalPoints && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-950/80 border border-red-500/50 px-1.5 py-0.5 rounded">
              <AlertTriangle className="w-2.5 h-2.5" />
              CRITICAL
            </span>
          )}
        </div>
        <div className="space-y-1.5">
          {payload.map((entry: any, index: number) => {
            const isCpu = entry.name.includes('CPU');
            const thresh = isCpu ? thresholdConfig.cpuThreshold : thresholdConfig.ramThreshold;
            const isOver = typeof entry.value === 'number' && entry.value >= thresh;
            const displayCritical = isOver && thresholdConfig.highlightCriticalPoints;
            return (
              <div key={`item-${index}`} className="flex items-center justify-between gap-4">
                <span className="flex items-center gap-1.5" style={{ color: displayCritical ? '#ef4444' : entry.color }}>
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${displayCritical ? 'bg-red-500 animate-ping' : ''}`}
                    style={{ backgroundColor: displayCritical ? '#ef4444' : entry.color }}
                  ></span>
                  {entry.name}:
                </span>
                <span className={`font-bold font-mono ${displayCritical ? 'text-red-400 bg-red-950/60 px-1 rounded border border-red-800' : 'text-white'}`}>
                  {entry.value}% {displayCritical && '⚠️'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

export const TelemetryLineChart: React.FC<TelemetryLineChartProps> = ({
  data,
  currentCpu,
  currentRam,
  currentDisk,
  stateHash,
  lastUpdated,
  selectedRange: externalRange,
  onRangeChange,
  onInjectSpike,
  thresholdConfig = DEFAULT_THRESHOLDS,
}) => {
  const [internalRange, setInternalRange] = useState<TelemetryTimeRange>('realtime');
  const activeRange = externalRange || internalRange;

  const [historicalData, setHistoricalData] = useState<TelemetryPoint[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);
  const chartRef = useRef<HTMLDivElement>(null);

  const handleSnapshot = useCallback(async () => {
    if (chartRef.current === null) {
      return;
    }

    try {
      const dataUrl = await toPng(chartRef.current, { cacheBust: true, backgroundColor: '#111827' });
      const link = document.createElement('a');
      link.download = `telemetry_snapshot_${activeRange}_${new Date().toISOString()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to create snapshot', err);
    }
  }, [activeRange]);

  // Analyze if any data points exceed user-defined thresholds
  const criticalCpuPoints = data.filter(d => d.cpu >= thresholdConfig.cpuThreshold);
  const criticalRamPoints = data.filter(d => d.ram >= thresholdConfig.ramThreshold);
  const isSystemInCriticalAlert = thresholdConfig.showCriticalBanner && 
    (currentCpu >= thresholdConfig.cpuThreshold || 
     currentRam >= thresholdConfig.ramThreshold || 
     criticalCpuPoints.length > 0 || 
     criticalRamPoints.length > 0);

  // Fetch historical data when 1h or 24h is active
  const fetchRangeHistory = useCallback(async (range: TelemetryTimeRange) => {
    if (range === 'realtime') return;
    setIsLoadingHistory(true);
    try {
      const res = await fetch(`/api/telemetry/history?range=${range}`);
      if (res.ok) {
        const json = await res.json();
        if (json.points && Array.isArray(json.points)) {
          setHistoricalData(json.points);
        }
      }
    } catch (err) {
      console.error('Failed to fetch range history:', err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const handleRangeSelect = (range: TelemetryTimeRange) => {
    setInternalRange(range);
    if (onRangeChange) {
      onRangeChange(range);
    }
    if (range !== 'realtime') {
      fetchRangeHistory(range);
    }
  };

  useEffect(() => {
    if (activeRange !== 'realtime') {
      fetchRangeHistory(activeRange);
    }
  }, [activeRange, fetchRangeHistory]);

  // Determine which dataset to display
  const displayData = activeRange === 'realtime' ? data : (historicalData.length > 0 ? historicalData : data);

  const handleExportCsv = () => {
    const headers = ["time", "timestamp", "cpu", "ram", "disk"];
    const csvContent = [
      headers.join(","),
      ...displayData.map(d => [d.time, d.timestamp, d.cpu, d.ram, d.disk].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `telemetry_export_${activeRange}_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute summary stats for current view
  const cpuValues = displayData.map(d => d.cpu);
  const ramValues = displayData.map(d => d.ram);
  const avgCpu = cpuValues.length ? (cpuValues.reduce((a, b) => a + b, 0) / cpuValues.length).toFixed(1) : '0.0';
  const maxCpu = cpuValues.length ? Math.max(...cpuValues).toFixed(1) : '0.0';
  const avgRam = ramValues.length ? (ramValues.reduce((a, b) => a + b, 0) / ramValues.length).toFixed(1) : '0.0';
  const maxRam = ramValues.length ? Math.max(...ramValues).toFixed(1) : '0.0';

  // Custom Dot Renderer for CPU line
  const renderCpuDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    if (cx == null || cy == null) return null;
    const isOver = payload && payload.cpu >= thresholdConfig.cpuThreshold;

    if (isOver && thresholdConfig.highlightCriticalPoints) {
      return (
        <g key={`cpu-critical-dot-${index}`}>
          <circle cx={cx} cy={cy} r={10} fill="#ef4444" opacity={0.3}>
            <animate attributeName="r" values="7;12;7" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
        </g>
      );
    }
    return <circle key={`cpu-dot-${index}`} cx={cx} cy={cy} r={activeRange === '24h' ? 3.5 : 3} fill="#06b6d4" />;
  };

  // Custom Dot Renderer for Memory/RAM line
  const renderRamDot = (props: any) => {
    const { cx, cy, payload, index } = props;
    if (cx == null || cy == null) return null;
    const isOver = payload && payload.ram >= thresholdConfig.ramThreshold;

    if (isOver && thresholdConfig.highlightCriticalPoints) {
      return (
        <g key={`ram-critical-dot-${index}`}>
          <circle cx={cx} cy={cy} r={10} fill="#ef4444" opacity={0.3}>
            <animate attributeName="r" values="7;12;7" dur="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.1;0.4" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r={6} fill="#ef4444" stroke="#ffffff" strokeWidth={2} />
        </g>
      );
    }
    return <circle key={`ram-dot-${index}`} cx={cx} cy={cy} r={activeRange === '24h' ? 3.5 : 3} fill="#818cf8" />;
  };

  return (
    <div ref={chartRef} className={`bg-gray-900/60 border rounded-2xl p-6 space-y-4 transition-colors ${
      isSystemInCriticalAlert ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-cyan-500/30'
    }`}>
      {/* Header with Title, Status & Range Selector */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-cyan-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${
              isSystemInCriticalAlert 
                ? 'bg-red-500 animate-ping shadow-[0_0_12px_rgba(239,68,68,0.9)]' 
                : activeRange === 'realtime' 
                  ? 'bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(6,182,212,0.8)]' 
                  : 'bg-green-400'
            }`}></div>
            <span className={`text-[10px] font-bold uppercase tracking-[0.3em] ${
              isSystemInCriticalAlert ? 'text-red-400' : 'text-cyan-400'
            }`}>
              {isSystemInCriticalAlert ? 'THRESHOLD WARNING ACTIVE' : 'System Telemetry Visualizer'}
            </span>
          </div>
          <h2 className="text-lg font-black tracking-tight text-white uppercase mt-0.5 flex items-center gap-2">
            CPU &amp; Memory <span className={isSystemInCriticalAlert ? 'text-red-400' : 'text-cyan-400'}>Load Matrix</span>
            {isSystemInCriticalAlert && (
              <span className="text-xs bg-red-950/80 border border-red-500/70 text-red-300 font-mono px-2 py-0.5 rounded uppercase flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                Critical Exceeded
              </span>
            )}
          </h2>
          <p className="text-[10px] text-gray-400 font-mono">
            Endpoint: <span className="text-cyan-300">/api/telemetry/system</span> | State Hash: <span className="text-cyan-300 font-bold">{stateHash}</span>
          </p>
        </div>

        {/* Controls: Time Range Selector + Live Stats */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          
          {/* Time Range Selector Buttons & Export */}
          <div className="flex items-center bg-black/60 border border-gray-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => handleRangeSelect('realtime')}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase rounded-lg transition-all ${
                activeRange === 'realtime'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              Real-Time
            </button>
            <button
              onClick={() => handleRangeSelect('1h')}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase rounded-lg transition-all ${
                activeRange === '1h'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              1 Hour
            </button>
            <button
              onClick={() => handleRangeSelect('24h')}
              className={`px-3 py-1 text-xs font-mono font-bold uppercase rounded-lg transition-all ${
                activeRange === '24h'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
              }`}
            >
              24 Hours
            </button>
            <div className="w-px h-4 bg-gray-800 mx-1"></div>
            <button
              onClick={handleSnapshot}
              title="Capture Image Snapshot"
              className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-950/50 rounded-lg transition-all"
            >
              <Camera className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportCsv}
              title="Export visible data to CSV"
              className="p-1.5 text-gray-400 hover:text-cyan-400 hover:bg-cyan-950/50 rounded-lg transition-all"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          {/* Real-time stats pill with Warning highlighting */}
          <div className="flex items-center gap-3 bg-black/60 border border-gray-800 rounded-xl px-3 py-1.5 font-mono text-xs">
            <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-colors ${
              currentCpu >= 90 ? 'bg-red-950/80 border border-red-500/80 text-red-400 font-bold' : ''
            }`}>
              <span className={`w-2 h-2 rounded-full ${currentCpu >= 90 ? 'bg-red-500 animate-ping' : 'bg-cyan-400'}`}></span>
              <span className="text-gray-400 text-[10px]">CPU:</span>
              <span className={currentCpu >= 90 ? 'text-red-400 font-black' : 'text-cyan-300 font-bold'}>
                {currentCpu.toFixed(1)}%
              </span>
            </div>
            
            <div className={`flex items-center gap-1.5 px-1.5 py-0.5 rounded transition-colors ${
              currentRam >= 90 ? 'bg-red-950/80 border border-red-500/80 text-red-400 font-bold' : ''
            }`}>
              <span className={`w-2 h-2 rounded-full ${currentRam >= 90 ? 'bg-red-500 animate-ping' : 'bg-indigo-400'}`}></span>
              <span className="text-gray-400 text-[10px]">RAM:</span>
              <span className={currentRam >= 90 ? 'text-red-400 font-black' : 'text-indigo-300 font-bold'}>
                {currentRam.toFixed(1)}%
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span className="text-gray-400 text-[10px]">DISK:</span>
              <span className="text-emerald-300 font-bold">{currentDisk.toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Warning System Alert Banner */}
      {isSystemInCriticalAlert && (
        <div className="bg-gradient-to-r from-red-950/90 via-red-900/60 to-red-950/90 border-2 border-red-500/80 rounded-xl p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_25px_rgba(239,68,68,0.3)] animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-600/30 border border-red-500 rounded-lg text-red-400">
              <Flame className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-red-200 flex items-center gap-1.5">
                CRITICAL THRESHOLD EXCEEDED (&gt;90% USAGE)
              </h4>
              <p className="text-[11px] text-red-300/90 font-mono">
                {criticalCpuPoints.length > 0 && `CPU exceeded 90% in ${criticalCpuPoints.length} frame(s) (Peak: ${maxCpu}%). `}
                {criticalRamPoints.length > 0 && `Memory exceeded 90% in ${criticalRamPoints.length} frame(s) (Peak: ${maxRam}%). `}
                Active points highlighted in <span className="text-red-400 font-bold underline decoration-red-400">RED</span> on line chart.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 bg-red-500 text-black text-[10px] font-black uppercase rounded shadow font-mono tracking-widest">
              DEFCON 1 LOAD
            </span>
          </div>
        </div>
      )}

      {/* Aggregate Range Summary Metrics Banner & Spike Test Injector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-black/40 border border-gray-800/70 rounded-xl p-2.5 text-xs font-mono">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 flex-1">
          <div className={`flex items-center justify-between px-2 py-1 rounded border ${
            parseFloat(avgCpu) >= 90 ? 'bg-red-950/60 border-red-700 text-red-300' : 'bg-gray-950/60 border-cyan-950'
          }`}>
            <span className="text-gray-400 text-[10px]">AVG CPU:</span>
            <span className={`font-bold ${parseFloat(avgCpu) >= 90 ? 'text-red-400' : 'text-cyan-300'}`}>{avgCpu}%</span>
          </div>
          <div className={`flex items-center justify-between px-2 py-1 rounded border ${
            parseFloat(maxCpu) >= 90 ? 'bg-red-950/60 border-red-700 text-red-300 font-bold animate-pulse' : 'bg-gray-950/60 border-cyan-950'
          }`}>
            <span className="text-gray-400 text-[10px]">PEAK CPU:</span>
            <span className={`font-bold ${parseFloat(maxCpu) >= 90 ? 'text-red-400' : 'text-cyan-400'}`}>{maxCpu}%</span>
          </div>
          <div className={`flex items-center justify-between px-2 py-1 rounded border ${
            parseFloat(avgRam) >= 90 ? 'bg-red-950/60 border-red-700 text-red-300' : 'bg-gray-950/60 border-indigo-950'
          }`}>
            <span className="text-gray-400 text-[10px]">AVG RAM:</span>
            <span className={`font-bold ${parseFloat(avgRam) >= 90 ? 'text-red-400' : 'text-indigo-300'}`}>{avgRam}%</span>
          </div>
          <div className={`flex items-center justify-between px-2 py-1 rounded border ${
            parseFloat(maxRam) >= 90 ? 'bg-red-950/60 border-red-700 text-red-300 font-bold animate-pulse' : 'bg-gray-950/60 border-indigo-950'
          }`}>
            <span className="text-gray-400 text-[10px]">PEAK RAM:</span>
            <span className={`font-bold ${parseFloat(maxRam) >= 90 ? 'text-red-400' : 'text-indigo-400'}`}>{maxRam}%</span>
          </div>
        </div>

        {/* Warning Threshold Line Toggle & Simulation Trigger */}
        <div className="flex items-center gap-1.5 pl-0 sm:pl-2 border-t sm:border-t-0 sm:border-l border-gray-800">
          {onInjectSpike && (
            <button
              onClick={() => onInjectSpike('cpu')}
              className="px-2 py-1 bg-red-900/60 hover:bg-red-800 border border-red-600 text-red-200 text-[10px] font-bold uppercase rounded transition-colors flex items-center gap-1"
              title="Trigger a simulated load surge"
            >
              <Flame className="w-2.5 h-2.5 text-red-400" />
              Test Spike
            </button>
          )}
        </div>
      </div>

      {/* Recharts Line Chart Container */}
      <div className="h-64 sm:h-72 w-full pt-1 relative">
        {isLoadingHistory && (
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
            <span className="text-xs font-mono text-cyan-400 animate-pulse">Syncing range history telemetry...</span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={displayData}
            margin={{ top: 15, right: 15, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
            <XAxis
              dataKey="time"
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#374151' }}
              tick={{ fill: '#9ca3af', fontFamily: 'monospace' }}
            />
            <YAxis
              domain={[0, 100]}
              stroke="#6b7280"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#374151' }}
              tick={{ fill: '#9ca3af', fontFamily: 'monospace' }}
              unit="%"
            />
            <Tooltip content={<CustomTooltip thresholdConfig={thresholdConfig} />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              formatter={(value) => <span className="text-gray-300 font-bold">{value}</span>}
            />

            {/* Critical Threshold Reference Line */}
            {thresholdConfig.showReferenceLines && (
              <>
                <ReferenceLine
                  y={thresholdConfig.cpuThreshold}
                  stroke="#06b6d4"
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                  label={{ value: `CPU ${thresholdConfig.cpuThreshold}%`, fill: "#06b6d4", fontSize: 9, position: "insideLeft", opacity: 0.5 }}
                />
                <ReferenceLine
                  y={thresholdConfig.ramThreshold}
                  stroke="#818cf8"
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                  label={{ value: `RAM ${thresholdConfig.ramThreshold}%`, fill: "#818cf8", fontSize: 9, position: "insideRight", opacity: 0.5 }}
                />
              </>
            )}

            <Line
              type="monotone"
              dataKey="cpu"
              name="CPU Utilization"
              stroke="#06b6d4"
              strokeWidth={2.5}
              dot={renderCpuDot}
              activeDot={{ r: 7, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 2 }}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="ram"
              name="Memory (RAM)"
              stroke="#818cf8"
              strokeWidth={2.5}
              dot={renderRamDot}
              activeDot={{ r: 7, fill: '#ef4444', stroke: '#ffffff', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Info with Status */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-[10px] text-gray-500 font-mono pt-2 border-t border-gray-800/80">
        <div className="flex items-center gap-2">
          <span className={`w-1.5 h-1.5 rounded-full ${
            isSystemInCriticalAlert 
              ? 'bg-red-500 animate-ping' 
              : activeRange === 'realtime' 
                ? 'bg-cyan-400 animate-pulse' 
                : 'bg-green-400'
          }`}></span>
          <span>
            {activeRange === 'realtime' && 'Buffer: Rolling 20-Sample Window (3s intervals)'}
            {activeRange === '1h' && 'Buffer: 1-Hour Aggregated Window (3m intervals, 21 samples)'}
            {activeRange === '24h' && 'Buffer: 24-Hour Historical Ledger (1h intervals, 25 samples)'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block"></span>
            <span className="text-red-400 font-bold">&gt;90% Red Warning Dots</span>
          </span>
          <span>Last Sync: {lastUpdated || 'Active Sampling'}</span>
        </div>
      </div>
    </div>
  );
};

export default TelemetryLineChart;

