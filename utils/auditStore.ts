export type AuditListener = (logs: AuditLogEntry[]) => void;

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  target: string;
  complianceCode: string;
}

let logs: AuditLogEntry[] = [
  { 
    id: 'initial-2', 
    timestamp: new Date(Date.now() - 5000).toISOString(), 
    action: 'DCI_VAULT_SEALED', 
    target: 'State Integrity', 
    complianceCode: 'UCC-CER-NYMT-XB6' 
  },
  { 
    id: 'initial-1', 
    timestamp: new Date(Date.now() - 15000).toISOString(), 
    action: 'SYSTEM_BOOT', 
    target: 'Titan Unified Core', 
    complianceCode: 'MCL § 700.7913' 
  }
];
let listeners: AuditListener[] = [];

export const auditStore = {
  getLogs: () => logs,
  addLog: (action: string, target: string, complianceCode: string) => {
    const newLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toISOString(),
      action,
      target,
      complianceCode
    };
    logs = [newLog, ...logs].slice(0, 100);
    listeners.forEach(l => l(logs));
  },
  subscribe: (l: AuditListener) => {
    listeners.push(l);
    return () => { listeners = listeners.filter(cb => cb !== l); };
  }
};
