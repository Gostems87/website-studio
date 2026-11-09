/*
 * Website Studio preview gate: asks for a password before showing the preview.
 * Put this next to vercel.json, and set PREVIEW_PASSWORD in the host's
 * environment variables. It stays locked if the password isn't set.
 *
 * This keeps casual visitors out of a preview. It is not a customer login.
 * Delete it before launch. Plain static sites only: on Next.js 16 and later the
 * same logic belongs in proxy.ts, exporting a function called proxy.
 */
export const config = { matcher: '/((?!favicon\\.ico$).*)' };

function matches(a, b) {
  let diff = a.length ^ b.length;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i % (b.length || 1));
  return diff === 0;
}

export default function middleware(request) {
  const password = process.env.PREVIEW_PASSWORD;
  if (!password) return new Response('This preview is locked.', { status: 503 });

  const [scheme, encoded] = (request.headers.get('authorization') || '').split(' ');
  if (scheme === 'Basic' && encoded) {
    let supplied = '';
    try {
      const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
      supplied = new TextDecoder().decode(bytes).split(':').slice(1).join(':');
    } catch {
      supplied = '';
    }
    if (matches(supplied, password)) {
      return new Response(null, { headers: { 'x-middleware-next': '1' } });
    }
  }

  return new Response('A password is needed to see this preview.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Website preview", charset="UTF-8"',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}
