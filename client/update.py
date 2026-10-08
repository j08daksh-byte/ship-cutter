import re

with open('src/pages/OperationsLivePage.jsx', 'r') as f:
    content = f.read()

cut_panel = '''
            {/* Cut Execution Panel */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5" /> Cut Execution
              </h4>
              <div className="bg-black border border-neutral-800 rounded p-3 text-xs font-mono space-y-2">
                <div className="flex justify-between">
                  <span className="text-neutral-500">CURRENT CUT</span>
                  <span className="text-neutral-600">{mission?.activeCutId ? mission.activeCutId.substring(0,8) : 'NONE'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">STATUS</span>
                  <span className="text-neutral-600">{mission?.activeCutStatus || 'WAITING'}</span>
                </div>
                <div className="mt-2 space-y-2">
                  <button 
                    className="w-full bg-neutral-900 border border-neutral-700 p-1.5 rounded text-[10px] text-neutral-300 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleCommand('cut', { action: 'prepare', missionId: mission?.id, cutId: mission?.activeCutId })}
                    disabled={!isOnline || !mission?.activeCutId || executingCommands['cut_prepare']}
                  >
                    PREPARE CUT
                  </button>
                  <button 
                    className="w-full bg-cyan-950/30 border border-cyan-900 p-1.5 rounded text-[10px] text-cyan-400 hover:bg-cyan-900 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => handleCommand('cut', { action: 'execute', missionId: mission?.id, cutId: mission?.activeCutId })}
                    disabled={!isOnline || !safety?.torchPermission || !mission?.activeCutId || executingCommands['cut_execute']}
                  >
                    EXECUTE CUT
                  </button>
                </div>
              </div>
            </div>
'''

content = content.replace('{/* Safety Panel */}', cut_panel + '\n            {/* Safety Panel */}')

replacement = '''else if (cmd === 'stop') {
      action = 'stop';
    } else if (cmd === 'cut') {
      endpoint = '/api/operations/command/cut';
      action = payload.action;
    }'''

content = re.sub(r"else if \(cmd === 'stop'\) \{\n\s*action = 'stop';\n\s*\}", replacement, content)

with open('src/pages/OperationsLivePage.jsx', 'w') as f:
    f.write(content)

print('Done')
