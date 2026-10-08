import re

with open('src/pages/OperationsLivePage.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

new_mission_block = r'''                <h4 className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">
                  <Crosshair className="w-3.5 h-3.5" /> Mission
                </h4>
                <div className="bg-black border border-neutral-800 rounded p-3 text-xs font-mono space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">MISSION ID</span>
                    <span className="text-neutral-600">{mission?.id ? mission.id.substring(0,8) : 'NONE'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SHIP</span>
                    <span className="text-neutral-600 truncate max-w-[120px] text-right">{mission?.shipName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">SECTION</span>
                    <span className="text-neutral-600 truncate max-w-[120px] text-right">{mission?.hullSection || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">OBJECTIVE</span>
                    <span className="text-neutral-600 truncate max-w-[120px] text-right">{mission?.objective || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between mt-2 pt-2 border-t border-neutral-800">
                    <span className="text-neutral-500">STATUS</span>
                    <span className="text-cyan-500 font-bold">{mission?.status || 'NO ACTIVE MISSION'}</span>
                  </div>
                  <div className="w-full bg-neutral-900 h-1.5 rounded overflow-hidden mt-1">
                    <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${mission?.progressPercentage || 0}%` }}></div>
                  </div>
                </div>'''

content = re.sub(
    r'<h4 className="text-\[10px\] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">\s*<Crosshair className="w-3\.5 h-3\.5" /> Mission\s*</h4>\s*<div className="bg-black border border-neutral-800 rounded p-3 text-xs font-mono">\s*<div className="flex justify-between mb-2">\s*<span className="text-neutral-500">STATUS</span>.*?</style>.*?</style>.*?</style>.*?</style>.*?</div>\s*</div>',
    new_mission_block,
    content,
    flags=re.DOTALL
)

# Wait, my regex is bad because of the HTML structure. Let's do a more precise replacement:
old_block_regex = r'<h4 className="text-\[10px\] font-semibold text-neutral-400 uppercase tracking-wider flex items-center gap-2">\s*<Crosshair className="w-3\.5 h-3\.5" /> Mission\s*</h4>\s*<div className="bg-black border border-neutral-800 rounded p-3 text-xs font-mono">\s*<div className="flex justify-between mb-2">\s*<span className="text-neutral-500">STATUS</span>\s*<span className="text-neutral-600">\{mission\?\.status \|\| \'NO ACTIVE MISSION\'\}</span>\s*</div>\s*<div className="w-full bg-neutral-900 h-1\.5 rounded overflow-hidden">\s*<div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `\$\{mission\?\.progressPercentage \|\| 0\}%` }}></div>\s*</div>\s*</div>'

content = re.sub(old_block_regex, new_mission_block, content, flags=re.DOTALL)

with open('src/pages/OperationsLivePage.jsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated OperationsLivePage.jsx')
