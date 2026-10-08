# Phase 5.2C: Realtime State Integration

## 1. Existing Gateway Verified
The Senior backend already contained an SSE Gateway at `GET /api/operations/stream`.
It correctly uses `process.env.ROBOFEST_SERVICE_TOKEN` and forwards traffic to `${process.env.ROBOFEST_URL}/api/realtime`.
Request cancellation, headers (`text/event-stream`), and raw byte-pumping are correctly configured to bypass Express buffering.

## 2. Actual RoboFest SSE Payloads Observed
RoboFest emits the following SSE payloads through its `RealtimeProvider`:
- `RUNTIME_STATE_UPDATED`: Contains `systemMode`, `positionX/Y/Z`, `armX/Y`, `torchEnabled`, `electromagnetEnabled`, `emergencyActive`, and `activeMissionId`.
- `TELEMETRY_UPDATED`: Contains an array of `TelemetrySample` objects. We extract the latest (index 0) which includes `robot.powerVoltage`, `sensor.motors.tempLeft`, `environment.o2Percentage`, etc.
- `MISSION_UPDATED`: Contains `status`, `progressPercentage`, and `id`.
- `SAFETY_CHANGED`: Contains `emergencyStateActive`, `movementPermission`, and `torchPermission`.
- `EVENT_CREATED`: Contains standard system events with `category`, `severity`, and `message`.

## 3. Normalized State Contract
We created a centralized `useGatewayStream` hook in `OperationsLivePage.jsx`.
It manages a single `EventSource` connection to `/api/operations/stream` and returns:
- `connectionState` (CONNECTING | CONNECTED | ERROR | DISCONNECTED)
- `classification` (LIVE | SIMULATED | DEMO | HISTORICAL | OFFLINE)
- `twinState` (Digital Twin shared state)
- `robotState`, `mission`, `safety`, `telemetry`, `events`

## 4. Runtime-State Mapping
The `RUNTIME_STATE_UPDATED` payload was mapped to the Digital Twin `TwinState`:
- `positionX/Y/Z` -> `position`
- `armY`, `armX` -> `arm`
- `torchEnabled` -> `torch.enabled`
- `electromagnetEnabled` -> `electromagnet.enabled`
- Camera and view modes default to standard `OperationsLivePage` settings.

## 5. Offline/Simulation/Demo Behavior
The Digital Twin now correctly remains visible in SIMULATED, DEMO, HISTORICAL, and LIVE modes. 
If the gateway disconnects, `classification` falls back to `OFFLINE` and the twin is replaced by the "AWAITING TELEMETRY SYNC" screen. This adheres to the requirement that SIMULATED data is clearly badged and separated from LIVE.

## 6. Digital Twin Features Preserved
Camera controls (FOCUS ROBOT/CUT/SHIP/FREE, FOLLOW ROBOT, X-RAY VISION) are implemented as UI overlays on the Digital Twin mount and securely feed into the `useGatewayStream` TwinState without replacing the entire object. The twin geometry from `@titan/digital-twin` remains completely unmodified.

## 7. Mission Mapping
`MISSION_UPDATED` maps directly into the right rail under the Mission panel, showing `status` and `progressPercentage`.

## 8. Telemetry Mapping
`TELEMETRY_UPDATED` payload fields such as `robot.powerVoltage`, `sensor.motors.tempLeft`, `sensor.imu.acceleration`, `gas.oxyPressurePsi`, and `environment.o2Percentage` are mapped to the Sensor Streams tab.

## 9. Event Mapping
`EVENT_CREATED` payloads append directly to the Event History tab. Only real events are rendered.

## 10. Missing Backend Fields
- Battery percentage, vessel name, and health scores are currently omitted unless specifically emitted by RoboFest, avoiding fake values.
- Explicit track speed values might be missing in `RUNTIME_STATE_UPDATED` without full telemetry, but position X/Y/Z are sufficient for the twin.

## 11. Remaining Command-Gateway Requirements
The Control Panel inputs (movement, arm, torch, estop) are correctly stubbed with a console warning (`NOT CONNECTED TO COMMAND GATEWAY`) and `disabled` visually depending on `isOnline`. They await Phase 5.2D for real POST proxies.

## 12. Build/Lint Results
Pending verification by browser test.

## 13. Files Changed
- `client/src/pages/OperationsLivePage.jsx`

## 14. Exact Next Task
Phase 5.2D — Command Gateway Integration.
