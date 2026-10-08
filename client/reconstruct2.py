# -*- coding: utf-8 -*-
import subprocess
import re

# Get the original file content using git show to avoid encoding issues from PowerShell redirects
result = subprocess.run(['git', 'show', 'HEAD:client/src/pages/OperationsLivePage.jsx'], capture_output=True, text=True, encoding='utf-8')
orig = result.stdout

# EXTRACT HOOK PROPERLY
match = re.search(r'(const useGatewayStream = \(\) => \{.*?\n\s*\};\s*)\nexport default function OperationsLivePage', orig, re.DOTALL)
if match:
    hook_body = match.group(1)
    
    # 1. Update setTelemetry in hook_body
    old_telemetry = r'''              if \(arr\.length > 0\) \{\s*const latest = arr\[0\];\s*setTelemetry\(\{.*?\}\);\s*\}'''
    new_telemetry = r'''              if (arr.length > 0) {
                const latest = arr[0];
                setTelemetry({
                  powerVoltage: latest?.robot?.powerVoltage,
                  powerCurrent: latest?.robot?.powerCurrent,
                  motors: latest?.motors,
                  imu: latest?.imu,
                  gas: latest?.gas,
                  environment: latest?.environment,
                  hardware: latest?.hardware,
                  sourceMode: latest?.sourceMode || 'OFFLINE',
                  raw: latest
                });
              }'''
    hook_body = re.sub(old_telemetry, new_telemetry, hook_body, flags=re.DOTALL)
    
    hook_file_content = "import { useState, useEffect, useRef } from 'react';\n\n" + hook_body + "\nexport default useGatewayStream;\n"
    with open('src/hooks/useGatewayStream.js', 'w', encoding='utf-8') as f:
        f.write(hook_file_content)
    
    # 2. Modify orig to remove hook and add imports
    new_orig = orig.replace(match.group(1), "")
    new_orig = re.sub(
        r'(import \{ DigitalTwin.*?\}\s*from\s*\'@titan/digital-twin\';)',
        r"\1\nimport useGatewayStream from '../hooks/useGatewayStream';",
        new_orig
    )
    
    # 3. Add MISSION ID block
    new_mission_block = r'''                <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5" /> Mission
                </h4>
                <div className="bg-black border border-neutral-800 rounded p-3 text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">MISSION ID</span>
                    <span className="text-neutral-600">{mission?.id ? mission.id.substring(0,8) : 'NONE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SHIP</span>
                    <span className="text-neutral-600 truncate max-w-[120px] text-right">{mission?.shipName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SECTION</span>
                    <span className="text-neutral-600 truncate max-w-[120px] text-right">{mission?.hullSection || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">OBJECTIVE</span>
                    <span className="text-neutral-600 truncate max-w-[120px] text-right">{mission?.objective || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-neutral-800">
                    <span className="text-neutral-500">STATUS</span>
                    <span className="text-cyan-500 font-bold">{mission?.status || 'NO ACTIVE MISSION'}</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded overflow-hidden mt-1">
                    <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${mission?.progressPercentage || 0}%` }}></div>
                  </div>
                </div>'''
    old_mission_block = r'<h4 className="text-\[10px\] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">\s*<Crosshair className="w-3\.5 h-3\.5" /> Mission\s*</h4>\s*<div className="bg-black border border-neutral-800 rounded p-3 text-xs font-mono">\s*<div className="flex justify-between mb-2">\s*<span className="text-neutral-500">STATUS</span>.*?</div>\s*</div>'
    new_orig = re.sub(old_mission_block, new_mission_block, new_orig, flags=re.DOTALL)
    
    # 4. Add LiveSensorCard component
    card_component = '''
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
'''
    new_orig = re.sub(r'(import useGatewayStream from \'\.\./hooks/useGatewayStream\';)', r'\1\n' + card_component, new_orig)
    
    # 5. Update bottom panel sensors
    new_sensors_tab = '''            {activeTab === 'sensors' && (
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
              )}'''
    new_orig = re.sub(r'\{activeTab === \'sensors\' && \(.*?\}\)\}', new_sensors_tab, new_orig, flags=re.DOTALL)
    
    with open('src/pages/OperationsLivePage.jsx', 'w', encoding='utf-8') as f:
        f.write(new_orig)
        
    print("Reconstruction complete!")
else:
    print("Regex failed to match hook body")
