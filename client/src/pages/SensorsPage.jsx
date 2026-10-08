import React, { useState, useEffect } from 'react';
import useGatewayStream from '../hooks/useGatewayStream';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Activity, Flame, Thermometer, Battery, Wind } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  elements: { point: { radius: 0 } },
  scales: {
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'monospace', size: 10 } }
    },
    x: {
      grid: { display: false },
      ticks: { color: 'rgba(255, 255, 255, 0.5)', font: { family: 'monospace', size: 10 }, maxRotation: 0 }
    }
  },
  plugins: { legend: { labels: { color: 'rgba(255, 255, 255, 0.7)', font: { family: 'monospace', size: 11 } } } }
};

const SensorCard = ({ label, value, unit, status = 'NORMAL', sourceMode = 'NOT CONNECTED' }) => {
  const isConnected = value !== undefined && value !== null && sourceMode !== 'OFFLINE' && sourceMode !== 'NOT CONNECTED';
  const displayValue = isConnected ? value : '--';
  const displayUnit = isConnected ? unit : '';
  const statusColor = !isConnected ? 'text-neutral-600' : (status === 'CRITICAL' ? 'text-red-500' : (status === 'WARNING' ? 'text-amber-500' : 'text-emerald-500'));
  
  return (
    <div className="bg-black border border-neutral-800 p-4 rounded flex flex-col justify-between">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs tracking-wider text-neutral-500 uppercase font-bold">{label}</span>
        <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${!isConnected ? 'bg-neutral-900 text-neutral-600' : (sourceMode === 'SIMULATED' ? 'bg-cyan-900/30 text-cyan-400' : 'bg-emerald-900/30 text-emerald-400')}`}>
          {isConnected ? sourceMode : 'NOT CONNECTED'}
        </span>
      </div>
      <div className="flex items-end gap-1.5">
        <span className={`text-2xl font-mono font-bold ${statusColor}`}>{displayValue}</span>
        <span className="text-sm font-mono text-neutral-500 mb-0.5">{displayUnit}</span>
      </div>
    </div>
  );
};

export default function SensorsPage() {
  const { connectionState, classification, telemetry } = useGatewayStream();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (telemetry?.raw) {
      setHistory(prev => {
        const next = [...prev, telemetry];
        if (next.length > 50) return next.slice(next.length - 50);
        return next;
      });
    }
  }, [telemetry]);

  const timeLabels = history.map((_, i) => i.toString());

  const powerData = {
    labels: timeLabels,
    datasets: [
      { label: 'Voltage (V)', data: history.map(h => h.powerVoltage || 0), borderColor: '#2dd4bf', borderWidth: 2, tension: 0.1, yAxisID: 'y' },
      { label: 'Current (A)', data: history.map(h => h.powerCurrent || 0), borderColor: '#fbbf24', borderWidth: 2, tension: 0.1, yAxisID: 'y' }
    ]
  };

  const motorData = {
    labels: timeLabels,
    datasets: [
      { label: 'Left Temp (C)', data: history.map(h => h.motors?.tempLeft || 0), borderColor: '#f87171', borderWidth: 2, tension: 0.1 },
      { label: 'Right Temp (C)', data: history.map(h => h.motors?.tempRight || 0), borderColor: '#ef4444', borderWidth: 2, tension: 0.1 }
    ]
  };

  const gasData = {
    labels: timeLabels,
    datasets: [
      { label: 'Oxy Flow', data: history.map(h => h.gas?.oxyFlowRate || 0), borderColor: '#38bdf8', borderWidth: 2, tension: 0.1 },
      { label: 'Ace Flow', data: history.map(h => h.gas?.aceFlowRate || 0), borderColor: '#c084fc', borderWidth: 2, tension: 0.1 },
      { label: 'Combustible Gas (LEL)', data: history.map(h => h.environment?.combustibleGasLel || 0), borderColor: '#fb7185', borderWidth: 2, tension: 0.1 }
    ]
  };

  return (
    <div className="flex h-screen bg-neutral-950 text-white font-sans pt-16 overflow-y-auto">
      <div className="max-w-7xl mx-auto w-full p-6 space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-end border-b border-neutral-800 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-wide flex items-center gap-3">
              <Activity className="text-cyan-500" />
              TELEMETRY & SENSORS
            </h1>
            <p className="text-neutral-500 text-sm mt-1">Real-time operational hardware metrics and environment tracking.</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-black border border-neutral-800 px-4 py-2 rounded flex flex-col items-end">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Data Classification</span>
              <span className={`text-sm font-mono font-bold ${classification === 'SIMULATED' ? 'text-cyan-400' : classification === 'LIVE' ? 'text-emerald-400' : 'text-neutral-500'}`}>
                {classification}
              </span>
            </div>
            <div className="bg-black border border-neutral-800 px-4 py-2 rounded flex flex-col items-end">
              <span className="text-[10px] text-neutral-500 uppercase tracking-widest font-bold">Link Status</span>
              <span className={`text-sm font-mono font-bold ${connectionState === 'CONNECTED' ? 'text-emerald-400' : connectionState === 'DEGRADED' ? 'text-amber-400' : 'text-red-400'}`}>
                {connectionState}
              </span>
            </div>
          </div>
        </div>

        {/* Robot Sensors Grid */}
        <div>
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Battery className="w-4 h-4" /> Robot Platform Telemetry
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <SensorCard label="Power Voltage" value={telemetry?.powerVoltage?.toFixed(1)} unit="V" status={telemetry?.powerVoltage < 22 ? 'CRITICAL' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            <SensorCard label="Power Current" value={telemetry?.powerCurrent?.toFixed(1)} unit="A" status={telemetry?.powerCurrent > 50 ? 'WARNING' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            <SensorCard label="L Motor Temp" value={telemetry?.motors?.tempLeft?.toFixed(0)} unit="C" status={telemetry?.motors?.tempLeft > 60 ? 'WARNING' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            <SensorCard label="R Motor Temp" value={telemetry?.motors?.tempRight?.toFixed(0)} unit="C" status={telemetry?.motors?.tempRight > 60 ? 'WARNING' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            <SensorCard label="Vibration" value={telemetry?.hardware?.vibrationLevel?.toFixed(2)} unit="g" status={telemetry?.hardware?.vibrationLevel > 2.0 ? 'CRITICAL' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            
            <SensorCard label="Tilt X" value={telemetry?.imu?.tiltAngle?.toFixed(1)} unit="deg" status={telemetry?.imu?.tiltAngle > 15 ? 'CRITICAL' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            <SensorCard label="Accel Z" value={telemetry?.imu?.acceleration?.z?.toFixed(2)} unit="m/s" status="NORMAL" sourceMode={telemetry?.sourceMode} />
            <SensorCard label="Mag Current" value={telemetry?.hardware?.electromagnetCurrent?.toFixed(1)} unit="A" status={telemetry?.hardware?.electromagnetCurrent < 0.5 ? 'WARNING' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            <SensorCard label="Oxy Pressure" value={telemetry?.gas?.oxyPressurePsi?.toFixed(1)} unit="psi" status="NORMAL" sourceMode={telemetry?.sourceMode} />
            <SensorCard label="Ace Pressure" value={telemetry?.gas?.acePressurePsi?.toFixed(1)} unit="psi" status="NORMAL" sourceMode={telemetry?.sourceMode} />
          </div>
        </div>

        {/* Environment Sensors Grid */}
        <div>
          <h2 className="text-sm font-bold text-neutral-400 uppercase tracking-widest mb-4 mt-8 flex items-center gap-2">
            <Wind className="w-4 h-4" /> Environmental Telemetry
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <SensorCard label="Temperature" value={telemetry?.environment?.temperatureC?.toFixed(1)} unit="C" status="NORMAL" sourceMode={telemetry?.sourceMode} />
            <SensorCard label="Humidity" value={telemetry?.environment?.humidityPercentage?.toFixed(0)} unit="%" status="NORMAL" sourceMode={telemetry?.sourceMode} />
            <SensorCard label="Wind Speed" value={telemetry?.environment?.windSpeedKmh?.toFixed(1)} unit="km/h" status={telemetry?.environment?.windSpeedKmh > 35 ? 'WARNING' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            <SensorCard label="Combustible Gas" value={telemetry?.environment?.combustibleGasLel?.toFixed(1)} unit="%LEL" status={telemetry?.environment?.combustibleGasLel > 10 ? 'CRITICAL' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            <SensorCard label="O2 Level" value={telemetry?.environment?.o2Percentage?.toFixed(1)} unit="%" status={telemetry?.environment?.o2Percentage < 19.5 ? 'CRITICAL' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            <SensorCard label="CO Level" value={telemetry?.environment?.coPpm?.toFixed(0)} unit="PPM" status={telemetry?.environment?.coPpm > 25 ? 'WARNING' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            <SensorCard label="CO2 Level" value={telemetry?.environment?.co2Ppm?.toFixed(0)} unit="PPM" status={telemetry?.environment?.co2Ppm > 5000 ? 'WARNING' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            <SensorCard label="Pressure" value={telemetry?.environment?.atmosphericPressureHpa?.toFixed(0)} unit="hPa" status="NORMAL" sourceMode={telemetry?.sourceMode} />
            <SensorCard label="Visibility" value={telemetry?.environment?.visibilityStatus} unit="" status={telemetry?.environment?.visibilityStatus === 'POOR' ? 'WARNING' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
            <SensorCard label="Rain" value={telemetry?.environment?.rain ? 'YES' : 'NO'} unit="" status={telemetry?.environment?.rain ? 'WARNING' : 'NORMAL'} sourceMode={telemetry?.sourceMode} />
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-6">
          <div className="bg-black border border-neutral-800 p-4 rounded h-64 flex flex-col">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Power Systems</h3>
            <div className="flex-1"><Line data={powerData} options={chartOptions} /></div>
          </div>
          <div className="bg-black border border-neutral-800 p-4 rounded h-64 flex flex-col">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Motor Temperature</h3>
            <div className="flex-1"><Line data={motorData} options={chartOptions} /></div>
          </div>
          <div className="bg-black border border-neutral-800 p-4 rounded h-64 flex flex-col">
            <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-4">Gas & Environment</h3>
            <div className="flex-1"><Line data={gasData} options={chartOptions} /></div>
          </div>
        </div>

      </div>
    </div>
  );
}
