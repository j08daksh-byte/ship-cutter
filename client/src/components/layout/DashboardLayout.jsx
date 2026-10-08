import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Menu, Wifi, Ship, User, ShieldAlert, Cpu } from 'lucide-react';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (pathname) => {
    switch (pathname) {
      case '/operations/live':
        return 'Live Operations Center';
      case '/operations/missions':
        return 'Mission Planner';
      case '/operations/sensors':
        return 'Sensors & Telemetry';
      case '/ships':
        return 'Vessel Fleet Management';
      case '/parts':
        return 'Part Tracking';
      case '/materials':
        return 'Materials Tracking';
      case '/maintenance/health':
        return 'Robot Health';
      case '/maintenance/safety':
        return 'Safety Logs';
      case '/intelligence/ai':
        return 'AI Assistant';
      case '/intelligence/history':
        return 'Event History';
      case '/intelligence/analytics':
        return 'Analytics Dashboard';
      case '/settings/users':
        return 'User Management';
      case '/settings/config':
        return 'System Configuration';
      default:
        return 'TITAN-CUT Platform';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-dark-card/90 backdrop-blur-md border-b border-dark-border px-4 sm:px-6 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-semibold text-white">
                {getPageTitle(location.pathname)}
              </h1>
              <p className="text-[11px] text-neutral-400 hidden sm:block">
                Autonomous Ship Dismantling & Metallurgy
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            
            <div className="hidden md:flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-lg border border-dark-border text-xs text-neutral-300">
              <Ship className="w-3.5 h-3.5 text-neutral-500" />
              <span className="font-semibold text-neutral-400 uppercase tracking-wide">NO ACTIVE PROJECT</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 bg-neutral-900/60 px-2.5 py-1.5 rounded-lg border border-dark-border">
              <Cpu className="w-3.5 h-3.5" />
              <span className="font-mono text-[11px] hidden sm:inline uppercase">UNIT UNASSIGNED</span>
            </div>
            <div className="w-8 h-8 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-xs font-mono text-neutral-300">
              <User className="w-4 h-4" />
            </div>
          </div>
        </header>
        <main className={`flex-1 flex flex-col bg-black ${location.pathname === '/operations/live' ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {location.pathname === '/operations/live' ? (
            <Outlet />
          ) : (
            <div className="max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
