#!/usr/bin/env python3
"""
THE NICHOLAS YOUNG MASTER TRUST // TITAN GAMES SECURITY L.L.C.
UNLIMITED DEEP-SYSTEM & ALL-DATABASE AUDIT ENGINE
JURISDICTION: MCL § 700.7913 | UCC ARTICLE 9 | EIN: 41-6820289
"""

import sqlite3
import os
import glob
import time

def execute_complete_audit():
    print("================================================================================")
    print("           UNLIMITED DEEP-SYSTEM & ALL-DATABASE AUDIT ENGINE                   ")
    print("================================================================================")
    
    # 1. SCAN EVERY SINGLE SOURCE FILE IN THE ENTIRE DIRECTORY TREE
    search_dirs = [os.path.expanduser('~'), '/app/applet']
    extensions = ['.py', '.sh', '.sql', '.c', '.h', '.js', '.jsx', '.ts', '.tsx', '.json', '.html']
    total_files = 0
    total_loc = 0
    scanned_files = set()
    
    print("\n[1] SCANNING COMPLETE DIRECTORY TREE...")
    for s_dir in search_dirs:
        if not os.path.exists(s_dir):
            continue
        for root, dirs, files in os.walk(s_dir, followlinks=False):
            # Skip package managers, cache, and build blobs to count authentic written source code
            dirs[:] = [d for d in dirs if not any(ign in d for ign in ['node_modules', '.git', 'venv', '.cache', '.bun', '.npm', '.playwright', 'dist', 'build'])]
            if any(ign in root for ign in ['node_modules', '.git', 'venv', '.cache', '.bun', '.npm', '.playwright', 'dist', 'build']):
                continue
            for file in files:
                ext = os.path.splitext(file)[1]
                if ext in extensions:
                    full_path = os.path.join(root, file)
                    real_path = os.path.realpath(full_path)
                    if real_path in scanned_files:
                        continue
                    scanned_files.add(real_path)
                    try:
                        with open(real_path, 'r', encoding='utf-8', errors='ignore') as fp:
                            lines = len(fp.readlines())
                            total_loc += lines
                            total_files += 1
                    except Exception:
                        pass

    print(f"    ├── Total Active Source Files : {total_files:,}")
    print(f"    └── Total Line Count (LOC)    : {total_loc:,}")

    # 2. DISCOVER & AUDIT ALL SQLITE DATABASES IN SYSTEM
    print("\n[2] DISCOVERING & AUDITING ALL SQLITE DATABASES...")
    db_candidates = set()
    for s_dir in search_dirs:
        if not os.path.exists(s_dir):
            continue
        for root, dirs, files in os.walk(s_dir, followlinks=False):
            dirs[:] = [d for d in dirs if not any(ign in d for ign in ['node_modules', '.git', 'venv', '.cache', '.bun', '.npm', '.playwright', 'dist', 'build'])]
            for file in files:
                if file.endswith(('.db', '.sqlite', '.sqlite3')):
                    real_db = os.path.realpath(os.path.join(root, file))
                    db_candidates.add(real_db)

    total_dbs = 0
    total_tables = 0
    total_rows = 0

    for db_path in sorted(db_candidates):
        if not os.path.exists(db_path) or os.path.getsize(db_path) == 0:
            continue
        try:
            conn = sqlite3.connect(db_path)
            cur = conn.cursor()
            cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';")
            tables = [r[0] for r in cur.fetchall()]
            total_dbs += 1
            print(f"    ├── Database: {db_path} ({os.path.getsize(db_path):,} bytes)")
            for tbl in tables:
                try:
                    cur.execute(f'SELECT COUNT(*) FROM "{tbl}"')
                    r_count = cur.fetchone()[0]
                    total_tables += 1
                    total_rows += r_count
                    print(f"    │   ├── Table: {tbl} ({r_count:,} rows)")
                except Exception as te:
                    print(f"    │   ├── Table: {tbl} (Error: {te})")
            conn.close()
        except Exception as de:
            print(f"    ├── Database: {db_path} (Failed to inspect: {de})")

    print(f"    ├── Total Active Databases    : {total_dbs:,}")
    print(f"    ├── Total Managed Tables      : {total_tables:,}")
    print(f"    └── Total Committed Records   : {total_rows:,}")

    # 3. PARAMETRIC SYSTEM BENCHMARK VALUATION
    print("\n[3] PARAMETRIC SYSTEM BENCHMARK VALUATION...")
    codebase_val = (total_loc / 15.0) * 75.0  # $75/hr @ 15 LOC/hr = $5.00/LOC
    record_val = total_rows * 1.0            # $1.00 per record
    schema_val = total_tables * 100.0        # $100.00 per verified table
    full_valuation = codebase_val + record_val + schema_val

    print(f"    ├── Codebase Footprint ($5.00/LOC)   : ${codebase_val:,.2f} USD")
    print(f"    ├── DB Record Density ($1.00/row)    : ${record_val:,.2f} USD")
    print(f"    ├── DB Schema Footprint ($100/table) : ${schema_val:,.2f} USD")
    print(f"    └── TOTAL SYSTEMIC VALUATION         : ${full_valuation:,.2f} USD")

    # 4. COMMITTING AUDIT SEAL TO MASTER VAULT
    print("\n[4] COMMITTING AUDIT SEAL TO MASTER VAULT...")
    vault_path = os.path.expanduser('~/titan_master_vault.db')
    ts = time.time()
    try:
        conn = sqlite3.connect(vault_path)
        cur = conn.cursor()
        cur.execute("""
            CREATE TABLE IF NOT EXISTS master_sovereign_audit (
                timestamp REAL PRIMARY KEY,
                total_files INTEGER,
                total_loc INTEGER,
                total_dbs INTEGER,
                total_tables INTEGER,
                total_rows INTEGER,
                full_valuation REAL
            )
        """)
        cur.execute("""
            INSERT OR REPLACE INTO master_sovereign_audit
            (timestamp, total_files, total_loc, total_dbs, total_tables, total_rows, full_valuation)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (ts, total_files, total_loc, total_dbs, total_tables, total_rows, full_valuation))
        conn.commit()
        conn.close()
        print(f"    └── Audit Seal Recorded to {vault_path} (Table: master_sovereign_audit)")
    except Exception as ve:
        print(f"    └── Failed to record to vault: {ve}")

    print("\n================================================================================")
    print("                    SOVEREIGN AUDIT EXECUTION COMPLETE                          ")
    print("================================================================================")

    return {
        "timestamp": ts,
        "total_files": total_files,
        "total_loc": total_loc,
        "total_dbs": total_dbs,
        "total_tables": total_tables,
        "total_rows": total_rows,
        "full_valuation": full_valuation
    }

if __name__ == '__main__':
    execute_complete_audit()
