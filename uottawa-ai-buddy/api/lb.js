import { Redis } from '@upstash/redis';

export const config = {
  runtime: 'edge', // Utilise le réseau mondial ultra-rapide
};

const redis = Redis.fromEnv();

// --- CONFIGURATION ---
const BACKENDS = [
  "https://jsonplaceholder.typicode.com", // Backend A (exemple)
  "https://api.publicapis.org"           // Backend B (exemple)
];

export default async function handler(req) {
  const url = new URL(req.url);
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const ip = req.headers.get('x-real-ip') || '127.0.0.1';

  // 1. AI GUARD : DÉTECTION DE BOT (Heuristiques)
  let isBot = false;
  const botPattern = /bot|curl|python|spider|wget|postman/i;
  
  // Test d'identité
  if (botPattern.test(userAgent)) isBot = true;

  // Test de comportement (Rate Limiting)
  const requestCount = await redis.incr(`rate:${ip}`);
  if (requestCount === 1) await redis.expire(`rate:${ip}`, 30);
  if (requestCount > 15) isBot = true; // Plus de 15 requêtes en 30s = Bot suspecté

  // 2. COLLECTE DES STATS (Pour le dashboard)
  const statsKey = `stats:live`;
  await Promise.all([
    redis.hincrby(statsKey, 'total', 1),
    isBot ? redis.hincrby(statsKey, 'bots', 1) : redis.hincrby(statsKey, 'humans', 1)
  ]);

  // 3. ACTION SI BOT DÉTECTÉ
  if (isBot) {
    return new Response(
      JSON.stringify({ error: "Access Denied", message: "AI Guard detected bot behavior" }), 
      { status: 403, headers: { 'content-type': 'application/json' } }
    );
  }

  // 4. LOAD BALANCING (Sélection aléatoire intelligente)
  const targetBackend = BACKENDS[Math.floor(Math.random() * BACKENDS.length)];
  const targetUrl = targetBackend + url.pathname + url.search;

  // On redirige la requête vers le backend (Proxy)
  const response = await fetch(targetUrl, {
    method: req.method,
    headers: req.headers,
  });

  return response;
}


  // LOGIQUE DE REDIRECTION POUR LES HUMAINS
  // Au lieu d'aller vers des sites externes, on va vers ton dossier frontend
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const host = req.headers.get('host');
  
  // On redirige l'humain vers la page d'accueil de ton dossier frontend
  const targetUrl = `${protocol}://${host}/frontend/index.html`;

  return NextResponse.rewrite(new URL('/frontend/index.html', req.url));
  // OU si tu veux faire du vrai Load Balancing entre deux versions :
  // const targets = ['/frontend/index.html', '/frontend/student-signup.html'];
  // const choice = targets[Math.floor(Math.random() * targets.length)];
  // return NextResponse.rewrite(new URL(choice, req.url));
