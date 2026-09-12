import React, { useState } from 'react';
import { Terminal, Trash2, Clock, ShieldAlert, CheckCircle2, Info, Search } from 'lucide-react';

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'critical' | 'success';
  message: string;
  source: string;
}

interface LogStreamProps {
  logs: SystemLog[];
  onClearLogs: () => void;
  autoClearEnabled: boolean;
  retentionDays: number;
}

export const LogStream: React.FC<LogStreamProps> = ({ logs, onClearLogs, autoClearEnabled, retentionDays }) => {
  const [filter, setFilter] = useState<'all' | 'warn' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter(log => {
    if (filter === 'warn' && log.level !== 'warn' && log.level !== 'critical') return false;
    if (filter === 'critical' && log.level !== 'critical') return false;
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      if (!log.message.toLowerCase().includes(query) && !log.source.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <ShieldAlert className="w-3.5 h-3.5 text-red-400" />;
      case 'warn': return <ShieldAlert className="w-3.5 h-3.5 text-yellow-400" />;
      case 'success': return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      default: return <Info className="w-3.5 h-3.5 text-cyan-400" />;
    }
  };

  const getLevelClass = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-950/40 border-red-500/30 text-red-300';
      case 'warn': return 'bg-yellow-950/40 border-yellow-500/30 text-yellow-300';
      case 'success': return 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300';
      default: return 'bg-gray-900/40 border-gray-700/50 text-gray-300';
    }
  };

  return (
    <div className="bg-gray-900/60 border border-gray-800 rounded-2xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-5 py-4 border-b border-gray-800 bg-gray-950/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase text-white tracking-wide flex items-center gap-2">
              System Event Stream
              {autoClearEnabled && (
                <span className="text-[9px] bg-cyan-950/80 border border-cyan-500/50 text-cyan-400 px-1.5 py-0.5 rounded font-mono">
                  Auto-Clear: {retentionDays}d
                </span>
              )}
            </h3>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
              Live telemetry &amp; threshold alerts ({logs.length} total)
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-48">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-700 text-gray-300 text-xs font-mono rounded-lg focus:outline-none focus:border-cyan-500 w-full"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="bg-gray-900 border border-gray-700 text-gray-300 text-xs font-mono rounded-lg px-2 py-1.5 focus:outline-none focus:border-cyan-500 flex-1 sm:flex-none"
            >
              <option value="all">All Events</option>
              <option value="warn">Warnings &amp; Critical</option>
              <option value="critical">Critical Only</option>
            </select>
            <button
              onClick={onClearLogs}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 hover:border-gray-500 text-gray-400 hover:text-white rounded-lg transition-colors text-xs font-bold uppercase"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* Log List */}
      <div className="flex-1 p-4 overflow-y-auto max-h-80 font-mono text-xs space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-gray-500 space-y-2">
            <Terminal className="w-6 h-6 opacity-50" />
            <p>No log events match the current filter.</p>
          </div>
        ) : (
          filteredLogs.map(log => (
            <div
              key={log.id}
              className={`flex items-start gap-3 p-2.5 rounded-lg border ${getLevelClass(log.level)} transition-colors`}
            >
              <div className="mt-0.5 flex-shrink-0">
                {getLevelIcon(log.level)}
              </div>
              <div className="flex-1 min-w-0 break-words">
                <div className="flex items-center gap-2 mb-1 opacity-70">
                  <Clock className="w-3 h-3" />
                  <span className="text-[10px]">{new Date(log.timestamp).toLocaleString()}</span>
                  <span className="text-[10px] uppercase font-bold bg-black/30 px-1 rounded">
                    {log.source}
                  </span>
                </div>
                <p className="leading-relaxed">{log.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
