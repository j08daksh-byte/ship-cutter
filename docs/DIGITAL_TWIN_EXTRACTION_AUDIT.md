# Digital Twin Extraction Audit

## 1. Current Digital Twin Architecture
The RoboFest Digital Twin (`src/components/DigitalTwin`) is a React Three Fiber (R3F) application that renders the 3D state of the robot and ship. 

Currently, the 3D components are deeply intertwined with the RoboFest application state. Components like `RobotModel`, `CuttingArm`, and `SimulationController` directly import and consume Zustand stores (`useRobotStore`, `usePlatformStore`, `usePlannerStore`) which hold the authoritative operational logic.

## 2. Component Dependency Graph
- **Framework-Independent Components:** The core geometry components (`RobotModel.tsx`, `ShipHull.tsx`, `DryDock.tsx`, `CuttingArm.tsx`, `HoseSystem.tsx`) are purely React Three Fiber components.
- **Next.js-Coupled Components:** There are **NO** direct `next/` imports (like `next/image` or `next/router`) within the `DigitalTwin` directory.
- **Backend/API-Coupled Components:** The stores (`robotState.ts`, etc.) tightly couple the Twin to RoboFest's `activeCommandTransport` and API endpoints. 
- **State/Store Dependencies:** `useRobotStore` handles command dispatch, safety interlocks, and telemetry parsing.
- **Three.js/R3F Dependency Requirements:** `three`, `@react-three/fiber`, and `@react-three/drei`. Senior currently lacks R3F.
- **Cutting Visualization Dependencies:** `usePlannerStore`, `domain.ts` models.

## 3. Proposed Extraction Boundary: "Pure Presentational Twin"
**Architecture:** **Option B / A** (Extract shared Twin component layer as a package/monorepo library).

The safest approach is to decouple the 3D rendering from the state management. The `DigitalTwin` folder should be refactored into a suite of "Pure Components" that accept robot state (`x, y, z, arm_y, torch_enabled`, etc.) exclusively via React Props or a generic, logicless React Context.

**Files that would move/reuse:**
- All `.tsx` files in `src/components/DigitalTwin/*`
- Associated 3D assets/materials.
- Pure configuration files (`shipConfig.ts`, `robotConfig.ts`).

**Files that must remain in RoboFest:**
- `src/lib/robotState.ts`
- `src/lib/platformStore.ts`
- Command dispatch logic and API boundaries.

## 4. Required Shared Interfaces/Contracts
We must extract the TypeScript interfaces defining the state:
```typescript
interface TwinState {
  robotPosition: { x, y, z };
  arm: { yPosition, xExtension };
  torch: { enabled };
  electromagnet: { enabled };
  // ...
}
```
Both Senior and RoboFest will map their local data into this `TwinState` object.

## 5. Risks
- **Performance Risks:** Running a heavy WebGL canvas inside Senior might degrade if Senior's React tree triggers frequent top-level re-renders. The Twin must be memoized or carefully boundary-controlled.
- **State Synchronization Risks:** Senior will be driving the Twin via 50ms SSE updates, whereas RoboFest might drive it via internal 16ms requestAnimationFrame loops. Interpolation logic may be required in the presentation layer to keep movement smooth on Senior.

## 6. Answers to Critical Questions
**1. Can the existing Digital Twin be rendered directly inside Senior?**
No.

**2. If not, exactly why not?**
The Twin components directly invoke RoboFest's authoritative Zustand stores (`useRobotStore`), which internally import `activeCommandTransport` and dispatch API requests to the RoboFest backend. Senior cannot and should not run RoboFest's internal network logic.

**3. What is the smallest safe extraction boundary?**
Extracting the 3D meshes and lighting (`@react-three/fiber` components) into a purely presentational library that receives `TwinState` as a prop, stripping out all Zustand `useStore` hooks from the 3D layer.

**4. How will Senior receive live robot state?**
Via the newly implemented `GET /api/operations/stream` Gateway, translating the SSE JSON into the generic `TwinState` prop.

**5. How will Senior send commands later?**
Senior will not dispatch commands directly from the 3D Twin. Any UI overlays in Senior will hit a separate command proxy API.

**6. Where will safety/E-stop authority remain?**
Strictly within RoboFest's `platformStore` and physical backend.

**7. Where will cutting authority remain?**
Strictly within RoboFest.

**8. How do we avoid creating two competing robot states?**
Senior's state is strictly a "read-only snapshot" derived blindly from the SSE telemetry. RoboFest maintains the singular, authoritative mutation logic.

**9. How do we guarantee the Senior Twin and RoboFest operational engine use the same coordinate/state model?**
By extracting the shared types (`robotConfig.ts`, `shipConfig.ts`, and `TwinState`) into the shared package alongside the components.

**10. How do we prevent the Senior integration from breaking the existing RoboFest Twin?**
RoboFest will import the new presentational Twin package and simply wrap it in a lightweight Adapter Component that feeds `useRobotStore` data into the Twin's props.

## 7. Recommended Implementation Sequence
1. **Monorepo Setup:** Migrate Senior and RoboFest into an npm/pnpm workspace (or create a dedicated package).
2. **Decouple:** Refactor RoboFest's `DigitalTwin` to accept props instead of using Zustand.
3. **Move:** Move the decoupled Twin into the shared package.
4. **Integrate RoboFest:** Update RoboFest to consume the package (proving no regressions).
5. **Integrate Senior:** Install `@react-three/fiber` in Senior, import the package, and map the SSE state to the Twin props.

---
**DIGITAL TWIN EXTRACTION AUDIT = COMPLETE**
**IMPLEMENTATION = NOT STARTED**
