# ROBOFEST INTEGRATION CONTRACT

This document defines the strict operational boundary between the Senior Ship-Cutter shell and the authoritative RoboFest Operational Engine.

## 1. Domain Ownership

### Senior (Ship-Cutter Shell)
- **Role:** Host platform and business logic.
- **Owns:**
  - Public website and marketing
  - Fleet management and vessel records
  - Material and parts tracking
  - Scrapping feasibility and ROI metrics
  - Historical business operations
  - Global dashboard navigation

### RoboFest (Operational Engine)
- **Role:** Live robotic operations and realtime state execution.
- **Owns:**
  - Digital Twin rendering (WebGL/Three.js)
  - Robot state and command execution
  - Deterministic safety enforcement (E-Stop, interlocks)
  - Cutting missions and thermal planning
  - Hardware telemetry and health
  - Real-time operational event stream

## 2. Realtime Boundary (Transport)
- **Protocol:** Server-Sent Events (SSE).
- **Endpoint:** /api/realtime (RoboFest).
- **Transport Mechanism:** 
  The Senior \obofestAdapter\ subscribes to the RoboFest SSE endpoint.
  High-frequency data is streamed unidirectionally from RoboFest to Senior to avoid duplicate polling.

## 3. Data Contract

Messages emitted over SSE follow this strict contract:

\\\	ypescript
type Classification = 'LIVE' | 'SIMULATED' | 'DEMO' | 'HISTORICAL';

interface RobotState {
  mode: 'STANDBY' | 'ACTIVE' | 'EMERGENCY';
  position: { x: number, y: number, z: number };
  orientation: { roll: number, pitch: number, yaw: number };
  adhesion: boolean;
  armPosition: { j1: number, j2: number, j3: number, j4: number, j5: number, j6: number };
  torchState: 'OFF' | 'IGNITING' | 'PLASMA' | 'COOLING';
  magnetState: 'ENGAGED' | 'DISENGAGED';
  classification: Classification;
}

interface MissionState {
  id: string;
  status: 'PENDING' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ABORTED';
  currentOperation: string;
  progress: number; // 0-100
  activeCut: string | null;
  completedCuts: string[];
  classification: Classification;
}

interface SafetyState {
  permitState: 'AUTHORIZED' | 'DENIED' | 'REVOKED';
  eStop: boolean;
  interlockState: 'LOCKED' | 'UNLOCKED';
  hazards: string[];
  blockingReason: string | null;
  classification: Classification;
}

interface Telemetry {
  timestamp: string;
  source: string;
  sensorIdentity: string;
  values: Record<string, number>;
  units: Record<string, string>;
  classification: Classification;
}

interface RobotHealth {
  subsystem: string;
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL' | 'OFFLINE';
  healthScore: number;
  fault: string | null;
  maintenanceIndicator: boolean;
}

interface Event {
  timestamp: string;
  category: 'SYSTEM' | 'SAFETY' | 'MISSION' | 'TELEMETRY';
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  source: string;
}
\\\
*CRITICAL:* Any data rendered in the Senior shell MUST respect the \classification\ flag. Demo/simulated data must never be presented as live hardware data.

## 4. Connection State Management
The Senior shell strictly monitors the SSE connection and updates its UI based on the following states:
- **DISCONNECTED:** No active connection.
- **CONNECTING:** Establishing SSE stream.
- **CONNECTED:** Streaming active.
- **DEGRADED:** High latency or missing heartbeat.
- **ERROR:** Connection failed, refused, or lost.

## 5. Auth / Security Boundary
- **RoboFest Auth:** Uses JWT stored in the \uth_token\ cookie (signed via \jose\ with \JWT_SECRET\).
- **Senior Auth:** Currently has no strict auth mechanism in place for the new live route.
- **Integration Rule:** The Senior shell must NEVER be given the RoboFest \JWT_SECRET\.
- **Session Propagation:** The Senior frontend will forward the user's \uth_token\ cookie to the RoboFest SSE endpoint (\withCredentials: true\). If unified authentication is implemented in the future, Senior must authenticate with a central Identity Provider, which will issue a token trusted by both Senior and RoboFest.

## 6. Digital Twin Integration Decision

**Selected Architecture:** B. Monorepo/Shared Workspace (Turborepo) or A. Shared Package Extraction.

**Why:**
The RoboFest Digital Twin relies on a complex stack (\@react-three/fiber\, \@react-three/drei\, \zustand\).
Rendering this seamlessly inside a Vite React DOM tree (Senior) without an \<iframe>\ requires the Digital Twin to be a standard importable React component.
Since Senior is a Vite SPA and RoboFest is a Next.js App Router application, we cannot perform "Same-origin reverse proxy / route delegation" for a React component; we can only proxy APIs or HTML pages (which creates the iframe problem).

**Required Changes for Phase 4 (Digital Twin Extraction):**
1. Extract the \D:\Webs\Robofest\src\app\command-center\ and \obot-lab\ WebGL components into a framework-agnostic package (e.g., \@titan/digital-twin\).
2. Move \zustand\ stores and Three.js logic to this shared package.
3. Decouple the WebGL components from Next.js-specific features (\
ext/link\, \
ext/image\, Server Actions).
4. Publish the package or link it via a Workspace (e.g., NPM Workspaces or Turborepo).
5. Import \@titan/digital-twin\ into the Senior Vite app and mount it inside \/operations/live\.

**Deployment Implications:**
Both repositories will need to be restructured into a monorepo, or the RoboFest repository will need a build step to compile the Digital Twin as an NPM library.

**Risks:**
- WebGL context loss during HMR in Vite if not handled correctly.
- Zustand store state collisions if the extracted package has module duplication.

*Do NOT proceed with Digital Twin extraction until the architecture is explicitly authorized.*
