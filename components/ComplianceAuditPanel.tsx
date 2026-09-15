import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, FileText, Activity, Server, FileBadge } from 'lucide-react';
import { auditStore, AuditLogEntry } from '../utils/auditStore';

export const ComplianceAuditPanel: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(auditStore.getLogs());

  useEffect(() => {
    const unsubscribe = auditStore.subscribe(setLogs);
    return unsubscribe;
  }, []);

  return (
    <div className="h-full bg-gray-950 text-gray-100 p-6 md:p-8 overflow-y-auto font-mono">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-red-500/20 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-8 h-8 text-red-500" />
              <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white leading-none">
                Compliance <span className="text-red-500">Audit</span> Log
              </h1>
            </div>
            <p className="text-xs text-red-500/80 uppercase tracking-widest font-bold">
              Automated Fiduciary & Legal Compliance Ledger
            </p>
          </div>
          <div className="bg-red-950/30 border border-red-900 p-3 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded bg-red-900/50 flex items-center justify-center border border-red-500/30">
              <FileBadge className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-[10px] text-red-400 uppercase font-bold tracking-widest">Active Standard</p>
              <p className="text-xs font-black text-white">MCL § 700.7913</p>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-red-950/20 border border-red-900/40 rounded-xl p-4 flex gap-4">
          <Activity className="w-5 h-5 text-red-500 shrink-0" />
          <p className="text-[11px] text-gray-400 leading-relaxed max-w-3xl">
            This module captures real-time user interaction events and automatically maps them to appropriate fiduciary and compliance schemas. All actions are cryptographically sealed in the mock ledger for internal audit review.
          </p>
        </div>

        {/* Log Table */}
        <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-800 bg-gray-900/80 text-[10px] uppercase tracking-widest font-bold text-gray-500">
            <div className="col-span-3">Timestamp (UTC)</div>
            <div className="col-span-3">Event Action</div>
            <div className="col-span-3">Target/Context</div>
            <div className="col-span-3">Compliance/Statute</div>
          </div>
          
          <div className="divide-y divide-gray-800">
            <AnimatePresence initial={false}>
              {logs.map((log) => (
                <motion.div 
                  key={log.id}
                  initial={{ opacity: 0, backgroundColor: 'rgba(239, 68, 68, 0.2)' }}
                  animate={{ opacity: 1, backgroundColor: 'transparent' }}
                  transition={{ duration: 0.5 }}
                  className="grid grid-cols-12 gap-4 p-4 text-xs items-center hover:bg-gray-800/30 transition-colors"
                >
                  <div className="col-span-3 text-gray-400">
                    {new Date(log.timestamp).toISOString().replace('T', ' ').substring(0, 19)}
                  </div>
                  <div className="col-span-3">
                    <span className="bg-gray-950 border border-gray-700 text-gray-300 px-2 py-1 rounded text-[10px] font-bold tracking-wider">
                      {log.action}
                    </span>
                  </div>
                  <div className="col-span-3 text-gray-300 truncate pr-2" title={log.target}>
                    {log.target}
                  </div>
                  <div className="col-span-3 text-red-400 font-bold">
                    {log.complianceCode}
                  </div>
                </motion.div>
              ))}
              {logs.length === 0 && (
                <div className="p-8 text-center text-gray-500 text-xs">
                  No audit events recorded yet.
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
