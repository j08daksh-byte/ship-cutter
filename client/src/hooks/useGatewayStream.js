import { useState, useEffect, useRef } from 'react';

// A mock of the gateway data structure for now replaced with REAL SSE integration
const useGatewayStream = () => {
  const [connectionState, setConnectionState] = useState('CONNECTING'); // DISCONNECTED | CONNECTING | CONNECTED | DEGRADED | ERROR
  const [classification, setClassification] = useState('OFFLINE'); // LIVE | SIMULATED | DEMO | HISTORICAL | OFFLINE
  
  const [twinState, setTwinState] = useState({ position: { x: 0, y: 0, z: 0 }, arm: { yPosition: 0, xExtension: 0.4 }, torch: { enabled: false }, electromagnet: { enabled: false }, trackOffset: 0, fifthCableLength: 4.2, cameraTarget: "robot", cameraFocusTrigger: 0, followMode: true, uiMode: "presentation", xRayMode: false, activeCutPath: [], completedCuts: [], testShipVisibility: { showStructuralLines: false, showSurfaceDebug: false, showSurfaceNormals: false, showSurfaceTangents: false, showRobotProxies: false } });
  const [robotState, setRobotState] = useState(null);
  const [telemetry, setTelemetry] = useState(null);
  const [safety, setSafety] = useState(null);
  const [mission, setMission] = useState(null);
  const [events, setEvents] = useState([]);

  const esRef = useRef(null);
  const watchdogRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    let active = true;
    let reconnectAttempts = 0;
    
    const connect = () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      
      setConnectionState('CONNECTING');
      
      const es = new EventSource('/api/operations/stream', { withCredentials: true });
      esRef.current = es;

      const resetWatchdog = () => {
        if (watchdogRef.current) clearTimeout(watchdogRef.current);
        if (active) {
          // If we haven't received ANY event (message, connected, ping) for 20 seconds, we are degraded
          watchdogRef.current = setTimeout(() => {
            if (active) {
              setConnectionState('DEGRADED');
              // Optionally close and reconnect after a while if degraded for too long
            }
          }, 20000);
        }
      };

      es.onopen = () => {
        if (!active) return;
        // Don't set CONNECTED here. Set it when we receive 'connected' event from upstream.
        // Or if we don't get 'connected' from upstream, we can set it here. We'll set CONNECTED upon first message or 'connected' event.
      };

      es.addEventListener('connected', (event) => {
        if (!active) return;
        setConnectionState('CONNECTED');
        reconnectAttempts = 0;
        resetWatchdog();
      });

      es.addEventListener('ping', (event) => {
        if (!active) return;
        setConnectionState('CONNECTED');
        reconnectAttempts = 0;
        resetWatchdog();
      });

      es.onmessage = (event) => {
        if (!active) return;
        setConnectionState('CONNECTED'); // Ensure we are connected
        reconnectAttempts = 0;
        resetWatchdog();
        
        try {
          const rtEvent = JSON.parse(event.data);
          
          if (rtEvent.type === 'RUNTIME_STATE_UPDATED') {
            const payload = rtEvent.payload || rtEvent;
            setClassification(payload.systemMode || 'UNKNOWN');
            
            setRobotState({
              systemMode: payload.systemMode,
              electromagnetActive: payload.electromagnetEnabled,
              emergencyActive: payload.emergencyActive
            });
            
            setSafety(prev => prev || {
              emergencyActive: payload.emergencyActive,
              movementPermission: !payload.emergencyActive, 
              torchPermission: !payload.emergencyActive
            });

            setTwinState(prev => ({
              ...prev,
              position: { x: payload.positionX || 0, y: payload.positionY || 0, z: payload.positionZ || 0 },
              arm: { yPosition: payload.armY || 0, xExtension: payload.armX || 0.4 },
              torch: { enabled: !!payload.torchEnabled },
              electromagnet: { enabled: !!payload.electromagnetEnabled },
              trackOffset: prev?.trackOffset || 0,
              fifthCableLength: prev?.fifthCableLength || 4.2,
              cameraTarget: prev?.cameraTarget || 'robot',
              cameraFocusTrigger: prev?.cameraFocusTrigger || 0,
              followMode: prev?.followMode ?? true,
              uiMode: 'presentation',
              xRayMode: prev?.xRayMode || false,
              activeCutPath: prev?.activeCutPath || [],
              completedCuts: prev?.completedCuts || [],
              testShipVisibility: prev?.testShipVisibility || {
                showStructuralLines: false, showSurfaceDebug: false, showSurfaceNormals: false, showSurfaceTangents: false, showRobotProxies: false
              }
            }));
          }
          else if (rtEvent.type === 'TELEMETRY_UPDATED') {
            const arr = Array.isArray(rtEvent.payload) ? rtEvent.payload : [rtEvent.payload];
            if (arr.length > 0) {
              const latest = arr[0];
              setTelemetry({
                powerVoltage: latest?.robot?.powerVoltage,
                motorTempLeft: latest?.sensor?.motors?.tempLeft,
                motorTempRight: latest?.sensor?.motors?.tempRight,
                imu: latest?.sensor?.imu,
                gas: latest?.sensor?.gas,
                environment: latest?.environment,
                hardware: latest?.sensor?.hardware,
                raw: latest
              });
            }
          }
          else if (rtEvent.type === 'MISSION_UPDATED') {
            setMission(rtEvent.payload);
          }
          else if (rtEvent.type === 'SAFETY_CHANGED') {
            setSafety(rtEvent.payload);
          }
          else if (rtEvent.type === 'EVENT_CREATED') {
            setEvents(prev => [rtEvent.payload, ...prev].slice(0, 50));
          }
        } catch (e) {
          // parse error, ignore safely
        }
      };

      // Handle ping event. In EventSource, ping comments (:\n\n) don't trigger events.
      // But we can listen for errors.
      
      es.onerror = () => {
        if (!active) return;
        es.close();
        esRef.current = null;
        if (watchdogRef.current) clearTimeout(watchdogRef.current);
        
        setConnectionState('ERROR');
        setClassification('OFFLINE');
        
        const timeout = Math.min(1000 * Math.pow(1.5, reconnectAttempts), 10000);
        reconnectAttempts++;
        
        reconnectTimeoutRef.current = setTimeout(() => {
          if (active) connect();
        }, timeout);
      };
    };

    connect();

    return () => {
      active = false;
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      if (watchdogRef.current) clearTimeout(watchdogRef.current);
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
    };
  }, []); // Run ONCE on mount
  
  return {
    connectionState,
    classification,
    twinState,
    setTwinState,
    robotState,
    telemetry,
    safety,
    mission,
    events
  };
};



export default useGatewayStream;
