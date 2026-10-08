# Phase 5.2D: Command Gateway Integration

## Architecture
The Command Gateway establishes the foundational control path from the Senior platform to the RoboFest operational engine. 

**Senior UI → Senior Express API → RoboFest /api/robot/command → RoboFest Safety Engine**

All commands execute exclusively through RoboFest's internal safety validators and state management. The Senior platform never bypasses safety rules and does not control hardware directly.

## Authentication
Senior accesses the RoboFest APIs using headless, server-side service authentication. It dynamically fetches a secure JSON Web Token (JWT) at startup by authenticating against RoboFest's standard /api/auth/login endpoint using internal service credentials (dmin/dmin). This token is held purely in the Senior backend memory and is securely injected into proxy requests as a Bearer token. No tokens or session cookies are exposed to the Senior browser client.

## Command Contracts

### ROBOT Locomotion
- **forward**: UPDATE_LOCOMOTION { x: 0, y: 1 }
- **reverse**: UPDATE_LOCOMOTION { x: 0, y: -1 }
- **left**: UPDATE_LOCOMOTION { x: -1, y: 0 }
- **right**: UPDATE_LOCOMOTION { x: 1, y: 0 }
- **stop**: UPDATE_LOCOMOTION { x: 0, y: 0 }

### ARM
- **X/Y movement**: SET_ARM_POSITION { xExtension, yPosition } (Exposed as rm_move requiring absolute coordinates).
- **stop**: *UNAVAILABLE*. The RoboFest API uses absolute positional targeting (SET_ARM_POSITION) rather than velocity for the arm. There is currently no exposed endpoint to interrupt an arm traverse in progress.

### END EFFECTORS
- **torch request**: SET_TORCH { enabled: true }
- **torch OFF**: SET_TORCH { enabled: false }
- **electromagnet engage**: SET_ELECTROMAGNET { enabled: true }
- **electromagnet release**: SET_ELECTROMAGNET { enabled: false }

### MISSION
- **create**: *UNAVAILABLE*. Currently managed within RoboFest dashboard.
- **validate**: *UNAVAILABLE*. RoboFest does not currently expose a dry-run validation endpoint for missions.
- **start**: START
- **pause**: PAUSE
- **resume**: RESUME
- **stop**: COMPLETE
- **abort**: ABORT

### CUTTING
- **validate cut**: *UNAVAILABLE*. RoboFest does not currently expose a dry-run validation endpoint for cuts.
- **prepare cut**: PREPARE
- **execute cut**: SIMULATE (RoboFest currently maps execution to the SIMULATE state)
- **stop cut**: ABORT

### SAFETY
- **emergency stop request**: TRIGGER_EMERGENCY_STOP
- **reset/recover**: CLEAR_EMERGENCY_STOP (Only permitted if RoboFest hardware and safety rules allow).

## Error Handling
The gateway translates actions into strict RoboFest payload shapes. Unsupported actions or missing upstream endpoints yield a 501 UNAVAILABLE response to the client. Responses reflect true RoboFest processing states (ACCEPTED, REJECTED, BLOCKED).

## Tests
Verified with non-physical command tests successfully routing through the Senior proxy, authenticating automatically, acquiring a PENDING database record inside RoboFest, and returning ACCEPTED to the mock Senior caller.