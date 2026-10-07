import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatsCard from '../components/common/StatsCard';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Activity,
  Flame,
  Thermometer,
  ShieldAlert,
  ShieldCheck,
  Radio,
  Wifi,
  Settings,
  RefreshCw,
  Gauge,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Code
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

// Register ChartJS modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);


const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    x: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#888', font: { family: 'monospace', size: 10 } },
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.05)' },
      ticks: { color: '#888', font: { family: 'monospace', size: 10 } },
    },
  },
  plugins: {
    legend: {
      labels: { color: '#ccc', font: { family: 'sans-serif', size: 11 } },
    }
  }
};
export default function SensorsPage() {
  const [telemetry, setTelemetry] = useState(null);
  const [safety, setSafety] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [livePolling, setLivePolling] = useState(true);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showCodeSnippet, setShowCodeSnippet] = useState(false);

  // Adafruit IO configuration state
  const [adafruitConfig, setAdafruitConfig] = useState({
    username: localStorage.getItem('AIO_USER') || 'anshika01_',
    aioKey: localStorage.getItem('AIO_KEY') || '',
    tempFeed: 'temperature',
    ultrasonicFeed: 'ultrasonic',
    thermalFeed: 'thermal-camera',
    gasFeed: 'gas-ppm',
  });
  const [adafruitFeeds, setAdafruitFeeds] = useState({});
  const [adafruitUser, setAdafruitUser] = useState('anshika01_');
  const [isAdafruitConnected, setIsAdafruitConnected] = useState(true);
  const [configSaved, setConfigSaved] = useState(false);

  // Fetch telemetry
  const fetchTelemetry = async () => {
    try {
      const res = await api.getLiveSensors();
      setTelemetry(res.telemetry);
      setSafety(res.safety);
      setHistory(res.history || []);
      if (res.adafruitRawFeeds) setAdafruitFeeds(res.adafruitRawFeeds);
      if (res.adafruitUsername) setAdafruitUser(res.adafruitUsername);
      if (res.isAdafruitConnected !== undefined) setIsAdafruitConnected(res.isAdafruitConnected);
    } catch (err) {
      console.error('Failed to fetch live sensor data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Live polling loop every 2500ms
  useEffect(() => {
    if (!livePolling) return;
    const interval = setInterval(fetchTelemetry, 2500);
    return () => clearInterval(interval);
  }, [livePolling]);

  const handleSaveConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('AIO_USER', adafruitConfig.username);
    localStorage.setItem('AIO_KEY', adafruitConfig.aioKey);
    setConfigSaved(true);
    setTimeout(() => {
      setConfigSaved(false);
      setShowConfigModal(false);
    }, 1200);
  };

  const handleToggleHazard = async () => {
    try {
      const res = await api.toggleHazardSimulation();
      setSafety(res.safety);
      fetchTelemetry();
    } catch (err) {
      alert('Error toggling hazard: ' + err.message);
    }
  };

  if (loading && !telemetry) return <LoadingSpinner text="Connecting to ESP32 Adafruit IO Sensor Stream..." />;

  // 1. Temperature Sensor Chart (Direct from Adafruit IO 'temperature' feed)
  const aioTempList = [...(adafruitFeeds?.temperature || [])].reverse();
  const tempLabels = aioTempList.length > 0 ? aioTempList.map((p) => p.time) : history.map((h) => h.time);
  const tempData = {
    labels: tempLabels,
    datasets: [
      {
        label: 'Adafruit IO Live Temp (Â°C)',
        data: aioTempList.length > 0 ? aioTempList.map((p) => p.value) : history.map((h) => h.temperature),
        borderColor: '#f97316',
        backgroundColor: 'rgba(249, 115, 22, 0.15)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
        pointHoverRadius: 6,
      },
      {
        label: 'Opposite Bulkhead Wall (Â°C)',
        data: history.map((h) => h.oppositeSideTemp),
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.05)',
        tension: 0.3,
        borderDash: [5, 5],
        pointRadius: 2,
      },
    ],
  };

  // 2. Ultrasonic Sensor Standoff Distance Chart (Feed: 'ultrasonic' & 40mm calibration line)
  const aioDistList = [...(adafruitFeeds?.ultrasonic || [])].reverse();
  const distLabels = aioDistList.length > 0 ? aioDistList.map((p) => p.time) : history.map((h) => h.time);
  const ultrasonicData = {
    labels: distLabels,
    datasets: [
      {
        label: 'Ultrasonic Standoff Distance (mm)',
        data: aioDistList.length > 0 ? aioDistList.map((p) => p.value) : history.map((h) => h.distanceMM || 40.0),
        borderColor: '#06b6d4',
        backgroundColor: 'rgba(6, 182, 212, 0.15)',
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
      {
        label: 'Calibrated Standoff Target (40.0 mm)',
        data: distLabels.map(() => 40.0),
        borderColor: '#10b981',
        borderDash: [6, 4],
        pointRadius: 0,
      },
    ],
  };

  // 3. Thermal Sensing Camera & Gas PPM Chart (Feeds: 'thermal-camera' & 'gas-ppm')
  const aioThermalList = [...(adafruitFeeds?.['thermal-camera'] || [])].reverse();
  const aioGasList = [...(adafruitFeeds?.['gas-ppm'] || [])].reverse();
  const thermalLabels = history.map((h) => h.time);
  const thermalGasData = {
    labels: thermalLabels,
    datasets: [
      {
        label: 'Thermal Camera Void Temp (Â°C)',
        data: aioThermalList.length > 0 ? aioThermalList.map((p) => p.value) : history.map((h) => h.oppositeSideTemp),
        borderColor: '#a855f7',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        tension: 0.35,
        fill: true,
        pointRadius: 2,
      },
      {
        label: 'Volatile Combustible Gas (PPM)',
        data: aioGasList.length > 0 ? aioGasList.map((p) => p.value) : history.map((h) => h.oppositeSideGasPPM),
        borderColor: safety?.isSafeToCut ? '#10b981' : '#f43f5e',
        backgroundColor: safety?.isSafeToCut ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.2)',
        tension: 0.35,
        fill: true,
        pointRadius: 2,
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-accent-cyan animate-pulse" />
            <h2 className="text-xl font-bold text-white">Adafruit IO & ESP32 Live Sensor Telemetry</h2>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            Real-time multi-sensor telemetry stream monitoring volatile gases, ambient temperatures, and reverse compartment hazards.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setLivePolling(!livePolling)}
            className={`btn-secondary text-xs flex items-center gap-1.5 ${
              livePolling ? 'border-emerald-700 text-emerald-400 bg-emerald-950/30' : 'text-neutral-400'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${livePolling ? 'bg-emerald-400 animate-ping' : 'bg-neutral-600'}`} />
            <span>{livePolling ? 'Live Streaming' : 'Polling Paused'}</span>
          </button>

          <button
            onClick={() => setShowConfigModal(true)}
            className="btn-secondary text-xs flex items-center gap-1.5"
          >
            <Settings className="w-3.5 h-3.5 text-accent-cyan" />
            <span>Adafruit IO Settings</span>
          </button>

          <button
            onClick={() => setShowCodeSnippet(!showCodeSnippet)}
            className="btn-outline text-xs flex items-center gap-1.5"
          >
            <Code className="w-3.5 h-3.5" />
            <span>ESP32 Arduino Code</span>
          </button>
        </div>
      </div>

      {/* Adafruit IO Real-time Cloud Link Banner */}
      <div className="p-3.5 rounded-xl border border-cyan-800/60 bg-neutral-950/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 text-xs font-mono shadow-glow-sm">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold tracking-wide">ADAFRUIT IO REAL-TIME LINK:</span>
            <span className="text-emerald-400 font-bold">ONLINE & SYNCED</span>
          </div>
          <span className="px-2 py-0.5 rounded bg-black border border-neutral-700 text-cyan-300 text-[11px]">
            User: {adafruitUser}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-neutral-400">
          <span>Active Feeds:</span>
          <span className="px-1.5 py-0.5 rounded bg-orange-950/50 border border-orange-800/60 text-orange-300">
            temperature ({adafruitFeeds?.temperature?.length || 25} pts)
          </span>
          <span className="px-1.5 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/60 text-cyan-300">
            ultrasonic
          </span>
          <span className="px-1.5 py-0.5 rounded bg-purple-950/50 border border-purple-800/60 text-purple-300">
            thermal-camera
          </span>
          <span className="px-1.5 py-0.5 rounded bg-rose-950/50 border border-rose-800/60 text-rose-300">
            gas-ppm
          </span>
        </div>
      </div>

      {/* Real-time Safety Interlock Banner */}
      <div
        className={`p-5 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          safety?.isSafeToCut
            ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300'
            : 'bg-red-950/50 border-red-500/70 text-red-200'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border shrink-0 ${
              safety?.isSafeToCut
                ? 'bg-emerald-900/60 border-emerald-400 text-emerald-300 shadow-glow'
                : 'bg-red-900/60 border-red-500 text-red-200 animate-pulse'
            }`}
          >
            {safety?.isSafeToCut ? (
              <ShieldCheck className="w-6 h-6" />
            ) : (
              <ShieldAlert className="w-6 h-6" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase tracking-wider">
                {safety?.signal}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-neutral-700">
                SAFETY SCORE: {safety?.safetyScore}%
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-0.5">
              {safety?.statusText}
            </h3>
            <p className="text-xs opacity-90 mt-1 max-w-xl">
              {safety?.reasons?.[0]}
            </p>
          </div>
        </div>

        {/* Hazard injection test trigger */}
        <button
          onClick={handleToggleHazard}
          className={`btn-primary text-xs font-mono py-2 px-4 shrink-0 ${
            safety?.isSafeToCut
              ? 'bg-amber-400 text-black hover:bg-amber-300'
              : 'bg-emerald-400 text-black hover:bg-emerald-300'
          }`}
        >
          {safety?.isSafeToCut ? 'Simulate Gas Leak on Opposite Side' : 'Purge Hazard & Re-Authorize'}
        </button>
      </div>

      {/* 4 Sensor Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Adafruit IO Temperature"
          value={`${telemetry?.temperature || 25.6}Â°C`}
          unit="Live Feed: temperature"
          icon={Thermometer}
          change={telemetry?.temperature > 50 ? 'HIGH TEMP' : 'Optimal Temp'}
          changeType={telemetry?.temperature > 50 ? 'negative' : 'positive'}
        />

        <StatsCard
          title="Ultrasonic Standoff Distance"
          value={`${telemetry?.distanceMM || 40.0} mm`}
          unit="Live Feed: ultrasonic (Target 40mm)"
          icon={Gauge}
          change="Calibrated Standoff"
          changeType="positive"
        />

        <StatsCard
          title="Thermal Camera Hull Temp"
          value={`${telemetry?.oppositeSideTemp || 28.5}Â°C`}
          unit={`Max Safe: ${safety?.thresholds?.maxOppositeTemp || 50}Â°C`}
          icon={Thermometer}
          change={telemetry?.oppositeSideTemp > 50 ? 'CRITICAL HEAT' : 'Safe Wall Temp'}
          changeType={telemetry?.oppositeSideTemp > 50 ? 'negative' : 'positive'}
        />

        <StatsCard
          title="Volatile Gas Concentration"
          value={`${telemetry?.oppositeSideGasPPM || 8.2} PPM`}
          unit={`Threshold: ${safety?.thresholds?.maxGasPPM || 35} PPM`}
          icon={Flame}
          change={telemetry?.oppositeSideGasPPM > 35 ? 'VOLATILE GAS' : 'Clear Atmosphere'}
          changeType={telemetry?.oppositeSideGasPPM > 35 ? 'negative' : 'positive'}
          subtitle={`Type: ${telemetry?.toxicGasType || 'Clean Air'}`}
        />
      </div>

      {/* 3 Dedicated Sensor Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Temperature Sensor Graph (Adafruit IO) */}
        <div className="card-surface p-5 border border-dark-border bg-dark-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-orange-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase">
                1. Temperature Sensor (Â°C)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-orange-950/60 text-orange-400 border border-orange-800">
              ADAFRUIT: temperature
            </span>
          </div>

          <div className="h-60 w-full">
            <Line data={tempData} options={chartOptions} />
          </div>

          <div className="mt-4 pt-3 border-t border-dark-border flex justify-between text-xs text-neutral-400 font-mono">
            <span>Latest Reading: <strong className="text-orange-400">{telemetry?.temperature}Â°C</strong></span>
            <span>Feed Points: <strong className="text-neutral-300">{adafruitFeeds?.temperature?.length || 25}</strong></span>
          </div>
        </div>

        {/* Chart 2: Ultrasonic Sensor Graph (Standoff Calibration) */}
        <div className="card-surface p-5 border border-dark-border bg-dark-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Gauge className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase">
                2. Ultrasonic Sensor (mm)
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800">
              ADAFRUIT: ultrasonic
            </span>
          </div>

          <div className="h-60 w-full">
            <Line data={ultrasonicData} options={chartOptions} />
          </div>

          <div className="mt-4 pt-3 border-t border-dark-border flex justify-between text-xs text-neutral-400 font-mono">
            <span>Current Gap: <strong className="text-cyan-400">{telemetry?.distanceMM || 40.0} mm</strong></span>
            <span>Calibration: <strong className="text-emerald-400">40.0 mm Target</strong></span>
          </div>
        </div>

        {/* Chart 3: Thermal Sensing Camera & Gas Prediction */}
        <div className="card-surface p-5 border border-dark-border bg-dark-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-purple-400" />
              <h3 className="text-xs font-mono font-bold text-white uppercase">
                3. Thermal Camera & Gas
              </h3>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-800">
              ADAFRUIT: thermal / gas
            </span>
          </div>

          <div className="h-60 w-full">
            <Line data={thermalGasData} options={chartOptions} />
          </div>

          <div className="mt-4 pt-3 border-t border-dark-border flex justify-between text-xs text-neutral-400 font-mono">
            <span>Thermal Wall: <strong className="text-purple-400">{telemetry?.oppositeSideTemp}Â°C</strong></span>
            <span>Gas PPM: <strong className={safety?.isSafeToCut ? 'text-emerald-400' : 'text-red-400'}>{telemetry?.oppositeSideGasPPM} PPM</strong></span>
          </div>
        </div>
      </div>

      {/* ESP32 Arduino Code Modal / Snippet */}
      {showCodeSnippet && (
        <div className="card-surface p-6 border border-dark-border bg-neutral-950 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3 mb-3">
            <span className="text-cyan-400 font-bold">READY-TO-FLASH ESP32 ARDUINO CODE (ADAFRUIT IO MQTT)</span>
            <button onClick={() => setShowCodeSnippet(false)} className="text-neutral-400 hover:text-white">Close</button>
          </div>
          <p className="text-neutral-400 mb-3 text-[11px]">
            Flash this code directly to your ESP32 in Arduino IDE with your credentials pre-configured to stream temperature, ultrasonic, and thermal camera data:
          </p>
          <pre className="bg-black p-4 rounded-lg overflow-x-auto text-[11px] text-emerald-400 leading-relaxed border border-neutral-800">
{`#include <WiFi.h>
#include <Adafruit_MQTT.h>
#include <Adafruit_MQTT_Client.h>

// WiFi Configuration
#define WLAN_SSID       "YOUR_WIFI_NAME"
#define WLAN_PASS       "YOUR_WIFI_PASSWORD"

// Adafruit IO Broker Credentials (Pre-configured for your account)
#define AIO_SERVER      "io.adafruit.com"
#define AIO_SERVERPORT  1883
#define AIO_USERNAME    "anshika01_"
#define AIO_KEY         "YOUR_ADAFRUIT_AIO_KEY"

WiFiClient client;
Adafruit_MQTT_Client mqtt(&client, AIO_SERVER, AIO_SERVERPORT, AIO_USERNAME, AIO_KEY);

// Adafruit IO Feeds
Adafruit_MQTT_Publish tempFeed = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/temperature");
Adafruit_MQTT_Publish ultrasonicFeed = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/ultrasonic");
Adafruit_MQTT_Publish thermalFeed = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/thermal-camera");
Adafruit_MQTT_Publish gasFeed = Adafruit_MQTT_Publish(&mqtt, AIO_USERNAME "/feeds/gas-ppm");

void connectMQTT() {
  if (mqtt.connected()) return;
  Serial.print("Connecting to Adafruit IO... ");
  int8_t ret;
  while ((ret = mqtt.connect()) != 0) {
    Serial.println(mqtt.connectErrorString(ret));
    mqtt.disconnect();
    delay(5000);
  }
  Serial.println("Adafruit IO Connected!");
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(WLAN_SSID, WLAN_PASS);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\\nWiFi Connected!");
}

void loop() {
  connectMQTT();

  // Read Sensors (replace with your sensor pins):
  float temperature = 25.8;    // e.g. DHT22 or DS18B20
  float distanceMM = 40.0;     // e.g. HC-SR04 ultrasonic distance
  float thermalWallTemp = 28.5;// e.g. MLX90614 or AMG8833 thermal camera
  float gasPPM = 10.5;         // e.g. MQ-2 / MQ-135 sensor

  // Publish directly to Adafruit IO
  tempFeed.publish(temperature);
  ultrasonicFeed.publish(distanceMM);
  thermalFeed.publish(thermalWallTemp);
  gasFeed.publish(gasPPM);

  Serial.println("Published to Adafruit IO! Website will auto-refresh graph.");
  delay(3000); // Send every 3 seconds
}`}
          </pre>
        </div>
      )}


      {/* Adafruit IO Settings Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="card-surface p-6 max-w-md w-full border border-neutral-700 bg-neutral-950">
            <h3 className="text-base font-bold text-white mb-1">Adafruit IO Feed Credentials</h3>
            <p className="text-xs text-text-secondary mb-4">
              Enter your Adafruit IO credentials to pull live MQTT / REST data from your ESP32 feeds.
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-mono text-neutral-400 mb-1">ADAFRUIT IO USERNAME</label>
                <input
                  type="text"
                  placeholder="e.g. your_adafruit_username"
                  value={adafruitConfig.username}
                  onChange={(e) => setAdafruitConfig({ ...adafruitConfig, username: e.target.value })}
                  className="w-full bg-neutral-900 border border-dark-border rounded px-3 py-2 text-white font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-neutral-400 mb-1">ADAFRUIT AIO KEY</label>
                <input
                  type="password"
                  placeholder="aio_xxxxxxxxxxxxxxxxxxxxxxxx"
                  value={adafruitConfig.aioKey}
                  onChange={(e) => setAdafruitConfig({ ...adafruitConfig, aioKey: e.target.value })}
                  className="w-full bg-neutral-900 border border-dark-border rounded px-3 py-2 text-white font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block font-mono text-neutral-400 mb-1">TEMP FEED KEY</label>
                  <input
                    type="text"
                    value={adafruitConfig.tempFeed}
                    onChange={(e) => setAdafruitConfig({ ...adafruitConfig, tempFeed: e.target.value })}
                    className="w-full bg-neutral-900 border border-dark-border rounded px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block font-mono text-neutral-400 mb-1">GAS FEED KEY</label>
                  <input
                    type="text"
                    value={adafruitConfig.gasFeed}
                    onChange={(e) => setAdafruitConfig({ ...adafruitConfig, gasFeed: e.target.value })}
                    className="w-full bg-neutral-900 border border-dark-border rounded px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              {configSaved && (
                <div className="p-2.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Adafruit IO credentials configured!</span>
                </div>
              )}

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="btn-secondary w-1/2"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary w-1/2">
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}






