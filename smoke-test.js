const http = require('http');

function requestJson(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host: 'localhost', port: 3000, path }, (res) => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const parsed = raw ? JSON.parse(raw) : {};
          resolve({ statusCode: res.statusCode, body: parsed });
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on('error', reject);
  });
}

async function main() {
  const health = await requestJson('/api/health');
  const facilities = await requestJson('/api/facilities');

  if (health.statusCode !== 200 || health.body.status !== 'ok') {
    throw new Error(`Health check failed: ${JSON.stringify(health)}`);
  }

  if (facilities.statusCode !== 200) {
    throw new Error(`Facilities check failed: ${JSON.stringify(facilities)}`);
  }

  console.log('Smoke test passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
