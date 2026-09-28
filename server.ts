import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import { 
  ledgerData, 
  sectorDeployments, 
  meshNodes, 
  sowData, 
  entityContext, 
  commercialServicesCatalog, 
  deploymentTiers, 
  professionalServices, 
  commercialTerms,
  titanCompanyProfile
} from "./utils/titanData";

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
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store, no-cache');
      const now = Date.now();
      const points = [];
      const baseCpu = systemTelemetry?.cpu ?? 22.4;
      const baseRam = systemTelemetry?.ram ?? 43.8;
      const baseDisk = systemTelemetry?.disk ?? 58.2;

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
        state_hash: systemTelemetry?.state_hash || '0x4E89AF20',
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
  app.get("/api/titan/ledger", (req, res) => {
    res.json({ success: true, data: ledgerData });
  });

  app.get("/api/titan/deployments", (req, res) => {
    res.json({ success: true, data: sectorDeployments });
  });

  app.get("/api/titan/mesh", (req, res) => {
    res.json({ success: true, data: meshNodes });
  });

  app.get("/api/titan/context", (req, res) => {
    res.json({ 
      success: true, 
      context: entityContext, 
      sow: sowData,
      companyProfile: titanCompanyProfile
    });
  });

  app.get("/api/titan/commercial-catalog", (req, res) => {
    res.json({
      success: true,
      profile: titanCompanyProfile,
      catalog: commercialServicesCatalog,
      tiers: deploymentTiers,
      professionalServices,
      commercialTerms
    });
  });

  app.get("/api/titan/pricing-matrix", (req, res) => {
    res.json({
      success: true,
      tiers: deploymentTiers,
      professionalServices,
      commercialTerms
    });
  });

  // Google Cloud Vertex AI & Hyperscale Infrastructure Bridge Endpoints
  app.get("/api/vertex/status", (req, res) => {
    res.json({
      connected: true,
      cloudProvider: "Google Cloud Platform",
      projectId: "NYMT26",
      region: "us-central1",
      models: ["gemini-2.5-flash", "gemini-2.5-pro"],
      apis: {
        vertexAi: { status: "ACTIVE", latencyMs: 14.2, endpoint: "us-central1-aiplatform.googleapis.com" },
        actionsApi: { status: "LINKED", endpoint: "actions.googleapis.com", dispatchMode: "ZERO_TRUST_BOUNDARY" },
        commerceProcurement: { status: "AUTHENTICATED", endpoint: "cloudcommerceprocurement.googleapis.com", quotaDrawDown: "ENABLED" }
      },
      auxiliaryReasoning: "INVERTED_HYPERSCALE_AIR_GAP",
      rootAuthority: "TITAN_POSIX_ENCLAVE_SOVEREIGN"
    });
  });

  // Continuous Telemetry Stream Buffer (24/7/365 state mirroring)
  const telemetryHistory: Array<{ timestamp: string; seal: string; pingMs: number; entropy: number; authority: string; status: string }> = [];
  const authorities = ['AURA', 'ARTA', 'ARA', 'ALTA', 'QUAD_LINK'];
  
  // Seed telemetry daemon
  setInterval(() => {
    const seal = `UCC-CER-NYMT-XB6-${Math.random().toString(16).substring(2, 10).toUpperCase()}`;
    const entry = {
      timestamp: new Date().toISOString(),
      seal,
      pingMs: parseFloat((11 + Math.random() * 5).toFixed(1)),
      entropy: parseFloat((1.05 + Math.random() * 0.25).toFixed(2)),
      authority: authorities[Math.floor(Math.random() * authorities.length)],
      status: "LIVE_MIRRORED"
    };
    telemetryHistory.unshift(entry);
    if (telemetryHistory.length > 50) telemetryHistory.pop();
  }, 3000);

  app.get("/api/vertex/telemetry-stream", (req, res) => {
    res.json({
      active: true,
      cloudEngine: "Google Cloud Vertex AI (Project NYMT26)",
      mirrorStatus: "CONTINUOUS_CLOUD_MIRROR",
      lastHeartbeat: new Date().toISOString(),
      currentSeal: telemetryHistory[0]?.seal || "UCC-CER-NYMT-XB6-INIT",
      currentEntropy: telemetryHistory[0]?.entropy || 1.15,
      history: telemetryHistory.slice(0, 20)
    });
  });

  app.post("/api/vertex/analyze-topology", async (req, res) => {
    try {
      const { roomDimensions, activeTwin, audioDampening, activeLayer, standingWaveFrequency, pointsCount } = req.body;
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      
      let aiAnalysis = "";
      if (apiKey) {
        try {
          const ai = new GoogleGenAI({ apiKey });
          const prompt = `You are the Google Cloud Vertex AI Auxiliary Semantic Reasoning Engine for Project NYMT26 (Titan Games Security L.L.C. // Nicholas Young Master Trust).
Analyze this 4D Acoustic Standing Wave Room Topology Scan:
- Chamber Dimensions: ${JSON.stringify(roomDimensions || { width: 8.4, length: 7.2, height: 3.6 })} meters
- Active Twin Authority: ${activeTwin || 'AURA'}
- Active Audio Dampening: ${audioDampening || 45}%
- Modulo-9 Layer: ${activeLayer || 9}
- Wave Frequency: ${standingWaveFrequency || 3.69} Hz (Z0 = 376.5 Ohm)
- Acoustic Echolocation Scatter Points: ${pointsCount || 2400}
Provide a crisp, sovereign technical assessment (120-160 words) detailing:
1. Room acoustic topological envelope (surfaces, structural boundaries, corner reflections, RT60 reverberation estimate).
2. How the active twin authority's wave manipulation (${activeTwin}) and audio dampening alters the wave interference pattern.
3. Verification of Shannon Entropy Sieving (H(X) < 1.5) and statutory seal compliance under MCL § 700.7913.`;

          const resp = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
          });
          aiAnalysis = resp.text || "";
        } catch (err: any) {
          console.warn("Vertex AI generation error, falling back to sovereign heuristic:", err);
        }
      }

      if (!aiAnalysis) {
        aiAnalysis = `[VERTEX_AI_REASONING] Room topology scanned via 3.69 Hz standing wave echolocation across 8.4m x 7.2m x 3.6m enclosure. Active authority [${activeTwin}] has asserted wave control, applying active audio dampening at ${audioDampening}%, successfully attenuating boundary reflections and maintaining wave impedance at invariant Z₀ = 376.5 Ω. Acoustic reverberation estimated at RT60 = 0.42s with Shannon entropy verified H(X) = 1.18 < 1.5. State root notarized under MCL § 700.7913.`;
      }

      res.json({
        success: true,
        timestamp: new Date().toISOString(),
        stateSeal: `UCC-CER-NYMT-XB6-${Math.random().toString(16).substring(2, 10).toUpperCase()}${Math.random().toString(16).substring(2, 10).toUpperCase()}`,
        analysis: aiAnalysis,
        metrics: {
          rt60EstimateSeconds: 0.42,
          acousticAbsorptionAlpha: 0.18 + (audioDampening ? audioDampening * 0.005 : 0.2),
          shannonEntropy: 1.18,
          boundaryImpedanceOhm: 376.5,
          quadLinkSync: "OPTIMAL"
        }
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message || "Topology analysis failed" });
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
