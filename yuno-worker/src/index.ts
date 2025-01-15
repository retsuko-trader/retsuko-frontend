import { config } from 'dotenv';
console.log(config({ path: '.env' }));

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { prepare } from './db.js';
import { StreamClient } from './stream.js';

const PORT = 3005

const app = new Hono();
const client = new StreamClient();

app.get('/health', c => {
  return c.text('healthy');
});

app.get('/streams', async c => {
  const streams = Array.from(client.$states.values());
  return c.json(streams);
});

app.post('/subscribe', async c => {
  const input = await c.req.json() as { symbol: string, interval: string };
  await client.subscribe(input);

  return c.json({ success: true });
});

app.post('/unsubscribe', async c => {
  const input = await c.req.json() as { symbol: string, interval: string };
  await client.unsubscribe(input);

  return c.json({ success: true });
});

async function main() {
  await prepare();
  await client.load();

  console.log(`Server is running on http://localhost:${PORT}`)
  serve({
    fetch: app.fetch,
    port: PORT,
  })
}

main();