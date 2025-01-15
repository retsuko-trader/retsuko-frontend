import 'dotenv';

import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { prepare } from './db.js';
import { StreamClient } from './stream.js';

const PORT = 3005
const CALLBACK_URL = process.env.YUNO_CALLBACK_URL || 'http://localhost:3000/callback';

const app = new Hono();
const client = new StreamClient();

app.get('/health', c => {
  return c.text('healthy');
});

app.post('/subscribe', async c => {
  const input = await c.req.json() as { symbol: string, interval: string };
  await client.subscribe(input);

  return c.json({ success: true });
})


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