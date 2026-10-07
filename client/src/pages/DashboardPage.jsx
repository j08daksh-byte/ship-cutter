import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import StatsCard from '../components/common/StatsCard';
import ProgressRing from '../components/common/ProgressRing';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Flame,
  CheckCircle,
  Clock,
  Trash2,
  Gauge,
  Activity,
  Pause, Play
} from 'lucide-react';

export default function DashboardPage() {
  const [operation, setOperation] = useState(null);
  const [ship, setShip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const [opData, ships] = await Promise.all([
          api.getActiveOperation(),
          api.getShips(),
        ]);
        setOperation(opData);
        if (ships && ships.length > 0) {
          setShip(ships[0]);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) return <LoadingSpinner text="Connecting to Titan-X1 Telemetry Stream..." />;

  const op = operation || {};
  const progress = op.progress || 68.4;
  const cutParts = op.cutParts || 287;
  const remainingParts = op.remainingParts || 112;
  const wasteParts = op.wasteParts || 21;
  const totalParts = op.totalParts || 420;
  const currentSpeed = op.currentSpeed || 142.5;

  return (
    <div className="space-y-6">
      {/* Top Banner: Operation Status */}
      <div className="card-surface p-5 bg-gradient-to-r from-neutral-950 via-neutral-900 to-neutral-950 border border-dark-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
            <Flame className="w-6 h-6 text-accent-cyan animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {isPaused ? 'OPERATION PAUSED' : 'OPERATION IN-PROGRESS'}
              </span>
              <span className="text-xs text-neutral-500 font-mono">ID: {op.operationId || 'OP-2026-OCT-884'}</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              {ship?.name || 'MV Ocean Voyager'} • {op.cuttingZone || 'Midship Cargo Hold #3'}
            </h2>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`btn-secondary text-xs flex items-center gap-1.5 ${
              isPaused ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800' : ''
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume Robot' : 'Pause Cut Stream'}</span>
          </button>
          <div className="text-right hidden sm:block">
            <span className="text-[10px] font-mono text-neutral-400 block uppercase">Torch Arc Temp</span>
            <span className="text-xs font-mono font-bold text-orange-400">18,400 °C Plasma</span>
          </div>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Parts Extracted & Cut"
          value={cutParts}
          unit={`/ ${totalParts}`}
          change="+14 today"
          changeType="positive"
          icon={CheckCircle}
          subtitle={`${((cutParts / totalParts) * 100).toFixed(0)}% completion`}
        />
        <StatsCard
          title="Remaining Structural Parts"
          value={remainingParts}
          unit="segments"
          change="~38 hours left"
          icon={Clock}
          subtitle="AH36 high tensile"
        />
        <StatsCard
          title="Scrap Slag & Kerf Waste"
          value={wasteParts}
          unit="units"
          change="5.0% loss"
          changeType="positive"
          icon={Trash2}
          subtitle="Filtered & captured"
        />
        <StatsCard
          title="Autonomous Cut Velocity"
          value={currentSpeed}
          unit="cm / min"
          change="Optimal feed"
          changeType="positive"
          icon={Gauge}
          subtitle="400A Plasma Arc"
        />
      </div>

      {/* Main Grid: Progress Ring + Hull Zone Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Ring Card */}
        <div className="card-surface p-6 border border-dark-border bg-dark-card flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between border-b border-dark-border pb-3 mb-4">
            <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">
              Dismantling Progress
            </h3>
            <span className="text-[11px] font-mono text-accent-cyan">TITAN-X1</span>
          </div>

          <div className="my-6">
            <ProgressRing progress={progress} size={200} strokeWidth={16} label="Vessel Hull" sublabel="Scrapped" />
          </div>

          <div className="w-full grid grid-cols-3 gap-2 pt-4 border-t border-dark-border text-center text-xs">
            <div>
              <span className="block text-neutral-500 font-mono text-[10px]">WEIGHT DISMANTLED</span>
              <span className="font-bold text-white font-mono">19,425 T</span>
            </div>
            <div>
              <span className="block text-neutral-500 font-mono text-[10px]">RECOVERY RATE</span>
              <span className="font-bold text-emerald-400 font-mono">94.8%</span>
            </div>
            <div>
              <span className="block text-neutral-500 font-mono text-[10px]">CURRENT AMPS</span>
              <span className="font-bold text-white font-mono">385 A</span>
            </div>
          </div>
        </div>

        {/* Ship Hull Zone Map (Visual Interactive Diagram) */}
        <div className="lg:col-span-2 card-surface p-6 border border-dark-border bg-dark-card flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
            <div>
              <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">
                Vessel Section Breakdown & Cut Zone Map
              </h3>
              <p className="text-[11px] text-neutral-400">Click a compartment to view robotic thermal pass history</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-500"></span> Completed
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-cyan-400 animate-pulse"></span> Cutting
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-neutral-700"></span> Pending
              </span>
            </div>
          </div>

          {/* Graphical Ship Hull Silhouette Representation */}
          <div className="p-6 rounded-xl bg-black border border-dark-border flex flex-col items-center justify-center my-4">
            <div className="w-full max-w-xl space-y-3">
              <div className="flex items-center justify-between text-xs text-neutral-400 font-mono mb-2">
                <span>STERN [AFT]</span>
                <span>MIDSHIP HULL (225m)</span>
                <span>BOW [FWD]</span>
              </div>

              {/* Ship Zone Segments */}
              <div className="grid grid-cols-5 gap-2 h-20">
                {/* Zone 1: Stern & Propeller */}
                <div className="rounded-lg bg-emerald-950/70 border border-emerald-500/40 p-2 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-emerald-400">SEC-01</span>
                  <span className="text-xs font-semibold text-white">Stern / Rudder</span>
                  <span className="text-[10px] font-mono text-emerald-400">100% CUT</span>
                </div>

                {/* Zone 2: Engine Room */}
                <div className="rounded-lg bg-emerald-950/70 border border-emerald-500/40 p-2 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-emerald-400">SEC-02</span>
                  <span className="text-xs font-semibold text-white">Engine Block</span>
                  <span className="text-[10px] font-mono text-emerald-400">100% CUT</span>
                </div>

                {/* Zone 3: Cargo Hold #3 (ACTIVE) */}
                <div className="rounded-lg bg-cyan-950/80 border-2 border-cyan-400 p-2 flex flex-col justify-between relative overflow-hidden shadow-glow">
                  <div className="absolute top-0 right-0 w-2 h-2 bg-cyan-400 animate-ping"></div>
                  <span className="text-[10px] font-mono text-cyan-300">SEC-03 (ROBOT)</span>
                  <span className="text-xs font-semibold text-white">Cargo Hold 3</span>
                  <span className="text-[10px] font-mono text-cyan-300 animate-pulse">CUTTING NOW</span>
                </div>

                {/* Zone 4: Cargo Hold #1 & 2 */}
                <div className="rounded-lg bg-neutral-900 border border-dark-border p-2 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-neutral-400">SEC-04</span>
                  <span className="text-xs font-semibold text-white">Cargo Hold 1-2</span>
                  <span className="text-[10px] font-mono text-neutral-400">QUEUED</span>
                </div>

                {/* Zone 5: Bow & Forecastle */}
                <div className="rounded-lg bg-neutral-900 border border-dark-border p-2 flex flex-col justify-between">
                  <span className="text-[10px] font-mono text-neutral-400">SEC-05</span>
                  <span className="text-xs font-semibold text-white">Bow & Anchor</span>
                  <span className="text-[10px] font-mono text-neutral-400">QUEUED</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-dark-border">
            <span>Robotic crawler position: <strong className="text-white font-mono">Frame 142 + 18m Elev</strong></span>
            <span>Laser distance to kerf: <strong className="text-white font-mono">3.2 mm</strong></span>
          </div>
        </div>
      </div>

      {/* Activity Log Feed */}
      <div className="card-surface p-6 border border-dark-border bg-dark-card">
        <div className="flex items-center justify-between border-b border-dark-border pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent-cyan" />
            <h3 className="text-xs font-semibold text-white uppercase font-mono tracking-wider">
              Real-Time Event & Diagnostics Log
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400">LIVE WEBSOCKET STREAM</span>
        </div>

        <div className="space-y-3 font-mono text-xs">
          {(op.activityLogs || []).map((log, idx) => (
            <div
              key={idx}
              className="flex items-start justify-between p-3 rounded-lg bg-neutral-950/80 border border-dark-border"
            >
              <div className="flex items-start gap-3">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                    log.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : log.type === 'warning'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-neutral-800 text-neutral-300'
                  }`}
                >
                  {log.type}
                </span>
                <span className="text-neutral-200">{log.message}</span>
              </div>
              <span className="text-neutral-500 text-[11px] shrink-0 ml-4">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


