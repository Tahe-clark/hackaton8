import { Redis } from '@upstash/redis';

export const config = { runtime: 'edge' };
const redis = Redis.fromEnv();

export default async function handler(req) {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';
  const ip = req.headers.get('x-real-ip') || '127.0.0.1';

  // 1. DETECTION DE BOT
  let isBot = false;
  if (/bot|curl|python|spider/i.test(userAgent)) isBot = true;

  const count = await redis.incr(`rate:${ip}`);
  if (count === 1) await redis.expire(`rate:${ip}`, 10);
  if (count > 20) isBot = true;

  // 2. STATS REDIS
  const statsKey = `stats:live`;
  await redis.hincrby(statsKey, isBot ? 'bots' : 'humans', 1);

  // 3. ACTIONS
  if (isBot) {
    return new Response("Accès refusé par AI Guard", { status: 403 });
  }

  // 4. AFFICHER TON SITE (Le "Proxy")
  // On construit le chemin vers ton fichier réel
  const host = req.headers.get('host');
  // On redirige vers ton dossier profond en interne
  const targetPath = url.pathname === '/' ? '/uottawa-ai-buddy/frontend/student-signup.html' : `/uottawa-ai-buddy/frontend${url.pathname}`;
  
  const targetUrl = `https://${host}${targetPath}`;

  // On renvoie le contenu du site
  return fetch(targetUrl);
}
