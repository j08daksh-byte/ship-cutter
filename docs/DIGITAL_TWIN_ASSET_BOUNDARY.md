# Digital Twin Asset Boundary Audit

## Overview
The extracted `@titan/digital-twin` package relies on static assets to render models and materials via `@react-three/drei`'s `useGLTF` and `useTexture` hooks. These assets were originally located in `D:\Webs\Robofest\public`. During Phase 4.8 debugging, they were aggressively copied to `D:\Webs\ship-cutter\client\public` to satisfy runtime requests.

## Asset Requirements

| ASSET | SOURCE | CURRENT SENIOR LOCATION | REQUIRED BY TWIN | DUPLICATE? | RECOMMENDED FINAL LOCATION |
|---|---|---|---|---|---|
| `textures/dirty_concrete/*` | RoboFest | `client/public/textures/` | YES (`DryDock.tsx`) | YES | Package static distribution / CDN |
| `textures/green_metal_rust/*` | RoboFest | `client/public/textures/` | YES (`useShipMaterials.ts`) | YES | Package static distribution / CDN |
| `models/metal_tool_chest/*` | RoboFest | `client/public/models/` | YES (`DryDock.tsx`) | YES | Package static distribution / CDN |
| `models/worn_metal_rack/*` | RoboFest | `client/public/models/` | YES (`DryDock.tsx`) | YES | Package static distribution / CDN |
| `models/industrial_storage_cart/*` | RoboFest | `client/public/models/` | YES (`DryDock.tsx`) | YES | Package static distribution / CDN |
| `models/metal_jerrycan/*` | RoboFest | `client/public/models/` | YES (`DryDock.tsx`) | YES | Package static distribution / CDN |
| `environments/kloppenheim_02.hdr` | RoboFest | `client/public/environments/` | NO | YES | Remove from Senior |
| `textures/coast_sand_01/*` | RoboFest | `client/public/textures/` | NO | YES | Remove from Senior |
| `textures/gravel_floor/*` | RoboFest | `client/public/textures/` | NO | YES | Remove from Senior |
| `models/overhead_crane/*` | RoboFest | `client/public/models/` | NO | YES | Remove from Senior |

## Architecture Recommendation
Currently, the shared Digital Twin hardcodes paths like `useGLTF('/models/...')`. This mandates that the host application (Senior or RoboFest) serves these paths from its root public directory. 

**Recommended Production Architecture**:
The shared `@titan/digital-twin` package should bundle its own assets and expose a configuration context or base URL prop (e.g., `<TwinProvider assetBaseUrl="https://cdn.titan.com/twin/assets">`), ensuring host applications do not need to duplicate massive 3D `.gltf` and texture files into their own `/public` directories. Until then, only the strictly required assets listed above should be copied to the host.
