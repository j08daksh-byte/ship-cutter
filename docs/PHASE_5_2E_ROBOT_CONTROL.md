# Phase 5.2E: Robot Control UI Integration

## Architecture
This phase integrated the live command gateway into the existing TITAN-CUT operations dashboard. The previously static UI elements in OperationsLivePage.jsx now dispatch commands directly to the POST /api/operations/command/* gateway. 

## UI/UX Rules Enforced
- **Pessimistic State Execution**: The frontend never assumes a command succeeded. It immediately displays a pending execution state upon click but waits for the RoboFest backend to reflect the true state (via the SSE stream) before updating visualization or component state.
- **Dynamic Hardware Constraints**:
  - Locomotion commands are automatically disabled (disabled attribute) if the safety.movementPermission evaluates to alse or the SSE gateway is offline.
  - Torch commands are disabled if safety.torchPermission is alse.
  - The E-Stop operates independently and can trigger regardless of movement permission, acting as a true override.
- **Discrete Commands**:
  - Arm X/Y positions use absolute references, transmitting continuous updates rather than velocities.
  - Locomotion uses continuous velocity impulses (x: 0, y: 1 -> forward), stopping when the mouse is released (x: 0, y: 0).

## Safety
All commands traverse the established auth boundary via the Node.js Express proxy. No credentials or raw endpoints are leaked to the browser.