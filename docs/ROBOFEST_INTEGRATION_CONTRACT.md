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
- **Endpoint:** `/api/realtime` (RoboFest).
- **Transport Mechanism:** 
  The Senior `robofestAdapter` subscribes to the RoboFest SSE endpoint.
  High-frequency data is streamed unidirectionally from RoboFest to Senior to avoid duplicate polling.

## 3. Data Contract

The following defines the ACTUAL payloads emitted by the RoboFest backend during live operations.

```typescript
type Classification = 'LIVE' | 'SIMULATED' | 'DEMO' | 'HISTORICAL';

// [ACTUAL] Emitted as `RUNTIME_STATE_UPDATED`
interface RobotState {
  systemMode: 'SIMULATED' | 'LIVE' | 'EMERGENCY';
  positionX: number;
  positionY: number;
  positionZ: number;
  armX: number;
  armY: number;
  torchEnabled: boolean;
  electromagnetEnabled: boolean;
  emergencyActive: boolean;
  activeMissionId: string | null;
  lastCommandId: string | null;
}

// [ACTUAL] Emitted as `MISSION_UPDATED`
interface MissionState {
  id: string;
  shipName: string;
  objective: string;
  status: 'DRAFT' | 'READY' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'ABORTED';
  progressPercentage: number;
}

// [NOT CURRENTLY EMITTED] Emitted implicitly via RuntimeState emergencyActive
// interface SafetyState { ... }

// [ACTUAL] Emitted as `TELEMETRY_UPDATED`
interface Telemetry {
  timestamp: string;
  robotId: string;
  source: string;
  mode: Classification;
  powerVoltage: number;
  powerCurrent: number;
  imuAccelX: number;
  // ... other flat telemetry fields from Prisma schema
  overallHealth: string;
}

// [NOT CURRENTLY EMITTED] Handled internally in DB `ComponentHealth`
// interface RobotHealth { ... }

// [ACTUAL] Emitted as `EVENT_CREATED`
interface Event {
  timestamp: string;
  category: string;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  message: string;
  source: string;
}
```
*CRITICAL:* Any data rendered in the Senior shell MUST respect the `mode` flag inside Telemetry. Demo/simulated data must never be presented as live hardware data.

## 4. Connection State Management
The Senior shell strictly monitors the SSE connection and updates its UI based on the following states:
- **DISCONNECTED:** No active connection.
- **CONNECTING:** Establishing SSE stream.
- **CONNECTED:** Streaming active.
- **DEGRADED:** High latency or missing heartbeat.
- **ERROR:** Connection failed, refused, or lost.

## 5. Auth / Security Boundary
- **RoboFest Auth:** Uses JWT stored in the `auth_token` cookie (signed via `jose` with `JWT_SECRET`).
- **Senior Auth:** LACKS AUTHENTICATION. The Senior backend is completely unauthenticated.
- **Integration Rule:** The Senior shell must NEVER be given the RoboFest `JWT_SECRET`.
- **Session Propagation:** A centralized identity provider must be established.

## VERIFIED INTEGRATION STATUS

- **SSE endpoint:** `/api/realtime` (GET, `text/event-stream`).
- **Authentication mechanism:** Strictly reads `auth_token` HTTP-only cookie. Rejects URL token parameters.
- **CORS status:** RoboFest does NOT emit `Access-Control-Allow-Origin` or `Access-Control-Allow-Credentials`.
- **Payload status:** Verified. Matches Prisma DB models.
- **Browser direct-connect status:** **NOT READY.** Direct browser-to-RoboFest SSE fails due to CORS policy and strict cookie authentication across origins.
- **Server gateway requirement:** **REQUIRED.** Because the browser cannot securely send credentials cross-origin to an endpoint without CORS headers, the Senior backend must act as an SSE proxy (`/operations/stream`).

## GATEWAY STATUS: BLOCKED
Implementation of the `/api/operations/stream` Gateway on the Senior Express server is currently BLOCKED due to:
1. **No Senior Authentication:** The Senior Express backend currently has no global authentication mechanism. Implementing the gateway now would create an unauthenticated public tunnel directly into the RoboFest operational engine.
2. **No RoboFest Server Auth:** RoboFest strictly expects a browser `auth_token` cookie. It does not support Service Tokens, API Keys, or `Authorization` headers. The Senior Backend cannot securely authenticate itself to RoboFest without `JWT_SECRET` (which must not be shared).

## DIGITAL TWIN EXTRACTION STATUS: BLOCKED
Blocked until the auth boundary and server-to-server connection are resolved, and a monorepo workspace is established.
