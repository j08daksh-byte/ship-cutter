import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, ArrowLeft, ShieldAlert, Wifi, Battery, 
  Cpu, Thermometer, ChevronUp, ChevronDown, Video, 
  Settings, Terminal, Crosshair
} from 'lucide-react';
import { robofestAdapter } from '../services/robofestAdapter';
import { TwinProvider, DigitalTwin as SharedDigitalTwin } from '@titan/digital-twin';

export default function OperationsLivePage() {
  const [connectionState, setConnectionState] = useState('DISCONNECTED'); // DISCONNECTED, CONNECTING, CONNECTED, DEGRADED, ERROR
  const [bottomExpanded, setBottomExpanded] = useState(false);
  
  const [robotState, setRobotState] = useState(null); // Maps to RUNTIME_STATE_UPDATED
  const [missionState, setMissionState] = useState(null); // Maps to MISSION_UPDATED
  const [telemetry, setTelemetry] = useState(null); // Maps to TELEMETRY_UPDATED
  const [events, setEvents] = useState([
    { timestamp: new Date(), message: 'Shell initialized. Adapter configured for Gateway.', type: 'sys' }
  ]);


    const twinState = robotState ? {
    position: robotState.position || { x: 0, y: 0, z: 0 },
    arm: {
      yPosition: robotState.arm?.yPosition || 0,
      xExtension: robotState.arm?.xExtension || 0
    },
    torch: {
      enabled: robotState.torch?.enabled || false
    },
    electromagnet: {
      enabled: robotState.electromagnet?.enabled || false
    },
    trackOffset: robotState.trackOffset || 0,
    fifthCableLength: robotState.fifthCableLength || 0,
    cameraTarget: robotState.cameraTarget || 'robot',
    cameraFocusTrigger: robotState.cameraFocusTrigger || 0,
    followMode: robotState.followMode || false,
    uiMode: robotState.uiMode === 'debug' ? 'debug' : 'presentation',
    xRayMode: robotState.xRayMode || false,
    activeCutPath: robotState.activeCutPath || [],
    completedCuts: (robotState.completedCuts || []).map(cut => ({
      id: cut.id || 'unknown',
      timestamp: typeof cut.timestamp === 'string' ? new Date(cut.timestamp).getTime() : (cut.timestamp || 0),
      path: cut.path || [],
      isClosed: !!cut.isClosed
    })),
    testShipVisibility: {
      showStructuralLines: false,
      showSurfaceDebug: false,
      showSurfaceNormals: false,
      showSurfaceTangents: false,
      showRobotProxies: false
    }
  } : {
    position: { x: 0, y: 0, z: 0 },
    arm: { yPosition: 0, xExtension: 0 },
    torch: { enabled: false },
    electromagnet: { enabled: false },
    trackOffset: 0,
    fifthCableLength: 0,
    cameraTarget: 'robot',
    cameraFocusTrigger: 0,
    followMode: false,
    uiMode: 'presentation',
    xRayMode: false,
    activeCutPath: [],
    completedCuts: [],
    testShipVisibility: {
      showStructuralLines: false,
      showSurfaceDebug: false,
      showSurfaceNormals: false,
      showSurfaceTangents: false,
      showRobotProxies: false
    }
  };

  // Connect to RoboFest Integration Adapter
  useEffect(() => {
    robofestAdapter.connect();

    const unsubscribe = robofestAdapter.subscribe((event) => {
      switch (event.type) {
        case 'CONNECTION_STATE':
          setConnectionState(event.payload);
          break;
        case 'RUNTIME_STATE_UPDATED':
          setRobotState(event.payload);
          break;
        case 'MISSION_UPDATED':
          setMissionState(event.payload);
          break;
        case 'TELEMETRY_UPDATED':
          setTelemetry(event.payload);
          break;
        case 'EVENT_CREATED':
          if (event.payload) {
            setEvents(prev => [event.payload, ...prev].slice(0, 50));
          }
          break;
        default:
          break;
      }
    });

    return () => {
      unsubscribe();
      robofestAdapter.disconnect();
    };
  }, []);

  return (
    <div className="h-screen w-screen bg-black text-white flex flex-col overflow-hidden font-sans">
      
      {/* TOP: Compact Operational Header */}
      <header className="h-14 border-b border-neutral-800 bg-neutral-950 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-neutral-400 hover:text-white transition-colors p-1 rounded hover:bg-neutral-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            <h1 className="text-sm font-bold tracking-widest uppercase">TITAN-OS Live Operations Shell</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 border border-neutral-800 px-3 py-1 rounded bg-neutral-900">
            <span className="text-neutral-500">ADAPTER LINK:</span>
            <span className={`font-bold ${
              connectionState === 'CONNECTED' ? 'text-emerald-400' : 
              connectionState === 'CONNECTING' ? 'text-yellow-400 animate-pulse' : 
              'text-red-400'
            }`}>
              {connectionState}
            </span>
          </div>
          <button className="bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/80 px-3 py-1 rounded flex items-center gap-2 transition-colors">
            <ShieldAlert className="w-4 h-4" /> E-STOP
          </button>
        </div>
      </header>

      {/* MIDDLE SECTION: Main Workspace + Right Rail */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* MAIN: Primary Workspace (Digital Twin Placeholder) */}
        <main className="flex-1 bg-neutral-900 relative border-r border-neutral-800 flex flex-col">
          {/* Twin Mount Target */}
          <div className="absolute inset-0 flex flex-col items-center justify-center p-0 text-center bg-black">
            {twinState ? (
              <TwinProvider state={twinState}>
                <div className="w-full h-full"><SharedDigitalTwin /></div>
              </TwinProvider>
            ) : (
              <div className="flex flex-col items-center justify-center p-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-neutral-800 to-black w-full h-full">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-neutral-700 flex items-center justify-center mb-6">
                  <Crosshair className="w-10 h-10 text-neutral-600 animate-pulse" />
                </div>
                <h2 className="text-2xl font-bold text-neutral-300 mb-2 font-mono uppercase tracking-widest">
                  Waiting for Twin Data
                </h2>
                <p className="text-neutral-500 max-w-md font-mono text-sm">
                  RoboFest WebGL Engine is mounted. Waiting for state sync from adapter...
                </p>
                {connectionState === 'ERROR' && (
                  <div className="mt-8 border border-red-900 bg-red-950/20 text-red-400 px-4 py-2 rounded text-xs font-mono flex items-center gap-2">
                    SSE GATEWAY CONNECTION REFUSED
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Workspace Overlays */}
          <div className="absolute top-4 left-4 flex gap-2">
            <button className="bg-black/50 border border-neutral-800 text-neutral-400 p-2 rounded backdrop-blur hover:text-white">
              <Video className="w-4 h-4" />
            </button>
            <button className="bg-black/50 border border-neutral-800 text-neutral-400 p-2 rounded backdrop-blur hover:text-white">
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </main>

        {/* RIGHT: Operational Rail */}
        <aside className="w-80 bg-neutral-950 flex flex-col overflow-y-auto shrink-0">
          
          {/* Rail Header */}
          <div className="p-3 border-b border-neutral-800 bg-black sticky top-0 z-10">
            <h3 className="text-[10px] font-bold text-neutral-500 font-mono tracking-widest uppercase">Telemetry & State</h3>
          </div>

          <div className="p-4 space-y-6">
            
            {/* Robot State Panel */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5" /> State
              </h4>
              <div className="bg-black border border-neutral-800 rounded p-3 grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="text-neutral-500">MODE</div>
                <div className={`text-right ${robotState?.systemMode ? 'text-emerald-400' : 'text-neutral-600'}`}>
                  {robotState?.systemMode || 'UNAVAILABLE'}
                </div>
                <div className="text-neutral-500">E-STOP</div>
                <div className="text-right text-neutral-600">{robotState?.emergencyActive ? 'ACTIVE' : (robotState ? 'CLEAR' : 'UNAVAILABLE')}</div>
              </div>
            </div>

            {/* Mission Panel */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5" /> Mission
              </h4>
              <div className="bg-black border border-neutral-800 rounded p-3 text-xs font-mono">
                <div className="flex justify-between mb-2">
                  <span className="text-neutral-500">ACTIVE PLAN</span>
                  <span className="text-neutral-600">{missionState?.status || 'UNAVAILABLE'}</span>
                </div>
                <div className="w-full bg-neutral-900 h-1.5 rounded overflow-hidden">
                  <div className="bg-cyan-500 h-full" style={{ width: `${missionState?.progressPercentage || 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Telemetry/Health Panel */}
            <div className="space-y-3">
              <h4 className="text-xs font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" /> Hardware Health
              </h4>
              <div className="space-y-2">
                <div className="bg-black border border-neutral-800 rounded p-2.5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Wifi className="w-3.5 h-3.5" /> SOURCE
                  </div>
                  <span className="text-neutral-600">{telemetry?.mode || 'UNAVAILABLE'}</span>
                </div>
                <div className="bg-black border border-neutral-800 rounded p-2.5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Battery className="w-3.5 h-3.5" /> POWER
                  </div>
                  <span className="text-neutral-600">{telemetry?.powerVoltage ? `${telemetry.powerVoltage}V` : 'UNAVAILABLE'}</span>
                </div>
                <div className="bg-black border border-neutral-800 rounded p-2.5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Thermometer className="w-3.5 h-3.5" /> M-TEMP
                  </div>
                  <span className="text-neutral-600">{telemetry?.motorTempLeft ? `${telemetry.motorTempLeft}°C` : 'UNAVAILABLE'}</span>
                </div>
                <div className="bg-black border border-neutral-800 rounded p-2.5 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-neutral-400">
                    <ShieldAlert className="w-3.5 h-3.5" /> HEALTH
                  </div>
                  <span className="text-neutral-600">{telemetry?.overallHealth || 'UNAVAILABLE'}</span>
                </div>
              </div>
            </div>
            
          </div>
        </aside>
      </div>

      {/* BOTTOM: Expandable Event/Activity Area */}
      <footer className={`border-t border-neutral-800 bg-neutral-950 flex flex-col shrink-0 transition-all duration-300 ${bottomExpanded ? 'h-48' : 'h-10'}`}>
        <div 
          className="h-10 px-4 flex items-center justify-between cursor-pointer hover:bg-neutral-900 transition-colors"
          onClick={() => setBottomExpanded(!bottomExpanded)}
        >
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="text-neutral-500">LATEST EVENT:</span>
            <span className="text-neutral-300">{events[0]?.message || 'No events'}</span>
          </div>
          <button className="text-neutral-500 hover:text-white">
            {bottomExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
        
        {bottomExpanded && (
          <div className="flex-1 p-4 overflow-y-auto bg-black font-mono text-xs">
            {events.map((ev, i) => (
              <div key={i} className={`mb-1 ${ev.severity === 'ERROR' ? 'text-red-500' : 'text-neutral-500'}`}>
                [{new Date(ev.timestamp).toLocaleTimeString()}] {ev.message}
              </div>
            ))}
          </div>
        )}
      </footer>
      
    </div>
  );
}
