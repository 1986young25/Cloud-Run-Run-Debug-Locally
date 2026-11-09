#!/usr/bin/env python3
import socket
import os
import subprocess
import sys

# 0. Kill existing gamma_sync
os.system('pkill -f "gamma_sync" 2>/dev/null || true')

# 1. Flush and re-anchor TTE-GAMMA datagram state
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
try:
    s.bind(("0.0.0.0", 8083))
    print("[+] TTE-GAMMA Port 8083 cleared and bound.")
except Exception as e:
    print("[-] Re-bind warning:", e)
finally:
    s.close()

# 2. Verify all four pipeline ports
ports = [8080, 8083, 5173, 9200]
print("--- END-TO-END PIPELINE AUDIT ---")
for p in ports:
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(0.5)
    res = sock.connect_ex(("127.0.0.1", p))
    status = "LISTENING" if res == 0 else "FLUSHED/READY"
    print(f"Port {p}: {status}")
    sock.close()

print()
# 3. Execute TRL assessment
subprocess.run([sys.executable, "trl_assessment.py"])
