import React, { useState } from 'react';
import { Settings, X, AlertTriangle, Sliders, RotateCcw, Check, Sparkles, Database, Zap, Link } from 'lucide-react';

export interface ThresholdConfig {
  cpuThreshold: number;
  ramThreshold: number;
  showReferenceLines: boolean;
  highlightCriticalPoints: boolean;
  showCriticalBanner: boolean;
  autoClearLogs: boolean;
  logRetentionDays: number;
  enableWebhook: boolean;
  webhookUrl: string;
  autoResetNodes: boolean;
}

export const DEFAULT_THRESHOLDS: ThresholdConfig = {
  cpuThreshold: 90,
  ramThreshold: 90,
  showReferenceLines: true,
  highlightCriticalPoints: true,
  showCriticalBanner: true,
  autoClearLogs: true,
  logRetentionDays: 7,
  enableWebhook: false,
  webhookUrl: '',
  autoResetNodes: false,
};

interface ThresholdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ThresholdConfig;
  onSave: (newConfig: ThresholdConfig) => void;
}

export const ThresholdSettingsModal: React.FC<ThresholdSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [localConfig, setLocalConfig] = useState<ThresholdConfig>(config);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);

  React.useEffect(() => {
    if (isOpen) {
      setLocalConfig(config);
      setSavedFeedback(false);
    }
  }, [isOpen, config]);

  if (!isOpen) return null;

  const handlePreset = (cpu: number, ram: number) => {
    setLocalConfig(prev => ({
      ...prev,
      cpuThreshold: cpu,
      ramThreshold: ram,
    }));
  };

  const handleSave = () => {
    onSave(localConfig);
    setSavedFeedback(true);
    setTimeout(() => {
      onClose();
    }, 400);
  };

  const handleReset = () => {
    setLocalConfig(DEFAULT_THRESHOLDS);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl bg-gray-950 border border-cyan-500/40 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden font-mono text-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-gray-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-cyan-950/80 border border-cyan-500/50 rounded-xl text-cyan-400">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">
                  Telemetry Engine
                </span>
                <span className="text-[9px] bg-red-950/70 border border-red-500/40 text-red-300 px-1.5 py-0.5 rounded font-bold uppercase">
                  Alert Config
                </span>
              </div>
              <h3 className="text-base font-black uppercase text-white tracking-wide">
                Warning Threshold Settings
              </h3>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Quick Presets */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Quick Threshold Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handlePreset(75, 75)}
                className={`p-2 rounded-xl border text-left transition-all ${
                  localConfig.cpuThreshold === 75 && localConfig.ramThreshold === 75
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                }`}
              >
                <div className="text-[10px] uppercase font-bold">Sensitive</div>
                <div className="text-sm font-black text-white">75% Load</div>
              </button>
              <button
                type="button"
                onClick={() => handlePreset(90, 90)}
                className={`p-2 rounded-xl border text-left transition-all ${
                  localConfig.cpuThreshold === 90 && localConfig.ramThreshold === 90
                    ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                    : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200'
                }`}
              >
                <div className="text-[10px] uppercase font-bold">Default</div>
                <div className="text-sm font-black text-white">90% Load</div>
              </button>
            </div>
          </div>

          <div className="bg-gray-900/70 border border-cyan-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
                <span className="text-xs font-bold uppercase text-white">CPU Threshold</span>
              </div>
              <div className="flex items-center gap-1 bg-black border border-cyan-500/40 px-2.5 py-1 rounded-lg">
                <input
                  type="number" min="50" max="99"
                  value={localConfig.cpuThreshold}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, cpuThreshold: Number(e.target.value) || 50 }))}
                  className="w-10 bg-transparent text-right font-black text-cyan-300 text-sm focus:outline-none"
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
            </div>
            <input
              type="range" min="50" max="99" step="1"
              value={localConfig.cpuThreshold}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, cpuThreshold: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>

          <div className="bg-gray-900/70 border border-indigo-500/20 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span>
                <span className="text-xs font-bold uppercase text-white">RAM Threshold</span>
              </div>
              <div className="flex items-center gap-1 bg-black border border-indigo-500/40 px-2.5 py-1 rounded-lg">
                <input
                  type="number" min="50" max="99"
                  value={localConfig.ramThreshold}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, ramThreshold: Number(e.target.value) || 50 }))}
                  className="w-10 bg-transparent text-right font-black text-indigo-300 text-sm focus:outline-none"
                />
                <span className="text-xs text-gray-400">%</span>
              </div>
            </div>
            <input
              type="range" min="50" max="99" step="1"
              value={localConfig.ramThreshold}
              onChange={(e) => setLocalConfig(prev => ({ ...prev, ramThreshold: Number(e.target.value) }))}
              className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-indigo-400"
            />
          </div>

          <div className="bg-black/40 border border-gray-800 rounded-xl p-4 space-y-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              Log Persistence Policy
            </div>
            <div className="space-y-3">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-gray-300 group-hover:text-white">Auto-Clear Old Logs</span>
                <input
                  type="checkbox"
                  checked={localConfig.autoClearLogs}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, autoClearLogs: e.target.checked }))}
                  className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-cyan-500 focus:ring-0 cursor-pointer"
                />
              </label>
              {localConfig.autoClearLogs && (
                <div className="flex items-center justify-between pl-2 border-l-2 border-gray-800 ml-1">
                  <span className="text-xs text-gray-400">Retention Period (Days)</span>
                  <div className="flex items-center gap-1 bg-gray-900 border border-gray-700 px-2.5 py-1 rounded-lg">
                    <input
                      type="number" min="1" max="90"
                      value={localConfig.logRetentionDays}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, logRetentionDays: Number(e.target.value) || 7 }))}
                      className="w-10 bg-transparent text-right font-bold text-gray-300 text-xs focus:outline-none"
                    />
                    <span className="text-[10px] text-gray-500">d</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Automated Actions */}
          <div className="bg-black/40 border border-gray-800 rounded-xl p-4 space-y-4">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              Automated Response Actions
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="flex items-center justify-between cursor-pointer group">
                  <span className="text-xs text-gray-300 group-hover:text-white">Execute Webhook on Breach</span>
                  <input
                    type="checkbox"
                    checked={localConfig.enableWebhook}
                    onChange={(e) => setLocalConfig(prev => ({ ...prev, enableWebhook: e.target.checked }))}
                    className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-cyan-500 focus:ring-0 cursor-pointer"
                  />
                </label>
                {localConfig.enableWebhook && (
                  <div className="flex items-center gap-2 pl-2 border-l-2 border-gray-800 ml-1">
                    <Link className="w-4 h-4 text-gray-500" />
                    <input
                      type="url"
                      placeholder="https://api.endpoint.com/webhook"
                      value={localConfig.webhookUrl}
                      onChange={(e) => setLocalConfig(prev => ({ ...prev, webhookUrl: e.target.value }))}
                      className="w-full bg-gray-900 border border-gray-700 text-gray-300 text-xs rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                  </div>
                )}
              </div>
              <label className="flex items-center justify-between cursor-pointer group pt-2 border-t border-gray-800/50">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-300 group-hover:text-white">Auto-Reset Distressed Nodes</span>
                  <span className="text-[9px] text-gray-500 mt-0.5">Triggers hardware restart logic if load exceeds 98%</span>
                </div>
                <input
                  type="checkbox"
                  checked={localConfig.autoResetNodes}
                  onChange={(e) => setLocalConfig(prev => ({ ...prev, autoResetNodes: e.target.checked }))}
                  className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-red-500 focus:ring-0 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between px-6 py-4 border-t border-cyan-500/20 bg-gray-900/80">
          <button type="button" onClick={handleReset} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> Reset Defaults
          </button>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-4 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors">Cancel</button>
            <button type="button" onClick={handleSave} className="flex items-center gap-1.5 px-5 py-1.5 text-xs font-bold uppercase rounded-xl transition-all bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]">
              {savedFeedback ? <><Check className="w-4 h-4" /> Applied</> : 'Save & Apply'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
