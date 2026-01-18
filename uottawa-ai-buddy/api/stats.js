import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };
const redis = Redis.fromEnv();

export default async function handler() {
  const data = await redis.hgetall('stats:live');
  return new Response(JSON.stringify(data || { total: 0, humans: 0, bots: 0 }), {
    headers: { 'content-type': 'application/json' }
  });
}
