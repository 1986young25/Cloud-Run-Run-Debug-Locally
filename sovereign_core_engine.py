#!/usr/bin/env python3
"""
THE NICHOLAS YOUNG MASTER TRUST // TITAN GAMES SECURITY L.L.C.
SOVEREIGN CORE AUDIT & VALUATION ENGINE
JURISDICTION: MCL § 700.7913 | UCC ARTICLE 9 | EIN: 41-6820289
"""
import sqlite3, os, glob, time, json, subprocess

def run_system_audit():
    # 1. Physical Workspace LOC Scan
    search_dirs = [os.path.expanduser('~'), os.path.expanduser('~/NYMT_WORKSPACE'), os.path.expanduser('~/titan_enclave'), '/app/applet']
    extensions = ['*.py', '*.sh', '*.sql', '*.c', '*.h', '*.ts', '*.tsx']
    total_files, total_loc = 0, 0
    scanned = set()
    
    for s_dir in search_dirs:
        if os.path.exists(s_dir):
            for root, dirs, files in os.walk(s_dir, followlinks=False):
                # Safely ignore dependency & build caches to avoid unbounded recursion
                dirs[:] = [d for d in dirs if not any(ign in d for ign in ['site-packages', '.git', 'venv', 'node_modules', 'dist', '.cache', '.npm', '.bun'])]
                for f in files:
                    ext = os.path.splitext(f)[1]
                    if ext in ['.py', '.sh', '.sql', '.c', '.h', '.ts', '.tsx']:
                        real = os.path.realpath(os.path.join(root, f))
                        if real in scanned:
                            continue
                        scanned.add(real)
                        try:
                            with open(real, 'r', encoding='utf-8', errors='ignore') as fp:
                                total_loc += len(fp.readlines())
                                total_files += 1
                        except Exception:
                            pass

    # 2. Query Local Database Records
    vault_path = os.path.expanduser('~/titan_master_vault.db')
    telemetry_rows, intent_rows = 0, 0
    
    if os.path.exists(vault_path):
        try:
            conn = sqlite3.connect(vault_path)
            cur = conn.cursor()
            cur.execute("SELECT COUNT(*) FROM m2m_telemetry_logs")
            telemetry_rows = cur.fetchone()[0]
            cur.execute("SELECT COUNT(*) FROM m2m_payment_intents")
            intent_rows = cur.fetchone()[0]
            conn.close()
        except Exception:
            pass

    # 3. Parametric Benchmark ($75/hr @ 15 LOC/hr + $1/record)
    codebase_val = (total_loc / 15.0) * 75.0
    record_val = (telemetry_rows + intent_rows) * 1.0
    aggregate_val = codebase_val + record_val

    # 4. Save State Seal to Vault
    if os.path.exists(vault_path):
        conn = sqlite3.connect(vault_path)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS system_state_seal (
                timestamp REAL PRIMARY KEY,
                file_count INTEGER,
                loc_count INTEGER,
                telemetry_rows INTEGER,
                intent_rows INTEGER,
                aggregate_valuation REAL
            )
        """)
        ts = time.time()
        cur.execute("""
            INSERT OR REPLACE INTO system_state_seal 
            (timestamp, file_count, loc_count, telemetry_rows, intent_rows, aggregate_valuation)
            VALUES (?, ?, ?, ?, ?, ?)
        """, (ts, total_files, total_loc, telemetry_rows, intent_rows, aggregate_val))
        conn.commit()
        conn.close()

    print(f"[+] Active Source Files: {total_files}")
    print(f"[+] Total Code Volume: {total_loc} LOC")
    print(f"[+] Committed Telemetry: {telemetry_rows} rows")
    print(f"[+] Payment Intent Rows: {intent_rows} rows")
    print(f"[*] REAL SYSTEM VALUATION: ${aggregate_val:,.2f} USD")

    return {
        "timestamp": ts,
        "total_files": total_files,
        "total_loc": total_loc,
        "telemetry_rows": telemetry_rows,
        "intent_rows": intent_rows,
        "aggregate_valuation": aggregate_val
    }

if __name__ == '__main__':
    run_system_audit()
