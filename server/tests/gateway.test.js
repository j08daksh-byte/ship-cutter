import test from 'node:test';
import assert from 'node:assert';
import http from 'http';
import express from 'express';
import operationRoutes from '../routes/operations.js';

test('SSE Gateway Fixed-Target Protection', async (t) => {
  // 1. Mock RoboFest Upstream Server
  const upstreamServer = http.createServer((req, res) => {
    assert.strictEqual(req.url, '/api/realtime');
    assert.strictEqual(req.headers.authorization, 'Bearer test-secret-token');
    
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    res.write('event: connected\ndata: {"ok": true}\n\n');
    res.write('event: message\ndata: {"payload": 1}\n\n');
    
    setTimeout(() => res.end(), 50);
  });

  await new Promise(resolve => upstreamServer.listen(0, resolve));
  const upstreamPort = upstreamServer.address().port;

  // 2. Setup Senior Gateway
  process.env.ROBOFEST_URL = `http://localhost:${upstreamPort}`;
  process.env.ROBOFEST_SERVICE_TOKEN = 'test-secret-token';

  const app = express();
  app.use('/api/operations', operationRoutes);

  const gatewayServer = http.createServer(app);
  await new Promise(resolve => gatewayServer.listen(0, resolve));
  const gatewayPort = gatewayServer.address().port;

  // 3. Test Gateway Endpoint
  await t.test('proxies exactly to /api/realtime and strips browser headers', async () => {
    const res = await fetch(`http://localhost:${gatewayPort}/api/operations/stream?target=http://evil.com`, {
      headers: {
        'Authorization': 'Bearer attacker-token'
      }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'text/event-stream');

    const bodyText = await res.text();
    assert.ok(bodyText.includes('event: connected'));
    assert.ok(bodyText.includes('{"payload": 1}'));
  });

  // 4. Test Missing Token Cleanup
  await t.test('fails cleanly if service token is unconfigured', async () => {
    delete process.env.ROBOFEST_SERVICE_TOKEN;
    const res = await fetch(`http://localhost:${gatewayPort}/api/operations/stream`);
    const body = await res.text();
    assert.strictEqual(body, ''); // res.end() without sending anything
  });

  upstreamServer.close();
  gatewayServer.close();
});
