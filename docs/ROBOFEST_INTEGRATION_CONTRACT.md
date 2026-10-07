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

## 6. Server-to-Server Authentication Design
*(PARTIALLY IMPLEMENTED — SENIOR BLOCKED)*

### Recommended Architecture: Static Service Token via Bearer Header (Option A)
The Senior Express server will authenticate to the RoboFest Next.js server using a high-entropy static token passed via the `Authorization: Bearer <token>` header. 

### Why:
This is the smallest, secure production-appropriate boundary. Both servers operate in trusted environments. A shared secret environment variable securely identifies the Senior Gateway without requiring cryptographic JWT generation/verification for an internal machine-to-machine connection. It avoids creating complex key rotation pipelines while fully isolating the domains.

### Rejected Alternatives:
- **B. Signed Service JWT:** Unnecessarily complex for a 1-to-1 static trust.
- **C. HMAC Request Signing:** Extreme overkill for a simple one-way SSE stream.
- **D. Unified IdP:** Out of scope for this phase.
- **E. Reuse existing user auth_token:** Unsafe and physically blocked by modern browsers (requires forwarding cross-origin, cross-domain cookies).

### Exact Future Request Contract:
```http
GET /api/realtime HTTP/1.1
Host: robofest-engine
Authorization: Bearer <ROBOFEST_SERVICE_TOKEN>
```
- **Validation:** RoboFest checks the `Authorization` header. If it matches `process.env.ROBOFEST_SERVICE_TOKEN`, access is granted. Otherwise, it falls back to checking the existing `auth_token` cookie.
- **Failure:** Returns `401 Unauthorized`.
- **Secret Storage:** Managed entirely via `.env.local` or a secret manager. Never exposed to the frontend.

### Threat Model & Mitigations
1. **Anonymous browser calls Senior `/operations/stream`:** *Mitigation:* Senior must implement a basic auth boundary (e.g., login session) before opening the proxy stream.
2. **Attacker obtains RoboFest service token:** *Mitigation:* Token is kept strictly in server `.env`, rotated securely, and never exposed via `VITE_` or `NEXT_PUBLIC_` variables.
3. **Service token appears in URL:** *Mitigation:* Token is passed ONLY via the `Authorization` header.
4. **Replay attacks:** *Mitigation:* Enforce TLS/HTTPS on all internal server-to-server traffic.
5. **Gateway abused as open proxy:** *Mitigation:* Gateway logic is strictly hardcoded to proxy only to the `ROBOFEST_ENGINE_URL/api/realtime` route.
6. **Token accidentally logged:** *Mitigation:* Configure Express/Morgan logging to redact the `Authorization` header.

### Implementation Order
1. Add `ROBOFEST_SERVICE_TOKEN` to RoboFest environment.
2. Update RoboFest `/api/realtime/route.ts` to accept `Authorization: Bearer <token>` alongside the existing cookie logic.
3. Implement basic session auth on the Senior Express server to protect the gateway endpoint.
4. Implement `/api/operations/stream` Gateway on Senior, forwarding the SSE stream using the static Bearer token.

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

## 7. Phase 3.8 Implementation Status
- **RoboFest Service Authentication:** **IMPLEMENTED.** The /api/realtime endpoint now supports Authorization: Bearer <ROBOFEST_SERVICE_TOKEN> natively via constant-time comparison.
- **Senior Authentication:** **NOT IMPLEMENTED.** Audited the Senior codebase; no existing user, session, or authentication architecture exists.
- **Gateway:** **NOT IMPLEMENTED.** Blocked pending Senior authentication to prevent an open proxy.

## 8. Senior Authentication Architecture Audit (REVISED FOR PRESENTATION MODE)
*(AUDIT & ARCHITECTURE DESIGN)*

### Current State
The Senior application currently has zero authentication. All endpoints and frontend routes are public.

### Change of Direction: Zero-Friction Presentation UI
To ensure the RoboFest demonstration is immediate, professional, and frictionless:
1. **No Login System:** We will **NOT** build a user identity system, email/password login, or authentication screen.
2. **Direct Access:** The presenter must be able to navigate to /operations/live immediately without typing credentials.
3. **Protected Service Boundary:** The internal ROBOFEST_SERVICE_TOKEN machine-to-machine authentication remains strictly enforced.

### Recommended Architecture: Fixed-Target Presentation Gateway
To make the Live Operations route directly accessible while preventing the backend from becoming a generic open proxy:

1. **Frontend:**
   - /operations/live remains a public React route.
   - It connects via EventSource directly to the Senior backend: /api/operations/stream.

2. **Backend Gateway (/api/operations/stream):**
   - Remains a public endpoint without session verification.
   - **Protection Mechanism:** It is strictly hardcoded to act as a **fixed-target proxy**. It will ONLY forward GET requests to process.env.ROBOFEST_URL + '/api/realtime'.
   - It will **NOT** accept target URLs via query parameters, headers, or request bodies, eliminating the risk of Server-Side Request Forgery (SSRF) or open-proxy abuse.
   - The Senior backend internally attaches Authorization: Bearer <ROBOFEST_SERVICE_TOKEN> from its environment variables before initiating the SSE connection to RoboFest.

3. **Security Posture:**
   - The ROBOFEST_SERVICE_TOKEN never touches the browser.
   - The Senior Gateway can only access the RoboFest telemetry stream, nothing else.
   - RoboFest's existing uth_token cookie mechanism remains completely unchanged.

### Remaining Work
1. Implement the fixed-target /api/operations/stream Gateway proxy in the Senior backend.
2. Update the frontend adapter to point to /api/operations/stream.
3. Execute Phase 4 (Digital Twin extraction).

