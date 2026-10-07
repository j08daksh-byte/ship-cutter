import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Flame,
  Layers,
  PieChart,
  Wrench,
  TrendingUp,
  History,
  Image,
  Ship,
  Bot,
  ArrowLeft,
  Activity,
  Radio,
  Zap,
  Database,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const navItems = [
    { label: 'Real-time Cutting', path: '/dashboard', icon: Flame, badge: 'Live' },
    { label: 'Live Operations Center', path: '/operations/live', icon: Activity, badge: 'Unified', highlight: true },
        { label: 'ESP32 / Adafruit Sensors', path: '/dashboard/sensors', icon: Radio, badge: 'IoT' },
        { label: 'Part Tracking', path: '/dashboard/parts', icon: Layers },
    { label: 'Material Analysis', path: '/dashboard/materials', icon: PieChart },
    { label: 'Robot Maintenance', path: '/dashboard/maintenance', icon: Wrench },
    { label: 'Feasibility & ROI', path: '/dashboard/feasibility', icon: TrendingUp },
    { label: 'Database Explorer', path: '/dashboard/database', icon: Database },
    { label: 'Cut History', path: '/dashboard/history', icon: History },
    { label: 'Photo Manager', path: '/dashboard/photos', icon: Image },
    { label: 'Ship Fleet Manager', path: '/dashboard/ships', icon: Ship },
    { label: 'AI Cutting Copilot', path: '/dashboard/chatbot', icon: Bot, highlight: true },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-dark-card border-r border-dark-border flex flex-col transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header */}
        <div className="h-16 px-5 border-b border-dark-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
              <Activity className="w-4 h-4 text-accent-cyan animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wider text-white">TITAN-OS</span>
              <span className="block text-[9px] font-mono text-neutral-400">CONTROL CENTER</span>
            </div>
          </Link>
          <Link
            to="/"
            title="Back to Public Site"
            className="text-neutral-400 hover:text-white p-1 rounded hover:bg-neutral-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Current Active Robot Status Card */}
        <div className="p-4 mx-3 my-3 rounded-lg bg-neutral-900/90 border border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-neutral-400 uppercase">Unit Alpha-01</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              ACTIVE
            </span>
          </div>
          <div className="text-xs font-semibold text-white truncate">MV Ocean Voyager</div>
          <div className="text-[11px] text-neutral-400 flex items-center justify-between mt-1">
            <span>Cut Speed: 142 cm/m</span>
            <span className="text-accent-cyan font-mono">68.4%</span>
          </div>
          {/* Mini progress bar */}
          <div className="w-full bg-neutral-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-accent-cyan h-1.5 rounded-full transition-all duration-500" style={{ width: '68.4%' }}></div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all group ${
                    isActive
                      ? 'bg-neutral-800 text-white border border-neutral-700 font-semibold'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-900/70 border border-transparent'
                  } ${item.highlight ? 'text-cyan-400 hover:text-cyan-300' : ''}`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {item.badge}
                  </span>
                )}
                {item.highlight && (
                  <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom Safety Interlock */}
        <div className="p-3 border-t border-dark-border">
          <button
            onClick={() => alert('Emergency Cutoff command dispatched to Unit Alpha-01.')}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-red-950/40 text-red-400 border border-red-900/50 hover:bg-red-900/50 hover:text-red-200 transition-all text-xs font-mono"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>EMERGENCY PAUSE</span>
          </button>
        </div>
      </aside>
    </>
  );
}

