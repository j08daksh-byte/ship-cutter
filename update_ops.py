import re

with open('server/routes/operations.js', 'r') as f:
    content = f.read()

# Fix proxyCommand to omit body for GET
def replace_proxy(match):
    return '''      const options = {
        method,
        headers: {
          'Authorization': Bearer ,
          'Content-Type': 'application/json'
        }
      };
      if (method !== 'GET' && method !== 'HEAD') {
        options.body = JSON.stringify(payload);
      }
      const upstreamRes = await fetch(${roboFestUrl}, options);'''

content = re.sub(
    r"const upstreamRes = await fetch\(\\$\{roboFestUrl\}\$\{urlPath\}\, \{.*?body: JSON\.stringify\(payload\).*?\}\);",
    replace_proxy,
    content,
    flags=re.DOTALL
)

# Add new proxy routes
routes_to_add = '''
  // Mission CRUD endpoints
  router.get('/missions', async (req, res) => {
    await proxyCommand('/api/missions', 'GET', null, res);
  });
  
  router.get('/missions/:id', async (req, res) => {
    await proxyCommand(/api/missions/, 'GET', null, res);
  });
  
  router.post('/missions', async (req, res) => {
    await proxyCommand('/api/missions', 'POST', req.body, res);
  });
  
  router.post('/missions/:id/cuts', async (req, res) => {
    await proxyCommand(/api/missions//cuts, 'POST', req.body, res);
  });
  
  router.get('/missions/:id/cuts', async (req, res) => {
    await proxyCommand(/api/missions//cuts, 'GET', null, res);
  });
'''

# Find the location of module.exports = router; to insert the new routes right before it
content = content.replace('module.exports = router;', routes_to_add + '\nmodule.exports = router;')

with open('server/routes/operations.js', 'w') as f:
    f.write(content)

print('Updated operations.js')
