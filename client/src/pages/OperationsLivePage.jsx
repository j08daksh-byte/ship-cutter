import React from 'react';
import { Activity } from 'lucide-react';

export default function OperationsLivePage() {
  return (
    <div className="p-6 h-full flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 mb-6 animate-pulse">
        <Activity className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-4">Unified Live Operations</h1>
      <p className="text-neutral-400 max-w-lg mb-8">
        This is the future home of the unified live dashboard. It will directly integrate Command Center, Digital Twin, and Telemetry into a single seamless experience without nested iframes.
      </p>
      <div className="p-4 bg-neutral-900 border border-neutral-800 rounded-lg text-left max-w-xl w-full">
        <h3 className="text-sm font-bold text-white mb-2 font-mono border-b border-neutral-800 pb-2">INTEGRATION STATUS</h3>
        <ul className="text-sm text-neutral-400 space-y-2 font-mono">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Senior Architecture Cleanup (Phase 1)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
            RoboFest Component Extraction
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neutral-600"></span>
            Unified Shell Implementation
          </li>
        </ul>
      </div>
    </div>
  );
}
