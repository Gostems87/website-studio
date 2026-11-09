#!/usr/bin/env node
/*
 * check-site.mjs: the Website Studio inspector.
 *
 * Opens a site in headless Chrome the way a visitor would, on a desktop and a
 * phone, saves full-page screenshots, and tests for layout faults, accessibility
 * basics, "AI made that" design tells and stage-specific go-live faults.
 *
 * Needs Node 22 or newer and Google Chrome (or Edge or Chromium). No npm install.
 *
 *   node check-site.mjs <url | folder | file.html> [options]
 *
 *   --stage mockup|preview|live   Which rules apply (default: mockup)
 *   --out <folder>                Where the report and screenshots go
 *                                 (default: ./qa/site-check-<stage>)
 *   --pages home,about,contact    Pages to check (default: follows the site's
 *                                 own links from the first page, up to 12)
 *   --allow pills,hover-lift      Tells the owner has knowingly chosen to keep
 *   --forbid "Name One,Name Two"  Words that must never appear in the pages
 *   --chrome <path>               Browser to use, if it can't be found
 *
 * Exit code 0 means no failures, 1 means at least one, 2 means it couldn't run.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { basename, dirname, extname, join, normalize, resolve, sep } from 'node:path';
import dns from 'node:dns/promises';

const VIEWPORTS = [
  { key: 'desktop', width: 1440, height: 900, scale: 1, mobile: false },
  { key: 'phone', width: 390, height: 844, scale: 2, mobile: true },
];
const MAX_PAGES = 12;
const MAX_SHOT_HEIGHT = 24000;
const MAX_SLICES = 30;
const TRACKERS = /google-analytics\.com|googletagmanager\.com|connect\.facebook\.net|facebook\.com\/tr|clarity\.ms|hotjar\.com|doubleclick\.net|ads-twitter\.com|linkedin\.com\/px|snap\.licdn\.com/i;
const TRACKING_COOKIES = /^(_ga|_gid|_gat|_gcl|_fbp|_fbc|_hj|_clck|_clsk|_uet|li_|IDE$|NID$)/;

function parseArgs(argv) {
  const opts = { stage: 'mockup', allow: [], forbid: [], pages: null, out: null, chrome: null, target: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--help' || a === '-h') opts.help = true;
    else if (a === '--stage') opts.stage = argv[++i];
    else if (a === '--out') opts.out = argv[++i];
    else if (a === '--chrome') opts.chrome = argv[++i];
    else if (a === '--pages') opts.pages = argv[++i].split(',').map(pagePath).filter(Boolean);
    else if (a === '--allow') opts.allow = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a === '--forbid') opts.forbid = argv[++i].split(',').map((s) => s.trim()).filter(Boolean);
    else if (a.startsWith('--')) die(`I don't know the option ${a}. Run with --help to see the options.`);
    else opts.target = a;
  }
  return opts;
}

function pagePath(raw) {
  const p = raw.trim();
  if (!p) return '';
  if (/^[A-Za-z]:[\/]/.test(p)) die('Give --pages as page names, like home,about,contact.');
  if (p === 'home' || p === '/') return '/';
  return p.startsWith('/') ? p : `/${p}`;
}

function die(message) {
  console.error(message);
  process.exit(2);
}

function findBrowser(explicit) {
  const env = process.env;
  const candidates = [
    explicit,
    env.CHROME_PATH,
    env.PROGRAMFILES && join(env.PROGRAMFILES, 'Google/Chrome/Application/chrome.exe'),
    env['PROGRAMFILES(X86)'] && join(env['PROGRAMFILES(X86)'], 'Google/Chrome/Application/chrome.exe'),
    env.LOCALAPPDATA && join(env.LOCALAPPDATA, 'Google/Chrome/Application/chrome.exe'),
    env['PROGRAMFILES(X86)'] && join(env['PROGRAMFILES(X86)'], 'Microsoft/Edge/Application/msedge.exe'),
    env.PROGRAMFILES && join(env.PROGRAMFILES, 'Microsoft/Edge/Application/msedge.exe'),
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p));
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
  '.woff': 'font/woff', '.ttf': 'font/ttf', '.otf': 'font/otf', '.txt': 'text/plain', '.xml': 'application/xml',
  '.mp3': 'audio/mpeg', '.mp4': 'video/mp4', '.webm': 'video/webm', '.pdf': 'application/pdf',
};

function serveFolder(root) {
  const base = resolve(root);
  const server = createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    } catch {
      res.writeHead(400).end();
      return;
    }
    if (pathname.split(/[\\/]/).some((segment) => segment.startsWith('.'))) {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
      return;
    }
    const safe = normalize(join(base, pathname));
    if (safe !== base && !safe.startsWith(base + sep)) {
      res.writeHead(403).end();
      return;
    }
    const tries = [safe, join(safe, 'index.html'), `${safe}.html`];
    const hit = tries.find((p) => existsSync(p) && statSync(p).isFile());
    if (!hit) {
      res.writeHead(404, { 'content-type': 'text/plain' }).end('Not found');
      return;
    }
    res.writeHead(200, { 'content-type': MIME[extname(hit).toLowerCase()] || 'application/octet-stream' });
    res.end(readFileSync(hit));
  });
  return new Promise((ok) => server.listen(0, '127.0.0.1', () => ok(server)));
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = [];
    ws.addEventListener('message', (event) => {
      const msg = JSON.parse(event.data);
      if (msg.id && this.pending.has(msg.id)) {
        const { ok, fail, timer } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        clearTimeout(timer);
        if (msg.error) fail(new Error(msg.error.message));
        else ok(msg.result);
      } else if (msg.method) {
        this.listeners.forEach((fn) => fn(msg));
      }
    });
  }

  send(method, params = {}, timeoutMs = 30000) {
    const id = ++this.nextId;
    return new Promise((ok, fail) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        fail(new Error(`The browser didn't answer ${method} in time`));
      }, timeoutMs);
      this.pending.set(id, { ok, fail, timer });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(fn) {
    this.listeners.push(fn);
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function launchBrowser(path) {
  const profile = mkdtempSync(join(tmpdir(), 'website-studio-'));
  const proc = spawn(path, [
    '--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', '--no-default-browser-check',
    '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank',
  ], { stdio: 'ignore' });
  const portFile = join(profile, 'DevToolsActivePort');
  for (let i = 0; i < 150 && !existsSync(portFile); i++) await sleep(100);
  if (!existsSync(portFile)) {
    proc.kill();
    die('Chrome started but never opened its inspection port. Close any stuck Chrome windows and try again.');
  }
  await sleep(150);
  const port = readFileSync(portFile, 'utf8').split('\n')[0].trim();
  let target;
  for (let i = 0; i < 50 && !target; i++) {
    const list = await fetch(`http://127.0.0.1:${port}/json/list`).then((r) => r.json()).catch(() => []);
    target = list.find((t) => t.type === 'page');
    if (!target) await sleep(100);
  }
  if (!target) {
    proc.kill();
    die("Chrome started but didn't open a page.");
  }
  const ws = new WebSocket(target.webSocketDebuggerUrl);
  try {
    await new Promise((ok, fail) => {
      ws.addEventListener('open', ok, { once: true });
      ws.addEventListener('error', fail, { once: true });
    });
  } catch {
    proc.kill();
    die("I couldn't connect to Chrome. Close any stuck Chrome windows and try again.");
  }
  return {
    cdp: new Cdp(ws),
    close: async () => {
      try { ws.close(); } catch { /* already closed */ }
      proc.kill();
      await sleep(400);
      try { rmSync(profile, { recursive: true, force: true }); } catch { /* Windows may hold it briefly */ }
    },
  };
}

// Runs inside the page. Returns plain data; every judgement is made outside.
const PAGE_AUDIT = String.raw`(() => {
  // Font list adapted from impeccable (Apache 2.0), with four added. See THIRD-PARTY-NOTICES.md.
  const REFLEX = ['fraunces','newsreader','lora','crimson','crimson pro','crimson text','playfair display','cormorant','cormorant garamond','syne','ibm plex mono','ibm plex sans','ibm plex serif','space mono','space grotesk','inter','dm sans','dm serif display','dm serif text','outfit','plus jakarta sans','instrument sans','instrument serif','geist','poppins','montserrat','manrope'];
  const all = [...document.querySelectorAll('body *')];
  const vis = (el) => { const r = el.getBoundingClientRect(); const s = getComputedStyle(el); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const name = (el) => { const c = (el.getAttribute('class') || '').trim().split(/\s+/).slice(0, 2).join('.'); const t = (el.innerText || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40); return el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (c ? '.' + c : '') + (t ? ' "' + t + '"' : ''); };
  const seen = all.filter(vis);
  const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const out = {};

  const meta = (n) => document.querySelector('meta[name="' + n + '"]')?.content || '';
  out.meta = { lang: document.documentElement.lang, title: document.title, description: meta('description'), viewport: meta('viewport'), robots: meta('robots'), canonical: document.querySelector('link[rel=canonical]')?.href || '', ogTitle: document.querySelector('meta[property="og:title"]')?.content || '', ogImage: document.querySelector('meta[property="og:image"]')?.content || '', favicon: !!document.querySelector('link[rel~=icon]'), h1: [...document.querySelectorAll('h1')].filter(vis).length, ribbon: !!document.querySelector('[data-preview-ribbon]') };

  const docW = document.documentElement.scrollWidth, winW = window.innerWidth;
  const clipped = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { const s = getComputedStyle(p); if (/(hidden|auto|scroll|clip)/.test(s.overflowX)) return true; } return false; };
  const fixedOff = (el) => { for (let p = el; p; p = p.parentElement) { const s = getComputedStyle(p); if (s.position === 'fixed') return true; } return false; };
  out.overflow = { by: Math.max(0, docW - winW), offenders: docW > winW + 1 ? seen.filter((e) => e.getBoundingClientRect().right > winW + 1 && !clipped(e) && !fixedOff(e)).slice(0, 5).map(name) : [] };

  const imgs = [...document.images];
  out.images = { noAlt: imgs.filter((i) => !i.hasAttribute('alt')).slice(0, 8).map((i) => i.currentSrc || i.src), broken: imgs.filter((i) => i.complete && i.naturalWidth === 0).slice(0, 8).map((i) => i.currentSrc || i.src), oversized: imgs.filter((i) => vis(i) && i.naturalWidth > 2.5 * i.getBoundingClientRect().width * devicePixelRatio && i.naturalWidth > 1200).slice(0, 8).map((i) => (i.currentSrc || i.src) + ' (' + i.naturalWidth + 'px wide, shown at ' + Math.round(i.getBoundingClientRect().width) + 'px)') };

  const controls = [...document.querySelectorAll('input,select,textarea')].filter((c) => vis(c) && !['hidden','submit','button','reset'].includes(c.type));
  out.unlabelled = controls.filter((c) => !c.labels?.length && !c.getAttribute('aria-label') && !c.getAttribute('aria-labelledby')).slice(0, 8).map(name);
  out.unnamed = [...document.querySelectorAll('a[href],button')].filter((b) => vis(b) && !(b.innerText || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('aria-labelledby') && !b.querySelector('img[alt]:not([alt=""]),svg title')).slice(0, 8).map(name);
  out.deadLinks = [...document.querySelectorAll('a[href="#"],a[href=""]')].filter(vis).slice(0, 8).map(name);

  const targets = [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,[role=button]')].filter(vis).filter((el) => { if (el.tagName === 'A' && el.closest('p,li') && (el.closest('p,li').innerText || '').trim().length > (el.innerText || '').trim().length + 12) return false; return true; }).filter((el) => !el.closest('[aria-hidden="true"]') && el.getBoundingClientRect().right > 0 && !(el.classList.contains('skip-link'))).map((el) => { let r = el.getBoundingClientRect(); const lab = el.labels && el.labels[0]; if (lab && vis(lab)) { const l = lab.getBoundingClientRect(); r = { left: Math.min(r.left, l.left), right: Math.max(r.right, l.right), top: Math.min(r.top, l.top), bottom: Math.max(r.bottom, l.bottom) }; } const w = r.right - r.left, h = r.bottom - r.top; return { n: name(el), w: Math.round(w), h: Math.round(h), l: r.left, r: r.right, t: r.top, b: r.bottom, cx: r.left + w / 2, cy: r.top + h / 2 }; });
  const under24 = (t) => t.w < 24 || t.h < 24;
  const spaced = (t) => targets.every((o) => { if (o === t) return true; const dx = Math.max(o.l - t.cx, 0, t.cx - o.r), dy = Math.max(o.t - t.cy, 0, t.cy - o.b); if (Math.hypot(dx, dy) < 12) return false; return !under24(o) || Math.hypot(o.cx - t.cx, o.cy - t.cy) >= 24; });
  out.tiny = targets.filter((t) => under24(t) && !spaced(t)).slice(0, 8).map((t) => t.n + ' (' + t.w + 'x' + t.h + 'px)');
  out.small = targets.filter((t) => (t.w < 44 || t.h < 44) && (!under24(t) || spaced(t))).slice(0, 8).map((t) => t.n + ' (' + t.w + 'x' + t.h + 'px)');

  const cv = document.createElement('canvas'); cv.width = cv.height = 1; const cx = cv.getContext('2d', { willReadFrequently: true }); const cache = new Map();
  const rgba = (c) => { if (cache.has(c)) return cache.get(c); cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = c; cx.fillRect(0, 0, 1, 1); const d = cx.getImageData(0, 0, 1, 1).data; const v = [d[0], d[1], d[2], d[3] / 255]; cache.set(c, v); return v; };
  const lum = ([r, g, b]) => { const f = (x) => { x /= 255; return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const over = (top, bot) => { const a = top[3]; return [top[0] * a + bot[0] * (1 - a), top[1] * a + bot[1] * (1 - a), top[2] * a + bot[2] * (1 - a), 1]; };
  const backdrop = (el) => { const layers = []; for (let p = el; p; p = p.parentElement) { const s = getComputedStyle(p); if (s.backgroundImage !== 'none') return null; const c = rgba(s.backgroundColor); if (c[3] > 0) { layers.push(c); if (c[3] === 1) break; } } let base = [255, 255, 255, 1]; for (const l of layers.reverse()) base = over(l, base); return base; };
  const lowContrast = []; const textEls = seen.filter((e) => ownText(e).length > 1); const media = [...document.querySelectorAll('img,video,canvas,picture')].filter(vis);
  const overMedia = (el) => { const r = el.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2; return media.some((m) => { if (m.contains(el) || el.contains(m)) return false; const b = m.getBoundingClientRect(); return x >= b.left && x <= b.right && y >= b.top && y <= b.bottom; }); };
  for (const el of textEls) { const s = getComputedStyle(el); let hidden = false; for (let p = el; p; p = p.parentElement) { if (+getComputedStyle(p).opacity < 0.99) { hidden = true; break; } } if (hidden) continue; if (overMedia(el)) continue; const bg = backdrop(el); if (!bg) continue; const fg = over(rgba(s.color), bg); const a = lum(fg), b = lum(bg); const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); const px = parseFloat(s.fontSize); const big = px >= 24 || (px >= 18.66 && parseInt(s.fontWeight) >= 700); if (ratio < (big ? 3 : 4.5)) lowContrast.push(name(el) + ' (' + ratio.toFixed(2) + ':1)'); }
  out.lowContrast = [...new Set(lowContrast)].slice(0, 10);

  const fontCount = {}; const clean = (f) => f.split(',')[0].replace(/["']/g, '').trim().replace(/^_+/, '').replace(/_[0-9a-f]{5,}$/i, '').replace(/_?fallback.*$/i, '').replace(/_/g, ' ').trim().toLowerCase();
  textEls.forEach((el) => { const f = clean(getComputedStyle(el).fontFamily); fontCount[f] = (fontCount[f] || 0) + 1; });
  const scrolls = (el) => { for (let p = el.parentElement; p; p = p.parentElement) { if (/(auto|scroll)/.test(getComputedStyle(p).overflowX)) return true; } return false; };
  out.cutOff = textEls.filter((el) => { if (el.closest('[aria-hidden="true"]') || fixedOff(el) || scrolls(el)) return false; const rng = document.createRange(); rng.selectNodeContents(el); const b = rng.getBoundingClientRect(); return b.width > 0 && ((b.right > winW + 2 && b.left < winW) || (b.left < -2 && b.right > 0)); }).slice(0, 6).map(name);
  out.hiddenShowing = [...document.querySelectorAll('[hidden]')].filter(vis).slice(0, 6).map(name);
  out.overPicture = textEls.filter(overMedia).slice(0, 6).map(name);
  out.fonts = fontCount; out.reflexFonts = Object.keys(fontCount).filter((f) => REFLEX.includes(f));

  const pill = seen.filter((el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); const rad = parseFloat(s.borderTopLeftRadius); if (!rad || s.borderTopLeftRadius.includes('%')) return false; const painted = rgba(s.backgroundColor)[3] > 0 || parseFloat(s.borderTopWidth) > 0; return painted && r.height <= 64 && r.width > r.height * 1.4 && rad >= r.height / 2 - 1 && (el.innerText || '').trim().length > 0; });
  out.pills = pill.slice(0, 6).map(name); out.pillCount = pill.length;
  out.gradientText = seen.filter((el) => { const s = getComputedStyle(el); return (s.webkitBackgroundClip === 'text' || s.backgroundClip === 'text') && s.backgroundImage.includes('gradient'); }).slice(0, 6).map(name);
  const purple = (bg) => (bg.match(/rgba?([^)]+)/g) || []).some((c) => { const [r, g, b] = rgba(c); const max = Math.max(r, g, b), min = Math.min(r, g, b); if (max - min < 50) return false; const d = max - min; const h = max === r ? 60 * (((g - b) / d) % 6) : max === g ? 60 * ((b - r) / d + 2) : 60 * ((r - g) / d + 4); const hue = (h + 360) % 360; return hue >= 235 && hue <= 300; });
  out.purpleGradient = seen.filter((el) => { const bg = getComputedStyle(el).backgroundImage; const r = el.getBoundingClientRect(); return bg.includes('gradient') && r.width * r.height > 40000 && purple(bg); }).slice(0, 4).map(name);
  out.stripes = seen.filter((el) => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); if (r.height < 32) return false; const lw = parseFloat(s.borderLeftWidth), rw = parseFloat(s.borderRightWidth), tw = parseFloat(s.borderTopWidth), bw = parseFloat(s.borderBottomWidth); if (r.height > 320) return false; const coloured = (c) => { const v = rgba(c); return v[3] > 0 && Math.max(v[0], v[1], v[2]) - Math.min(v[0], v[1], v[2]) > 40; }; const edge = (lw >= 2 && rw <= 1 && tw <= 1 && bw <= 1 && coloured(s.borderLeftColor)) || (rw >= 2 && lw <= 1 && tw <= 1 && bw <= 1 && coloured(s.borderRightColor)); const stripe = s.boxShadow.match(/^(rgba?\([^)]+\)) [2-9]\d*px 0px 0px 0px inset/); return edge || (stripe && coloured(stripe[1])); }).slice(0, 6).map(name);
  const glassy = seen.filter((el) => (getComputedStyle(el).backdropFilter || '').includes('blur')); const barLike = (el) => el.matches('header,nav') || ['sticky', 'fixed'].includes(getComputedStyle(el).position);
  out.glass = glassy.filter((el) => !barLike(el)).slice(0, 6).map(name); out.glassBar = glassy.filter(barLike).slice(0, 3).map(name);
  out.italicAccent = [...document.querySelectorAll('h1,h2,h3')].filter(vis).filter((h) => getComputedStyle(h).fontStyle !== 'italic' && [...h.querySelectorAll('*')].some((c) => getComputedStyle(c).fontStyle === 'italic')).slice(0, 6).map(name);
  out.circleTicks = seen.filter((el) => { const s = getComputedStyle(el); const t = (el.innerText || '').trim(); const r = parseFloat(s.borderTopLeftRadius); const b = el.getBoundingClientRect(); const round = s.borderTopLeftRadius.includes('%') ? r >= 50 : r >= b.height / 2 - 1; if (!round || b.height > 64) return false; if (/^[\u2713\u2714\u2705]$/.test(t)) return true; const svg = el.querySelector(':scope > svg'); return !t && svg && /check|tick/i.test((svg.getAttribute('class') || '') + (svg.getAttribute('data-icon') || '') + (svg.getAttribute('aria-label') || '')); }).slice(0, 6).map(name);

  const lift = new Set(); let usesMotion = false, respectsMotion = false;
  const walk = (rules) => { for (const rule of rules) { if (rule.media && /prefers-reduced-motion/.test(rule.media.mediaText)) respectsMotion = true; if (rule.conditionText && /prefers-reduced-motion/.test(rule.conditionText)) respectsMotion = true; if (rule.cssRules && rule.cssRules.length) { try { walk(rule.cssRules); } catch (e) {} } if (rule.type === 7) usesMotion = true; const text = rule.cssText || ''; if (/animation(-name)?\s*:\s*(?!none)/.test(text)) usesMotion = true; if (rule.selectorText && rule.selectorText.includes(':hover') && /(translateY\(\s*-|translate:\s*[^;]*-|--tw-translate-y:\s*calc\([^;]*-)/.test(text)) { try { document.querySelectorAll(rule.selectorText.replace(/:hover/g, '')).forEach((el) => { if (vis(el) && el.getBoundingClientRect().height > 120) lift.add(name(el)); }); } catch (e) {} } } };
  for (const sheet of document.styleSheets) { try { walk(sheet.cssRules); } catch (e) {} }
  out.hoverLift = [...lift].slice(0, 6); out.motionNoReduce = usesMotion && !respectsMotion;

  const grids = []; const isIcon = (c) => { const i = c.querySelector('svg, img'); if (!i) return false; const b = i.getBoundingClientRect(); return b.width <= 72 && b.height <= 72; };
  seen.forEach((p) => { const kids = [...p.children].filter(vis); if (kids.length < 3) return; const w = kids[0].getBoundingClientRect().width; if (!kids.every((k) => Math.abs(k.getBoundingClientRect().width - w) < 4)) return; if (kids.filter((k) => isIcon(k) && k.querySelector('h2,h3,h4,h5,strong') && k.querySelector('p')).length >= 3) grids.push(name(p)); });
  out.iconGrids = grids.slice(0, 4);
  const h2s = [...document.querySelectorAll('h2')].filter(vis); const eyebrow = (h) => { let e = h.previousElementSibling; if (!e && h.parentElement) e = h.parentElement.previousElementSibling; if (!e || !vis(e)) return false; const s = getComputedStyle(e); const t = (e.innerText || '').trim(); return t.length > 0 && t.length < 50 && parseFloat(s.fontSize) <= 14 && (s.textTransform === 'uppercase' || t === t.toUpperCase()) && parseFloat(s.letterSpacing) > 0; };
  out.eyebrows = { withLabel: h2s.filter(eyebrow).length, total: h2s.length };
  out.numberedSteps = seen.filter((e) => /^0[1-9]\.?$/.test((e.innerText || '').trim()) && !e.children.length).length;

  const text = document.body.innerText || '';
  out.text = { emDashes: (text.match(/\u2014/g) || []).length, emoji: (text.match(/\p{Extended_Pictographic}/gu) || []).filter((c) => !'\u00a9\u00ae\u2122'.includes(c)).length, sloppy: [...new Set((text.match(/\b(seamless(ly)?|elevate[sd]?|unlock(s|ing)?|leverag(e|es|ing)|empower(s|ing)?|cutting[- ]edge|world[- ]class|game[- ]chang(er|ing)|nestled|robust|tapestry|delve|revolutioni[sz]e|supercharge|effortless(ly)?|next[- ]level|best[- ]in[- ]class)\b/gi) || []).map((w) => w.toLowerCase()))], placeholders: [...new Set((text.match(/lorem ipsum|\bTODO\b|\bTBC\b|\bFIXME\b|your (tagline|headline|company name) here|example\.com|acme (inc|ltd|corp)/gi) || []).map((w) => w.toLowerCase()))], testCard: /4242\s?4242\s?4242\s?4242/.test(text), privacy: /privacy/i.test(location.pathname) || [...document.querySelectorAll('a[href]')].some((a) => /privacy/i.test(a.href + a.innerText)) };
  const html = document.documentElement.outerHTML;
  out.keys = { live: /pk_live_[0-9A-Za-z]+/.test(html), test: /pk_test_[0-9A-Za-z]+/.test(html), tailwindCdn: /cdn\.tailwindcss\.com/.test(html) };
  out.source = html;
  out.cardFields = [...document.querySelectorAll('input,select,textarea')].filter((c) => !c.disabled && !c.readOnly && c.type !== 'hidden' && (/^cc-/.test(c.autocomplete || '') || /(card.?(num(ber)?|no)\b|ccnum|\bcvc\b|\bcvv\b|security.?code)/i.test([c.name, c.id, c.getAttribute('aria-label'), ...[...(c.labels || [])].map((l) => l.innerText)].join(' ')))).slice(0, 6).map(name);
  out.previewLeft = [...new Set((html.match(/MODE\s*=\s*['"]preview['"]|PASTE-[A-Z0-9-]+|SITE-TOKEN|Demo: no payment|on the live site|Nothing has been sent|Preview only/gi) || []).map((w) => w.toLowerCase()))];
  out.scripts = [...new Set([...document.scripts].map((s) => s.src).concat(performance.getEntriesByType('resource').filter((e) => e.initiatorType === 'script').map((e) => e.name)))].filter((u) => { try { return new URL(u).origin === location.origin; } catch (e) { return false; } }).slice(0, 60);
  out.links = [...document.querySelectorAll('a[href]')].map((a) => { try { const u = new URL(a.href); return u.origin === location.origin ? u.pathname : null; } catch (e) { return null; } }).filter(Boolean);
  out.vitals = window.__wsVitals || {};
  return out;
})()`;

const VITALS_SEED = `window.__wsVitals={lcp:0,cls:0};
try{new PerformanceObserver(l=>{for(const e of l.getEntries())window.__wsVitals.lcp=e.startTime}).observe({type:'largest-contentful-paint',buffered:true});
new PerformanceObserver(l=>{for(const e of l.getEntries())if(!e.hadRecentInput)window.__wsVitals.cls+=e.value}).observe({type:'layout-shift',buffered:true});}catch(e){}`;

async function waitForLoad(cdp, navigate, timeoutMs = 25000) {
  let done;
  const loaded = new Promise((ok) => { done = ok; });
  const listener = (m) => { if (m.method === 'Page.loadEventFired') done(); };
  cdp.on(listener);
  const nav = await navigate();
  await Promise.race([loaded, sleep(timeoutMs)]);
  cdp.listeners = cdp.listeners.filter((l) => l !== listener);
  await sleep(700);
  return nav;
}

async function scrollThrough(cdp) {
  await cdp.send('Runtime.evaluate', {
    expression: `(async () => { const h = () => document.documentElement.scrollHeight; let y = 0; while (y < h()) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); y += Math.max(400, innerHeight * 0.7); } window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 350)); })()`,
    awaitPromise: true,
  }, 45000);
}

function slug(path) {
  return path === '/' ? 'home' : path.replace(/\.html$/, '').replace(/^\/|\/$/g, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'page';
}

async function inspectPage(cdp, origin, path, outDir, first) {
  const requests = new Map();
  const net = { failed: [], consoleErrors: [], trackers: new Set(), mainHeaders: {}, mainStatus: 0, bytes: 0 };
  const listener = (m) => {
    const p = m.params || {};
    if (m.method === 'Network.requestWillBeSent') {
      requests.set(p.requestId, p.request.url);
      if (TRACKERS.test(p.request.url)) net.trackers.add(new URL(p.request.url).hostname);
    } else if (m.method === 'Network.responseReceived') {
      if (p.type === 'Document' && !net.mainStatus) { net.mainStatus = p.response.status; net.mainHeaders = p.response.headers; }
      if (p.response.status >= 400 && !/favicon/.test(p.response.url)) net.failed.push(`${p.response.status} ${p.response.url}`);
    } else if (m.method === 'Network.loadingFinished') {
      net.bytes += p.encodedDataLength || 0;
    } else if (m.method === 'Runtime.exceptionThrown') {
      net.consoleErrors.push((p.exceptionDetails.exception?.description || p.exceptionDetails.text || '').split('\n')[0]);
    } else if (m.method === 'Runtime.consoleAPICalled' && p.type === 'error') {
      net.consoleErrors.push(p.args.map((a) => a.value ?? a.description ?? '').join(' ').slice(0, 200));
    }
  };
  cdp.on(listener);

  const results = {};
  let cookies = [];
  for (const vp of VIEWPORTS) {
    await cdp.send('Emulation.setDeviceMetricsOverride', { width: vp.width, height: vp.height, deviceScaleFactor: vp.scale, mobile: vp.mobile });
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (first && vp.key === 'desktop') await cdp.send('Network.clearBrowserCookies');
    const nav = await waitForLoad(cdp, () => cdp.send('Page.navigate', { url: origin + path }));
    if (nav.errorText) throw new Error(`${origin + path} wouldn't open (${nav.errorText}). Check the address.`);
    if (vp.key === 'desktop') cookies = (await cdp.send('Network.getAllCookies')).cookies.map((c) => c.name);
    await scrollThrough(cdp);
    const res = await cdp.send('Runtime.evaluate', { expression: PAGE_AUDIT, returnByValue: true }, 45000);
    if (res.exceptionDetails) throw new Error(`The page inspection failed on ${path}: ${res.exceptionDetails.exception?.description || res.exceptionDetails.text}`);
    results[vp.key] = res.result.value;
    const metrics = await cdp.send('Page.getLayoutMetrics');
    const size = metrics.cssContentSize;
    const height = Math.min(Math.ceil(size.height), MAX_SHOT_HEIGHT);
    const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y: 0, width: vp.width, height, scale: 1 } }, 60000);
    writeFileSync(join(outDir, `${slug(path)}-${vp.key}.png`), Buffer.from(shot.data, 'base64'));
    mkdirSync(join(outDir, 'slices'), { recursive: true });
    for (let y = 0, n = 1; y < height && n <= MAX_SLICES; y += vp.height, n++) {
      const slice = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true, clip: { x: 0, y, width: vp.width, height: Math.min(vp.height, height - y), scale: 1 } }, 60000);
      writeFileSync(join(outDir, 'slices', `${slug(path)}-${vp.key}-${String(n).padStart(2, '0')}.png`), Buffer.from(slice.data, 'base64'));
    }
  }
  cdp.listeners = cdp.listeners.filter((l) => l !== listener);
  return { path, results, net: { ...net, trackers: [...net.trackers], failed: [...new Set(net.failed)], consoleErrors: [...new Set(net.consoleErrors)] }, cookies };
}

class Findings {
  constructor(allow) { this.allow = new Set(allow); this.items = []; }
  add(level, code, page, message, detail = []) { this.items.push({ level, code, page, message, detail }); }
  tell(code, page, message, detail = []) { this.add(this.allow.has(code) ? 'accepted' : 'fail', code, page, message, detail); }
  count(level) { return this.items.filter((i) => i.level === level).length; }
}

function secretIn(text) {
  if (/(sk_live_|sk_test_|sk-ant-|rk_live_|re_[A-Za-z0-9]{20,})/.test(text)) return true;
  for (const m of text.matchAll(/eyJ[\w-]{8,}\.(eyJ[\w-]{8,})\.[\w-]{8,}/g)) {
    try {
      if (Buffer.from(m[1], 'base64url').toString().includes('service_role')) return true;
    } catch { /* not a token */ }
  }
  return false;
}

async function scanScripts(page, forbid, f, seen) {
  for (const url of page.results.desktop.scripts) {
    if (seen.has(url) || new URL(url).origin !== page.origin) continue;
    seen.add(url);
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) }).catch(() => null);
    if (!res || !res.ok) continue;
    const text = (await res.text().catch(() => '')).slice(0, 5_000_000);
    if (secretIn(text)) f.add('fail', 'secret-key', page.path, 'Something that looks like a SECRET key is in a script the browser downloads. Revoke it and move it server-side.', [url]);
    const leaked = forbid.filter((word) => text.toLowerCase().includes(word.toLowerCase()));
    if (leaked.length) f.add('fail', 'forbidden-word', page.path, 'A word that must never appear is in a script the browser downloads.', [...leaked, url]);
  }
}

function judgePage(p, stage, f, forbid) {
  const d = p.results.desktop, m = p.results.phone, page = p.path;
  const list = (a) => a && a.length > 0;

  const leaked = forbid.filter((word) => d.source.toLowerCase().includes(word.toLowerCase()));
  if (leaked.length) f.add('fail', 'forbidden-word', page, 'A word the owner said must never appear is in this page.', leaked);

  if (p.net.mainStatus >= 400) f.add('fail', 'http', page, `The page answered with an error (${p.net.mainStatus}).`);
  if (d.overflow.by > 1) f.add('fail', 'overflow', page, `Sideways scrolling on desktop: ${d.overflow.by}px too wide.`, d.overflow.offenders);
  if (m.overflow.by > 1) f.add('fail', 'overflow', page, `Sideways scrolling on a phone: ${m.overflow.by}px too wide.`, m.overflow.offenders);
  for (const [where, r] of [['desktop', d], ['a phone', m]]) {
    if (list(r.cutOff)) f.add('fail', 'cut-off-text', page, `Text runs off the edge of the screen on ${where}.`, r.cutOff);
    if (list(r.hiddenShowing)) f.add('fail', 'hidden-showing', page, `Something meant to be hidden is showing on ${where}. Usually a CSS display rule overriding the hidden attribute.`, r.hiddenShowing);
  }
  if (list(d.overPicture) || list(m.overPicture)) f.add('warn', 'text-over-picture', page, 'Text sits on a picture, so its contrast cannot be measured. Check it in the screenshots.', [...new Set([...d.overPicture, ...m.overPicture])].slice(0, 6));
  if (list(p.net.consoleErrors)) f.add('fail', 'console', page, 'The browser reported errors on this page.', p.net.consoleErrors.slice(0, 6));
  if (list(p.net.failed)) f.add('fail', 'missing-files', page, 'Files the page asked for failed to load.', p.net.failed.slice(0, 8));

  if (!d.meta.lang) f.add('fail', 'lang', page, 'The page does not declare its language (<html lang="en-GB">).');
  if (!d.meta.title) f.add('fail', 'title', page, 'The page has no title.');
  if (!d.meta.viewport) f.add('fail', 'viewport', page, 'No mobile viewport tag, so phones will show a shrunken desktop page.');
  if (d.meta.h1 !== 1) f.add('warn', 'h1', page, `Expected one main heading (h1); found ${d.meta.h1}.`);
  if (list(d.images.noAlt)) f.add('fail', 'alt', page, 'Images with no alt text.', d.images.noAlt);
  if (list(d.images.broken)) f.add('fail', 'broken-image', page, 'Broken images.', d.images.broken);
  if (list(d.images.oversized)) f.add('warn', 'image-size', page, 'Images far larger than they are displayed, which slows the page.', d.images.oversized);
  if (list(d.unlabelled)) f.add('fail', 'form-label', page, 'Form fields with no label.', d.unlabelled);
  if (list(d.unnamed)) f.add('fail', 'no-name', page, 'Links or buttons a screen reader cannot name.', d.unnamed);
  if (list(d.deadLinks)) f.add(stage === 'live' ? 'fail' : 'warn', 'dead-link', page, 'Links that go nowhere (href="#").', d.deadLinks);
  if (list(m.tiny)) f.add('fail', 'tap-target', page, 'Controls under 24px on a phone (below the WCAG 2.2 AA minimum).', m.tiny);
  if (list(m.small)) f.add('warn', 'tap-target', page, 'Controls under the comfortable 44px on a phone.', m.small);
  if (list(d.lowContrast)) f.add('fail', 'contrast', page, 'Text with too little contrast against its background.', d.lowContrast);
  if (d.motionNoReduce) f.add('warn', 'reduced-motion', page, 'The page animates but ignores the visitor\'s "reduce motion" setting.');

  const tells = { ...d, pillCount: Math.max(d.pillCount, m.pillCount) };
  if (list(tells.reflexFonts)) f.tell('reflex-font', page, `Reflex fonts that make sites look AI-made: ${tells.reflexFonts.join(', ')}.`);
  if (tells.pillCount >= 2) f.tell('pills', page, `Oval pill shapes (${tells.pillCount} on this page).`, tells.pills);
  if (list(tells.gradientText)) f.tell('gradient-text', page, 'Gradient-filled text.', tells.gradientText);
  if (list(tells.purpleGradient)) f.tell('purple-gradient', page, 'Purple or indigo gradient backgrounds.', tells.purpleGradient);
  if (list(tells.stripes)) f.tell('side-stripe', page, 'Coloured side-stripe borders.', tells.stripes);
  if (list(tells.glass)) f.tell('glass', page, 'Frosted-glass panels.', tells.glass);
  if (list(tells.glassBar)) f.add(f.allow.has('glass') ? 'accepted' : 'warn', 'glass', page, 'A frosted-glass navigation bar. Common, and the mildest version of this tell.', tells.glassBar);
  if (list(tells.italicAccent)) f.tell('italic-accent', page, 'Italic accent words inside headlines.', tells.italicAccent);
  if (list(tells.circleTicks)) f.tell('circle-tick', page, 'Circle-tick icons.', tells.circleTicks);
  if (list(tells.hoverLift)) f.tell('hover-lift', page, 'Cards that lift on hover.', tells.hoverLift);
  if (list(tells.iconGrids)) f.tell('icon-grid', page, 'Identical icon, heading and text card grids.', tells.iconGrids);
  if (tells.eyebrows.total >= 3 && tells.eyebrows.withLabel / tells.eyebrows.total >= 0.6) f.tell('eyebrow-formula', page, `${tells.eyebrows.withLabel} of ${tells.eyebrows.total} sections open with the same small-caps label over a heading.`);
  if (tells.numberedSteps >= 3) f.add(f.allow.has('numbered-steps') ? 'accepted' : 'warn', 'numbered-steps', page, 'A 01, 02, 03 numbered pattern. Fine once; a tell if it is the default rhythm.');
  if (d.text.emDashes > 0) f.add(f.allow.has('em-dash') ? 'accepted' : 'warn', 'em-dash', page, `${d.text.emDashes} em dashes in the copy.`);
  if (d.text.emoji > 0) f.add(f.allow.has('emoji') ? 'accepted' : 'warn', 'emoji', page, `${d.text.emoji} emoji in the copy.`);
  if (list(d.text.sloppy)) f.add(f.allow.has('stock-words') ? 'accepted' : 'warn', 'stock-words', page, `Stock AI copy words: ${d.text.sloppy.join(', ')}.`);
  if (secretIn(d.source)) f.add('fail', 'secret-key', page, 'Something that looks like a SECRET key is visible in the page source. Revoke it and move it server-side.');
  if (list(d.cardFields)) f.add('fail', 'card-field', page, "A field that could capture a real card number. Card details must only ever be typed into the payment provider's own page.", d.cardFields);

  if (stage === 'preview' || stage === 'live') {
    const hdr = Object.fromEntries(Object.entries(p.net.mainHeaders).map(([k, v]) => [k.toLowerCase(), v]));
    const noindex = /noindex/i.test(d.meta.robots) || /noindex/i.test(hdr['x-robots-tag'] || '');
    if (stage === 'preview') {
      if (!noindex) f.add('fail', 'noindex', page, 'A preview must be hidden from search engines (noindex is missing).');
      if (!d.meta.ribbon) f.add('fail', 'ribbon', page, 'A preview must carry the visible preview ribbon (data-preview-ribbon).');
      if (d.keys.live) f.add('fail', 'live-key', page, 'A live payment key is on a preview page. Previews only ever use mock payments.');
      if (list(p.net.trackers)) f.add('warn', 'trackers', page, 'A preview is calling tracking services.', p.net.trackers);
    } else {
      if (noindex) f.add('fail', 'noindex', page, 'This page is still hidden from search engines (noindex).');
      if (d.meta.ribbon) f.add('fail', 'ribbon', page, 'The preview ribbon is still on the live site.');
      if (!d.meta.description) f.add('fail', 'description', page, 'No meta description.');
      if (!d.meta.canonical) f.add('warn', 'canonical', page, 'No canonical address set.');
      if (!d.meta.ogTitle || !d.meta.ogImage) f.add('warn', 'share-card', page, 'No social share card (og:title and og:image).');
      if (!d.meta.favicon) f.add('warn', 'favicon', page, 'No favicon.');
      if (!d.text.privacy) f.add('fail', 'privacy-link', page, 'No link to a privacy notice.');
      if (list(d.text.placeholders)) f.add('fail', 'placeholder', page, 'Placeholder text is still on the page.', d.text.placeholders);
      if (list(d.previewLeft)) f.add('fail', 'preview-left', page, 'Preview stand-ins are still in this page, so something may look like it works and do nothing.', d.previewLeft);
      if (d.text.testCard) f.add('fail', 'test-card', page, 'A test card number is on the page.');
      if (d.keys.test) f.add('fail', 'test-key', page, 'A test payment key is in the page source.');
      if (d.keys.tailwindCdn) f.add('warn', 'tailwind-cdn', page, 'The page uses the Tailwind CDN, which is not meant for production.');
      if (p.cookies.some((c) => TRACKING_COOKIES.test(c))) f.add('fail', 'cookies-before-consent', page, 'Tracking cookies are set before the visitor has agreed.', p.cookies.filter((c) => TRACKING_COOKIES.test(c)));
      if (list(p.net.trackers)) f.add('warn', 'trackers', page, 'Tracking services load before any interaction. Fine only if they run cookieless until consent.', p.net.trackers);
      const secure = [['strict-transport-security', 'fail', 'HSTS'], ['x-content-type-options', 'warn', 'X-Content-Type-Options'], ['referrer-policy', 'warn', 'Referrer-Policy'], ['content-security-policy', 'warn', 'Content-Security-Policy']];
      if (/^https:/.test(p.origin || '')) {
        for (const [h, level, label] of secure) if (!hdr[h]) f.add(level, 'security-header', page, `Security header missing: ${label}.`);
        if (!hdr['x-frame-options'] && !/frame-ancestors/.test(hdr['content-security-policy'] || '')) f.add('warn', 'security-header', page, 'Nothing stops other sites framing this page (X-Frame-Options or frame-ancestors).');
      }
      if (m.vitals.lcp > 2500) f.add('warn', 'lcp', page, `Main content appeared in ${(m.vitals.lcp / 1000).toFixed(1)}s (target under 2.5s). Lab figure, not real visitors.`);
      if (m.vitals.cls > 0.1) f.add('warn', 'cls', page, `Layout jumped while loading (CLS ${m.vitals.cls.toFixed(2)}, target under 0.1).`);
      if (p.net.bytes > 3_000_000) f.add('warn', 'page-weight', page, `About ${(p.net.bytes / 2_000_000).toFixed(1)} MB downloaded per page load.`);
    }
  }
}

async function judgeDomain(origin, f) {
  const url = new URL(origin);
  const site = '(whole site)';
  for (const [file, label] of [['/robots.txt', 'robots.txt'], ['/sitemap.xml', 'sitemap.xml']]) {
    const r = await fetch(origin + file).catch(() => null);
    if (!r || !r.ok) f.add('fail', 'seo-file', site, `${label} is missing.`);
    else if (file === '/robots.txt' && /^\s*disallow:\s*\/\s*$/im.test(await r.text())) f.add('fail', 'seo-file', site, 'robots.txt is blocking the whole site.');
  }
  if (url.protocol !== 'https:' || /\.vercel\.app$|\.pages\.dev$|\.workers\.dev$|\.netlify\.app$|^localhost$|^127\./.test(url.hostname)) {
    f.add('warn', 'domain', site, 'Not on a real domain yet, so DNS and email records were not checked.');
    return;
  }
  const apex = url.hostname.replace(/^www\./, '');
  const http = await fetch(`http://${url.hostname}/`, { redirect: 'manual' }).catch(() => null);
  if (!http || !(http.status >= 300 && http.status < 400 && /^https:/.test(http.headers.get('location') || ''))) f.add('fail', 'https-redirect', site, 'The plain http address does not redirect to https.');
  const other = url.hostname.startsWith('www.') ? apex : `www.${apex}`;
  const alt = await fetch(`https://${other}/`, { redirect: 'manual' }).catch(() => null);
  if (!alt) f.add('fail', 'www', site, `${other} doesn't answer. Both the www and non-www addresses should work.`);
  else if (!(alt.status >= 300 && alt.status < 400)) f.add('warn', 'www', site, `${other} serves the site separately instead of redirecting to the main address.`);
  const txt = (await dns.resolveTxt(apex).catch(() => [])).map((r) => r.join(''));
  const mx = await dns.resolveMx(apex).catch(() => []);
  const dmarc = (await dns.resolveTxt(`_dmarc.${apex}`).catch(() => [])).map((r) => r.join(''));
  const spf = txt.filter((t) => /^v=spf1/i.test(t));
  if (mx.length === 0) f.add('warn', 'email-dns', site, 'No MX record, so the domain cannot receive email.');
  const noMail = mx.length === 0;
  if (spf.length === 0) f.add(noMail ? 'warn' : 'fail', 'email-dns', site, noMail ? 'No SPF record. Confirm nothing sends mail as this domain before deciding what to publish.' : 'No SPF record, so email from this domain is likely to land in spam.');
  if (spf.length > 1) f.add('fail', 'email-dns', site, 'More than one SPF record, which makes SPF fail. Merge them into one.');
  if (dmarc.filter((t) => /^v=DMARC1/i.test(t)).length === 0) f.add(noMail ? 'warn' : 'fail', 'email-dns', site, 'No DMARC record.');
}

function plainReport(meta, f, pages) {
  const order = ['fail', 'warn', 'accepted'];
  const heading = { fail: 'Must fix', warn: 'Worth fixing', accepted: 'Knowingly kept (owner-approved)' };
  const lines = [`# Site check: ${meta.target}`, '', `Stage: **${meta.stage}**. Pages checked: ${pages.map((p) => p.path).join(', ')}.`, '', `Result: **${f.count('fail')} must fix, ${f.count('warn')} worth fixing, ${f.count('accepted')} knowingly kept.**`, ''];
  for (const level of order) {
    const items = f.items.filter((i) => i.level === level);
    if (!items.length) continue;
    lines.push(`## ${heading[level]}`, '');
    for (const i of items) {
      lines.push(`- **${i.page}** [${i.code}] ${i.message}`);
      i.detail.forEach((x) => lines.push(`  - ${String(x).length > 160 ? `${String(x).slice(0, 160)}...` : x}`));
    }
    lines.push('');
  }
  const fonts = Object.entries(pages[0].results.desktop.fonts).sort((a, b) => b[1] - a[1]).map(([n]) => n);
  lines.push('## Fonts in use', '', fonts.join(', ') || 'none detected', '', '## Screenshots', '');
  pages.forEach((p) => VIEWPORTS.forEach((v) => lines.push(`- ${slug(p.path)}-${v.key}.png`)));
  lines.push('', 'The slices folder has the same pages one screen at a time. Use those for looking closely, because very tall images get shrunk until they are unreadable.', '', 'This checker catches faults a machine can see, and it does not press buttons. Look at the screenshots and try the one action by hand: a clean report cannot tell you whether the page is any good.', '');
  return lines.join('\n');
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || !opts.target) {
    const src = readFileSync(new URL(import.meta.url), 'utf8');
    console.log(src.slice(src.indexOf('/*') + 2, src.indexOf('*/')).replace(/^ \* ?/gm, ''));
    process.exit(opts.help ? 0 : 2);
  }
  if (Number(process.versions.node.split('.')[0]) < 22) die(`This needs Node 22 or newer; you have ${process.version}. Install the current LTS from nodejs.org.`);
  if (!['mockup', 'preview', 'live'].includes(opts.stage)) die('--stage must be mockup, preview or live.');
  const browserPath = findBrowser(opts.chrome);
  if (!browserPath) die("I can't find Chrome, Edge or Chromium. Install Chrome, or pass its location with --chrome.");

  let origin, firstPath = '/', server = null;
  if (/^https?:\/\//i.test(opts.target)) {
    const u = new URL(opts.target);
    origin = u.origin;
    firstPath = u.pathname || '/';
  } else {
    const local = resolve(opts.target);
    if (!existsSync(local)) die(`I can't find ${local}.`);
    const isFile = statSync(local).isFile();
    server = await serveFolder(isFile ? dirname(local) : local);
    origin = `http://127.0.0.1:${server.address().port}`;
    firstPath = isFile ? `/${basename(local)}` : '/';
  }

  const outDir = resolve(opts.out || join('qa', `site-check-${opts.stage}`));
  mkdirSync(outDir, { recursive: true });

  const browser = await launchBrowser(browserPath);
  const { cdp } = browser;
  const findings = new Findings(opts.allow);
  const pages = [];
  try {
    await Promise.all([cdp.send('Page.enable'), cdp.send('Runtime.enable'), cdp.send('Network.enable')]);
    await cdp.send('Page.addScriptToEvaluateOnNewDocument', { source: VITALS_SEED });
    cdp.on((m) => {
      if (m.method === 'Page.javascriptDialogOpening') cdp.send('Page.handleJavaScriptDialog', { accept: false }).catch(() => {});
    });
    await cdp.send('Browser.setDownloadBehavior', { behavior: 'deny' }).catch(() => {});
    const scanned = new Set();
    const queue = opts.pages ? [...opts.pages] : [firstPath];
    const done = new Set();
    while (queue.length && pages.length < MAX_PAGES) {
      const path = queue.shift();
      const key = path.replace(/\/$/, '').replace(/\.html$/, '').replace(/\/index$/, '') || '/';
      if (done.has(key)) continue;
      done.add(key);
      console.log(`Checking ${path} ...`);
      let page;
      try {
        page = await inspectPage(cdp, origin, path, outDir, pages.length === 0);
      } catch (err) {
        findings.add('fail', 'page-open', path, `This page couldn't be inspected: ${err.message}`);
        continue;
      }
      page.origin = origin;
      pages.push(page);
      judgePage(page, opts.stage, findings, opts.forbid);
      await scanScripts(page, opts.forbid, findings, scanned);
      if (!opts.pages) {
        for (const l of page.results.desktop.links) if (/(\/|\/[^./]*|\.html?)$/i.test(l)) queue.push(l);
      }
    }
    if (queue.some((path) => !done.has(path.replace(/\/$/, '').replace(/\.html$/, '').replace(/\/index$/, '') || '/'))) findings.add('warn', 'page-cap', '(whole site)', `Only the first ${MAX_PAGES} pages were checked. Use --pages to choose others.`);
    if (!pages.length) throw new Error(`I couldn't open any page. ${findings.items.map((i) => i.message).join(' ')}`);
    if (opts.stage === 'live') await judgeDomain(origin, findings);
  } finally {
    await browser.close();
    if (server) server.close();
  }

  const report = plainReport({ target: opts.target, stage: opts.stage }, findings, pages);
  writeFileSync(join(outDir, 'site-check.md'), report);
  writeFileSync(join(outDir, 'site-check.json'), JSON.stringify({ stage: opts.stage, target: opts.target, findings: findings.items }, null, 2));
  console.log(`\n${findings.count('fail')} must fix, ${findings.count('warn')} worth fixing, ${findings.count('accepted')} knowingly kept.`);
  console.log(`Report and screenshots: ${outDir}`);
  process.exit(findings.count('fail') > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(`The check couldn't finish: ${err.message}`);
  process.exit(2);
});
