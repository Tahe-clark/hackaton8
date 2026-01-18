import { Redis } from '@upstash/redis';

// Indique à Vercel d'utiliser le réseau Edge (ultra rapide)
export const config = {
  runtime: 'edge',
};

// Initialisation de Redis avec les variables d'environnement
const redis = Redis.fromEnv();

// Tes serveurs de destination
const BACKENDS = [
  "https://api-region-1.com", // Remplace par tes vrais URLs
  "https://api-region-2.com"
];

export default async function handler(req) {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || '';
  const ip = req.headers.get('x-real-ip') || '127.0.0.1';

  // --- AI GUARD / DÉTECTION DE BOT ---
  let isBot = false;

  // 1. Heuristique basée sur l'identité (User-Agent)
  const botPattern = /bot|curl|python|spider|automation/i;
  if (botPattern.test(userAgent)) {
    isBot = true;
  }

  // 2. Heuristique comportementale (Rate Limiting via Redis)
  // On compte combien de fois cette IP a appelé le site en 10 secondes
  const count = await redis.incr(`rate:${ip}`);
  if (count === 1) await redis.expire(`rate:${ip}`, 10);
  if (count > 20) isBot = true; // Si > 20 requêtes, on considère que c'est un bot

  // --- STATISTIQUES EN TEMPS RÉEL ---
  // On stocke les stats par heure pour le dashboard
  const statsKey = `stats:${new Date().getUTCHours()}`;
  await redis.hincrby(statsKey, isBot ? 'bots' : 'humans', 1);

  // --- ACTIONS ---
  if (isBot) {
    return new Response(JSON.stringify({ 
      error: "Accès refusé par AI Guard",
      reason: "Comportement suspect détecté" 
    }), {
      status: 403,
      headers: { 'content-type': 'application/json' }
    });
  }

  // LOGIQUE DE LOAD BALANCER (Choix aléatoire)
  const targetBackend = BACKENDS[Math.floor(Math.random() * BACKENDS.length)];
  const targetUrl = targetBackend + url.pathname + url.search;

  // On redirige la requête vers le backend choisi (Proxying)
  return fetch(targetUrl, {
    method: req.method,
    headers: req.headers,
    body: req.body
  });
}
