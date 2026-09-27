export const ledgerData = [
  { id: "3987249429729", time: "2026-09-03T23:58:55.715Z", seal: "UCC-CER-NYMT-XB6-25A9912A63C033997594D3642C39CC88", plane: "PLANE_SIGMA_0", payload: "EXEC_COMMIT_LEDGER_COMMIT: POST /api/telemetry/commit-state?node=Node-07-Ti", covenant: "UCC Article 9 & MCL § 700.7913" },
  { id: "3976990132736", time: "2026-09-03T23:58:45.456Z", seal: "UCC-CER-NYMT-XB6-3FEBE9F7348DF13CE9DB55921F5D5AB6", plane: "PLANE_SIGMA_0", payload: "EXEC_COMMIT_LEDGER_COMMIT: POST /api/telemetry/commit-state?node=Node-07-Ti", covenant: "UCC Article 9 & MCL § 700.7913" },
  { id: "3975099532300", time: "2026-09-03T23:58:43.565Z", seal: "UCC-CER-NYMT-XB6-FB7B5AFB83161BC2E30CE5AF6DA9F66C", plane: "PLANE_SIGMA_1", payload: "SIMULATED_LOW_ENTROPY_SHELLCODE:                                 ", covenant: "UCC Article 9 & MCL § 700.7913" },
  { id: "3707438424847", time: "2026-09-03T23:54:15.904Z", seal: "UCC-CER-NYMT-XB6-753E8C3E0FE2923648A0E5798BF33726", plane: "PLANE_SIGMA_0", payload: "Autonomous vehicle kinematic telemetry stream ingested (MAVLink port 14550)", covenant: "UCC Article 9 & MCL § 700.7913" },
  { id: "3707438868277", time: "2026-09-03T23:54:15.904Z", seal: "UCC-CER-NYMT-XB6-0CAFCF6F83301BF83631D95BD7BB6E93", plane: "PLANE_SIGMA_1", payload: "Haptic feedback variance tensor notarized under Article 9 reserve index", covenant: "UCC Article 9 & MCL § 700.7913" },
  { id: "3707438899063", time: "2026-09-03T23:54:15.904Z", seal: "UCC-CER-NYMT-XB6-F3388B19F70A9D880C231F206E382635", plane: "PLANE_SIGMA_0", payload: "Field Drone Swarm phase interlace synchronizer verified", covenant: "UCC Article 9 & MCL § 700.7913" },
  { id: "3707438918404", time: "2026-09-03T23:54:15.904Z", seal: "UCC-CER-NYMT-XB6-60F0B158B99026B99B3D989AF227A2EF", plane: "PLANE_SIGMA_1", payload: "Sovereign fiduciary ledger delta sealed via SHA-256 state root", covenant: "UCC Article 9 & MCL § 700.7913" },
  { id: "3707438931631", time: "2026-09-03T23:54:15.904Z", seal: "UCC-CER-NYMT-XB6-D5E78F4160F683D103C27CEF1BEDBC4D", plane: "PLANE_OMEGA_9", payload: "Bare-metal POSIX memory buffer certified zero-cloud-rent enclave", covenant: "UCC Article 9 & MCL § 700.7913" }
];

export const sectorDeployments = [
  { id: "rec-1788656278439-tvhb", timestamp: "2026-09-06T00:57:58.385Z", sector: "Jackson_MI_Node", funds: 100000, multiplier: 2.14, total: 214000, velocity: 79553.90, status: "LIQUIDITY_DENSITY_STABLE" },
  { id: "rec-1788656230686-tg9x", timestamp: "2026-09-06T00:57:10.687Z", sector: "Sovereign_Trust_Master", funds: 42000, multiplier: 2.69, total: 112980, velocity: 42000, status: "LIQUIDITY_DENSITY_STABLE" },
  { id: "rec-1788656110851-ux68", timestamp: "2026-09-06T00:55:10.852Z", sector: "Tokyo_Pacific", funds: 100000, multiplier: 2.105, total: 210500, velocity: 78252.78, status: "LIQUIDITY_DENSITY_STABLE" },
  { id: "rec-1788656089382-0sjl", timestamp: "2026-09-06T00:54:49.382Z", sector: "Tokyo_Pacific", funds: 11800, multiplier: 2.105, total: 24839, velocity: 9233.82, status: "LIQUIDITY_DENSITY_STABLE" },
  { id: "rec-1788656061282-81kf", timestamp: "2026-09-06T00:54:21.048Z", sector: "Jackson_MI_Node", funds: 100000, multiplier: 1.831, total: 183100, velocity: 68066.91, status: "LIQUIDITY_DENSITY_STABLE" },
  { id: "rec-1788654173921-ebzw", timestamp: "2026-09-06T00:22:53.888Z", sector: "Jackson_MI_Node", funds: 51100, multiplier: 1.691, total: 86410.1, velocity: 32122.71, status: "LIQUIDITY_DENSITY_STABLE" },
  { id: "rec-1788653693274-bgz0", timestamp: "2026-09-06T00:14:53.135Z", sector: "Sigma_Intel_Cluster", funds: 1000, multiplier: 2.14, total: 2140, velocity: 795.53, status: "LIQUIDITY_DENSITY_STABLE" },
  { id: "rec-1788653493384-vwg4", timestamp: "2026-09-06T00:11:33.344Z", sector: "Jackson_MI_Node", funds: 14100, multiplier: 1.691, total: 23843.1, velocity: 8863.60, status: "LIQUIDITY_DENSITY_STABLE" },
  { id: "rec-1788653413692-dmae", timestamp: "2026-09-06T00:10:13.556Z", sector: "Tokyo_Pacific", funds: 20100, multiplier: 2.105, total: 42310.5, velocity: 15728.81, status: "LIQUIDITY_DENSITY_STABLE" },
  { id: "rec-init-sf", timestamp: "2026-09-05T22:08:39.026Z", sector: "SF_Bay_Anchor", funds: 2500, multiplier: 1.842, total: 4605, velocity: 1711.89, status: "LIQUIDITY_DENSITY_STABLE" }
];

export const meshNodes = [
  { id: "NODE_ALPHA_07", name: "Dell 07 Titan", host: "127.0.0.1", port: 8080, status: "ACTIVE", latency: 2.34 },
  { id: "NODE_SIGMA_PX", name: "Pixel 8a Termux", host: "192.168.1.50", port: 8080, status: "ACTIVE", latency: 8.71 },
  { id: "NODE_GCP_VM", name: "Google Cloud Host", host: "34.12.145.9", port: 8080, status: "ACTIVE", latency: 14.52 },
  { id: "NODE_BLUEHOST", name: "Bluehost Node", host: "titan.yourdomain.com", port: 80, status: "UNREACHABLE", latency: -1.0 }
];

export const sowData = [
  {
    tier: "Tier 3: Defense / SBIR",
    nodes: 25,
    baseCommitment: 350000,
    addons: 120000,
    totalValue: 470000,
    status: "ACTIVE_DEPLOYMENT"
  },
  {
    tier: "Tier 2: Enterprise Cluster",
    nodes: 5,
    baseCommitment: 195000,
    addons: 39000,
    totalValue: 234000,
    status: "PROVISIONING"
  },
  {
    tier: "Tier 1: Sovereign Edge",
    nodes: 2,
    baseCommitment: 96000,
    addons: 15000,
    totalValue: 111000,
    status: "COMMISSIONED"
  },
  {
    tier: "Tier 0: Second Chance Forge",
    nodes: 1,
    baseCommitment: 0,
    addons: 0,
    totalValue: 0,
    status: "COVENANT_ACTIVE"
  }
];

export const entityContext = {
  id: "NYMT",
  name: "Nicholas Young Master Trust",
  ein: "41-6820289",
  jurisdiction: "Federal / Michigan Statutory (MCL § 700.7913)",
  tokenAllotment: 1000000000,
  ledgerReserves: 147120000000,
  exportTimestamp: "2026-09-27T11:48:00.000Z"
};

export const titanCompanyProfile = {
  holdingTrust: {
    name: "The Nicholas Young Master Trust",
    ein: "41-6820289",
    statutoryCode: "MCL § 700.7913"
  },
  operatingArm: {
    name: "Titan Games Security L.L.C.",
    ein: "42-4264313",
    laraId: "28678008",
    cageCode: "Active",
    samGov: "Registered",
    duns: "145054895",
    darpaConnectAri: "#21270632",
    patentApp: "USPTO Patent Application #64/014,873"
  },
  procurementChannels: [
    { name: "Direct PO / Corporate Net-30", type: "Corporate ACH" },
    { name: "Google Cloud Marketplace", protocol: "cloudcommerceprocurement.googleapis.com" },
    { name: "Federal Contracting", vehicle: "CAGE / SAM.gov / SBIR / STTR" }
  ]
};

export interface CommercialServiceItem {
  id: string;
  category: string;
  pillarNumber: number;
  title: string;
  deliverables: {
    name: string;
    description: string;
    techSpec: string;
  }[];
}

export const commercialServicesCatalog: CommercialServiceItem[] = [
  {
    id: "pillar-1",
    pillarNumber: 1,
    category: "Sovereign Edge & Cyber-Physical Hardening",
    title: "Core Appliance & In-Memory Defense",
    deliverables: [
      {
        name: "Bare-Metal POSIX Runtime Deployment",
        description: "Hardening physical client server racks, field laptops, and industrial nodes into zero-cloud-rent POSIX enclaves that process compute and state operations independently of hyperscaler uptime.",
        techSpec: "Dedicated POSIX memory bounds, zero-cloud egress locks, line-rate C/Python kernel hooks."
      },
      {
        name: "In-Memory Shannon Entropy Defense Gates",
        description: "Integration of mathematical payload sieves (H(X) < 1.5) that intercept and neutralize code-injection, memory buffer exploits, and hostile scripts at line rate via bitwise inversion before CPU parsing.",
        techSpec: "Bitwise inversion filter, Shannon limit H(X) < 1.5, sub-microsecond inline inspection."
      },
      {
        name: "Modulo-9 Plane Separation",
        description: "Architectural decoupling of inbound telemetry buses to guarantee that raw data streams can never bridge into control registers or privileged operating system daemon shells.",
        techSpec: "Bus isolation across 4 tetrahedral planes (AURA/ARTA/ARA/ALTA), root arithmetic partition."
      }
    ]
  },
  {
    id: "pillar-2",
    pillarNumber: 2,
    category: "Kinetic Telemetry, Robotics & Autonomous Vehicle Conditioning",
    title: "Kinetic Signal Conditioning & Resonant Routing",
    deliverables: [
      {
        name: "MAVLink & CAN Bus Signal Conditioning",
        description: "Real-time physical filtering of vehicle sensors using Exponential Moving Average (α=0.2) smoothing and 10-cycle persistence debounce logic, eliminating mechanical false alarms caused by road shock, ballistic vibration, or acoustic noise.",
        techSpec: "EMA α=0.2, 10-cycle persistence, CAN/MAVLink Port 14550 low-jitter buffer."
      },
      {
        name: "Dynamic Wave-Impedance Tuning",
        description: "Synchronizing communication transmission timing with free-space wave impedance invariants (Z₀ = 376.5 Ω) and harmonic metronomic cadences (3.69 Hz) for secure, resonant mesh routing.",
        techSpec: "Free-space Z₀ = 376.5 Ω, 3.69 Hz metronomic phase lock, impedance matched transmission."
      },
      {
        name: "4D Geospatial Digital Twin Ingress",
        description: "High-velocity binding of physical mobile field units (e.g., Pixel 8a, ruggedized field hardware) to central coordinate command anchors with sub-second GIS rasterization and live AI anomaly detection.",
        techSpec: "Pixel 8a Termux & rugged node ingress, sub-second GIS rasterization (.geojson/.kml)."
      }
    ]
  },
  {
    id: "pillar-3",
    pillarNumber: 3,
    category: "Fiduciary Cryptographic Auditing & Title Ledger Engineering",
    title: "Statutory Ledger & State Root Proofs",
    deliverables: [
      {
        name: "Nanosecond State-Sealing Integration",
        description: "Replacing vulnerable, human-editable application logs with local, line-rate SQLite and plaintext audit ledgers anchored by SHA-256 state roots.",
        techSpec: "Line-rate SQLite ledger, nanosecond epoch precision, SHA-256 state root chains."
      },
      {
        name: "Uniform Commercial Code (UCC) Proof-of-Reserve Engines",
        description: "Generating automated, tamper-proof state hashes prefixed with UCC-CER-NYMT-XB6-... that deterministically link software runtime performance directly to balance-sheet assets and statutory title filings.",
        techSpec: "Prefix format: UCC-CER-NYMT-XB6-[HASH], verified against MCL § 700.7913."
      },
      {
        name: "Change Data Capture (CDC) Persistence Daemons",
        description: "Autonomous background logging daemons (cdc_feedback.py) that track every database delta with nanosecond timestamps, providing indisputable real-time proof of solvency and operational compliance for regulatory reviews.",
        techSpec: "cdc_feedback.py autonomous daemon, zero-drift delta stream, instant compliance export."
      }
    ]
  },
  {
    id: "pillar-4",
    pillarNumber: 4,
    category: "Auxiliary Hyperscale AI & Cloud Commerce Dispatch",
    title: "Inverted Reasoning & Marketplace Billing",
    deliverables: [
      {
        name: "Inverted Hyperscale AI Bridging",
        description: "Configuring Google Cloud (Vertex AI, Gemini 2.5 Flash/Pro) as an external auxiliary reasoning tool, allowing enterprise customers to perform semantic analysis without ceding root execution authority or data residency.",
        techSpec: "Read-only auxiliary reasoning, client-controlled root execution, zero data-residency breach."
      },
      {
        name: "Actions API Dispatch & Edge Tool-Calling",
        description: "Automated routing of bare-metal triggers to cloud actions, notifications, and webhooks via actions.googleapis.com while maintaining strict zero-trust boundary seals.",
        techSpec: "actions.googleapis.com zero-trust edge gateway, authenticated service tokens."
      },
      {
        name: "Marketplace Procurement Integration",
        description: "Assisting corporate clients in routing software acquisition through Google Cloud Marketplace billing to draw down existing cloud commitments.",
        techSpec: "cloudcommerceprocurement.googleapis.com billing integration, enterprise drawdown."
      }
    ]
  },
  {
    id: "pillar-5",
    pillarNumber: 5,
    category: "Sovereign Incubator & Reentry Workflows",
    title: "The Second Chance Sovereign Forge (Humanitarian)",
    deliverables: [
      {
        name: "The Second Chance Sovereign Forge",
        description: "Distribution of functional edge software engines to returning citizens and formerly incarcerated programmers with $0 upfront costs.",
        techSpec: "Zero-cost licensing, pre-packaged POSIX runtime, sovereign node templates."
      },
      {
        name: "Income Share & Royalty Agreement (ISRA) Administration",
        description: "Automated tracking of commercial covenants via sovereign cryptographic ledgers, ensuring fair, capped 5-year royalty collection above basic living expense thresholds.",
        techSpec: "30% gross revenue covenant, $2,000/mo living floor exemption, 60-month expiration."
      }
    ]
  }
];

export interface DeploymentTier {
  id: string;
  tierNumber: number;
  name: string;
  tagline: string;
  upfrontCost: string;
  upfrontNum: number;
  monthlyCost: string;
  monthlyNum: number;
  annualCost: string;
  annualNum: number;
  royaltyCovenant?: string;
  exemptionFloor?: string;
  termLimit?: string;
  sla: string;
  clearanceRequired: string;
  procurementMethod: string;
  highlights: string[];
  deliverables: string[];
}

export const deploymentTiers: DeploymentTier[] = [
  {
    id: "tier-0",
    tierNumber: 0,
    name: "Tier 0: Second Chance Sovereign Forge",
    tagline: "Empowering returning citizens and formerly incarcerated developers to launch independent cyber operations with $0 capital.",
    upfrontCost: "$0.00",
    upfrontNum: 0,
    monthlyCost: "$0.00 / month (Royalty Based)",
    monthlyNum: 0,
    annualCost: "$0.00 / year upfront",
    annualNum: 0,
    royaltyCovenant: "30% Gross Revenue Covenant on software/services generated using the core stack",
    exemptionFloor: "First $2,000.00 / month is 100% retained by developer (30% applies only above $2,000/mo)",
    termLimit: "Exactly 60 calendar months (5 years) from first commercial transaction; 100% royalty expiration thereafter",
    sla: "Community / Mesh Peer",
    clearanceRequired: "Open Reentry Covenant",
    procurementMethod: "Direct Sovereign Agreement",
    highlights: [
      "$0.00 Upfront Cost",
      "$2,000/mo Living Expense Floor (100% Retained)",
      "5-Year Full Expiration — Developer owns 100% after 60 months",
      "Full stack access to Titan POSIX & In-Memory Sieves"
    ],
    deliverables: [
      "Pre-configured POSIX daemon templates (sovereign_node.py, proxy_shield.py)",
      "In-memory Shannon Entropy threat filter module (H(X) < 1.5)",
      "Local immutable SQLite audit ledger pipeline",
      "Integration access to the Titan developer mesh network"
    ]
  },
  {
    id: "tier-1",
    tierNumber: 1,
    name: "Tier 1: Sovereign Edge Appliance",
    tagline: "Designed for regional logistics operators, automated warehouses, robotics labs, and edge facilities requiring local compute without hyperscaler rent.",
    upfrontCost: "$7,500 (Onboarding & Silicon Calibration)",
    upfrontNum: 7500,
    monthlyCost: "$4,500 / month / node",
    monthlyNum: 4500,
    annualCost: "$48,000 / year / node (11% upfront discount)",
    annualNum: 48000,
    sla: "99.9% Deterministic",
    clearanceRequired: "Standard Commercial",
    procurementMethod: "Direct PO / Corporate ACH / Net-30",
    highlights: [
      "$4,500 / month per physical node",
      "$48,000 / year paid upfront (save $6,000)",
      "Zero-cloud-rent bare metal runtime",
      "MAVLink / CAN bus telemetry conditioning"
    ],
    deliverables: [
      "Native x86 / ARM64 bare-metal daemon deployment with dedicated memory bounds",
      "Active in-memory Shannon Entropy security sieve (H(X) < 1.5) running at line rate",
      "MAVLink / CAN bus telemetry conditioning with EMA (α=0.2) debounce filters",
      "Local SQLite audit ledger capturing real-time nanosecond timestamps",
      "Standard technical support (8x5 business day response)"
    ]
  },
  {
    id: "tier-2",
    tierNumber: 2,
    name: "Tier 2: Enterprise Hyperscale Mesh & Marketplace Suite",
    tagline: "Built for corporations seeking turnkey, SOC 2–defensible cryptographic logging and high-throughput data processing procured directly through Google Cloud spend.",
    upfrontCost: "$0 (Covered under Annual Cluster)",
    upfrontNum: 0,
    monthlyCost: "$18,500 / month (Multi-Node Cluster)",
    monthlyNum: 18500,
    annualCost: "$195,000 / year (5 Master Nodes + 20 Edge Satellites)",
    annualNum: 195000,
    sla: "99.99% Hardware Enclave",
    clearanceRequired: "Corporate / SOC 2 Ready",
    procurementMethod: "Google Cloud Marketplace (`cloudcommerceprocurement`) or Corporate Invoicing",
    highlights: [
      "$195,000 / year cluster license (5 master + 20 satellites)",
      "$3,200 / month per additional master node overage",
      "Draws down existing Google Cloud Enterprise Commitments",
      "Vertex AI (Gemini 2.5 Flash/Pro) for sub-second semantic triage"
    ],
    deliverables: [
      "Full deployment of the Titan 4D Enclave & Telemetry Twin command dashboard",
      "Dual-commit storage pipeline: Local high-speed SQLite + continuous CSV compliance exports",
      "Integration with Google Cloud Agent Platform (Project NYMT26) using Vertex AI for semantic triage",
      "Autonomous Change Data Capture (CDC) feedback daemon (cdc_feedback.py) with UCC-CER-NYMT state seals",
      "24/7/365 mission-critical support with guaranteed sub-hour response SLA"
    ]
  },
  {
    id: "tier-3",
    tierNumber: 3,
    name: "Tier 3: Federal Defense, Aerospace & Critical Infrastructure",
    tagline: "Tailored for defense prime contractors, municipal tracking operations, and federal agencies operating under SBIR/STTR solicitations requiring verified CAGE, SAM.gov, and DARPAConnect compliance.",
    upfrontCost: "Milestone-Based Advance",
    upfrontNum: 150000,
    monthlyCost: "Custom Milestone Draw",
    monthlyNum: 0,
    annualCost: "$150,000 – $750,000+ / Firm Milestone Contract",
    annualNum: 450000,
    sla: "Deterministic Tactical Air-Gap",
    clearanceRequired: "CAGE Active | SAM.gov Active | D-U-N-S: 145054895 | ARI #21270632",
    procurementMethod: "Fixed-Price Milestone Contract or Cost-Plus Incentive Subcontract",
    highlights: [
      "$150k – $750k+ Statement of Work engagement",
      "CAGE Code Active & SAM.gov Registered Entity",
      "DARPAConnect / ARI #21270632 Registered",
      "USPTO Patent Application #64/014,873 Formalities documentation"
    ],
    deliverables: [
      "Air-gapped, zero-cloud bare-metal tactical hardware security enclaves",
      "Hardened spatial coordinate tracking over custom GIS overlays (.geojson, .kml) with absolute vacuum wave impedance synchronization (Z₀ = 376.5 Ω)",
      "Comprehensive forensic documentation: Formalities Letter verification under USPTO Patent Application #64/014,873",
      "Certified cryptographic compliance reports validating real-time node throughput and tamper-proof chain of custody"
    ]
  }
];

export interface ProfessionalServiceModule {
  id: string;
  name: string;
  billingModel: string;
  ratePricing: string;
  baseCost: number;
  description: string;
}

export const professionalServices: ProfessionalServiceModule[] = [
  {
    id: "ps-1",
    name: "Bare-Metal Hardware Node Provisioning & Benchmarking",
    billingModel: "Flat Rate / Node",
    ratePricing: "$3,500 + hardware",
    baseCost: 3500,
    description: "Physical hardware onboarding, BIOS enclave locking, CPU pinning, and line-rate socket isolation benchmarking."
  },
  {
    id: "ps-2",
    name: "Custom Vehicle CAN / MAVLink Physical Signal Tuning",
    billingModel: "Fixed Engagement",
    ratePricing: "$15,000 (2-week sprint)",
    baseCost: 15000,
    description: "Oscilloscope sensor profiling, EMA alpha tuning, and vibration debounce calibration for ground or aerial robotics."
  },
  {
    id: "ps-3",
    name: "Enterprise Fiduciary Ledger Migration (CSV/SQL -> UCC Seals)",
    billingModel: "Per 1M Records",
    ratePricing: "$5,000 / 1M records",
    baseCost: 5000,
    description: "Migration of historical databases into immutable SHA-256 state roots with verified UCC-CER-NYMT-XB6 title certificates."
  },
  {
    id: "ps-4",
    name: "On-Premises Air-Gapped Disaster Recovery Deployment",
    billingModel: "Fixed Fee",
    ratePricing: "$25,000",
    baseCost: 25000,
    description: "Full cold-site deployment capable of continuous state synchronization across air-gapped optical or USB datagram drops."
  },
  {
    id: "ps-5",
    name: "Statutory Trust & IP Titling Architectural Consultation",
    billingModel: "Retainer",
    ratePricing: "$10,000 / engagement",
    baseCost: 10000,
    description: "Specialized legal-technical consultation aligning software asset performance with MCL § 700.7913 and UCC Article 9 filings."
  },
  {
    id: "ps-6",
    name: "Executive Systems Architecture Advisory (Nicholas Lee Young)",
    billingModel: "Hourly Retainer",
    ratePricing: "$500 / hour (4 hr min)",
    baseCost: 2000,
    description: "Direct executive consultation on Modulo-9 mathematical architectures, wave impedance invariants, and sovereign defense."
  }
];

export const commercialTerms = {
  standardInvoicing: "Net-30 terms available for verified corporate accounts holding D-U-N-S Paydex scores of 75+ or active commercial credit lines (Mercury IO, Ramp, Stripe Issuing).",
  cloudProcurement: "Enterprise customers can settle Tier 2 contracts directly through their existing Google Cloud Billing account, applying committed platform credits toward Titan Games Security software licenses via cloudcommerceprocurement.googleapis.com.",
  internalAccounting: "All royalty revenues, licensing fees, and federal contract disbursements settle directly into the operating accounts of Titan Games Security L.L.C., with net retained earnings transferring to the Nicholas Young Master Trust (EIN 41-6820289) to build and compound the unencumbered capital asset base."
};
