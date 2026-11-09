# Website Studio skill: research pack (9 November 2026)

Scope: evidence for a shareable Claude Code skill taking a UK small business or sole trader from "I need a website" to a live site (discovery, mock-ups, scoping, preview, go-live). Gathered 9 Nov 2026 from vendor pages, official docs, legislation and practitioner writing. Confidence labels: high = primary source read this session; medium = primary source not opened, or secondary sources agree; low = single or conflicting secondary source. "Opinion" marks practitioner views. Vendor prices change often, so the skill should re-read pricing pages at build time rather than trust this file.

Not covered or failed: Reddit blocked the tool's IP (403), so section A has no Reddit evidence. Several vendor pages carry no "as of" date; where so, the as-of date is the fetch date (9 Nov 2026). Nothing here is legal advice.

---

## A. AI-driven design practice

**A1. The named tells of AI-made sites are consistent across sources.** Purple or indigo gradients (the most cited), Inter or system-default type, a centred hero over three identical rounded cards, gradient text, emoji or icon cards, buzzword headlines and invented stats ("10,000% ROI"). Opinion, from design blogs and Substacks (Charlie Hills, Nelson Lee, Joe Apfelbaum, Kyle Chayka, all 2026). Confidence: medium (many sources, all opinion).
- https://www.925studios.co/blog/ai-slop-design-tells
- https://prg.sh/ramblings/Why-Your-AI-Keeps-Building-the-Same-Purple-Gradient-Website
- https://charliehills.substack.com/p/30-things-that-stop-your-site-looking
- https://kylechayka.substack.com/p/the-generic-style-of-ai-web-design (argues Claude Design output is itself homogenised)

**A2. The defaults are moving, so a fixed ban list ages.** A Reddit-derived ranking quoted by a secondary source names a warm "tasteful default" (cream, serif, sage) as the 2026 tell, and one source warns every anti-slop effort risks swapping one default for another. Opinion. Confidence: low-medium. Source: https://capitalandcompute.net/blog/fix-ai-slop-design/

**A3. DESIGN.md is the closest thing to a standard, and it is alpha.** Google Labs' spec: Markdown with YAML design tokens first, prose rationale second; sections in fixed order (Overview, Colors, Typography, Layout, Elevation, Shapes, Components, Do's and Don'ts); Apache-2.0; "version alpha", spec and CLI still changing. CLI: `lint` (structure, broken references, WCAG contrast), `diff`, `export` (tailwind, dtcg), `spec`. Secondary sources date the open-sourcing to 21 Apr 2026, alongside Stitch's 18 Mar 2026 update. Confidence: high on content (repo read), medium on dates.
- https://github.com/google-labs-code/design.md (no release date on page)
- https://the-decoder.com/googles-open-source-design-md-gives-ai-agents-a-prompt-ready-blueprint-for-brand-consistent-design/

**A4. PRODUCT.md plus DESIGN.md is a workable pair.** Impeccable (Paul Bakaus) builds PRODUCT.md through a structured "teach" interview (surface type, audience, personality, references and anti-references, principles), then a Design Brief with OKLCH colours, type and sections; 23 commands, 37 named anti-patterns, "visual probes" to explore directions before committing. Article updated 4 May 2026. Confidence: medium (one write-up; it does not mention DESIGN.md, so the pairing is our inference).
- https://betterstack.com/community/guides/ai/ai-development/impeccable-ai/

**A5. Anthropic ships a `frontend-design` skill and a hosted Claude Design.** The skill (anthropics/skills repo) steers away from Arial, Inter, Roboto and system fonts and from purple gradients, and says to commit to an aesthetic direction before coding; known via mirrors only, SKILL.md not read. Claude Design launched 17 Apr 2026 as an Anthropic Labs research preview (Pro, Max, Team, Enterprise): it reads a codebase and design files to build a design system and produces a handoff bundle for Claude Code. Confidence: medium.
- https://www.anthropic.com/news/claude-design-anthropic-labs
- https://thenewstack.io/anthropic-claude-design-launch/

**A6. Brand-kit and reference capture matter most; no published standard for it.** Stitch is reported to extract a design system from a URL (secondary, details conflict). Practitioners say real brand inputs and chosen fonts change output more than adjectives in a prompt. Opinion. Confidence: low-medium.

**A7. Several divergent directions first is common vendor practice, but no source shows it beats iterating one, and none gives an ideal number.** Kombai has a configurable variant count, StyleForge generates 4 concepts, Superdesign shows variants side by side. Nobody prescribes three. Confidence: low. Choosing three is our inference (enough contrast, few enough for a non-technical owner to decide).
- https://www.mindstudio.ai/blog/avoid-vibecoded-landing-pages
- https://docs.kombai.com/design/overview
- https://thepromptindex.com/styleforge/

**A8. Screenshot-and-verify loops are standard: build, open in a real browser, screenshot, judge, fix.** Playwright MCP is the common route. One write-up found a mobile overflow bug only appeared once device emulation was enabled, not when the window was merely resized; others advise checking console errors and the exact component state, and running the check on a stable build, not every edit. Mostly vendor blogs. Confidence: medium-low.
- https://qaskills.sh/blog/claude-code-screenshot-frontend-verification-mcp
- https://argos-ci.com/blog/playwright-mcp-visual-testing

**A9. Tool landscape (2026 comparisons, mostly vendor-adjacent).** Three lanes: prompt-to-app builders (Lovable, Bolt, v0), design tools (Stitch, Figma Make, Claude Design), coding agents (Claude Code, Cursor). Stitch generates no backend or deployable app; v0 is strongest for React or Next.js on Vercel; Lovable pairs with Supabase but gives less architectural control; Bolt output is "quick and dirty" and usually rebuilt. Consistent advice: prototype in a builder, move serious work to an agent, and have generated auth, payments and data access reviewed. Stitch free quotas conflict across sources. Confidence: medium on lanes, low on quotas.
- https://www.nxcode.io/resources/news/vibe-design-tools-compared-stitch-v0-lovable-2026
- https://mcp.directory/blog/claude-design-vs-stitch-vs-v0-vs-lovable-vs-figma-make-2026
- A coding agent wins when the client must own the repo and domain, or needs custom logic, payments, accessibility checks or a look the builders would homogenise. Inference.

### What the skill should do (A)
1. Create PRODUCT.md (audience, personality, references, anti-references) and DESIGN.md (tokens plus rules, Google section order) before any mock-up. Mark DESIGN.md as alpha and lint it if the CLI is available.
2. Run a brand-input step first: logo, colours, fonts, three admired sites, one disliked site. Never pick fonts or palette by reflex.
3. Produce three clearly different mock-up directions as self-contained HTML files, each checked at desktop and mobile widths, labelled A, B, C. The owner picks one and gets one round of mixing. Say plainly that three is a design choice, not a researched number.
4. Keep an explicit slop checklist (A1) and a default-swap check (A2): if the output is cream, serif and sage with no brand reason, reject it.
5. After every build, load the page in a real browser at about 1280 px and 390 px using device emulation, screenshot both, read console errors, fix, repeat. Keep the screenshots for the owner.
6. Route by need: brochure sites in the agent directly; be honest that a builder or Squarespace-style tool suits owners who want to edit everything themselves.

---

## B. Discovery

**B1. Agencies send a short intake first, a longer questionnaire only after commitment.** Sources suggest 10 to 15 questions before the first conversation, the fuller questionnaire once both sides agree. Confidence: medium (agency and template blogs, undated).
- https://www.threesevenmarketing.com/blog/website-discovery-questions/
- https://playcode.io/blog/website-design-questionnaire
- https://paperform.co/templates/web-design-client-discovery-questionnaire/

**B2. Recurring questions that change the build:** primary goal or outcome, audience, whether the client sells online. Competitors and likes and dislikes were not explicitly confirmed by this pass's sources, though they are standard practice (inference). Confidence: medium on goal and audience, low on the rest.

**B3. Content readiness is the commonest stall.** One source says projects stall on late content more than on design or code and advises surfacing content dependencies in discovery. Confidence: medium (single source, plausible). https://boldist.co/web-design/website-redesign-questions/

**B4. A questionnaire is not a scope.** One template logs unknowns, conflicts and evidence per answer and says answers are not an approved plan. Confidence: low (single source); it supports the staged design.

### What the skill should do (B)
1. Ask about 12 plain-English questions at most, in this order: what the business does and for whom; the one thing a visitor should do (call, book, buy, enquire); what proof exists (reviews, photos, awards, numbers); what content exists and who will supply the rest; competitors and three sites admired or disliked; existing logo, colours, fonts, domain and email; whether they sell, book or need logins; launch date and who approves.
2. Accept pasted text, URLs and photos instead of forms. Treat "I don't know" as valid and log it as an open item.
3. Record in one brief file the facts later stages need: sole trader or limited company (number, address), whether personal data is collected, whether goods are sold to consumers, whether EU customers are served (these drive section E).
4. End with a one-page read-back the owner approves. No mock-ups until the primary action and the content owner are named.

---

## C. Functionality stack (vendor pages fetched 9 Nov 2026 unless stated; USD unless stated)

**Forms and email**
- Web3Forms: Free forever, 250 submissions a month, unlimited forms and domains; Pro $12 a month ($149 yearly) with 10,000 submissions, file upload, autoresponders. The page returned 403 to the plain fetch and was read via Firecrawl; commercial-use terms not checked. Confidence: medium. https://web3forms.com/pricing
- Formspree: Free 50 submissions a month, 30-day archive, labelled "testing and development"; Personal $15, Professional $30, Business $90 on monthly billing. Confidence: high. https://formspree.io/plans
- Resend: Free 3,000 emails a month with a 100 a day cap and 3 domains; Pro $20 for 50,000. Confidence: high. https://resend.com/pricing
- Postmark: Free 100 emails a month; paid from $15 for 10,000 (no tier between). Confidence: high. https://postmarkapp.com/pricing

**Database**
- Supabase: Free 2 active projects, 500 MB database, 1 GB storage, 5 GB egress, 50,000 monthly active users; free projects pause after 1 week of inactivity (a real risk for a live client site); Pro from $25 a month, spend cap on by default. Confidence: high. https://supabase.com/pricing
- Neon: Free $0, 100 projects, 100 compute-hours per project a month, 1 GB per project, scales to zero after 5 minutes. The page now brands Neon as from Databricks; pricing impact not stated. Confidence: high on limits, low on ownership effects. https://neon.com/pricing
- Turso: Free 100 databases, 5 GB, 500M rows read, 10M written; Developer $4.99 a month. Confidence: high. https://turso.tech/pricing
- Convex: Free and Starter described as "for personal projects and prototypes"; Pro $25 per developer a month; no custom domains or daily backups on free. Commercial-use terms not stated on the page. Confidence: medium. https://www.convex.dev/pricing

**Login (flag: ownership changes)**
- Clerk: free Hobby up to 50,000 monthly retained users per app; Pro $25 a month ($20 annual). Confidence: high. https://clerk.com/pricing
- Better Auth was acquired by Vercel, announced 7 Jul 2026, price undisclosed; Vercel's CEO says it stays MIT-licensed. Confidence: medium (Vercel blog is primary but seen via search summary only). https://vercel.com/blog/vercel-acquires-better-auth
- Auth.js (NextAuth) moved under Better Auth stewardship in Sept or Oct 2025 (sources differ on the date); security fixes continue (four advisories closed per Better Auth's July 2026 update); authjs.dev says only the latest version gets security updates; third-party vendors call it maintenance mode and steer new projects elsewhere. Treat Auth.js as legacy for new builds. Confidence: medium. https://better-auth.com/blog/authjs-joins-better-auth and https://authjs.dev/security
- Supabase Auth is bundled with Supabase (above); not separately checked for deprecations.

**Payments**
- Stripe UK standard cards: 1.5% + 20p domestic, premium UK cards 2.8% + 20p, EEA 2.5% + 20p, international 3.15% + 20p (plus 2% where currency conversion applies). Payment Links and Checkout carry no extra per-transaction fee; custom domain on Payment Links $10 a month. No as-of date on the page (footer 2026). Confidence: high on figures. https://stripe.com/gb/pricing
- PCI: Stripe says low-risk integrations that send card data straight to Stripe reduce your obligations, and a business still attests annually. The label "SAQ A" was not on the page fetched; it is the usual form for hosted Checkout and Payment Links (inference, not verified here). https://docs.stripe.com/security/guide
- Strong Customer Authentication: not verified from a primary source this session (Stripe's guide mentions 3D Secure redirects only in CSP notes). Confidence: low.
- Shopify UK (a footnote on the page says accurate "as of 5 November 2026"): Basic £19 a month yearly or £25 monthly, online card 2% + 25p; Grow £49 or £65, 1.7% + 25p; Advanced £259 or £344, 1.5% + 25p; intro offer £1 a month for 3 months. Confidence: high. https://www.shopify.com/uk/pricing

**Bookings**
- Cal.com: Free for one user, unlimited booking links, Stripe and PayPal payments; Teams $12 per user a month (removes branding). Self-host licence not checked. Confidence: high on the page. https://cal.com/pricing

**Owner-editable content**
- Evidence is comparison blogs, mostly vendor-adjacent. Confidence: low-medium. Pages CMS: lightest and free, browser form editor, GitHub only, no repeater fields. Keystatic: good for Astro or Next.js, needs a server adapter for its admin route. TinaCMS: richest visual editing, paid cloud tiers from about $29 per user a month (one source). Decap: free and established, plainer editor, slower development. Sanity: generous free tier but the studio needs developer setup. Storyblok: visual editor, paid from about $99 a month (sources disagree). https://www.bitdoze.com/best-headless-cms-for-astro/ and https://dupple.com/learn/best-headless-cms

**AI features and calculators**
- Anthropic docs: each tier has a monthly spend cap (Start $500, Build $1,000, Scale $200,000); you can set your own lower limit in Console Billing; at your own limit requests fail with HTTP 400, at the tier cap with 429 and no retry-after. You cannot set spend limits on the default workspace, so create a dedicated workspace per client site and cap that. Confidence: high. https://platform.claude.com/docs/en/api/rate-limits
- Layered defence advice (secondary): per-IP limits at the edge, per-user limits, a global daily cost cap in the app, capped max output tokens and prompt length, keys server-side. Per-IP limits are easy to evade, so the global cap matters most. Confidence: medium-low. https://www.flowhunt.io/blog/llm-api-security-rate-limiting-auth-abuse-prevention/
- Cloudflare Turnstile free plan: 20 widgets, unlimited verifications, 10 hostnames per widget, 7-day analytics; commercial terms not stated. Confidence: high. https://developers.cloudflare.com/turnstile/plans/

### What the skill should do (C)
1. Default to no backend. For a contact form: a form service (Web3Forms or Formspree) at low volume; a server route plus Resend when the owner wants branded replies. Warn that Formspree's free tier is 50 a month and framed as testing.
2. Re-read the vendor pricing page before recommending any service, and record the date in the handoff notes. Quote GBP only where the vendor does (Shopify, Stripe fees).
3. Avoid free database tiers that pause (Supabase free, after a week idle) for live client sites unless the owner accepts it or upgrades.
4. For login on new builds prefer Clerk or Supabase Auth; if using Better Auth, note the Vercel ownership; do not start new projects on Auth.js. Never hand-roll auth.
5. For payments use Stripe Payment Links or hosted Checkout so card data never touches the site; use Shopify for many products or stock. Tell the owner the UK fees. Have a human confirm the PCI and SCA position with Stripe before launch.
6. For owner edits, offer Pages CMS or Keystatic for simple brochure sites and Tina for richer editing; say who pays for any hosted tier.
7. For any AI feature: key in server environment variables only, a dedicated capped workspace, an app-level daily spend cap, per-IP rate limit, Turnstile in front of public forms, capped input and output length, and an off switch. Test by trying to exceed the limits.

---

## D. Preview hosting and go-live

**D1. Vercel Hobby is non-commercial; client work needs Pro.** Fair-use page (updated 14 Sep 2026): Hobby is "restricted to non-commercial personal use only". Commercial use is any deployment used for the financial gain of anyone involved in any part of production, including a paid consultant writing the code; examples include taking payment, advertising a product or service, and "receiving payment to create, update, or host the site". Donations are not commercial. Pro is $20 a month per developer seat with a $20 usage credit; Hobby cannot buy extra usage. Hobby limits: 100 GB fast data transfer, 1M function invocations, 4 hours active CPU, 3 custom firewall rules; Pro 1 TB transfer. Implication: a business's own site advertising its services counts as commercial on this definition, so Hobby is the wrong plan even if the owner pays nothing. Confidence: high. https://vercel.com/docs/limits/fair-use-guidelines and https://vercel.com/pricing

**D2. Deployment protection (docs updated 15 Sep 2026).** Vercel Authentication (Vercel users only) and Standard Protection are on all plans; "All Deployments" protection (including production domains) is on all plans; Password Protection is Pro only at $20 per project a month; Trusted IPs and Passport are Enterprise. Standard Protection covers everything except production domains and restricts the production generated `.vercel.app` URL. Confidence: high. https://vercel.com/docs/deployment-protection
- A shareable preview for an owner without a Vercel account therefore needs Password Protection ($20 a month) or a shareable-link bypass (docs exist; behaviour not verified here).

**D3. Preview URLs carry `X-Robots-Tag: noindex` by default on non-production branches, but noindex is not access control.** The header is omitted if a custom domain is assigned to a non-production branch. Verify with `curl -I`. Confidence: medium-high (Vercel support article via search). https://vercel.com/kb/guide/are-vercel-preview-deployment-indexed-by-search-engines

**D4. Alternatives.** Cloudflare Pages free: 500 builds a month, 100 custom domains, unlimited preview deployments and users, 20,000 files; the docs page states no commercial restriction (an absence of a statement, not a permission). Netlify: credit-based; Free 300 credits, Personal $9 a month, Pro $20 a month; bandwidth costs 20 credits per GB; its pricing page does not state commercial-use terms. Cloudflare's page does not say Pages is deprecated; it points to Workers Static Assets for scale. Confidence: medium. https://developers.cloudflare.com/pages/platform/limits/ and https://www.netlify.com/pricing/

**D5. DNS for Vercel: do not hardcode.** The docs say apex domains use an A record and subdomains a project-specific CNAME (example `d1d4fc829fe7bc7c.vercel-dns-017.com`); the dashboard shows exact values. Vercel's knowledge base (updated 16 Oct 2026) says the A value is `76.76.21.21` for most projects and to remove AAAA records on the apex. Community threads report newer ranges 216.198.79.0/24 and 64.29.17.0/24 and regional reachability problems (Jul and Oct 2026); no official changelog found, so sources partly disagree. Confidence: medium. https://vercel.com/docs/domains/working-with-domains/add-a-domain and https://vercel.com/kb/guide/a-record-and-caa-with-vercel
- The docs warn that changing nameservers means copying MX and TXT email records first, or email stops.

**D6. Registrars.** Cloudflare's docs (last updated 13 Oct 2026) document transfers in of `.uk`, `co.uk`, `org.uk`, `me.uk` (the IPS tag must be set to CLOUDFLARE; 60-day lock after transfer); I could not confirm that new `.co.uk` registrations are offered. Namecheap `.co.uk` is about $9.98 a year on renewal per a third-party aggregator (Sep 2026); some registrars have large renewal jumps. I found no primary guidance on who legally owns a registered domain. Confidence: low-medium. https://developers.cloudflare.com/registrar/top-level-domains/uk-domains/ and https://domainoffer.net/tld/co.uk/namecheap
- Recommendation (inference): the business owner holds the registrar account, with the builder as delegate, so the owner keeps control.

**D7. Email on the domain.** Cloudflare Email Routing is free and receive-and-forward only; sending is a separate beta on Workers Paid. Google Workspace UK: Business Starter £5.90 and Standard £11.80 per user a month, with a 50% introductory price shown for 23 Nov 2026 to 23 Feb 2027 (the page's own wording on the offer is inconsistent). Microsoft 365 Business Basic rose about 16 to 17% on 1 July 2026; UK figures conflict (£5.40 annual ex VAT in one reseller source, £5.50 to £5.75 elsewhere). Confidence: high for Cloudflare and Google, low for Microsoft. https://developers.cloudflare.com/email-routing/ and https://workspace.google.com/pricing and https://www.itbuilder.co.uk/blog/microsoft-365-pricing-update-2026-uk

**D8. Sender rules.** Google: all senders to Gmail need SPF or DKIM, TLS and a spam rate under 0.3%; DMARC, alignment and one-click unsubscribe apply at 5,000 or more messages a day; DMARC recommended for all (page undated; rules date from 1 Feb 2024, so older than 18 months). Microsoft: from 5 May 2025, senders of over 5,000 a day to Outlook.com, Hotmail and Live need SPF, DKIM and DMARC at least p=none; non-compliant mail goes to Junk first and may later be rejected (Microsoft's April 2025 post; one security vendor says rejection began 5 May, so sources disagree). Yahoo not checked. Advice (inference): publish SPF, DKIM and DMARC for any small business domain anyway. https://support.google.com/a/answer/81126 and https://techcommunity.microsoft.com/blog/outlook/strengthening-email-security-outlook-new-requirements-for-high-volume-senders/4399730

**D9. Core Web Vitals (web.dev, last updated 31 Oct 2024; older than 12 months but the current published figures).** LCP 2.5 s or less, INP 200 ms or less, CLS 0.1 or less, at the 75th percentile, mobile and desktop separately. Confidence: high. https://web.dev/articles/vitals

**D10. llms.txt has no demonstrated benefit.** Google's AI features page: no new machine-readable files, AI text files or special markup are needed to appear in AI Overviews or AI Mode, and no "special optimizations"; follow ordinary SEO (crawlability, internal links, page experience, text content). Ahrefs (15 Jun 2026, 137,210 domains, May 2026 data): 28% publish llms.txt, 97% of those files got zero requests, 19.5% of requests came from AI bots, and the sample skews technical (the authors' own caveats). No major AI company was found committing to read it. This supports "no demonstrated benefit", not "proven zero effect". Confidence: high. https://developers.google.com/search/docs/appearance/ai-features and https://ahrefs.com/blog/llmstxt-study/
- Wider GEO and AEO claims are mostly vendor marketing; none verified. A small January 2026 test (10 sites, cited by a secondary source) had mixed results. Confidence: low.

**D11. Not verified this pass:** the security-header list (OWASP's page defers to a repo I did not read), Search Console steps, local-business structured data types, analytics prices (Plausible about $9 a month per aggregators; no primary page read). The skill should check these at build time.

### What the skill should do (D)
1. Tell the owner up front that Vercel Hobby is not allowed for their business site and Pro is $20 a month per seat, or choose Cloudflare Pages or Netlify and re-read their terms. Put it in the scoping cost lines.
2. Previews: use All Deployments protection (Password Protection is $20 a month on Pro). Send `X-Robots-Tag: noindex` and a `robots.txt` Disallow on preview. Check with `curl -I`. Never treat a vercel.app URL as private.
3. Go-live: read DNS records from the project's Domains page or `vercel domains inspect`, never from memory. Before touching nameservers, list existing MX, SPF, DKIM and DMARC records and keep them. Add apex and `www` with a redirect between them.
4. The owner creates and pays for the registrar account; record the renewal date and price in the handoff.
5. Set up SPF, DKIM and DMARC (start at p=none) for any domain that sends mail, and test to a Gmail and an Outlook inbox.
6. Go-live gate: Core Web Vitals (D9) on mobile; HTTPS; sitemap.xml and robots.txt; one canonical host; security headers; one real form submission end to end; Search Console verified and sitemap submitted (check procedure live); no reliance on llms.txt.
7. Do not promise AI-search rankings. If asked, say Google states ordinary SEO is enough and llms.txt shows no demonstrated benefit.

---

## E. UK legal (as of 9 Nov 2026; not legal advice)

**E1. PECR cookie changes are in force since 5 February 2026.** The Data (Use and Access) Act 2025 section 112 amended PECR regulation 6 via SI 2026/82 (Commencement No. 6 Regulations 2026): new consent-free categories for statistical cookies (solely to improve the service, clear information, a simple free opt-out, aggregate non-personal output, any third party acting as processor) and for appearance or preference cookies; emergency-assistance use; the strictly-necessary exception stays. Advertising, cross-site tracking and profiling still need prior consent. The ICO finalised its storage and access technologies guidance on 29 April 2026. Confidence: high on the ICO exception wording (read), medium on SI number and dates (law-firm sources). https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-the-exceptions/ and https://bratby.law/data-use-and-access-act-2025-commencement/
- Whether a given analytics product qualifies is a judgement. Google Analytics, which shares data with Google, probably fails the "aggregate, only to improve your service, processor only" test (our inference, not an ICO statement). Confidence: low.

**E2. PECR fines rose to UK GDPR levels from 5 Feb 2026: up to £17.5 million or 4% of global annual turnover** (previously £500,000). Clifford Chance briefing, secondary; the Act itself not read. One commentary says the threshold for cookie fines also fell. Confidence: medium. https://www.cliffordchance.com/insights/resources/blogs/talking-tech/en/articles/2026/02/key-aspects-of-the-data--use-and-access--act-take-effect.html

**E3. UK GDPR privacy notice contents (ICO).** Always: who you are and contact details; each purpose; lawful basis; retention period; individuals' rights; right to complain to the ICO. If applicable: legitimate interests, recipients, transfers outside the UK (for example US tools), right to withdraw consent, automated decisions. Confidence: high. https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/individual-rights/the-right-to-be-informed/what-privacy-information-should-we-provide/

**E4. ICO data protection fee.** The ICO page confirms sole traders who use personal information must pay unless exempt, but shows no amounts. Secondary sources: since 17 Feb 2025 tier 1 £52, tier 2 £78, tier 3 £3,763, with £5 off by direct debit; no 2026 change found. Exemptions list not retrieved. Confidence: medium. https://www.ico.org.uk/for-organisations/data-protection-fee/ and https://acuitylaw.com/rise-in-ico-fees-data-protection-fees-february/

**E5. Trading disclosures (Business Companion, a Trading Standards service; undated).** Sole traders or partnerships trading under a name other than their own: show full names and a service address, including on the website (Electronic Commerce Regulations 2002). Limited companies: registered name, place of registration, registered number, registered office and that it is limited (Companies Act 2006 and the 2015 company, LLP and business names disclosure regulations). Online sellers: a geographic address, prices and delivery charges (E-Commerce Regulations) and a postal address before purchase (Consumer Contracts Regulations). Changes under the Economic Crime and Corporate Transparency Act 2023 were not verified. Confidence: medium. https://www.businesscompanion.info/node/604/printable/print

**E6. Consumer Contracts Regulations 2013: 14-day cancellation and its exceptions.** Regulation 28(1) excludes goods "made to the consumer's specifications or ... clearly personalised" and goods "liable to deteriorate or expire rapidly"; sealed hygiene goods lose the right once unsealed. No source I found settles how far "liable to deteriorate or expire rapidly" stretches for food that keeps for months. Do not assume the exception applies; get a view from Trading Standards or a lawyer before publishing a "no returns" policy. Confidence: high on the wording (legislation.gov.uk), low on long-life food. https://www.legislation.gov.uk/uksi/2013/3134/regulation/28

**E7. DMCC Act 2024.** The unfair commercial practices provisions (fake reviews, drip pricing) took effect on 6 April 2025 (secondary sources; commencement order not read). Subscription contracts regime: commencement slipped repeatedly and sources disagree; the latest report says the UK government set January 2027, announced 9 Aug 2026 in a gov.uk press release I did not open. Likely requirements: pre-contract information, renewal reminders, easy online cancellation, a 14-day cooling-off after a trial converts. Confidence: medium on April 2025; low-medium on January 2027 (a September 2026 page still said spring 2027, apparently stale). https://www.subscriptioninsider.com/blog/uk-accelerates-subscription-rules-to-january-2027-shortening-compliance-runway-news and https://www.charlesrussellspeechlys.com/en/insights/expert-insights/commercial/2025/digital-markets-competition-and-consumers-act-2024-dmcca-what-the-uks-new-consumer-rules-now-mean-for-consumer-facing-businesses/

**E8. Accessibility.** The Public Sector Bodies Accessibility Regulations 2018 are the only statutory WCAG 2.2 AA duty found, and they cover public bodies. For private businesses the Equality Act 2010 requires reasonable adjustments; one vendor claims it "recognises" WCAG 2.2 AA, another source says no UK statute names it. Sources conflict, so treat WCAG 2.2 AA as the sensible target, not a statutory test. Confidence: low-medium (no primary text read). European Accessibility Act: applies from 28 June 2025; follows the EU consumer, so a UK business selling services (including e-commerce) to EU consumers may be in scope; microenterprises (under 10 staff and turnover or balance sheet up to €2m) are exempt for services only; the position for UK sellers of physical goods is unclear. Confidence: low. https://profiletree.com/european-accessibility-act/ and https://prioritypixels.co.uk/insights/accessibility-requirements-for-public-sector-websites/

### What the skill should do (E)
1. Generate a cookie plan from discovery: strictly necessary only by default; cookieless or first-party aggregate analytics with a visible opt-out and a processor note; add a consent banner only if there are ads, tracking pixels, cookie-setting embeds (maps, video) or non-exempt analytics. Accept and reject buttons of equal prominence. Tell the owner the fine ceiling is £17.5m or 4% and the ICO guidance is dated 29 April 2026.
2. Draft a privacy notice from the E3 list, naming each tool that receives data (form service, email, hosting, payments) and any transfer outside the UK. Mark it "draft, owner to approve".
3. Footer and contact page: sole trader name and service address; or company name, number, place of registration and registered office; plus an email and a postal address. For shops show prices, delivery costs and the postal address before checkout.
4. Remind the owner to check their ICO fee registration (£52 or £78 tiers per secondary sources; re-check).
5. For shops, build cancellation text from reg 28, flag the perishable-goods question for a human decision, and never write a blanket "no returns".
6. For any subscription or box scheme, flag the January 2027 regime as announced but to be verified on gov.uk; no fake or incentivised reviews; show the full price upfront (no drip pricing).
7. Build to WCAG 2.2 AA with automated checks (contrast, keyboard, labels, alt text) and say plainly it is not a legal guarantee. If the owner sells to EU consumers, flag the European Accessibility Act for a human check.
8. End with a "legal items for a human" list; never describe the site as compliant.

---

## Source dates and gaps
- Fetched documents with their own dates: Vercel docs 14 to 16 Sep 2026; Cloudflare registrar docs 13 Oct 2026; Ahrefs 15 Jun 2026; Impeccable article 4 May 2026; ICO cookie guidance finalised 29 Apr 2026. Prices read live on 9 Nov 2026: Google Workspace, Shopify, Stripe, Resend, Supabase and the others in section C.
- Older than 12 to 18 months: Google sender guidance (Feb 2024), web.dev Core Web Vitals (Oct 2024), ICO fee rise (Feb 2025), Consumer Contracts Regulations (2013 text).
- Unverified or conflicting: Stitch quotas, Microsoft 365 UK prices, Vercel A-record range, Cloudflare new .co.uk registration, long-life food under reg 28, DMCC subscription date, WCAG as an Equality Act benchmark, EAA scope for UK goods sellers, SAQ A and SCA from primary text, Yahoo sender rules, security header list, Search Console and structured data, Plausible price, domain ownership rules.
- Reddit was unreachable (403), so practitioner evidence is blog and Substack only.

## Addendum: checked during review, 9 November 2026

**Consumer contracts.** Regulation 28(1)(h) excludes accommodation, catering and leisure services for a specific date or period. Regulation 36 bars starting a service in the cancellation period without an express request, and sets what is owed on cancellation after an early start. Regulation 31 extends the cancellation period by up to 12 months where the cancellation information was not given. Regulation 14(4) and (5): the final order button must make the obligation to pay clear, or the consumer is not bound. https://www.legislation.gov.uk/uksi/2013/3134/regulation/28 , /regulation/36 and /regulation/14

**E-commerce information.** Electronic Commerce Regulations 2002, regulation 6: name, geographic address, email, VAT number where registered, trade or professional register details where applicable. https://www.legislation.gov.uk/uksi/2002/2013/regulation/6

**Complaints.** From 19 June 2026 the Data (Use and Access) Act 2025 gives people a right to complain to the organisation itself; law-firm summaries say privacy notices should mention it. Secondary sources. https://cms.law/en/gbr/legal-updates/data-use-and-access-act-2025-new-statutory-rules-on-handling-data-protection-complaints-from-19th-june-2026

**Storage and access.** The ICO's guidance covers storing or accessing information on a device, and does not treat cookieless methods as automatically exempt. https://ico.org.uk/for-organisations/direct-marketing-and-privacy-and-electronic-communications/guidance-on-the-use-of-storage-and-access-technologies/what-are-storage-and-access-technologies/

**Visitor counters.** Cloudflare's product page says Web Analytics uses no client-side state such as cookies or localStorage to collect usage metrics. https://www.cloudflare.com/web-analytics/ . Vercel's privacy page (26 Jun 2026) says no third-party cookies, a request-derived hash, discarded after 24 hours. https://vercel.com/docs/analytics/privacy-policy

**Marketing email.** The consent and soft opt-in position is the long-standing PECR rule, not re-read in this pass. Check the ICO's direct marketing guidance.

**Null SPF and DMARC.** Publishing `v=spf1 -all` and `p=reject` on a domain that sends no mail is standard anti-spoofing practice, not sourced in this pack.

**Hosting.** Vercel Sharable Links (docs 28 Aug 2026): all plans, one per account on Hobby, created from a preview deployment's Share menu, revoked the same way. https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection/sharable-links . Cloudflare Pages docs now say "Start new projects with Workers". Workers static asset requests are "free and unlimited". https://developers.cloudflare.com/pages/ and https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
