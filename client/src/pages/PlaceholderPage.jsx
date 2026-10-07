import React from 'react';

export default function PlaceholderPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] bg-neutral-900 border border-neutral-800 rounded-lg p-8">
      <div className="text-accent-cyan font-mono text-sm tracking-widest mb-4">
        {title.toUpperCase()}
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">
        FEATURE NOT YET INTEGRATED
      </h2>
      <p className="text-neutral-400 text-center max-w-md">
        This section is part of the final TITAN-CUT platform architecture, but its operational logic has not yet been merged from RoboFest.
      </p>
    </div>
  );
}
