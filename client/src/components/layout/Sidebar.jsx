import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Activity, ArrowLeft, Bot, Database, History, 
  Image, Layers, PieChart, Ship, ShieldAlert,
  Wrench, Zap, LayoutDashboard, Crosshair, 
  Thermometer, Settings, Users, Settings2, BarChart2
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const primaryNavGroups = [
    {
      title: 'OPERATIONS',
      items: [
        { label: 'Live Dashboard', path: '/operations/live', icon: Activity, badge: 'Live', highlight: true },
        { label: 'Missions', path: '/operations/missions', icon: Crosshair },
        { label: 'Sensors & Telemetry', path: '/operations/sensors', icon: Zap },
      ]
    },
    {
      title: 'FLEET & ASSETS',
      items: [
        { label: 'Active Projects', path: '/ships', icon: Ship },
        { label: 'Materials Tracking', path: '/materials', icon: PieChart },
        { label: 'Part Tracking', path: '/parts', icon: Layers },
      ]
    },
    {
      title: 'MAINTENANCE & SAFETY',
      items: [
        { label: 'Robot Health', path: '/maintenance/health', icon: Wrench },
        { label: 'Safety Logs', path: '/maintenance/safety', icon: ShieldAlert },
      ]
    },
    {
      title: 'INTELLIGENCE',
      items: [
        { label: 'AI Assistant', path: '/intelligence/ai', icon: Bot, highlight: true },
        { label: 'Event History', path: '/intelligence/history', icon: History },
        { label: 'Analytics', path: '/intelligence/analytics', icon: BarChart2 },
      ]
    },
    {
      title: 'SETTINGS',
      items: [
        { label: 'User Management', path: '/settings/users', icon: Users },
        { label: 'System Config', path: '/settings/config', icon: Settings2 },
      ]
    }
  ];

  return (
    <>
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
        <div className="h-16 px-5 border-b border-dark-border flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white">
              <Activity className="w-4 h-4 text-accent-cyan animate-pulse" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wider text-white">TITAN-CUT</span>
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

        <div className="p-4 mx-3 my-3 rounded-lg bg-neutral-900/90 border border-dark-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-neutral-400 uppercase">Unit Alpha-01</span>
            <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              ACTIVE
            </span>
          </div>
          <div className="text-xs font-semibold text-white truncate">MV Ocean Voyager</div>
        </div>

        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {primaryNavGroups.map((group, i) => (
            <div key={i}>
              <h3 className="px-3 text-[10px] font-mono font-semibold text-neutral-500 uppercase tracking-wider mb-2">{group.title}</h3>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all group ${
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
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          {item.badge}
                        </span>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
