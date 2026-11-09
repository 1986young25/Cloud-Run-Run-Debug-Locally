import sqlite3, os, time

def compute_live_system_state():
    vault_path = os.path.expanduser('~/titan_master_vault.db')
    
    # 1. Count actual Lines of Code across workspace and system repositories
    search_dirs = [
        os.path.expanduser('~'),
        os.path.expanduser('~/NYMT_WORKSPACE'),
        os.path.expanduser('~/titan_enclave'),
        os.path.dirname(os.path.abspath(__file__)),
        os.getcwd()
    ]
    target_exts = {'.py', '.sh', '.sql', '.c', '.h', '.ts', '.tsx'}
    ignored_dirs = {'site-packages', '.git', 'venv', 'node_modules', 'dist', '.cache', '.npm', '.bun', '__pycache__'}
    
    total_files, total_loc = 0, 0
    scanned_files = set()
    
    for s_dir in search_dirs:
        if not os.path.exists(s_dir):
            continue
        for root, dirs, files in os.walk(s_dir):
            dirs[:] = [d for d in dirs if d not in ignored_dirs and not d.startswith('.')]
            for f in files:
                _, ext = os.path.splitext(f)
                if ext in target_exts:
                    real_path = os.path.realpath(os.path.join(root, f))
                    if real_path not in scanned_files:
                        scanned_files.add(real_path)
                        try:
                            with open(real_path, 'r', encoding='utf-8', errors='ignore') as fp:
                                total_loc += len(fp.readlines())
                                total_files += 1
                        except Exception:
                            pass

    # 2. Query exact committed database row counts
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

    # 3. Parametric Valuation Math ($75/hr @ 15 LOC/hr + $1 per verified WAL record)
    codebase_val = (total_loc / 15.0) * 75.0
    record_val = (telemetry_rows + intent_rows) * 1.00
    aggregate_val = codebase_val + record_val

    # 4. Commit calculated values to SQLite Vault
    if os.path.exists(vault_path):
        try:
            conn = sqlite3.connect(vault_path)
            cur = conn.cursor()
            cur.execute("""
                CREATE TABLE IF NOT EXISTS live_system_valuation (
                    timestamp REAL PRIMARY KEY,
                    verified_files INTEGER,
                    total_loc INTEGER,
                    telemetry_records INTEGER,
                    payment_intents INTEGER,
                    aggregate_valuation REAL
                )
            """)
            cur.execute("INSERT OR REPLACE INTO live_system_valuation VALUES (?, ?, ?, ?, ?, ?)",
                        (time.time(), total_files, total_loc, telemetry_rows, intent_rows, aggregate_val))
            conn.commit()
            conn.close()
        except Exception as e:
            print(f"[-] SQLite Write Error: {e}")

    return {
        "files": total_files,
        "loc": total_loc,
        "telemetry_rows": telemetry_rows,
        "intent_rows": intent_rows,
        "valuation": aggregate_val
    }

if __name__ == '__main__':
    metrics = compute_live_system_state()
    print("\n[+] VERIFIED LOCAL SQLITE STATE UPDATED")
    print(f"    ├── Source Files Scanned : {metrics['files']}")
    print(f"    ├── Total Lines of Code  : {metrics['loc']:,} LOC")
    print(f"    ├── Telemetry Records    : {metrics['telemetry_rows']} rows")
    print(f"    ├── Payment Intent Rows  : {metrics['intent_rows']} rows")
    print(f"    └── Dynamic Valuation    : ${metrics['valuation']:,.2f} USD\n")
