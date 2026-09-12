import React, { useState, useEffect } from 'react';
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
import { TrendingUp, AlertTriangle } from 'lucide-react';
import { ThresholdConfig, DEFAULT_THRESHOLDS } from './ThresholdSettingsModal';
import { TelemetryPoint } from './TelemetryLineChart';

interface TelemetryForecastChartProps {
  thresholdConfig?: ThresholdConfig;
}

const ForecastTooltip = ({ active, payload, label, thresholdConfig }: any) => {
  if (active && payload && payload.length) {
    const hasCritical = payload.some((p: any) => {
      const val = typeof p.value === 'number' ? p.value : 0;
      if (p.name.includes('CPU')) return val >= thresholdConfig.cpuThreshold;
      if (p.name.includes('Memory')) return val >= thresholdConfig.ramThreshold;
      return false;
    });

    return (
      <div className={`bg-gray-950/95 border rounded-xl p-3 shadow-2xl font-mono text-xs transition-all ${
        hasCritical && thresholdConfig.highlightCriticalPoints ? 'border-orange-500/80 shadow-[0_0_25px_rgba(249,115,22,0.4)]' : 'border-indigo-500/40 shadow-[0_0_20px_rgba(99,102,241,0.25)]'
      }`}>
        <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-gray-800">
          <p className="text-[10px] text-gray-400 font-bold">FORECAST: {label}</p>
          {hasCritical && thresholdConfig.highlightCriticalPoints && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-orange-400 bg-orange-950/80 border border-orange-500/50 px-1.5 py-0.5 rounded">
              <AlertTriangle className="w-2.5 h-2.5" />
              BREACH RISK
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
                <span className="flex items-center gap-1.5" style={{ color: displayCritical ? '#f97316' : entry.color }}>
                  <span
                    className={`w-2 h-2 rounded-full inline-block ${displayCritical ? 'bg-orange-500 animate-pulse' : ''}`}
                    style={{ backgroundColor: displayCritical ? '#f97316' : entry.color }}
                  ></span>
                  {entry.name}:
                </span>
                <span className={`font-bold font-mono ${displayCritical ? 'text-orange-400 bg-orange-950/60 px-1 rounded border border-orange-800' : 'text-white'}`}>
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

export const TelemetryForecastChart: React.FC<TelemetryForecastChartProps> = ({
  thresholdConfig = DEFAULT_THRESHOLDS,
}) => {
  const [forecastData, setForecastData] = useState<TelemetryPoint[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchForecast = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/telemetry/forecast');
      if (res.ok) {
        const json = await res.json();
        if (json.points && Array.isArray(json.points)) {
          setForecastData(json.points);
        }
      }
    } catch (err) {
      console.error('Failed to fetch forecast:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForecast();
    // Refresh forecast every 1 minute
    const interval = setInterval(fetchForecast, 60000);
    return () => clearInterval(interval);
  }, []);

  const renderForecastDot = (props: any, dataKey: string) => {
    const { cx, cy, payload, index } = props;
    if (cx == null || cy == null) return null;
    
    const thresh = dataKey === 'cpu' ? thresholdConfig.cpuThreshold : thresholdConfig.ramThreshold;
    const isOver = payload && payload[dataKey] >= thresh;

    if (isOver && thresholdConfig.highlightCriticalPoints) {
      return (
        <g key={`forecast-${dataKey}-dot-${index}`}>
          <circle cx={cx} cy={cy} r={6} fill="#f97316" opacity={0.4}>
            <animate attributeName="r" values="4;8;4" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx={cx} cy={cy} r={3} fill="#f97316" stroke="#ffffff" strokeWidth={1} />
        </g>
      );
    }
    return <circle key={`forecast-${dataKey}-dot-${index}`} cx={cx} cy={cy} r={2} fill={dataKey === 'cpu' ? "#38bdf8" : "#a78bfa"} />;
  };

  // Check if forecast crosses thresholds
  const forecastBreachCpu = forecastData.some(d => d.cpu >= thresholdConfig.cpuThreshold);
  const forecastBreachRam = forecastData.some(d => d.ram >= thresholdConfig.ramThreshold);
  const hasForecastBreach = forecastBreachCpu || forecastBreachRam;

  return (
    <div className={`bg-gray-900/40 border rounded-2xl p-6 space-y-4 transition-colors ${
      hasForecastBreach ? 'border-orange-500/40 shadow-[0_0_20px_rgba(249,115,22,0.1)]' : 'border-indigo-500/20'
    }`}>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-indigo-500/20 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-5 h-5 ${hasForecastBreach ? 'text-orange-400' : 'text-indigo-400'}`} />
            <h2 className="text-xl font-bold font-mono tracking-wider text-white">1H PREDICTIVE FORECAST</h2>
          </div>
          <p className="text-sm text-gray-400 font-mono mt-1">
            Machine-learned capacity extrapolation based on historical trends
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-950/60 rounded border border-gray-800">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              {hasForecastBreach ? 'BREACH PREDICTED' : 'CAPACITY STABLE'}
            </span>
          </div>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full pt-1 relative">
        {isLoading && forecastData.length === 0 && (
          <div className="absolute inset-0 bg-gray-950/60 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl">
            <span className="text-xs font-mono text-indigo-400 animate-pulse">Generating predictive model...</span>
          </div>
        )}
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={forecastData}
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
            <Tooltip content={<ForecastTooltip thresholdConfig={thresholdConfig} />} />
            <Legend
              verticalAlign="top"
              align="right"
              wrapperStyle={{ paddingBottom: '8px', fontSize: '11px', fontFamily: 'monospace' }}
              formatter={(value) => <span className="text-gray-300 font-bold">{value}</span>}
            />

            {thresholdConfig.showReferenceLines && (
              <>
                <ReferenceLine
                  y={thresholdConfig.cpuThreshold}
                  stroke="#38bdf8"
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                  label={{ value: `CPU THRESHOLD ${thresholdConfig.cpuThreshold}%`, fill: "#38bdf8", fontSize: 9, position: "insideLeft", opacity: 0.5 }}
                />
                <ReferenceLine
                  y={thresholdConfig.ramThreshold}
                  stroke="#a78bfa"
                  strokeDasharray="3 3"
                  strokeOpacity={0.3}
                  label={{ value: `RAM THRESHOLD ${thresholdConfig.ramThreshold}%`, fill: "#a78bfa", fontSize: 9, position: "insideRight", opacity: 0.5 }}
                />
              </>
            )}

            <Line
              type="monotone"
              dataKey="cpu"
              name="Forecast CPU"
              stroke="#38bdf8"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={(props) => renderForecastDot(props, 'cpu')}
              activeDot={{ r: 5, fill: '#f97316', stroke: '#ffffff', strokeWidth: 1 }}
              isAnimationActive={true}
              animationDuration={1500}
            />
            <Line
              type="monotone"
              dataKey="ram"
              name="Forecast RAM"
              stroke="#a78bfa"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={(props) => renderForecastDot(props, 'ram')}
              activeDot={{ r: 5, fill: '#f97316', stroke: '#ffffff', strokeWidth: 1 }}
              isAnimationActive={true}
              animationDuration={1500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
