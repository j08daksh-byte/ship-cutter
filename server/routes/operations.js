import express from 'express';
import CuttingOperation from '../models/CuttingOperation.js';
import { defaultOperation } from '../config/seedData.js';
import mongoose from 'mongoose';

const router = express.Router();

// GET /api/operations/stream - Fixed-Target SSE Gateway
router.get('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
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
