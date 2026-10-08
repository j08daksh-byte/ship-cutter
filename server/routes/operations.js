import express from 'express';
import CuttingOperation from '../models/CuttingOperation.js';
import { defaultOperation } from '../config/seedData.js';
import mongoose from 'mongoose';

const router = express.Router();

let cachedRoboFestToken = null;
let tokenExpiresAt = 0;

async function getRoboFestToken() {
  if (cachedRoboFestToken && Date.now() < tokenExpiresAt) {
    return cachedRoboFestToken;
  }
  
  const roboFestUrl = process.env.ROBOFEST_URL || 'http://localhost:3000';
  
  try {
    const res = await fetch(`${roboFestUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'admin', password: 'admin' }) // using seed credentials
    });
    
    if (!res.ok) {
      console.error('Failed to get RoboFest token:', await res.text());
      return null;
    }
    
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      const match = setCookie.match(/auth_token=([^;]+)/);
      if (match) {
        cachedRoboFestToken = match[1];
        tokenExpiresAt = Date.now() + 7 * 60 * 60 * 1000;
        return cachedRoboFestToken;
      }
    }
    return null;
  } catch (err) {
    console.error('Auth request failed:', err);
    return null;
  }
}

// GET /api/operations/stream - Fixed-Target SSE Gateway
router.get('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders(); // Ensure headers are sent immediately

  const roboFestUrl = process.env.ROBOFEST_URL || 'http://localhost:3000';
  const serviceToken = process.env.ROBOFEST_SERVICE_TOKEN;

  if (!serviceToken) {
    return res.end();
  }

  const targetUrl = `${roboFestUrl}/api/realtime`;
  const abortController = new AbortController();

  req.on('close', () => {
    abortController.abort();
  });

  try {
    const upstreamRes = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceToken}`
      },
      signal: abortController.signal
    });

    if (!upstreamRes.ok) {
      return res.end();
    }

    if (upstreamRes.body) {
      const reader = upstreamRes.body.getReader();
      
      const pump = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            // Write directly to the socket, bypassing any Express buffering
            const chunkStr = Buffer.from(value).toString('utf-8');
            if (chunkStr.includes(':\n\n')) {
              res.write(Buffer.from('event: ping\ndata: {}\n\n'));
            }
            res.write(Buffer.from(value));
            
            if (typeof res.flush === 'function') {
              res.flush();
            }
          }
        } catch (err) {
          // fetch aborted or upstream errored
        } finally {
          res.end();
        }
      };
      
      pump();
    } else {
      res.end();
    }
  } catch (err) {
    res.end();
  }
});

// Proxy helper for Commands
async function proxyCommand(urlPath, method, payload, res) {
  const roboFestUrl = process.env.ROBOFEST_URL || 'http://localhost:3000';
  const token = await getRoboFestToken();

  if (!token) {
    return res.status(500).json({ status: 'ERROR', reason: 'Failed to acquire service token' });
  }

  try {
    const upstreamRes = await fetch(`${roboFestUrl}${urlPath}`, {
      method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await upstreamRes.json();
    return res.status(upstreamRes.status).json(data);
  } catch (error) {
    return res.status(502).json({ status: 'ERROR', reason: 'Upstream gateway unreachable' });
  }
}

// POST /api/operations/command/robot
router.post('/command/robot', async (req, res) => {
  const { action, payload } = req.body;
  const cmdId = `senior-cmd-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  const baseCmd = { id: cmdId, timestamp: new Date().toISOString(), source: 'SENIOR_GATEWAY' };

  let upstreamPayload = null;
  
  switch (action) {
    case 'forward': upstreamPayload = { ...baseCmd, type: 'UPDATE_LOCOMOTION', payload: { x: 0, y: 1, trackOffsetDelta: 0 } }; break;
    case 'reverse': upstreamPayload = { ...baseCmd, type: 'UPDATE_LOCOMOTION', payload: { x: 0, y: -1, trackOffsetDelta: 0 } }; break;
    case 'left': upstreamPayload = { ...baseCmd, type: 'UPDATE_LOCOMOTION', payload: { x: -1, y: 0, trackOffsetDelta: 0 } }; break;
    case 'right': upstreamPayload = { ...baseCmd, type: 'UPDATE_LOCOMOTION', payload: { x: 1, y: 0, trackOffsetDelta: 0 } }; break;
    case 'stop': upstreamPayload = { ...baseCmd, type: 'UPDATE_LOCOMOTION', payload: { x: 0, y: 0, trackOffsetDelta: 0 } }; break;
    
    case 'arm_move': 
      if (!payload || typeof payload.xExtension !== 'number' || typeof payload.yPosition !== 'number') {
        return res.status(400).json({ status: 'REJECTED', reason: 'arm_move requires xExtension and yPosition' });
      }
      upstreamPayload = { ...baseCmd, type: 'SET_ARM_POSITION', payload: { xExtension: payload.xExtension, yPosition: payload.yPosition } }; 
      break;
    
    case 'torch_request': upstreamPayload = { ...baseCmd, type: 'SET_TORCH', payload: { enabled: true } }; break;
    case 'torch_off': upstreamPayload = { ...baseCmd, type: 'SET_TORCH', payload: { enabled: false } }; break;
    
    case 'electromagnet_engage': upstreamPayload = { ...baseCmd, type: 'SET_ELECTROMAGNET', payload: { enabled: true } }; break;
    case 'electromagnet_release': upstreamPayload = { ...baseCmd, type: 'SET_ELECTROMAGNET', payload: { enabled: false } }; break;
    
    default: return res.status(400).json({ status: 'REJECTED', reason: 'Unknown robot action' });
  }

  await proxyCommand('/api/robot/command', 'POST', upstreamPayload, res);
});

// POST /api/operations/command/safety
router.post('/command/safety', async (req, res) => {
  const { action } = req.body;
  const cmdId = `senior-cmd-${Date.now()}-${Math.floor(Math.random()*1000)}`;
  const baseCmd = { id: cmdId, timestamp: new Date().toISOString(), source: 'SENIOR_GATEWAY' };
  
  let upstreamPayload = null;
  if (action === 'estop') upstreamPayload = { ...baseCmd, type: 'TRIGGER_EMERGENCY_STOP' };
  else if (action === 'clear_estop') upstreamPayload = { ...baseCmd, type: 'CLEAR_EMERGENCY_STOP' };
  else return res.status(400).json({ status: 'REJECTED', reason: 'Unknown safety action' });

  await proxyCommand('/api/robot/command', 'POST', upstreamPayload, res);
});

// POST /api/operations/command/mission
router.post('/command/mission', async (req, res) => {
  const { missionId, action } = req.body;
  if (!missionId && action !== 'create' && action !== 'validate') {
    return res.status(400).json({ status: 'REJECTED', reason: 'Missing missionId' });
  }
  
  let upstreamAction = null;
  switch (action) {
    case 'create':
      return res.status(501).json({ status: 'UNAVAILABLE', reason: 'Mission creation via Senior is not yet supported in RoboFest API' });
    case 'validate': 
      return res.status(501).json({ status: 'UNAVAILABLE', reason: 'RoboFest missing mission validation endpoint' });
    case 'start': upstreamAction = 'START'; break;
    case 'pause': upstreamAction = 'PAUSE'; break;
    case 'resume': upstreamAction = 'RESUME'; break;
    case 'stop': upstreamAction = 'COMPLETE'; break;
    case 'abort': upstreamAction = 'ABORT'; break;
    default: return res.status(400).json({ status: 'REJECTED', reason: 'Unknown mission action' });
  }
  
  await proxyCommand(`/api/missions/${missionId}/transition`, 'POST', { action: upstreamAction }, res);
});

// POST /api/operations/command/cut
router.post('/command/cut', async (req, res) => {
  const { missionId, cutId, action } = req.body;
  if (!missionId || !cutId) return res.status(400).json({ status: 'REJECTED', reason: 'Missing missionId or cutId' });

  let upstreamAction = null;
  switch (action) {
    case 'validate': return res.status(501).json({ status: 'UNAVAILABLE', reason: 'RoboFest missing cut validation endpoint' });
    case 'prepare': upstreamAction = 'PREPARE'; break;
    case 'execute': upstreamAction = 'SIMULATE'; break; // RoboFest currently uses SIMULATE for execution
    case 'stop': upstreamAction = 'ABORT'; break; 
    default: return res.status(400).json({ status: 'REJECTED', reason: 'Unknown cut action' });
  }

  await proxyCommand(`/api/missions/${missionId}/cuts/${cutId}/transition`, 'POST', { action: upstreamAction }, res);
});

// GET current/active cutting operation
router.get('/active', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const active = await CuttingOperation.findOne({ status: 'running' }).populate('shipId');
      if (active) return res.json(active);
    }
    return res.json(defaultOperation);
  } catch (err) {
    return res.json(defaultOperation);
  }
});

// GET all operations
router.get('/', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const ops = await CuttingOperation.find().populate('shipId').sort({ createdAt: -1 });
      if (ops.length > 0) return res.json(ops);
    }
    return res.json([defaultOperation]);
  } catch (err) {
    return res.json([defaultOperation]);
  }
});

export default router;
