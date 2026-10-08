# PHASE 5.2H — SAFETY, ROBOT HEALTH AND OPERATIONAL EVENT INTEGRATION

**Branch:** `integration/unified-live-dashboard`
**Status:** COMPLETE
**Completed:** 2026-10-08

---

## Overview

Phase 5.2H integrates the RoboFest safety authority, robot health diagnostics, and event history into the TITAN-CUT Live Operations Center (/operations/live).

All safety state comes from **RoboFest** as the operational authority. No safety logic is invented or enforced locally in the browser. The UI displays and gates commands based on backend state only.

---

## Architecture

```
TITAN-CUT /operations/live (React)
  down reads
useGatewayStream.js (SSE hook - /api/operations/stream)
  down proxies
Senior Express gateway (server/routes/operations.js)
  down proxies
RoboFest /api/realtime (SSE)
  down owned by
RoboFest safety + event engine
```

### Safety Command Flow

```
User presses E-STOP in TITAN-CUT UI
  down
POST /api/operations/command/safety { action: estop }
  down
Senior gateway maps to: { type: TRIGGER_EMERGENCY_STOP }
  down
POST RoboFest /api/robot/command
  down
RoboFest safety engine triggers E-STOP
  down
SSE broadcasts SAFETY_CHANGED event
  down
useGatewayStream updates safety state
  down
UI reflects: E-STOP ACTIVE, commands blocked
```

---

## Files Modified

| File | Role |
|------|------|
| client/src/pages/OperationsLivePage.jsx | Full page rewrite with safety, health, events |
| client/src/hooks/useGatewayStream.js | SSE hook - parses SAFETY_CHANGED, EVENT_CREATED |
| server/routes/operations.js | Command gateway for estop / clear_estop |

---

## Safety States Displayed

| State | Color | Source |
|-------|-------|--------|
| NORMAL / SAFE | Green | safety.level from SSE |
| WARNING | Amber | safety.level from SSE |
| BLOCKED | Red | safety.level from SSE |
| EMERGENCY | Red pulsing | safety.emergencyStateActive = true |
| UNKNOWN | Grey | No SSE data received yet |
| NOT CONNECTED | Grey | connectionState !== CONNECTED |

---

## E-STOP Integration

### Trigger
POST /api/operations/command/safety { "action": "estop" }
Maps upstream to: { "type": "TRIGGER_EMERGENCY_STOP", "source": "SENIOR_GATEWAY" }

### Clear
POST /api/operations/command/safety { "action": "clear_estop" }
Maps upstream to: { "type": "CLEAR_EMERGENCY_STOP", "source": "SENIOR_GATEWAY" }

### UI Behavior
- E-STOP button in secondary header: always visible, animated pulse when active
- CLEAR button: only appears when safety.emergencyStateActive === true
- Global E-STOP in main nav header: triggers same estop command
- Buttons disabled when connectionState !== CONNECTED or estopLoading === true

---

## Command Blocking by Safety State

| Command | Blocking condition |
|---------|-------------------|
| Forward/Reverse/Left/Right | !isOnline OR !safety.movementPermission |
| Stop | !isOnline |
| Arm move | !isOnline OR !safety.movementPermission |
| Ignite Torch | !isOnline OR !safety.torchPermission |
| Engage Magnet | !isOnline |

movementPermission and torchPermission are sourced from RoboFest SSE — never granted locally.

---

## Robot Health Panel (Right Sidebar)

| Subsystem | Source | No-data display |
|-----------|--------|-----------------|
| MOTORS | telemetry.motors.tempLeft/Right > 60C | UNKNOWN |
| SENSORS | Presence of telemetry object | UNKNOWN |
| END EFFECTOR | Presence of telemetry object | UNKNOWN |

No health percentage is ever fabricated. If telemetry is null, all subsystems show UNKNOWN.

---

## Event History Integration

Events arrive via SSE as EVENT_CREATED type. Last 50 events retained in memory (FIFO, newest first).

| Severity | Color |
|----------|-------|
| CRITICAL | Red border + red text |
| WARNING | Amber border + amber text |
| INFO | Neutral border + neutral text |

---

## SSE Event Types Handled

| SSE Event Type | Action |
|---------------|--------|
| RUNTIME_STATE_UPDATED | Updates robotState, twinState, classification |
| TELEMETRY_UPDATED | Updates telemetry (power, motors, gas, environment) |
| MISSION_UPDATED | Updates mission |
| SAFETY_CHANGED | Updates safety (level, permissions, hazards) |
| EVENT_CREATED | Prepends to events[] (max 50) |
| connected (named event) | Sets connectionState = CONNECTED |
| ping (named event) | Resets watchdog, keeps CONNECTED |

---

## Connection State Machine

CONNECTING -> CONNECTED (on connected event or first message)
CONNECTED  -> DEGRADED  (if no event for 20 seconds - watchdog)
CONNECTED  -> ERROR     (on es.onerror)
ERROR      -> CONNECTING (exponential backoff: 1s * 1.5^n, max 10s)

---

## Data Classification

| Classification | Meaning |
|---------------|---------|
| LIVE | Physical robot hardware connected |
| SIMULATED | RoboFest simulator active |
| DEMO | Demo mode |
| HISTORICAL | Playback of historical data |
| OFFLINE | No upstream connection |
| UNKNOWN | Mode not yet received |

---

## Constraints Respected

- No fake/fabricated sensor values or health percentages
- No browser-local safety state - all gated on backend safety object
- E-STOP proxied to RoboFest safety engine, not client-only alert
- UNKNOWN / --- shown when data unavailable
- Data source classified as SIMULATED/LIVE/OFFLINE - never hidden
- No second mission store - mission state from SSE only
- No physical hardware connected in this phase
- D:\Webs\Robofest source code not modified

---

## Known Limitations / Future Work

| Item | Note |
|------|------|
| safety.level field name | Depends on RoboFest SAFETY_CHANGED payload - verify field name when connected |
| Event history persistence | Currently in-memory only; should persist to MongoDB |
| Hazard list | Rendered from safety.activeHazards[]; structure must match RoboFest schema |
| Motor health threshold | Hardcoded at 60C; should be configurable |
| Mission creation | POST command/mission create returns 501 - not yet in RoboFest API |
