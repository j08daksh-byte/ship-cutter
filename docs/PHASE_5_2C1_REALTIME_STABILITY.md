# Phase 5.2C.1: Realtime Connection Stability Fixes

## Problem Statement
The Senior /operations/live page was experiencing rapid connection cycling (CONNECTED -> DISCONNECTED -> CONNECTING -> ERROR -> DEGRADED).
Additionally, the UI was displaying hardcoded presentation data (UNIT ALPHA-01, MV Ocean Voyager) regardless of actual connection state, which violated the requirement to only show real operational data.

## Root Cause Analysis
1. **Express SSE Buffering**: The upstream RoboFest backend sends a keep-alive ping :\n\n every 15 seconds. The Senior Node.js Gateway (server/routes/operations.js) was proxying these bytes, but without the X-Accel-Buffering: no header. Certain proxies and layers may buffer SSE messages until a larger chunk of data is ready.
2. **EventSource Lifecycle Handling**: The useGatewayStream hook in OperationsLivePage.jsx did not handle the initial connected custom event, only message. It also aggressively reconnected upon onerror and did not properly reset timeouts or update states cleanly, leading to the rapid cycling UI.
3. **Hardcoded UI Labels**: Sidebar.jsx contained hardcoded UNIT ALPHA-01 and ACTIVE labels that persisted even when the connection was severed, misleading the operator.

## Fixes Implemented
1. **Gateway Adjustments**:
   - Added es.setHeader('X-Accel-Buffering', 'no'); to server/routes/operations.js to ensure the Express gateway flushes all SSE packets directly to the client socket without buffering.

2. **React Hook (useGatewayStream) Overhaul**:
   - Centralized SSE handling into a robust hook.
   - Now specifically captures the connected custom event from RoboFest to correctly transition from CONNECTING to CONNECTED.
   - Includes a **Watchdog Timer**: If no data or pings are received for 20 seconds, the state drops to DEGRADED.
   - Uses an exponential backoff strategy (up to 10s) upon onerror to prevent rapid client-side reconnect spamming.

3. **UI Truth Constraints**:
   - Removed UNIT ALPHA-01 and MV Ocean Voyager from client/src/components/layout/Sidebar.jsx.
   - Replaced with NOT ASSIGNED and NO ACTIVE PROJECT to ensure zero fake telemetry is ever displayed.
   - The Digital Twin gracefully falls back to AWAITING TELEMETRY SYNC when offline.

## Testing & Verification
- **Stability Test**: Connected to the live stream. Verified that CONNECTED status remains solid with zero drops or cycles.
- **Offline Recovery Test**: Killed the RoboFest dev server. Verified that Senior seamlessly transitions to ERROR | OFFLINE with AWAITING TELEMETRY SYNC. Restarted RoboFest and verified automatic recovery to CONNECTED without a page refresh.

## Status
**PHASE 5.2C.1 COMPLETE.** The Realtime transport is robust, stable, and ready for Phase 5.2D (Command Gateway).
