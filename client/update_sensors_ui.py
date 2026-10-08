# -*- coding: utf-8 -*-
import re

with open('src/pages/OperationsLivePage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

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

# Insert LiveSensorCard after the imports
if 'LiveSensorCard' not in content:
    content = re.sub(r'(import \{ DigitalTwin.*?\}\s*from\s*\'@titan/digital-twin\';)', r'\1\n' + card_component, content)

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

content = re.sub(r'\{activeTab === \'sensors\' && \(.*?\}\)\}', new_sensors_tab, content, flags=re.DOTALL)

with open('src/pages/OperationsLivePage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated activeTab sensors UI')
