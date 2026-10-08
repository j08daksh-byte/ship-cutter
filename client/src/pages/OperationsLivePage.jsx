import React, { useState } from 'react';
import { 
  Activity, ArrowLeft, ShieldAlert, Wifi, \r?\n  ChevronUp, ChevronDown, Video, \r?\n  Settings, Crosshair, ArrowUp, ArrowDown, ArrowRight, Link2Off
} from 'lucide-react';
import { TwinProvider, DigitalTwin as SharedDigitalTwin } from '@titan/digital-twin';
import useGatewayStream from '../hooks/useGatewayStream';

const LiveSensorCard = ({ label, value, unit, status = 'NORMAL', sourceMode = 'NOT CONNECTED' }) => {
  const isConnected = value !== undefined && value !== null && sourceMode !== 'OFFLINE' && sourceMode !== 'NOT CONNECTED';
  const displayValue = isConnected ? value : '--';
  const displayUnit = isConnected ? unit : '';
  const statusColor = !isConnected ? 'text-neutral-600' : (status === 'CRITICAL' ? 'text-red-500' : (status === 'WARNING' ? 'text-amber-500' : 'text-emerald-500'));
  
  return (
    <div className="bg-black border border-neutral-800 p-3 rounded flex flex-col justify-between h-20">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[10px] tracking-wider text-neutral-500 uppercase">{label}</span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${!isConnected ? 'bg-neutral-900 text-neutral-600' : (sourceMode === 'SIMULATED' ? 'bg-cyan-900/30 text-cyan-400' : 'bg-emerald-900/30 text-emerald-400')}`}>
          {isConnected ? sourceMode : 'NOT CONNECTED'}
        </span>
      </div>
      <div className="flex items-end gap-1">
        <span className={`text-lg font-bold ${statusColor}`}>{displayValue}</span>
        <span className="text-xs text-neutral-500 mb-0.5">{displayUnit}</span>
      </div>
    </div>
  );
};

export default function OperationsLivePage() {
  const { connectionState, classification, twinState, setTwinState, telemetry, safety, mission, events } = useGatewayStream();
  
  const [bottomExpanded, setBottomExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState('controls');
  const [executingCommands, setExecutingCommands] = useState({});
  const [estopLoading, setEstopLoading] = useState(false);

  const isOnline = connectionState === 'CONNECTED';
  const isSimulated = classification === 'SIMULATED';

  const handleCommand = async (cmd, payload = {}) => {
    if (!isOnline) return;
    
    let endpoint = '/api/operations/command/robot';
    let action = cmd;
    let actualPayload = payload;

    if (cmd === 'move') {
      if (payload.x === 0 && payload.y === 1) action = 'forward';
      else if (payload.x === 0 && payload.y === -1) action = 'reverse';
      else if (payload.x === -1 && payload.y === 0) action = 'left';
      else if (payload.x === 1 && payload.y === 0) action = 'right';
      else if (payload.x === 0 && payload.y === 0) action = 'stop';
      else action = 'stop';
    } else if (cmd === 'arm') {
      action = 'arm_move';
      actualPayload = {
        xExtension: payload.x !== undefined ? parseFloat(payload.x) : (twinState?.arm?.xExtension || 0),
        yPosition: payload.y !== undefined ? parseFloat(payload.y) : (twinState?.arm?.yPosition || 0)
      };
    } else if (cmd === 'torch') {
      action = payload.toggle ? (twinState?.torch?.enabled ? 'torch_off' : 'torch_request') : 'torch_off';
    } else if (cmd === 'magnet') {
      action = payload.toggle ? (twinState?.electromagnet?.enabled ? 'electromagnet_release' : 'electromagnet_engage') : 'electromagnet_release';
    } else if (cmd === 'estop') {
      endpoint = '/api/operations/command/safety';
      action = payload.action === 'trigger' ? 'estop' : 'clear_estop';
    } else if (cmd === 'stop') {
      action = 'stop';
    }

    setExecutingCommands(prev => ({ ...prev, [cmd]: true }));
    if (cmd === 'estop') setEstopLoading(true);
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, payload: actualPayload })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('Command Rejected:', data.reason);
      }
    } catch (err) {
      console.error('Command Error:', err);
    } finally {
      setExecutingCommands(prev => ({ ...prev, [cmd]: false }));
      if (cmd === 'estop') setEstopLoading(false);
    }
  };

  const handleCameraTarget = (target) => {
    setTwinState(prev => ({
      ...prev,
      cameraTarget: target,
      cameraFocusTrigger: Date.now(),
      followMode: target !== 'origin'
    }));
  };

  return (
    <div className="flex flex-col h-full bg-neutral-950 text-white overflow-hidden font-sans">
      
      {/* SECONDARY HEADER */}
      <div className="h-10 bg-black border-b border-neutral-800 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="w-4 h-4 text-emerald-500" /> : <Link2Off className="w-4 h-4 text-red-500" />}
            <span className="font-mono text-xs text-neutral-400">LINK:</span>
            <span className={`font-mono text-xs font-bold ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>{connectionState}</span>
            <span className={`font-mono text-[10px] ml-2 px-1.5 py-0.5 rounded bg-neutral-900 ${isSimulated ? 'text-cyan-500' : 'text-neutral-500'}`}>{classification}</span>
          </div>
          <div className="flex items-center gap-2 border-l border-neutral-800 pl-6">
            <ShieldAlert className={`w-4 h-4 ${safety?.emergencyStateActive ? 'text-red-500' : safety?.level === 'WARNING' ? 'text-amber-500' : 'text-emerald-500'}`} />
            <span className="font-mono text-xs text-neutral-400">SAFETY:</span>
            <span className={`font-mono text-xs font-bold ${safety?.emergencyStateActive ? 'text-red-500' : safety?.level === 'WARNING' ? 'text-amber-500' : 'text-emerald-500'}`}>{safety?.level || 'UNKNOWN'}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            className={`px-4 py-1.5 font-bold font-mono text-xs rounded transition-colors ${safety?.emergencyStateActive ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse' : 'bg-red-950 hover:bg-red-900 text-red-500 border border-red-900'}`}
            onClick={() => handleCommand('estop', { action: 'trigger' })}
            disabled={estopLoading || !isOnline}
          >
            {estopLoading ? 'SENDING...' : (safety?.emergencyStateActive ? 'E-STOP ACTIVE' : 'E-STOP')}
          </button>
          {safety?.emergencyStateActive && (
            <button 
              className="px-4 py-1.5 font-bold font-mono text-xs rounded transition-colors bg-neutral-800 hover:bg-neutral-700 text-neutral-300"
              onClick={() => handleCommand('estop', { action: 'clear' })}
              disabled={estopLoading || !isOnline}
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex flex-1 overflow-hidden relative">
        
        {/* CENTER: Digital Twin */}
        <div className="flex-1 relative flex flex-col bg-neutral-900">
          <div className="absolute top-4 left-4 z-10 flex gap-2">
             <button onClick={() => handleCameraTarget('robot')} className="bg-black/60 backdrop-blur text-neutral-300 hover:text-white px-3 py-1.5 rounded border border-neutral-700 flex items-center gap-2 text-xs font-mono transition-colors">
               <Video className="w-3.5 h-3.5"/> FOCUS ROBOT
             </button>
             <button onClick={() => handleCameraTarget('cut')} className="bg-black/60 backdrop-blur text-neutral-300 hover:text-white px-3 py-1.5 rounded border border-neutral-700 flex items-center gap-2 text-xs font-mono transition-colors">
               <Crosshair className="w-3.5 h-3.5"/> FOCUS CUT
             </button>
          </div>
          
          <div className="flex-1 w-full h-full relative">
            <TwinProvider state={twinState}>
               <SharedDigitalTwin />
            </TwinProvider>
          </div>
        </div>

        {/* RIGHT SIDEBAR: Telemetry Summary */}
        <div className="w-80 bg-black border-l border-neutral-800 flex flex-col shrink-0 overflow-y-auto z-10">
          <div className="p-4 space-y-6">
            
            {/* Robot State */}
            <div>
              <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Activity className="w-3.5 h-3.5" /> Core State
              </h4>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded p-3 text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">CONNECTION</span>
                  <span className={`font-bold ${isOnline ? 'text-emerald-500' : 'text-red-500'}`}>{connectionState}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">POWER VOLT</span>
                  <span className="text-neutral-300">{telemetry?.powerVoltage ? `${telemetry.powerVoltage.toFixed(1)}V` : 'UNKNOWN'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">POWER CURR</span>
                  <span className="text-neutral-300">{telemetry?.powerCurrent ? `${telemetry.powerCurrent.toFixed(1)}A` : 'UNKNOWN'}</span>
                </div>
              </div>
            </div>

            {/* Mission */}
            <div>
              <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Crosshair className="w-3.5 h-3.5" /> Active Mission
              </h4>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded p-3 text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">MISSION ID</span>
                  <span className="text-neutral-400">{mission?.id ? mission.id.substring(0,8) : 'NONE'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">SHIP</span>
                  <span className="text-neutral-400 truncate max-w-[120px] text-right">{mission?.shipName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">SECTION</span>
                  <span className="text-neutral-400 truncate max-w-[120px] text-right">{mission?.hullSection || 'N/A'}</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t border-neutral-800">
                  <span className="text-neutral-500">STATUS</span>
                  <span className="text-cyan-500 font-bold">{mission?.status || 'NO ACTIVE MISSION'}</span>
                </div>
                <div className="w-full bg-neutral-950 h-1.5 rounded overflow-hidden mt-1">
                  <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${mission?.progressPercentage || 0}%` }}></div>
                </div>
              </div>
            </div>

            {/* Safety & Permissions */}
            <div>
              <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <ShieldAlert className="w-3.5 h-3.5" /> Safety & Permissions
              </h4>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded p-3 text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">SYSTEM LEVEL</span>
                  <span className={`font-bold ${safety?.level === 'NORMAL' ? 'text-emerald-500' : 'text-red-500'}`}>{safety?.level || 'UNKNOWN'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">MOVEMENT</span>
                  <span className={safety?.movementPermission ? 'text-emerald-500' : 'text-red-500'}>{safety?.movementPermission ? 'GRANTED' : 'BLOCKED'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">TORCH</span>
                  <span className={safety?.torchPermission ? 'text-emerald-500' : 'text-red-500'}>{safety?.torchPermission ? 'GRANTED' : 'BLOCKED'}</span>
                </div>
                {safety?.activeHazards?.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-neutral-800 text-red-400">
                    <div className="font-bold mb-1">ACTIVE HAZARDS:</div>
                    {safety.activeHazards.map(h => (
                      <div key={h.id} className="text-[10px] break-words leading-tight mb-1">- {h.description}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Health / Diagnostics */}
            <div>
              <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                <Settings className="w-3.5 h-3.5" /> Robot Health
              </h4>
              <div className="bg-neutral-900/50 border border-neutral-800 rounded p-3 text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">MOTORS</span>
                  <span className={telemetry?.motors?.tempLeft > 60 || telemetry?.motors?.tempRight > 60 ? 'text-amber-500' : 'text-emerald-500'}>{telemetry ? 'OK' : 'UNKNOWN'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">SENSORS</span>
                  <span className="text-emerald-500">{telemetry ? 'OK' : 'UNKNOWN'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">END EFFECTOR</span>
                  <span className="text-emerald-500">{telemetry ? 'OK' : 'UNKNOWN'}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BOTTOM PANEL */}
      <footer className={`border-t border-neutral-800 bg-neutral-950 flex flex-col shrink-0 transition-all duration-300 ${bottomExpanded ? 'h-64' : 'h-10'}`}>
        <div className="h-10 px-2 flex items-center justify-between border-b border-neutral-900">
          <div className="flex h-full">
            <button 
              className={`h-full px-4 text-[10px] font-mono tracking-widest uppercase border-b-2 ${activeTab === 'controls' && bottomExpanded ? 'border-accent-cyan text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => { setActiveTab('controls'); setBottomExpanded(true); }}
            >
              Control Panel
            </button>
            <button 
              className={`h-full px-4 text-[10px] font-mono tracking-widest uppercase border-b-2 ${activeTab === 'sensors' && bottomExpanded ? 'border-accent-cyan text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => { setActiveTab('sensors'); setBottomExpanded(true); }}
            >
              Sensor Streams
            </button>
            <button 
              className={`h-full px-4 text-[10px] font-mono tracking-widest uppercase border-b-2 ${activeTab === 'events' && bottomExpanded ? 'border-accent-cyan text-white' : 'border-transparent text-neutral-500 hover:text-neutral-300'}`}
              onClick={() => { setActiveTab('events'); setBottomExpanded(true); }}
            >
              Event History
            </button>
          </div>
          <button 
            className="text-neutral-500 hover:text-white p-2"
            onClick={() => setBottomExpanded(!bottomExpanded)}
          >
            {bottomExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>
        
        {bottomExpanded && (
          <div className="flex-1 overflow-hidden relative bg-black">
            
            {/* TAB: CONTROLS */}
            {activeTab === 'controls' && (
              <div className={`h-full p-4 flex gap-8 overflow-x-auto font-mono items-start ${!isOnline ? 'opacity-50 pointer-events-none' : ''}`}>
                
                {/* Movement */}
                <div className="flex flex-col shrink-0">
                  <h4 className="text-[10px] text-neutral-500 mb-3 uppercase tracking-widest">Base Movement</h4>
                  <div className="flex flex-col items-center gap-1">
                    <button 
                      className="w-12 h-10 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center hover:bg-neutral-800 active:bg-cyan-900 disabled:opacity-30 text-neutral-400"
                      onMouseDown={() => handleCommand('move', {y: 1})}
                      onMouseUp={() => handleCommand('move', {y: 0})}
                      disabled={!isOnline || !safety?.movementPermission || executingCommands['move']}
                    ><ArrowUp size={16}/></button>
                    <div className="flex gap-1">
                      <button 
                        className="w-12 h-10 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center hover:bg-neutral-800 active:bg-cyan-900 disabled:opacity-30 text-neutral-400"
                        onMouseDown={() => handleCommand('move', {x: -1})}
                        onMouseUp={() => handleCommand('move', {x: 0})}
                        disabled={!isOnline || !safety?.movementPermission || executingCommands['move']}
                      ><ArrowLeft size={16}/></button>
                      <button 
                        className="w-12 h-10 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center hover:bg-neutral-800 active:bg-cyan-900 disabled:opacity-30 text-neutral-400"
                        onMouseDown={() => handleCommand('move', {y: -1})}
                        onMouseUp={() => handleCommand('move', {y: 0})}
                        disabled={!isOnline || !safety?.movementPermission || executingCommands['move']}
                      ><ArrowDown size={16}/></button>
                      <button 
                        className="w-12 h-10 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center hover:bg-neutral-800 active:bg-cyan-900 disabled:opacity-30 text-neutral-400"
                        onMouseDown={() => handleCommand('move', {x: 1})}
                        onMouseUp={() => handleCommand('move', {x: 0})}
                        disabled={!isOnline || !safety?.movementPermission || executingCommands['move']}
                      ><ArrowRight size={16}/></button>
                    </div>
                  </div>
                </div>

                {/* Arm */}
                <div className="flex flex-col shrink-0">
                  <h4 className="text-[10px] text-neutral-500 mb-3 uppercase tracking-widest">Arm Control</h4>
                  <div className="flex flex-col items-center gap-1">
                    <button 
                      className="w-12 h-10 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center hover:bg-neutral-800 active:bg-cyan-900 disabled:opacity-30 text-neutral-400"
                      onClick={() => handleCommand('arm', {y: (twinState?.arm?.yPosition || 0) + 0.1})}
                      disabled={!isOnline || !safety?.movementPermission || executingCommands['arm']}
                    ><ArrowUp size={16}/></button>
                    <div className="flex gap-1">
                      <button 
                        className="w-12 h-10 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center hover:bg-neutral-800 active:bg-cyan-900 disabled:opacity-30 text-neutral-400"
                        onClick={() => handleCommand('arm', {x: (twinState?.arm?.xExtension || 0) - 0.1})}
                        disabled={!isOnline || !safety?.movementPermission || executingCommands['arm']}
                      ><ArrowLeft size={16}/></button>
                      <button 
                        className="w-12 h-10 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center hover:bg-neutral-800 active:bg-cyan-900 disabled:opacity-30 text-neutral-400"
                        onClick={() => handleCommand('arm', {y: (twinState?.arm?.yPosition || 0) - 0.1})}
                        disabled={!isOnline || !safety?.movementPermission || executingCommands['arm']}
                      ><ArrowDown size={16}/></button>
                      <button 
                        className="w-12 h-10 bg-neutral-900 border border-neutral-800 rounded flex items-center justify-center hover:bg-neutral-800 active:bg-cyan-900 disabled:opacity-30 text-neutral-400"
                        onClick={() => handleCommand('arm', {x: (twinState?.arm?.xExtension || 0) + 0.1})}
                        disabled={!isOnline || !safety?.movementPermission || executingCommands['arm']}
                      ><ArrowRight size={16}/></button>
                    </div>
                  </div>
                </div>

                {/* Effectors */}
                <div className="flex flex-col shrink-0 min-w-48">
                  <h4 className="text-[10px] text-neutral-500 mb-3 uppercase tracking-widest">End Effectors</h4>
                  <div className="space-y-2">
                    <button 
                      className={`w-full py-2.5 rounded text-xs font-bold border transition-colors ${twinState?.torch?.enabled ? 'bg-orange-500 text-white border-orange-400' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'}`}
                      onClick={() => handleCommand('torch', {toggle: true})}
                      disabled={!isOnline || !safety?.torchPermission || executingCommands['torch']}
                    >
                      {twinState?.torch?.enabled ? 'TORCH ACTIVE' : 'IGNITE TORCH'}
                    </button>
                    <button 
                      className={`w-full py-2.5 rounded text-xs font-bold border transition-colors ${twinState?.electromagnet?.enabled ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:bg-neutral-800'}`}
                      onClick={() => handleCommand('magnet', {toggle: true})}
                      disabled={!isOnline || executingCommands['magnet']}
                    >
                      {twinState?.electromagnet?.enabled ? 'MAGNET ENGAGED' : 'ENGAGE MAGNET'}
                    </button>
                    <button 
                      className="w-full py-2.5 rounded text-xs font-bold border border-red-900 bg-red-950 text-red-500 hover:bg-red-900 transition-colors mt-2"
                      onClick={() => handleCommand('stop', {})}
                      disabled={!isOnline || executingCommands['stop']}
                    >
                      HALT ALL MOVEMENT
                    </button>
                  </div>
                </div>

              </div>
            )}

            {/* TAB: SENSORS */}
            {activeTab === 'sensors' && (
              <div className="h-full p-4 overflow-y-auto font-mono text-xs">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <LiveSensorCard label="Power Voltage" value={telemetry?.powerVoltage?.toFixed(1)} unit="V" status={telemetry?.powerVoltage < 22 ? 'CRITICAL' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
                  <LiveSensorCard label="Power Current" value={telemetry?.powerCurrent?.toFixed(1)} unit="A" status={telemetry?.powerCurrent > 50 ? 'WARNING' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
                  <LiveSensorCard label="L Motor Temp" value={telemetry?.motors?.tempLeft?.toFixed(0)} unit="C" status={telemetry?.motors?.tempLeft > 60 ? 'WARNING' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
                  <LiveSensorCard label="R Motor Temp" value={telemetry?.motors?.tempRight?.toFixed(0)} unit="C" status={telemetry?.motors?.tempRight > 60 ? 'WARNING' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
                  
                  <LiveSensorCard label="Oxy Pressure" value={telemetry?.gas?.oxyPressurePsi?.toFixed(1)} unit="psi" status="NORMAL" sourceMode={telemetry?.sourceMode} />
                  <LiveSensorCard label="Ace Pressure" value={telemetry?.gas?.acePressurePsi?.toFixed(1)} unit="psi" status="NORMAL" sourceMode={telemetry?.sourceMode} />
                  <LiveSensorCard label="Mag Current" value={telemetry?.hardware?.electromagnetCurrent?.toFixed(1)} unit="A" status="NORMAL" sourceMode={telemetry?.sourceMode} />
                  <LiveSensorCard label="Torch State" value={telemetry?.gas?.torchStatus} unit="" status="NORMAL" sourceMode={telemetry?.sourceMode} />

                  <LiveSensorCard label="Env Temp" value={telemetry?.environment?.temperatureC?.toFixed(1)} unit="C" status="NORMAL" sourceMode={telemetry?.sourceMode} />
                  <LiveSensorCard label="Env Humidity" value={telemetry?.environment?.humidityPercentage?.toFixed(0)} unit="%" status="NORMAL" sourceMode={telemetry?.sourceMode} />
                  <LiveSensorCard label="Combustible Gas" value={telemetry?.environment?.combustibleGasLel?.toFixed(1)} unit="%LEL" status={telemetry?.environment?.combustibleGasLel > 10 ? 'CRITICAL' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
                  <LiveSensorCard label="Wind Speed" value={telemetry?.environment?.windSpeedKmh?.toFixed(1)} unit="km/h" status="NORMAL" sourceMode={telemetry?.sourceMode} />
                </div>
              </div>
            )}

            {/* TAB: EVENTS */}
            {activeTab === 'events' && (
              <div className="h-full p-4 overflow-y-auto font-mono text-xs space-y-1">
                {events.map((ev, i) => (
                  <div key={ev.id || i} className={`p-1.5 border-l-2 ${ev.severity === 'CRITICAL' ? 'border-red-500 text-red-400 bg-red-950/20' : ev.severity === 'WARNING' ? 'border-amber-500 text-amber-400 bg-amber-950/20' : 'border-neutral-700 text-neutral-400'}`}>
                    <span className="opacity-50 mr-2">[{new Date(ev.timestamp).toLocaleTimeString()}]</span>
                    <span className="font-bold mr-2">[{ev.category}]</span>
                    {ev.message}
                  </div>
                ))}
                {events.length === 0 && <div className="text-neutral-500 italic">No events recorded.</div>}
              </div>
            )}
          </div>
        )}
      </footer>
    </div>
  );
}
