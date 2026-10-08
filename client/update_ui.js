import fs from 'fs';

const content = fs.readFileSync('src/pages/OperationsLivePage.jsx', 'utf8');

let newContent = content.replace(
  /const handleCommand = \(cmd, payload\) => \{[\s\S]*?\};/,
  "const [executingCommands, setExecutingCommands] = useState({});\n\n" +
  "  const handleCommand = async (cmd, payload) => {\n" +
  "    if (connectionState !== 'CONNECTED') return;\n\n" +
  "    let endpoint = '/api/operations/command/robot';\n" +
  "    let action = cmd;\n" +
  "    let actualPayload = payload;\n\n" +
  "    if (cmd === 'move') {\n" +
  "      if (payload.x === 0 && payload.y === 1) action = 'forward';\n" +
  "      else if (payload.x === 0 && payload.y === -1) action = 'reverse';\n" +
  "      else if (payload.x === -1 && payload.y === 0) action = 'left';\n" +
  "      else if (payload.x === 1 && payload.y === 0) action = 'right';\n" +
  "      else if (payload.x === 0 && payload.y === 0) action = 'stop';\n" +
  "      else action = 'stop';\n" +
  "    } else if (cmd === 'arm') {\n" +
  "      action = 'arm_move';\n" +
  "      actualPayload = {\n" +
  "        xExtension: payload.x !== undefined ? parseFloat(payload.x) : (twinState?.arm?.xExtension || 0),\n" +
  "        yPosition: payload.y !== undefined ? parseFloat(payload.y) : (twinState?.arm?.yPosition || 0)\n" +
  "      };\n" +
  "    } else if (cmd === 'torch') {\n" +
  "      action = payload.toggle ? (twinState?.torch?.enabled ? 'torch_off' : 'torch_request') : 'torch_off';\n" +
  "    } else if (cmd === 'magnet') {\n" +
  "      action = payload.toggle ? (twinState?.electromagnet?.enabled ? 'electromagnet_release' : 'electromagnet_engage') : 'electromagnet_release';\n" +
  "    } else if (cmd === 'estop') {\n" +
  "      endpoint = '/api/operations/command/safety';\n" +
  "      action = payload.action === 'trigger' ? 'estop' : 'clear_estop';\n" +
  "    } else if (cmd === 'stop') {\n" +
  "      action = 'stop';\n" +
  "    }\n\n" +
  "    setExecutingCommands(prev => ({ ...prev, [cmd]: true }));\n" +
  "    try {\n" +
  "      const res = await fetch(endpoint, {\n" +
  "        method: 'POST',\n" +
  "        headers: { 'Content-Type': 'application/json' },\n" +
  "        body: JSON.stringify({ action, payload: actualPayload })\n" +
  "      });\n" +
  "      const data = await res.json();\n" +
  "      if (!res.ok) {\n" +
  "        console.error('Command Rejected:', data.reason);\n" +
  "      }\n" +
  "    } catch (err) {\n" +
  "      console.error('Command Error:', err);\n" +
  "    } finally {\n" +
  "      setExecutingCommands(prev => ({ ...prev, [cmd]: false }));\n" +
  "    }\n  };"
);

newContent = newContent.replace(
  /onMouseUp=\{\(\) => handleCommand\('move', \{y: 0\}\)\}\s*title="NOT CONNECTED TO COMMAND GATEWAY"/g,
  "onMouseUp={() => handleCommand('move', {y: 0})}\n                        disabled={!isOnline || !safety?.movementPermission || executingCommands['move']}"
);

newContent = newContent.replace(
  /onMouseUp=\{\(\) => handleCommand\('move', \{x: 0\}\)\}\s*title="NOT CONNECTED TO COMMAND GATEWAY"/g,
  "onMouseUp={() => handleCommand('move', {x: 0})}\n                        disabled={!isOnline || !safety?.movementPermission || executingCommands['move']}"
);

newContent = newContent.replace(
  /onChange=\{\(e\) => handleCommand\('arm', \{y: e.target.value\}\)\}\s*title="NOT CONNECTED TO COMMAND GATEWAY"/g,
  "onChange={(e) => handleCommand('arm', {y: e.target.value})}\n                        disabled={!isOnline || !safety?.movementPermission || executingCommands['arm']}"
);

newContent = newContent.replace(
  /onChange=\{\(e\) => handleCommand\('arm', \{x: e.target.value\}\)\}\s*title="NOT CONNECTED TO COMMAND GATEWAY"/g,
  "onChange={(e) => handleCommand('arm', {x: e.target.value})}\n                        disabled={!isOnline || !safety?.movementPermission || executingCommands['arm']}"
);

newContent = newContent.replace(
  /onClick=\{\(\) => handleCommand\('torch', \{toggle: true\}\)\}\s*title="NOT CONNECTED TO COMMAND GATEWAY"/g,
  "onClick={() => handleCommand('torch', {toggle: true})}\n                        disabled={!isOnline || !safety?.torchPermission || executingCommands['torch']}"
);

newContent = newContent.replace(
  /onClick=\{\(\) => handleCommand\('magnet', \{toggle: true\}\)\}\s*title="NOT CONNECTED TO COMMAND GATEWAY"/g,
  "onClick={() => handleCommand('magnet', {toggle: true})}\n                        disabled={!isOnline || executingCommands['magnet']}"
);

newContent = newContent.replace(
  /onClick=\{\(\) => handleCommand\('estop', \{action: 'trigger'\}\)\}\s*title="NOT CONNECTED TO COMMAND GATEWAY"/g,
  "onClick={() => handleCommand('estop', {action: 'trigger'})}\n                        disabled={!isOnline || executingCommands['estop']}"
);

newContent = newContent.replace(
  /onClick=\{\(\) => handleCommand\('stop', \{action: 'halt'\}\)\}\s*title="NOT CONNECTED TO COMMAND GATEWAY"/g,
  "onClick={() => handleCommand('stop', {action: 'halt'})}\n                        disabled={!isOnline || executingCommands['stop']}"
);

fs.writeFileSync('src/pages/OperationsLivePage.jsx', newContent);
console.log('Update complete');
