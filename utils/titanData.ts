export const ledgerData = [
  { id: "3987249429729", time: "2026-09-03T23:58:55.715Z", seal: "UCC-CER-NYMT-XB6-25A9912A63C033997594D3642C39CC88", plane: "PLANE_SIGMA_0", payload: "EXEC_COMMIT_LEDGER_COMMIT: POST /api/telemetry/commit-state?node=Node-07-Ti", covenant: "UCC Article 9 & MCL § 700.7913" },
  { id: "3976990132736", time: "2026-09-03T23:58:45.456Z", seal: "UCC-CER-NYMT-XB6-3FEBE9F7348DF13CE9DB55921F5D5AB6", plane: "PLANE_SIGMA_0", payload: "EXEC_COMMIT_LEDGER_COMMIT: POST /api/telemetry/commit-state?node=Node-07-Ti", covenant: "UCC Article 9 & MCL § 700.7913" },
  { id: "3975099532300", time: "2026-09-03T23:58:43.565Z", seal: "UCC-CER-NYMT-XB6-FB7B5AFB83161BC2E30CE5AF6DA9F66C", plane: "PLANE_SIGMA_1", payload: "SIMULATED_LOW_ENTROPY_SHELLCODE: ", covenant: "UCC Article 9 & MCL § 700.7913" },
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
    tier: "Tier 3",
    nodes: 25,
    baseCommitment: 350000,
    addons: 120000,
    totalValue: 470000,
    status: "ACTIVE_DEPLOYMENT"
  },
  {
    tier: "Tier 2",
    nodes: 3,
    baseCommitment: 195000,
    addons: 39000,
    totalValue: 234000,
    status: "PROVISIONING"
  }
];

export const entityContext = {
    id: "NYMT",
    name: "Nicholas Young Master Trust",
    ein: "41-6820289",
    jurisdiction: "Federal",
    tokenAllotment: 1000000000,
    ledgerReserves: 147120000000,
    exportTimestamp: "2026-09-11T21:21:22.483Z"
};
