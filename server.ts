import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware for JSON parsing
  app.use(express.json());

  // In-memory State for Binary Stream and Vector Setters (Port 1212 / 16-Byte Frame Architecture)
  let binaryStreamState = {
    sequence: 1042,
    variableX: 3.690,
    variableY: 7.380,
    variableZ: 14.760,
    packetSizeBytes: 16,
    port: 1212,
    streamRateHz: 3.69,
    timestamp: new Date().toISOString(),
    status: 'STREAMING'
  };

  // In-memory System Telemetry Ledger (CPU, RAM, Disk, State Hash)
  let systemTelemetry = {
    timestamp: new Date().toISOString(),
    cpu: 22.4,
    ram: 43.8,
    disk: 58.2,
    state_hash: '0x' + Math.random().toString(16).substring(2, 10).toUpperCase() + '7E3A9F'
  };

  // GET Binary Stream telemetry (matching C# BinaryStreamListener 16-byte frame)
  app.get("/api/telemetry/binary-stream", (req, res) => {
    // Generate simulated 16-byte raw hex buffer
    const buf = Buffer.alloc(16);
    buf.writeInt32LE(binaryStreamState.sequence, 0);
    buf.writeFloatLE(binaryStreamState.variableX, 4);
    buf.writeFloatLE(binaryStreamState.variableY, 8);
    buf.writeFloatLE(binaryStreamState.variableZ, 12);
    const rawHex = buf.toString('hex').toUpperCase();

    res.json({
      ...binaryStreamState,
      rawHex,
      timestamp: new Date().toISOString()
    });
  });

  // POST /api/telemetry/setter - "To all new setters" endpoint to update stream vectors & sequence
  app.post("/api/telemetry/setter", (req, res) => {
    try {
      const { sequence, x, y, z, variableX, variableY, variableZ, streamRateHz, status } = req.body;
      
      if (typeof sequence === 'number') binaryStreamState.sequence = sequence;
      if (typeof x === 'number') binaryStreamState.variableX = x;
      if (typeof variableX === 'number') binaryStreamState.variableX = variableX;
      if (typeof y === 'number') binaryStreamState.variableY = y;
      if (typeof variableY === 'number') binaryStreamState.variableY = variableY;
      if (typeof z === 'number') binaryStreamState.variableZ = z;
      if (typeof variableZ === 'number') binaryStreamState.variableZ = variableZ;
      if (typeof streamRateHz === 'number') binaryStreamState.streamRateHz = streamRateHz;
      if (typeof status === 'string') binaryStreamState.status = status;
      binaryStreamState.timestamp = new Date().toISOString();

      // Encode 16-byte frame
      const buf = Buffer.alloc(16);
      buf.writeInt32LE(binaryStreamState.sequence, 0);
      buf.writeFloatLE(binaryStreamState.variableX, 4);
      buf.writeFloatLE(binaryStreamState.variableY, 8);
      buf.writeFloatLE(binaryStreamState.variableZ, 12);

      res.json({
        success: true,
        message: 'Binary stream matrix vector updated successfully',
        data: {
          ...binaryStreamState,
          rawHex: buf.toString('hex').toUpperCase(),
          rawBase64: buf.toString('base64')
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to update setter' });
    }
  });

  // GET System Telemetry History (real-time, 1-hour, 24-hour ranges)
  app.get("/api/telemetry/history", (req, res) => {
    try {
      const range = (req.query.range as string) || 'realtime';
      const now = Date.now();
      const points = [];
      const baseCpu = systemTelemetry.cpu;
      const baseRam = systemTelemetry.ram;
      const baseDisk = systemTelemetry.disk;

      if (range === '24h') {
        // 24 data points representing 24 hourly averages (with an afternoon spike exceeding 90%)
        for (let i = 24; i >= 0; i--) {
          const t = new Date(now - i * 3600 * 1000);
          const hour = t.getHours();
          // Diurnal load cycle with peaks in morning and afternoon
          const diurnal = Math.sin((hour - 8) * (Math.PI / 12)) * 12;
          const noise = (Math.random() * 4 - 2);
          // Midday spike simulation at 14:00 (2 PM) hitting 92-94%
          const isMiddayPeak = hour === 14 || hour === 15;
          const cpuPeak = isMiddayPeak ? 93.2 + (Math.random() * 2) : baseCpu + diurnal + noise;
          const ramPeak = isMiddayPeak ? 91.5 + (Math.random() * 2) : baseRam + diurnal * 0.4 + noise * 0.5;

          const cpu = Math.max(8, Math.min(99, parseFloat((i === 0 ? baseCpu : cpuPeak).toFixed(1))));
          const ram = Math.max(25, Math.min(99, parseFloat((i === 0 ? baseRam : ramPeak).toFixed(1))));
          
          points.push({
            time: `${hour.toString().padStart(2, '0')}:00`,
            timestamp: t.toISOString(),
            cpu,
            ram,
            disk: baseDisk
          });
        }
      } else if (range === '1h') {
        // 20 data points representing 3-minute intervals over the last hour
        for (let i = 20; i >= 0; i--) {
          const t = new Date(now - i * 3 * 60 * 1000);
          const wave = Math.sin(i * 0.6) * 6;
          const noise = (Math.random() * 3 - 1.5);
          const cpu = Math.max(10, Math.min(75, parseFloat((baseCpu + wave + noise).toFixed(1))));
          const ram = Math.max(20, Math.min(85, parseFloat((baseRam + wave * 0.3 + noise * 0.4).toFixed(1))));

          const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
          points.push({
            time: timeStr,
            timestamp: t.toISOString(),
            cpu: i === 0 ? baseCpu : cpu,
            ram: i === 0 ? baseRam : ram,
            disk: baseDisk
          });
        }
      } else {
        // Real-time: rolling last 20 samples with 3-second intervals
        for (let i = 19; i >= 0; i--) {
          const t = new Date(now - i * 3000);
          const noise = (Math.sin(i * 0.8) * 4) + (Math.random() * 2 - 1);
          const ramNoise = (Math.cos(i * 0.5) * 2) + (Math.random() * 1.5 - 0.75);
          points.push({
            time: t.toLocaleTimeString(),
            timestamp: t.toISOString(),
            cpu: i === 0 ? baseCpu : parseFloat(Math.max(10, Math.min(65, baseCpu + noise)).toFixed(1)),
            ram: i === 0 ? baseRam : parseFloat(Math.max(20, Math.min(80, baseRam + ramNoise)).toFixed(1)),
            disk: baseDisk
          });
        }
      }

      res.json({
        range,
        count: points.length,
        state_hash: systemTelemetry.state_hash,
        points
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to retrieve telemetry history" });
    }
  });

  // GET System Telemetry Forecast (Next 60 minutes)
  app.get("/api/telemetry/forecast", (req, res) => {
    try {
      const now = Date.now();
      const points = [];
      const baseCpu = systemTelemetry.cpu;
      const baseRam = systemTelemetry.ram;
      const baseDisk = systemTelemetry.disk;

      // Generate a 1-hour forecast (12 points at 5-minute intervals)
      // Simulating a steady climb and peak behavior
      for (let i = 1; i <= 12; i++) {
        const t = new Date(now + i * 5 * 60 * 1000); // +5 mins per step
        
        // Simulating trend behavior: CPU rises slowly, RAM creeps up
        const timeOffset = i * 0.2;
        const trendCpu = baseCpu + (Math.sin(timeOffset) * 15) + (i * 1.5);
        const trendRam = baseRam + (timeOffset * 4) + (Math.sin(timeOffset * 1.5) * 5);
        
        const noise = (Math.random() * 2 - 1);
        
        const cpu = Math.max(0, Math.min(100, parseFloat((trendCpu + noise).toFixed(1))));
        const ram = Math.max(0, Math.min(100, parseFloat((trendRam + noise * 0.5).toFixed(1))));

        const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}`;
        points.push({
          time: timeStr,
          timestamp: t.toISOString(),
          cpu,
          ram,
          disk: baseDisk
        });
      }

      res.json({
        range: 'forecast_1h',
        count: points.length,
        state_hash: systemTelemetry.state_hash,
        points
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to generate telemetry forecast" });
    }
  });

  // GET System Telemetry (titan_ledger.db integration)
  app.get("/api/telemetry/system", (req, res) => {
    try {
      const jitter = (Math.random() * 1.5 - 0.75);
      const updatedTelemetry = {
        timestamp: new Date().toISOString(),
        cpu: Math.min(100, Math.max(5, parseFloat((systemTelemetry.cpu + jitter * 0.4).toFixed(1)))),
        ram: Math.min(100, Math.max(10, parseFloat((systemTelemetry.ram + jitter * 0.2).toFixed(1)))),
        disk: systemTelemetry.disk,
        state_hash: systemTelemetry.state_hash
      };
      res.json(updatedTelemetry);
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to retrieve system telemetry" });
    }
  });

  // POST System Telemetry
  app.post("/api/telemetry/system", (req, res) => {
    try {
      const { cpu, ram, disk, state_hash, timestamp } = req.body;
      systemTelemetry = {
        timestamp: timestamp || new Date().toISOString(),
        cpu: typeof cpu === "number" ? cpu : systemTelemetry.cpu,
        ram: typeof ram === "number" ? ram : systemTelemetry.ram,
        disk: typeof disk === "number" ? disk : systemTelemetry.disk,
        state_hash: state_hash || systemTelemetry.state_hash
      };
      res.json({ status: "success", telemetry: systemTelemetry });
    } catch (e: any) {
      res.status(500).json({ error: e.message || "Failed to record telemetry" });
    }
  });

  // API Route - Example for SaaS Asset Data
  app.get("/api/assets", (req, res) => {
    res.json([
      { name: 'Software Stacks (DCI/ARC/MMRM)', previous: '$1,442,850,000', delta: '+$280,000,000', updated: '$1,722,850,000', note: 'Recursive Titan extensions active' },
      { name: 'Hexagram Reactor (HEX-RX)', previous: '$785,000,000', delta: '+$115,000,000', updated: '$900,000,000', note: 'Tetrahedral resonance achieved' },
      { name: 'Genetic AI & Tetrahedral Twin Mirror', previous: '$0', delta: '+$2,400,000,000', updated: '$2,400,000,000', note: 'ALPHA/BETA/GAMMA/DELTA Synchronized' },
      { name: 'Internal Liquidity ($RSN)', previous: '$83,200,000', delta: '+$300,950,000', updated: '$384,150,000', note: 'G5 Ignition: Recursive Minting' },
    ]);
  });

  // API Route - Example for Technologies Stockpile
  app.get("/api/technologies", (req, res) => {
    res.json([
      { id: 'R2C-BRIDGE v4', status: 'ACTIVE', impact: '+$150M', desc: 'Intel NPU Acceleration integrated. Bypass grid-dependent power.' },
      { id: 'FHSS LOGIC', status: 'LOCKED', impact: '+$75M', desc: 'Frequency Hopping for unjammable DCI communication.' },
      { id: 'VORTEX COOLING', status: 'OPTIMIZED', impact: '+$120M', desc: 'Applied to HEX-RX. Surgical water yield +14%.' },
    ]);
  });

  // API Route - Nexus Portal Handshake (SaaS layer)
  app.post("/api/nexus/handshake", (req, res) => {
    const authHeader = req.headers.authorization;
    const providedKey = authHeader?.replace('Bearer ', '');
    const masterKey = process.env.SORCERY_SECRET_KEY;

    // In a real SaaS, this would check against a DB of issued keys.
    // Here we just simulate the verification.
    if (providedKey && masterKey && providedKey.startsWith('sk_srcry_')) {
      res.json({
        status: 'SUCCESS',
        node_id: req.body.node_id || 'UNKNOWN_NODE',
        session_anchored: true,
        resonance: 3.69
      });
    } else {
      res.status(401).json({
        status: 'DENIED',
        error: 'Invalid or missing Sorcery Secret Key'
      });
    }
  });

  // TITAN MOCK ENDPOINTS
  app.get("/api/titan/ledger", async (req, res) => {
    try {
      const { ledgerData } = await import("./utils/titanData.js");
      res.json({ success: true, data: ledgerData });
    } catch (err) {
      res.status(500).json({ error: "Failed to load ledger data" });
    }
  });

  app.get("/api/titan/deployments", async (req, res) => {
    try {
      const { sectorDeployments } = await import("./utils/titanData.js");
      res.json({ success: true, data: sectorDeployments });
    } catch (err) {
      res.status(500).json({ error: "Failed to load deployments" });
    }
  });

  app.get("/api/titan/mesh", async (req, res) => {
    try {
      const { meshNodes } = await import("./utils/titanData.js");
      res.json({ success: true, data: meshNodes });
    } catch (err) {
      res.status(500).json({ error: "Failed to load mesh nodes" });
    }
  });

  app.get("/api/titan/context", async (req, res) => {
    try {
      const { entityContext, sowData } = await import("./utils/titanData.js");
      res.json({ success: true, context: entityContext, sow: sowData });
    } catch (err) {
      res.status(500).json({ error: "Failed to load entity context" });
    }
  });

  // OTLP Trace Compute Simulation Endpoint
  app.get("/compute", (req, res) => {
    const elements = parseInt(req.query.elements as string) || 5000;
    let result = 0;
    // Simulate some compute to generate trace delay
    for (let i = 0; i < elements; i++) {
      result += Math.sin(i) * Math.cos(i);
    }
    res.json({ success: true, result, elements_computed: elements });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Sovereign Server Initialized on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("Failed to start Sovereign Server:", err);
});
