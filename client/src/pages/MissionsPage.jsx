import React, { useState, useEffect } from 'react';
import { Crosshair, Plus, Play, Pause, Square, AlertTriangle, CheckCircle2, Save } from 'lucide-react';

export default function MissionsPage() {
  const [missions, setMissions] = useState([]);
  const [selectedMission, setSelectedMission] = useState(null);
  const [cuts, setCuts] = useState([]);
  const [viewState, setViewState] = useState('list'); // 'list', 'create', 'detail'
  const [formData, setFormData] = useState({ shipName: '', hullSection: '', objective: '' });
  const [cutFormData, setCutFormData] = useState({ name: '', type: 'OPEN_PATH' });
  const [actionLoading, setActionLoading] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  useEffect(() => {
    fetchMissions();
  }, []);

  const fetchMissions = async () => {
    try {
      const res = await fetch('/api/operations/missions');
      const data = await res.json();
      if (data.data) {
        setMissions(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchCuts = async (missionId) => {
    try {
      const res = await fetch(`/api/operations/missions/${missionId}/cuts`);
      const data = await res.json();
      if (data.data) {
        setCuts(data.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateMission = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/operations/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (data.data) {
        setViewState('detail');
        setSelectedMission(data.data);
        fetchMissions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCut = async (e) => {
    e.preventDefault();
    if (!selectedMission) return;
    try {
      const res = await fetch(`/api/operations/missions/${selectedMission.id}/cuts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          missionId: selectedMission.id,
          name: cutFormData.name,
          type: cutFormData.type,
          photoPlanJson: "{}",
          normalizedJson: "{}",
          worldJson: "{}",
          panelId: "manual-entry"
        })
      });
      fetchCuts(selectedMission.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAction = async (action) => {
    if (!selectedMission) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/operations/command/mission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: selectedMission.id, action })
      });
      
      const data = await res.json();
      
      if (action === 'validate') {
        if (res.status === 501) {
          setValidationResult({ status: 'NOT_IMPLEMENTED', details: data.reason });
        } else if (res.ok) {
          setValidationResult({ status: 'VALID', details: 'Mission validated successfully.' });
        } else {
          setValidationResult({ status: 'INVALID', details: data.error || data.reason || 'Validation failed.' });
        }
      } else {
        // Just refresh the mission
        const freshRes = await fetch(`/api/operations/missions/${selectedMission.id}`);
        const freshData = await freshRes.json();
        if (freshData.data) {
          setSelectedMission(freshData.data);
          fetchMissions();
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans pt-16">
      <div className="w-80 border-r border-neutral-800 flex flex-col bg-neutral-950">
        <div className="p-4 border-b border-neutral-800 flex justify-between items-center">
          <h2 className="text-sm font-bold tracking-widest text-neutral-400">MISSIONS</h2>
          <button 
            onClick={() => { setViewState('create'); setSelectedMission(null); setValidationResult(null); }}
            className="p-1.5 bg-cyan-900/30 text-cyan-400 rounded hover:bg-cyan-900/50 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {missions.map(m => (
            <div 
              key={m.id}
              onClick={() => { 
                setSelectedMission(m); 
                setViewState('detail'); 
                fetchCuts(m.id);
                setValidationResult(null);
              }}
              className={`p-3 rounded border cursor-pointer transition-colors ${selectedMission?.id === m.id ? 'bg-cyan-950/20 border-cyan-900' : 'bg-black border-neutral-800 hover:border-neutral-700'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-xs font-mono text-cyan-500">{m.id.substring(0,8)}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded ${m.status === 'RUNNING' ? 'bg-emerald-900/30 text-emerald-400' : 'bg-neutral-800 text-neutral-400'}`}>
                  {m.status}
                </span>
              </div>
              <div className="text-sm font-semibold truncate">{m.shipName}</div>
              <div className="text-xs text-neutral-500 truncate">{m.objective}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-black">
        {viewState === 'list' && !selectedMission && (
          <div className="flex-1 flex items-center justify-center text-neutral-500 flex-col gap-4">
            <Crosshair className="w-12 h-12 opacity-20" />
            <p>Select a mission from the sidebar or create a new one.</p>
          </div>
        )}

        {viewState === 'create' && (
          <div className="p-8 max-w-2xl mx-auto w-full">
            <h1 className="text-2xl font-light mb-6 border-b border-neutral-800 pb-4">Create New Mission</h1>
            <form onSubmit={handleCreateMission} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-neutral-500">SHIP / VESSEL NAME</label>
                <input 
                  type="text" required
                  value={formData.shipName}
                  onChange={e => setFormData({...formData, shipName: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-sm focus:border-cyan-500 outline-none"
                  placeholder="e.g. MV Ocean Voyager"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-neutral-500">HULL SECTION</label>
                <input 
                  type="text" required
                  value={formData.hullSection}
                  onChange={e => setFormData({...formData, hullSection: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-sm focus:border-cyan-500 outline-none"
                  placeholder="e.g. Starboard Aft Frame 42"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold tracking-widest text-neutral-500">OBJECTIVE</label>
                <textarea required
                  value={formData.objective}
                  onChange={e => setFormData({...formData, objective: e.target.value})}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded p-3 text-sm focus:border-cyan-500 outline-none h-24"
                  placeholder="e.g. Remove damaged plating section for replacement."
                />
              </div>
              <button 
                type="submit"
                className="bg-cyan-600 hover:bg-cyan-500 text-white px-6 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Save Draft Mission
              </button>
            </form>
          </div>
        )}

        {viewState === 'detail' && selectedMission && (
          <div className="flex-1 flex flex-col">
            <div className="p-6 border-b border-neutral-800 bg-neutral-950 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold">{selectedMission.shipName}</h1>
                  <span className={`text-xs px-2 py-1 rounded font-mono font-bold ${
                    selectedMission.status === 'RUNNING' ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-800' : 
                    selectedMission.status === 'PAUSED' ? 'bg-amber-900/50 text-amber-400 border border-amber-800' :
                    'bg-neutral-800 text-neutral-300 border border-neutral-700'
                  }`}>
                    {selectedMission.status}
                  </span>
                </div>
                <div className="text-sm text-neutral-400 flex items-center gap-2">
                  <span className="font-mono text-cyan-500/50">{selectedMission.id}</span>
                  <span>|</span>
                  <span>{selectedMission.hullSection}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => handleAction('validate')} disabled={actionLoading}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded text-xs font-bold tracking-wider transition-colors disabled:opacity-50"
                >
                  VALIDATE
                </button>
                {selectedMission.status === 'DRAFT' && (
                  <button 
                    onClick={() => handleAction('start')} disabled={actionLoading}
                    className="px-4 py-2 bg-cyan-900/40 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 rounded text-xs font-bold tracking-wider transition-colors disabled:opacity-50"
                  >
                    READY
                  </button>
                )}
                {(selectedMission.status === 'READY' || selectedMission.status === 'PAUSED') && (
                  <button 
                    onClick={() => handleAction('start')} disabled={actionLoading}
                    className="px-4 py-2 bg-emerald-900/40 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 rounded text-xs font-bold tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" /> START
                  </button>
                )}
                {selectedMission.status === 'RUNNING' && (
                  <button 
                    onClick={() => handleAction('pause')} disabled={actionLoading}
                    className="px-4 py-2 bg-amber-900/40 hover:bg-amber-900 text-amber-400 border border-amber-800 rounded text-xs font-bold tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <Pause className="w-3.5 h-3.5" /> PAUSE
                  </button>
                )}
                <button 
                  onClick={() => handleAction('abort')} disabled={actionLoading}
                  className="px-4 py-2 bg-red-900/20 hover:bg-red-900 text-red-400 border border-red-900/50 rounded text-xs font-bold tracking-wider transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  <Square className="w-3.5 h-3.5" /> ABORT
                </button>
              </div>
            </div>

            <div className="p-6 flex-1 overflow-y-auto">
              {validationResult && (
                <div className={`p-4 mb-6 rounded border ${
                  validationResult.status === 'NOT_IMPLEMENTED' ? 'bg-amber-950/30 border-amber-900/50 text-amber-200' :
                  validationResult.status === 'VALID' ? 'bg-emerald-950/30 border-emerald-900/50 text-emerald-200' :
                  'bg-red-950/30 border-red-900/50 text-red-200'
                }`}>
                  <div className="flex items-center gap-2 font-bold mb-1">
                    {validationResult.status === 'NOT_IMPLEMENTED' ? <AlertTriangle className="w-4 h-4 text-amber-500" /> : <CheckCircle2 className="w-4 h-4" />}
                    VALIDATION: {validationResult.status}
                  </div>
                  <div className="text-sm opacity-80">{validationResult.details}</div>
                  {validationResult.status === 'NOT_IMPLEMENTED' && (
                    <div className="mt-2 text-xs opacity-60">
                      Rule evaluation: geometry (NOT_IMPLEMENTED), closed loop (NOT_IMPLEMENTED), robot reach (NOT_IMPLEMENTED), safety state (CHECKED_AT_START). Proceed at operator discretion.
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 space-y-6">
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded p-5">
                    <h3 className="text-sm font-bold tracking-widest text-neutral-400 mb-4 border-b border-neutral-800 pb-2">OBJECTIVE</h3>
                    <p className="text-neutral-300 text-sm leading-relaxed">{selectedMission.objective}</p>
                  </div>

                  <div className="bg-neutral-900/50 border border-neutral-800 rounded p-5">
                    <div className="flex justify-between items-center mb-4 border-b border-neutral-800 pb-2">
                      <h3 className="text-sm font-bold tracking-widest text-neutral-400">CUTTING PLAN</h3>
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      {cuts.length === 0 ? (
                        <div className="text-center p-6 border border-dashed border-neutral-700 rounded text-neutral-500 text-sm">
                          No cuts defined for this mission.
                        </div>
                      ) : (
                        cuts.map(c => (
                          <div key={c.id} className="flex justify-between items-center p-3 bg-black border border-neutral-800 rounded">
                            <div className="flex items-center gap-3">
                              <Crosshair className="w-4 h-4 text-cyan-600" />
                              <div>
                                <div className="text-sm font-bold text-neutral-200">{c.name}</div>
                                <div className="text-xs text-neutral-500 font-mono">{c.type}</div>
                              </div>
                            </div>
                            <span className="text-xs bg-neutral-800 px-2 py-1 rounded text-neutral-400 font-mono">{c.status}</span>
                          </div>
                        ))
                      )}
                    </div>

                    {selectedMission.status === 'DRAFT' && (
                      <form onSubmit={handleAddCut} className="flex gap-2 items-end bg-black p-3 rounded border border-neutral-800">
                        <div className="flex-1">
                          <label className="text-[10px] font-bold text-neutral-500 block mb-1">NEW CUT NAME</label>
                          <input type="text" value={cutFormData.name} onChange={e => setCutFormData({...cutFormData, name: e.target.value})} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1.5 text-xs outline-none focus:border-cyan-500" placeholder="e.g. Main Window Port" />
                        </div>
                        <div className="w-1/3">
                          <label className="text-[10px] font-bold text-neutral-500 block mb-1">TYPE</label>
                          <select value={cutFormData.type} onChange={e => setCutFormData({...cutFormData, type: e.target.value})} className="w-full bg-neutral-900 border border-neutral-700 rounded p-1.5 text-xs outline-none focus:border-cyan-500">
                            <option value="OPEN_PATH">Straight / Open</option>
                            <option value="CLOSED_LOOP">Closed Loop (Rectangle/Circle)</option>
                          </select>
                        </div>
                        <button type="submit" className="bg-neutral-800 hover:bg-neutral-700 text-white px-3 py-1.5 rounded text-xs font-semibold transition-colors border border-neutral-700 h-[28px]">
                          Add Cut
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded p-5">
                    <h3 className="text-sm font-bold tracking-widest text-neutral-400 mb-4 border-b border-neutral-800 pb-2">EXECUTION METRICS</h3>
                    <div className="space-y-4 font-mono text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">PROGRESS</span>
                        <span className="text-cyan-400">{selectedMission.progressPercentage}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 h-1.5 rounded overflow-hidden">
                        <div className="bg-cyan-500 h-full transition-all" style={{ width: `${selectedMission.progressPercentage}%` }}></div>
                      </div>
                      <div className="flex justify-between pt-2">
                        <span className="text-neutral-500">START TIME</span>
                        <span className="text-neutral-300">{selectedMission.startedAt ? new Date(selectedMission.startedAt).toLocaleTimeString() : '--:--:--'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
