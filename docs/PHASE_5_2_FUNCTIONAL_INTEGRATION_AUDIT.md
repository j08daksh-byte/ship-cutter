# PHASE 5.2 FUNCTIONAL INTEGRATION AUDIT

## 1. COMPLETE FEATURE MATRIX

| Feature Area | Senior Implementation | RoboFest Implementation | Final TITAN-CUT Destination | Authority | Integration Status | Reuse | Adapt | Remove | API/Gateway Boundary | Database / Source | Command Path | Telemetry Path | Safety Dep. | HW Dep. | Physical Test Req. |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **A. Unified Live Ops** | `OperationsLivePage.jsx` | `Shell`, `ControlPanel` | `/operations/live` | Merged UI | UI Shell Built; Missing Controls | Shell | Controls & Realtime Provider | Mock UI | SSE Proxy & REST Commands | Mixed | N/A | SSE Gateway | Yes | No | No |
| **B. Digital Twin** | Consumes `@titan/digital-twin` | `DigitalTwin` dir | `@titan/digital-twin` | Shared Pkg | Integrated | 3D Assets & Logic | `TwinProvider` state mapping | Internal App copies | N/A | N/A | N/A | `twinState` (SSE) | No | No | No |
| **C. Robot Control Panel** | None | `ControlPanel` index | `/operations/live` sidebar | RoboFest | Gap (Missing in Senior) | Panel UI | Style/Theming | Direct API calls | `POST /api/robot/command` (proxy) | RoboFest DB | UI -> Gateway -> RoboFest | N/A | Yes | Yes | Yes |
| **D. Robot Movement** | None | Within `ControlPanel` | `/operations/live` | RoboFest | Gap | Control logic | Routing through gateway | N/A | `POST /api/robot/command` | RoboFest DB | UI -> Gateway -> RoboFest | SSE Gateway | Yes | Yes | Yes |
| **E. Cutting Arm Controls** | None | Within `ControlPanel` | `/operations/live` | RoboFest | Gap | Control logic | Routing through gateway | N/A | `POST /api/robot/command` | RoboFest DB | UI -> Gateway -> RoboFest | SSE Gateway | Yes | Yes | Yes |
| **F. Torch Controls** | None | Within `ControlPanel` | `/operations/live` | RoboFest | Gap | Control logic | Routing through gateway | N/A | `POST /api/robot/command` | RoboFest DB | UI -> Gateway -> RoboFest | SSE Gateway | Yes | Yes | Yes |
| **G. Electromagnet Control** | None | Within `ControlPanel` | `/operations/live` | RoboFest | Gap | Control logic | Routing through gateway | N/A | `POST /api/robot/command` | RoboFest DB | UI -> Gateway -> RoboFest | SSE Gateway | Yes | Yes | Yes |
| **H. Mission Control** | Placeholder | `MissionControls` | `/operations/missions` | RoboFest | Gap | Mission UI | Routing through gateway | N/A | `POST /api/mission/*` (proxy) | RoboFest DB | UI -> Gateway -> RoboFest | SSE Gateway | Yes | Yes | Yes |
| **I. Cutting Planner** | None | `CutEditor`, `CutSimulation3D` | `/operations/missions` | RoboFest | Gap | Planner logic | Adaptation to new API | N/A | `POST /api/mission/*` | RoboFest DB | N/A | N/A | No | No | No |
| **J. Cutting Execution** | None | Engine in Backend | Handled by backend | RoboFest | Engine exists | Engine code | N/A | N/A | N/A | RoboFest DB | Gateway -> Engine | SSE Gateway | Yes | Yes | Yes |
| **K. Telemetry** | Hardcoded UI | `RealtimeProvider` | `/operations/live` | RoboFest | Partial (UI exists, data hardcoded) | State Interfaces | Bind SSE to Senior UI | Mock data | `GET /api/operations/stream` | RoboFest Mem | N/A | SSE Gateway | No | Yes | No |
| **L. Robot Health** | Placeholder | `TelemetryTrend` | `/maintenance/health` | RoboFest | Gap | Trend charts | Merge with Senior Logs | N/A | `GET /api/operations/stream` | Mixed | N/A | SSE Gateway | No | Yes | No |
| **M. Sensors** | Basic DataViewer | Part of Telemetry | `/operations/sensors` | RoboFest | Gap | Hardware bindings | N/A | N/A | `GET /api/operations/stream` | RoboFest DB | N/A | SSE Gateway | No | Yes | Yes |
| **N. Safety/E-STOP** | Mock UI Button | `EStopButton` | Global Header | RoboFest | Gap (Button is mock) | Button UI | Zero-latency proxy | Mock actions | `POST /api/robot/estop` | RoboFest DB | UI -> Gateway -> Hardware | SSE Gateway | Critical | Yes | Yes |
| **O. Event History** | `HistoryPage.jsx` | `EventTimeline` | `/intelligence/history` | Senior | Gap | `EventTimeline` | Route events to Senior DB | RoboFest DB logs | `POST /api/events` (to Senior) | Senior DB | N/A | SSE Gateway | No | No | No |
| **P. ROBO-ASSIST** | `ChatbotPage.jsx` | `ChatInterface` | `/intelligence/ai` | Merged | Gap | AI logic | Merge Assistant knowledge | Separate UI | AI API Proxy | Senior DB | N/A | N/A | No | No | No |
| **Q. Vision/Intelligence** | None | `VisionFeed` | `/operations/live` | RoboFest | Gap | Feed display | Component framing | N/A | WebRTC/MJPEG | N/A | N/A | N/A | No | Yes | Yes |
| **R. Analytics/Performance** | `DashboardPage.jsx`| `AnalyticsDashboard` | `/intelligence/analytics` | Senior | Gap | Dashboards | Rewrite for Senior | RoboFest Analytics | None (Aggregated DB) | Senior DB | N/A | N/A | No | No | No |
| **S. Business Dashboard** | `HomePage.jsx` | None | `/` | Senior | Complete | Shell | Dashboard Layout | N/A | N/A | Senior DB | N/A | N/A | No | No | No |
| **T. Ships** | `ShipsPage.jsx` | None | `/ships` | Senior | Complete | Page logic | N/A | N/A | N/A | Senior DB | N/A | N/A | No | No | No |
| **U. Materials** | `MaterialPage.jsx` | None | `/materials` | Senior | Complete | Page logic | N/A | N/A | N/A | Senior DB | N/A | N/A | No | No | No |
| **V. Parts** | `PartTrackingPage.jsx`| None | `/parts` | Senior | Complete | Page logic | N/A | N/A | N/A | Senior DB | N/A | N/A | No | No | No |
| **W. Maintenance** | `MaintenancePage.jsx`| None | `/maintenance` | Senior | Complete | Page logic | Merge Health stats | N/A | N/A | Senior DB | N/A | N/A | No | No | No |
| **X. DB Integration** | MongoDB | Prisma/SQLite | Separate | Merged via API | Gap | Schemas | Sync operational events | N/A | N/A | Senior DB | N/A | N/A | No | No | No |
| **Y. SSE Integration** | Mock SSE | `RealtimeProvider` | Throughout App | RoboFest | Gap (Backend setup, UI disconnected) | Stream logic | Wire to Senior Gateway | Mock streams | `GET /api/operations/stream` | RoboFest DB | N/A | Gateway | No | No | No |
| **Z. Hardware Boundary** | None | Serial/TCP | Abstracted via API | RoboFest | Abstracted | Hardware Interface | Keep in RoboFest | N/A | Hardware Protocol | N/A | API -> Engine -> HW | HW -> Engine -> SSE | Yes | Yes | Yes |

## 2. CURRENT GAP LIST

1. **Disconnected SSE State**: The `/operations/live` page hardcodes operational status (`UNAVAILABLE`) instead of consuming the actual SSE `telemetry`, `missionState`, and `robotState` from the backend Gateway.
2. **Missing Robot Control Panel**: The manual jog controls, torch controls, and electromagnet controls from RoboFest's `ControlPanel` are entirely missing from the Senior Live Operations view.
3. **Placeholder Global E-STOP**: The E-STOP in the Senior header is a non-functional mock. It must be wired to execute an immediate zero-latency proxy command to RoboFest.
4. **Missing Mission Planner**: The `/operations/missions` route is a placeholder. It must host the `CutEditor` and `CutSimulation3D` components.
5. **No Command Proxy**: Senior has no backend proxy routes for `POST` commands (like movement or mission start). It currently only has the `GET /api/operations/stream` gateway.
6. **Hardcoded UI elements**: Analytics, events, and telemetry in Senior are mocked instead of relying on actual data.

## 3. FINAL DATA FLOW

- **Operational Data (Telemetry, State, Missions)**: Flows strictly from the RoboFest backend engine to the Senior Express Gateway (`/api/operations/stream`), which relays it via SSE to the Senior React frontend.
- **Business Data (Ships, Parts, Materials)**: Flows natively from the Senior MongoDB database to the Senior React frontend via Senior's native REST APIs.
- **Event Logging**: RoboFest pushes significant hardware/operational events to the Senior business event REST API, consolidating history in Senior's MongoDB.

## 4. FINAL COMMAND FLOW

User Interface (Senior Frontend) -> Command REST Proxy (Senior Backend) -> Operational API (RoboFest Backend) -> Operational Engine / State -> Hardware Boundary (ESP32).
- The Senior frontend **never** connects directly to RoboFest.
- The Senior Backend authenticates to RoboFest using the `ROBOFEST_SERVICE_TOKEN` via a Bearer header.

## 5. FINAL SAFETY FLOW

**Global E-STOP Action**: User clicks E-STOP (Senior Frontend) -> Dedicated E-STOP REST Proxy (Senior Backend, high priority queue bypass) -> Emergency API (RoboFest) -> Hardware.
- The UI must reflect the active E-STOP state dynamically by turning the Digital Twin's safety cables red and displaying `ACTIVE` on the control board.

## 6. FINAL DATABASE BOUNDARY

- **Senior Database (MongoDB)**: Authority over Users, Ships, Materials, Parts, Maintenance Logs, and consolidated Event History.
- **RoboFest Database (SQLite/Prisma)**: Authority over runtime cutting states, immediate missions, saved cut profiles, and raw hardware logging.
- **Strict Rule**: The Senior frontend will NEVER query the RoboFest database directly. The Senior backend will NEVER query the RoboFest database directly. All interaction must pass through the RoboFest Operational API.

## 7. FINAL /operations/live LAYOUT

The final `/operations/live` UI will consist of:
- **Header**: Global Search, User Profile, E-STOP (Red button).
- **Left Sidebar**: TITAN-CUT application navigation.
- **Center Canvas**: The `@titan/digital-twin` 3D environment showing live telemetry mapping.
- **Right Sidebar (Upper)**: Telemetry and State feed (Realtime).
- **Right Sidebar (Lower/Tabbed)**: Robot Control Panel (Jog, Torch, Electromagnet controls).
- **Bottom Bar**: Expandable Event / Alert feed.

## 8. EXACT IMPLEMENTATION ORDER (Phases 5.2B onward)

- **Phase 5.2B**: **Telemetry & State Integration.** Connect the Senior `/operations/live` UI to the working `/api/operations/stream` SSE Gateway. Replace all hardcoded "UNAVAILABLE" text with live reactive data.
- **Phase 5.2C**: **Command Proxy & Control Panel.** Implement `POST /api/robot/command` proxies on the Senior Backend. Port the `ControlPanel` UI from RoboFest to Senior's right sidebar.
- **Phase 5.2D**: **Safety Integration.** Wire the Global E-STOP button to the proxy and verify zero-latency hardware shutdown paths.
- **Phase 5.3**: **Mission Planning.** Port `CutEditor` and `MissionControls` to the `/operations/missions` route and wire to the backend proxies.
- **Phase 5.4**: **Analytics & History.** Merge event logging and rebuild operational analytics natively inside Senior using the new event pipeline.

## 9. PHYSICAL TEST CHECKPOINTS

- **Checkpoint 1 (Post 5.2C)**: Ensure manual jog controls sent from the Senior UI correctly trigger hardware movement via the gateway.
- **Checkpoint 2 (Post 5.2D)**: Test the Global E-STOP under load to verify latency requirements (<50ms end-to-end proxy).
- **Checkpoint 3 (Post 5.3)**: Execute a full planned test cut on a scrap plate from the unified dashboard.

## 10. RISKS / BLOCKERS

- **Blocker**: The Senior Backend currently lacks the `POST` proxy routes required for robot command and control. (Will resolve in 5.2C).
- **Blocker**: RoboFest's `ControlPanel` components rely on direct API fetches and local state hooks that must be refactored to use the Senior Gateway paths.
- **Risk**: Increased latency due to the double-hop architecture (UI -> Senior -> RoboFest). Must monitor E-STOP response times carefully.
- **Risk**: Eventual consistency issues between RoboFest's operational logs and Senior's business history ledger.

## Phase 5.1 Corrections Required
- **Remove mock state**: `OperationsLivePage.jsx` currently hardcodes fallback values. These must be replaced with the `RealtimeProvider` context.
- **Replace mock E-STOP**: The header E-STOP must be made interactive.
- **Missing Controls**: The right sidebar must be expanded or tabbed to accommodate the `ControlPanel`.
