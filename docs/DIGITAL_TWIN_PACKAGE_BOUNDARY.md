# Digital Twin Package Boundary Architecture

## 1. Package Responsibility
The @titan/digital-twin package exists to provide a 100% generic, reusable, and framework-agnostic visualization layer of the RoboFest Digital Twin. It acts as the shared presentation surface that can be mounted anywhere.

### Allowed Inside the Package
- React Three Fiber (@react-three/fiber) components.
- Three.js primitives and math.
- Local static configuration arrays.
- Hardcoded references to static 3D assets (e.g. /models/xyz.gltf).
- TwinState TypeScript interfaces.
- The TwinProvider generic React context.

### Forbidden Inside the Package
- Imports from src/lib/robotState or src/lib/platformStore.
- Any zustand imports.
- Any network dispatchers, API definitions, or command schemas.
- Next.js specific libraries (
ext/router, 
ext/image).
- Business logic dictating safety limits, path planning, or mission authorization.

## 2. TwinState Ownership
The package defines the schema (TwinState), but it does not own the data.

### RoboFest Authority
The RoboFest repository retains absolute authority over the actual data. When RoboFest mounts the digital-twin package, it must wrap it in an adapter that feeds its live zustand state into the TwinProvider. All commands flow natively from RoboFest's UI to its backend as before.

### Senior Read-Only Role
The ship-cutter (Senior) application acts strictly as a visual terminal. It receives real-time TwinState payloads over the SSE gateway and feeds them blindly into the TwinProvider. The Senior application is explicitly forbidden from implementing inverse command logic through this boundary.

## 3. Future Integration Adapters

### Future RoboFest Adapter
`	sx
import { useRobotStore } from '@/lib/robotState';
import { DigitalTwin, TwinProvider, TwinState } from '@titan/digital-twin';

export default function RoboFestDigitalTwin() {
  const store = useRobotStore();
  const state: TwinState = { /* map store to TwinState */ };
  
  return (
    <TwinProvider state={state}>
      <DigitalTwin />
    </TwinProvider>
  );
}
`

### Future Senior Adapter
`	sx
import { useState, useEffect } from 'react';
import { DigitalTwin, TwinProvider, TwinState } from '@titan/digital-twin';

export default function SeniorDigitalTwin() {
  const [state, setState] = useState<TwinState | null>(null);

  useEffect(() => {
    const sse = new EventSource('/api/operations/stream');
    sse.onmessage = (e) => setState(JSON.parse(e.data));
    return () => sse.close();
  }, []);

  if (!state) return <Loader />;

  return (
    <TwinProvider state={state}>
      <DigitalTwin />
    </TwinProvider>
  );
}
`

## 4. Future Asset Strategy
Because the 3D meshes rely on hardcoded paths (/textures/..., /models/...), those static folders will eventually need to be copied into Senior's public/ directory or served via a centralized CDN before Senior can render the Twin successfully without 404s.
