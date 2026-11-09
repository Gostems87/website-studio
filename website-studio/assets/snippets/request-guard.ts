/**
 * Website Studio request guard: the cheap first line of defence for any public
 * server route that spends money, such as an AI feature.
 *
 *   const check = await guard(req, 'quote', { idea, detail });
 *   if (!check.ok) return Response.json({ error: check.message }, { status: check.status });
 *
 * It provides: an off switch, a site-wide daily limit, per-visitor limits and
 * input caps. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN for limits
 * that hold across serverless instances. Without them it counts per instance,
 * which is only good for local testing.
 *
 * The hard money limit belongs at the AI provider, on a dedicated workspace.
 * If the shared counter is unavailable this guard lets requests through, so a
 * blip doesn't take the feature offline, and the provider limit is the backstop.
 *
 * Secrets are read from process.env only. Never log what visitors type.
 */

export const LIMITS = {
  perMinute: 8,
  perDay: 40,
  siteWidePerDay: 500, // size this from the provider's price and the budget
  charsPerField: 500,
  charsTotal: 4000,
} as const;

export type GuardResult =
  | { ok: true; ip: string }
  | { ok: false; status: 400 | 429 | 503; message: string };

const BUSY = "That's as many as we can do for now. Please try again later.";
const OFF = 'This feature is switched off at the moment.';

/** Vercel sets x-forwarded-for itself. On other hosts, confirm the same is true. */
export function clientIp(req: Request): string {
  const first = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return first || req.headers.get('x-real-ip')?.trim() || 'unknown';
}

export function validateFields(fields: Record<string, unknown>): GuardResult | null {
  let total = 0;
  let anything = false;
  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    if (typeof value !== 'string') return { ok: false, status: 400, message: `The ${name} field looks wrong. Please try again.` };
    if (value.trim()) anything = true;
    if (value.length > LIMITS.charsPerField) return { ok: false, status: 400, message: `Please keep each field under ${LIMITS.charsPerField} characters.` };
    total += value.length;
  }
  if (!anything) return { ok: false, status: 400, message: 'Please fill something in first.' };
  if (total > LIMITS.charsTotal) return { ok: false, status: 400, message: `Please keep the total under ${LIMITS.charsTotal} characters.` };
  return null;
}

type Bucket = { count: number; resetAt: number };
const local = new Map<string, Bucket>();

function countLocally(key: string, windowSeconds: number): number {
  const now = Date.now();
  const bucket = local.get(key);
  if (!bucket || now >= bucket.resetAt) {
    local.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    if (local.size > 5000) for (const [k, b] of local) if (now >= b.resetAt) local.delete(k);
    return 1;
  }
  bucket.count += 1;
  return bucket.count;
}

async function countShared(url: string, token: string, key: string, windowSeconds: number): Promise<number | null> {
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify([['SET', key, '0', 'EX', String(windowSeconds), 'NX'], ['INCR', key]]),
      signal: AbortSignal.timeout(2000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as Array<{ result?: number }>;
    return typeof data?.[1]?.result === 'number' ? data[1].result : null;
  } catch {
    return null;
  }
}

function sharedStore(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

let warned = false;

async function hit(key: string, windowSeconds: number): Promise<number | null> {
  const store = sharedStore();
  if (store) return countShared(store.url, store.token, key, windowSeconds);
  if (process.env.VERCEL && !warned) {
    warned = true;
    console.error('request-guard: no shared store is set, so limits only apply per server instance and will NOT hold in production.');
  }
  return countLocally(key, windowSeconds);
}

/** On Vercel, changing an environment variable only reaches new deployments. The shared key works at once. */
async function switchedOff(): Promise<boolean> {
  if (process.env.FEATURE_OFF === '1') return true;
  const store = sharedStore();
  if (!store) return false;
  try {
    const res = await fetch(`${store.url}/get/feature-off`, {
      headers: { Authorization: `Bearer ${store.token}` },
      signal: AbortSignal.timeout(2000),
    });
    const data = (await res.json()) as { result?: string | null };
    return data?.result === '1';
  } catch {
    return false;
  }
}

const over = (count: number | null, limit: number) => count !== null && count > limit;

export async function guard(req: Request, scope: string, fields: Record<string, unknown>): Promise<GuardResult> {
  // The off switch. Immediate: set the key feature-off to 1 in the shared store.
  // Or set FEATURE_OFF=1 in the host's environment variables and redeploy.
  if (await switchedOff()) return { ok: false, status: 503, message: OFF };

  const invalid = validateFields(fields);
  if (invalid) return invalid;

  const ip = clientIp(req);
  if (over(await hit(`guard:${scope}:min:${ip}`, 60), LIMITS.perMinute)) return { ok: false, status: 429, message: BUSY };
  if (over(await hit(`guard:${scope}:day:${ip}`, 86400), LIMITS.perDay)) return { ok: false, status: 429, message: BUSY };
  if (over(await hit(`guard:${scope}:site`, 86400), LIMITS.siteWidePerDay)) return { ok: false, status: 429, message: BUSY };

  return { ok: true, ip };
}
